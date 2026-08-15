import { getCurrentUser } from "@/utils/session";
import { redirect, notFound } from "next/navigation";
import { getImpactById } from "../../actions";
import ImpactEditForm from "./_components/ImpactEditForm";

export default async function EditImpactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { id } = await params;
  const impact = await getImpactById(Number(id));

  if (!impact) return notFound();

  return <ImpactEditForm impact={impact} />;
}
