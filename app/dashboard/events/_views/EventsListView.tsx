"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  History,
  Clock,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventsListView({
  initialData,
}: {
  initialData: any[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "history">("upcoming");

  // Client-side Filtering Logic
  const filteredEvents = initialData.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    // Logic filter status
    // Upcoming = planned / ongoing
    // History = completed / canceled
    const isHistory = ["completed", "canceled"].includes(event.status);

    if (filter === "upcoming") {
      return matchesSearch && !isHistory;
    } else {
      return matchesSearch && isHistory;
    }
  });

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Kegiatan</h1>
          <p className="text-gray-500 mt-1">
            Kelola jadwal pelatihan dan event divisi.
          </p>
        </div>
        <Link
          href="/dashboard/events/create"
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 text-sm font-bold transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
        >
          <CalendarPlus size={18} />
          Jadwalkan Baru
        </Link>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama kegiatan..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shrink-0">
          <button
            onClick={() => setFilter("upcoming")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
              filter === "upcoming"
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-gray-500 hover:bg-gray-50",
            )}
          >
            <Clock size={16} /> Akan Datang
          </button>
          <button
            onClick={() => setFilter("history")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
              filter === "history"
                ? "bg-gray-100 text-gray-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50",
            )}
          >
            <History size={16} /> Riwayat
          </button>
        </div>
      </div>

      {/* EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Filter className="text-gray-300" size={32} />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">
            Tidak ada kegiatan ditemukan
          </h3>
          <p className="text-gray-500 text-sm">
            Coba ubah kata kunci pencarian atau filter status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="group bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
            >
              {/* Top Row: Date & Status */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col items-center justify-center bg-indigo-50 w-14 h-14 rounded-2xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {new Date(event.startDate).toLocaleString("id-ID", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-xl font-extrabold">
                    {new Date(event.startDate).getDate()}
                  </span>
                </div>

                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                    event.status === "ongoing"
                      ? "bg-green-50 text-green-600 border-green-100"
                      : event.status === "completed"
                        ? "bg-gray-50 text-gray-500 border-gray-100"
                        : "bg-indigo-50 text-indigo-600 border-indigo-100",
                  )}
                >
                  {event.status}
                </span>
              </div>

              {/* Title & Info */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} className="text-gray-400" />
                    <span>
                      {new Date(event.startDate).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Decoration */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                  Lihat Detail <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
