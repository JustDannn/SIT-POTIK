import React from "react";
import { getLpjDetail } from "../actions";
import ReviewActions from "../_components/ReviewActions";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  User,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function LpjDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getLpjDetail(Number(params.id));
  if (!data) return notFound();

  const isPending = data.status === "submitted";

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* NAV */}
      <div className="mb-6">
        <Link
          href="/dashboard/lpj"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> Kembali ke List
        </Link>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
              Divisi {data.divisionName}
            </span>
            <span
              className={cn(
                "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full",
                data.status === "submitted"
                  ? "bg-yellow-100 text-yellow-700"
                  : data.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
              )}
            >
              {data.status === "submitted" ? "Menunggu Review" : data.status}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            {data.prokerTitle}
          </h1>
          <p className="text-gray-500">
            Diajukan pada{" "}
            {data.createdAt
              ? new Date(data.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </p>
        </div>

        {/* FILE PREVIEW SECTION */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-red-500">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Dokumen LPJ.pdf</p>
              <p className="text-xs text-gray-400">
                Klik download untuk memeriksa
              </p>
            </div>
          </div>
          <a
            href={data.filePath}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <Download size={16} /> Download
          </a>
        </div>
      </div>

      {/* UPLOADER INFO */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Informasi Pengaju
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
            {data.uploaderName?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 flex items-center gap-2">
              <User size={16} className="text-gray-400" /> {data.uploaderName}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Mail size={16} className="text-gray-400" /> {data.uploaderEmail}
            </p>
          </div>
        </div>
      </div>

      {/* NOTES AREA (Jika Rejected) */}
      {data.status === "rejected" && data.notes && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-2">
            <AlertTriangle size={18} /> Catatan Revisi
          </h3>
          <p className="text-red-700 text-sm leading-relaxed whitespace-pre-wrap">
            {data.notes}
          </p>
        </div>
      )}

      {/* ACTION AREA (Cuma muncul kalau status Pending) */}
      {isPending && (
        <div className="sticky bottom-6 shadow-2xl rounded-2xl overflow-hidden">
          <ReviewActions id={data.id} />
        </div>
      )}
    </div>
  );
}
