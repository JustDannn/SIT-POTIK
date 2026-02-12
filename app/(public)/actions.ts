"use server";

import { db } from "@/db";
import { publications, programs, divisions, users } from "@/db/schema";
import { eq, desc, ne } from "drizzle-orm";

export async function getLandingPageData() {
  // All published publications — use explicit select/join to avoid lateral-join issues
  const allPublications = await db
    .select({
      id: publications.id,
      title: publications.title,
      slug: publications.slug,
      excerpt: publications.excerpt,
      thumbnailUrl: publications.thumbnailUrl,
      fileUrl: publications.fileUrl,
      category: publications.category,
      publishedAt: publications.publishedAt,
      authorName: users.name,
      authorImage: users.image,
      divisionName: divisions.divisionName,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .leftJoin(divisions, eq(publications.divisionId, divisions.id))
    .where(eq(publications.status, "published"))
    .orderBy(desc(publications.publishedAt))
    .limit(9);

  // Upcoming / recent events (join division manually since programs has no relations)
  const recentEvents = await db
    .select({
      id: programs.id,
      title: programs.title,
      description: programs.description,
      location: programs.location,
      startDate: programs.startDate,
      endDate: programs.endDate,
      status: programs.status,
      divisionName: divisions.divisionName,
    })
    .from(programs)
    .leftJoin(divisions, eq(programs.divisionId, divisions.id))
    .where(ne(programs.status, "canceled"))
    .orderBy(desc(programs.startDate))
    .limit(4);

  // Serialize dates for client components
  return {
    publications: allPublications.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      thumbnailUrl: p.thumbnailUrl,
      fileUrl: p.fileUrl,
      category: p.category,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      author: p.authorName
        ? { name: p.authorName, image: p.authorImage }
        : null,
      division: p.divisionName ? { divisionName: p.divisionName } : null,
    })),
    events: recentEvents.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      startDate: e.startDate?.toISOString() ?? null,
      endDate: e.endDate?.toISOString() ?? null,
      status: e.status,
      division: e.divisionName ? { divisionName: e.divisionName } : null,
    })),
  };
}
