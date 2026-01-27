"use server";

import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
