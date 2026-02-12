import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getImpactStories } from "./actions";
import ImpactsListView from "./_views/ImpactsListView";

export default async function ImpactsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch User Division
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      division: true,
    },
  });

  if (!userProfile?.divisionId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Akses Ditolak</h2>
        <p className="text-gray-500">Anda belum terdaftar di divisi manapun.</p>
      </div>
    );
  }

  // Fetch Data
  const impacts = await getImpactStories(userProfile.divisionId);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 pt-6">
        <ImpactsListView data={impacts} />
      </div>
    </div>
  );
}
