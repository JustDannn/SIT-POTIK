"use client";

import React, { useState } from "react";
import { reviewLpj } from "../actions";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Save, X } from "lucide-react";

export default function ReviewActions({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  // Handle Approve
  const handleApprove = async () => {
    if (!confirm("Apakah Anda yakin menyetujui LPJ ini?")) return;

    setLoading(true);
    await reviewLpj(id, "approved");
    setLoading(false);
    router.refresh(); // Refresh buat update UI status
  };

  // Handle Reject
  const handleRejectSubmit = async () => {
    if (!rejectNote.trim()) {
      alert("Mohon isi catatan revisi!");
      return;
    }

    setLoading(true);
    await reviewLpj(id, "rejected", rejectNote);
    setLoading(false);
    setShowRejectForm(false);
    router.refresh();
  };

  return (
    <div className="bg-white border-t border-gray-200 p-6">
      {!showRejectForm ? (
        <div className="flex gap-4">
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            <XCircle size={20} /> Tolak / Revisi
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-2 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            Setujui LPJ
          </button>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-red-700">
              Catatan Revisi (Wajib)
            </label>
            <button
              onClick={() => setShowRejectForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            className="w-full p-3 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
            rows={3}
            placeholder="Jelaskan bagian mana yang perlu diperbaiki..."
          />
          <button
            onClick={handleRejectSubmit}
            disabled={loading}
            className="w-full py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50 flex justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Kirim Revisi"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
