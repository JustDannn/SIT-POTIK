"use server";

import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

import {
  LANDING_DEFAULTS,
  PAGE_DEFAULTS,
  PAGE_TITLES,
  PAGE_PREVIEW_URLS,
  FIELD_META,
  SECTION_LABELS,
} from "./defaults";

// Re-export types so existing imports keep working
export type { PageSection, PageField, PageDefinition } from "./types";
import type { PageSection, PageField, PageDefinition } from "./types";

// ─── Get all available CMS pages ─────────────────────

export async function getAvailablePages() {
  return Object.entries(PAGE_TITLES).map(([slug, title]) => ({
    slug,
    title,
    previewUrl: PAGE_PREVIEW_URLS[slug] || "/",
  }));
}

// ─── Load Page Content ───────────────────────────────

export async function getPageContent(
  pageSlug: string,
): Promise<PageDefinition> {
  const defaults = PAGE_DEFAULTS[pageSlug] ?? LANDING_DEFAULTS;

  // Fetch all siteConfig rows for sections that belong to this page
  const sectionKeys = Object.keys(defaults);
  const dbRows = await db.query.siteConfig.findMany({
    where: (sc, { inArray }) => inArray(sc.section, sectionKeys),
    orderBy: [siteConfig.section, siteConfig.sortOrder],
  });

  // Build a lookup: section -> key -> { id, value }
  const dbLookup = new Map<
    string,
    Map<string, { id: number; value: string }>
  >();
  for (const row of dbRows) {
    if (!dbLookup.has(row.section)) dbLookup.set(row.section, new Map());
    dbLookup.get(row.section)!.set(row.key, { id: row.id, value: row.value });
  }

  // Build sections
  const sections: PageSection[] = sectionKeys.map((sectionKey) => {
    const sectionDefaults = defaults[sectionKey];
    const sectionDb = dbLookup.get(sectionKey);

    const fields: PageField[] = Object.entries(sectionDefaults).map(
      ([key, defaultValue]) => {
        const dbEntry = sectionDb?.get(key);
        const meta = FIELD_META[key] || {
          label: key.replace(/_/g, " "),
          type: "text" as const,
        };

        return {
          dbId: dbEntry?.id ?? null,
          key,
          label: meta.label,
          value: dbEntry?.value ?? defaultValue,
          type: meta.type,
          description: meta.description,
        };
      },
    );

    return {
      id: sectionKey,
      label: SECTION_LABELS[sectionKey] || sectionKey.replace(/_/g, " "),
      fields,
    };
  });

  return {
    slug: pageSlug,
    title: PAGE_TITLES[pageSlug] || pageSlug,
    previewUrl: PAGE_PREVIEW_URLS[pageSlug] || "/",
    sections,
  };
}

// ─── Get a single field value (for public pages) ─────

export async function getCMSValue(
  section: string,
  key: string,
  fallback: string,
): Promise<string> {
  const row = await db.query.siteConfig.findFirst({
    where: and(eq(siteConfig.section, section), eq(siteConfig.key, key)),
  });
  return row?.value ?? fallback;
}

// ─── Batch get all values for a section ──────────────

function findSectionDefaults(section: string): Record<string, string> {
  for (const pageDefaults of Object.values(PAGE_DEFAULTS)) {
    if (pageDefaults[section]) return pageDefaults[section];
  }
  return {};
}

export async function getCMSSection(
  section: string,
): Promise<Record<string, string>> {
  const rows = await db.query.siteConfig.findMany({
    where: eq(siteConfig.section, section),
  });

  const defaults = findSectionDefaults(section);
  const result: Record<string, string> = { ...defaults };

  for (const row of rows) {
    result[row.key] = row.value;
  }

  return result;
}

// ─── Save a single field ─────────────────────────────

export async function saveCMSField(
  section: string,
  key: string,
  value: string,
  dbId: number | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (dbId) {
    await db
      .update(siteConfig)
      .set({ value, updatedAt: new Date(), updatedBy: user.id })
      .where(eq(siteConfig.id, dbId));
  } else {
    await db.insert(siteConfig).values({
      section,
      key,
      value,
      type: "text",
      label: FIELD_META[key]?.label || key,
      updatedBy: user.id,
    });
  }

  revalidatePath("/");
  revalidatePath("/what-we-do", "layout");
  revalidatePath("/dashboard/media/cms");

  return { success: true };
}

// ─── Save multiple fields at once ────────────────────

export async function saveCMSFields(
  fields: {
    section: string;
    key: string;
    value: string;
    dbId: number | null;
  }[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  for (const field of fields) {
    if (field.dbId) {
      await db
        .update(siteConfig)
        .set({
          value: field.value,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(siteConfig.id, field.dbId));
    } else {
      await db.insert(siteConfig).values({
        section: field.section,
        key: field.key,
        value: field.value,
        type: "text",
        label: FIELD_META[field.key]?.label || field.key,
        updatedBy: user.id,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/what-we-do", "layout");
  revalidatePath("/dashboard/media/cms");

  return { success: true };
}
