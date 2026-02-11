"use client";

import React, { useState } from "react";
import EventsListView from "../_views/EventsListView";
import EventsGalleryView from "../_views/EventsGalleryView";
import EventsKanbanView from "../_views/EventsKanbanView";
import EventCalendar from "./EventCalendar";
import CreateEventDialog from "./CreateEventDialog";
import {
  LayoutList,
  LayoutGrid,
  GanttChart,
  Kanban as KanbanIcon,
  CalendarPlus,
  Search,
  Clock,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  image: string | null;
}

interface EventItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  status: string | null;
  location: string | null;
  description?: string | null;
}

type ViewMode = "list" | "gallery" | "timeline" | "kanban";

const VIEW_TABS: { key: ViewMode; label: string; icon: React.ElementType }[] = [
  { key: "kanban", label: "Kanban", icon: KanbanIcon },
  { key: "list", label: "List", icon: LayoutList },
  { key: "gallery", label: "Galeri", icon: LayoutGrid },
  { key: "timeline", label: "Timeline", icon: GanttChart },
];

export default function EventsClientWrapper({
  initialEvents,
  divisionMembers,
}: {
  initialEvents: EventItem[];
  divisionMembers: Member[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "history">("upcoming");

  // Client-side filtering (shared across list & gallery)
  const filteredEvents = initialEvents.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const isHistory = ["completed", "canceled"].includes(event.status ?? "");
    return filter === "upcoming"
      ? matchesSearch && !isHistory
      : matchesSearch && isHistory;
  });

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Kegiatan</h1>
          <p className="text-gray-500 mt-1">
            Kelola jadwal pelatihan dan event divisi.
          </p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 text-sm font-bold transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
        >
          <CalendarPlus size={18} />
          <span>Jadwalkan Baru</span>
        </button>
      </div>

      {/* VIEW TABS + SEARCH + FILTER — single bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        {/* View Tabs (left) */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shrink-0">
          {VIEW_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all",
                viewMode === key
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
              )}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Search (middle, expands) — hidden in timeline mode */}
        {viewMode !== "timeline" && viewMode !== "kanban" && (
          <>
            <div className="relative flex-1 w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama kegiatan..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter (right) */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shrink-0">
              <button
                onClick={() => setFilter("upcoming")}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all",
                  filter === "upcoming"
                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50",
                )}
              >
                <Clock size={14} />
                <span>Akan Datang</span>
              </button>
              <button
                onClick={() => setFilter("history")}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all",
                  filter === "history"
                    ? "bg-gray-100 text-gray-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50",
                )}
              >
                <History size={14} />
                <span>Riwayat</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}
      {viewMode === "kanban" && (
        <EventsKanbanView initialEvents={initialEvents} />
      )}
      {viewMode === "list" && <EventsListView events={filteredEvents} />}
      {viewMode === "gallery" && <EventsGalleryView events={filteredEvents} />}
      {viewMode === "timeline" && <EventCalendar events={initialEvents} />}

      {/* MODAL DIALOG */}
      <CreateEventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        divisionMembers={divisionMembers}
      />
    </div>
  );
}
