"use server";

import { db } from "@/db";
import { financeRecords, users } from "@/db/schema";
import { eq, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function getGeneralFinance() {
  const transactions = await db
    .select({
      id: financeRecords.id,
      amount: financeRecords.amount,
      type: financeRecords.type,
      description: financeRecords.description,
      date: financeRecords.date,
      recordedBy: users.name,
    })
    .from(financeRecords)
    .leftJoin(users, eq(financeRecords.recordedBy, users.id))
    .where(isNull(financeRecords.prokerId))
    .orderBy(desc(financeRecords.date));

  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });

  return {
    summary: {
      income,
      expense,
      balance: income - expense,
    },
    transactions,
  };
}

// GENERAL TRANSACTION
export async function addGeneralTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const amount = formData.get("amount") as string;
  const type = formData.get("type") as "income" | "expense";
  const description = formData.get("description") as string;
  const dateStr = formData.get("date") as string;

  try {
    await db.insert(financeRecords).values({
      prokerId: null,
      amount: amount,
      type,
      description,
      date: new Date(dateStr),
      recordedBy: user.id,
    });

    revalidatePath("/dashboard/finance/general");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan transaksi" };
  }
}
