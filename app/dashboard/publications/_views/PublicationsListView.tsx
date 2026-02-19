"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deletePublication } from "../actions";

const Toast = ({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-5 right-5 z-100 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 bg-white",
        type === "success"
          ? "border-green-200 text-green-700"
          : "border-red-200 text-red-700",
      )}
    >
      {type === "success" ? (
        <CheckCircle2 size={20} className="text-green-500" />
      ) : (
        <XCircle size={20} className="text-red-500" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

const statusBadge = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-50 text-green-700 border-green-200";
    case "review":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "done":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-gray-50 text-gray-500 border-gray-200";
  }
};

export default function PublicationsListView({
  initialData,
}: {
  initialData: any[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "gallery">("list");

  // State untuk Modal & Loading
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Notification
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Extract unique categories
  const categories = [
    "All",
    ...Array.from(new Set(initialData.map((i) => i.category))),
  ];

  // Filter Logic
  const filteredData = initialData.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filter === "All" ? true : item.category === filter;
    return matchSearch && matchCategory;
  });

  // 1. Trigger Modal Konfirmasi
  const requestDelete = (id: number) => {
    setItemToDelete(id);
  };

  // 2. Eksekusi Hapus
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deletePublication(itemToDelete);

      if (res.success) {
        setNotification({
          type: "success",
          message: "Publikasi berhasil dihapus.",
        });
      } else {
        setNotification({ type: "error", message: "Gagal menghapus data." });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Terjadi kesalahan sistem." });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-end">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari judul publikasi..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* TYPE TOGGLE BUTTONS */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  filter === cat
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {cat === "All" ? "Semua" : cat}
              </button>
            ))}
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "list"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-400 hover:text-gray-600",
              )}
              title="Tampilan List"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "gallery"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-400 hover:text-gray-600",
              )}
              title="Tampilan Gallery"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <Link
            href="/dashboard/publications/create"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Buat Baru
          </Link>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredData.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium">Belum ada publikasi</h3>
          <p className="text-gray-500 text-sm mt-1">
            Buat publikasi baru untuk menampilkannya di sini.
          </p>
        </div>
      )}

      {/* === LIST VIEW === */}
      {filteredData.length > 0 && viewMode === "list" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Judul Konten</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                          item.category === "Infografis"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : "bg-blue-50 text-blue-600 border-blue-100",
                        )}
                      >
                        {item.category === "Infografis" ? (
                          <ImageIcon size={18} />
                        ) : (
                          <FileText size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Oleh: {item.author?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        statusBadge(item.status),
                      )}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status === "published" && (
                        <Link
                          href={`/publications/${item.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Lihat di Web"
                        >
                          <Eye size={16} />
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/publications/${item.id}/edit`}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => requestDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === GALLERY VIEW === */}
      {filteredData.length > 0 && viewMode === "gallery" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {item.category === "Infografis" ? (
                      <ImageIcon size={48} className="text-gray-300" />
                    ) : (
                      <FileText size={48} className="text-gray-300" />
                    )}
                  </div>
                )}

                {/* Status Badge Overlay */}
                <span
                  className={cn(
                    "absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm",
                    statusBadge(item.status),
                  )}
                >
                  {item.status}
                </span>

                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.status === "published" && (
                    <Link
                      href={`/publications/${item.slug}`}
                      target="_blank"
                      className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-blue-600 rounded-lg shadow-sm"
                    >
                      <Eye size={14} />
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/publications/${item.id}/edit`}
                    className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-orange-600 rounded-lg shadow-sm"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => requestDelete(item.id)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 rounded-lg shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                    {item.author?.name?.charAt(0) || "?"}
                  </div>
                  <span>{item.author?.name?.split(" ")[0] || "Unknown"}</span>
                  <span className="text-gray-300">&middot;</span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Hapus Publikasi?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak
                dapat dibatalkan.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Hapus...
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
