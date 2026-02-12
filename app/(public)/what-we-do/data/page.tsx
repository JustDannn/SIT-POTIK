import { getDivisionCMS } from "../cms-helpers";
import DataPageClient from "./DataPageClient";

export default async function LayananDataPage() {
  const cms = await getDivisionCMS("data");
  return <DataPageClient cms={cms} />;
}
