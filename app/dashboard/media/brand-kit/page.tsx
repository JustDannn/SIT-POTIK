import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getBrandKits } from "../actions";
import BrandKitGallery from "../_components/BrandKitGallery";

export default async function BrandKitPage() {
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

  // Fetch brand kits
  const brandKits = await getBrandKits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Brand Kit
        </h1>
        <p className="text-gray-500 mt-1">
          Official brand assets, logos, colors, and typography
        </p>
      </div>

      <BrandKitGallery brandKits={brandKits} />
    </div>
  );
}
