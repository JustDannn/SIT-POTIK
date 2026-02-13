"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  User,
  ChevronRight,
  LayoutList,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ProkerGanttChart from "../_components/ProkerGanttChart";

// Helper buat warna badge status
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "created":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Helper buat label status (Biar rapi huruf kapitalnya)
const getStatusLabel = (status: string) => {
  if (status === "created") return "Planning";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

interface ProkerItem {
  id: number;
  title: string;
  divisionName: string;
  picName: string;
  status: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  progress: number;
}

export default function KetuaProkerView({ data }: { data: ProkerItem[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "gantt">("list");

  // Logic Filter Client-Side
  const filteredData = data.filter((item) => {
    const matchStatus = filter === "all" || item.status === filter;
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.divisionName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Daftar Program Kerja
          </h1>
          <p className="text-gray-500 text-sm">
            Pantau semua proker lintas divisi di sini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search & Filter (only in list mode) */}
          {viewMode === "list" && (
            <>
              <div className="relative hidden sm:block">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari proker / divisi..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Filter size={16} /> Filter Divisi
              </button>
            </>
          )}

          {/* View Toggle (always far right) */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <LayoutList size={14} /> List
            </button>
            <button
              onClick={() => setViewMode("gantt")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                viewMode === "gantt"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <BarChart3 size={14} /> Gantt
            </button>
          </div>
        </div>
      </div>

      {/* GANTT VIEW */}
      {viewMode === "gantt" && (
        <ProkerGanttChart
          data={filteredData.map((p) => ({
            id: p.id,
            title: p.title,
            divisionName: p.divisionName,
            status: p.status,
            startDate: p.startDate,
            endDate: p.endDate,
          }))}
        />
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <>
          {/* 2. Tabs Status */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {["all", "active", "completed", "created"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={cn(
                    "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors",
                    filter === tab
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  )}
                >
                  {tab === "created" ? "Planning" : tab}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab === "all"
                      ? data.length
                      : data.filter((d) => d.status === tab).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* 3. Proker List */}
          <div className="grid gap-4">
            {filteredData.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">
                  Tidak ada proker yang ditemukan.
                </p>
              </div>
            ) : (
              filteredData.map((proker) => (
                <Link
                  key={proker.id}
                  href={`/dashboard/proker/${proker.id}`}
                  className="block"
                >
                  <div className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer relative overflow-hidden">
                    <div
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        proker.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-orange-500",
                      )}
                    ></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-gray-100 text-gray-500 border border-gray-200">
                            {proker.divisionName}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium border",
                              getStatusColor(proker.status),
                            )}
                          >
                            {getStatusLabel(proker.status)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          {proker.title}
                        </h3>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <User size={14} />
                            <span className="truncate max-w-37.5">
                              {proker.picName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>
                              Deadline:{" "}
                              {proker.endDate
                                ? new Date(
                                    proker.endDate,
                                  ).toLocaleDateString("id-ID")
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-48">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-semibold text-gray-900">
                            {proker.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              proker.status === "completed"
                                ? "bg-emerald-500"
                                : "bg-orange-500",
                            )}
                            style={{ width: `${proker.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
