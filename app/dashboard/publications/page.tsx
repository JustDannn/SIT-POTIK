import React from "react";
import { getPublications } from "./actions";
import PublicationsListView from "./_views/PublicationsListView";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function PublicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { division: true },
  });
  if (!userProfile?.divisionId) {
    return <div>Anda tidak memiliki akses ke modul ini.</div>;
  }

  const publications = await getPublications(userProfile.divisionId);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manajemen Publikasi
        </h1>
        <p className="text-gray-500 text-sm">
          Kelola artikel, paper, dan infografis yang akan tampil di website
          publik.
        </p>
      </div>

      <PublicationsListView initialData={publications} />
    </div>
  );
}
