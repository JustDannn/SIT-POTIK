"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Loader2,
  Trash2,
  Check,
  Circle,
  CalendarDays,
  User,
  ChevronDown,
} from "lucide-react";
import { addEventTask, toggleTaskStatus, deleteEventTask } from "../../actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Participant {
  userId: string;
  userName: string | null;
}

interface TaskItem {
  id: number;
  title: string;
  status: string;
  deadline: string | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
}

export default function EventTasks({
  eventId,
  tasks = [],
  participants = [],
}: {
  eventId: number;
  tasks: TaskItem[];
  participants: Participant[];
}) {
  const router = useRouter();
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setLoading(true);
    await addEventTask(
      eventId,
      newTask,
      deadline || undefined,
      assignee || undefined,
    );
    setNewTask("");
    setDeadline("");
    setAssignee("");
    setShowOptions(false);
    setLoading(false);
  };

  const handleToggle = async (task: TaskItem) => {
    setTogglingId(task.id);
    await toggleTaskStatus(task.id, task.status);
    setTogglingId(null);
    router.refresh();
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Hapus task ini?")) return;
    await deleteEventTask(taskId);
    router.refresh();
  };

  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const formatted = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    if (days < 0) return { text: formatted, color: "text-red-500 bg-red-50" };
    if (days <= 3)
      return { text: formatted, color: "text-orange-500 bg-orange-50" };
    return { text: formatted, color: "text-gray-500 bg-gray-50" };
  };

  // Unique members from participants for the picker
  const uniqueMembers = participants.reduce((acc: Participant[], p) => {
    if (p.userId && !acc.find((m) => m.userId === p.userId)) {
      acc.push(p);
    }
    return acc;
  }, []);

  const TaskCard = ({
    task,
    done = false,
  }: {
    task: TaskItem;
    done?: boolean;
  }) => (
    <div
      className={cn(
        "group p-4 rounded-2xl flex items-start gap-3 transition-all",
        done
          ? "bg-gray-50 border border-gray-100 opacity-75 hover:opacity-100"
          : "bg-white border border-gray-200 hover:shadow-md",
      )}
    >
      <button
        onClick={() => handleToggle(task)}
        disabled={togglingId === task.id}
        className={cn(
          "mt-0.5 transition-colors",
          done
            ? "text-green-500 hover:text-green-600"
            : "text-gray-300 hover:text-indigo-600",
        )}
      >
        {togglingId === task.id ? (
          <Loader2
            size={20}
            className={cn(
              "animate-spin",
              done ? "text-green-500" : "text-indigo-600",
            )}
          />
        ) : done ? (
          <Check size={20} />
        ) : (
          <Circle size={20} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "font-medium text-sm block",
            done
              ? "text-gray-500 line-through decoration-gray-400"
              : "text-gray-700",
          )}
        >
          {task.title}
        </span>

        {/* Meta: Deadline + Assignee */}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {task.deadline && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg",
                formatDeadline(task.deadline).color,
              )}
            >
              <CalendarDays size={11} />
              {formatDeadline(task.deadline).text}
            </span>
          )}
          {task.assignedUserName && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
              <User size={11} />
              {task.assignedUserName}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => handleDelete(task.id)}
        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* INPUT BARU */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-indigo-600" /> To-Do List
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Tambah tugas baru... (Contoh: Bikin Rundown)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newTask.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              Add
            </button>
          </div>

          {/* Toggle untuk opsi tambahan */}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform",
                showOptions ? "rotate-180" : "",
              )}
            />
            {showOptions ? "Sembunyikan opsi" : "Deadline & Assign (opsional)"}
          </button>

          {showOptions && (
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Deadline
                </label>
                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Assign ke
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none"
                    disabled={loading}
                  >
                    <option value="">— Tidak ada —</option>
                    {uniqueMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.userName || "Unnamed"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* LIST TASKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KOLOM PENDING */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Belum Selesai ({pendingTasks.length})
          </h5>
          {pendingTasks.length === 0 && (
            <div className="p-4 border border-dashed border-gray-200 rounded-2xl text-center text-sm text-gray-400">
              Tidak ada tugas pending.
            </div>
          )}
          {pendingTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {/* KOLOM SELESAI */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Selesai ({completedTasks.length})
          </h5>
          {completedTasks.length === 0 && (
            <div className="p-4 border border-dashed border-gray-200 rounded-2xl text-center text-sm text-gray-400">
              Belum ada tugas selesai.
            </div>
          )}
          {completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} done />
          ))}
        </div>
      </div>
    </div>
  );
}
