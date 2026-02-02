"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { createProker } from "../actions";
import { cn } from "@/lib/utils";

export default function KoordinatorProkerView({
  data,
  user,
}: {
  data: any[];
  user: any;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ambil nama divisi dari user profile
  const divisionName = user.division?.divisionName || "Divisi Saya";

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Program Kerja {divisionName}
          </h1>
          <p className="text-sm text-gray-500">
            Kelola kegiatan dan proyek divisi Anda.
          </p>
        </div>

        {/* Tombol Create hanya untuk Koordinator */}
        {user.role?.roleName === "Koordinator" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
          >
            <Plus size={18} /> Buat Proker Baru
          </button>
        )}
      </div>

      {/* PROKER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((proker) => (
          <Link
            key={proker.id}
            href={`/dashboard/proker/${proker.id}`}
            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                  proker.status === "completed"
                    ? "bg-green-500"
                    : proker.status === "active"
                      ? "bg-indigo-500"
                      : "bg-gray-400",
                )}
              >
                <Target size={20} />
              </div>
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                  proker.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : proker.status === "active"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600",
                )}
              >
                {proker.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {proker.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
              {proker.description || "Tidak ada deskripsi."}
            </p>

            {/* Timeline & PIC */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={14} />
                <span>
                  {new Date(proker.startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  -{" "}
                  {new Date(proker.endDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold">
                  {proker.picName.charAt(0)}
                </div>
                <span>PIC: {proker.picName}</span>
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 text-indigo-500">
              <ArrowRight size={20} />
            </div>
          </Link>
        ))}

        {data.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <Target className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">
              Belum ada program kerja di divisi ini.
            </p>
            {user.role?.roleName === "Koordinator" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-600 font-bold hover:underline mt-2"
              >
                Buat Proker Pertama
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL CREATE PROKER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-in zoom-in-95 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Buat Program Kerja Baru
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form action={async (formData: FormData) => {
              await createProker(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nama Kegiatan
                </label>
                <input
                  name="title"
                  required
                  placeholder="Contoh: Workshop Public Speaking"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  placeholder="Tujuan dan gambaran singkat kegiatan..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  Simpan Proker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
