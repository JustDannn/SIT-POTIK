import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { getSiteConfigSections, getSiteConfig } from "../actions";
import {
  Globe,
  ChevronRight,
  Settings,
  Home,
  Info,
  Phone,
  FileText,
  Users,
  LayoutDashboard,
} from "lucide-react";

const SECTION_ICONS: Record<string, React.ElementType> = {
  home_hero: Home,
  home_about: Info,
  home_cta: LayoutDashboard,
  about: Info,
  contact: Phone,
  footer: FileText,
  team: Users,
};

const SECTION_LABELS: Record<string, string> = {
  home_hero: "Home - Hero Section",
  home_about: "Home - About Preview",
  home_cta: "Home - Call to Action",
  about: "About Page",
  contact: "Contact Page",
  footer: "Footer",
  team: "Team Section",
};

export default async function CMSPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true, division: true },
  });

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

  const sections = await getSiteConfigSections();
  const allConfigs = await getSiteConfig();

  // Group configs by section with counts
  const sectionData = sections.map((section) => ({
    section,
    label: SECTION_LABELS[section] || section.replace(/_/g, " "),
    icon: SECTION_ICONS[section] || Settings,
    count: allConfigs.filter((c) => c.section === section).length,
  }));

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl text-white">
            <Globe size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CMS Editor</h1>
            <p className="text-gray-500">
              Manage website content and configurations
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
        <h3 className="font-semibold text-violet-900 mb-2">
          How the CMS Works
        </h3>
        <ul className="text-sm text-violet-700 space-y-1">
          <li>
            • Select a section below to edit its content (text, images, links)
          </li>
          <li>
            • Changes are saved immediately and reflected on the public website
          </li>
          <li>
            • Use the &quot;Preview&quot; button to see changes before
            publishing
          </li>
        </ul>
      </div>

      {/* Sections Grid */}
      {sectionData.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionData.map(({ section, label, icon: Icon, count }) => (
            <Link
              key={section}
              href={`/dashboard/media/cms/${section}`}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:border-violet-300 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="p-3 bg-gray-100 rounded-xl text-gray-600 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {label}
                </h3>
                <p className="text-sm text-gray-500">
                  {count} editable {count === 1 ? "field" : "fields"}
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-300 group-hover:text-violet-500 transition-colors"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Settings className="mx-auto mb-4 text-gray-300" size={56} />
          <h3 className="font-semibold text-gray-900 mb-2">
            No CMS Sections Configured
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Site configuration entries need to be added to the database. Contact
            your administrator to set up initial CMS content.
          </p>
        </div>
      )}

      {/* Quick Add Section (for future use) */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Available Sections</h3>
        <p className="text-sm text-gray-500 mb-4">
          Pre-configured sections that can be added:
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <span
              key={key}
              className="px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 border border-gray-200"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
