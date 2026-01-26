// src/components/dashboard/widgets/TimelineWidget.tsx
import React from "react";
import { ChevronRight } from "lucide-react";

// Tipe data visual buat timeline
type TimelineEvent = {
  id: number;
  title: string;
  dateStart: string;
  color: string; // "bg-blue-100 text-blue-700"
  colStart: number; // Grid column start (simulasi hari)
  colSpan: number; // Durasi hari
  row: number; // Baris ke berapa
};

export default function TimelineWidget() {
  // Simulasi data biar persis gambar
  const events: TimelineEvent[] = [
    {
      id: 1,
      title: "Pelatihan Literasi",
      dateStart: "07-09 Nov",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      colStart: 1,
      colSpan: 3,
      row: 2,
    },
    {
      id: 2,
      title: "Infografis",
      dateStart: "09-11 Nov",
      color: "bg-orange-100 text-orange-700 border-orange-200",
      colStart: 3,
      colSpan: 3,
      row: 1,
    },
    {
      id: 3,
      title: "Pembinaan BPS",
      dateStart: "12 Nov",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      colStart: 6,
      colSpan: 1,
      row: 2,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">Proker Overview (November)</h3>
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Timeline Container */}
      <div className="relative w-full overflow-x-auto pb-4">
        {/* Grid Background (7 Hari) */}
        <div className="grid grid-cols-7 gap-4 min-w-[600px] text-xs text-gray-400 mb-4 text-center border-b border-gray-100 pb-2">
          <div>07 Nov</div>
          <div>08 Nov</div>
          <div>09 Nov</div>
          <div>10 Nov</div>
          <div className="text-orange-500 font-bold">11 Nov</div>
          <div>12 Nov</div>
          <div>13 Nov</div>
        </div>

        {/* Vertical Line for "Today" */}
        <div className="absolute top-8 bottom-0 left-[64%] w-px bg-orange-400 z-0 hidden md:block">
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-orange-400 rounded-full border-2 border-white"></div>
        </div>

        {/* Events Bars */}
        <div className="relative grid grid-cols-7 gap-4 min-w-[600px] h-32 z-10">
          {events.map((event) => (
            <div
              key={event.id}
              className={`flex items-center justify-center rounded-lg border text-xs font-semibold shadow-sm px-2 cursor-pointer hover:brightness-95 transition ${event.color}`}
              style={{
                gridColumnStart: event.colStart,
                gridColumnEnd: `span ${event.colSpan}`,
                gridRowStart: event.row,
                marginTop: "8px",
                marginBottom: "8px",
              }}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
