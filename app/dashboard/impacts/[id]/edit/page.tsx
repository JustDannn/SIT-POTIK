import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getImpactById } from "../../actions";
import ImpactEditForm from "./_components/ImpactEditForm";

export default async function EditImpactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { id } = await params;
  const impact = await getImpactById(Number(id));

  if (!impact) return notFound();

  return <ImpactEditForm impact={impact} />;
}
