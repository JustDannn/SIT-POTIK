"use server";

import { db } from "@/db";
import { archives, users } from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { getCurrentUser } from "@/utils/session";
import { revalidatePath } from "next/cache";
import { writeFile, unlink } from "fs/promises";
import path from "path";

type ArchiveCategory =
  | "surat_masuk"
  | "surat_keluar"
  | "proposal"
  | "sk"
  | "lainnya";

export async function getArchives(query: string = "", category: string = "") {
  const filters = [like(archives.title, `%${query}%`)];

  if (category && category !== "all") {
    filters.push(eq(archives.category, category as ArchiveCategory));
  }

  const data = await db
    .select({
      id: archives.id,
      title: archives.title,
      category: archives.category,
      description: archives.description,
      fileUrl: archives.fileUrl,
      createdAt: archives.createdAt,
      uploaderName: users.name,
    })
    .from(archives)
    .leftJoin(users, eq(archives.uploadedBy, users.id))
    .where(and(...filters))
    .orderBy(desc(archives.createdAt));

  return data;
}

// UPLOAD ACTION (Simpan file ke folder lokal /public/uploads)
export async function uploadArchive(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as ArchiveCategory;
  const description = formData.get("description") as string;
  const file = formData.get("file") as File;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  if (!file || file.size === 0) {
    return {
      success: false,
      error: "File wajib diupload",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "Ukuran file maksimal 5 MB",
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    await db.insert(archives).values({
      title,
      category,
      description,
      fileUrl,
      uploadedBy: user.id,
    });

    revalidatePath("/dashboard/archives");

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal upload dokumen";

    console.error(error);

    return {
      success: false,
      error: message,
    };
  }
}

// DELETE ACTION (Hapus file fisik dari folder lokal & database)
export async function deleteArchive(id: number, fileUrl: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // 1. Hapus file fisik dari folder public/uploads kalau ada
    if (fileUrl && fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", fileUrl);
      try {
        await unlink(filePath);
      } catch (e: unknown) {
        console.warn("File fisik tidak ditemukan atau sudah terhapus:", e);
      }
    }

    // 2. Hapus data dari database
    await db.delete(archives).where(eq(archives.id, id));

    revalidatePath("/dashboard/archives");
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: "Gagal menghapus dokumen" };
  }
}
