import React from "react";
import PublicationFormView from "../_views/PublicationFormView";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function CreatePublicationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil Data User
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { division: true },
  });

  if (!userProfile?.divisionId) return <div>Access Denied</div>;

  return (
    <PublicationFormView divisionId={userProfile.divisionId} userId={user.id} />
  );
}
