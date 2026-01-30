"use server";

import { db } from "@/db";
import { tasks, publications, users, prokers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getActivityLogs(divisionId: number) {
  // 1. Fetch Tasks
  const tasksData = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      userName: users.name,
    })
    .from(tasks)
    .leftJoin(prokers, eq(tasks.prokerId, prokers.id))
    .leftJoin(users, eq(tasks.assignedUserId, users.id))
    .where(eq(prokers.divisionId, divisionId))
    .orderBy(desc(tasks.updatedAt))
    .limit(20);

  // 2. Fetch Publications
  const pubsData = await db
    .select({
      id: publications.id,
      title: publications.title,
      status: publications.status,
      createdAt: publications.createdAt,
      updatedAt: publications.updatedAt,
      userName: users.name,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(eq(publications.divisionId, divisionId))
    .orderBy(desc(publications.updatedAt))
    .limit(20);

  // 3. Logic Penggabungan Cerdas
  const combinedLogs = [
    ...tasksData.map((t) => {
      // Logic: Kalau status DONE, pakainya waktu UPDATED. Kalau baru, waktu CREATED.
      const isDone = t.status === "done";
      const timestamp = isDone ? t.updatedAt : t.createdAt;

      return {
        id: `task-${t.id}`,
        title: t.title,
        user: t.userName || "Unknown Member",
        // Text Action Dinamis
        action: isDone
          ? "menyelesaikan tugas"
          : t.status === "ongoing"
            ? "sedang mengerjakan"
            : "membuat tugas baru",
        timestamp: timestamp || new Date(), // Fallback biar ga error
        type: "task",
        meta: t.status,
      };
    }),

    ...pubsData.map((p) => {
      const isPublished = p.status === "published";
      const timestamp = isPublished ? p.updatedAt : p.createdAt;

      return {
        id: `pub-${p.id}`,
        title: p.title,
        user: p.userName || "Unknown Author",
        action: isPublished ? "mempublikasikan konten" : "membuat draft konten",
        timestamp: timestamp || new Date(),
        type: "publication",
        meta: p.status,
      };
    }),
  ]
    // Sort descending (Paling baru di atas)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  return combinedLogs;
}
