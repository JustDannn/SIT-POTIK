import { getCurrentUser } from "@/utils/session";
import { redirect } from "next/navigation";
import StandaloneImpactForm from "./_components/StandaloneImpactForm";

export default async function CreateImpactPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return <StandaloneImpactForm />;
}
