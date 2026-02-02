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
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Layout,
  Type,
} from "lucide-react";
import Link from "next/link";
import { createContent, updateContent } from "../actions";
import { cn } from "@/lib/utils";

export default function PublicationForm({
  user,
  initialData = null,
}: {
  user: any;
  initialData?: any;
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!initialData;

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Artikel",
    content: initialData?.content || "",
    fileUrl: initialData?.fileUrl || "",
    slug: initialData?.slug || "",
  });

  // State Image Upload
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.fileUrl || null,
  );

  // Auto-Generate Slug (Client Side Visual Only)
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
      let fileUrl = formData.fileUrl;

      if (thumbnailFile) {
        const fileName = `pub-${Date.now()}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const { error: uploadError } = await supabase.storage
          .from("publications")
          .upload(fileName, thumbnailFile);

        if (uploadError) throw uploadError;

        const res = supabase.storage
          .from("publications")
          .getPublicUrl(fileName);

        fileUrl = res.data.publicUrl;
      }

      // Prepare FormData
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("category", formData.category);
      submitData.append("content", formData.content);
      submitData.append("fileUrl", fileUrl || "");

      if (isEditing) {
        await updateContent(initialData.id, submitData);
      } else {
        await createContent(submitData);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan konten. Cek console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-20">
      {/* --- HEADER --- */}
      <div className="sticky -top-8 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 -mx-4 px-4 pt-8 pb-4 md:-mx-8 md:px-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/content"
            className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? "Edit Konten" : "Tulis Konten Baru"}
            </h1>
            <p className="text-xs text-gray-500">
              {isEditing
                ? "Perbarui tulisanmu."
                : "Bagikan ceritamu ke publik."}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/content"
            className="hidden md:flex px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 items-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isEditing ? "Simpan Perubahan" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* --- MAIN EDITOR COLUMN --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm group focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            <input
              required
              placeholder="Judul Artikel yang Menarik..."
              className="w-full text-3xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">
                slug:
              </span>
              <span className="font-mono text-gray-500 truncate">
                {formData.slug || "..."}
              </span>
            </div>
          </div>

          {/* WYSIWYG EDITOR (SIMULATED) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-125 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap sticky top-0 z-10">
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                  title="Link"
                >
                  <LinkIcon size={16} />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                  title="Heading"
                >
                  <Type size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                >
                  <ImageIcon size={16} />
                </button>
              </div>
              <div className="ml-auto text-xs font-bold text-gray-400 px-2">
                Markdown Supported
              </div>
            </div>

            {/* Text Area */}
            <textarea
              required
              className="flex-1 w-full p-6 outline-none border-none resize-none font-serif text-lg text-gray-800 leading-relaxed placeholder:text-gray-300"
              placeholder="Mulai menulis ceritamu di sini..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            ></textarea>
          </div>
        </div>

        {/* --- SIDEBAR SETTINGS --- */}
        <div className="space-y-6">
          {/* Category Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <label className="text-sm font-bold text-gray-900 mb-3 block">
              Kategori
            </label>
            <div className="space-y-2">
              {["Artikel", "Press Release", "Dokumentasi"].map((cat) => (
                <label
                  key={cat}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    formData.category === cat
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200",
                  )}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={formData.category === cat}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span
                    className={cn(
                      "font-bold text-sm",
                      formData.category === cat
                        ? "text-indigo-700"
                        : "text-gray-600",
                    )}
                  >
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Thumbnail Upload Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <label className="text-sm font-bold text-gray-900 mb-3 block">
              Cover Image
            </label>

            <div className="relative group">
              <div
                onClick={() => document.getElementById("thumbInput")?.click()}
                className={cn(
                  "aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative",
                  thumbnailPreview
                    ? "border-indigo-200"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50",
                )}
              >
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-xs text-gray-500 font-bold">
                      Upload Gambar
                    </p>
                    <p className="text-[10px] text-gray-400">JPG/PNG Max 2MB</p>
                  </div>
                )}

                {/* Hover Overlay */}
                {thumbnailPreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm gap-2">
                    <ImageIcon size={16} /> Ganti
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

            {/* Or URL Input */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                Atau via Link
              </label>
              <input
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.fileUrl}
                onChange={(e) => {
                  setFormData({ ...formData, fileUrl: e.target.value });
                  setThumbnailPreview(e.target.value); // Preview link
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
