"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Calendar,
  ArrowRight,
  Zap,
  Target,
  Users,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImpactItem {
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
  createdAt: string | undefined;
  updatedAt: string | undefined;
  publishedAt: string | undefined;
  author: { name: string; image: string | null } | null;
}

export default function ImpactFeed({
  initialData,
}: {
  initialData: ImpactItem[];
}) {
  const [search, setSearch] = useState("");

  const filteredData = initialData.filter((item) => {
    return item.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 relative min-h-screen">
      {/* HEADER & CONTROLS */}
      <div className=" flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Our Journey
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            Impact{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-pink-500">
              & Stories
            </span>
          </h1>
          <p className="text-gray-600 max-w-xl text-lg leading-relaxed">
            Dokumentasi kegiatan, pelatihan, dan kontribusi nyata Pojok
            Statistik untuk meningkatkan literasi data mahasiswa.
          </p>
        </div>

        {/* GLASS SEARCH BAR */}
        <div className="w-full md:w-auto p-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-lg shadow-indigo-100/50">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari event atau kegiatan..."
              className="pl-10 pr-4 py-3 bg-white/50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-200 w-full md:w-80 transition-all placeholder:text-gray-400 text-gray-800"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* GLASS CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredData.map((item, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              key={item.id}
              className="group h-full"
            >
              {/* Card Container */}
              <div className="h-full bg-white/70 backdrop-blur-md border border-white/60 rounded-4xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                {/* Image Section */}
                <div className="h-60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-60 z-10"></div>

                  {item.thumbnailUrl || item.fileUrl ? (
                    <Image
                      src={item.thumbnailUrl ?? item.fileUrl ?? ""}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-50 to-pink-50">
                      <Zap size={48} className="text-indigo-300" />
                    </div>
                  )}

                  {/* Badge Category (Pojok Kiri Atas) */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest backdrop-blur-md bg-white/20 border border-white/30 text-white shadow-lg">
                      {item.category || "Event"}
                    </span>
                  </div>
                </div>

                {/* Body Section */}
                <div className="p-7 flex flex-col flex-1">
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-lg">
                      <Calendar size={12} />
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                    {/* Kalau ada lokasi (misal kita simpan di content/meta) bisa ditaruh sini */}
                    <span className="flex items-center gap-1.5 bg-pink-50 text-pink-600 px-2.5 py-1.5 rounded-lg">
                      <Users size={12} />
                      {item.author?.name || "Tim Edukasi"}
                    </span>
                  </div>

                  <Link
                    href={`/impact/${item.slug}`}
                    className="block group-hover:text-indigo-600 transition-colors duration-300"
                  >
                    <h3 className="text-xl font-extrabold text-gray-900 mb-3 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {/* Hilangkan karakter markdown biar bersih */}
                    {item.content?.replace(/[#*`]/g, "") ||
                      "Lihat dokumentasi lengkap kegiatan ini..."}
                  </p>

                  {/* Action Footer */}
                  <div className="pt-5 border-t border-indigo-50 flex items-center justify-between">
                    <Link
                      href={`/impact/${item.slug}`} // Pastikan route detailnya ada
                      className="text-sm font-bold text-gray-900 flex items-center gap-2 group/link"
                    >
                      Lihat Dokumentasi
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center group-hover/link:bg-indigo-600 transition-colors">
                        <ArrowRight
                          size={12}
                          className="text-indigo-600 group-hover/link:text-white transition-colors"
                        />
                      </div>
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
          <div className="bg-white/40 backdrop-blur-md rounded-4xl border border-dashed border-gray-300 p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Belum ada impact story
            </h3>
            <p className="text-gray-500">
              Kami sedang menyiapkan kegiatan seru lainnya. Stay tuned!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
