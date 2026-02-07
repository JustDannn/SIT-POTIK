"use server";

import { db } from "@/db";
import {
  programs,
  programParticipants,
  users,
  divisions,
  publications,
} from "@/db/schema";
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

  // Fetch impact stories linked to this event (only category = 'Impact')
  const impacts = await db
    .select({
      id: publications.id,
      title: publications.title,
      slug: publications.slug,
      excerpt: publications.excerpt,
      content: publications.content,
      fileUrl: publications.fileUrl,
      thumbnailUrl: publications.thumbnailUrl,
      category: publications.category,
      status: publications.status,
      authorName: users.name,
      createdAt: publications.createdAt,
      publishedAt: publications.publishedAt,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(
      and(
        eq(publications.programId, eventId),
        eq(publications.category, "Impact"),
      ),
    )
    .orderBy(desc(publications.createdAt));

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
    impacts: impacts.map((i) => ({
      ...i,
      createdAt: i.createdAt ? i.createdAt.toISOString() : null,
      publishedAt: i.publishedAt ? i.publishedAt.toISOString() : null,
    })),
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

  // Handling Members (sent as JSON string from client)
  const membersJson = formData.get("members") as string;
  const selectedMembers: { userId: string; role: string }[] = membersJson
    ? JSON.parse(membersJson)
    : [];

  if (!title || !location || !startDate) {
    return { error: "Field wajib tidak lengkap" };
  }

  try {
    const [newEvent] = await db
      .insert(programs)
      .values({
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        divisionId: userProfile.divisionId,
        status: "planned",
      })
      .returning({ id: programs.id });

    // Batch insert participants
    if (selectedMembers.length > 0) {
      const participantsData = selectedMembers.map((m) => ({
        programId: newEvent.id,
        userId: m.userId,
        role: m.role,
      }));
      await db.insert(programParticipants).values(participantsData);
    }

    revalidatePath("/dashboard/events");
    return { success: true, eventId: newEvent.id };
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

// CREATE IMPACT STORY LINKED TO EVENT
export async function createImpactStory(eventId: number, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userProfile?.divisionId) return { error: "User tidak memiliki divisi" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;

  if (!title) return { error: "Judul wajib diisi" };

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now();

  try {
    await db.insert(publications).values({
      title,
      slug,
      content,
      fileUrl: fileUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      category: "Impact",
      status: "published",
      authorId: user.id,
      divisionId: userProfile.divisionId,
      programId: eventId,
      publishedAt: new Date(),
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath("/impact");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal membuat impact story" };
  }
}

// GET IMPACT STORY BY ID (for edit page)
export async function getImpactStoryById(impactId: number) {
  const data = await db
    .select()
    .from(publications)
    .where(eq(publications.id, impactId))
    .limit(1);

  if (!data[0]) return null;

  const item = data[0];
  return {
    ...item,
    createdAt: item.createdAt?.toISOString() ?? null,
    updatedAt: item.updatedAt?.toISOString() ?? null,
    publishedAt: item.publishedAt?.toISOString() ?? null,
  };
}

// UPDATE IMPACT STORY
export async function updateImpactStory(
  impactId: number,
  eventId: number,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;

  if (!title) return { error: "Judul wajib diisi" };

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now();

  try {
    await db
      .update(publications)
      .set({
        title,
        slug,
        content,
        fileUrl: fileUrl || null,
        thumbnailUrl: thumbnailUrl || null,
      })
      .where(eq(publications.id, impactId));

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath("/impact");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mengupdate impact story" };
  }
}

// DELETE IMPACT STORY
export async function deleteImpactStory(impactId: number, eventId: number) {
  try {
    await db.delete(publications).where(eq(publications.id, impactId));
    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath("/impact");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal menghapus impact story" };
  }
}

// GET DIVISION MEMBERS (for member picker in CreateEventDialog)
export async function getDivisionMembers(divisionId: number) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
    })
    .from(users)
    .where(eq(users.divisionId, divisionId));
}
