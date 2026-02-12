"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  updateDesignRequestStatus,
  assignDesignRequest,
  addDesignRequestComment,
} from "../../../actions";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  AlertCircle,
  CheckCircle2,
  Send,
  Paperclip,
  Upload,
  X,
  ExternalLink,
  Loader2,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DesignRequestStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "completed"
  | "rejected";

interface Comment {
  id: number;
  message: string;
  attachmentUrl: string | null;
  createdAt: Date | null;
  authorId: string | null;
  authorName: string | null;
}

interface Request {
  id: number;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  deadline: Date | null;
  attachmentUrl: string | null;
  resultUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  requesterName: string | null;
  requesterId: string | null;
  requesterDivision: string | null;
  assignee: { id: string; name: string | null } | null;
}

interface User {
  id: string;
  name: string | null;
  role: string | null;
  divisionId: number | null;
  divisionName: string | null;
}

interface Props {
  request: Request;
  comments: Comment[];
  currentUser: User;
}

const STATUS_CONFIG: Record<
  DesignRequestStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Inbox",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  in_progress: {
    label: "In Design",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  review: {
    label: "Review",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  completed: {
    label: "Done",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  low: { label: "Low", color: "text-gray-500", icon: Flag },
  medium: { label: "Medium", color: "text-blue-500", icon: Flag },
  high: { label: "High", color: "text-orange-500", icon: AlertCircle },
  urgent: { label: "Urgent", color: "text-red-500", icon: AlertCircle },
};

export default function RequestDetailView({
  request,
  comments,
  currentUser,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [newMessage, setNewMessage] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const statusConfig =
    (request.status && STATUS_CONFIG[request.status as DesignRequestStatus]) ||
    STATUS_CONFIG.pending;
  const priorityConfig =
    (request.priority && PRIORITY_CONFIG[request.priority]) ||
    PRIORITY_CONFIG.medium;
  const PriorityIcon = priorityConfig.icon;

  const handleStatusChange = (newStatus: DesignRequestStatus) => {
    startTransition(async () => {
      await updateDesignRequestStatus(request.id, newStatus);
      router.refresh();
    });
  };

  const handleTakeRequest = () => {
    startTransition(async () => {
      await assignDesignRequest(request.id, currentUser.id);
      router.refresh();
    });
  };

  const handleSendComment = async () => {
    if (!newMessage.trim() && !attachmentFile) return;

    setIsSending(true);
    try {
      let attachmentUrl: string | undefined;

      if (attachmentFile) {
        const fileName = `request-${request.id}-${Date.now()}-${attachmentFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const { error } = await supabase.storage
          .from("request-attachments")
          .upload(fileName, attachmentFile);

        if (!error) {
          const { data } = supabase.storage
            .from("request-attachments")
            .getPublicUrl(fileName);
          attachmentUrl = data.publicUrl;
        }
      }

      await addDesignRequestComment(
        request.id,
        newMessage.trim(),
        attachmentUrl,
      );

      setNewMessage("");
      setAttachmentFile(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to send comment:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/media/requests"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-lg",
                statusConfig.bgColor,
                statusConfig.color,
              )}
            >
              {statusConfig.label}
            </span>
            <span
              className={cn("flex items-center gap-1", priorityConfig.color)}
            >
              <PriorityIcon size={14} />
              <span className="text-xs font-medium">
                {priorityConfig.label}
              </span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Description
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {request.description || "No description provided."}
            </p>
            {request.attachmentUrl && (
              <a
                href={request.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
              >
                <Paperclip size={14} />
                View Attachment
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Result (if done) */}
          {request.resultUrl && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
              <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Design Result
              </h3>
              <a
                href={request.resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Download Result
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Comments / Chat */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Discussion</h3>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                comments.map((comment) => {
                  const isCurrentUser = comment.authorId === currentUser.id;
                  return (
                    <div
                      key={comment.id}
                      className={cn(
                        "flex",
                        isCurrentUser ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          isCurrentUser
                            ? "bg-violet-600 text-white"
                            : "bg-gray-100 text-gray-900",
                        )}
                      >
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {comment.authorName ?? "Unknown"}
                        </p>
                        <p className="text-sm">{comment.message}</p>
                        {comment.attachmentUrl && (
                          <a
                            href={comment.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "mt-2 flex items-center gap-1 text-xs",
                              isCurrentUser
                                ? "text-violet-200 hover:text-white"
                                : "text-violet-600 hover:text-violet-700",
                            )}
                          >
                            <Paperclip size={12} />
                            Attachment
                          </a>
                        )}
                        <p
                          className={cn(
                            "text-xs mt-2",
                            isCurrentUser ? "text-violet-200" : "text-gray-400",
                          )}
                        >
                          {comment.createdAt
                            ? new Date(comment.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              {attachmentFile && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <Paperclip size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {attachmentFile.name}
                  </span>
                  <button
                    onClick={() => setAttachmentFile(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <label className="p-3 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                  <Upload size={18} className="text-gray-500" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setAttachmentFile(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                />
                <button
                  onClick={handleSendComment}
                  disabled={
                    isSending || (!newMessage.trim() && !attachmentFile)
                  }
                  className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {isSending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Requester</p>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {request.requesterName ?? "Unknown"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Division</p>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {request.requesterDivision ?? "Unknown"}
                </span>
              </div>
            </div>

            {request.deadline && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(request.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned To</p>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {request.assignee?.name ?? "Unassigned"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Actions</h3>

            {!request.assignee && request.status === "inbox" && (
              <button
                onClick={handleTakeRequest}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Take This Request"
                )}
              </button>
            )}

            <p className="text-xs text-gray-500 mt-2">Change Status</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(STATUS_CONFIG) as [
                  DesignRequestStatus,
                  (typeof STATUS_CONFIG)[DesignRequestStatus],
                ][]
              ).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isPending || request.status === status}
                  className={cn(
                    "px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                    request.status === status
                      ? `${config.bgColor} ${config.color} border-current`
                      : "border-gray-200 text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
