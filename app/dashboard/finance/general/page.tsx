import React from "react";
import Link from "next/link";
import { getGeneralFinance } from "./actions";
import {
  ArrowLeft,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default async function GeneralFinancePage() {
  const { summary, transactions } = await getGeneralFinance();

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kas Umum Organisasi
            </h1>
            <p className="text-gray-500 text-sm">
              Dana operasional, kas rutin, dan denda.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/finance/general/add"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium transition-colors shadow-lg shadow-gray-200"
        >
          <Plus size={18} /> Catat Transaksi
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SALDO */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-2">
              <Wallet size={18} /> Sisa Saldo Umum
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {formatRupiah(summary.balance)}
            </h2>
          </div>
        </div>

        {/* PEMASUKAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={16} />
            </div>
            Pemasukan Umum
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(summary.income)}
          </h3>
        </div>

        {/* PENGELUARAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
            <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown size={16} />
            </div>
            Pengeluaran Operasional
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(summary.expense)}
          </h3>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Riwayat Mutasi Kas</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Keterangan</th>
              <th className="px-6 py-4">Dicatat Oleh</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {t.date
                      ? new Date(t.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {t.description}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={14} /> {t.recordedBy?.split(" ")[0]}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full uppercase",
                      t.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {t.type === "income" ? "Masuk" : "Keluar"}
                  </span>
                </td>
                <td
                  className={cn(
                    "px-6 py-4 text-right font-bold font-mono",
                    t.type === "income" ? "text-green-600" : "text-red-600",
                  )}
                >
                  {t.type === "income" ? "+" : "-"}{" "}
                  {formatRupiah(Number(t.amount))}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  Belum ada transaksi kas umum.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
