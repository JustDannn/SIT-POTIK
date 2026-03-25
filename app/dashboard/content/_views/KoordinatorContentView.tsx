"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Megaphone,
  Image as ImageIcon,
  Plus,
  Eye,
  Edit2,
  Filter,
  ChevronDown, // Tambahan icon buat panah dropdown
  CheckCircle2, // Icon success
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateContentStatus } from "../actions";

interface ContentItem {
  id: number;
  category: string;
  status: "published" | "draft" | "review" | string;
  slug: string;
  title: string;
  authorName?: string | null;
  createdAt: string | Date;
}

export default function KoordinatorContentView({
  data,
}: {
  data: ContentItem[];
}) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State untuk nyimpen ID card mana yang dropdown-nya lagi kebuka
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const categories = ["all", "Artikel", "Press Release", "Dokumentasi"];
  const statuses = [
    { value: "all", label: "Semua Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "review", label: "Review" },
  ];

  const filteredData = data.filter((item) => {
    const matchCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchCategory && matchStatus;
  });

  // Fungsi buat nutup dropdown kalau diklik di luar area (opsional tapi bagus buat UX)
  // Bisa digabung sama event listener, atau untuk gampangnya:
  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  // Fungsi handler saat status dipilih
  const handleStatusChange = async (itemId: number, newStatus: string) => {
    // Tutup dropdown seketika biar UI kerasa responsif
    setOpenDropdownId(null);

    try {
      // Tembak ke database
      const res = await updateContentStatus(itemId, newStatus);

      if (res.success) {
        // Kalau sukses, suruh Next.js fetch ulang data terbaru
        router.refresh();
      } else {
        alert(res.error || "Gagal mengubah status");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* (Opsional) Overlay transparan buat nutup dropdown kalo user ngeklik di luar card */}
      {openDropdownId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdownId(null)}
        />
      )}

      {/* HEADER & ACTION */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 relative z-20">
        {/* ... (Header tetap sama) ... */}
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

      {/* FILTER BAR COMBINED */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 relative z-20">
        {/* ... (Filter bar tetap sama) ... */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border",
                categoryFilter === c
                  ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              {c === "all" ? "Semua Kategori" : c}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-gray-700 font-bold focus:ring-0"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      {filteredData.length === 0 ? (
        // ... (Empty state tetap sama) ...
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl animate-in fade-in duration-300 relative z-20">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileText className="text-gray-300" size={32} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">Belum ada konten</h3>
          <p className="text-gray-500 text-sm mt-1">
            Mulai menulis cerita seru atau ubah filter pencarian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
            >
              {/* === BAGEAN YANG DIROMBAK: TOP STATUS & CATEGORY === */}
              <div className="flex justify-between items-start mb-4 relative z-20">
                {/* Status Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-pointer hover:opacity-80 transition-opacity",
                      item.status === "published"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : item.status === "review"
                          ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                          : "bg-gray-50 text-gray-500 border-gray-100",
                    )}
                  >
                    {item.status}
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform",
                        openDropdownId === item.id && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdownId === item.id && (
                    <div className="absolute top-full left-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex flex-col py-1">
                        <button
                          onClick={() => handleStatusChange(item.id, "draft")}
                          className="px-4 py-2 text-left text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          DRAFT{" "}
                          {item.status === "draft" && (
                            <CheckCircle2 size={14} className="text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, "review")}
                          className="px-4 py-2 text-left text-xs font-bold text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center justify-between"
                        >
                          REVIEW{" "}
                          {item.status === "review" && (
                            <CheckCircle2
                              size={14}
                              className="text-yellow-500"
                            />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(item.id, "published")
                          }
                          className="px-4 py-2 text-left text-xs font-bold text-green-600 hover:bg-green-50 transition-colors flex items-center justify-between"
                        >
                          PUBLISH{" "}
                          {item.status === "published" && (
                            <CheckCircle2
                              size={14}
                              className="text-green-500"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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

              {/* ... (Icon & Title, dan footer tetap sama) ... */}
              <div className="flex-1 relative z-10">
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
                      {item.authorName?.charAt(0) || "A"}
                    </div>
                    {item.authorName?.split(" ")[0] || "Author"}
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
