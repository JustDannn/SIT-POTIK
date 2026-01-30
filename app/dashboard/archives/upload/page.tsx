"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadArchive } from "../actions";
import { UploadCloud, ArrowLeft, Loader2, Save } from "lucide-react";

export default function UploadArchivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await uploadArchive(formData);

    if (res.success) {
      router.push("/dashboard/archives");
    } else {
      alert(`Error: ${res.error}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Dokumen</h1>
          <p className="text-sm text-gray-500">
            Simpan arsip digital ke database.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FILE UPLOAD AREA */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-4">
            File Dokumen
          </label>

          <div className="relative group">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-orange-500 hover:bg-orange-50/50 transition-colors cursor-pointer bg-gray-50">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {fileName || "Klik untuk pilih file"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOCX, atau Image (Max 5MB)
              </p>

              <input
                required
                type="file"
                name="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* METADATA FORM */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Dokumen
            </label>
            <input
              required
              name="title"
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Contoh: Surat Undangan Rapat BPS"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                required
                name="category"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value="surat_masuk">Surat Masuk</option>
                <option value="surat_keluar">Surat Keluar</option>
                <option value="proposal">Proposal</option>
                <option value="sk">SK / Legal</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            {/* Bisa tambah input lain kalau perlu */}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi (Opsional)
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Keterangan tambahan..."
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-medium transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          Simpan Arsip
        </button>
      </form>
    </div>
  );
}
