"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateImpactStory } from "../../../../actions";

export default function ImpactEditForm({
  eventId,
  eventTitle,
  impact,
}: {
  eventId: number;
  eventTitle: string;
  impact: any;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(impact.title || "");
  const [content, setContent] = useState(impact.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    impact.thumbnailUrl || null,
  );
  const [thumbnailChanged, setThumbnailChanged] = useState(false);

  // Attachment file
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [existingFileUrl] = useState<string | null>(impact.fileUrl || null);
  const [attachmentChanged, setAttachmentChanged] = useState(false);

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailChanged(true);
  }

  function removeThumbnail() {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbnailChanged(true);
  }

  function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentFile(file);
    setAttachmentChanged(true);
  }

  function removeAttachment() {
    setAttachmentFile(null);
    setAttachmentChanged(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let thumbnailUrl: string | null = impact.thumbnailUrl || null;
      let fileUrl: string | null = impact.fileUrl || null;

      // 1. Upload new thumbnail if changed
      if (thumbnailChanged) {
        if (thumbnailFile) {
          const fileName = `impact-thumb-${Date.now()}-${thumbnailFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
          const { error: uploadErr } = await supabase.storage
            .from("publications")
            .upload(fileName, thumbnailFile);
          if (uploadErr)
            throw new Error("Gagal upload thumbnail: " + uploadErr.message);

          const res = supabase.storage
            .from("publications")
            .getPublicUrl(fileName);
          thumbnailUrl = res.data.publicUrl;
        } else {
          thumbnailUrl = null; // Removed
        }
      }

      // 2. Upload new attachment if changed
      if (attachmentChanged) {
        if (attachmentFile) {
          const fileName = `impact-file-${Date.now()}-${attachmentFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
          const { error: uploadErr } = await supabase.storage
            .from("publications")
            .upload(fileName, attachmentFile);
          if (uploadErr)
            throw new Error("Gagal upload file: " + uploadErr.message);

          const res = supabase.storage
            .from("publications")
            .getPublicUrl(fileName);
          fileUrl = res.data.publicUrl;
        } else {
          fileUrl = null; // Removed
        }
      }

      // 3. Update via server action
      const formData = new FormData();
      formData.set("title", title);
      formData.set("content", content);
      formData.set("thumbnailUrl", thumbnailUrl || "");
      formData.set("fileUrl", fileUrl || "");

      const result = await updateImpactStory(impact.id, eventId, formData);

      if (result.error) {
        throw new Error(result.error);
      }

      router.push(`/dashboard/events/${eventId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Back link */}
      <Link
        href={`/dashboard/events/${eventId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke {eventTitle}</span>
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Edit Impact Story
        </h1>
        <p className="text-gray-500">
          Perbarui konten impact story ini. Perubahan akan langsung tampil di
          halaman publik.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Thumbnail Upload */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <span className="flex items-center gap-2">
              <ImageIcon size={16} />
              Foto Thumbnail
            </span>
          </label>

          {thumbnailPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-64 object-cover"
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              >
                <X size={16} className="text-red-500" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-52 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
              <Upload size={32} className="text-gray-400 mb-3" />
              <span className="text-sm font-bold text-gray-600">
                Klik untuk upload gambar
              </span>
              <span className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP — maks 5MB
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Judul <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Workshop Visualisasi Data dengan Python"
            className="w-full px-4 py-3 text-lg border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-semibold"
            required
          />
        </div>

        {/* Content Body */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Konten / Cerita
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ceritakan kegiatan, dampak, dan output yang dihasilkan dari event ini..."
            rows={16}
            className="w-full px-4 py-3 text-sm leading-relaxed border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y min-h-48"
          />
          <p className="text-xs text-gray-400 mt-2">
            Teks akan ditampilkan apa adanya di halaman publik.
          </p>
        </div>

        {/* Attachment File Upload */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            <span className="flex items-center gap-2">
              <FileText size={16} />
              File Dokumentasi (opsional)
            </span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Upload file PDF, dokumen, atau file pendukung lainnya.
          </p>

          {attachmentFile ? (
            <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={20} className="text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {attachmentFile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(attachmentFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X size={16} className="text-red-500" />
              </button>
            </div>
          ) : existingFileUrl && !attachmentChanged ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={20} className="text-green-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    File tersedia
                  </p>
                  <a
                    href={existingFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Lihat file saat ini
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors cursor-pointer">
                  Ganti
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={handleAttachmentChange}
                  />
                </label>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1.5 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-3 h-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-600">
                Klik untuk upload file
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={handleAttachmentChange}
              />
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
