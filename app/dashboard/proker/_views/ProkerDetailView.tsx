"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "created":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function ProkerDetailView({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, tasks, logs

  if (!data) return <div>Proker tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      {/* 1. Header & Back Button */}
      <div>
        <Link
          href="/dashboard/proker"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke List
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-gray-100 text-gray-500 border border-gray-200">
                {data.divisionName}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  getStatusColor(data.status),
                )}
              >
                {data.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
          </div>
          {/* Action Button buat Ketua (Misal: Approve Laporan) - Nanti aja */}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "tasks", label: "Daftar Tugas", icon: CheckCircle },
            { id: "logs", label: "Log Aktivitas", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm gap-2",
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {/* Badge Counter buat Task */}
              {tab.id === "tasks" && (
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs ml-1">
                  {data.tasks.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 3. Tab Content */}
      <div className="min-h-100">
        {/* === TAB OVERVIEW === */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Kolom Kiri: Deskripsi */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">
                  Deskripsi Program
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {data.description || "Tidak ada deskripsi."}
                </p>
              </div>
            </div>

            {/* Kolom Kanan: Meta Info */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">
                  Informasi Utama
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">PIC Proker</p>
                    <p className="font-medium text-sm text-gray-900">
                      {data.picName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Timeline</p>
                    <p className="font-medium text-sm text-gray-900">
                      {data.startDate
                        ? new Date(data.startDate).toLocaleDateString()
                        : "-"}{" "}
                      s/d <br />
                      {data.endDate
                        ? new Date(data.endDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress Real-time</span>
                    <span className="font-bold">{data.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${data.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === TAB TASKS === */}
        {activeTab === "tasks" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            {data.tasks.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                Belum ada task yang dibuat.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Nama Task</th>
                    <th className="px-6 py-3 font-medium">Assigned To</th>
                    <th className="px-6 py-3 font-medium">Deadline</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.tasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {task.assignedUser?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            task.status === "done"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : task.status === "ongoing"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-100 text-gray-600 border-gray-200",
                          )}
                        >
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* === TAB LOGS === */}
        {activeTab === "logs" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {data.activityLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-10 bg-white border border-dashed rounded-xl">
                Belum ada aktivitas.
              </div>
            ) : (
              data.activityLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Clock size={16} className="text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-bold">{log.user?.name}</span>{" "}
                      {log.action || "melakukan update"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
