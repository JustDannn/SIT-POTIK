import { getLandingPageData } from "./actions";
import { getCMSSection } from "../dashboard/media/cms/queries";
import LandingContent from "./LandingContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, hero, pillars, pubSection, eventsSection, cta] =
    await Promise.all([
      getLandingPageData(),
      getCMSSection("landing_hero"),
      getCMSSection("landing_pillars"),
      getCMSSection("landing_publications"),
      getCMSSection("landing_events"),
      getCMSSection("landing_cta"),
    ]);

  return (
    <LandingContent
      publications={data.publications}
      events={data.events}
      cms={{
        hero,
        pillars,
        publications: pubSection,
        events: eventsSection,
        cta,
      }}
    />
  );
}
