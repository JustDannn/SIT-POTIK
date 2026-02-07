"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  PenTool,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Sparkles,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteImpactStory } from "../../actions";

export default function EventImpact({
  eventId,
  divisionId,
  impacts: initialImpacts = [],
}: {
  eventId: number;
  divisionId: number;
  impacts: any[];
}) {
  const [impacts, setImpacts] = useState(initialImpacts);
  const [isPending, startTransition] = useTransition();

  function handleDelete(impactId: number) {
    if (!confirm("Hapus impact story ini?")) return;
    startTransition(async () => {
      const result = await deleteImpactStory(impactId, eventId);
      if (result.success) {
        setImpacts((prev) => prev.filter((i: any) => i.id !== impactId));
      }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-900">
            Impact & Output ({impacts.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Konten yang dipublikasikan akan tampil di halaman{" "}
            <Link
              href="/impact"
              target="_blank"
              className="text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              Impact & Stories <ExternalLink size={12} />
            </Link>
          </p>
        </div>
        <Link
          href={`/dashboard/events/${eventId}/impact/create`}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Tulis Impact Story</span>
        </Link>
      </div>

      {/* Content Grid */}
      {impacts.length === 0 ? (
        <div className="bg-linear-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl p-10 text-center">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-50">
            <PenTool size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Belum ada Impact Story
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Event ini belum memiliki publikasi impact. Buat cerita menarik
            tentang hasil kegiatan ini untuk ditampilkan di website publik.
          </p>
          <Link
            href={`/dashboard/events/${eventId}/impact/create`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Sparkles size={16} />
            <span>Tulis Impact Story Pertama</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {impacts.map((imp: any) => (
            <div
              key={imp.id}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Thumbnail */}
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {imp.thumbnailUrl || imp.fileUrl ? (
                  <img
                    src={imp.thumbnailUrl || imp.fileUrl}
                    alt={imp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-50 to-pink-50">
                    <ImageIcon size={36} className="text-indigo-300" />
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                    Impact
                  </span>
                  <span
                    className={cn(
                      "backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                      imp.status === "published"
                        ? "bg-green-500/90 text-white"
                        : "bg-yellow-500/90 text-white",
                    )}
                  >
                    {imp.status}
                  </span>
                </div>
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/dashboard/events/${eventId}/impact/${imp.id}/edit`}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} className="text-indigo-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(imp.id)}
                    disabled={isPending}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-red-50 cursor-pointer disabled:opacity-30 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h4 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                  {imp.title}
                </h4>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {imp.content?.replace(/[#*`]/g, "") || "Tidak ada deskripsi."}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    oleh {imp.authorName || "Unknown"} &middot;{" "}
                    {imp.createdAt
                      ? new Date(imp.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                  <Link
                    href={`/impact/${imp.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
