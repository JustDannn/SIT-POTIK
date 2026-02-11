"use client";

import React, { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
export interface CalendarEvent {
  id: number;
  title: string;
  startDate: string; // ISO String
  endDate: string | null; // Bisa null
  status: string | null;
  location: string | null;
  description?: string | null;
}

const STATUS_BAR: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  planned: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  ongoing: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  completed: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  canceled: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function daysBetween(a: Date, b: Date) {
  const msPerDay = 86400000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function EventCalendar({
  events = [],
}: {
  events?: CalendarEvent[];
}) {
  const today = startOfDay(new Date());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const scrollRef = useRef<HTMLDivElement>(null);

  const goToPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const monthStart = useMemo(
    () => new Date(currentYear, currentMonth, 1),
    [currentYear, currentMonth],
  );

  // Generate Header Hari (1, 2, 3...)
  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(currentYear, currentMonth, i + 1);
      return {
        num: i + 1,
        dayName: DAY_SHORT[d.getDay()],
        isToday:
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate(),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      };
    });
  }, [currentYear, currentMonth, daysInMonth, today]);

  // Filter Event agar hanya muncul yang di bulan ini
  const visibleEvents = useMemo(() => {
    const monthEnd = new Date(
      currentYear,
      currentMonth,
      daysInMonth,
      23,
      59,
      59,
    );

    return events
      .map((ev) => {
        // Konversi string ISO ke Date Object
        const evStart = startOfDay(new Date(ev.startDate));
        // Jika endDate null, anggap selesai di hari yang sama
        const evEnd = ev.endDate ? startOfDay(new Date(ev.endDate)) : evStart;

        return { ...ev, _start: evStart, _end: evEnd };
      })
      .filter((ev) => {
        // Cek overlap: Start event <= End Month DAN End Event >= Start Month
        return ev._start <= monthEnd && ev._end >= monthStart;
      })
      .sort((a, b) => a._start.getTime() - b._start.getTime());
  }, [events, currentYear, currentMonth, daysInMonth, monthStart]);

  // Lebar kolom per hari (pixel)
  const colW = 44;

  // Posisi garis "Hari Ini"
  const todayOffset = useMemo(() => {
    if (
      today.getMonth() !== currentMonth ||
      today.getFullYear() !== currentYear
    )
      return null;
    return (today.getDate() - 1) * colW + colW / 2;
  }, [today, currentMonth, currentYear, colW]);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            {visibleEvents.length} kegiatan bulan ini
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToPrev}
            className="p-1.5 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs font-bold transition-colors"
          >
            Hari Ini
          </button>
          <button
            onClick={goToNext}
            className="p-1.5 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* GANTT BODY (Scrollable) */}
      <div className="overflow-x-auto flex-1 custom-scrollbar" ref={scrollRef}>
        <div style={{ minWidth: daysInMonth * colW + 200, paddingBottom: 20 }}>
          {/* TIMELINE HEADER (Sticky) */}
          <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
            {/* Kolom Label Kiri */}
            <div className="w-48 shrink-0 px-4 py-3 border-r border-gray-100 bg-white sticky left-0 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Kegiatan
              </span>
            </div>
            {/* Kolom Hari */}
            <div className="flex relative">
              {days.map((d) => (
                <div
                  key={d.num}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 border-r border-gray-50",
                    d.isWeekend && "bg-gray-50/60",
                  )}
                  style={{ width: colW }}
                >
                  <span
                    className={cn(
                      "text-[9px] font-medium uppercase",
                      d.isToday ? "text-indigo-600" : "text-gray-400",
                    )}
                  >
                    {d.dayName}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold mt-0.5 w-5 h-5 flex items-center justify-center rounded-full",
                      d.isToday ? "bg-indigo-600 text-white" : "text-gray-600",
                    )}
                  >
                    {d.num}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* EVENT ROWS */}
          {visibleEvents.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm italic">
              Tidak ada kegiatan di periode ini.
            </div>
          ) : (
            visibleEvents.map((ev) => {
              const style =
                STATUS_BAR[ev.status ?? "planned"] || STATUS_BAR.planned;

              // Hitung Posisi Bar (Clamping ke batas bulan)
              const barStart = ev._start < monthStart ? monthStart : ev._start;
              const monthEndDate = new Date(
                currentYear,
                currentMonth,
                daysInMonth,
              );
              const barEnd = ev._end > monthEndDate ? monthEndDate : ev._end;

              const offsetDays = daysBetween(monthStart, barStart);
              const spanDays = daysBetween(barStart, barEnd) + 1;

              const leftPx = offsetDays * colW;
              const widthPx = spanDays * colW - 6; // -6 px gap kanan

              const startTime = new Date(ev.startDate).toLocaleTimeString(
                "id-ID",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <div
                  key={ev.id}
                  className="flex border-b border-gray-50 hover:bg-gray-50/40 transition-colors group relative"
                >
                  {/* Event Label (Sticky Left) */}
                  <div className="w-48 shrink-0 px-4 py-3 border-r border-gray-100 flex flex-col justify-center min-h-15 bg-white sticky left-0 z-10 group-hover:bg-gray-50/40">
                    <span
                      className="text-sm font-bold text-gray-800 truncate leading-tight"
                      title={ev.title}
                    >
                      {ev.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {ev.location && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate max-w-20">
                          <MapPin size={10} />
                          {ev.location}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock size={10} />
                        {startTime}
                      </span>
                    </div>
                  </div>

                  {/* Gantt Bar Area */}
                  <div className="relative flex-1" style={{ height: 60 }}>
                    {/* Weekend Backgrounds */}
                    {days.map(
                      (d) =>
                        d.isWeekend && (
                          <div
                            key={d.num}
                            className="absolute top-0 bottom-0 bg-gray-50/60 pointer-events-none"
                            style={{
                              left: (d.num - 1) * colW,
                              width: colW,
                            }}
                          />
                        ),
                    )}

                    {/* Today Line Marker */}
                    {todayOffset !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-indigo-500/50 z-1"
                        style={{ left: todayOffset }}
                      />
                    )}

                    {/* THE BAR */}
                    <div
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-8 rounded-lg border flex items-center px-2.5 gap-1.5 cursor-pointer transition-all hover:shadow-md hover:h-9 z-2",
                        style.bg,
                        style.border,
                      )}
                      style={{
                        left: leftPx + 3, // +3px gap kiri
                        width: Math.max(widthPx, 38), // Min width biar bar kelihatan
                      }}
                      title={`${ev.title}\nStatus: ${ev.status}\nLokasi: ${ev.location || "-"}`}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          style.dot,
                        )}
                      />
                      <span
                        className={cn("text-xs font-bold truncate", style.text)}
                      >
                        {/* Tampilkan judul di dalam bar jika barnya cukup lebar */}
                        {widthPx > 100 ? ev.title : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
