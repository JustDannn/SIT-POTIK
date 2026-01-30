"use client";

import React, { useRef } from "react";
import {
  Printer,
  PieChart,
  BarChart3,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DivisionReportView({
  data,
  divisionName,
}: {
  data: any;
  divisionName: string;
}) {
  // Tanggal Laporan (Hari ini)
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER CONTROL (Gak ikut ke-print) */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Divisi</h2>
          <p className="text-sm text-gray-500">
            Ringkasan kinerja untuk evaluasi bulanan.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium shadow-sm"
        >
          <Printer size={16} /> Cetak PDF
        </button>
      </div>

      {/* === KERTAS LAPORAN (AREA PRINT) === */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-8 md:p-12 min-h-[800px] print:shadow-none print:border-none print:p-0">
        {/* KOP SURAT SIMPLE */}
        <div className="border-b-2 border-gray-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
              Laporan Kinerja
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {divisionName} — Pojok Statistik
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Tanggal Cetak</p>
            <p className="text-md font-bold text-gray-900">{today}</p>
          </div>
        </div>

        {/* 1. OVERVIEW CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 print:border-gray-300">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <PieChart size={18} />{" "}
              <span className="text-sm font-medium">Rata-rata Progres</span>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">
              {data.overview.avgProgress}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Kelengkapan seluruh proker
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 print:border-gray-300">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FileText size={18} />{" "}
              <span className="text-sm font-medium">Total Publikasi</span>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">
              {data.overview.totalPublications}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Konten terbit bulan ini
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 print:border-gray-300">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Users size={18} />{" "}
              <span className="text-sm font-medium">Top Performer</span>
            </div>
            <p className="text-lg font-bold text-gray-900 truncate">
              {data.topMembers[0]?.name || "-"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {data.topMembers[0]?.tasksDone || 0} tugas selesai
            </p>
          </div>
        </div>

        {/* 2. DETAIL PROKER (Table) */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Status Program Kerja
          </h3>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Nama Program Kerja</th>
                  <th className="px-4 py-3 text-center">Tugas Selesai</th>
                  <th className="px-4 py-3">Progress Bar</th>
                  <th className="px-4 py-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.prokers.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {p.completedTasks} / {p.totalTasks}
                    </td>
                    <td className="px-4 py-3 w-1/3">
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            p.progress === 100
                              ? "bg-green-500"
                              : p.progress > 50
                                ? "bg-orange-500"
                                : "bg-red-500",
                          )}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">
                      {p.progress}%
                    </td>
                  </tr>
                ))}
                {data.prokers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">
                      Tidak ada data proker.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. RINCIAN PUBLIKASI */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} /> Output Publikasi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.publications.map((pub: any) => (
              <div
                key={pub.category}
                className="p-3 bg-white border border-gray-200 rounded-lg text-center"
              >
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">
                  {pub.category}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pub.count}
                </p>
              </div>
            ))}
            {data.publications.length === 0 && (
              <div className="col-span-4 p-4 text-center text-gray-400 text-sm border border-dashed rounded-lg">
                Belum ada publikasi bulan ini.
              </div>
            )}
          </div>
        </div>

        {/* 4. CATATAN EVALUASI (EDITABLE) */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <AlertCircle size={20} /> Catatan & Evaluasi
          </h3>
          <p className="text-xs text-gray-400 mb-2 print:hidden">
            Silakan ketik catatan tambahan di bawah ini sebelum mencetak.
          </p>

          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 text-sm min-h-[150px] focus:ring-2 focus:ring-black focus:border-transparent print:border-none print:p-0 print:resize-none print:min-h-0"
            placeholder="Tuliskan kendala, saran, atau catatan evaluasi untuk bulan ini..."
            defaultValue="Kegiatan berjalan lancar secara umum. Perlu peningkatan pada kecepatan publikasi konten infografis."
          />
        </div>

        {/* FOOTER TTD (Hanya muncul pas Print biar keren) */}
        <div className="hidden print:flex justify-end mt-20 break-inside-avoid">
          <div className="text-center w-48">
            <p className="text-sm text-gray-600 mb-20">Surabaya, {today}</p>
            <p className="font-bold text-gray-900 border-b border-gray-300 pb-1">
              Koordinator Riset
            </p>
            <p className="text-xs text-gray-400 mt-1">Pojok Statistik TUS</p>
          </div>
        </div>
      </div>

      {/* CSS KHUSUS PRINT */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            background: white;
          }
          nav,
          aside {
            display: none !important;
          } /* Sembunyikan Navbar/Sidebar */
        }
      `}</style>
    </div>
  );
}
