"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  CalendarPlus,
  PenTool,
  GraduationCap,
  Calendar as CalendarIcon,
} from "lucide-react";
import EventCalendar from "../events/_components/EventCalendar";

interface Division {
  divisionName: string;
}

interface User {
  name: string;
  division: Division;
}
interface EventItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null; // Wajib ada
  status: string;
  location: string | null;
  description?: string | null;
}

interface AlertItem {
  message: string;
}

interface DashboardData {
  activeEvents: number;
  completedMonth: number;
  totalParticipants: number;
  pendingImpacts: number;
  upcomingEvents: EventItem[];
  alerts: AlertItem[];
}

export default function EducationDashboardView({
  user,
  data,
}: {
  user: User;
  data: DashboardData;
}) {
  return (
    <div className="space-y-8 pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Halo, {user.name} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Koordinator Divisi{" "}
            <span className="font-semibold text-indigo-600">
              {user.division.divisionName}
            </span>
          </p>
        </div>

        {/* SHORTCUTS */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/events"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
          >
            <CalendarPlus size={18} />
            Buat Event
          </Link>
          <Link
            href="/dashboard/content/create?category=Impact"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-bold transition-colors hover:border-gray-300"
          >
            <PenTool size={18} />
            Impact Story
          </Link>
          <Link
            href="/dashboard/participants"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-bold transition-colors hover:border-gray-300"
          >
            <GraduationCap size={18} />
            Data Peserta
          </Link>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              Aktif
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.activeEvents}
          </p>
          <p className="text-xs text-gray-500">Event sedang berjalan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.completedMonth}
          </p>
          <p className="text-xs text-gray-500">Selesai bulan ini</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.totalParticipants}
          </p>
          <p className="text-xs text-gray-500">Total Peserta (YTD)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.pendingImpacts}
          </p>
          <p className="text-xs text-gray-500">Butuh Laporan Impact</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="text-indigo-600" /> Kalender Kegiatan
            </h2>
            <Link
              href="/dashboard/events"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Buka Versi Penuh
            </Link>
          </div>
          <div className="h-125 border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white">
            <EventCalendar events={data.upcomingEvents} />
          </div>
        </div>

        {/* RIGHT: ALERTS */}
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 h-full">
            <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Perlu Perhatian
            </h3>
            <div className="space-y-3">
              {data.alerts && data.alerts.length > 0 ? (
                data.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-orange-100 text-sm shadow-sm animate-in fade-in slide-in-from-right-4 duration-500"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <p className="font-bold text-gray-800 leading-snug">
                      {alert.message}
                    </p>
                    <Link
                      href="/dashboard/content/create"
                      className="text-orange-600 font-bold text-xs mt-3 flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Tindak Lanjuti <ArrowRight size={12} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-70">
                  <div className="bg-white/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="text-orange-300" />
                  </div>
                  <p className="text-xs text-orange-700 font-medium">
                    Tidak ada notifikasi mendesak.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
