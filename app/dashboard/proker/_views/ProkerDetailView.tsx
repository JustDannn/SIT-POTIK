"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  FileText,
  Activity,
  Users,
  CheckSquare,
  Image as ImageIcon,
  Info,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Reuse Event tab components (polished & feature-rich)
import EventTeam from "../../events/[id]/_tabs/EventTeam";
import EventTasks from "../../events/[id]/_tabs/EventTasks";
import EventLogs from "../../events/[id]/_tabs/EventLogs";
import EventImpact from "../../events/[id]/_tabs/EventImpact";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
    case "ongoing":
      return "bg-emerald-100 text-emerald-700";
    case "completed":
      return "bg-gray-100 text-gray-600";
    case "created":
    case "planned":
      return "bg-indigo-100 text-indigo-700";
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
  const [activeTab, setActiveTab] = useState("overview");
  const isProgram = proker.type === "program";

  // Build tabs — Impact only for programs
  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "team", label: "Tim & PIC", icon: Users },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "logs", label: "Log Aktivitas", icon: Activity },
    ...(isProgram
      ? [{ id: "impact", label: "Impact & Output", icon: ImageIcon }]
      : []),
  ];

  const backHref = isProgram ? "/dashboard/events" : "/dashboard/proker";
  const backLabel = isProgram ? "Kembali ke Events" : "Kembali ke List";

  return (
    <div className="space-y-6 pb-20">
      {/* Back Button */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-500 border border-gray-200">
                  {proker.divisionName}
                </span>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                    getStatusColor(proker.status || "created"),
                  )}
                >
                  {proker.status === "created" ? "planning" : proker.status}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                {proker.title}
              </h1>
              {proker.description && (
                <p className="text-gray-500 max-w-2xl text-sm mt-1">
                  {proker.description}
                </p>
              )}
            </div>

            {/* Progress Circle */}
            <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  Progress
                </p>
                <p className="text-xl font-bold text-indigo-600">
                  {proker.progress}%
                </p>
              </div>
              <div className="w-11 h-11">
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm transition-all border-b-2",
              activeTab === tab.id
                ? "bg-white text-indigo-600 border-indigo-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50",
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.id === "tasks" && (
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs ml-1">
                {proker.tasks?.length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-100">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info size={20} className="text-indigo-600" /> Deskripsi
                  Program
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {proker.description || "Tidak ada deskripsi."}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  Informasi Utama
                </h3>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-500 mt-1">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      PIC Proker
                    </p>
                    <p className="font-semibold text-gray-900">
                      {proker.picName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-500 mt-1">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Timeline Pelaksanaan
                    </p>
                    <p className="font-semibold text-gray-900">
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

                {proker.location && (
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mt-1">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Lokasi
                      </p>
                      <p className="font-semibold text-gray-900">
                        {proker.location}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mt-1">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Status
                    </p>
                    <span
                      className={cn(
                        "inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                        getStatusColor(proker.status || "created"),
                      )}
                    >
                      {proker.status === "created" ? "planning" : proker.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && proker.divisionId && (
          <EventTeam
            eventId={proker.id}
            divisionId={proker.divisionId}
            participants={proker.participants || []}
            type={isProgram ? "program" : "proker"}
          />
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <EventTasks
            eventId={proker.id}
            tasks={proker.tasks || []}
            participants={proker.participants || []}
            type={isProgram ? "program" : "proker"}
          />
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <EventLogs
            eventId={proker.id}
            logs={proker.logs || []}
            type={isProgram ? "program" : "proker"}
          />
        )}

        {/* Impact Tab (programs only) */}
        {activeTab === "impact" && isProgram && proker.divisionId && (
          <EventImpact
            eventId={proker.id}
            divisionId={proker.divisionId}
            impacts={proker.impacts || []}
          />
        )}
      </div>
    </div>
  );
}
