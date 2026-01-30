"use server";

import { db } from "@/db";
import { publications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPublications(divisionId: number) {
  return await db.query.publications.findMany({
    where: eq(publications.divisionId, divisionId),
    orderBy: [desc(publications.createdAt)],
    with: {
      author: true,
    },
  });
}

export async function deletePublication(id: number) {
  try {
    await db.delete(publications).where(eq(publications.id, id));
    revalidatePath("/dashboard/publications");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Gagal menghapus data" };
  }
}
export async function createPublication(data: {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnailUrl: string | null;
  fileUrl: string | null; // Buat PDF paper
  status: string;
  divisionId: number;
  authorId: string;
}) {
  try {
    await db.insert(publications).values({
      ...data,
      publishedAt: data.status === "published" ? new Date() : null,
    });

    revalidatePath("/dashboard/publications");
    return { success: true };
  } catch (error) {
    console.error("Create Publication Error:", error);
    return { success: false, error: "Gagal menyimpan data ke database." };
  }
}
export async function getPublicationById(id: number) {
  const result = await db.query.publications.findFirst({
    where: eq(publications.id, id),
    with: { author: true },
  });
  return result;
}
export async function updatePublication(
  id: number,
  data: {
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    thumbnailUrl: string | null;
    fileUrl: string | null;
    status: string;
  },
) {
  try {
    await db
      .update(publications)
      .set({
        ...data,
        // Update publishedAt cuma kalau status berubah jadi published
        publishedAt: data.status === "published" ? new Date() : null,
      })
      .where(eq(publications.id, id));

    revalidatePath("/dashboard/publications");
    revalidatePath(`/publications/${data.slug}`); // Refresh halaman public juga
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Gagal update data." };
  }
}
