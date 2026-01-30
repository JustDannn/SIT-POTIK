"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LogsView({ logs }: { logs: any[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Task, Publication

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.title.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase());

    const matchType =
      filterType === "All"
        ? true
        : filterType === "Task"
          ? log.type === "task"
          : log.type === "publication";

    return matchSearch && matchType;
  });

  // Helper Format Tanggal (Relatif: "2 jam yang lalu")
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-end">
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-orange-600" /> Aktivitas Divisi
          </h2>
          <p className="text-gray-500 text-sm">
            Memantau pergerakan tugas dan publikasi tim.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari user atau aktivitas..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">Semua</option>
            <option value="Task">Tugas</option>
            <option value="Publication">Publikasi</option>
          </select>
        </div>
      </div>

      {/* TIMELINE LIST */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative">
        {/* Garis Vertikal Timeline */}
        <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-gray-100" />

        <div className="space-y-8 relative">
          {filteredLogs.map((log, index) => (
            <div key={log.id} className="flex gap-4 group">
              {/* ICON BULLET */}
              <div
                className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm",
                  log.type === "task"
                    ? log.meta === "done"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                    : log.meta === "published"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-orange-100 text-orange-600",
                )}
              >
                {log.type === "task" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <FileText size={16} />
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-bold">{log.user}</span>
                    <span className="text-gray-500 mx-1">{log.action}</span>
                    <span className="font-medium text-gray-800">
                      "{log.title}"
                    </span>
                  </p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                    <Clock size={10} />
                    {formatTimeAgo(log.timestamp)}
                  </span>
                </div>

                <div className="flex gap-2 mt-2">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                      log.type === "task"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700",
                    )}
                  >
                    {log.type === "task" ? "Task" : "Content"}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                      log.meta === "done" || log.meta === "published"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200",
                    )}
                  >
                    {log.meta}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">
                Tidak ada aktivitas yang ditemukan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
