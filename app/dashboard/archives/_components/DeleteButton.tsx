"use client";

import { Trash2, Loader2 } from "lucide-react";
import { deleteArchive } from "../actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ id, fileUrl }: { id: number; fileUrl: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Yakin hapus dokumen ini permanen?")) {
      setLoading(true);
      await deleteArchive(id, fileUrl);
      setLoading(false);
      router.refresh(); // Refresh halaman biar data ilang
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Hapus"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
