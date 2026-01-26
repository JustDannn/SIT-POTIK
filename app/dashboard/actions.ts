"use server";

import { db } from "@/db";
import { prokers, tasks, users } from "@/db/schema";
import { eq, sql, desc, and, ne } from "drizzle-orm";

export async function getDashboardStats() {
  const activeProkers = await db
    .select({ count: sql<number>`count(*)` })
    .from(prokers)
    .where(eq(prokers.status, "active"));

  const completedProkers = await db
    .select({ count: sql<number>`count(*)` })
    .from(prokers)
    .where(eq(prokers.status, "completed"));

  return {
    active: Number(activeProkers[0].count),
    completed: Number(completedProkers[0].count),
    pendingReports: 2, // Dummy dulu
    pendingLPJ: 1, // Dummy dulu
  };
}

export async function getTimelineData() {
  const data = await db.query.prokers.findMany({
    where: ne(prokers.status, "completed"), // ambil yang belum kelar buat timeline
    orderBy: [desc(prokers.startDate)],
    limit: 5,
    with: {
      division: true,
    },
  });

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    division: p.division?.divisionName || "Umum",
    startDate: p.startDate,
    endDate: p.endDate,
    status: p.status,
  }));
}

export async function getAttentionItems() {
  // Contoh: Ambil proker yang deadline-nya < 3 hari lagi tapi belum Done
  const urgentProkers = await db.query.prokers.findMany({
    where: sql`${prokers.endDate} > NOW() AND ${prokers.endDate} < NOW() + INTERVAL '3 DAYS' AND ${prokers.status} != 'completed'`,
    limit: 3,
  });

  return urgentProkers.map((p) => ({
    id: p.id,
    title: `Deadline: ${p.title}`,
    subtitle: `H-2 Deadline (${new Date(p.endDate!).toLocaleDateString()})`,
    link: `/dashboard/proker/${p.id}`,
    type: "proker" as const,
  }));
}
