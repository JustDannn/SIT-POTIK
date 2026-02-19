"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/widgets/StatCard";
import AttentionWidget from "@/components/dashboard/widgets/AttentionWidget";
import GanttChartWidget from "@/components/dashboard/widgets/GanttChartWidget";
import {
  Filter,
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
}

interface AttentionItem {
  id: string | number;
  title: string;
  subtitle: string;
  link: string;
  type: "proker" | "laporan" | "lpj";
}

interface TimelineItem {
  id: number;
  title: string;
  division: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  status: string | null;
  type?: "proker" | "program";
}

interface ActivityItem {
  id: number;
  userName: string;
  notes: string;
  prokerTitle: string;
  createdAt: string;
}

interface KetuaViewProps {
  user: UserData;
  stats: {
    active: number;
    completed: number;
    pendingReports: number;
    pendingLPJ: number;
  };
  attention: AttentionItem[];
  timelineData: TimelineItem[];
  activities: ActivityItem[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return then.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function KetuaView({
  user,
  stats,
  attention,
  timelineData,
  activities,
}: KetuaViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString("id-ID", { month: "short" });
  const lastDay = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const dateLabel = `1 ${monthName} - ${lastDay} ${monthName} ${currentYear}`;

  // Filter timeline data by status
  const filteredTimeline = useMemo(() => {
    if (statusFilter === "all") return timelineData;
    return timelineData.filter((item) => item.status === statusFilter);
  }, [timelineData, statusFilter]);

  const statusOptions = [
    { value: "all", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "created", label: "Planning" },
    { value: "completed", label: "Selesai" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user.name}!</p>
        </div>

        {/* Filter Tools */}
        <div className="flex gap-2">
          {/* Calendar Button -> Links to Gantt Chart */}
          <Link
            href="/dashboard/proker?view=gantt"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <CalendarIcon size={16} /> {dateLabel}
          </Link>

          {/* Filter Button -> Toggle dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm shadow-sm transition-colors",
                statusFilter !== "all"
                  ? "border-orange-300 text-orange-600 bg-orange-50"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              <Filter size={16} />
              {statusFilter === "all"
                ? "Filter"
                : statusOptions.find((o) => o.value === statusFilter)?.label}
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform",
                  isFilterOpen && "rotate-180",
                )}
              />
            </button>

            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setIsFilterOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors",
                        statusFilter === opt.value
                          ? "text-orange-600 font-semibold bg-orange-50/50"
                          : "text-gray-700",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {statusFilter !== "all" && (
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setIsFilterOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <X size={14} /> Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
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

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gantt Chart & Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gantt Chart - Proker Overview */}
          <GanttChartWidget data={filteredTimeline} />

          {/* Aktivitas Organisasi Terbaru */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">
              Aktivitas Organisasi Terbaru
            </h3>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                  >
                    <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <User size={14} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{act.userName}</span>{" "}
                        <span className="text-gray-500">—</span>{" "}
                        <span className="text-gray-600">{act.notes}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                          {act.prokerTitle}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                          <Clock size={10} />
                          {timeAgo(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic text-center py-4">
                Belum ada aktivitas tercatat.
              </p>
            )}
          </div>
        </div>

        {/* Attention Needed */}
        <div className="lg:col-span-1">
          <AttentionWidget items={attention} />
        </div>
      </div>
    </div>
  );
}
