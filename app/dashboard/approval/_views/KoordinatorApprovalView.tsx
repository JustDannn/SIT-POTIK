"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  AlertCircle,
  Search,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionItem {
  id: number;
  title: string;
  type: string;
  status: string;
  prokerName: string;
  date: Date | string;
  notes: string | null;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "submitted":
      return {
        label: "Menunggu Review",
        color: "bg-amber-100 text-amber-700 border-amber-200",
        icon: Clock,
      };
    case "approved":
      return {
        label: "Disetujui",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        label: "Ditolak / Revisi",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      };
    default:
      return {
        label: "Draft",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: FileText,
      };
  }
};

export default function KoordinatorApprovalView({
  data,
  userName,
}: {
  data: SubmissionItem[];
  userName: string;
}) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [search, setSearch] = useState("");

  const pendingItems = data.filter((d) => d.status === "submitted");
  const historyItems = data.filter(
    (d) => d.status === "approved" || d.status === "rejected",
  );
  const displayData = activeTab === "pending" ? pendingItems : historyItems;

  const filteredData = displayData.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.prokerName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Status Pengajuan Saya
        </h1>
        <p className="text-gray-500 text-sm">
          Lacak status laporan, LPJ, dan dokumen yang sudah kamu kirim ke Ketua.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock size={18} className="text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Menunggu Review
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {pendingItems.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Disetujui</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.filter((d) => d.status === "approved").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={18} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Ditolak / Revisi
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.filter((d) => d.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
              activeTab === "pending"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <Send size={16} />
            Menunggu
            {pendingItems.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full">
                {pendingItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
              activeTab === "history"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <Clock size={16} />
            Riwayat
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari dokumen..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">
            <Send className="mx-auto mb-3 text-gray-300" size={32} />
            <p>
              {activeTab === "pending"
                ? "Tidak ada pengajuan yang menunggu review."
                : "Belum ada riwayat pengajuan."}
            </p>
          </div>
        ) : (
          filteredData.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200">
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />{" "}
                          {new Date(item.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Proker: {item.prokerName}
                      </p>

                      {item.status === "rejected" && item.notes && (
                        <div className="mt-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs text-red-600">
                            <span className="font-semibold">
                              Catatan Ketua:
                            </span>{" "}
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase border",
                        statusConfig.color,
                      )}
                    >
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
