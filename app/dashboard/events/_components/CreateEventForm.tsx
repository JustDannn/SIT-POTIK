"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  Calendar,
  MapPin,
  AlignLeft,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { createEvent } from "../actions";

export default function CreateEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createEvent(formData);

      if (result?.error) {
        alert(result.error);
      } else {
        router.push("/dashboard/events");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6"
    >
      <div>
        <label className="text-sm font-bold text-gray-700 mb-2">
          Nama Kegiatan <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          required
          placeholder="Contoh: Workshop Data Science Batch 1"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <AlignLeft size={16} className="text-gray-400" /> Deskripsi Singkat
        </label>
        <textarea
          name="description"
          rows={4}
          placeholder="Jelaskan tujuan dan target peserta..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" /> Lokasi{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          name="location"
          required
          placeholder="Zoom Meeting / Aula BPS"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" /> Waktu Mulai{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="startDate"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-600"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" /> Waktu Selesai
          </label>
          <input
            type="datetime-local"
            name="endDate"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-600"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
        <Link
          href="/dashboard/events"
          className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Batal
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          Simpan Jadwal
        </button>
      </div>
    </form>
  );
}
