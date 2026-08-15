import { getCurrentUser } from "@/utils/session";
import { redirect, notFound } from "next/navigation";
import { getEventById } from "../../../actions";
import ImpactCreateForm from "./ImpactCreateForm";

export default async function ImpactCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) notFound();

  const event = await getEventById(eventId);
  if (!event) notFound();

  return <ImpactCreateForm eventId={eventId} eventTitle={event.title} />;
}
