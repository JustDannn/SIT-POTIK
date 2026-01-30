"use server";

import { db } from "@/db";
import { tasks, prokers, publications, users, divisions } from "@/db/schema"; // Tambah import divisions
import { eq, sql, and } from "drizzle-orm";

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
