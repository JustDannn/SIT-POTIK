import React from "react";
import { db } from "@/db";
import { publications, users } from "@/db/schema";
import { eq, and, desc, ne, inArray } from "drizzle-orm";
import PublicationFeed from "./PublicationFeed";

export const revalidate = 60;

export default async function PublicPublicationsPage() {
  const rawData = await db
    .select({
      id: publications.id,
      title: publications.title,
      slug: publications.slug,
      excerpt: publications.excerpt,
      content: publications.content,
      fileUrl: publications.fileUrl,
      thumbnailUrl: publications.thumbnailUrl,
      category: publications.category,
      status: publications.status,
      authorId: publications.authorId,
      divisionId: publications.divisionId,
      programId: publications.programId,
      publishedAt: publications.publishedAt,
      createdAt: publications.createdAt,
      updatedAt: publications.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        roleId: users.roleId,
        divisionId: users.divisionId,
        createdAt: users.createdAt,
        status: users.status,
      },
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(
      and(
        eq(publications.status, "published"),
        ne(publications.category, "Impact"),
        inArray(publications.category, ["Artikel", "Infografis", "Paper"]),
        eq(publications.divisionId, 2),
      ),
    )
    .orderBy(desc(publications.publishedAt));

  const data = rawData.map((item) => ({
    ...item,
    author: item.author && item.author.id ? item.author : null,
  }));

  return (
    <div className="min-h-screen">
      <div className="h-20" />
      <main>
        <PublicationFeed initialData={data} />
      </main>
    </div>
  );
}
