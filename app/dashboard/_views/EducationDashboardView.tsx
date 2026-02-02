"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  CalendarPlus,
  PenTool,
  GraduationCap,
} from "lucide-react";

export default function EducationDashboardView({
  user,
  data,
}: {
  user: any;
  data: any;
}) {
  return (
    <div className="space-y-8 pb-20">
      {/* --- HEADER DENGAN ACTION BAR (NEW STYLE) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Halo, {user.name}
          </h1>
          <p className="text-gray-500 mt-1">
            Koordinator Divisi{" "}
            <span className="font-semibold text-indigo-600">
              {user.division.divisionName}
            </span>
          </p>
        </div>

        {/* 👇 SHORTCUT KEREN DISINI */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/events/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
          >
            <CalendarPlus size={18} />
            Buat Event
          </Link>
          <Link
            href="/dashboard/content/create"
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

      {/* KPI CARDS */}
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
        {/* LEFT: AGENDA / KALENDER EVENT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-indigo-600" /> Agenda Kegiatan
            </h2>
            <Link
              href="/dashboard/events"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="space-y-6">
              {data.upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Belum ada agenda mendatang.
                  </p>
                  <Link
                    href="/dashboard/events/create"
                    className="text-indigo-600 text-sm font-bold mt-2 block hover:underline"
                  >
                    + Jadwalkan Sekarang
                  </Link>
                </div>
              ) : (
                data.upcomingEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex gap-4 group p-2 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center bg-indigo-50 w-16 h-16 rounded-2xl shrink-0 border border-indigo-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <span className="text-xs font-bold text-indigo-400 uppercase">
                        {new Date(event.startDate).toLocaleString("id-ID", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-xl font-bold text-indigo-700">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>

                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            event.status === "ongoing"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="line-clamp-1">{event.location}</span>
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="self-center p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: ALERTS ONLY (Shortcut Card Removed) */}
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
            <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Perlu Perhatian
            </h3>
            <div className="space-y-3">
              {data.alerts && data.alerts.length > 0 ? (
                data.alerts.map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-orange-100 text-sm shadow-sm"
                  >
                    <p className="font-bold text-gray-800">{alert.message}</p>
                    <Link
                      href="/dashboard/content/create"
                      className="text-orange-600 font-bold text-xs mt-3 flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Upload Impact <ArrowRight size={12} />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-orange-400 italic">
                    Semua aman terkendali!
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
