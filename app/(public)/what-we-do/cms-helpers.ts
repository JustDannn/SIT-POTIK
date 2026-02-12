import { getCMSSection } from "@/app/dashboard/media/cms/actions";

// Helper to build DivisionContent props from CMS sections
export async function getDivisionCMS(divisionPrefix: string) {
  const [
    hero,
    mission,
    quote,
    feature1,
    feature2,
    program1,
    program2,
    program3,
    cta,
  ] = await Promise.all([
    getCMSSection(`wtd_${divisionPrefix}_hero`),
    getCMSSection(`wtd_${divisionPrefix}_mission`),
    getCMSSection(`wtd_${divisionPrefix}_quote`),
    getCMSSection(`wtd_${divisionPrefix}_feature_1`),
    getCMSSection(`wtd_${divisionPrefix}_feature_2`),
    getCMSSection(`wtd_${divisionPrefix}_program_1`),
    getCMSSection(`wtd_${divisionPrefix}_program_2`),
    getCMSSection(`wtd_${divisionPrefix}_program_3`),
    getCMSSection(`wtd_${divisionPrefix}_cta`),
  ]);

  return {
    hero: {
      badgeText: hero.badge_text,
      titleLine1: hero.title_line1,
      titleHighlight: hero.title_highlight,
      description: hero.description,
      button1Text: hero.button_1_text,
      button2Text: hero.button_2_text || "",
      heroImage: hero.hero_image,
    },
    mission: {
      heading: mission.heading,
      body: mission.body,
      bodySecondary: mission.body_secondary,
    },
    quote: {
      text: quote.text,
      author: quote.author,
      role: quote.role,
    },
    features: [
      {
        title: feature1.title,
        description: feature1.description,
        image: feature1.image || "",
      },
      {
        title: feature2.title,
        description: feature2.description,
        image: feature2.image || "",
      },
    ],
    programs: [
      {
        title: program1.title,
        description: program1.description,
        linkText: program1.link_text,
        image: program1.image || "",
      },
      {
        title: program2.title,
        description: program2.description,
        linkText: program2.link_text,
        image: program2.image || "",
      },
      {
        title: program3.title,
        description: program3.description,
        linkText: program3.link_text,
        image: program3.image || "",
      },
    ],
    cta: {
      heading: cta.heading,
      description: cta.description,
      primaryText: cta.primary_text,
      primaryLink: cta.primary_link,
      secondaryText: cta.secondary_text,
      secondaryLink: cta.secondary_link,
    },
  };
}
