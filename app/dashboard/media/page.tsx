import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import MediaDashboardView from "../_views/MediaDashboardView";

export default async function MediaDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user profile with division and role
  const profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      role: true,
      division: true,
    },
  });

  if (!profile) redirect("/login");

  // Only Media/Branding division or Ketua can access
  const divisionName = profile.division?.divisionName?.toLowerCase() || "";
  const isMediaDivision =
    divisionName.includes("media") || divisionName.includes("branding");
  const isKetua = profile.role?.roleName === "Ketua";

  if (!isMediaDivision && !isKetua) {
    redirect("/dashboard");
  }

  return <MediaDashboardView userName={profile.name || "Media Team"} />;
}
