// ─── CMS Types ───────────────────────────────────────
// Shared between server actions and client components.

export interface PageSection {
  id: string; // section key e.g. "landing_hero"
  label: string;
  fields: PageField[];
}

export interface PageField {
  dbId: number | null; // site_config row id (null = not yet in DB)
  key: string;
  label: string;
  value: string;
  type: "text" | "textarea" | "image" | "rich_text" | "color";
  description?: string;
}

export interface PageDefinition {
  slug: string;
  title: string;
  previewUrl: string;
  sections: PageSection[];
}
