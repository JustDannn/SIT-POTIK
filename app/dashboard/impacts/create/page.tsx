import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import StandaloneImpactForm from "./_components/StandaloneImpactForm";

export default async function CreateImpactPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <StandaloneImpactForm />;
}
