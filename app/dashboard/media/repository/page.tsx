import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  getMediaAssets,
  getMediaFolders,
  getAllPrograms,
  getAllDivisions,
} from "../actions";
import AssetGallery from "../_components/AssetGallery";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";

export default async function MediaRepositoryPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: { role: true, division: true },
  });

  // Check if user has permission (Media, or viewing access for others)
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

  const [assets, folders, programs, divisions] = await Promise.all([
    getMediaAssets(),
    getMediaFolders(),
    getAllPrograms(),
    getAllDivisions(),
  ]);

  // Transform assets for component
  const assetData = assets.map((a) => ({
    id: a.id,
    filename: a.filename,
    url: a.url,
    thumbnailUrl: a.thumbnailUrl,
    size: a.size,
    type: a.type as "image" | "video" | "document" | "audio",
    mimeType: a.mimeType,
    folder: a.folder,
    tags: a.tags,
    createdAt: a.createdAt,
    program: a.program ? { title: a.program.title } : null,
    division: a.division ? { divisionName: a.division.divisionName } : null,
    uploader: a.uploader ? { name: a.uploader.name } : null,
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
          <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
            <ImageIcon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Media Repository
            </h1>
            <p className="text-gray-500">
              Digital Asset Management - Photos, Videos, Documents
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Component */}
      <AssetGallery
        assets={assetData}
        folders={folders}
        programs={programs.map((p) => ({ id: p.id, title: p.title }))}
        divisions={divisions.map((d) => ({
          id: d.id,
          divisionName: d.divisionName,
        }))}
      />
    </div>
  );
}
