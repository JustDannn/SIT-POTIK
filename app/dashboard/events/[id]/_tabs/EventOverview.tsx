"use client";

import React from "react";
import { Calendar, MapPin, Clock, Info } from "lucide-react";

export default function EventOverview({
  event,
  userRole,
}: {
  event: any;
  userRole: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Kolom Kiri: Detail Utama */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info size={20} className="text-indigo-600" /> Deskripsi Kegiatan
          </h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {event.description || "Tidak ada deskripsi."}
          </p>
        </div>
      </div>

      {/* Kolom Kanan: Meta Data */}
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 mb-2">Detail Pelaksanaan</h3>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mt-1">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Tanggal Mulai
              </p>
              <p className="font-semibold text-gray-900">
                {new Date(event.startDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mt-1">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Status
              </p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  event.status === "ongoing"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {event.status}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mt-1">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Lokasi
              </p>
              <p className="font-semibold text-gray-900">{event.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
