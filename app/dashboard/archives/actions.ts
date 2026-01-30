"use server";

import { db } from "@/db";
import { archives, users } from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ArchiveCategory = "surat_masuk" | "surat_keluar" | "proposal" | "sk" | "lainnya";

export async function getArchives(query: string = "", category: string = "") {
  // filter dinamis
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

// UPLOAD ACTION
export async function uploadArchive(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const title = formData.get("title") as string;
  const category = formData.get("category") as any;
  const description = formData.get("description") as string;
  const file = formData.get("file") as File;

  if (!file) return { success: false, error: "File wajib diupload" };

  try {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from("archives")
      .upload(fileName, file);

    if (storageError) throw new Error(storageError.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from("archives").getPublicUrl(fileName);
    await db.insert(archives).values({
      title,
      category,
      description,
      fileUrl: publicUrl,
      uploadedBy: user.id,
    });

    revalidatePath("/dashboard/archives");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Gagal upload dokumen" };
  }
}

// DELETE ACTION
export async function deleteArchive(id: number, fileUrl: string) {
  const supabase = await createClient();

  try {
    const fileName = fileUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("archives").remove([fileName]);
    }
    await db.delete(archives).where(eq(archives.id, id));

    revalidatePath("/dashboard/archives");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus" };
  }
}
