"use server";

import { db } from "@/db";
import { programs, programParticipants, users, divisions } from "@/db/schema";
import { eq, and, desc, ilike } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// GET ALL EVENTS FOR A DIVISION
export async function getEventsList(divisionId: number, query: string = "") {
  const data = await db
    .select({
      id: programs.id,
      title: programs.title,
      description: programs.description,
      startDate: programs.startDate,
      endDate: programs.endDate,
      location: programs.location,
      status: programs.status,
    })
    .from(programs)
    .where(
      and(
        eq(programs.divisionId, divisionId),
        query ? ilike(programs.title, `%${query}%`) : undefined,
      ),
    )
    .orderBy(desc(programs.startDate));

  return data.map((e) => ({
    ...e,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : null,
  }));
}

// GET EVENT BY ID WITH DETAILS
export async function getEventById(eventId: number) {
  const eventData = await db
    .select({
      id: programs.id,
      title: programs.title,
      description: programs.description,
      location: programs.location,
      startDate: programs.startDate,
      endDate: programs.endDate,
      status: programs.status,
      createdAt: programs.createdAt,
      divisionId: programs.divisionId,
      divisionName: divisions.divisionName,
    })
    .from(programs)
    .leftJoin(divisions, eq(programs.divisionId, divisions.id))
    .where(eq(programs.id, eventId))
    .limit(1);

  if (!eventData || eventData.length === 0) return null;

  const event = eventData[0];

  const participants = await db
    .select({
      id: programParticipants.id,
      role: programParticipants.role,
      joinedAt: programParticipants.joinedAt,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(programParticipants)
    .leftJoin(users, eq(programParticipants.userId, users.id))
    .where(eq(programParticipants.programId, eventId));

  return {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt ? event.createdAt.toISOString() : null,
    division: event.divisionName ? { divisionName: event.divisionName } : null,
    participants: participants.map((p) => ({
      ...p,
      joinedAt: p.joinedAt ? p.joinedAt.toISOString() : null,
    })),
    logs: [],
    impacts: [],
  };
}

// CREATE NEW EVENT
export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Get user division
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userProfile?.divisionId) {
    return { error: "User tidak memiliki divisi" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!title || !location || !startDate) {
    return { error: "Field wajib tidak lengkap" };
  }

  try {
    await db.insert(programs).values({
      title,
      description,
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      divisionId: userProfile.divisionId,
      status: "planned",
    });

    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal membuat event" };
  }
}

// UPDATE EVENT STATUS
export async function updateEventStatus(eventId: number, status: string) {
  try {
    await db
      .update(programs)
      .set({ status: status as any })
      .where(eq(programs.id, eventId));

    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal update status" };
  }
}

// ADD PARTICIPANT TO EVENT
export async function addParticipant(
  eventId: number,
  userId: string,
  role: string,
) {
  try {
    await db.insert(programParticipants).values({
      programId: eventId,
      userId,
      role,
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal menambah partisipan" };
  }
}

// REMOVE PARTICIPANT
export async function removeParticipant(participantId: number) {
  try {
    await db
      .delete(programParticipants)
      .where(eq(programParticipants.id, participantId));

    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal menghapus partisipan" };
  }
}
