"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type FilterTab = "All" | "Artikel" | "Infografis";

interface PublicationItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  category: string;
  status: string | null;
  authorId: string | null;
  divisionId: number | null;
  programId: number | null;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    roleId: number;
    divisionId: number | null;
    createdAt: Date | null;
    status: string | null;
  } | null;
}

export default function PublicationFeed({
  initialData,
}: {
  initialData: PublicationItem[];
}) {
  const [filter, setFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState("");

  const filteredData = initialData.filter((item) => {
    const matchesCategory = filter === "All" ? true : item.category === filter;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="relative">
          <div className="absolute -left-6 top-1 w-1 h-12 bg-orange-500 rounded-full"></div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Research <span className="text-orange-600">&</span> Insights
          </h1>
          <p className="text-gray-600 max-w-lg text-lg leading-relaxed">
            Eksplorasi data dan pemikiran terbaru dari Pojok Statistik Telkom
            University Surabaya.
          </p>
        </div>

        {/* GLASS FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto p-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-lg shadow-gray-200/50">
          {/* Search Bar */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari topik..."
              className="pl-10 pr-4 py-2.5 bg-white/50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 w-full sm:w-64 transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px bg-gray-300/50 my-1"></div>

          {/* Filter Tabs */}
          <div className="flex gap-1">
            {["All", "Artikel", "Infografis"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as FilterTab)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300",
                  filter === tab
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-gray-200/50"
                    : "text-gray-500 hover:bg-white/30 hover:text-gray-700",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GLASS CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredData.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              key={item.id}
              className="group relative flex flex-col h-full"
            >
              {/* Card Container */}
              <div className="h-full bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2">
                {/* Image Section */}
                <div className="h-56 relative overflow-hidden">
                  {/* Gradient Overlay hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 duration-500"></div>

                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                      {item.category === "Infografis" ? (
                        <ImageIcon size={48} className="text-gray-400/50" />
                      ) : (
                        <FileText size={48} className="text-gray-400/50" />
                      )}
                    </div>
                  )}

                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border border-white/20 shadow-lg",
                        item.category === "Infografis"
                          ? "bg-purple-500/80 text-white"
                          : "bg-orange-500/80 text-white",
                      )}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Body Section */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
                      <Calendar size={14} className="text-orange-500" />
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" },
                          )
                        : "Baru saja"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-md">
                      <User size={14} className="text-orange-500" />
                      {item.author?.name || "Tim Riset"}
                    </span>
                  </div>

                  <Link
                    href={`/publications/${item.slug}`}
                    className="block group-hover:text-orange-600 transition-colors duration-300"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {item.excerpt ||
                      "Tidak ada deskripsi singkat untuk konten ini."}
                  </p>

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-gray-100/50 flex items-center justify-between">
                    <Link
                      href={`/publications/${item.slug}`}
                      className="text-sm font-bold text-gray-900 flex items-center gap-2 group/link"
                    >
                      Baca Selengkapnya
                      <ArrowRight
                        size={16}
                        className="text-orange-500 transform group-hover/link:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Konten tidak ditemukan
            </h3>
            <p className="text-gray-500 text-sm">
              Coba gunakan kata kunci lain atau ubah filter kategori.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
