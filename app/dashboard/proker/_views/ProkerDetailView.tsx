"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Activity,
  Plus,
  Send,
  X,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addTask, toggleTaskStatus, addManualLog } from "../actions"; // Pastikan path import ini benar

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "created":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function ProkerDetailView({
  proker,
  user,
}: {
  proker: any;
  user: any;
}) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, tasks, logs
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);

  // Helper untuk Toggle Status Task
  const handleToggle = async (task: any) => {
    // Optimistic UI bisa diterapkan di sini jika perlu, tapi untuk sekarang direct server action
    await toggleTaskStatus(task.id, task.status, proker.id, task.title);
  };

  const handleAddTask = async (formData: FormData) => {
    setLoadingTask(true);
    await addTask(formData);
    setLoadingTask(false);
    setIsTaskModalOpen(false);
  };

  if (!proker) return <div>Proker tidak ditemukan</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header & Back Button */}
      <div>
        <Link
          href="/dashboard/proker"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke List
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-gray-100 text-gray-500 border border-gray-200">
                {proker.divisionName}
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium border",
                  getStatusColor(proker.status),
                )}
              >
                {proker.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{proker.title}</h1>
          </div>
          {/* Progress Circle Ringkas di Header */}
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold">
                Progress
              </p>
              <p className="text-xl font-bold text-indigo-600">
                {proker.progress}%
              </p>
            </div>
            <div className="w-10 h-10">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-indigo-600 drop-shadow-md"
                  strokeDasharray={`${proker.progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "tasks", label: "Daftar Tugas", icon: CheckCircle2 },
            { id: "logs", label: "Log Aktivitas", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm gap-2 transition-colors",
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {/* Badge Counter buat Task */}
              {tab.id === "tasks" && (
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs ml-1">
                  {proker.tasks.length}
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
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target size={18} className="text-gray-400" /> Deskripsi
                  Program
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {proker.description || "Tidak ada deskripsi."}
                </p>
              </div>
            </div>

            {/* Kolom Kanan: Meta Info */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Informasi Utama
                </h3>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">PIC Proker</p>
                    <p className="font-medium text-sm text-gray-900">
                      {proker.picName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Timeline Pelaksanaan
                    </p>
                    <p className="font-medium text-sm text-gray-900">
                      {proker.startDate
                        ? new Date(proker.startDate).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short" },
                          )
                        : "-"}{" "}
                      s/d{" "}
                      {proker.endDate
                        ? new Date(proker.endDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === TAB TASKS (Interactive) === */}
        {activeTab === "tasks" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header: Judul & Button Add */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div>
                <h3 className="font-bold text-gray-900">Checklist Tugas</h3>
                <p className="text-xs text-gray-500">
                  Centang kotak untuk menandai selesai.
                </p>
              </div>
              {!isTaskModalOpen && (
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} /> Tambah Task
                </button>
              )}
            </div>

            {/* Form Tambah Task (Toggle) */}
            {isTaskModalOpen && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    Tugas Baru
                  </span>
                  <button onClick={() => setIsTaskModalOpen(false)}>
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
                <form action={handleAddTask} className="flex gap-2">
                  <input type="hidden" name="prokerId" value={proker.id} />
                  <input
                    name="title"
                    required
                    autoFocus
                    placeholder="Contoh: Booking ruangan rapat..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    disabled={loadingTask}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Simpan
                  </button>
                </form>
              </div>
            )}

            {/* List Tasks */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {proker.tasks.length === 0 ? (
                <div className="p-10 text-center text-gray-500 italic">
                  Belum ada task. Yuk tambah tugas pertama!
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {proker.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggle(task)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          task.status === "done"
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 text-transparent group-hover:border-indigo-400",
                        )}
                      >
                        <CheckCircle2 size={16} />
                      </button>

                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium transition-all",
                            task.status === "done"
                              ? "text-gray-400 line-through"
                              : "text-gray-900",
                          )}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                            {task.assignedUser?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400">
                        {task.status === "done" ? "Selesai" : "On Progress"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === TAB LOGS === */}
        {activeTab === "logs" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Input Log Manual */}
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4">
                <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" /> Update
                  Progress
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Ada update yang bukan task? Catat di sini biar terekam di
                  timeline.
                </p>
                <form action={addManualLog}>
                  <input type="hidden" name="prokerId" value={proker.id} />
                  <textarea
                    name="notes"
                    required
                    rows={3}
                    placeholder="Contoh: Rapat dengan dosen pembimbing lancar..."
                    className="w-full p-3 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 mb-2 resize-none"
                  ></textarea>
                  <button className="w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors flex justify-center items-center gap-2">
                    <Send size={14} /> Kirim Log
                  </button>
                </form>
              </div>
            </div>

            {/* Timeline List */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">
                  Riwayat Aktivitas
                </h3>

                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                  {proker.logs.length === 0 ? (
                    <div className="pl-8 text-sm text-gray-400 italic">
                      Belum ada aktivitas.
                    </div>
                  ) : (
                    proker.logs.map((log: any) => (
                      <div key={log.id} className="relative pl-8">
                        <div className="absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-white"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-gray-500">
                            {new Date(log.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">
                          <span className="font-bold text-indigo-600 mr-1">
                            {log.user?.name.split(" ")[0]}:
                          </span>
                          {log.notes}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
