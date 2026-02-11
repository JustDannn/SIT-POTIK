"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  CircleDashed,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateEventStatus } from "../actions";

// Interface untuk Event
interface EventItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  status: string | null;
  location: string | null;
  description?: string | null;
}

// Definisi Kolom Kanban
const COLUMNS = [
  {
    id: "planned",
    title: "Planned",
    color: "bg-blue-50 text-blue-700",
    icon: CircleDashed,
  },
  {
    id: "ongoing",
    title: "On Going",
    color: "bg-orange-50 text-orange-700",
    icon: Clock,
  },
  {
    id: "completed",
    title: "Completed",
    color: "bg-green-50 text-green-700",
    icon: CheckCircle2,
  },
  {
    id: "canceled",
    title: "Canceled",
    color: "bg-red-50 text-red-700",
    icon: XCircle,
  },
];

// --- SUB-COMPONENT: KARTU EVENT (DRAGGABLE) ---
function EventCard({
  event,
  isOverlay = false,
}: {
  event: EventItem;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id.toString(),
      data: { event },
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all group relative",
        isDragging ? "opacity-30" : "opacity-100",
        isOverlay
          ? "shadow-2xl rotate-2 scale-105 border-indigo-500 cursor-grabbing z-50"
          : "",
      )}
    >
      {/* Header Kecil: Tanggal */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
        <Calendar size={12} />
        {new Date(event.startDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        })}
      </div>

      {/* Judul */}
      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
        {event.title}
      </h4>

      {/* Lokasi */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <MapPin size={12} className="text-gray-400" />
        <span className="truncate max-w-37.5">
          {event.location || "Online"}
        </span>
      </div>

      {/* Action Footer (Link Detail) */}
      {!isOverlay && (
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <Link
            href={`/dashboard/events/${event.id}`}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Detail →
          </Link>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: KOLOM KANBAN (DROPPABLE) ---
function KanbanColumn({
  id,
  title,
  color,
  icon: Icon,
  events,
}: {
  id: string;
  title: string;
  color: string;
  icon: React.ElementType;
  events: EventItem[];
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-w-70 w-full md:w-1/4">
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-t-2xl border-b-2 border-white",
          color,
        )}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
        </div>
        <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold min-w-6 text-center">
          {events.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className="bg-gray-50/50 flex-1 p-3 rounded-b-2xl border border-t-0 border-gray-100 space-y-3 min-h-125"
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}

        {events.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-300 text-sm italic py-10 border-2 border-dashed border-gray-100 rounded-xl">
            Kosong
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function EventsKanbanView({
  initialEvents,
}: {
  initialEvents: EventItem[];
}) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [activeDragItem, setActiveDragItem] = useState<EventItem | null>(null);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Handle saat drag dimulai (untuk overlay visual)
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = events.find((e) => e.id.toString() === active.id);
    setActiveDragItem(item ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const eventId = parseInt(active.id as string);
    const newStatus = over.id as string;

    // Cari event yang sedang didrag
    const currentEvent = events.find((e) => e.id === eventId);

    // Jika status tidak berubah, skip
    if (!currentEvent || currentEvent.status === newStatus) return;

    // 1. Optimistic Update (Update UI duluan biar cepet)
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e)),
    );

    // 2. Server Update
    const result = await updateEventStatus(eventId, newStatus);

    // 3. Rollback jika gagal
    if (result.error) {
      alert("Gagal update status!");
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, status: currentEvent.status } : e,
        ),
      );
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-8 items-start h-full">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            icon={col.icon}
            events={events.filter((e) => e.status === col.id)}
          />
        ))}
      </div>

      {/* Overlay: Efek visual kartu melayang saat didrag */}
      <DragOverlay>
        {activeDragItem ? <EventCard event={activeDragItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
