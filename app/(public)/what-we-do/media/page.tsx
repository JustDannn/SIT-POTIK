import { getDivisionCMS } from "../cms-helpers";
import MediaPageClient from "./MediaPageClient";

export default async function MediaBrandingPage() {
  const cms = await getDivisionCMS("media");
  return <MediaPageClient cms={cms} />;
}
