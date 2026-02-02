import React from "react";
import Link from "next/link";
import { getPartners, updatePartnerStatus, deletePartner } from "./actions";
import {
  Building2,
  Phone,
  Calendar,
  Plus,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function PartnersPage() {
  const data = await getPartners();

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relasi & Partner</h1>
          <p className="text-sm text-gray-500">
            Database mitra, sponsor, dan kolaborator.
          </p>
        </div>
        <Link
          href="/dashboard/partners/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Partner
        </Link>
      </div>

      {/* PARTNER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((partner) => (
          <div
            key={partner.id}
            className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-all shadow-sm"
          >
            {/* Header Card */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                    partner.type === "Desa"
                      ? "bg-green-500"
                      : partner.type === "Kampus"
                        ? "bg-blue-500"
                        : partner.type === "Media"
                          ? "bg-pink-500"
                          : "bg-gray-500",
                  )}
                >
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">
                    {partner.name}
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {partner.type}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1",
                  partner.status === "active"
                    ? "bg-green-100 text-green-700"
                    : partner.status === "inactive"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700",
                )}
              >
                {partner.status === "active" && <CheckCircle2 size={12} />}
                {partner.status === "inactive" && <XCircle size={12} />}
                {partner.status === "potential" && <Clock size={12} />}
                {partner.status}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{partner.picContact || "-"}</span>
              </div>
              {partner.lastFollowUp && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} className="text-gray-400" />
                  <span>
                    Follow-up:{" "}
                    {new Date(partner.lastFollowUp).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                </div>
              )}
              {partner.notes && (
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 italic">
                  "{partner.notes}"
                </div>
              )}
            </div>

            {/* Actions (Server Actions via Form) */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <form
                action={async () => {
                  "use server";
                  await deletePartner(partner.id);
                }}
              >
                <button className="text-gray-400 hover:text-red-600 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </form>

              <div className="flex gap-2">
                {partner.status !== "active" && (
                  <form
                    action={async () => {
                      "use server";
                      await updatePartnerStatus(partner.id, "active");
                    }}
                  >
                    <button className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded hover:bg-green-100 transition-colors">
                      Deal / Aktifkan
                    </button>
                  </form>
                )}
                {partner.status === "active" && (
                  <form
                    action={async () => {
                      "use server";
                      await updatePartnerStatus(partner.id, "inactive");
                    }}
                  >
                    <button className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition-colors">
                      Non-aktifkan
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <Building2 className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">Belum ada data partner.</p>
            <Link
              href="/dashboard/partners/create"
              className="text-indigo-600 font-bold hover:underline mt-2 inline-block"
            >
              Tambah Partner Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
