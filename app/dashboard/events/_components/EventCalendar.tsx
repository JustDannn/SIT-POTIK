"use client";

import React, { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  status: string;
  location: string | null;
  description: string | null;
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
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    text: "text-gray-500",
    dot: "bg-gray-400",
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

export default function EventCalendar({ events }: { events: CalendarEvent[] }) {
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
  const monthStart = new Date(currentYear, currentMonth, 1);

  // Days header array
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

  // Filter & sort events that overlap this month
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
        const evStart = startOfDay(new Date(ev.startDate));
        const evEnd = ev.endDate ? startOfDay(new Date(ev.endDate)) : evStart; // single-day event if no endDate
        return { ...ev, _start: evStart, _end: evEnd };
      })
      .filter((ev) => ev._end >= monthStart && ev._start <= monthEnd)
      .sort((a, b) => a._start.getTime() - b._start.getTime());
  }, [events, currentYear, currentMonth, daysInMonth, monthStart]);

  // Column width
  const colW = 44; // px per day

  // Compute today marker position
  const todayOffset = useMemo(() => {
    if (
      today.getMonth() !== currentMonth ||
      today.getFullYear() !== currentYear
    )
      return null;
    return (today.getDate() - 1) * colW + colW / 2;
  }, [today, currentMonth, currentYear, colW]);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {visibleEvents.length} kegiatan bulan ini
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToPrev}
            className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-bold transition-colors"
          >
            Hari Ini
          </button>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* GANTT BODY */}
      <div className="overflow-x-auto" ref={scrollRef}>
        <div style={{ minWidth: daysInMonth * colW + 200 }}>
          {/* TIMELINE HEADER */}
          <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
            {/* Event label column */}
            <div className="w-50 shrink-0 px-4 py-3 border-r border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Kegiatan
              </span>
            </div>
            {/* Day columns */}
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
                      "text-[10px] font-medium uppercase",
                      d.isToday ? "text-indigo-600" : "text-gray-400",
                    )}
                  >
                    {d.dayName}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold mt-0.5 w-6 h-6 flex items-center justify-center rounded-full",
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
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Tidak ada kegiatan di bulan ini
            </div>
          ) : (
            visibleEvents.map((ev) => {
              const style = STATUS_BAR[ev.status] || STATUS_BAR.planned;

              // Clamp to month boundaries
              const barStart = ev._start < monthStart ? monthStart : ev._start;
              const monthEndDate = new Date(
                currentYear,
                currentMonth,
                daysInMonth,
              );
              const barEnd = ev._end > monthEndDate ? monthEndDate : ev._end;

              const offsetDays = daysBetween(monthStart, barStart);
              const spanDays = daysBetween(barStart, barEnd) + 1; // inclusive

              const leftPx = offsetDays * colW;
              const widthPx = spanDays * colW - 4; // small gap

              const startTime = new Date(ev.startDate).toLocaleTimeString(
                "id-ID",
                { hour: "2-digit", minute: "2-digit" },
              );

              return (
                <div
                  key={ev.id}
                  className="flex border-b border-gray-50 hover:bg-gray-50/40 transition-colors group"
                >
                  {/* Event label */}
                  <div className="w-50 shrink-0 px-4 py-3 border-r border-gray-100 flex flex-col justify-center min-h-14">
                    <span className="text-sm font-bold text-gray-800 truncate leading-tight">
                      {ev.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ev.location && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 truncate">
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

                  {/* Bar area */}
                  <div className="relative flex-1" style={{ height: 56 }}>
                    {/* Weekend stripes */}
                    {days.map(
                      (d) =>
                        d.isWeekend && (
                          <div
                            key={d.num}
                            className="absolute top-0 bottom-0 bg-gray-50/60"
                            style={{
                              left: (d.num - 1) * colW,
                              width: colW,
                            }}
                          />
                        ),
                    )}

                    {/* Today marker */}
                    {todayOffset !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-indigo-400/40 z-1"
                        style={{ left: todayOffset }}
                      />
                    )}

                    {/* THE BAR */}
                    <div
                      className={cn(
                        "absolute top-2.5 h-8 rounded-lg border flex items-center px-2.5 gap-1.5 cursor-default transition-shadow hover:shadow-md z-2",
                        style.bg,
                        style.border,
                      )}
                      style={{
                        left: leftPx + 2,
                        width: Math.max(widthPx, 28),
                      }}
                      title={`${ev.title}\n${ev.location || ""}\n${ev.status}`}
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
                        {widthPx > 80 ? ev.title : ""}
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
