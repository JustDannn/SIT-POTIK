"use server";

import { db } from "@/db";
import { archives, users } from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { getCurrentUser } from "@/utils/session";
import { revalidatePath } from "next/cache";
import {
  deleteFile,
  getPublicUrl,
  STORAGE_BUCKETS,
  uploadFile,
} from "@/lib/storage";

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

  return data.map((item) => ({
    ...item,
    fileUrl: getPublicUrl(STORAGE_BUCKETS.archives, item.fileUrl),
  }));
}

export async function uploadArchive(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as ArchiveCategory;
  const description = formData.get("description") as string;
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return {
      success: false,
      error: "File wajib diupload",
    };
  }

  let uploaded: { path: string } | null = null;
  try {
    uploaded = await uploadFile({
      file,
      bucket: STORAGE_BUCKETS.archives,
      prefix: category || "lainnya",
      maxSize: 5 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    await db.insert(archives).values({
      title,
      category,
      description,
      fileUrl: uploaded.path,
      uploadedBy: user.id,
    });

    revalidatePath("/dashboard/archives");

    return { success: true };
  } catch (error: unknown) {
    if (uploaded) {
      await deleteFile(STORAGE_BUCKETS.archives, uploaded.path).catch(
        () => undefined,
      );
    }
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
    const archive = await db.query.archives.findFirst({
      where: eq(archives.id, id),
      columns: { fileUrl: true },
    });
    await db.delete(archives).where(eq(archives.id, id));
    await deleteFile(STORAGE_BUCKETS.archives, archive?.fileUrl || fileUrl);

    revalidatePath("/dashboard/archives");
    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: "Gagal menghapus dokumen" };
  }
}
