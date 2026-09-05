"use server";

import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/utils/session";
import { FIELD_META, PAGE_PREVIEW_URLS } from "./defaults";

export type { PageSection, PageField, PageDefinition } from "./types";

function revalidateCMSPages() {
  for (const url of Object.values(PAGE_PREVIEW_URLS)) {
    revalidatePath(url, "page");
  }
  revalidatePath("/", "layout");
  revalidatePath("/what-we-do", "layout");
  revalidatePath("/dashboard/media/cms");
}

async function upsertCMSField(
  section: string,
  key: string,
  value: string,
  userId: string,
  dbId: number | null,
) {
  const now = new Date();
  const label = FIELD_META[key]?.label || key;

  // Prefer section+key so a stale client dbId cannot no-op the write.
  const updated = await db
    .update(siteConfig)
    .set({ value, updatedAt: now, updatedBy: userId, label })
    .where(and(eq(siteConfig.section, section), eq(siteConfig.key, key)))
    .returning({ id: siteConfig.id });

  if (updated.length > 0) return;

  if (dbId) {
    const updatedById = await db
      .update(siteConfig)
      .set({ value, updatedAt: now, updatedBy: userId, label })
      .where(eq(siteConfig.id, dbId))
      .returning({ id: siteConfig.id });
    if (updatedById.length > 0) return;
  }

  await db.insert(siteConfig).values({
    section,
    key,
    value,
    type: "text",
    label,
    updatedBy: userId,
  });
}

export async function saveCMSField(
  section: string,
  key: string,
  value: string,
  dbId: number | null,
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await upsertCMSField(section, key, value, user.id, dbId);
    revalidateCMSPages();
    return { success: true };
  } catch (error) {
    console.error("saveCMSField failed:", error);
    return { success: false, error: "Gagal menyimpan perubahan CMS." };
  }
}

export async function saveCMSFields(
  fields: {
    section: string;
    key: string;
    value: string;
    dbId: number | null;
  }[],
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    for (const field of fields) {
      await upsertCMSField(
        field.section,
        field.key,
        field.value,
        user.id,
        field.dbId,
      );
    }

    revalidateCMSPages();
    return { success: true };
  } catch (error) {
    console.error("saveCMSFields failed:", error);
    return { success: false, error: "Gagal menyimpan perubahan CMS." };
  }
}
