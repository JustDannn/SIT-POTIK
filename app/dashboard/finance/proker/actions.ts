"use server";

import { db } from "@/db";
import { prokers, financeRecords, divisions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// GET SUMMARY PROKER
export async function getProkerFinanceSummary() {
  const data = await db.query.prokers.findMany({
    with: {
      division: true,
      financeRecords: true,
    },
  });

  const summary = data.map((p) => {
    let income = 0;
    let expense = 0;

    p.financeRecords.forEach((r) => {
      if (r.type === "income") income += Number(r.amount);
      else expense += Number(r.amount);
    });

    return {
      id: p.id,
      title: p.title,
      divisionName: p.division.divisionName,
      income,
      expense,
      balance: income - expense,
      lastUpdated:
        p.financeRecords.length > 0
          ? p.financeRecords[p.financeRecords.length - 1].date
          : p.createdAt,
    };
  });

  return summary.sort((a, b) => b.balance - a.balance);
}

// GET DETAIL TRANSAKSI PROKER
export async function getProkerTransactions(prokerId: number) {
  const proker = await db.query.prokers.findFirst({
    where: eq(prokers.id, prokerId),
    with: { division: true },
  });

  const transactions = await db
    .select()
    .from(financeRecords)
    .where(eq(financeRecords.prokerId, prokerId))
    .orderBy(desc(financeRecords.date));

  return { proker, transactions };
}

// ADD TRANSACTION (Masuk/Keluar)
export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const prokerIdStr = formData.get("prokerId") as string;
  const prokerId = parseInt(prokerIdStr, 10);

  if (isNaN(prokerId)) {
    return { success: false, error: "Invalid proker ID" };
  }

  const amount = formData.get("amount") as string;
  const type = formData.get("type") as "income" | "expense";
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;

  try {
    await db.insert(financeRecords).values({
      prokerId,
      amount: amount,
      type,
      description,
      date: new Date(dateStr),
      recordedBy: user.id,
    });

    revalidatePath(`/dashboard/finance/proker/${prokerId}`);
    revalidatePath(`/dashboard/finance/proker`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan transaksi" };
  }
}
