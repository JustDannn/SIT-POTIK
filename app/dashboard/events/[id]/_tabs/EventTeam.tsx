"use client";

import React from "react";
import { User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventTeam({
  eventId,
  participants = [],
}: {
  eventId: number;
  participants: any[];
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900">
          Tim Pelaksana ({participants.length})
        </h3>
        {/* Tombol Add Member bisa ditaruh sini nanti */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
            Belum ada anggota tim yang ditugaskan.
          </div>
        ) : (
          participants.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                  p.role === "PIC"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {p.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-bold text-gray-900 line-clamp-1">
                  {p.user?.name || "Unknown User"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {p.role === "PIC" && (
                    <ShieldCheck size={14} className="text-orange-500" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-bold uppercase",
                      p.role === "PIC" ? "text-orange-600" : "text-gray-500",
                    )}
                  >
                    {p.role}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
