"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMinute, deleteMinute } from "../actions"; // Import server actions
import { Save, ArrowLeft, Trash2, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MinuteForm({
  initialData,
  prokerOptions,
}: {
  initialData?: any;
  prokerOptions: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    // Tambah ID kalau edit mode
    if (initialData?.id) {
      formData.append("id", String(initialData.id));
    }

    const res = await saveMinute(formData);

    if (res.success) {
      router.push("/dashboard/minutes");
    } else {
      alert("Gagal menyimpan!"); // Ganti toast kalo mau lebih bagus
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (confirm("Yakin ingin menghapus notulensi ini?")) {
      setLoading(true);
      await deleteMinute(initialData.id);
      router.push("/dashboard/minutes");
    }
  }

  // Helper format tanggal default value input date (YYYY-MM-DD)
  const defaultDate = initialData?.meetingDate
    ? new Date(initialData.meetingDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Notulensi" : "Notulensi Baru"}
            </h1>
            <p className="text-sm text-gray-500">
              Isi detail rapat dengan lengkap.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {initialData && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Simpan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM UTAMA (Konten) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Judul */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Judul Rapat
            </label>
            <input
              required
              name="title"
              defaultValue={initialData?.title}
              className="w-full text-lg px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder:text-gray-300 font-bold"
              placeholder="Contoh: Rapat Evaluasi Triwulan 1"
            />
          </div>

          {/* Isi Notulensi */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Isi Notulensi
            </label>
            <textarea
              required
              name="content"
              defaultValue={initialData?.content}
              className="w-full min-h-100 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none leading-relaxed"
              placeholder="Tulis hasil rapat di sini..."
            />
          </div>
        </div>

        {/* SIDEBAR (Meta Data) */}
        <div className="space-y-6">
          {/* Status & Tanggal */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Dokumen
              </label>
              <select
                name="status"
                defaultValue={initialData?.status || "draft"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white"
              >
                <option value="draft">Draft (Konsep)</option>
                <option value="published">Published (Final)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Rapat
              </label>
              <input
                type="date"
                name="meetingDate"
                defaultValue={defaultDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Kategori & Peserta */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Rapat
              </label>
              <select
                name="meetingType"
                defaultValue={initialData?.meetingType || "internal"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="internal">Internal Divisi</option>
                <option value="bph">Rapat BPH</option>
                <option value="proker">Rapat Proker</option>
                <option value="dosen">Koordinasi Dosen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Kerja (Opsional)
              </label>
              <select
                name="prokerId"
                defaultValue={initialData?.prokerId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">-- Tidak Ada / Umum --</option>
                {prokerOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daftar Hadir
              </label>
              <textarea
                name="attendees"
                defaultValue={initialData?.attendees}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Pisahkan nama dengan koma (Misal: Budi, Siti, Andi)"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
