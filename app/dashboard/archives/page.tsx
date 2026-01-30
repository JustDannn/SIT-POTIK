import React from "react";
import Link from "next/link";
import { getArchives } from "./actions";
import {
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Filter,
  File,
} from "lucide-react";
import { DeleteButton } from "./_components/DeleteButton";

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string };
}) {
  const query = searchParams.q || "";
  const category = searchParams.cat || "all";

  const data = await getArchives(query, category);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arsip Dokumen</h1>
          <p className="text-gray-500 text-sm">
            Database surat masuk, keluar, SK, dan proposal.
          </p>
        </div>
        <Link
          href="/dashboard/archives/upload"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
        >
          <Plus size={18} /> Upload Dokumen
        </Link>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <form>
            <input
              name="q"
              defaultValue={query}
              placeholder="Cari nama dokumen..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {/* Keep category filter when searching */}
            <input type="hidden" name="cat" value={category} />
          </form>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter size={18} className="text-gray-400 shrink-0" />
          {[
            { label: "Semua", value: "all" },
            { label: "Surat Masuk", value: "surat_masuk" },
            { label: "Surat Keluar", value: "surat_keluar" },
            { label: "Proposal", value: "proposal" },
            { label: "SK", value: "sk" },
          ].map((filter) => (
            <Link
              key={filter.value}
              href={`/dashboard/archives?q=${query}&cat=${filter.value}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                category === filter.value
                  ? "bg-orange-100 text-orange-700 border-orange-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {/* DOCUMENT GRID / LIST */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Nama Dokumen</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Diupload Oleh</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-50">
                        {item.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                    {item.category?.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.uploaderName}</td>
                <td className="px-6 py-4 text-gray-600">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a
                      href={item.fileUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download / Lihat"
                    >
                      <Download size={16} />
                    </a>
                    {/* Komponen Delete Button Client Side */}
                    <DeleteButton id={item.id} fileUrl={item.fileUrl || ""} />
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  Belum ada arsip dokumen.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
