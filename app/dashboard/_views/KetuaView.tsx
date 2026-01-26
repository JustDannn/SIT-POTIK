"use client";

import React from "react";
import StatCard from "@/components/dashboard/widgets/StatCard";
import AttentionWidget from "@/components/dashboard/widgets/AttentionWidget";
import TimelineWidget from "@/components/dashboard/widgets/TimelineWidget";
import { Filter, Calendar as CalendarIcon } from "lucide-react";

interface KetuaViewProps {
  user: any;
  stats: {
    active: number;
    completed: number;
    pendingReports: number;
    pendingLPJ: number;
  };
  timeline: any[];
  attention: any[];
}
export default function KetuaView({
  user,
  stats,
  timeline,
  attention,
}: KetuaViewProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString("id-ID", { month: "short" });
  const lastDay = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const dateLabel = `1 ${monthName} - ${lastDay} ${monthName} ${currentYear}`;
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user.name}!</p>
        </div>

        {/* Filter Tools (Masih Kosmetik) */}
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
            <CalendarIcon size={16} /> {dateLabel}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* --- KPI CARDS (DATA REAL) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Proker Aktif" value={stats.active} />
        <StatCard title="Proker Selesai" value={stats.completed} />
        <StatCard
          title="Laporan Pending"
          value={stats.pendingReports}
          className="border-orange-100 bg-orange-50/30"
        />
        <StatCard
          title="LPJ Pending"
          value={stats.pendingLPJ}
          className="border-red-100 bg-red-50/30"
        />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI (2/3 Lebar): Timeline & Aktivitas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Widget Timeline (Sekarang nerima data prop) */}
          <TimelineWidget {...({ data: timeline } as any)} />

          {/* Widget Aktivitas (Placeholder) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[200px]">
            <h3 className="font-bold text-gray-800 mb-4">
              Aktivitas Organisasi Terbaru
            </h3>
            <p className="text-gray-400 text-sm italic">
              Belum ada aktivitas tercatat hari ini.
            </p>
          </div>
        </div>

        {/* KOLOM KANAN (1/3 Lebar): Attention Needed */}
        <div className="lg:col-span-1">
          {/* Widget Attention (Data Real dari DB) */}
          <AttentionWidget items={attention} />
        </div>
      </div>
    </div>
  );
}
