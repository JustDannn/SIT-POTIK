import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPageContent, getAvailablePages } from "./actions";
import VisualPageEditor from "./VisualPageEditor";

interface CMSPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CMSPage({ searchParams }: CMSPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userProfile = user;

  // Check if user has permission (Media Coordinator or Admin)
  const isMedia =
    userProfile?.division?.divisionName?.toLowerCase().includes("media") ||
    userProfile?.division?.divisionName?.toLowerCase().includes("branding") ||
    userProfile?.role?.roleName === "Ketua";

  if (!isMedia) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500">Access Denied. Media Coordinator only.</p>
      </div>
    );
  }

  const params = await searchParams;
  const currentSlug = params.page || "landing";
  const availablePages = await getAvailablePages();
  const page = await getPageContent(currentSlug);

  return <VisualPageEditor page={page} availablePages={availablePages} />;
}
