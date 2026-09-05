"use server";

import { db } from "@/db";
import { publications } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { getPublicUrl, STORAGE_BUCKETS } from "@/lib/storage";

export async function getPublishedContent() {
  const rows = await db.query.publications.findMany({
    where: and(
      eq(publications.status, "published"),
      ne(publications.category, "Impact"),
    ),
    orderBy: [desc(publications.publishedAt)],
    with: {
      author: true,
    },
  });
  return rows.map((row) => ({
    ...row,
    thumbnailUrl: getPublicUrl(STORAGE_BUCKETS.publications, row.thumbnailUrl),
    fileUrl: getPublicUrl(STORAGE_BUCKETS.publications, row.fileUrl),
  }));
}

export async function getPublicationBySlug(slug: string) {
  const result = await db.query.publications.findFirst({
    where: and(
      eq(publications.slug, slug),
      eq(publications.status, "published"),
    ),
    with: {
      author: true,
    },
  });

  return result
    ? {
        ...result,
        thumbnailUrl: getPublicUrl(
          STORAGE_BUCKETS.publications,
          result.thumbnailUrl,
        ),
        fileUrl: getPublicUrl(STORAGE_BUCKETS.publications, result.fileUrl),
      }
    : result;
}
