import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getEventsList } from "./actions";
import EventsListView from "./_views/EventsListView";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      division: true,
    },
  });

  if (!userProfile?.divisionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-500">
            Anda belum terdaftar di divisi manapun.
          </p>
        </div>
      </div>
    );
  }

  const events = await getEventsList(userProfile.divisionId);

  return <EventsListView initialData={events} />;
}
