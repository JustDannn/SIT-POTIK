import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getEventsList, getDivisionMembers } from "./actions";
import EventsClientWrapper from "./_components/EventsClientWrapper";

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

  const [events, members] = await Promise.all([
    getEventsList(userProfile.divisionId),
    getDivisionMembers(userProfile.divisionId),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container mx-auto px-4 pt-6">
        <EventsClientWrapper initialEvents={events} divisionMembers={members} />
      </div>
    </div>
  );
}
