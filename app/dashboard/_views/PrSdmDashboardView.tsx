"use client";

import React from "react";
import Link from "next/link";
import {
  Megaphone,
  FileClock,
  Briefcase,
  AlertTriangle,
  Clock,
  Upload,
  CheckCircle2,
  FileText,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrSdmAlert {
  type?: "warning" | "danger" | "info" | string;
  message: string;
}

interface PrSdmActivity {
  id: string | number;
  userName: string;
  createdAt: string | Date;
  notes: string;
  prokerTitle?: string | null;
}

interface PrSdmData {
  kpi?: {
    published?: number;
    pending?: number;
    prokersActive?: number;
    prokersCompleted?: number;
  };
  alerts?: PrSdmAlert[];
  activities?: PrSdmActivity[];
}

interface PrSdmUser {
  name?: string | null;
}

export default function PrSdmDashboardView({
  data,
  user,
}: {
  data: PrSdmData;
  user: PrSdmUser;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";
  const firstName = user?.name?.split(" ")[0] || "Koordinator";
  return (
    <div className="space-y-8 pb-10">
      {/* HEADER & SHORTCUTS */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {firstName}!
          </h1>
          <p className="text-sm text-gray-500">
            Pantau publikasi konten dan progres program kerja divisi.
          </p>
        </div>

        {/* Shortcut Aksi - Fokus ke Konten & Proker */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/content/create"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Upload size={16} /> Tulis Konten
          </Link>
          <Link
            href="/dashboard/content"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <FileText size={16} /> Dapur Redaksi
          </Link>
          <Link
            href="/dashboard/proker"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Target size={16} /> Kelola Proker
          </Link>
        </div>
      </div>

      {/* KPI RINGKAS (FOKUS KONTEN & PROKER) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-hover hover:border-indigo-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Megaphone size={18} className="text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Konten Tayang
            </span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi?.published || 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-hover hover:border-orange-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FileClock size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pending Review
            </span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi?.pending || 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-hover hover:border-blue-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Briefcase size={18} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Proker Aktif
            </span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi?.prokersActive || 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-hover hover:border-green-200">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CheckCircle2 size={18} className="text-green-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Proker Selesai
            </span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi?.prokersCompleted || 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ALERT & ATTENTION NEEDED */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" /> Perlu Perhatian
          </h3>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
            {data.alerts && data.alerts.length > 0 ? (
              data.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-4 flex gap-3 items-start hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      alert.type === "warning"
                        ? "bg-orange-500"
                        : alert.type === "danger"
                          ? "bg-red-500"
                          : "bg-blue-500",
                    )}
                  ></div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                Semua aman terkendali. Tidak ada tugas mendesak! 🎉
              </div>
            )}
          </div>
        </div>

        {/* AKTIVITAS TERBARU */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" /> Log Aktivitas Divisi
          </h3>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-sm">
            {data.activities && data.activities.length > 0 ? (
              data.activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-gray-900">
                      {act.userName}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {new Date(act.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">
                    {act.notes}
                  </p>
                  {act.prokerTitle && (
                    <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold rounded">
                      {act.prokerTitle}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                Belum ada aktivitas tercatat hari ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
