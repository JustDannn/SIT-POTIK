"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventsListView({ events }: { events: any[] }) {
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
    <div className="space-y-3">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/dashboard/events/${event.id}`}
          className="group flex items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-indigo-100 transition-all duration-200"
        >
          {/* Date Block */}
          <div className="flex flex-col items-center justify-center bg-indigo-50 w-14 h-14 rounded-2xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              {new Date(event.startDate).toLocaleString("id-ID", {
                month: "short",
              })}
            </span>
            <span className="text-xl font-extrabold">
              {new Date(event.startDate).getDate()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              {event.location && (
                <span className="text-xs text-gray-400 flex items-center gap-1 truncate">
                  <MapPin size={12} />
                  {event.location}
                </span>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {new Date(event.startDate).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0",
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

          {/* Arrow */}
          <ArrowRight
            size={16}
            className="text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0"
          />
        </Link>
      ))}
    </div>
  );
}
