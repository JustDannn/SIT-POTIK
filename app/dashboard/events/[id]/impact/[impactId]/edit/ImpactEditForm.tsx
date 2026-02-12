"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  X,
  FileText,
  Loader2,
  UploadCloud,
  Upload,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateImpactStory } from "../../../../actions";
import RichTextEditor from "@/components/RichTextEditor";
import { cn } from "@/lib/utils";

type Impact = {
  id: number;
  title: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  fileUrl: string | null;
};

export default function ImpactEditForm({
  eventId,
  eventTitle,
  impact,
}: {
  eventId: number;
  eventTitle: string;
  impact: Impact;
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
          thumbnailUrl = null;
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
          fileUrl = null;
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-20">
      {/* --- STICKY HEADER --- */}
      <div className="sticky -top-8 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 -mx-4 px-4 pt-8 pb-4 md:-mx-8 md:px-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Edit Impact Story
            </h1>
            <p className="text-xs text-gray-500">Perbarui tulisanmu.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="hidden md:flex px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 items-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold mb-6 max-w-6xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* --- MAIN EDITOR COLUMN --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Input */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm group focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            <input
              required
              placeholder="Judul Impact Story yang Menarik..."
              className="w-full text-3xl font-extrabold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-125 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
            <div className="p-6 flex-1">
              <RichTextEditor
                content={content}
                onChange={(html) => setContent(html)}
              />
            </div>
          </div>
        </div>

        {/* --- SIDEBAR SETTINGS --- */}
        <div className="space-y-6">
          {/* Event Info Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <label className="text-sm font-bold text-gray-900 mb-3 block">
              Terhubung ke Event
            </label>
            <div className="p-3 rounded-xl border-2 border-indigo-500 bg-indigo-50">
              <span className="font-bold text-sm text-indigo-700 line-clamp-2">
                {eventTitle}
              </span>
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
                    <p className="text-[10px] text-gray-400">
                      JPG/PNG/WebP Max 5MB
                    </p>
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
          </div>

          {/* Attachment File Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <label className="text-sm font-bold text-gray-900 mb-3 block">
              <span className="flex items-center gap-2">
                <FileText size={14} />
                File Dokumentasi
              </span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Opsional — PDF, Docs, atau file pendukung.
            </p>

            {attachmentFile ? (
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {attachmentFile.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(attachmentFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <X size={14} className="text-red-500" />
                </button>
              </div>
            ) : existingFileUrl && !attachmentChanged ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-green-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">
                      File tersedia
                    </p>
                    <a
                      href={existingFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      Lihat file
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors cursor-pointer">
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
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                <Upload size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500">
                  Upload File
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
        </div>
      </div>
    </form>
  );
}
