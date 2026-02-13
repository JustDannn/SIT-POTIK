"use client";

import React, { useState } from "react";
import { History, Send, Loader2, MessageSquarePlus } from "lucide-react";
import { addEventLog } from "../../actions";

interface EventLog {
  notes: string;
  userName: string;
  createdAt: string | Date;
}

export default function EventLogs({
  eventId,
  logs = [],
  type = "program",
}: {
  eventId: number;
  logs: EventLog[];
  type?: "program" | "proker";
}) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setLoading(true);
    const res = await addEventLog(eventId, note, type);
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      setNote("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* FORM INPUT LOG BARU */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquarePlus size={18} className="text-indigo-600" /> Catat
          Aktivitas Baru
        </h4>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            placeholder="Apa progress kegiatan hari ini? (Misal: Rapat fixasi rundown...)"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !note.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            Simpan
          </button>
        </form>
      </div>

      {/* LIST RIWAYAT */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <History size={20} className="text-indigo-600" /> Timeline Aktivitas
        </h3>

        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
          {logs.length === 0 ? (
            <div className="pl-8 text-gray-400 italic py-4">
              Belum ada log aktivitas. Mulai catat progress sekarang!
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="relative pl-8 group">
                {/* Dot */}
                <div className="absolute -left-2.25 top-1 w-5 h-5 rounded-full bg-white border-4 border-indigo-100 group-hover:border-indigo-200 transition-colors">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto mt-[2.5px]"></div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <p className="text-gray-900 font-medium text-sm sm:text-base leading-relaxed">
                      {log.notes}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      Oleh:{" "}
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {log.userName || "User"}
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 shrink-0 bg-gray-50 px-2 py-1 rounded">
                    {new Date(log.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
