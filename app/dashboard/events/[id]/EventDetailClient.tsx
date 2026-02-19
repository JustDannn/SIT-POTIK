"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  Image as ImageIcon,
  Activity,
  CheckSquare,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import EventOverview from "./_tabs/EventOverview";
import EventTeam from "./_tabs/EventTeam";
import EventLogs from "./_tabs/EventLogs";
import EventImpact from "./_tabs/EventImpact";
import EventTasks from "./_tabs/EventTasks";
interface EventParticipant {
  id: number;
  role: string;
  joinedAt: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
}

interface EventTask {
  id: number;
  prokerId: number | null;
  programId: number | null;
  title: string;
  description: string | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  status: string;
  deadline: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface EventLog {
  id: number;
  notes: string;
  userName: string;
  createdAt: string;
}

interface EventImpactItem {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  status: string;
  authorName: string | null;
  createdAt: string | null;
}

interface EventData {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  status: string | null;
  createdAt: string | null;
  divisionId: number;
  divisionName: string | null;
  division: { divisionName: string } | null;
  participants: EventParticipant[];
  tasks: EventTask[];
  logs: EventLog[];
  impacts: EventImpactItem[];
}

export default function EventDetailClient({
  event,
  userRole,
}: {
  event: EventData;
  userRole: string;
}) {
  const { profile, loading } = useAuth();
  console.log("PROFILE DEBUG:", profile);
  console.log("ROLE:", profile?.role_id);
  console.log("DIVISION:", profile?.division_id);

  const [activeTab, setActiveTab] = useState("overview");

  if (loading) return null;

  const isKetua = profile?.role_id === 11;
  const backHref = isKetua ? "/dashboard/proker" : "/dashboard/events";
  const backLabel = isKetua ? "Kembali ke List" : "Kembali ke Events";

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "team", label: "Tim & PIC", icon: Users },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "logs", label: "Log Aktivitas", icon: Activity },
    { id: "impact", label: "Impact & Output", icon: ImageIcon },
  ];

  // Hitung Progress dari Task
  const tasks = event.tasks || [];
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(
    (t: EventTask) => t.status === "done" || t.status === "completed",
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  return (
    <div className="pb-20 space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex gap-2 mb-4">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase",
                event.status === "ongoing"
                  ? "bg-green-100 text-green-700"
                  : event.status === "completed"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-indigo-100 text-indigo-700",
              )}
            >
              {event.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-100 text-indigo-700">
              {event.location}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                {event.title}
              </h1>
              <p className="text-gray-500 max-w-2xl text-sm">
                {event.description}
              </p>
            </div>

            {/* Progress Circle */}
            <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  Progress
                </p>
                <p className="text-xl font-bold text-indigo-600">{progress}%</p>
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
                    className={cn(
                      "drop-shadow-md",
                      event.status === "completed"
                        ? "text-emerald-500"
                        : "text-indigo-600",
                    )}
                    strokeDasharray={`${progress}, 100`}
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-6 border-t border-gray-100 pt-6">
            {event.startDate && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">
                    Timeline Pelaksanaan
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(event.startDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                    {event.endDate &&
                      ` - ${new Date(event.endDate).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

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
          </button>
        ))}
      </div>

      <div className="min-h-100">
        {activeTab === "overview" && (
          <EventOverview event={event} userRole={userRole} />
        )}
        {activeTab === "team" && (
          <EventTeam
            eventId={event.id}
            divisionId={event.divisionId}
            participants={event.participants}
          />
        )}
        {activeTab === "tasks" && (
          <EventTasks
            eventId={event.id}
            tasks={event.tasks || []}
            participants={event.participants || []}
          />
        )}
        {activeTab === "logs" && (
          <EventLogs eventId={event.id} logs={event.logs} />
        )}
        {activeTab === "impact" && (
          <EventImpact
            eventId={event.id}
            divisionId={event.divisionId}
            impacts={event.impacts}
          />
        )}
      </div>
    </div>
  );
}
