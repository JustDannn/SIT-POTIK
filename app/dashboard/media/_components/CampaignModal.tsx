"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

import {
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Twitter,
  UploadCloud,
  X,
  Save,
  Loader2,
} from "lucide-react";

import { createCampaign, updateCampaign } from "../actions";
import { uploadFileAction } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

type CampaignPlatform =
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "website"
  | "twitter"
  | "youtube";

type CampaignStatus = "draft" | "scheduled" | "published" | "archived";

export interface Campaign {
  id: number;
  title: string;
  platform: string;
  status: string | null;
  scheduledDate: Date | null;
  publishedDate: Date | null;
  caption: string | null;
  assetUrl: string | null;
  pic: { name: string } | null;
}

interface CampaignModalProps {
  open: boolean;
  campaign?: Campaign | null;
  onClose: () => void;
  onSuccess?: () => void;
}

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

function formatDateForInput(date: Date | string | null) {
  if (!date) return "";

  const d = new Date(date);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTimeForInput(date: Date | string | null) {
  if (!date) return "";

  const d = new Date(date);

  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function isVideoFile(file: File) {
  return (
    file.type.startsWith("video/") || /\.(mp4|mov|webm|mkv)$/i.test(file.name)
  );
}

function isVideoUrl(url: string | null) {
  if (!url) return false;

  return /\.(mp4|mov|webm|mkv)(?:[?#].*)?$/i.test(url);
}

export default function CampaignModal({
  open,
  campaign,
  onClose,
  onSuccess,
}: CampaignModalProps) {
  const isEditMode = Boolean(campaign);

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    platform: CampaignPlatform;
    scheduledDate: string;
    scheduledTime: string;
    caption: string;
    status: CampaignStatus;
  }>({
    title: "",
    platform: "instagram",
    scheduledDate: "",
    scheduledTime: "",
    caption: "",
    status: "scheduled",
  });

  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetPreview, setAssetPreview] = useState<string | null>(null);

  /*
   * Initialize form ketika:
   * - modal dibuka untuk Create
   * - modal dibuka untuk Edit
   * - campaign yang dipilih berubah
   */
  useEffect(() => {
    if (!open) return;

    if (campaign) {
      setFormData({
        title: campaign.title,
        platform: campaign.platform as CampaignPlatform,
        scheduledDate: formatDateForInput(campaign.scheduledDate),
        scheduledTime: formatTimeForInput(campaign.scheduledDate),
        caption: campaign.caption ?? "",
        status: (campaign.status ?? "scheduled") as CampaignStatus,
      });

      setAssetFile(null);
      setAssetPreview(campaign.assetUrl);
    } else {
      setFormData({
        title: "",
        platform: "instagram",
        scheduledDate: "",
        scheduledTime: "",
        caption: "",
        status: "scheduled",
      });

      setAssetFile(null);
      setAssetPreview(null);
    }
  }, [open, campaign]);

  /*
   * Jangan render modal kalau tidak sedang dibuka.
   */
  if (!open) return null;

  const selectedPlatform = PLATFORMS.find((p) => p.id === formData.platform);

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Ukuran file melebihi batas 50MB.");
      return;
    }

    setAssetFile(file);

    if (file.type.startsWith("image/") || isVideoFile(file)) {
      const previewUrl = URL.createObjectURL(file);
      setAssetPreview(previewUrl);
    }
  };

  const removeAsset = () => {
    setAssetFile(null);
    setAssetPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Campaign title wajib diisi.");
      return;
    }

    setIsSaving(true);

    try {
      /*
       * Upload hanya kalau user memilih file baru.
       */
      let assetUrl = campaign?.assetUrl ?? undefined;

      if (assetFile) {
        const uploadData = new FormData();

        uploadData.append("file", assetFile);
        uploadData.append("bucket", "campaigns");

        const result = await uploadFileAction(uploadData);

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.url) {
          assetUrl = result.url;
        }
      }

      /*
       * Combine date + time.
       */
      let scheduledDate: Date | undefined;

      if (formData.scheduledDate) {
        const dateStr = formData.scheduledTime
          ? `${formData.scheduledDate}T${formData.scheduledTime}`
          : formData.scheduledDate;

        scheduledDate = new Date(dateStr);
      }

      if (isEditMode && campaign) {
        /*
         * EDIT
         */
        await updateCampaign(campaign.id, {
          title: formData.title,
          platform: formData.platform,
          status: formData.status,
          caption: formData.caption || undefined,
          scheduledDate,
          assetUrl,
          ...(formData.status === "published"
            ? {
                publishedDate: campaign.publishedDate ?? new Date(),
              }
            : {}),
        });
      } else {
        /*
         * CREATE
         */
        await createCampaign({
          title: formData.title,
          platform: formData.platform,
          caption: formData.caption || undefined,
          scheduledDate,
          assetUrl,
        });
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save campaign:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan campaign. Silakan coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit Campaign" : "New Campaign"}
            </h2>

            <p className="text-sm text-gray-500">
              {isEditMode
                ? "Update campaign information"
                : "Schedule content for social media"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-6">
          <form
            id="campaign-form"
            onSubmit={handleSubmit}
            className="space-y-7"
          >
            {/* Platform */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Platform
              </label>

              <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = formData.platform === platform.id;

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() =>
                        setFormData((f) => ({
                          ...f,
                          platform: platform.id,
                        }))
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                        isSelected
                          ? `bg-linear-to-br ${platform.color} border-transparent text-white shadow-lg`
                          : "border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <Icon />

                      <span className="text-xs font-medium">
                        {platform.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Campaign Title
              </label>

              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g., World Statistics Day 2026"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Schedule + Status */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Scheduled Date
                </label>

                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      scheduledDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border text-gray-700 border-gray-200 px-4 py-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>

              {/* Time */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Scheduled Time
                </label>

                <div className="flex w-full items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                  <select
                    value={formData.scheduledTime.split(":")[0] || ""}
                    onChange={(e) => {
                      const minute =
                        formData.scheduledTime.split(":")[1] || "00";

                      setFormData((f) => ({
                        ...f,
                        scheduledTime: e.target.value
                          ? `${e.target.value}:${minute}`
                          : "",
                      }));
                    }}
                    className="flex-1 cursor-pointer text-gray-700 bg-transparent text-sm outline-none"
                  >
                    <option value="">Hour</option>

                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = String(i).padStart(2, "0");

                      return (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      );
                    })}
                  </select>

                  <span className="px-2 font-semibold text-gray-400">:</span>

                  <select
                    value={formData.scheduledTime.split(":")[1] || ""}
                    onChange={(e) => {
                      const hour = formData.scheduledTime.split(":")[0] || "00";

                      setFormData((f) => ({
                        ...f,
                        scheduledTime: e.target.value
                          ? `${hour}:${e.target.value}`
                          : "",
                      }));
                    }}
                    className="flex-1 cursor-pointer text-gray-700 bg-transparent text-sm outline-none"
                  >
                    <option value="">Minute</option>

                    {["00", "15", "30", "45"].map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>
                <div className="flex w-full items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        status: e.target.value as CampaignStatus,
                      }))
                    }
                    className="w-full cursor-pointer bg-transparent text-sm text-gray-700 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Caption / Content
              </label>

              <textarea
                value={formData.caption}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    caption: e.target.value,
                  }))
                }
                rows={5}
                placeholder="Write your caption here..."
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Visual Asset */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                Visual Asset
              </label>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                {assetPreview ? (
                  <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {(
                      (assetFile && isVideoFile(assetFile)) ||
                      (!assetFile && isVideoUrl(assetPreview))
                    ) ? (
                      <video
                        src={assetPreview}
                        controls
                        playsInline
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="relative aspect-video w-full">
                        <Image
                          src={assetPreview}
                          alt="Campaign asset"
                          fill
                          className="object-cover"
                          unoptimized={assetPreview.startsWith("blob:")}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={removeAsset}
                      className="absolute right-3 top-3 rounded-xl bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                      aria-label="Remove asset"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 transition-all hover:border-violet-400 hover:bg-violet-50/50">
                    <div className="mb-3 rounded-xl bg-violet-100 p-3">
                      <UploadCloud className="text-violet-600" size={28} />
                    </div>

                    <span className="mb-1 text-sm font-semibold text-gray-700">
                      Upload visual asset
                    </span>

                    <span className="text-xs text-gray-400">
                      PNG, JPG, MP4, MOV, WEBM up to 50MB
                    </span>

                    <input
                      type="file"
                      accept="image/*,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.mkv"
                      className="hidden"
                      onChange={handleAssetChange}
                    />
                  </label>
                )}

                {assetPreview && (
                  <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
                    <UploadCloud size={16} />
                    Replace asset
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.mkv"
                      className="hidden"
                      onChange={handleAssetChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="campaign-form"
            disabled={!formData.title.trim() || isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? "Save Changes" : "Create Campaign"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
