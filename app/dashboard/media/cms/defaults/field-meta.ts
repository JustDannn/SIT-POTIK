// ─── Field Metadata ──────────────────────────────────
// Maps field keys to their label, input type, and optional description.
// Used by the CMS editor to render the correct input widget.

type FieldType = "text" | "textarea" | "image" | "rich_text" | "color";

export const FIELD_META: Record<
  string,
  { label: string; type: FieldType; description?: string }
> = {
  // ── Landing hero ──
  badge_text: { label: "Badge Text", type: "text" },
  title_line1: { label: "Title Line 1", type: "text" },
  title_line2: { label: "Title Line 2", type: "text" },
  title_highlight: {
    label: "Title Highlight",
    type: "text",
    description: "The gradient-colored word",
  },
  title_prefix: { label: "Title Prefix", type: "text" },
  title: { label: "Title", type: "text" },
  description: { label: "Description", type: "textarea" },

  // ── Landing buttons / links ──
  cta_primary_text: { label: "Primary Button Text", type: "text" },
  cta_primary_link: { label: "Primary Button Link", type: "text" },
  cta_secondary_text: { label: "Secondary Button Text", type: "text" },
  cta_secondary_link: { label: "Secondary Button Link", type: "text" },
  cta_text: { label: "CTA Text", type: "text" },
  cta_link: { label: "CTA Link", type: "text" },

  // ── Images ──
  hero_image: {
    label: "Hero Image",
    type: "image",
    description: "Main hero section image",
  },
  image: { label: "Image", type: "image", description: "Section image" },

  // ── Landing stats ──
  stat_1_value: { label: "Stat 1 Value", type: "text" },
  stat_1_label: { label: "Stat 1 Label", type: "text" },
  stat_2_value: { label: "Stat 2 Value", type: "text" },
  stat_2_label: { label: "Stat 2 Label", type: "text" },
  stat_3_value: { label: "Stat 3 Value", type: "text" },
  stat_3_label: { label: "Stat 3 Label", type: "text" },

  // ── Landing pillars ──
  pillar_1_title: { label: "Pillar 1 Title", type: "text" },
  pillar_1_desc: { label: "Pillar 1 Description", type: "textarea" },
  pillar_2_title: { label: "Pillar 2 Title", type: "text" },
  pillar_2_desc: { label: "Pillar 2 Description", type: "textarea" },
  pillar_3_title: { label: "Pillar 3 Title", type: "text" },
  pillar_3_desc: { label: "Pillar 3 Description", type: "textarea" },
  pillar_4_title: { label: "Pillar 4 Title", type: "text" },
  pillar_4_desc: { label: "Pillar 4 Description", type: "textarea" },
  pillar_5_title: { label: "Pillar 5 Title", type: "text" },
  pillar_5_desc: { label: "Pillar 5 Description", type: "textarea" },

  // ── What-We-Do shared keys ──
  heading: { label: "Heading", type: "textarea" },
  body: { label: "Body Text", type: "textarea" },
  body_secondary: { label: "Secondary Body Text", type: "textarea" },
  text: { label: "Quote Text", type: "textarea" },
  author: { label: "Author Name", type: "text" },
  role: { label: "Author Role", type: "text" },
  link_text: { label: "Link Text", type: "text" },
  primary_text: { label: "Primary Button Text", type: "text" },
  primary_link: { label: "Primary Button Link", type: "text" },
  secondary_text: { label: "Secondary Button Text", type: "text" },
  secondary_link: { label: "Secondary Button Link", type: "text" },

  // ── What-We-Do hero buttons ──
  button_1_text: { label: "Button 1 Text", type: "text" },
  button_2_text: {
    label: "Button 2 Text",
    type: "text",
    description: "Optional second button",
  },
};

// ─── Section Labels ──────────────────────────────────
// Human-friendly names shown in the CMS editor sidebar.

export const SECTION_LABELS: Record<string, string> = {
  // Landing
  landing_hero: "Hero Section",
  landing_pillars: "What We Do — Pillars",
  landing_publications: "Publications Section",
  landing_events: "Events Section",
  landing_cta: "Call to Action",

  // Data & Statistik
  wtd_data_hero: "Hero Section",
  wtd_data_mission: "Mission Statement",
  wtd_data_quote: "Quote",
  wtd_data_feature_1: "Feature Spotlight 1",
  wtd_data_feature_2: "Feature Spotlight 2",
  wtd_data_program_1: "Program 1",
  wtd_data_program_2: "Program 2",
  wtd_data_program_3: "Program 3",
  wtd_data_cta: "Call to Action",

  // Riset & Infografis
  wtd_riset_hero: "Hero Section",
  wtd_riset_mission: "Mission Statement",
  wtd_riset_quote: "Quote",
  wtd_riset_feature_1: "Feature Spotlight 1",
  wtd_riset_feature_2: "Feature Spotlight 2",
  wtd_riset_program_1: "Program 1",
  wtd_riset_program_2: "Program 2",
  wtd_riset_program_3: "Program 3",
  wtd_riset_cta: "Call to Action",

  // Edukasi & Pelatihan
  wtd_edukasi_hero: "Hero Section",
  wtd_edukasi_mission: "Mission Statement",
  wtd_edukasi_quote: "Quote",
  wtd_edukasi_feature_1: "Feature Spotlight 1",
  wtd_edukasi_feature_2: "Feature Spotlight 2",
  wtd_edukasi_program_1: "Program 1",
  wtd_edukasi_program_2: "Program 2",
  wtd_edukasi_program_3: "Program 3",
  wtd_edukasi_cta: "Call to Action",

  // Media & Branding
  wtd_media_hero: "Hero Section",
  wtd_media_mission: "Mission Statement",
  wtd_media_quote: "Quote",
  wtd_media_feature_1: "Feature Spotlight 1",
  wtd_media_feature_2: "Feature Spotlight 2",
  wtd_media_program_1: "Program 1",
  wtd_media_program_2: "Program 2",
  wtd_media_program_3: "Program 3",
  wtd_media_cta: "Call to Action",

  // PR & SDM
  wtd_prsdm_hero: "Hero Section",
  wtd_prsdm_mission: "Mission Statement",
  wtd_prsdm_quote: "Quote",
  wtd_prsdm_feature_1: "Feature Spotlight 1",
  wtd_prsdm_feature_2: "Feature Spotlight 2",
  wtd_prsdm_program_1: "Program 1",
  wtd_prsdm_program_2: "Program 2",
  wtd_prsdm_program_3: "Program 3",
  wtd_prsdm_cta: "Call to Action",
};
