import React from "react";
import { getMembersWithLastLog } from "../actions";
import { Mail, Clock, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function MembersPage() {
  const divisionId = 4;
  const members = await getMembersWithLastLog(divisionId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Database Anggota & SDM
        </h1>
        <p className="text-sm text-gray-500">
          Monitoring status keaktifan dan kontribusi anggota.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Nama Anggota</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Kontribusi Terakhir</th>
              <th className="px-6 py-4">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m: any) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{m.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail size={10} /> {m.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase flex w-fit items-center gap-1",
                      m.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {m.status === "active" ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <ShieldAlert size={12} />
                    )}
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {m.lastActivity ? (
                    <div>
                      <p className="text-gray-900 font-medium truncate max-w-50">
                        "{m.lastActivity.notes}"
                      </p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={10} />
                        {new Date(m.lastActivity.createdAt).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      Belum ada log
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {/* Button Aksi Update Status bisa dibuat disini (Client Component) */}
                  <button className="text-indigo-600 hover:underline text-xs font-medium">
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
