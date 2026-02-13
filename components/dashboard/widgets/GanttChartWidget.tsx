"use client";

import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProkerItem {
  id: number;
  title: string;
  division: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  status: string | null;
}

interface GanttChartWidgetProps {
  data: ProkerItem[];
}

// Color palette by status
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  active: { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800" },
  created: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-700" },
  completed: { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800" },
  archived: { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-800" },
};

const DIVISION_COLORS = [
  { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-800" },
  { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-800" },
  { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-800" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-800" },
];

function getDivisionColor(division: string, divisionMap: Map<string, number>) {
  if (!divisionMap.has(division)) {
    divisionMap.set(division, divisionMap.size);
  }
  const idx = divisionMap.get(division)!;
  return DIVISION_COLORS[idx % DIVISION_COLORS.length];
}

function toDate(d: Date | string | null): Date | null {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

function formatDay(date: Date): string {
  return date.getDate().toString().padStart(2, "0");
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

export default function GanttChartWidget({ data }: GanttChartWidgetProps) {
  const { days, startEpoch, totalDays, monthLabel, todayOffset, rows } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Show a window: 7 days before today to 21 days after = 28 days total
    const windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - 7);
    const windowEnd = new Date(today);
    windowEnd.setDate(windowEnd.getDate() + 21);

    const totalDays = 28;
    const startEpoch = windowStart.getTime();
    const dayMs = 86400000;

    // Generate day labels
    const days: { date: Date; label: string; isToday: boolean; isWeekend: boolean }[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(windowStart.getTime() + i * dayMs);
      const dayOfWeek = d.getDay();
      days.push({
        date: d,
        label: formatDay(d),
        isToday: d.getTime() === today.getTime(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Today offset (fraction of total width)
    const todayOffset = ((today.getTime() - startEpoch) / (totalDays * dayMs)) * 100;

    // Month label
    const monthLabel = formatMonthYear(today);

    // Calculate bar positions
    const divisionMap = new Map<string, number>();

    const rows = data
      .filter((p) => {
        const s = toDate(p.startDate);
        const e = toDate(p.endDate);
        if (!s) return false;
        const end = e || new Date(s.getTime() + dayMs);
        // Filter out items completely outside the window
        return end.getTime() >= windowStart.getTime() && s.getTime() <= windowEnd.getTime();
      })
      .map((p) => {
        const s = toDate(p.startDate)!;
        const e = toDate(p.endDate) || new Date(s.getTime() + dayMs);

        // Clamp to window
        const barStart = Math.max(s.getTime(), windowStart.getTime());
        const barEnd = Math.min(e.getTime(), windowEnd.getTime());

        const leftPct = ((barStart - startEpoch) / (totalDays * dayMs)) * 100;
        const widthPct = ((barEnd - barStart) / (totalDays * dayMs)) * 100;

        const color = getDivisionColor(p.division, divisionMap);

        return {
          id: p.id,
          title: p.title,
          division: p.division,
          status: p.status,
          leftPct: Math.max(0, leftPct),
          widthPct: Math.max(1, widthPct), // min 1% so it's visible
          color,
        };
      });

    return { days, startEpoch, totalDays, monthLabel, todayOffset, rows };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Proker Overview</h3>
          <Link href="/dashboard/proker" className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight size={16} />
          </Link>
        </div>
        <p className="text-gray-400 text-sm italic text-center py-8">
          Belum ada proker aktif saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-gray-800">Proker Overview</h3>
          <p className="text-xs text-gray-400 mt-0.5">{monthLabel} · {totalDays} hari</p>
        </div>
        <Link href="/dashboard/proker" className="p-1 hover:bg-gray-100 rounded-full transition">
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </div>

      {/* Gantt Chart Container */}
      <div className="relative w-full overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="flex border-b border-gray-100 pb-2 mb-1">
            {days.map((day, i) => (
              <div
                key={i}
                className={`flex-1 text-center text-[10px] font-medium ${
                  day.isToday
                    ? "text-orange-600 font-bold"
                    : day.isWeekend
                      ? "text-gray-300"
                      : "text-gray-400"
                }`}
              >
                {day.label}
              </div>
            ))}
          </div>

          {/* Chart Body (relative container for bars + today line) */}
          <div className="relative" style={{ minHeight: `${Math.max(rows.length * 40 + 8, 80)}px` }}>
            {/* Vertical grid lines (every 7 days) */}
            {[7, 14, 21].map((d) => (
              <div
                key={d}
                className="absolute top-0 bottom-0 w-px bg-gray-50"
                style={{ left: `${(d / totalDays) * 100}%` }}
              />
            ))}

            {/* Today vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-orange-400 z-10"
              style={{ left: `${todayOffset}%` }}
            >
              <div className="absolute -top-1 -left-[3px] w-[7px] h-[7px] bg-orange-400 rounded-full border-2 border-white" />
            </div>

            {/* Proker Bars */}
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="absolute h-7 flex items-center z-20"
                style={{
                  left: `${row.leftPct}%`,
                  width: `${row.widthPct}%`,
                  top: `${idx * 40 + 4}px`,
                }}
              >
                <Link
                  href={`/dashboard/proker/${row.id}`}
                  className={`w-full h-full flex items-center rounded-md border text-[11px] font-semibold px-2 truncate shadow-sm cursor-pointer hover:brightness-95 transition ${row.color.bg} ${row.color.border} ${row.color.text}`}
                  title={`${row.title} (${row.division})`}
                >
                  {row.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-50">
        {Array.from(new Set(rows.map((r) => r.division))).map((division) => {
          const color = rows.find((r) => r.division === division)?.color;
          return (
            <div key={division} className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className={`w-2.5 h-2.5 rounded-sm ${color?.bg} ${color?.border} border`} />
              {division}
            </div>
          );
        })}
      </div>
    </div>
  );
}
