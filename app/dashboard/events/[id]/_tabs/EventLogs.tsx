"use client";

import React from "react";
import { History, Activity } from "lucide-react";

export default function EventLogs({
  eventId,
  logs = [],
}: {
  eventId: number;
  logs: any[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
        <History size={20} className="text-indigo-600" /> Riwayat Aktivitas
      </h3>

      <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
        {logs.length === 0 ? (
          <div className="pl-8 text-gray-400 italic">
            Belum ada log aktivitas.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="relative pl-8">
              {/* Dot */}
              <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-100">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto mt-0.5"></div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <div>
                  <p className="text-gray-900 font-medium">{log.notes}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Oleh:{" "}
                    <span className="font-bold text-gray-700">
                      {log.userName || "User"}
                    </span>
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
