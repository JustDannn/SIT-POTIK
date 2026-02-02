import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getEventById } from "../actions";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({
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

  // Get the user's role from participants or default to 'viewer'
  const participant = event.participants.find((p) => p.userId === user.id);
  const userRole = participant?.role ?? "viewer";

  return <EventDetailClient event={event} userRole={userRole} />;
}
