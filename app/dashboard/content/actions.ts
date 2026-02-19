"use server";

import { db } from "@/db";
import {
  contentPlans,
  publications,
  users,
  divisions,
  designRequests,
} from "@/db/schema";
import { desc, eq, and, or, sql } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getContentList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { role: null, data: [], userId: null };

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { role: true, division: true },
  });

  if (!userProfile?.role) return { role: null, data: [], userId: null };

  const roleName = userProfile.role.roleName;

  // LOGIC KETUA — Fetch dynamic content from division outputs
  if (roleName === "Ketua") {
    // Fetch content plans (from Media & Branding)
    const contentPlanData = await db.query.contentPlans.findMany({
      orderBy: [desc(contentPlans.scheduledDate)],
      with: { pic: true },
    });

    // Fetch recent publications (from Riset, PR & SDM)
    const pubData = await db
      .select({
        id: publications.id,
        title: publications.title,
        category: publications.category,
        status: publications.status,
        createdAt: publications.createdAt,
        slug: publications.slug,
        authorName: users.name,
        divisionName: divisions.divisionName,
      })
      .from(publications)
      .leftJoin(users, eq(publications.authorId, users.id))
      .leftJoin(divisions, eq(publications.divisionId, divisions.id))
      .orderBy(desc(publications.createdAt))
      .limit(20);

    return {
      role: "Ketua",
      userId: user.id,
      data: contentPlanData.map((c) => ({
        id: c.id,
        title: c.title,
        channel: c.channel,
        status: c.status,
        date: c.scheduledDate,
        picName: c.pic?.name || "Tanpa PIC",
        assetUrl: c.assetUrl,
        caption: c.caption,
      })),
      publications: pubData,
    };
  }

  // KOORDINATOR — Filter by division
  if (roleName === "Koordinator" && userProfile.divisionId) {
    const data = await db
      .select({
        id: publications.id,
        title: publications.title,
        category: publications.category,
        status: publications.status,
        createdAt: publications.createdAt,
        publishedAt: publications.publishedAt,
        slug: publications.slug,
        authorName: users.name,
      })
      .from(publications)
      .leftJoin(users, eq(publications.authorId, users.id))
      .where(eq(publications.divisionId, userProfile.divisionId))
      .orderBy(desc(publications.createdAt));

    return { role: "Koordinator", data, userId: user.id };
  }

  // ALL OTHER ROLES — can still view and request content
  return { role: roleName, data: [], userId: user.id };
}

export async function createContent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil Data User (untuk Division ID)
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userProfile?.divisionId) {
    throw new Error("No Division Assigned");
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as any;
  const content = formData.get("content") as string;
  const fileUrl = formData.get("fileUrl") as string;

  // Generate Simple Slug
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
      category,
      content,
      fileUrl,
      status: "draft",
      authorId: user.id,
      divisionId: userProfile.divisionId,
      publishedAt: null,
    });
  } catch (error) {
    console.error("Failed to create content:", error);
    throw new Error("Failed to create content");
  }

  revalidatePath("/dashboard/content");
  redirect("/dashboard/content");
}

export async function getPublicationById(id: number) {
  const data = await db
    .select()
    .from(publications)
    .where(eq(publications.id, id))
    .limit(1);

  return data[0] || null;
}

// UPDATE CONTENT
export async function updateContent(id: number, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now();

  await db
    .update(publications)
    .set({
      title: title,
      category: formData.get("category") as any,
      content: formData.get("content") as string,
      fileUrl: formData.get("fileUrl") as string,
      slug: slug,
      // tidak update 'authorId' atau 'divisionId'
    })
    .where(eq(publications.id, id));

  revalidatePath("/dashboard/content");
  redirect("/dashboard/content");
}

/**
 * Submit a content request to the Media & Branding division.
 * Available to ALL roles.
 */
export async function submitContentRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = (formData.get("priority") as string) || "normal";
  const deadline = formData.get("deadline") as string;

  try {
    await db.insert(designRequests).values({
      title,
      description,
      requestedBy: user.id,
      priority: priority as "low" | "normal" | "high" | "urgent",
      status: "pending",
      deadline: deadline ? new Date(deadline) : null,
    });

    revalidatePath("/dashboard/content");
    revalidatePath("/dashboard/media/requests");
    return { success: true };
  } catch (error) {
    console.error("Submit content request error:", error);
    return { success: false, error: "Gagal mengirim request." };
  }
}
