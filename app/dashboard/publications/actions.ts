"use server";

import { db } from "@/db";
import { publications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/session";
import { deleteFile, STORAGE_BUCKETS, uploadFile } from "@/lib/storage";

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
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

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
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

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
    revalidatePath("/");
    revalidatePath("/publications");
    revalidatePath("/updates");
    revalidatePath(`/publications/${data.slug}`); // Refresh halaman public juga
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Gagal update data." };
  }
}

// SERVER ACTION: Upload Thumbnail
export async function uploadThumbnail(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  let uploaded: { path: string } | null = null;
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Tidak ada file yang diunggah" };
    }

    uploaded = await uploadFile({
      file,
      bucket: STORAGE_BUCKETS.publications,
      prefix: "thumbnails",
      maxSize: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    });
    return { success: true, url: uploaded.path };
  } catch (error) {
    if (uploaded)
      await deleteFile(STORAGE_BUCKETS.publications, uploaded.path).catch(
        () => undefined,
      );
    console.error("Upload Thumbnail Error:", error);
    return { success: false, error: "Gagal upload thumbnail" };
  }
}

// SERVER ACTION: Upload Document (PDF/DOC)
export async function uploadDocument(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  let uploaded: { path: string } | null = null;
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Tidak ada file yang diunggah" };
    }

    // Validasi tipe file
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Tipe file tidak didukung (PDF/DOC/DOCX saja)",
      };
    }

    uploaded = await uploadFile({
      file,
      bucket: STORAGE_BUCKETS.documents,
      prefix: "publications",
      maxSize: 10 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    return { success: true, url: uploaded.path };
  } catch (error) {
    if (uploaded)
      await deleteFile(STORAGE_BUCKETS.documents, uploaded.path).catch(
        () => undefined,
      );
    console.error("Upload Document Error:", error);
    return { success: false, error: "Gagal upload dokumen" };
  }
}
