"use client";

import React, { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface ProkerGanttItem {
  id: number;
  title: string;
  divisionName: string;
  status: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  type?: "proker" | "program";
}

// Status colors for the bars
const STATUS_BAR: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  active: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  created: {
    bg: "bg-gray-400/10",
    border: "border-gray-400/30",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  completed: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  archived: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-700",
    dot: "bg-amber-500",
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

export default function ProkerGanttChart({
  data = [],
}: {
  data: ProkerGanttItem[];
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

  // Generate day headers
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

  // Filter proker that overlap with current month
  const visibleProkers = useMemo(() => {
    const monthEnd = new Date(
      currentYear,
      currentMonth,
      daysInMonth,
      23,
      59,
      59,
    );

    return data
      .map((p) => {
        if (!p.startDate) return null;
        const pStart = startOfDay(new Date(p.startDate));
        const pEnd = p.endDate ? startOfDay(new Date(p.endDate)) : pStart;
        return { ...p, _start: pStart, _end: pEnd };
      })
      .filter((p): p is NonNullable<typeof p> => {
        if (!p) return false;
        return p._start <= monthEnd && p._end >= monthStart;
      })
      .sort((a, b) => a._start.getTime() - b._start.getTime());
  }, [data, currentYear, currentMonth, daysInMonth, monthStart]);

  const colW = 44;

  // Today line position
  const todayOffset = useMemo(() => {
    if (
      today.getMonth() !== currentMonth ||
      today.getFullYear() !== currentYear
    )
      return null;
    return (today.getDate() - 1) * colW + colW / 2;
  }, [today, currentMonth, currentYear, colW]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            {visibleProkers.length} program kerja bulan ini
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

      {/* GANTT BODY */}
      <div className="overflow-x-auto flex-1 custom-scrollbar" ref={scrollRef}>
        <div style={{ minWidth: daysInMonth * colW + 220, paddingBottom: 20 }}>
          {/* TIMELINE HEADER (Sticky) */}
          <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
            {/* Label column */}
            <div className="w-52 shrink-0 px-4 py-3 border-r border-gray-100 bg-white sticky left-0 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Program Kerja
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
                      "text-[9px] font-medium uppercase",
                      d.isToday ? "text-orange-600" : "text-gray-400",
                    )}
                  >
                    {d.dayName}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold mt-0.5 w-5 h-5 flex items-center justify-center rounded-full",
                      d.isToday ? "bg-orange-500 text-white" : "text-gray-600",
                    )}
                  >
                    {d.num}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PROKER ROWS */}
          {visibleProkers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Briefcase size={32} className="mb-2 text-gray-300" />
              <span className="text-sm italic">
                Tidak ada program kerja di periode ini.
              </span>
            </div>
          ) : (
            visibleProkers.map((p) => {
              const style =
                STATUS_BAR[p.status ?? "created"] || STATUS_BAR.created;

              // Calculate bar position (clamped to month boundaries)
              const barStart = p._start < monthStart ? monthStart : p._start;
              const monthEndDate = new Date(
                currentYear,
                currentMonth,
                daysInMonth,
              );
              const barEnd = p._end > monthEndDate ? monthEndDate : p._end;

              const offsetDays = daysBetween(monthStart, barStart);
              const spanDays = daysBetween(barStart, barEnd) + 1;

              const leftPx = offsetDays * colW;
              const widthPx = spanDays * colW - 6;

              return (
                <div
                  key={`${p.type || "proker"}-${p.id}`}
                  className="flex border-b border-gray-50 hover:bg-gray-50/40 transition-colors group relative"
                >
                  {/* Proker Label (Sticky Left) */}
                  <div className="w-52 shrink-0 px-4 py-3 border-r border-gray-100 flex flex-col justify-center min-h-15 bg-white sticky left-0 z-10 group-hover:bg-gray-50/40">
                    <Link
                      href={
                        p.type === "program"
                          ? `/dashboard/events/${p.id}`
                          : `/dashboard/proker/${p.id}`
                      }
                      className="text-sm font-bold text-gray-800 truncate leading-tight hover:text-orange-600 transition-colors"
                      title={p.title}
                    >
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium truncate max-w-28">
                        {p.divisionName}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-bold capitalize",
                          style.bg,
                          style.text,
                        )}
                      >
                        {p.status === "created" ? "planning" : p.status}
                      </span>
                    </div>
                  </div>

                  {/* Gantt Bar Area */}
                  <div className="relative flex-1" style={{ height: 60 }}>
                    {/* Weekend backgrounds */}
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

                    {/* Today line */}
                    {todayOffset !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-orange-500/50 z-[1]"
                        style={{ left: todayOffset }}
                      />
                    )}

                    {/* THE BAR */}
                    <Link
                      href={
                        p.type === "program"
                          ? `/dashboard/events/${p.id}`
                          : `/dashboard/proker/${p.id}`
                      }
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-8 rounded-lg border flex items-center px-2.5 gap-1.5 cursor-pointer transition-all hover:shadow-md hover:h-9 z-[2]",
                        style.bg,
                        style.border,
                      )}
                      style={{
                        left: leftPx + 3,
                        width: Math.max(widthPx, 38),
                      }}
                      title={`${p.title}\nDivisi: ${p.divisionName}\nStatus: ${p.status}`}
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
                        {widthPx > 100 ? p.title : ""}
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STATUS LEGEND */}
      <div className="flex flex-wrap gap-4 px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        {Object.entries(STATUS_BAR).map(([status, colors]) => (
          <div
            key={status}
            className="flex items-center gap-1.5 text-[10px] text-gray-500"
          >
            <div className={cn("w-2.5 h-2.5 rounded-full", colors.dot)} />
            <span className="capitalize font-medium">
              {status === "created" ? "Planning" : status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
