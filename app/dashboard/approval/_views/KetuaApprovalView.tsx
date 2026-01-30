"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  FileText,
  Clock,
  User,
  AlertCircle,
  Search,
} from "lucide-react";
import { approveDocument, rejectDocument } from "../actions"; // Import server actions
import { cn } from "@/lib/utils";

const getTypeBadge = (type: string) => {
  switch (type) {
    case "proposal":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "lpj":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function KetuaApprovalView({ data }: { data: any[] }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // Filter Data Client-Side
  const pendingItems = data.filter((d) => d.status === "pending");
  const historyItems = data.filter((d) => d.status !== "pending");

  const displayData = activeTab === "pending" ? pendingItems : historyItems;

  const handleApprove = async (id: number) => {
    if (!confirm("Yakin ingin menyetujui dokumen ini?")) return;
    setIsProcessing(id);
    await approveDocument(id);
    setIsProcessing(null);
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Masukkan alasan revisi/penolakan:");
    if (!reason) return;

    setIsProcessing(id);
    await rejectDocument(id, reason);
    setIsProcessing(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pusat Persetujuan
          </h1>
          <p className="text-gray-500 text-sm">
            Review dan putuskan nasib dokumen proker.
          </p>
        </div>
      </div>

      {/* Tabs */}
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
          <AlertCircle size={16} />
          Menunggu Review
          {pendingItems.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
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

      {/* Content List */}
      <div className="grid gap-4">
        {displayData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">
            {activeTab === "pending"
              ? "Hore! Tidak ada dokumen yang perlu direview."
              : "Belum ada riwayat dokumen."}
          </div>
        ) : (
          displayData.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Kiri: Info Dokumen */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                  <FileText size={24} className="text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                        getTypeBadge(item.type),
                      )}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />{" "}
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <User size={14} /> {item.submitterName}
                    </span>
                    <span>•</span>
                    <span>{item.prokerName}</span>
                  </div>
                  {/* Show notes if rejected */}
                  {item.status === "rejected" && (
                    <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons (Cuma muncul kalau status pending) */}
              {item.status === "pending" ? (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(item.id)}
                    disabled={isProcessing === item.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={18} /> Tolak
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={isProcessing === item.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isProcessing === item.id ? (
                      "Loading..."
                    ) : (
                      <>
                        <Check size={18} /> Setuju
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="shrink-0">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase",
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
