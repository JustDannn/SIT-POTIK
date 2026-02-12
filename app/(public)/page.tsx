import { getLandingPageData } from "./actions";
import LandingContent from "./LandingContent";

export const revalidate = 60;

export default async function Home() {
  const data = await getLandingPageData();

  return (
    <LandingContent publications={data.publications} events={data.events} />
  );
}
