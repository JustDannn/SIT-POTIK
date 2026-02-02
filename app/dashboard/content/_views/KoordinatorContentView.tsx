"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Megaphone,
  Image as ImageIcon,
  Plus,
  Calendar,
  Eye,
  Edit2,
  MoreVertical,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function KoordinatorContentView({ data }: { data: any[] }) {
  const [filter, setFilter] = useState("all"); // all, published, draft

  // Simple client-side filter
  const filteredData =
    filter === "all" ? data : data.filter((d) => d.status === filter);

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER & ACTION */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dapur Redaksi
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Kelola artikel, berita, dan dokumentasi visual.
          </p>
        </div>
        <Link
          href="/dashboard/content/create"
          className="group flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform"
          />
          <span>Tulis Baru</span>
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "published", "draft", "review"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all border",
              filter === f
                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            {f === "all" ? "Semua Konten" : f}
          </button>
        ))}
      </div>

      {/* CONTENT GRID */}
      {filteredData.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileText className="text-gray-300" size={32} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">Belum ada konten</h3>
          <p className="text-gray-500 text-sm">
            Mulai menulis cerita seru hari ini!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
            >
              {/* Top Status & Category */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                    item.status === "published"
                      ? "bg-green-50 text-green-600 border-green-100"
                      : item.status === "review"
                        ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                        : "bg-gray-50 text-gray-500 border-gray-100",
                  )}
                >
                  {item.status}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.status === "published" && (
                    <Link
                      href={`/updates/${item.slug}`}
                      target="_blank"
                      className="p-2 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/content/${item.id}/edit`}
                    className="p-2 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </Link>
                </div>
              </div>

              {/* Icon & Title */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-300",
                      item.category === "Artikel"
                        ? "bg-indigo-500"
                        : item.category === "Press Release"
                          ? "bg-pink-500"
                          : "bg-orange-500",
                    )}
                  >
                    {item.category === "Artikel" && <FileText size={18} />}
                    {item.category === "Press Release" && (
                      <Megaphone size={18} />
                    )}
                    {item.category === "Dokumentasi" && <ImageIcon size={18} />}
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                      {item.authorName?.charAt(0)}
                    </div>
                    {item.authorName?.split(" ")[0]}
                  </div>
                  <span>•</span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>

              {/* Decorative Background Blob */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full blur-2xl group-hover:bg-indigo-50 transition-colors duration-500 z-0 pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
