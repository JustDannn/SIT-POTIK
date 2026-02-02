"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { createPublication, updatePublication } from "../actions";
import { cn } from "@/lib/utils";

// --- KOMPONEN TOAST ---
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

export default function PublicationFormView({
  divisionId,
  userId,
  initialData = null,
}: {
  divisionId: number;
  userId: string;
  initialData?: any;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!initialData;

  // State Form
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    category: initialData?.category || "Artikel",
    status: initialData?.status || "draft",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
  });

  // State Notifikasi
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // State File Upload
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnailUrl || null,
  );
  const [docFile, setDocFile] = useState<File | null>(null);

  // Auto-Generate Slug
  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = initialData?.thumbnailUrl || null;
      let fileUrl = initialData?.fileUrl || null;

      // 1. Upload Thumbnail
      if (thumbnailFile) {
        const fileName = `thumb-${Date.now()}-${thumbnailFile.name}`;
        const { error } = await supabase.storage
          .from("publications")
          .upload(fileName, thumbnailFile);

        if (error) throw error;
        const res = supabase.storage
          .from("publications")
          .getPublicUrl(fileName);
        thumbnailUrl = res.data.publicUrl;
      }

      // 2. Upload Dokumen PDF
      if (docFile && formData.category === "Paper") {
        const fileName = `doc-${Date.now()}-${docFile.name}`;
        const { error } = await supabase.storage
          .from("publications")
          .upload(fileName, docFile);

        if (error) throw error;
        const res = supabase.storage
          .from("publications")
          .getPublicUrl(fileName);
        fileUrl = res.data.publicUrl;
      }

      // 3. Simpan ke Database
      let res;
      if (isEditing) {
        res = await updatePublication(initialData.id, {
          ...formData,
          thumbnailUrl,
          fileUrl,
        });
      } else {
        res = await createPublication({
          ...formData,
          thumbnailUrl,
          fileUrl,
          divisionId,
          authorId: userId,
        });
      }

      if (!res.success) throw new Error(res.error);

      // SUCCESS FEEDBACK
      setNotification({
        type: "success",
        message: isEditing
          ? "Perubahan berhasil disimpan!"
          : "Publikasi berhasil dibuat!",
      });

      // Kasih delay dikit biar notif kebaca sebelum pindah halaman
      setTimeout(() => {
        router.push("/dashboard/publications");
        router.refresh();
      }, 1000);
    } catch (error: any) {
      // ERROR FEEDBACK
      setNotification({
        type: "error",
        message: error.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto space-y-8 pb-20 relative"
    >
      {/* RENDER TOAST */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/publications"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Publikasi" : "Buat Publikasi Baru"}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing
                ? "Perbarui konten yang sudah ada."
                : "Isi detail konten untuk website publik."}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: "draft" })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Simpan Draft
          </button>
          <button
            type="submit"
            onClick={() => setFormData({ ...formData, status: "published" })}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {isEditing ? "Simpan Perubahan" : "Publish Sekarang"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Publikasi
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Contoh: Analisis Inflasi Jawa Timur 2025"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                  <span>pojokstatistik.com/pub/</span>
                  <input
                    type="text"
                    className="bg-transparent border-none focus:ring-0 text-gray-900 w-full ml-1 p-0"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Artikel">Artikel</option>
                  <option value="Infografis">Infografis</option>
                  <option value="Paper">Paper / Jurnal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Singkat (Excerpt)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 h-20 text-sm"
                placeholder="Ringkasan singkat yang muncul di kartu preview..."
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Isi Konten Utama
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 h-96 font-mono text-sm"
                placeholder="Tulis artikel di sini (Support Markdown sederhana)..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
              <p className="text-xs text-gray-400 mt-2 text-right">
                Tip: Gunakan Markdown untuk formatting.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Thumbnail / Cover
            </label>

            <div className="relative group">
              <div
                className={cn(
                  "border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-400 transition-colors h-48 bg-gray-50 overflow-hidden",
                  thumbnailPreview && "border-solid border-gray-200 p-0",
                )}
                onClick={() => document.getElementById("thumbInput")?.click()}
              >
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-xs text-gray-500">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      JPG, PNG max 2MB
                    </p>
                  </>
                )}

                {/* Overlay Change */}
                {thumbnailPreview && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium flex items-center gap-1">
                      <UploadCloud size={14} /> Ganti Gambar
                    </p>
                  </div>
                )}
              </div>
              <input
                id="thumbInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailChange}
              />
            </div>
            {thumbnailPreview && (
              <button
                type="button"
                onClick={() => {
                  setThumbnailPreview(null);
                  setThumbnailFile(null);
                }}
                className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={12} /> Hapus Gambar
              </button>
            )}
          </div>

          {/* Paper Upload (Conditional) */}
          {formData.category === "Paper" && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File Dokumen
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                onChange={(e) =>
                  e.target.files && setDocFile(e.target.files[0])
                }
              />
              <p className="text-xs text-gray-400 mt-2">
                Format PDF disarankan.
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
