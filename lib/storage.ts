import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  mediaAssets: "media-assets",
  brandKit: "brand-kit",
  designRequests: "design_requests",
  documents: "documents",
  archives: "archives",
  publications: "publications",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export type StorageFile = {
  file: File;
  bucket: StorageBucket;
  prefix: string;
  maxSize: number;
  allowedMimeTypes: readonly string[];
};

export const STORAGE_RULES: Record<StorageBucket, Omit<StorageFile, "file">> = {
  avatars: {
    bucket: STORAGE_BUCKETS.avatars,
    prefix: "users",
    maxSize: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  "media-assets": {
    bucket: STORAGE_BUCKETS.mediaAssets,
    prefix: "assets",
    maxSize: 50 * 1024 * 1024,
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-matroska",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
  "brand-kit": {
    bucket: STORAGE_BUCKETS.brandKit,
    prefix: "brand-kit",
    maxSize: 5 * 1024 * 1024,
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/postscript",
      "application/vnd.adobe.illustrator",
      "font/ttf",
      "font/otf",
      "font/woff",
      "font/woff2",
      "application/font-sfnt",
      "application/x-font-ttf",
      "application/x-font-opentype",
    ],
  },
  design_requests: {
    bucket: STORAGE_BUCKETS.designRequests,
    prefix: "attachments",
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  documents: {
    bucket: STORAGE_BUCKETS.documents,
    prefix: "documents",
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  archives: {
    bucket: STORAGE_BUCKETS.archives,
    prefix: "archives",
    maxSize: 5 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  publications: {
    bucket: STORAGE_BUCKETS.publications,
    prefix: "publications",
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function extensionFor(file: File) {
  const extension = path.extname(file.name).toLowerCase().replace(/^\./, "");
  return extension || "bin";
}

export function createStoragePath(prefix: string, file: File) {
  return `${prefix.replace(/^\/+|\/+$/g, "")}/${randomUUID()}.${extensionFor(file)}`;
}

export async function uploadFile({
  file,
  bucket,
  prefix,
  maxSize,
  allowedMimeTypes,
}: StorageFile) {
  if (!file || file.size === 0) throw new Error("File wajib diupload.");
  if (file.size > maxSize) {
    throw new Error(
      `Ukuran file maksimal ${Math.round(maxSize / 1024 / 1024)} MB.`,
    );
  }
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(`Format file ${file.type || "unknown"} tidak diizinkan.`);
  }

  const storagePath = createStoragePath(prefix, file);
  const bytes = await file.arrayBuffer();
  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(storagePath, Buffer.from(bytes), {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);
  return { bucket, path: storagePath };
}

export async function deleteFile(bucket: StorageBucket, storagePath: string) {
  if (
    !storagePath ||
    storagePath.startsWith("http") ||
    storagePath.startsWith("/")
  ) {
    return;
  }

  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .remove([storagePath]);
  if (error) throw new Error(error.message);
}

export function getPublicUrl(
  bucket: StorageBucket,
  storagePath: string | null,
) {
  if (!storagePath) return null;
  if (storagePath.startsWith("http") || storagePath.startsWith("/"))
    return storagePath;
  return getSupabaseAdmin().storage.from(bucket).getPublicUrl(storagePath).data
    .publicUrl;
}

export async function createSignedUrl(
  bucket: StorageBucket,
  storagePath: string,
  expiresIn = 60 * 10,
) {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function replaceFile(
  bucket: StorageBucket,
  oldPath: string | null,
  input: StorageFile,
  commit: (newPath: string) => Promise<void>,
) {
  const uploaded = await uploadFile(input);
  try {
    await commit(uploaded.path);
  } catch (error) {
    await deleteFile(uploaded.bucket, uploaded.path).catch(() => undefined);
    throw error;
  }
  if (oldPath) await deleteFile(bucket, oldPath);
  return uploaded;
}
