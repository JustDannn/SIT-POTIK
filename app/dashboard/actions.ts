"use server";

import { db } from "@/db";
import {
  prokers,
  tasks,
  users,
  publications,
  minutes,
  archives,
} from "@/db/schema";
import { eq, sql, desc, and, ne, count } from "drizzle-orm";

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
export async function getRisetStats(divisionId: number) {
  // 1. Hitung Total Artikel
  const articleCount = await db
    .select({ count: count() })
    .from(publications)
    .where(
      and(
        eq(publications.divisionId, divisionId),
        eq(publications.category, "Artikel"),
      ),
    );

  // 2. Hitung Total Infografis
  const infographicCount = await db
    .select({ count: count() })
    .from(publications)
    .where(
      and(
        eq(publications.divisionId, divisionId),
        eq(publications.category, "Infografis"),
      ),
    );

  // 3. Hitung yang statusnya 'draft' atau 'review' (Pending)
  const pendingCount = await db
    .select({ count: count() })
    .from(publications)
    .where(
      and(
        eq(publications.divisionId, divisionId),
        eq(publications.status, "draft"), // Asumsi 'draft' butuh action
      ),
    );

  // 4. Ambil 5 Publikasi Terakhir (Buat list 'Recent Uploads')
  const recentUploads = await db.query.publications.findMany({
    where: eq(publications.divisionId, divisionId),
    orderBy: [desc(publications.createdAt)],
    limit: 5,
    with: {
      author: true, // Biar tau siapa yang upload
    },
  });

  return {
    stats: {
      articles: articleCount[0].count,
      infographics: infographicCount[0].count,
      pending: pendingCount[0].count,
    },
    recentUploads,
  };
}
export async function getSecretaryDashboardData() {
  // 1. Hitung Total Notulensi
  const statsMinutes = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(minutes);

  // 2. Hitung Total Arsip
  const statsArchives = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(archives);

  // 3. Ambil 5 Notulensi Terakhir
  const recentMinutes = await db
    .select()
    .from(minutes)
    .orderBy(desc(minutes.meetingDate))
    .limit(5);

  // 4. Ambil 5 Arsip Terakhir
  const recentArchives = await db
    .select({
      id: archives.id,
      title: archives.title,
      category: archives.category,
      createdAt: archives.createdAt,
      uploader: users.name,
    })
    .from(archives)
    .leftJoin(users, eq(archives.uploadedBy, users.id))
    .orderBy(desc(archives.createdAt))
    .limit(5);

  return {
    stats: {
      minutes: Number(statsMinutes[0].count),
      archives: Number(statsArchives[0].count),
    },
    recentMinutes,
    recentArchives,
  };
}
