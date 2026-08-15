import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/session";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDesignRequests } from "../actions";
import RequestKanban from "../_components/RequestKanban";

export default async function DesignRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = user;

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
