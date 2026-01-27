import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getOrganizationData, getReferences } from "./actions";
import KetuaOverviewView from "./_views/KetuaOverviewView";

export default async function OverviewPage() {
  const supabase = await createClient();

  // 1. Auth Check
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

  // 2. Fetch Data
  const orgData = await getOrganizationData();
  const references = await getReferences();

  // 3. Render
  if (roleName === "Ketua") {
    return <KetuaOverviewView data={orgData} references={references} />;
  }

  return (
    <div className="p-10 text-center text-gray-400">
      Halaman Overview untuk {roleName} belum tersedia.
    </div>
  );
}
