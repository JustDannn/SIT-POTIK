"use server";

import { db } from "@/db";
import { publications, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getImpactStories(divisionId: number) {
  // Ambil publikasi Impact milik divisi ini
  const stories = await db.query.publications.findMany({
    where: and(
      eq(publications.divisionId, divisionId),
      eq(publications.category, "Impact"),
    ),
    orderBy: [desc(publications.createdAt)],
    with: {
      author: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
  });

  return stories.map((s) => ({
    ...s,
    createdAt: s.createdAt?.toISOString(),
    updatedAt: s.updatedAt?.toISOString(),
    publishedAt: s.publishedAt?.toISOString(),
  }));
}

// GET IMPACT BY ID (for edit page)
export async function getImpactById(impactId: number) {
  const data = await db
    .select()
    .from(publications)
    .where(
      and(eq(publications.id, impactId), eq(publications.category, "Impact")),
    )
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

// CREATE STANDALONE IMPACT STORY (tanpa event)
export async function createStandaloneImpactStory(formData: FormData) {
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
  const status = (formData.get("status") as string) || "published";

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
      status,
      authorId: user.id,
      divisionId: userProfile.divisionId,
      programId: null,
      publishedAt: status === "published" ? new Date() : null,
    });

    revalidatePath("/dashboard/impacts");
    revalidatePath("/impact");
    return { success: true };
  } catch (error) {
    console.error("Failed to create impact story:", error);
    return { error: "Gagal membuat impact story" };
  }
}

// UPDATE STANDALONE IMPACT STORY
export async function updateStandaloneImpactStory(
  impactId: number,
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
  const status = (formData.get("status") as string) || "published";

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
        status,
        publishedAt: status === "published" ? new Date() : null,
      })
      .where(eq(publications.id, impactId));

    revalidatePath("/dashboard/impacts");
    revalidatePath("/impact");
    return { success: true };
  } catch (error) {
    console.error("Failed to update impact story:", error);
    return { error: "Gagal mengupdate impact story" };
  }
}
