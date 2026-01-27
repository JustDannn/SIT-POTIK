"use server";

import { db } from "@/db";
import { contentPlans } from "@/db/schema";
import { desc, asc } from "drizzle-orm";

export async function getContentList() {
  const data = await db.query.contentPlans.findMany({
    // Urutkan: Yang akan tayang duluan di atas, baru yang udah lewat
    orderBy: [desc(contentPlans.scheduledDate)],
    with: {
      pic: true,
    },
  });

  return data.map((c) => ({
    id: c.id,
    title: c.title,
    channel: c.channel,
    status: c.status,
    date: c.scheduledDate,
    picName: c.pic?.name || "Tanpa PIC",
    assetUrl: c.assetUrl,
    caption: c.caption,
  }));
}
