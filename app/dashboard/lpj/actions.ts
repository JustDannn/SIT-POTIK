"use server";

import { db } from "@/db";
import { lpjs, prokers, users, divisions } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. GET LIST LPJ
// statusFilter: 'pending' (submitted) atau 'history' (approved/rejected)
export async function getLpjs(view: "pending" | "history" = "pending") {
  const statusCondition =
    view === "pending"
      ? eq(lpjs.status, "submitted")
      : and(ne(lpjs.status, "submitted"), ne(lpjs.status, "draft")); // History = Approved / Rejected

  const data = await db
    .select({
      id: lpjs.id,
      status: lpjs.status,
      createdAt: lpjs.createdAt,
      prokerTitle: prokers.title,
      divisionName: divisions.divisionName,
      uploaderName: users.name,
    })
    .from(lpjs)
    .leftJoin(prokers, eq(lpjs.prokerId, prokers.id))
    .leftJoin(divisions, eq(prokers.divisionId, divisions.id))
    .leftJoin(users, eq(lpjs.uploadedBy, users.id))
    .where(statusCondition)
    .orderBy(desc(lpjs.createdAt));

  return data;
}

// 2. GET DETAIL LPJ
export async function getLpjDetail(id: number) {
  const data = await db
    .select({
      id: lpjs.id,
      status: lpjs.status,
      filePath: lpjs.filePath,
      notes: lpjs.notes,
      createdAt: lpjs.createdAt,
      prokerTitle: prokers.title,
      divisionName: divisions.divisionName,
      uploaderName: users.name,
      uploaderEmail: users.email,
    })
    .from(lpjs)
    .leftJoin(prokers, eq(lpjs.prokerId, prokers.id))
    .leftJoin(divisions, eq(prokers.divisionId, divisions.id))
    .leftJoin(users, eq(lpjs.uploadedBy, users.id))
    .where(eq(lpjs.id, id));

  return data[0];
}

// 3. ACTION: SUBMIT REVIEW (APPROVE / REJECT)
export async function reviewLpj(
  id: number,
  decision: "approved" | "rejected",
  notes?: string,
) {
  try {
    await db
      .update(lpjs)
      .set({
        status: decision,
        notes: decision === "rejected" ? notes : null, // Simpan notes cuma kalau direject
        updatedAt: new Date(),
      })
      .where(eq(lpjs.id, id));

    revalidatePath("/dashboard/lpj");
    revalidatePath(`/dashboard/lpj/${id}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal update status LPJ" };
  }
}
