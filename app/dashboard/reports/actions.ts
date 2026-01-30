"use server";

import { db } from "@/db";
import { tasks, prokers, publications, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function getReportData(divisionId: number) {
  // 1. Ambil Data Proker & Progress Tasks-nya
  const prokerList = await db
    .select({
      id: prokers.id,
      title: prokers.title,
      // Hitung total tasks per proker
      totalTasks: sql<number>`count(${tasks.id})`,
      // Hitung tasks yang selesai
      completedTasks: sql<number>`count(case when ${tasks.status} = 'done' then 1 end)`,
    })
    .from(prokers)
    .leftJoin(tasks, eq(prokers.id, tasks.prokerId))
    .where(eq(prokers.divisionId, divisionId))
    .groupBy(prokers.id, prokers.title);

  // 2. Statistik Publikasi
  const pubStats = await db
    .select({
      category: publications.category,
      count: sql<number>`count(*)`,
    })
    .from(publications)
    .where(eq(publications.divisionId, divisionId))
    .groupBy(publications.category);

  // 3. Statistik Anggota (Siapa paling rajin?)
  const memberStats = await db
    .select({
      name: users.name,
      tasksDone: sql<number>`count(case when ${tasks.status} = 'done' then 1 end)`,
    })
    .from(users)
    .leftJoin(tasks, eq(users.id, tasks.assignedUserId))
    .where(eq(users.divisionId, divisionId))
    .groupBy(users.id, users.name)
    .orderBy(sql`count(case when ${tasks.status} = 'done' then 1 end) desc`)
    .limit(5); // Top 5 Member

  // Format Data biar enak di UI
  const totalProker = prokerList.length;
  // Hitung rata-rata progress seluruh divisi
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
