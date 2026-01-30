"use server";

import { db } from "@/db";
import { minutes, users, prokers } from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// 1. GET LIST NOTULENSI
export async function getMinutes(query: string = "") {
  const data = await db
    .select({
      id: minutes.id,
      title: minutes.title,
      meetingDate: minutes.meetingDate,
      meetingType: minutes.meetingType,
      status: minutes.status,
      authorName: users.name,
      prokerTitle: prokers.title,
    })
    .from(minutes)
    .leftJoin(users, eq(minutes.uploadedBy, users.id))
    .leftJoin(prokers, eq(minutes.prokerId, prokers.id))
    .where(like(minutes.title, `%${query}%`))
    .orderBy(desc(minutes.meetingDate));

  return data;
}

// 2. GET SINGLE NOTULENSI (Buat Edit)
export async function getMinuteById(id: number) {
  const data = await db.select().from(minutes).where(eq(minutes.id, id));
  return data[0];
}

// 3. GET PROKER OPTIONS (Buat Dropdown)
export async function getProkerOptions() {
  return await db
    .select({ id: prokers.id, title: prokers.title })
    .from(prokers);
}

// 4. CREATE / UPDATE ACTION
export async function saveMinute(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const meetingDate = formData.get("meetingDate") as string;
  const meetingType = formData.get("meetingType") as
    | "proker"
    | "bph"
    | "dosen"
    | "internal";
  const content = formData.get("content") as string;
  const attendees = formData.get("attendees") as string;
  const status = formData.get("status") as "draft" | "published";
  const prokerId = formData.get("prokerId")
    ? Number(formData.get("prokerId"))
    : null;

  try {
    const payload = {
      title,
      meetingDate: new Date(meetingDate),
      meetingType,
      content,
      attendees,
      status,
      prokerId,
      uploadedBy: user.id, // Selalu update last editor atau keep creator awal (opsional)
    };

    if (id) {
      // UPDATE
      await db
        .update(minutes)
        .set(payload)
        .where(eq(minutes.id, Number(id)));
    } else {
      // CREATE
      await db.insert(minutes).values(payload);
    }

    revalidatePath("/dashboard/minutes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan notulensi" };
  }
}

// 5. DELETE ACTION
export async function deleteMinute(id: number) {
  try {
    await db.delete(minutes).where(eq(minutes.id, id));
    revalidatePath("/dashboard/minutes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus" };
  }
}
