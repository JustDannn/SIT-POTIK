"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Edit3,
  Copy,
  Check,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  ImageIcon,
} from "lucide-react";
import { Campaign } from "./CampaignModal";
import { cn } from "@/lib/utils";

interface CampaignPreviewModalProps {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onEdit: (campaign: Campaign) => void;
}

const PLATFORM_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
  }
> = {
  instagram: {
    label: "Instagram",
    icon: Instagram,
    bgColor: "#9333ea", // Purple
    textColor: "#ffffff",
  },
  tiktok: {
    label: "TikTok",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
    bgColor: "#000000", // Black
    textColor: "#ffffff",
  },
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    bgColor: "#0284c7", // Blue
    textColor: "#ffffff",
  },
  website: {
    label: "Website",
    icon: Globe,
    bgColor: "#7c3aed", // Violet
    textColor: "#ffffff",
  },
  twitter: {
    label: "Twitter/X",
    icon: Twitter,
    bgColor: "#0284c7", // Sky/Blue
    textColor: "#ffffff",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    bgColor: "#dc2626", // Red
    textColor: "#ffffff",
  },
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  draft: {
    label: "Draft",
    dotColor: "#6b7280",
    bgColor: "#f3f4f6",
    textColor: "#111827",
    borderColor: "#d1d5db",
  },
  scheduled: {
    label: "Scheduled",
    dotColor: "#d97706",
    bgColor: "#fef3c7",
    textColor: "#78350f", // Dark Amber
    borderColor: "#fcd34d",
  },
  published: {
    label: "Published",
    dotColor: "#059669",
    bgColor: "#d1fae5",
    textColor: "#064e3b", // Dark Green
    borderColor: "#6ee7b7",
  },
  archived: {
    label: "Archived",
    dotColor: "#64748b",
    bgColor: "#f1f5f9",
    textColor: "#0f172a", // Dark Slate
    borderColor: "#cbd5e1",
  },
};

function isVideoUrl(url: string | null) {
  if (!url) return false;
  return /\.(mp4|mov|webm|mkv)(?:[?#].*)?$/i.test(url);
}

export default function CampaignPreviewModal({
  open,
  campaign,
  onClose,
  onEdit,
}: CampaignPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !campaign) return null;

  const platformInfo =
    PLATFORM_CONFIG[campaign.platform] || PLATFORM_CONFIG.website;
  const PlatformIcon = platformInfo.icon;

  const statusKey = campaign.status || "draft";
  const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft;

  const isVideo = isVideoUrl(campaign.assetUrl);

  const handleCopyCaption = () => {
    if (!campaign.caption) return;
    navigator.clipboard.writeText(campaign.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetDate = campaign.scheduledDate || campaign.publishedDate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white/80 backdrop-blur-xs sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Campaign Preview
            </span>
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-gray-900">
          {/* Visual Asset Container */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-950 shadow-inner">
            {campaign.assetUrl ? (
              isVideo ? (
                <div className="relative aspect-video w-full flex items-center justify-center bg-black">
                  <video
                    src={campaign.assetUrl}
                    controls
                    playsInline
                    className="aspect-video w-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative aspect-video w-full flex items-center justify-center bg-black/95">
                  <Image
                    src={campaign.assetUrl}
                    alt={campaign.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 700px"
                    priority
                  />
                </div>
              )
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center bg-linear-to-br from-violet-50 via-purple-50 to-pink-50 p-8 text-center">
                <div className="mb-3 rounded-2xl bg-white/80 p-4 shadow-sm text-violet-600">
                  <ImageIcon size={32} />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  No visual asset attached
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You can upload an image or video by editing this campaign
                </p>
              </div>
            )}
          </div>

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Platform Badge */}
            <div
              style={{
                backgroundColor: platformInfo.bgColor,
                color: platformInfo.textColor,
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide shadow-xs"
            >
              <PlatformIcon size={14} style={{ color: platformInfo.textColor }} />
              <span style={{ color: platformInfo.textColor }} className="font-bold">
                {platformInfo.label}
              </span>
            </div>

            {/* Status Badge */}
            <div
              style={{
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.textColor,
                borderColor: statusInfo.borderColor,
                borderWidth: "1px",
                borderStyle: "solid",
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide"
            >
              <span
                style={{ backgroundColor: statusInfo.dotColor }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  statusKey === "scheduled" && "animate-pulse",
                )}
              />
              <span
                style={{ color: statusInfo.textColor }}
                className="font-bold"
              >
                {statusInfo.label}
              </span>
            </div>

            {/* PIC Badge */}
            {campaign.pic?.name && (
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#1f2937",
                  borderColor: "#e5e7eb",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold ml-auto"
              >
                <User size={13} style={{ color: "#6b7280" }} />
                <span style={{ color: "#1f2937" }}>PIC: {campaign.pic.name}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {campaign.title}
            </h2>

            {/* Date & Time */}
            {targetDate && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={15} className="text-violet-600" />
                  <span>
                    {new Date(targetDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-violet-600" />
                  <span>
                    {new Date(targetDate).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Caption Box */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Caption / Content
              </span>

              {campaign.caption && (
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {campaign.caption ? (
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {campaign.caption}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No caption has been written for this campaign.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(campaign);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-colors hover:bg-violet-700"
          >
            <Edit3 size={16} />
            <span>Edit Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
}
