"use client";

import React from "react";
import Link from "next/link";
import {
  Megaphone,
  FileClock,
  Handshake,
  Briefcase,
  AlertTriangle,
  Clock,
  UserPlus,
  Upload,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PrSdmDashboardView({
  data,
  user,
}: {
  data: any;
  user: any;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";
  const firstName = user?.name?.split(" ")[0] || "Koordinator";
  return (
    <div className="space-y-8">
      {/* HEADER & SHORTCUTS */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {firstName}!
          </h1>
          <p className="text-sm text-gray-500">
            Overview visibility, relasi, dan keaktifan anggota.
          </p>
        </div>

        {/* Shortcut Aksi */}
        <div className="flex gap-2">
          <Link
            href="/dashboard/content/create"
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Upload size={16} /> Upload Konten
          </Link>
          <Link
            href="/dashboard/partners/create"
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Tambah Partner
          </Link>
          <Link
            href="/dashboard/members"
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
          >
            <UserPlus size={16} /> Lihat Anggota
          </Link>
        </div>
      </div>

      {/* KPI RINGKAS (NO CHART) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Megaphone size={18} className="text-purple-500" />
            <span className="text-xs font-bold uppercase">
              Konten Published
            </span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi.published}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FileClock size={18} className="text-orange-500" />
            <span className="text-xs font-bold uppercase">Pending Review</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi.pending}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Handshake size={18} className="text-blue-500" />
            <span className="text-xs font-bold uppercase">Partner Aktif</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi.partners}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Briefcase size={18} className="text-green-500" />
            <span className="text-xs font-bold uppercase">Proker Aktif</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {data.kpi.prokers}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ALERT & ATTENTION NEEDED */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" /> Perlu Perhatian
          </h3>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {data.alerts.length > 0 ? (
              data.alerts.map((alert: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 flex gap-3 items-start hover:bg-gray-50"
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-2 shrink-0",
                      alert.type === "warning"
                        ? "bg-orange-500"
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
                Tidak ada alert. Semua aman terkendali! 🎉
              </div>
            )}
          </div>
        </div>

        {/* AKTIVITAS TERBARU */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" /> Aktivitas Anggota
            (Live)
          </h3>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
            {data.activities.map((act: any) => (
              <div
                key={act.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-gray-900">
                    {act.userName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(act.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{act.notes}</p>
                {act.prokerTitle && (
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">
                    {act.prokerTitle}
                  </span>
                )}
              </div>
            ))}
            {data.activities.length === 0 && (
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
