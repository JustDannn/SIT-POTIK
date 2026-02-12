import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { getCampaigns } from "../actions";
import CampaignCalendar from "../_components/CampaignCalendar";
import { ArrowLeft, Calendar } from "lucide-react";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true, division: true },
  });

  // Check permission
  const isMedia =
    userProfile?.division?.divisionName?.toLowerCase().includes("media") ||
    userProfile?.division?.divisionName?.toLowerCase().includes("branding") ||
    userProfile?.role?.roleName === "Ketua" ||
    userProfile?.role?.roleName === "Koordinator";

  if (!isMedia) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500">Access Denied.</p>
      </div>
    );
  }

  const campaigns = await getCampaigns();

  // Transform data for component
  const campaignData = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    platform: c.platform,
    status: c.status,
    scheduledDate: c.scheduledDate,
    publishedDate: c.publishedDate,
    caption: c.caption,
    assetUrl: c.assetUrl,
    pic: c.pic ? { name: c.pic.name } : null,
  }));

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="p-3 bg-violet-100 rounded-2xl text-violet-600">
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Campaign Calendar
            </h1>
            <p className="text-gray-500">
              Plan and schedule social media & website content
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Component */}
      <CampaignCalendar campaigns={campaignData} />
    </div>
  );
}
