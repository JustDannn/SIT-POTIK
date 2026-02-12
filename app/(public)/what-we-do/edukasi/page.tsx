import { getDivisionCMS } from "../cms-helpers";
import EdukasiPageClient from "./EdukasiPageClient";

export default async function EdukasiPelatihanPage() {
  const cms = await getDivisionCMS("edukasi");
  return <EdukasiPageClient cms={cms} />;
}
