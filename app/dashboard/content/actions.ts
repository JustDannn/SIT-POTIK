"use server";

import { db } from "@/db";
import { contentPlans, publications, users, divisions } from "@/db/schema";
import { desc, eq, and, or } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getContentList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { role: null, data: [] };

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { role: true, division: true },
  });

  if (!userProfile?.role) return { role: null, data: [] };

  // LOGIC KETUA (Liat Content Plan Sosmed)
  if (userProfile.role.roleName === "Ketua") {
    const data = await db.query.contentPlans.findMany({
      orderBy: [desc(contentPlans.scheduledDate)],
      with: { pic: true },
    });

    return {
      role: "Ketua",
      data: data.map((c) => ({
        id: c.id,
        title: c.title,
        channel: c.channel,
        status: c.status,
        date: c.scheduledDate,
        picName: c.pic?.name || "Tanpa PIC",
        assetUrl: c.assetUrl,
        caption: c.caption,
      })),
    };
  }

  // KOORDINATOR (PR & SDM) - Liat Publikasi (Artikel/Press Release)
  if (userProfile.role.roleName === "Koordinator") {
    const data = await db
      .select({
        id: publications.id,
        title: publications.title,
        category: publications.category, // Artikel, Press Release
        status: publications.status, // draft, review, published
        createdAt: publications.createdAt,
        publishedAt: publications.publishedAt,
        slug: publications.slug,
        authorName: users.name,
      })
      .from(publications)
      .leftJoin(users, eq(publications.authorId, users.id))
      .where(eq(publications.divisionId, userProfile.divisionId!)) // Filter by Division
      .orderBy(desc(publications.createdAt));

    return {
      role: "Koordinator",
      data: data,
    };
  }

  return { role: "Anggota", data: [] };
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
