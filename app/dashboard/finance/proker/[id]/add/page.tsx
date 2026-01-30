"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { addTransaction } from "../../actions";
import { ArrowLeft, Loader2, Save, DollarSign } from "lucide-react";

export default function AddTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("expense");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("prokerId", id);

    const res = await addTransaction(formData);

    if (res.success) {
      router.push(`/dashboard/finance/proker/${id}`);
    } else {
      alert("Gagal menyimpan!");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto pb-20 pt-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} /> Kembali
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-bold text-gray-900">
            Catat Transaksi Proker
          </h1>
          <p className="text-sm text-gray-500">
            Pastikan bukti transaksi disimpan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* TOGGLE TYPE */}
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${type === "income" ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500/20" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="type"
                value="income"
                className="hidden"
                onChange={() => setType("income")}
              />
              <span className="block font-bold">Pemasukan</span>
              <span className="text-xs">Sponsorship/Dana Usaha</span>
            </label>
            <label
              className={`cursor-pointer border rounded-xl p-4 text-center transition-all ${type === "expense" ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="type"
                value="expense"
                className="hidden"
                onChange={() => setType("expense")}
                defaultChecked
              />
              <span className="block font-bold">Pengeluaran</span>
              <span className="text-xs">Belanja Kebutuhan</span>
            </label>
          </div>

          {/* NOMINAL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nominal (Rp)
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                Rp
              </div>
              <input
                required
                name="amount"
                type="number"
                min="0"
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* DESKRIPSI & TANGGAL */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <input
                required
                name="description"
                type="text"
                placeholder="Contoh: Beli konsumsi rapat"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Transaksi
              </label>
              <input
                required
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-medium transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            Simpan Transaksi
          </button>
        </form>
      </div>
    </div>
  );
}
