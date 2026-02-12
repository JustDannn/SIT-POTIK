import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { getSiteConfig } from "../../actions";
import CMSEditorForm from "../../_components/CMSEditorForm";
import { ArrowLeft, Eye, ExternalLink } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  home_hero: "Home - Hero Section",
  home_about: "Home - About Preview",
  home_cta: "Home - Call to Action",
  about: "About Page",
  contact: "Contact Page",
  footer: "Footer",
  team: "Team Section",
};

const SECTION_PREVIEW_URLS: Record<string, string> = {
  home_hero: "/",
  home_about: "/",
  home_cta: "/",
  about: "/about",
  contact: "/contact",
  footer: "/",
  team: "/about",
};

export default async function CMSSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true, division: true },
  });

  // Check if user has permission
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

  const configs = await getSiteConfig(section);

  // Transform for component
  const configItems = configs.map((c) => ({
    id: c.id,
    section: c.section,
    key: c.key,
    value: c.value,
    type: c.type as "text" | "image" | "rich_text" | "link" | "json" | null,
    label: c.label,
    description: c.description,
    sortOrder: c.sortOrder,
  }));

  const sectionLabel = SECTION_LABELS[section] || section.replace(/_/g, " ");
  const previewUrl = SECTION_PREVIEW_URLS[section] || "/";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/media/cms"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 capitalize">
              Edit {sectionLabel}
            </h1>
            <p className="text-sm text-gray-500">
              Changes will be reflected on the public website immediately.
            </p>
          </div>
        </div>

        {/* Preview Button */}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Eye size={18} />
          Preview Page
          <ExternalLink size={14} className="text-gray-400" />
        </a>
      </div>

      {/* Editor Form */}
      <div className="max-w-3xl">
        <CMSEditorForm
          section={section}
          sectionLabel={sectionLabel}
          configs={configItems}
        />
      </div>

      {/* Info Card */}
      <div className="bg-gray-50 rounded-xl p-5 max-w-3xl">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Need to add new fields?
        </h4>
        <p className="text-sm text-gray-500">
          Contact your administrator to add new configurable fields to this
          section. New fields can be of type: text, image, rich text, link, or
          JSON.
        </p>
      </div>
    </div>
  );
}
