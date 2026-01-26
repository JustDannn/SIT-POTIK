"use server";

import { db } from "@/db";
import { prokers, divisions, users, tasks, activityLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAllProkers() {
  // join tabel prokers -> divisions -> users (PIC)
  const data = await db.query.prokers.findMany({
    orderBy: [desc(prokers.createdAt)], // Yang baru dibuat paling atas
    with: {
      division: true,
      pic: true, // memastikan relasi 'pic' ada di schema relations
    },
  });

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status, // 'created', 'active', 'completed'
    startDate: p.startDate,
    endDate: p.endDate,
    divisionName: p.division?.divisionName || "Tanpa Divisi",
    picName: p.pic?.name || "Belum ada PIC",
    picEmail: p.pic?.email || "",
    // simulasi progress bar berdasarkan status (nanti bisa dibikin real dari hitungan task)
    progress: p.status === "completed" ? 100 : p.status === "active" ? 50 : 0,
  }));
}

export async function getProkerDetail(prokerId: number) {
  // 1. Ambil Data Proker + Divisi + PIC
  const prokerData = await db.query.prokers.findFirst({
    where: eq(prokers.id, prokerId),
    with: {
      division: true,
      pic: true,
      // 2. Sekalian ambil Tasks & Logs (Relasi One-to-Many)
      tasks: {
        orderBy: [desc(tasks.createdAt)],
        with: {
          assignedUser: true, // Biar tau task ini tugas siapa
        },
      },
      logs: {
        orderBy: [desc(activityLogs.createdAt)],
        with: {
          user: true, // Biar tau siapa yang nulis log
        },
      },
    },
  });

  if (!prokerData) return null;

  // 3. Hitung Progress Real dari Task (Opsional, kalau mau akurat)
  const totalTasks = prokerData.tasks.length;
  const doneTasks = prokerData.tasks.filter((t) => t.status === "done").length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return {
    ...prokerData,
    progress: progressPercent, // Override progress dummy tadi
    picName: prokerData.pic?.name || "Belum ada PIC",
    divisionName: prokerData.division?.divisionName || "Tanpa Divisi",
  };
}
