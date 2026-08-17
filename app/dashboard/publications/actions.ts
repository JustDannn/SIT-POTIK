"use server";

import { db } from "@/db";
import { publications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

// SERVER ACTION: Upload Thumbnail
export async function uploadThumbnail(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Tidak ada file yang diunggah" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat direktori jika belum ada
    const uploadDir = join(process.cwd(), "public", "uploads", "thumbnails");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate nama file unik
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const fileName = `thumb-${timestamp}.${ext}`;
    const filePath = join(uploadDir, fileName);

    // Simpan file
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/thumbnails/${fileName}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Upload Thumbnail Error:", error);
    return { success: false, error: "Gagal upload thumbnail" };
  }
}

// SERVER ACTION: Upload Document (PDF/DOC)
export async function uploadDocument(formData: FormData) {
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat direktori jika belum ada
    const uploadDir = join(process.cwd(), "public", "uploads", "documents");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate nama file unik
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const fileName = `doc-${timestamp}.${ext}`;
    const filePath = join(uploadDir, fileName);

    // Simpan file
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/documents/${fileName}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Upload Document Error:", error);
    return { success: false, error: "Gagal upload dokumen" };
  }
}
