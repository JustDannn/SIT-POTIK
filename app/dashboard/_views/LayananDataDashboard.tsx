"use client";

import React, { useState } from "react";
import {
  Database,
  UserPlus,
  Users,
  BarChart3,
  Clock,
  Search,
  Save,
  Loader2,
} from "lucide-react";
import { addGuestEntry } from "../actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function LayananDataDashboard({
  data,
  user,
}: {
  data: any;
  user: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State Form
  const [showForm, setShowForm] = useState(false);

  const handleInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addGuestEntry(formData);
    setLoading(false);
    setShowForm(false);
    router.refresh(); // Refresh data table
  };

  // Helper hitung total layanan
  const getServiceCount = (type: string) =>
    data.serviceDistribution.find((s: any) => s.type === type)?.count || 0;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pos Layanan Data 📊
          </h1>
          <p className="text-sm text-gray-500">
            Rekap kunjungan tamu dan permintaan data statistik.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 font-bold shadow-lg shadow-cyan-200 transition-all"
        >
          <UserPlus size={20} /> {showForm ? "Tutup Form" : "Input Tamu Baru"}
        </button>
      </div>

      {/* INPUT FORM SECTION (Toggleable) */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-cyan-100 shadow-md animate-in slide-in-from-top-5">
          <h3 className="font-bold text-lg mb-4 text-cyan-800 flex items-center gap-2">
            <Database size={20} /> Form Buku Tamu (Absensi)
          </h3>
          <form
            onSubmit={handleInput}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Nama Pengunjung"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asal Instansi / Prodi
                </label>
                <input
                  name="institution"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Contoh: S1 Informatika / BPS Jatim"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. HP / WA (Opsional)
                </label>
                <input
                  name="phone"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="08xxxxx"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Layanan
                </label>
                <select
                  name="serviceType"
                  className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="permintaan_data">Permintaan Data</option>
                  <option value="konsultasi">Konsultasi Statistik</option>
                  <option value="instalasi_software">
                    Instalasi Software (SPSS/R)
                  </option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detail Kebutuhan
                </label>
                <textarea
                  name="needs"
                  required
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Contoh: Minta data inflasi Surabaya 2020-2024..."
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  disabled={loading}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}{" "}
                  Simpan Log
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-linear-to-br from-cyan-600 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-cyan-100 text-xs font-bold uppercase tracking-wider mb-1">
            Total Pengunjung (Bulan Ini)
          </p>
          <h3 className="text-4xl font-extrabold">{data.monthlyVisitors}</h3>
          <p className="text-xs text-cyan-100 mt-2 flex items-center gap-1">
            <Users size={12} /> Orang
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-2">
            Permintaan Data
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {getServiceCount("permintaan_data")}
            </span>
            <Database className="text-cyan-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-2">
            Konsultasi
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {getServiceCount("konsultasi")}
            </span>
            <Users className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-2">
            Instalasi / Lainnya
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {getServiceCount("instalasi_software") +
                getServiceCount("lainnya")}
            </span>
            <Clock className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* RECENT LOGS TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-cyan-600" /> Riwayat Pelayanan
            Terakhir
          </h3>
          {/* Bisa ditambah link ke page full history */}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Nama Tamu</th>
                <th className="px-6 py-3">Layanan</th>
                <th className="px-6 py-3">Kebutuhan</th>
                <th className="px-6 py-3">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentGuests.map((g: any) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(g.visitDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500">{g.institution}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        g.serviceType === "permintaan_data"
                          ? "bg-cyan-100 text-cyan-700"
                          : g.serviceType === "konsultasi"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-orange-100 text-orange-700",
                      )}
                    >
                      {g.serviceType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {g.needs}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {g.officerName?.split(" ")[0] || "-"}
                  </td>
                </tr>
              ))}
              {data.recentGuests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Belum ada data kunjungan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
