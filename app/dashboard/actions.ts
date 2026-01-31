"use server";

import { db } from "@/db";
import {
  prokers,
  tasks,
  users,
  publications,
  minutes,
  archives,
  financeRecords,
  lpjs,
  guestBooks,
} from "@/db/schema";
import { eq, sql, desc, and, ne, count, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

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
export async function getTreasurerDashboardData() {
  // 1. HITUNG DUIT (Income vs Expense)
  // Kita ambil semua record
  const allRecords = await db
    .select({
      amount: financeRecords.amount,
      type: financeRecords.type,
    })
    .from(financeRecords);

  // Hitung manual di JS (biar gampang) atau pake SQL Sum
  let totalIncome = 0;
  let totalExpense = 0;

  allRecords.forEach((r) => {
    if (r.type === "income") totalIncome += Number(r.amount);
    else totalExpense += Number(r.amount);
  });

  const currentBalance = totalIncome - totalExpense;

  // 2. Transaksi Terakhir (5 biji)
  const recentTransactions = await db
    .select({
      id: financeRecords.id,
      amount: financeRecords.amount,
      type: financeRecords.type,
      description: financeRecords.description,
      date: financeRecords.date,
      prokerTitle: prokers.title, // Join buat tau ini duit proker apa
    })
    .from(financeRecords)
    .leftJoin(prokers, eq(financeRecords.prokerId, prokers.id))
    .orderBy(desc(financeRecords.date))
    .limit(5);

  // 3. LPJ Pending (Yang butuh review)
  // LPJ yang statusnya 'submitted' (sudah diajukan divisi, belum di-acc bendahara)
  const pendingLpjs = await db
    .select({
      id: lpjs.id,
      status: lpjs.status,
      prokerTitle: prokers.title,
      createdAt: lpjs.createdAt,
    })
    .from(lpjs)
    .leftJoin(prokers, eq(lpjs.prokerId, prokers.id))
    .where(eq(lpjs.status, "submitted"))
    .limit(5);

  return {
    finance: {
      balance: currentBalance,
      income: totalIncome,
      expense: totalExpense,
    },
    recentTransactions,
    pendingLpjs,
  };
}
// GET DASHBOARD DATA & RECAP
export async function getLayananDataStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Hitung Total Pengunjung Bulan Ini
  const monthlyStats = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(guestBooks)
    .where(gte(guestBooks.visitDate, startOfMonth));

  // Hitung Breakdown Tipe Layanan (Semua Waktu)
  const serviceStats = await db
    .select({
      type: guestBooks.serviceType,
      count: sql<number>`count(*)`,
    })
    .from(guestBooks)
    .groupBy(guestBooks.serviceType);

  // Ambil 5 Tamu Terakhir
  const recentGuests = await db
    .select({
      id: guestBooks.id,
      name: guestBooks.name,
      institution: guestBooks.institution,
      serviceType: guestBooks.serviceType,
      needs: guestBooks.needs,
      visitDate: guestBooks.visitDate,
      officerName: users.name,
    })
    .from(guestBooks)
    .leftJoin(users, eq(guestBooks.servedBy, users.id))
    .orderBy(desc(guestBooks.visitDate))
    .limit(5);

  return {
    monthlyVisitors: Number(monthlyStats[0]?.count || 0),
    serviceDistribution: serviceStats,
    recentGuests,
  };
}

// INPUT TAMU BARU (ABSEN)
export async function addGuestEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const institution = formData.get("institution") as string;
  const phone = formData.get("phone") as string;
  const serviceType = formData.get("serviceType") as any;
  const needs = formData.get("needs") as string;

  try {
    await db.insert(guestBooks).values({
      name,
      institution,
      phone,
      serviceType,
      needs,
      servedBy: user.id, // Petugas yang lagi login (piket)
      visitDate: new Date(),
    });

    revalidatePath("/dashboard/layanan-data");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal mencatat tamu" };
  }
}

// GET ALL LOGS (Buat Halaman Full Rekap)
export async function getAllGuestLogs(query: string = "") {
  // Simple search logic bisa ditambah disini nanti
  return await db
    .select({
      id: guestBooks.id,
      name: guestBooks.name,
      institution: guestBooks.institution,
      serviceType: guestBooks.serviceType,
      needs: guestBooks.needs,
      visitDate: guestBooks.visitDate,
      officerName: users.name,
    })
    .from(guestBooks)
    .leftJoin(users, eq(guestBooks.servedBy, users.id))
    .orderBy(desc(guestBooks.visitDate));
}
