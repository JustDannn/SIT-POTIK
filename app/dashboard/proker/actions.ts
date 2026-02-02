"use server";

import { db } from "@/db";
import { prokers, divisions, users, tasks, activityLogs } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server"; // Tambahan buat Auth
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAllProkers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let whereCondition = undefined;

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
      }
    }
    // Kalau Ketua/Sekben, whereCondition tetap undefined (alias ambil semua)
  }

  const data = await db.query.prokers.findMany({
    where: whereCondition,
    orderBy: [desc(prokers.createdAt)],
    with: {
      division: true,
      pic: true,
    },
  });

  return data.map((p) => ({
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
  }));
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
