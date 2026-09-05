"use server";

import { db } from "@/db";
import { tasks, prokers, publications, users, divisions } from "@/db/schema"; // Tambah import divisions
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/utils/session";
import { deleteFile, STORAGE_BUCKETS, uploadFile } from "@/lib/storage";
import { reports } from "@/db/schema";

export async function uploadReport(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const prokerId = Number(formData.get("prokerId"));
  const file = formData.get("file") as File | null;
  if (!prokerId || !file)
    return { success: false, error: "Proker dan file wajib diisi." };

  const proker = await db.query.prokers.findFirst({
    where: eq(prokers.id, prokerId),
  });
  const canUpload =
    proker &&
    (proker.picUserId === user.id ||
      user.role?.roleName === "Ketua" ||
      user.role?.roleName === "Sekretaris" ||
      user.role?.roleName === "Koordinator");
  if (!canUpload)
    return { success: false, error: "Tidak berhak mengupload laporan ini." };

  let uploaded: { path: string } | null = null;
  try {
    uploaded = await uploadFile({
      file,
      bucket: STORAGE_BUCKETS.documents,
      prefix: `prokers/${prokerId}/reports`,
      maxSize: 10 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    const [report] = await db
      .insert(reports)
      .values({
        prokerId,
        uploadedBy: user.id,
        filePath: uploaded.path,
        title: String(formData.get("title") || "Laporan"),
        type: String(formData.get("type") || "Laporan"),
        notes: String(formData.get("notes") || "") || null,
      })
      .returning({ id: reports.id });
    revalidatePath("/dashboard/reports");
    return { success: true, id: report.id, path: uploaded.path };
  } catch (error) {
    if (uploaded)
      await deleteFile(STORAGE_BUCKETS.documents, uploaded.path).catch(
        () => undefined,
      );
    console.error("Upload report failed:", error);
    return { success: false, error: "Gagal mengupload laporan." };
  }
}

// Parameter jadi opsional (number | undefined)
export async function getReportData(divisionId?: number) {
  const prokerFilter = divisionId
    ? eq(prokers.divisionId, divisionId)
    : undefined;
  const pubFilter = divisionId
    ? eq(publications.divisionId, divisionId)
    : undefined;
  const userFilter = divisionId ? eq(users.divisionId, divisionId) : undefined;

  // 1. Ambil Data Proker
  const prokerList = await db
    .select({
      id: prokers.id,
      title: prokers.title,
      divisionName: divisions.divisionName, // Tambah nama divisi biar tau ini proker siapa
      totalTasks: sql<number>`count(${tasks.id})`,
      completedTasks: sql<number>`count(case when ${tasks.status} = 'done' then 1 end)`,
    })
    .from(prokers)
    .leftJoin(tasks, eq(prokers.id, tasks.prokerId))
    .leftJoin(divisions, eq(prokers.divisionId, divisions.id)) // Join ke tabel divisi
    .where(prokerFilter) // Filter dinamis
    .groupBy(prokers.id, prokers.title, divisions.divisionName);

  // 2. Statistik Publikasi
  const pubStats = await db
    .select({
      category: publications.category,
      count: sql<number>`count(*)`,
    })
    .from(publications)
    .where(pubFilter) // Filter dinamis
    .groupBy(publications.category);

  // 3. Statistik Anggota (Top Performer)
  const memberStats = await db
    .select({
      name: users.name,
      divisionName: divisions.divisionName,
      tasksDone: sql<number>`count(case when ${tasks.status} = 'done' then 1 end)`,
    })
    .from(users)
    .leftJoin(tasks, eq(users.id, tasks.assignedUserId))
    .leftJoin(divisions, eq(users.divisionId, divisions.id))
    .where(userFilter) // Filter dinamis
    .groupBy(users.id, users.name, divisions.divisionName)
    .orderBy(sql`count(case when ${tasks.status} = 'done' then 1 end) desc`)
    .limit(5);

  // Format Data
  const totalProker = prokerList.length;
  let totalProgressSum = 0;

  const formattedProkers = prokerList.map((p) => {
    const progress =
      p.totalTasks > 0
        ? Math.round((p.completedTasks / p.totalTasks) * 100)
        : 0;
    totalProgressSum += progress;
    return { ...p, progress };
  });

  const avgProgress =
    totalProker > 0 ? Math.round(totalProgressSum / totalProker) : 0;

  return {
    overview: {
      avgProgress,
      totalProker,
      totalPublications: pubStats.reduce(
        (acc, curr) => acc + Number(curr.count),
        0,
      ),
    },
    prokers: formattedProkers,
    publications: pubStats,
    topMembers: memberStats,
  };
}
