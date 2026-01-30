import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getContentList } from "./actions";
import KetuaContentView from "./_views/KetuaContentView";

export default async function ContentPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true },
  });
  if (!userProfile?.role) return <div>Unauthorized</div>;

  const roleName = userProfile.role.roleName;

  const contentData = await getContentList();

  if (roleName === "Ketua") {
    return <KetuaContentView data={contentData} />;
  }

  return <div>Halaman Konten untuk {roleName} belum dibuat.</div>;
}
