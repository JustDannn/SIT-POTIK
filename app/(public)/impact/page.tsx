import { db } from "@/db";
import { publications, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ImpactFeed from "./ImpactFeed";

export const metadata = {
  title: "Impact & Stories | Pojok Statistik",
  description:
    "Dokumentasi kegiatan dan dampak nyata Pojok Statistik Telkom University Surabaya.",
};
export const revalidate = 60;

export default async function ImpactPage() {
  const stories = await db.query.publications.findMany({
    where: eq(publications.category, "Impact"),
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

  // Serialize Date Objects untuk dikirim ke Client Component
  const serializedStories = stories.map((story) => ({
    ...story,
    createdAt: story.createdAt?.toISOString(),
    updatedAt: story.updatedAt?.toISOString(),
    publishedAt: story.publishedAt?.toISOString(),
  }));

  return (
    <div className="min-h-screen">
      <ImpactFeed initialData={serializedStories} />
    </div>
  );
}
