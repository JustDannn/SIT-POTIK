import React from "react";
import Link from "next/link";
import { getMinutes } from "./actions";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function MinutesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.authId, authUser.id),
    with: { role: true },
  });
  const roleName = dbUser?.role?.roleName ?? "";
  const canEdit = roleName === "Sekretaris" || roleName === "Ketua";

  const query = searchParams.q || "";
  const data = await getMinutes(query);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notulensi Rapat</h1>
          <p className="text-gray-500 text-sm">
            Arsip catatan hasil rapat dan pertemuan.
          </p>
        </div>
        <Link
          href="/dashboard/minutes/create"
          className={cn(
            "flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors",
            !canEdit && "hidden",
          )}
        >
          <Plus size={18} /> Buat Baru
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <form>
          <input
            name="q"
            defaultValue={query}
            placeholder="Cari judul rapat..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </form>
      </div>

      {/* TABLE LIST */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Judul Rapat</th>
              <th className="px-6 py-4">Jenis</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Status</th>
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
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.prokerTitle || "Umum"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                    {item.meetingType}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {item.meetingDate
                      ? new Date(item.meetingDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      item.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700",
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {canEdit && (
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/minutes/${item.id}/edit`}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  Belum ada notulensi yang dibuat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
