"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  startDate: string;
  location?: string | null;
  status: string | null;
}

export default function EventsGalleryView({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
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
                    : event.status === "canceled"
                      ? "bg-red-50 text-red-500 border-red-100"
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
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
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

          {/* Bottom */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
              Lihat Detail <ArrowRight size={14} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
