import React from "react";
import Link from "next/link";
import { getProkerFinanceSummary } from "./actions";
import { ArrowUpRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper
const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default async function ProkerFinancePage() {
  const data = await getProkerFinanceSummary();

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Keuangan Program Kerja
        </h1>
        <p className="text-gray-500 text-sm">
          Monitoring anggaran tiap divisi.
        </p>
      </div>

      {/* GRID CARD PROKER */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/finance/proker/${item.id}`}
            className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300"
          >
            {/* Header Card */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.divisionName}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>
              <div className="p-2 bg-gray-50 rounded-full group-hover:bg-orange-50 text-gray-400 group-hover:text-orange-500 transition-colors">
                <ArrowUpRight size={20} />
              </div>
            </div>

            {/* Saldo Besar */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-1">Sisa Saldo Proker</p>
              <h2
                className={cn(
                  "text-2xl font-extrabold",
                  item.balance >= 0 ? "text-gray-900" : "text-red-600",
                )}
              >
                {formatRupiah(item.balance)}
              </h2>
            </div>

            {/* Income vs Expense Row */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex-1">
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium mb-1">
                  <TrendingUp size={12} /> Masuk
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {formatRupiah(item.income)}
                </p>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-xs text-red-600 font-medium mb-1">
                  <TrendingDown size={12} /> Keluar
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {formatRupiah(item.expense)}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {data.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <Wallet className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">
              Belum ada program kerja yang terdaftar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
