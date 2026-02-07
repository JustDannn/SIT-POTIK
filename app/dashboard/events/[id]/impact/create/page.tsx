import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getEventById } from "../../../actions";
import ImpactCreateForm from "./ImpactCreateForm";

export default async function ImpactCreatePage({
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
  const eventId = parseInt(id);

  if (isNaN(eventId)) notFound();

  const event = await getEventById(eventId);
  if (!event) notFound();

  return <ImpactCreateForm eventId={eventId} eventTitle={event.title} />;
}
