"use client";

import React, { useState } from "react";
import { Users, FileText, Image as ImageIcon, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import EventOverview from "./_tabs/EventOverview";
import EventTeam from "./_tabs/EventTeam";
import EventLogs from "./_tabs/EventLogs";
import EventImpact from "./_tabs/EventImpact";

export default function EventDetailClient({
  event,
  userRole,
}: {
  event: any;
  userRole: string;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "team", label: "Tim & PIC", icon: Users },
    { id: "logs", label: "Log Aktivitas", icon: Activity },
    { id: "impact", label: "Impact & Output", icon: ImageIcon },
  ];

  return (
    <div className="pb-20 space-y-6">
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {event.title}
          </h1>
          <p className="text-gray-500 max-w-2xl">{event.description}</p>
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
