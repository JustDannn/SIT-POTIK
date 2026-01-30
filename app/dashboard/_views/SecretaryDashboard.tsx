"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Archive,
  Plus,
  Calendar,
  File,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecretaryDashboard({
  data,
  user,
}: {
  data: any;
  user: any;
}) {
  // Greeting berdasarkan waktu
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm">
            Berikut ringkasan administrasi Pojok Statistik hari ini.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/minutes/create"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Notulensi Baru
          </Link>
          <Link
            href="/dashboard/archives/upload"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} /> Upload Arsip
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Notulensi */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Notulensi
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900">
              {data.stats.minutes}
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
        </div>
        {/* Card 2: Arsip */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Dokumen Arsip
            </p>
            <h3 className="text-3xl font-extrabold text-gray-900">
              {data.stats.archives}
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Archive size={24} />
          </div>
        </div>
        {/* Card 3: Date (Placeholder / Agenda) */}
        <div className="bg-linear-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">
                Hari Ini
              </p>
              <h3 className="text-2xl font-bold">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
            </div>
            <Calendar className="text-orange-200" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT NOTULENSI */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Notulensi
              Terakhir
            </h3>
            <Link
              href="/dashboard/minutes"
              className="text-xs font-medium text-orange-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-4">
            {data.recentMinutes.map((m: any) => (
              <div
                key={m.id}
                className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <div className="min-w-[50px] text-center bg-gray-50 rounded-lg p-2">
                  <span className="block text-xs text-gray-500 uppercase">
                    {new Date(m.meetingDate).toLocaleString("id-ID", {
                      month: "short",
                    })}
                  </span>
                  <span className="block text-lg font-bold text-gray-900 leading-none">
                    {new Date(m.meetingDate).getDate()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                    {m.title}
                  </h4>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-1",
                      m.status === "published"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700",
                    )}
                  >
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
            {data.recentMinutes.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Belum ada notulensi.
              </p>
            )}
          </div>
        </div>

        {/* RECENT ARSIP */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Archive size={18} className="text-purple-500" /> Arsip Terbaru
            </h3>
            <Link
              href="/dashboard/archives"
              className="text-xs font-medium text-orange-600 hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-4">
            {data.recentArchives.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <File size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="capitalize bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                      {a.category.replace("_", " ")}
                    </span>
                    <span>• {a.uploader?.split(" ")[0]}</span>
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
                  {new Date(a.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "numeric",
                  })}
                </span>
              </div>
            ))}
            {data.recentArchives.length === 0 && (
              <p className="text-sm text-gray-400 italic">Belum ada arsip.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
