import React from "react";
import Link from "next/link";
import { getLpjs } from "./actions";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function LpjListPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const view = (searchParams.view === "history" ? "history" : "pending") as
    | "pending"
    | "history";
  const data = await getLpjs(view);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review LPJ</h1>
          <p className="text-sm text-gray-500">
            Verifikasi laporan pertanggungjawaban proker.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
        <Link
          href="/dashboard/lpj?view=pending"
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            view === "pending"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900",
          )}
        >
          Perlu Review
        </Link>
        <Link
          href="/dashboard/lpj?view=history"
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            view === "history"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900",
          )}
        >
          Riwayat
        </Link>
      </div>

      {/* LIST CARD */}
      <div className="grid gap-4">
        {data.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/lpj/${item.id}`}
            className="group block bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon Status */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    item.status === "submitted"
                      ? "bg-yellow-50 text-yellow-600"
                      : item.status === "approved"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600",
                  )}
                >
                  {item.status === "submitted" && <Clock size={24} />}
                  {item.status === "approved" && <CheckCircle2 size={24} />}
                  {item.status === "rejected" && <XCircle size={24} />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item.divisionName}
                    </span>
                    <span className="text-xs text-gray-400">
                      •{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                    {item.prokerTitle}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Diupload oleh{" "}
                    <span className="font-medium text-gray-700">
                      {item.uploaderName}
                    </span>
                  </p>
                </div>
              </div>

              <ChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>
        ))}

        {data.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <Filter className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-gray-500">Tidak ada data LPJ di tab ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
