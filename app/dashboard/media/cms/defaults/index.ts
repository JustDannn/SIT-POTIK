// ─── CMS Defaults — Barrel Export ────────────────────
// Re-exports every page default + metadata so actions.ts
// only needs a single import line.

export { LANDING_DEFAULTS } from "./landing";
export { WTD_DATA_DEFAULTS } from "./wtd-data";
export { WTD_RISET_DEFAULTS } from "./wtd-riset";
export { WTD_EDUKASI_DEFAULTS } from "./wtd-edukasi";
export { WTD_MEDIA_DEFAULTS } from "./wtd-media";
export { WTD_PR_SDM_DEFAULTS } from "./wtd-prsdm";
export { MEET_DEFAULTS } from "./meet";
export { FIELD_META, SECTION_LABELS } from "./field-meta";

// ── Lazy-imports for the aggregate maps ──────────────
import { LANDING_DEFAULTS } from "./landing";
import { WTD_DATA_DEFAULTS } from "./wtd-data";
import { WTD_RISET_DEFAULTS } from "./wtd-riset";
import { WTD_EDUKASI_DEFAULTS } from "./wtd-edukasi";
import { WTD_MEDIA_DEFAULTS } from "./wtd-media";
import { WTD_PR_SDM_DEFAULTS } from "./wtd-prsdm";
import { MEET_DEFAULTS } from "./meet";

// ─── Page slug → defaults map ────────────────────────
export const PAGE_DEFAULTS: Record<
  string,
  Record<string, Record<string, string>>
> = {
  landing: LANDING_DEFAULTS,
  "what-we-do/data": WTD_DATA_DEFAULTS,
  "what-we-do/riset": WTD_RISET_DEFAULTS,
  "what-we-do/edukasi": WTD_EDUKASI_DEFAULTS,
  "what-we-do/media": WTD_MEDIA_DEFAULTS,
  "what-we-do/pr-sdm": WTD_PR_SDM_DEFAULTS,
  meet: MEET_DEFAULTS,
};

// ─── Page slug → display title ───────────────────────
export const PAGE_TITLES: Record<string, string> = {
  landing: "Landing Page",
  "what-we-do/data": "Layanan Data & Statistik",
  "what-we-do/riset": "Riset & Infografis",
  "what-we-do/edukasi": "Edukasi & Pelatihan",
  "what-we-do/media": "Media & Creative Branding",
  "what-we-do/pr-sdm": "PR & SDM",
  meet: "Meet Us",
};

// ─── Page slug → public preview URL ──────────────────
export const PAGE_PREVIEW_URLS: Record<string, string> = {
  landing: "/",
  "what-we-do/data": "/what-we-do/data",
  "what-we-do/riset": "/what-we-do/riset",
  "what-we-do/edukasi": "/what-we-do/edukasi",
  "what-we-do/media": "/what-we-do/media",
  "what-we-do/pr-sdm": "/what-we-do/pr-sdm",
  meet: "/meet",
};
