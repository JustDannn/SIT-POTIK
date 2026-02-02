import React from "react";
import Link from "next/link";
import { createPartner } from "../actions";
import { ArrowLeft, Save, Building2 } from "lucide-react";

export default function CreatePartnerPage() {
  return (
    <div className="max-w-xl mx-auto pb-20 pt-6">
      <Link
        href="/dashboard/partners"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Kembali
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={20} className="text-indigo-600" /> Tambah Partner
            Baru
          </h1>
          <p className="text-sm text-gray-500">
            Masukkan data instansi atau kolaborator.
          </p>
        </div>

        <form action={createPartner} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nama Partner <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="Contoh: Desa Wisata Pujon Kidul"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Tipe Instansi
              </label>
              <select
                name="type"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Desa">Desa / Kelurahan</option>
                <option value="Instansi">Instansi Pemerintah</option>
                <option value="Kampus">Kampus / Sekolah</option>
                <option value="Media">Media Partner</option>
                <option value="Komunitas">Komunitas / Org</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Kontak PIC
              </label>
              <input
                name="picContact"
                placeholder="Nama - 0812xxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Catatan Awal
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Rencana kolaborasi, status negosiasi awal, dll..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <Save size={18} /> Simpan Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
