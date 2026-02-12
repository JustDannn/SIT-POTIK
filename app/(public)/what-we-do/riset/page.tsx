import { getDivisionCMS } from "../cms-helpers";
import RisetPageClient from "./RisetPageClient";

export default async function RisetInfografisPage() {
  const cms = await getDivisionCMS("riset");
  return <RisetPageClient cms={cms} />;
}
