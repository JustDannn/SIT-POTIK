"use client";

import React from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default function TreasurerDashboard({
  data,
  user,
}: {
  data: any;
  user: any;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, Bendahara {user.name.split(" ")[0]}! 💸
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor arus kas dan laporan pertanggungjawaban.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/finance/general"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Catat Kas Umum
          </Link>
          <Link
            href="/dashboard/lpj"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors shadow-sm"
          >
            <FileText size={16} /> Review LPJ
          </Link>
        </div>
      </div>

      {/* FINANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL SALDO */}
        <div className="bg-linear-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Wallet size={18} /> Saldo Kas Saat Ini
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {formatRupiah(data.finance.balance)}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Total kas ditangan (Umum + Proker)
            </p>
          </div>
        </div>

        {/* PEMASUKAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center group hover:border-green-200 transition-all">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
            <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={16} />
            </div>
            Total Pemasukan
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(data.finance.income)}
          </h3>
        </div>

        {/* PENGELUARAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center group hover:border-red-200 transition-all">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-2">
            <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown size={16} />
            </div>
            Total Pengeluaran
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatRupiah(data.finance.expense)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT TRANSACTIONS */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <DollarSign size={18} className="text-orange-500" /> Transaksi
              Terakhir
            </h3>
            <Link
              href="/dashboard/finance"
              className="text-xs font-medium text-orange-600 hover:underline flex items-center gap-1"
            >
              Lihat Detail <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Keterangan</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentTransactions.map((tx: any) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {tx.description}
                      </p>
                      {tx.prokerTitle && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          Proker: {tx.prokerTitle}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-1 rounded-full font-bold uppercase",
                          tx.type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700",
                        )}
                      >
                        {tx.type === "income" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(tx.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-bold",
                        tx.type === "income"
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {tx.type === "income" ? "+" : "-"}{" "}
                      {formatRupiah(Number(tx.amount))}
                    </td>
                  </tr>
                ))}
                {data.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LPJ NEEDING REVIEW */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" /> Butuh Approval
            </h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {data.pendingLpjs.length}
            </span>
          </div>

          <div className="space-y-4">
            {data.pendingLpjs.map((lpj: any) => (
              <div
                key={lpj.id}
                className="p-3 bg-red-50/50 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-red-600 bg-white px-2 py-0.5 rounded shadow-sm border border-red-100">
                    LPJ Masuk
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(lpj.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {lpj.prokerTitle}
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Menunggu verifikasi bendahara.
                </p>
                <Link
                  href={`/dashboard/lpj/${lpj.id}`}
                  className="block w-full text-center text-xs font-medium bg-white text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                >
                  Review Sekarang
                </Link>
              </div>
            ))}

            {data.pendingLpjs.length === 0 && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900">Semua Aman!</p>
                <p className="text-xs text-gray-500">
                  Tidak ada LPJ yang perlu di-review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
