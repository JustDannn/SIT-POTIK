import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDesignRequests } from "../actions";
import RequestKanban from "../_components/RequestKanban";

export default async function DesignRequestsPage() {
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

  // Fetch design requests
  const requests = await getDesignRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Design Requests
        </h1>
        <p className="text-gray-500 mt-1">
          Manage incoming design requests from all divisions
        </p>
      </div>

      <RequestKanban requests={requests} />
    </div>
  );
}
