"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Megaphone,
  AlertCircle,
  ArrowRight,
  PenTool,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EdukasiDashboard({
  data,
  user,
}: {
  data: any;
  user: any;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

  // Hitung progress task event selanjutnya
  const progress = data.nextEvent
    ? Math.round(
        (data.nextEvent.completedTasks / data.nextEvent.totalTasks) * 100,
      ) || 0
    : 0;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, Koordinator Edukasi! 🎓
          </h1>
          <p className="text-sm text-gray-500">
            Kawal proker pelatihan dan publikasikan dampaknya.
          </p>
        </div>
        <Link
          href="/dashboard/proker/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
        >
          <Calendar size={18} /> Buat Event Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI (2/3): EVENT MANAGEMENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* HERO CARD: NEXT EVENT */}
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
              <GraduationCap size={200} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-100 text-sm font-bold uppercase mb-2">
                <Calendar size={16} /> Event Sedang Berjalan
              </div>

              {data.nextEvent ? (
                <>
                  <h2 className="text-3xl font-extrabold mb-4">
                    {data.nextEvent.title}
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-indigo-200 uppercase">
                        PIC Event
                      </p>
                      <p className="font-bold">{data.nextEvent.picName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-200 uppercase">
                        Tanggal
                      </p>
                      <p className="font-bold">
                        {data.nextEvent.startDate
                          ? new Date(
                              data.nextEvent.startDate,
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                            })
                          : "Belum ditentukan"}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Persiapan Task</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6">
                  <h3 className="text-xl font-bold opacity-90">
                    Tidak ada event aktif.
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">
                    Istirahat dulu atau rencanakan yang baru!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PENDING IMPACT (WARNING AREA) */}
          {data.pendingImpacts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h3 className="text-orange-800 font-bold flex items-center gap-2 mb-3">
                <AlertCircle size={20} /> Menunggu Publikasi Impact
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                Proker di bawah ini sudah selesai, tapi belum ada
                artikel/dokumentasi yang di-upload ke halaman Impact.
              </p>

              <div className="space-y-3">
                {data.pendingImpacts.map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-white p-3 rounded-lg border border-orange-100 flex justify-between items-center shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {p.title}
                      </p>
                      <p className="text-xs text-gray-500">PIC: {p.picName}</p>
                    </div>
                    <Link
                      href={`/dashboard/publications/create?prokerId=${p.id}`}
                      className="px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-md hover:bg-orange-700 transition-colors flex items-center gap-1"
                    >
                      <PenTool size={12} /> Tulis Artikel
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN (1/3): STATS & RECENT */}
        <div className="space-y-6">
          {/* Simple Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-xs font-bold uppercase">
                Event Aktif
              </p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                {data.stats.active}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-xs font-bold uppercase">
                Selesai
              </p>
              <p className="text-2xl font-extrabold text-green-600 mt-1">
                {data.stats.completed}
              </p>
            </div>
          </div>

          {/* Recent Publications */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="font-bold text-gray-700 flex items-center gap-2">
                <Megaphone size={16} /> Impact Terbaru
              </span>
              <Link
                href="/dashboard/publications"
                className="text-xs text-indigo-600 hover:underline"
              >
                Semua
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {data.recentImpacts.map((pub: any) => (
                <div
                  key={pub.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
                    {pub.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded uppercase">
                      {pub.category}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                        pub.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700",
                      )}
                    >
                      {pub.status}
                    </span>
                  </div>
                  {pub.prokerName && (
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Output: {pub.prokerName}
                    </p>
                  )}
                </div>
              ))}
              {data.recentImpacts.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-400">
                  Belum ada publikasi impact.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
