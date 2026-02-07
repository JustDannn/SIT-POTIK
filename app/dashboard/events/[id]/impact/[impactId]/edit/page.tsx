import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getEventById, getImpactStoryById } from "../../../../actions";
import ImpactEditForm from "./ImpactEditForm";

export default async function ImpactEditPage({
  params,
}: {
  params: Promise<{ id: string; impactId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { id, impactId } = await params;
  const eventId = parseInt(id);
  const storyId = parseInt(impactId);

  if (isNaN(eventId) || isNaN(storyId)) notFound();

  const [event, impact] = await Promise.all([
    getEventById(eventId),
    getImpactStoryById(storyId),
  ]);

  if (!event || !impact) notFound();

  return (
    <ImpactEditForm
      eventId={eventId}
      eventTitle={event.title}
      impact={impact}
    />
  );
}
