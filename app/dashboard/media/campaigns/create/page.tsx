"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { createCampaign } from "../../actions";
import {
  ArrowLeft,
  Save,
  Loader2,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Twitter,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CampaignPlatform =
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "website"
  | "twitter"
  | "youtube";

const PLATFORMS: {
  id: CampaignPlatform;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
    color: "from-gray-900 to-gray-700",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-blue-500",
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    color: "from-violet-600 to-purple-600",
  },
  {
    id: "twitter",
    label: "Twitter/X",
    icon: Twitter,
    color: "from-sky-500 to-blue-500",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "from-red-600 to-red-500",
  },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<{
    title: string;
    platform: CampaignPlatform;
    scheduledDate: string;
    scheduledTime: string;
    caption: string;
  }>({
    title: "",
    platform: "instagram",
    scheduledDate: "",
    scheduledTime: "",
    caption: "",
  });

  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetPreview, setAssetPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAssetFile(file);
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setAssetPreview(URL.createObjectURL(file));
      }
    }
  };

  const removeAsset = () => {
    setAssetFile(null);
    setAssetPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let assetUrl = "";

      // Upload asset if exists
      if (assetFile) {
        const fileName = `campaign-${Date.now()}-${assetFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const { error: uploadError } = await supabase.storage
          .from("campaigns")
          .upload(fileName, assetFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("campaigns")
          .getPublicUrl(fileName);
        assetUrl = data.publicUrl;
      }

      // Combine date and time
      let scheduledDate: Date | undefined;
      if (formData.scheduledDate) {
        const dateStr = formData.scheduledTime
          ? `${formData.scheduledDate}T${formData.scheduledTime}`
          : formData.scheduledDate;
        scheduledDate = new Date(dateStr);
      }

      startTransition(async () => {
        await createCampaign({
          title: formData.title,
          platform: formData.platform,
          caption: formData.caption || undefined,
          scheduledDate,
          assetUrl: assetUrl || undefined,
        });

        router.push("/dashboard/media/campaigns");
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Gagal membuat campaign. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const selectedPlatform = PLATFORMS.find((p) => p.id === formData.platform);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/media/campaigns"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
          <p className="text-gray-500">Schedule content for social media</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Platform
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = formData.platform === platform.id;
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() =>
                    setFormData((f) => ({ ...f, platform: platform.id }))
                  }
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    isSelected
                      ? `bg-linear-to-br ${platform.color} text-white border-transparent shadow-lg`
                      : "border-gray-200 hover:border-gray-300 bg-white",
                  )}
                >
                  <Icon />
                  <span className="text-xs font-medium">{platform.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Campaign Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData((f) => ({ ...f, title: e.target.value }))
            }
            placeholder="e.g., World Statistics Day 2026"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
          />
        </div>

        {/* Schedule */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scheduled Date
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData((f) => ({ ...f, scheduledDate: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scheduled Time
            </label>
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) =>
                setFormData((f) => ({ ...f, scheduledTime: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
            />
          </div>
        </div>

        {/* Caption / Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Caption / Content
          </label>
          <textarea
            value={formData.caption}
            onChange={(e) =>
              setFormData((f) => ({ ...f, caption: e.target.value }))
            }
            rows={5}
            placeholder="Write your caption here..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 resize-none"
          />
        </div>

        {/* Asset Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Visual Asset
          </label>
          {assetPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              {assetFile?.type.startsWith("video/") ? (
                <video
                  src={assetPreview}
                  controls
                  className="w-full max-h-80 object-contain bg-gray-100"
                />
              ) : (
                <Image
                  src={assetPreview}
                  alt="Preview"
                  width={500}
                  height={500}
                  className="w-full max-h-80 object-contain bg-gray-100"
                />
              )}
              <button
                type="button"
                onClick={removeAsset}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
              <UploadCloud className="text-gray-400 mb-3" size={40} />
              <span className="text-sm font-medium text-gray-600 mb-1">
                Click to upload image or video
              </span>
              <span className="text-xs text-gray-400">
                PNG, JPG, MP4, MOV up to 50MB
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleAssetChange}
              />
            </label>
          )}
        </div>

        {/* Preview Card */}
        {formData.title && (
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Preview
            </h4>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-sm">
              {assetPreview && (
                <Image
                  src={assetPreview}
                  alt="Preview"
                  width={500}
                  height={500}
                  className="w-full aspect-square object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {selectedPlatform && (
                    <div
                      className={cn(
                        "p-1.5 rounded-lg text-white bg-linear-to-br",
                        selectedPlatform.color,
                      )}
                    >
                      <selectedPlatform.icon />
                    </div>
                  )}
                  <span className="text-sm font-semibold">
                    {formData.title}
                  </span>
                </div>
                {formData.caption && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {formData.caption}
                  </p>
                )}
                {formData.scheduledDate && (
                  <p className="text-xs text-gray-400 mt-2">
                    Scheduled:{" "}
                    {new Date(formData.scheduledDate).toLocaleDateString()}{" "}
                    {formData.scheduledTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/dashboard/media/campaigns"
            className="flex-1 px-4 py-3 text-center border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!formData.title || isPending || isUploading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-lg shadow-violet-200"
          >
            {isPending || isUploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Create Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
