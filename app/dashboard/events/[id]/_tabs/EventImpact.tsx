"use client";

import React from "react";
import Link from "next/link";
import { PenTool, ArrowRight, Image as ImageIcon } from "lucide-react";

export default function EventImpact({
  eventId,
  impacts = [], // Data publikasi yang terkait (kalau sudah ada)
}: {
  eventId: number;
  impacts: any[];
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Empty State / CTA */}
      {impacts.length === 0 ? (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl p-10 text-center">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-50">
            <PenTool size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Belum ada Impact Story
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Event ini belum memiliki publikasi impact. Buat cerita menarik
            tentang hasil kegiatan ini untuk ditampilkan di website publik.
          </p>
          <Link
            // Kirim query param eventId agar nanti form create bisa otomatis deteksi (Next Step Feature)
            href={`/dashboard/content/create?eventId=${eventId}`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            + Tulis Impact Story
          </Link>
        </div>
      ) : (
        // List Impact Story (Kalau sudah ada)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {impacts.map((imp) => (
            <div
              key={imp.id}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                {imp.fileUrl ? (
                  <img
                    src={imp.fileUrl}
                    alt={imp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-indigo-700 uppercase">
                  {imp.category}
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                  {imp.title}
                </h4>
                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                      imp.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {imp.status}
                  </span>
                  <Link
                    href={`/updates/${imp.slug}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
