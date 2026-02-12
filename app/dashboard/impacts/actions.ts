"use server";

import { db } from "@/db";
import { publications, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getImpactStories(divisionId: number) {
  // Ambil publikasi Impact milik divisi ini
  const stories = await db.query.publications.findMany({
    where: and(
      eq(publications.divisionId, divisionId),
      eq(publications.category, "Impact"),
    ),
    orderBy: [desc(publications.createdAt)],
    with: {
      author: {
        columns: {
          name: true,
          image: true,
        },
      },
    },
  });

  return stories.map((s) => ({
    ...s,
    createdAt: s.createdAt?.toISOString(),
    updatedAt: s.updatedAt?.toISOString(),
    publishedAt: s.publishedAt?.toISOString(),
  }));
}
