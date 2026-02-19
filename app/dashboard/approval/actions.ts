"use server";

import { db } from "@/db";
import { reports, prokers, users, lpjs, publications } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getApprovals() {
  const data = await db.query.reports.findMany({
    orderBy: [desc(reports.createdAt)],
    with: {
      proker: true,
      uploader: true,
    },
  });

  return data.map((r) => ({
    id: r.id,
    title: r.title || r.filePath,
    type: r.type || "Dokumen",
    status: r.status,
    submitterName: r.uploader?.name || "Unknown",
    prokerName: r.proker?.title || "General",
    date: r.createdAt || new Date(),
    notes: r.notes,
  }));
}

/**
 * Get submissions by a specific user (for Koordinator to track their own requests).
 * Fetches from reports and lpjs tables.
 */
export async function getMySubmissions(userId: string) {
  // 1. Reports by this user
  const myReports = await db
    .select({
      id: reports.id,
      title: reports.title,
      type: reports.type,
      status: reports.status,
      prokerTitle: prokers.title,
      date: reports.createdAt,
      notes: reports.notes,
    })
    .from(reports)
    .leftJoin(prokers, eq(reports.prokerId, prokers.id))
    .where(eq(reports.uploadedBy, userId))
    .orderBy(desc(reports.createdAt));

  // 2. LPJs by this user
  const myLpjs = await db
    .select({
      id: lpjs.id,
      status: lpjs.status,
      prokerTitle: prokers.title,
      date: lpjs.createdAt,
      notes: lpjs.notes,
    })
    .from(lpjs)
    .leftJoin(prokers, eq(lpjs.prokerId, prokers.id))
    .where(eq(lpjs.uploadedBy, userId))
    .orderBy(desc(lpjs.createdAt));

  const reportItems = myReports.map((r) => ({
    id: r.id,
    title: r.title || "Laporan",
    type: r.type || "Laporan",
    status:
      r.status === "pending" || r.status === "submitted"
        ? "submitted"
        : (r.status ?? "draft"),
    prokerName: r.prokerTitle || "Umum",
    date: r.date || new Date(),
    notes: r.notes,
  }));

  const lpjItems = myLpjs.map((l) => ({
    id: l.id + 10000, // offset to avoid ID collisions
    title: `LPJ: ${l.prokerTitle || "Umum"}`,
    type: "LPJ",
    status:
      l.status === "pending" || l.status === "submitted"
        ? "submitted"
        : (l.status ?? "draft"),
    prokerName: l.prokerTitle || "Umum",
    date: l.date || new Date(),
    notes: l.notes,
  }));

  return [...reportItems, ...lpjItems].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function approveDocument(reportId: number) {
  await db
    .update(reports)
    .set({ status: "approved" })
    .where(eq(reports.id, reportId));

  revalidatePath("/dashboard/approval");
}

export async function rejectDocument(reportId: number, note: string) {
  await db
    .update(reports)
    .set({ status: "rejected", notes: note })
    .where(eq(reports.id, reportId));

  revalidatePath("/dashboard/approval");
}
