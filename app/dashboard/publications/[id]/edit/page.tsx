import React from "react";
import PublicationFormView from "../../_views/PublicationFormView"; // Path relatif naik 2 level
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { getPublicationById } from "../../actions";

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Cek User
  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: { division: true },
  });

  if (!userProfile?.divisionId) return <div>Access Denied</div>;

  // 2. Fetch Data Publikasi yang mau diedit
  // (params.id itu string, convert ke number)
  const publicationId = parseInt(id, 10);
  const publication = await getPublicationById(publicationId);

  // 3. Validasi: Data ada?
  if (!publication) return notFound();

  // 4. Validasi: Apakah user ini berhak edit? (Sama divisi?)
  if (publication.divisionId !== userProfile.divisionId) {
    return <div>Anda tidak memiliki izin mengedit konten divisi lain.</div>;
  }

  // 5. Render Form dengan Data Awal
  return (
    <PublicationFormView
      divisionId={userProfile.divisionId}
      userId={user.id}
      initialData={publication}
    />
  );
}
