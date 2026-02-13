"use server";

import { db } from "@/db";
import {
  prokers,
  divisions,
  users,
  tasks,
  activityLogs,
  programs,
  programParticipants,
} from "@/db/schema";
import { desc, eq, and, ne } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server"; // Tambahan buat Auth
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Map program status to proker-compatible status
function mapProgramStatus(status: string | null): string {
  switch (status) {
    case "planned":
      return "created";
    case "ongoing":
      return "active";
    case "completed":
      return "completed";
    case "canceled":
      return "archived";
    default:
      return "created";
  }
}

export async function getAllProkers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let whereCondition = undefined;
  let programWhereCondition = undefined;

  if (user) {
    // Ambil detail user (role & divisi)
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      with: { role: true },
    });

    // LOGIC FILTER:
    // Kalau Koordinator atau Anggota, filter by Division ID
    if (
      dbUser &&
      (dbUser.role.roleName === "Koordinator" ||
        dbUser.role.roleName === "Anggota")
    ) {
      if (dbUser.divisionId) {
        whereCondition = eq(prokers.divisionId, dbUser.divisionId);
        programWhereCondition = eq(programs.divisionId, dbUser.divisionId);
      }
    }
    // Kalau Ketua/Sekben, whereCondition tetap undefined (alias ambil semua)
  }

  // 1. Fetch prokers
  const data = await db.query.prokers.findMany({
    where: whereCondition,
    orderBy: [desc(prokers.createdAt)],
    with: {
      division: true,
      pic: true,
    },
  });

  const prokerItems = data.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    divisionName: p.division?.divisionName || "Tanpa Divisi",
    picName: p.pic?.name || "Belum ada PIC",
    picEmail: p.pic?.email || "",
    progress: p.status === "completed" ? 100 : p.status === "active" ? 50 : 0,
    type: "proker" as const,
  }));

  // 2. Fetch programs (events) and merge
  const programQuery = db
    .select({
      id: programs.id,
      title: programs.title,
      description: programs.description,
      startDate: programs.startDate,
      endDate: programs.endDate,
      status: programs.status,
      divisionName: divisions.divisionName,
    })
    .from(programs)
    .leftJoin(divisions, eq(programs.divisionId, divisions.id));

  const programData = programWhereCondition
    ? await programQuery
        .where(programWhereCondition)
        .orderBy(desc(programs.createdAt))
    : await programQuery.orderBy(desc(programs.createdAt));

  // Get PIC for each program (first participant with role 'PIC')
  const programItems = await Promise.all(
    programData.map(async (p) => {
      const pic = await db
        .select({ name: users.name, email: users.email })
        .from(programParticipants)
        .leftJoin(users, eq(programParticipants.userId, users.id))
        .where(
          and(
            eq(programParticipants.programId, p.id),
            eq(programParticipants.role, "PIC"),
          ),
        )
        .limit(1);

      const mappedStatus = mapProgramStatus(p.status);
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        status: mappedStatus,
        startDate: p.startDate,
        endDate: p.endDate,
        divisionName: p.divisionName || "Tanpa Divisi",
        picName: pic[0]?.name || "Belum ada PIC",
        picEmail: pic[0]?.email || "",
        progress:
          mappedStatus === "completed"
            ? 100
            : mappedStatus === "active"
              ? 50
              : 0,
        type: "program" as const,
      };
    }),
  );

  // 3. Merge and sort
  return [...prokerItems, ...programItems].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });
}

export async function getProkerDetail(prokerId: number) {
  const prokerData = await db.query.prokers.findFirst({
    where: eq(prokers.id, prokerId),
    with: {
      division: true,
      pic: true,
      tasks: {
        orderBy: [desc(tasks.createdAt)],
        with: {
          assignedUser: true,
        },
      },
      logs: {
        orderBy: [desc(activityLogs.createdAt)],
        with: {
          user: true,
        },
      },
    },
  });

  if (!prokerData) return null;

  const totalTasks = prokerData.tasks.length;
  const doneTasks = prokerData.tasks.filter((t) => t.status === "done").length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return {
    ...prokerData,
    progress: progressPercent,
    picName: prokerData.pic?.name || "Belum ada PIC",
    divisionName: prokerData.division?.divisionName || "Tanpa Divisi",
  };
}

export async function createProker(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userProfile?.divisionId) return { error: "No Division Assigned" };

  await db.insert(prokers).values({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    divisionId: userProfile.divisionId, // Otomatis masuk ke divisi user login
    picUserId: userProfile.id, // Default PIC diri sendiri
    startDate: new Date(formData.get("startDate") as string),
    endDate: new Date(formData.get("endDate") as string),
    status: "created",
  });

  revalidatePath("/dashboard/proker");
  redirect("/dashboard/proker");
}
export async function addTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const prokerId = Number(formData.get("prokerId"));
  const title = formData.get("title") as string;
  // const assignedTo = formData.get('assignedTo') ... (Nanti pas mau assign ke orang lain)

  // Insert Task
  await db.insert(tasks).values({
    prokerId,
    title,
    description: "", // Kosongin biar cepet (ehe UwU)
    status: "todo",
    assignedUserId: user.id, // Default assign ke diri sendiri dulu
  });

  // Auto-Log: Catat bahwa user ini nambah task
  await db.insert(activityLogs).values({
    prokerId,
    createdBy: user.id,
    notes: `Menambahkan tugas baru: "${title}"`,
  });

  revalidatePath(`/dashboard/proker/${prokerId}`);
}

// TOGGLE TASK STATUS (Todo <-> Done)
export async function toggleTaskStatus(
  taskId: number,
  currentStatus: string,
  prokerId: number,
  taskTitle: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const newStatus = currentStatus === "done" ? "todo" : "done";

  // 1. Update Status
  await db
    .update(tasks)
    .set({ status: newStatus as any })
    .where(eq(tasks.id, taskId));

  // 2. Auto-Log: Catat perubahan status
  await db.insert(activityLogs).values({
    prokerId,
    createdBy: user.id,
    notes: `Mengubah status tugas "${taskTitle}" menjadi ${newStatus === "done" ? "SELESAI ✅" : "BELUM SELESAI ⏳"}`,
  });

  revalidatePath(`/dashboard/proker/${prokerId}`);
}

// 3. ADD MANUAL LOG (Buat update progres non-task, misal: "Rapat lancar")
export async function addManualLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const prokerId = Number(formData.get("prokerId"));
  const notes = formData.get("notes") as string;

  await db.insert(activityLogs).values({
    prokerId,
    createdBy: user.id,
    notes: notes,
  });

  revalidatePath(`/dashboard/proker/${prokerId}`);
}
