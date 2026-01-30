"use server";

import { db } from "@/db";
import { publications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getPublishedContent() {
    return await db.query.publications.findMany({
        where: eq(publications.status, "published"),
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

