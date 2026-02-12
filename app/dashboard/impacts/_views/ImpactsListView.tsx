"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PenTool,
  Search,
  Globe,
  FileText,
  Calendar,
  Image as ImageIcon,
  Edit,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
];

export default function ImpactsListView({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredData = data.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: data.length,
    draft: data.filter((i) => i.status === "draft").length,
    review: data.filter((i) => i.status === "review").length,
    published: data.filter((i) => i.status === "published").length,
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impact Stories</h1>
          <p className="text-gray-500 mt-1">
            Cerita dampak dari setiap kegiatan divisi.
          </p>
        </div>
        <Link
          href="/dashboard/impacts/create"
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 text-sm font-bold transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
        >
          <PenTool size={18} />
          Tulis Impact Story
        </Link>
      </div>

      {/* TABS + SEARCH */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  activeTab === tab.value
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-200 text-gray-500",
                )}
              >
                {counts[tab.value as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari judul cerita..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* GALLERY GRID */}
      {filteredData.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Zap className="text-gray-300" size={32} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">
            Belum ada cerita impact
          </h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            Tulis impact story untuk mendokumentasikan dampak kegiatan divisi.
          </p>
          <Link
            href="/dashboard/impacts/create"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            <PenTool size={14} />
            Tulis Impact Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Thumbnail Image */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {item.thumbnailUrl || item.fileUrl ? (
                  <img
                    src={item.thumbnailUrl || item.fileUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-linear-to-br from-indigo-50 to-pink-50">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs font-medium">No Cover Image</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md shadow-sm border",
                      item.status === "published"
                        ? "bg-green-500/90 text-white border-green-400"
                        : item.status === "review"
                          ? "bg-orange-500/90 text-white border-orange-400"
                          : "bg-gray-500/90 text-white border-gray-400",
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4 flex-1">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={14} />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.content
                      ?.replace(/<[^>]*>/g, "")
                      .replace(/[#*`]/g, "")
                      .slice(0, 150) || "Tidak ada preview konten."}
                  </p>
                </div>

                {/* Footer Author & Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                      {item.author?.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-xs font-medium text-gray-600 truncate max-w-25">
                      {item.author?.name}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {item.status === "published" && (
                      <a
                        href={`/impact/${item.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Lihat di Web"
                      >
                        <Globe size={16} />
                      </a>
                    )}
                    <Link
                      href={
                        item.programId
                          ? `/dashboard/events/${item.programId}/impact/${item.id}/edit`
                          : `/dashboard/impacts/${item.id}/edit`
                      }
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit Story"
                    >
                      <Edit size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
