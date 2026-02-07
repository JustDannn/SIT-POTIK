"use server";

import { db } from "@/db";
import { publications } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";

export async function getPublishedContent() {
  return await db.query.publications.findMany({
    where: and(
      eq(publications.status, "published"),
      ne(publications.category, "Impact"),
    ),
    orderBy: [desc(publications.publishedAt)],
    with: {
      author: true,
    },
  });
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

  return result;
}
