import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import {
  LANDING_DEFAULTS,
  PAGE_DEFAULTS,
  PAGE_TITLES,
  PAGE_PREVIEW_URLS,
  FIELD_META,
  SECTION_LABELS,
} from "./defaults";
import type { PageSection, PageField, PageDefinition } from "./types";

export async function getAvailablePages() {
  return Object.entries(PAGE_TITLES).map(([slug, title]) => ({
    slug,
    title,
    previewUrl: PAGE_PREVIEW_URLS[slug] || "/",
  }));
}

export async function getPageContent(
  pageSlug: string,
): Promise<PageDefinition> {
  const defaults = PAGE_DEFAULTS[pageSlug] ?? LANDING_DEFAULTS;

  const sectionKeys = Object.keys(defaults);
  const dbRows = await db.query.siteConfig.findMany({
    where: (sc, { inArray }) => inArray(sc.section, sectionKeys),
    orderBy: [siteConfig.section, siteConfig.sortOrder, siteConfig.id],
  });

  const dbLookup = new Map<
    string,
    Map<string, { id: number; value: string }>
  >();
  for (const row of dbRows) {
    if (!dbLookup.has(row.section)) dbLookup.set(row.section, new Map());
    dbLookup.get(row.section)!.set(row.key, { id: row.id, value: row.value });
  }

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

export async function getCMSValue(
  section: string,
  key: string,
  fallback: string,
): Promise<string> {
  const row = await db.query.siteConfig.findFirst({
    where: and(eq(siteConfig.section, section), eq(siteConfig.key, key)),
    orderBy: [siteConfig.id],
  });
  return row?.value ?? fallback;
}

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
    orderBy: [siteConfig.id],
  });

  const defaults = findSectionDefaults(section);
  const result: Record<string, string> = { ...defaults };

  for (const row of rows) {
    result[row.key] = row.value;
  }

  return result;
}
