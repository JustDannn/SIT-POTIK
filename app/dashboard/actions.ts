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
  partners,
  activityLogs,
  divisions,
  programs,
  programParticipants,
  designRequests,
  mediaAssets,
  campaigns,
} from "@/db/schema";
import {
  eq,
  sql,
  desc,
  and,
  ne,
  count,
  gte,
  lt,
  isNull,
  inArray,
} from "drizzle-orm";
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
  const serviceType = formData.get("serviceType") as
    | "permintaan_data"
    | "konsultasi"
    | "instalasi_software"
    | "lainnya";
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
export async function getPrSdmDashboardData(divisionId: number) {
  // 1. KPI RINGKAS
  const contentPublished = await db
    .select({ count: sql<number>`count(*)` })
    .from(publications)
    .where(
      and(
        eq(publications.divisionId, divisionId),
        eq(publications.status, "published"),
      ),
    );

  const contentPending = await db
    .select({ count: sql<number>`count(*)` })
    .from(publications)
    .where(
      and(
        eq(publications.divisionId, divisionId),
        eq(publications.status, "review"),
      ),
    ); // Review = Pending Approval Ketua

  const activePartners = await db
    .select({ count: sql<number>`count(*)` })
    .from(partners)
    .where(eq(partners.status, "active"));

  const activeProkers = await db
    .select({ count: sql<number>`count(*)` })
    .from(prokers)
    .where(
      and(eq(prokers.divisionId, divisionId), eq(prokers.status, "active")),
    );

  // ALERTS & ATTENTION NEEDED
  const alerts: { type: string; message: string }[] = [];
  const pendingContents = await db
    .select({ title: publications.title })
    .from(publications)
    .where(
      and(
        eq(publications.divisionId, divisionId),
        eq(publications.status, "review"),
      ),
    )
    .limit(3);

  pendingContents.forEach((c) => {
    alerts.push({
      type: "warning",
      message: `Konten "${c.title}" menunggu approval Ketua.`,
    });
  });

  // Alert 2: Partner butuh follow-up (lebih dari 10 hari)
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const stalePartners = await db
    .select({ name: partners.name })
    .from(partners)
    .where(lt(partners.lastFollowUp, tenDaysAgo)) // lastFollowUp < 10 hari lalu
    .limit(3);

  stalePartners.forEach((p) => {
    alerts.push({
      type: "info",
      message: `Partner "${p.name}" belum ada follow-up > 10 hari.`,
    });
  });

  // 3. AKTIVITAS TERBARU (Human-Centric)
  // Mengambil log aktivitas dari user di divisi ini
  const recentActivities = await db
    .select({
      id: activityLogs.id,
      userName: users.name,
      notes: activityLogs.notes,
      createdAt: activityLogs.createdAt,
      prokerTitle: prokers.title,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.createdBy, users.id))
    .leftJoin(prokers, eq(activityLogs.prokerId, prokers.id))
    .where(eq(users.divisionId, divisionId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(5);

  return {
    kpi: {
      published: Number(contentPublished[0].count),
      pending: Number(contentPending[0].count),
      partners: Number(activePartners[0].count),
      prokers: Number(activeProkers[0].count),
    },
    alerts,
    activities: recentActivities,
  };
}

// ACTION: GET MEMBERS (Untuk halaman /dashboard/members)
export async function getMembersWithLastLog(divisionId: number) {
  // Ambil semua member divisi ini
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
    })
    .from(users)
    .where(eq(users.divisionId, divisionId));

  // Untuk setiap member, ambil log terakhirnya (N+1 problem tapi simple utk MVP)
  // Idealnya pakai subquery/window function kalau data besar
  const membersWithLog = await Promise.all(
    members.map(async (m) => {
      const lastLog = await db
        .select({
          createdAt: activityLogs.createdAt,
          notes: activityLogs.notes,
        })
        .from(activityLogs)
        .where(eq(activityLogs.createdBy, m.id))
        .orderBy(desc(activityLogs.createdAt))
        .limit(1);

      return {
        ...m,
        lastActivity: lastLog[0] || null,
      };
    }),
  );

  return membersWithLog;
}

// ACTION: UPDATE MEMBER STATUS
export async function updateMemberStatus(userId: string, status: string) {
  await db.update(users).set({ status }).where(eq(users.id, userId));
  return { success: true };
}

export async function getEducationDashboardData(divisionId: number) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // KPI: Event Aktif (Ongoing)
  const activeEvents = await db
    .select({ count: sql<number>`count(*)` })
    .from(programs)
    .where(
      and(eq(programs.divisionId, divisionId), eq(programs.status, "ongoing")),
    );

  // KPI: Event Selesai Bulan Ini
  const completedMonth = await db
    .select({ count: sql<number>`count(*)` })
    .from(programs)
    .where(
      and(
        eq(programs.divisionId, divisionId),
        eq(programs.status, "completed"),
        gte(programs.endDate, firstDayOfMonth),
      ),
    );

  // KPI: Total Peserta (Unik)
  const totalParticipants = await db
    .select({
      count: sql<number>`count(distinct ${programParticipants.userId})`,
    })
    .from(programParticipants)
    .leftJoin(programs, eq(programParticipants.programId, programs.id))
    .where(eq(programs.divisionId, divisionId));

  // Fetch recent events for Gantt Chart (termasuk endDate)
  const recentEvents = await db
    .select({
      id: programs.id,
      title: programs.title,
      startDate: programs.startDate,
      endDate: programs.endDate, // PENTING BUAT GANTT CHART
      status: programs.status,
      location: programs.location,
      description: programs.description,
    })
    .from(programs)
    .where(eq(programs.divisionId, divisionId))
    .orderBy(desc(programs.startDate))
    .limit(20); // Ambil 20 event terakhir/mendatang

  // Cek Pending Impact (Event selesai tapi belum ada report Impact)
  const completedEvents = await db
    .select({ id: programs.id, title: programs.title })
    .from(programs)
    .where(
      and(
        eq(programs.divisionId, divisionId),
        eq(programs.status, "completed"),
      ),
    );

  let pendingImpactsCount = 0;
  const alerts: { message: string }[] = [];

  for (const ev of completedEvents) {
    const impact = await db.query.publications.findFirst({
      where: and(
        eq(publications.programId, ev.id),
        eq(publications.category, "Impact"),
      ),
    });

    if (!impact) {
      pendingImpactsCount++;
      alerts.push({
        message: `Laporan Impact untuk "${ev.title}" belum dibuat.`,
      });
    }
  }

  // Tambah alert jika ada event ongoing
  const ongoingEvents = recentEvents.filter((e) => e.status === "ongoing");
  ongoingEvents.forEach((e) => {
    alerts.unshift({ message: `Event "${e.title}" sedang berlangsung.` });
  });

  return {
    activeEvents: Number(activeEvents[0].count),
    completedMonth: Number(completedMonth[0].count),
    totalParticipants: Number(totalParticipants[0].count),
    pendingImpacts: pendingImpactsCount,
    alerts: alerts.slice(0, 5), // Ambil 5 alert teratas

    // Mapping data agar sesuai interface EventItem di View (ISO String)
    upcomingEvents: recentEvents.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate ? e.endDate.toISOString() : null, // Handle null date
    })),
  };
}

// Create Event Baru
export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Ambil Division ID User
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userProfile?.divisionId) return { error: "No Division" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);

  await db.insert(programs).values({
    title,
    description,
    location,
    startDate,
    endDate,
    divisionId: userProfile.divisionId,
    status: "planned",
  });

  revalidatePath("/dashboard/events");
  return { success: true };
}

// ==========================================
// MEDIA & BRANDING DASHBOARD
// ==========================================
export async function getMediaDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // --- KPI STATS ---
  // Content Velocity: publications created this month
  const monthlyContent = await db
    .select({ count: sql<number>`count(*)` })
    .from(publications)
    .where(gte(publications.createdAt, startOfMonth));

  // Pending Queue: design requests not completed
  const pendingRequests = await db
    .select({ count: sql<number>`count(*)` })
    .from(designRequests)
    .where(
      inArray(designRequests.status, ["pending", "in_progress", "review"]),
    );

  // Total Assets in DAM
  const totalAssets = await db
    .select({ count: sql<number>`count(*)` })
    .from(mediaAssets);

  // Scheduled Posts (campaigns that are scheduled but not yet published)
  const scheduledPosts = await db
    .select({ count: sql<number>`count(*)` })
    .from(campaigns)
    .where(eq(campaigns.status, "scheduled"));

  // --- INCOMING DESIGN REQUESTS (newest pending/in_progress) ---
  const incomingRequests = await db.query.designRequests.findMany({
    where: inArray(designRequests.status, ["pending", "in_progress"]),
    orderBy: [desc(designRequests.createdAt)],
    limit: 5,
    with: {
      requester: true,
      requesterDivision: true,
    },
  });

  // --- PENDING PUBLICATIONS (draft/review) ---
  const pendingPublications = await db.query.publications.findMany({
    where: inArray(publications.status, ["draft", "review"]),
    orderBy: [desc(publications.createdAt)],
    limit: 5,
    with: {
      author: true,
      division: true,
    },
  });

  // --- UPCOMING CAMPAIGNS (scheduled + draft, nearest first) ---
  const upcomingCampaigns = await db.query.campaigns.findMany({
    where: inArray(campaigns.status, ["draft", "scheduled"]),
    orderBy: [desc(campaigns.scheduledDate)],
    limit: 6,
  });

  return {
    stats: {
      contentVelocity: Number(monthlyContent[0].count),
      pendingQueue: Number(pendingRequests[0].count),
      totalAssets: Number(totalAssets[0].count),
      scheduledPosts: Number(scheduledPosts[0].count),
    },
    incomingRequests: incomingRequests.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      priority: r.priority,
      deadline: r.deadline,
      createdAt: r.createdAt,
      requester: r.requester ? { name: r.requester.name } : null,
      requesterDivision: r.requesterDivision
        ? { divisionName: r.requesterDivision.divisionName }
        : null,
    })),
    pendingPublications: pendingPublications.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      status: p.status,
      author: p.author ? { name: p.author.name } : null,
      division: p.division ? { divisionName: p.division.divisionName } : null,
    })),
    upcomingCampaigns: upcomingCampaigns.map((c) => ({
      id: c.id,
      title: c.title,
      platform: c.platform,
      status: c.status,
      scheduledDate: c.scheduledDate,
    })),
  };
}
