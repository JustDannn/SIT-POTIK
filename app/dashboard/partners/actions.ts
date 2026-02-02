"use server";

import { db } from "@/db";
import { partners } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. GET ALL PARTNERS
export async function getPartners() {
  return await db.select().from(partners).orderBy(desc(partners.createdAt));
}

// 2. CREATE PARTNER
export async function createPartner(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const picContact = formData.get("picContact") as string;
  const notes = formData.get("notes") as string;

  await db.insert(partners).values({
    name,
    type,
    picContact,
    notes,
    status: "potential", // Default status awal
    lastFollowUp: new Date(), // Set tanggal hari ini sebagai follow-up awal
  });

  revalidatePath("/dashboard/partners");
  redirect("/dashboard/partners");
}

// 3. UPDATE STATUS & FOLLOW UP
export async function updatePartnerStatus(
  id: number,
  status: "active" | "inactive" | "potential",
) {
  await db
    .update(partners)
    .set({
      status,
      lastFollowUp: new Date(), // Update tanggal follow up tiap ganti status
    })
    .where(eq(partners.id, id));

  revalidatePath("/dashboard/partners");
}

// 4. DELETE PARTNER
export async function deletePartner(id: number) {
  await db.delete(partners).where(eq(partners.id, id));
  revalidatePath("/dashboard/partners");
}
