import React from "react";
import PublicationFormView from "../_views/PublicationFormView";
import { getCurrentUser } from "@/utils/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function CreatePublicationPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // Ambil Data User
  const userProfile = user;

  if (!userProfile?.divisionId) return <div>Access Denied</div>;

  return (
    <PublicationFormView divisionId={userProfile.divisionId} userId={user.id} />
  );
}
