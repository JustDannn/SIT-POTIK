"use server";

import { db } from "@/db";
import { archives, users } from "@/db/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. GET LIST ARCHIVES
export async function getArchives(query: string = "", category: string = "") {
  // Bikin filter dinamis
  const filters = [like(archives.title, `%${query}%`)];

  if (category && category !== "all") {
    // @ts-ignore - Drizzle enum type check workaround
    filters.push(eq(archives.category, category));
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

// 2. UPLOAD ACTION
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
    // A. Upload File ke Supabase Storage
    // Nama file unik: timestamp-namafile
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    // Pastikan bucket 'archives' sudah dibuat di Supabase Dashboard!
    const { data: storageData, error: storageError } = await supabase.storage
      .from("archives")
      .upload(fileName, file);

    if (storageError) throw new Error(storageError.message);

    // Dapatkan Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("archives").getPublicUrl(fileName);

    // B. Simpan Metadata ke Database
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

// 3. DELETE ACTION
export async function deleteArchive(id: number, fileUrl: string) {
  const supabase = await createClient();

  try {
    // A. Hapus File dari Storage (Optional, biar hemat storage)
    // Ambil nama file dari URL
    const fileName = fileUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("archives").remove([fileName]);
    }

    // B. Hapus Data dari DB
    await db.delete(archives).where(eq(archives.id, id));

    revalidatePath("/dashboard/archives");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus" };
  }
}
