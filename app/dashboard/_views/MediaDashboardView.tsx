"use client";

import Link from "next/link";
import {
  Palette,
  Globe,
  Image as ImageIcon,
  Layers,
  PenTool,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  ExternalLink,
  FileText,
  Inbox,
  TrendingUp,
  Instagram,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  contentVelocity: number;
  pendingQueue: number;
  totalAssets: number;
  scheduledPosts: number;
}

interface DesignRequest {
  id: number;
  title: string;
  status: string | null;
  priority: string | null;
  deadline: Date | null;
  createdAt: Date | null;
  requester: { name: string } | null;
  requesterDivision: { divisionName: string } | null;
}

interface Publication {
  id: number;
  title: string;
  category: string;
  status: string | null;
  author: { name: string } | null;
  division: { divisionName: string } | null;
}

interface Campaign {
  id: number;
  title: string;
  platform: string;
  status: string | null;
  scheduledDate: Date | null;
}

interface User {
  name: string;
  division: { divisionName: string } | null;
}

interface MediaDashboardViewProps {
  user: User;
  stats: DashboardStats;
  incomingRequests: DesignRequest[];
  pendingPublications: Publication[];
  upcomingCampaigns: Campaign[];
}

const PRIORITY_STYLES = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-gray-100 text-gray-700 border-gray-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  website: Globe,
};

export default function MediaDashboardView({
  user,
  stats,
  incomingRequests,
  pendingPublications,
  upcomingCampaigns,
}: MediaDashboardViewProps) {
  const deadlineWarningThreshold = new Date();
  deadlineWarningThreshold.setDate(deadlineWarningThreshold.getDate() + 2);

  return (
    <div className="space-y-8 pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Media Command Center
          </h1>
          <p className="text-gray-500 mt-1">
            Koordinator{" "}
            <span className="font-semibold text-violet-600">
              {user.division?.divisionName || "Media & Branding"}
            </span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/media/cms"
            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 text-sm font-bold transition-all shadow-lg shadow-violet-200 hover:-translate-y-0.5"
          >
            <Globe size={18} />
            CMS Editor
          </Link>
          <Link
            href="/dashboard/media/campaigns/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-bold transition-colors hover:border-gray-300"
          >
            <PenTool size={18} />
            New Campaign
          </Link>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Content Velocity */}
        <Link
          href="/dashboard/media/campaigns"
          className="group p-5 bg-linear-to-br from-violet-50 to-violet-100/50 rounded-2xl border border-violet-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-violet-600 rounded-xl text-white">
              <TrendingUp size={20} />
            </div>
            <ArrowRight
              size={16}
              className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.contentVelocity}
          </p>
          <p className="text-sm text-gray-600 mt-1">Published This Month</p>
        </Link>

        {/* Pending Queue */}
        <Link
          href="/dashboard/media/requests"
          className="group p-5 bg-linear-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-orange-500 rounded-xl text-white">
              <Inbox size={20} />
            </div>
            {stats.pendingQueue > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                {stats.pendingQueue}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.pendingQueue}
          </p>
          <p className="text-sm text-gray-600 mt-1">Pending Requests</p>
        </Link>

        {/* Total Assets */}
        <Link
          href="/dashboard/media/repository"
          className="group p-5 bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
              <ImageIcon size={20} />
            </div>
            <ArrowRight
              size={16}
              className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalAssets}
          </p>
          <p className="text-sm text-gray-600 mt-1">Media Assets</p>
        </Link>

        {/* Scheduled Posts */}
        <Link
          href="/dashboard/media/campaigns"
          className="group p-5 bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-green-600 rounded-xl text-white">
              <Calendar size={20} />
            </div>
            <ArrowRight
              size={16}
              className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.scheduledPosts}
          </p>
          <p className="text-sm text-gray-600 mt-1">Scheduled Posts</p>
        </Link>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* INCOMING INBOX */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Inbox size={18} className="text-orange-600" />
              </div>
              <h2 className="font-bold text-gray-900">Incoming Requests</h2>
            </div>
            <Link
              href="/dashboard/media/requests"
              className="text-sm font-medium text-violet-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {incomingRequests.length > 0 ? (
              incomingRequests.slice(0, 5).map((request) => (
                <Link
                  key={request.id}
                  href={`/dashboard/media/requests/${request.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Division Badge */}
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <Building2 size={18} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {request.title}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>
                        {request.requesterDivision?.divisionName || "Unknown"}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>
                        {request.createdAt &&
                          new Date(request.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                      </span>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  {request.priority && (
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border",
                        PRIORITY_STYLES[
                          request.priority as keyof typeof PRIORITY_STYLES
                        ] || PRIORITY_STYLES.normal,
                      )}
                    >
                      {request.priority}
                    </span>
                  )}

                  {/* Deadline Warning */}
                  {request.deadline &&
                    new Date(request.deadline) < deadlineWarningThreshold && (
                      <AlertCircle size={18} className="text-red-500" />
                    )}
                </Link>
              ))
            ) : (
              <div className="py-12 text-center text-gray-500">
                <CheckCircle2
                  className="mx-auto mb-2 text-green-400"
                  size={32}
                />
                <p className="font-medium">Inbox cleared!</p>
                <p className="text-sm">No pending requests right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* PUBLICATION CALENDAR (Mini) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-xl">
                <Calendar size={18} className="text-violet-600" />
              </div>
              <h2 className="font-bold text-gray-900">This Week</h2>
            </div>
            <Link
              href="/dashboard/media/campaigns"
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              Calendar
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {upcomingCampaigns.length > 0 ? (
              upcomingCampaigns.slice(0, 5).map((campaign) => {
                const PlatformIcon = PLATFORM_ICONS[campaign.platform] || Globe;
                return (
                  <Link
                    key={campaign.id}
                    href={`/dashboard/media/campaigns/${campaign.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        campaign.platform === "instagram"
                          ? "bg-linear-to-br from-purple-500 to-pink-500 text-white"
                          : campaign.platform === "youtube"
                            ? "bg-red-500 text-white"
                            : "bg-violet-100 text-violet-600",
                      )}
                    >
                      <PlatformIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {campaign.title}
                      </p>
                      <p className="text-xs text-gray-500">
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
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-xs font-medium capitalize",
                        campaign.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-700"
                          : campaign.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {campaign.status}
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Calendar className="mx-auto mb-2 text-gray-300" size={28} />
                <p className="text-sm">No scheduled posts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- QUICK ACCESS GRID --- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/media/cms"
          className="group flex items-center gap-4 p-5 bg-linear-to-br from-violet-600 to-purple-700 rounded-2xl text-white hover:scale-[1.02] transition-transform"
        >
          <div className="p-3 bg-white/20 rounded-xl">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="font-bold">CMS Editor</h3>
            <p className="text-sm text-white/80">Edit website content</p>
          </div>
        </Link>

        <Link
          href="/dashboard/media/repository"
          className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <ImageIcon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Media Repository</h3>
            <p className="text-sm text-gray-500">Photos & Videos</p>
          </div>
        </Link>

        <Link
          href="/dashboard/media/brand-kit"
          className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="p-3 bg-pink-100 rounded-xl text-pink-600">
            <Palette size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Brand Kit</h3>
            <p className="text-sm text-gray-500">Logos & Templates</p>
          </div>
        </Link>

        <Link
          href="/dashboard/media/requests"
          className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Requests Board</h3>
            <p className="text-sm text-gray-500">Design tickets</p>
          </div>
        </Link>
      </div>

      {/* PENDING PUBLICATIONS */}
      {pendingPublications.length > 0 && (
        <div className="bg-yellow-50/50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-yellow-600" size={20} />
            <h3 className="font-bold text-gray-900">
              Publications Awaiting Media Review
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingPublications.map((pub) => (
              <Link
                key={pub.id}
                href={`/dashboard/content/${pub.id}`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-yellow-100 hover:border-yellow-300 transition-colors"
              >
                <FileText size={16} className="text-yellow-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pub.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pub.division?.divisionName} • {pub.category}
                  </p>
                </div>
                <ExternalLink size={14} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
