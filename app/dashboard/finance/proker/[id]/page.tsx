import React from "react";
import Link from "next/link";
import { getProkerTransactions } from "../actions";
import { ArrowLeft, Plus, Download, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default async function ProkerFinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { proker, transactions } = await getProkerTransactions(Number(id));

  if (!proker) return notFound();

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER NAV */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/finance/proker"
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{proker.title}</h1>
          <p className="text-sm text-gray-500">
            Divisi {proker.division.divisionName}
          </p>
        </div>
        <Link
          href={`/dashboard/finance/proker/${id}/add`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium transition-colors"
        >
          <Plus size={16} /> Catat Transaksi
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Keterangan</th>
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
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full uppercase",
                      t.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
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
                  colSpan={4}
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  Belum ada transaksi tercatat untuk proker ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
