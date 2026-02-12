import { getDivisionCMS } from "../cms-helpers";
import PrSdmPageClient from "./PrSdmPageClient";

export default async function PrSdmPage() {
  const cms = await getDivisionCMS("prsdm");
  return <PrSdmPageClient cms={cms} />;
}
