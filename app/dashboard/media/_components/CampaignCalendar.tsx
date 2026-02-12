"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Twitter,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: number;
  title: string;
  platform: string;
  status: string | null;
  scheduledDate: Date | null;
  publishedDate: Date | null;
  caption: string | null;
  assetUrl: string | null;
  pic: { name: string } | null;
}

interface CampaignCalendarProps {
  campaigns: Campaign[];
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  tiktok: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  ),
  linkedin: Linkedin,
  website: Globe,
  twitter: Twitter,
  youtube: Youtube,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  tiktok: "bg-black text-white",
  linkedin: "bg-blue-600 text-white",
  website: "bg-violet-600 text-white",
  twitter: "bg-sky-500 text-white",
  youtube: "bg-red-600 text-white",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-slate-100 text-slate-600",
};

export default function CampaignCalendar({ campaigns }: CampaignCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { days, firstDay, lastDay };
  }, [currentDate]);

  // Get campaigns for a specific date
  const getCampaignsForDate = (date: Date) => {
    return campaigns.filter((campaign) => {
      const campaignDate = campaign.scheduledDate || campaign.publishedDate;
      if (!campaignDate) return false;
      const d = new Date(campaignDate);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const scheduled = campaigns.filter((c) => {
      if (!c.scheduledDate) return false;
      const d = new Date(c.scheduledDate);
      return d >= startOfWeek && d <= endOfWeek && c.status === "scheduled";
    }).length;

    const published = campaigns.filter((c) => {
      if (!c.publishedDate) return false;
      const d = new Date(c.publishedDate);
      return d >= startOfWeek && d <= endOfWeek && c.status === "published";
    }).length;

    return { scheduled, published };
  }, [campaigns]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 min-w-[180px] text-center">
            {currentDate.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Weekly Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg">
            <Clock size={16} className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">
              {weeklyStats.scheduled} scheduled
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {weeklyStats.published} published
            </span>
          </div>
          <Link
            href="/dashboard/media/campaigns/create"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
          >
            <Plus size={16} />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarData.days.map((date, index) => {
            const dayCampaigns = getCampaignsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors",
                  !isCurrentMonthDay && "bg-gray-50/50",
                  isTodayDate && "bg-violet-50/50",
                )}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      isTodayDate
                        ? "bg-violet-600 text-white"
                        : isCurrentMonthDay
                          ? "text-gray-900"
                          : "text-gray-400",
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* Campaigns */}
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayCampaigns.slice(0, 3).map((campaign) => {
                    const PlatformIcon =
                      PLATFORM_ICONS[campaign.platform] || Globe;
                    return (
                      <Link
                        key={campaign.id}
                        href={`/dashboard/media/campaigns/${campaign.id}`}
                        className={cn(
                          "group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium truncate transition-all hover:scale-[1.02]",
                          PLATFORM_COLORS[campaign.platform] ||
                            "bg-gray-100 text-gray-700",
                        )}
                      >
                        <PlatformIcon size={12} />
                        <span className="truncate">{campaign.title}</span>
                      </Link>
                    );
                  })}
                  {dayCampaigns.length > 3 && (
                    <span className="text-xs text-gray-500 pl-2">
                      +{dayCampaigns.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Campaigns List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Upcoming Campaigns</h3>
        <div className="space-y-3">
          {campaigns
            .filter(
              (c) =>
                c.status === "scheduled" &&
                c.scheduledDate &&
                new Date(c.scheduledDate) >= new Date(),
            )
            .sort(
              (a, b) =>
                new Date(a.scheduledDate!).getTime() -
                new Date(b.scheduledDate!).getTime(),
            )
            .slice(0, 5)
            .map((campaign) => {
              const PlatformIcon = PLATFORM_ICONS[campaign.platform] || Globe;
              return (
                <div
                  key={campaign.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Platform Badge */}
                  <div
                    className={cn(
                      "p-2.5 rounded-xl",
                      PLATFORM_COLORS[campaign.platform],
                    )}
                  >
                    <PlatformIcon size={18} />
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {campaign.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarIcon size={12} />
                      <span>
                        {campaign.scheduledDate &&
                          new Date(campaign.scheduledDate).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
                      STATUS_STYLES[campaign.status || "draft"],
                    )}
                  >
                    {campaign.status}
                  </span>

                  {/* Actions */}
                  <Link
                    href={`/dashboard/media/campaigns/${campaign.id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                  >
                    <Edit3 size={16} />
                  </Link>
                </div>
              );
            })}

          {campaigns.filter(
            (c) =>
              c.status === "scheduled" &&
              c.scheduledDate &&
              new Date(c.scheduledDate) >= new Date(),
          ).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="mx-auto mb-2 text-gray-300" size={32} />
              <p className="text-sm">No upcoming campaigns scheduled.</p>
              <Link
                href="/dashboard/media/campaigns/create"
                className="text-sm text-violet-600 font-medium hover:underline"
              >
                Create one now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
