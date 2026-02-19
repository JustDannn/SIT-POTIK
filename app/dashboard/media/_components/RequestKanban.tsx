"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateDesignRequestStatus } from "../actions";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Building2,
  GripVertical,
  ExternalLink,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DesignRequestStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "completed"
  | "rejected";

interface DesignRequest {
  id: number;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  deadline: Date | null;
  attachmentUrl: string | null;
  deliverableUrl: string | null;
  createdAt: Date | null;
  requester: { name: string; image: string | null } | null;
  requesterDivision: { divisionName: string } | null;
  assignee: { name: string; image: string | null } | null;
  comments: { id: number }[];
}

interface RequestKanbanProps {
  requests: DesignRequest[];
  mediaTeamMembers?: { id: string; name: string }[];
}

const COLUMNS = [
  {
    id: "pending" as const,
    label: "Inbox",
    icon: Clock,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    id: "in_progress" as const,
    label: "In Design",
    icon: User,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "review" as const,
    label: "Review",
    icon: AlertCircle,
    color: "bg-violet-500",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    id: "completed" as const,
    label: "Done",
    icon: CheckCircle2,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "rejected" as const,
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

const PRIORITY_BADGES = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-gray-100 text-gray-700 border-gray-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function RequestKanban({ requests = [] }: RequestKanbanProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draggedItem, setDraggedItem] = useState<DesignRequest | null>(null);

  const groupedRequests = useMemo(() => {
    const groups: Record<string, DesignRequest[]> = {};
    COLUMNS.forEach((col) => {
      groups[col.id] = requests.filter((r) => r.status === col.id);
    });
    return groups;
  }, [requests]);

  const handleDragStart = (e: React.DragEvent, request: DesignRequest) => {
    setDraggedItem(request);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (
    e: React.DragEvent,
    newStatus: DesignRequestStatus,
  ) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.status === newStatus) {
      setDraggedItem(null);
      return;
    }

    startTransition(async () => {
      try {
        await updateDesignRequestStatus(draggedItem.id, newStatus);
        router.refresh();
      } catch (error) {
        console.error("Failed to update status:", error);
        alert("Gagal mengupdate status.");
      }
    });

    setDraggedItem(null);
  };

  const isDeadlineNear = (deadline: Date | null) => {
    if (!deadline) return false;
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    const daysLeft = diff / (1000 * 60 * 60 * 24);
    return daysLeft <= 2 && daysLeft >= 0;
  };

  const isOverdue = (deadline: Date | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
      {COLUMNS.map((column) => {
        const ColumnIcon = column.icon;
        const columnRequests = groupedRequests[column.id] || [];

        return (
          <div
            key={column.id}
            className="shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl mb-3 border",
                column.bgColor,
                column.borderColor,
              )}
            >
              <div className={cn("p-1.5 rounded-lg text-white", column.color)}>
                <ColumnIcon size={14} />
              </div>
              <span className="font-bold text-gray-800 text-sm">
                {column.label}
              </span>
              <span
                className={cn(
                  "ml-auto px-2 py-0.5 rounded-full text-xs font-bold",
                  column.color,
                  "text-white",
                )}
              >
                {columnRequests.length}
              </span>
            </div>

            {/* Cards Container */}
            <div
              className={cn(
                "space-y-3 min-h-100 p-2 rounded-xl transition-colors",
                draggedItem && draggedItem.status !== column.id
                  ? "bg-gray-100 border-2 border-dashed border-gray-300"
                  : "bg-gray-50/50",
              )}
            >
              {columnRequests.map((request) => (
                <div
                  key={request.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, request)}
                  className={cn(
                    "group bg-white rounded-xl border border-gray-200 p-4 cursor-move hover:shadow-md transition-all",
                    draggedItem?.id === request.id && "opacity-50 scale-95",
                    isOverdue(request.deadline) &&
                      "border-red-300 bg-red-50/30",
                    isDeadlineNear(request.deadline) &&
                      !isOverdue(request.deadline) &&
                      "border-orange-300 bg-orange-50/30",
                  )}
                >
                  {/* Drag Handle + Priority */}
                  <div className="flex items-center justify-between mb-2">
                    <GripVertical
                      size={14}
                      className="text-gray-300 group-hover:text-gray-400"
                    />
                    {request.priority && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-semibold capitalize border",
                          PRIORITY_BADGES[
                            request.priority as keyof typeof PRIORITY_BADGES
                          ] || PRIORITY_BADGES.normal,
                        )}
                      >
                        {request.priority}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/dashboard/media/requests/${request.id}`}
                    className="block font-semibold text-gray-900 text-sm hover:text-violet-600 transition-colors line-clamp-2 mb-2"
                  >
                    {request.title}
                  </Link>

                  {/* Division Badge */}
                  {request.requesterDivision && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <Building2 size={12} />
                      <span>{request.requesterDivision.divisionName}</span>
                    </div>
                  )}

                  {/* Deadline */}
                  {request.deadline && (
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs mb-3",
                        isOverdue(request.deadline)
                          ? "text-red-600 font-semibold"
                          : isDeadlineNear(request.deadline)
                            ? "text-orange-600 font-semibold"
                            : "text-gray-500",
                      )}
                    >
                      <Calendar size={12} />
                      <span>
                        {isOverdue(request.deadline) && "⚠️ "}
                        {new Date(request.deadline).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {/* Footer: Assignee + Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {/* Assignee Avatar */}
                    <div className="flex items-center gap-2">
                      {request.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-bold">
                            {request.assignee.name.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-20">
                            {request.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {request.attachmentUrl && (
                        <Paperclip size={12} className="text-gray-400" />
                      )}
                      {request.comments && request.comments.length > 0 && (
                        <div className="flex items-center gap-0.5 text-gray-400">
                          <MessageSquare size={12} />
                          <span className="text-xs">
                            {request.comments.length}
                          </span>
                        </div>
                      )}
                      <Link
                        href={`/dashboard/media/requests/${request.id}`}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <ExternalLink size={12} className="text-gray-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {columnRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <ColumnIcon size={24} className="mb-2 opacity-50" />
                  <span className="text-xs">Drop here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
