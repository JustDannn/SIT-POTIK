"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  User,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  ArrowRight,
  X,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createTask, updateTaskStatus, deleteTask } from "../actions";
import { useRouter } from "next/navigation";

// --- KOMPONEN TOAST ---
const Toast = ({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed top-5 right-5 z-100 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 bg-white",
        type === "success"
          ? "border-green-200 text-green-700"
          : "border-red-200 text-red-700",
      )}
    >
      {type === "success" ? (
        <CheckCircle2 size={20} className="text-green-500" />
      ) : (
        <XCircle size={20} className="text-red-500" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

// Tipe data
type TaskItem = {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "ongoing" | "done";
  deadline: Date | null;
  prokerTitle: string | null;
  assigneeName: string | null;
};

export default function TaskKanbanView({
  initialTasks,
  prokerOptions,
  memberOptions,
}: {
  initialTasks: any[];
  prokerOptions: any[];
  memberOptions: any[];
}) {
  const router = useRouter();

  // State Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Loading States
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prokerId: prokerOptions[0]?.id || "",
    assignedUserId: memberOptions[0]?.id || "",
    deadline: "",
  });

  // --- HANDLERS ---

  // 1. Create Task
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await createTask({
        ...formData,
        prokerId: Number(formData.prokerId),
        deadline: new Date(formData.deadline),
      });

      if (res.success) {
        setNotification({ type: "success", message: "Tugas berhasil dibuat!" });
        setIsCreateModalOpen(false);
        setFormData((prev) => ({
          ...prev,
          title: "",
          description: "",
          deadline: "",
        }));
      } else {
        setNotification({ type: "error", message: "Gagal membuat tugas." });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Terjadi kesalahan sistem." });
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Prompt Delete (Buka Modal)
  const promptDelete = (id: number) => {
    setTaskToDelete(id);
  };

  // 3. Confirm Delete (Eksekusi)
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteTask(taskToDelete);
      if (res.success) {
        setNotification({
          type: "success",
          message: "Tugas berhasil dihapus.",
        });
      } else {
        setNotification({ type: "error", message: "Gagal menghapus tugas." });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Terjadi kesalahan sistem." });
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  // 4. Change Status
  const handleStatusChange = async (
    id: number,
    status: "todo" | "ongoing" | "done",
  ) => {
    // Optimistic UI update could be added here, but for now standard wait
    await updateTaskStatus(id, status);
  };

  // --- RENDER HELPER ---
  const renderColumn = (
    title: string,
    status: "todo" | "ongoing" | "done",
    icon: any,
    colorClass: string,
  ) => {
    const tasks = initialTasks.filter((t) => t.status === status);

    return (
      <div className="flex-1 min-w-75 bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col h-full max-h-[calc(100vh-200px)]">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", colorClass)}>{icon}</div>
            <h3 className="font-bold text-gray-700">{title}</h3>
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Task List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-20">
          {tasks.map((task: TaskItem) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative"
            >
              {/* Proker Badge */}
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                  {task.prokerTitle || "No Proker"}
                </span>
              </div>

              <h4 className="font-bold text-gray-800 mb-1 leading-snug">
                {task.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                {task.description}
              </p>

              {/* Footer Info */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[10px]">
                    {task.assigneeName?.charAt(0) || "?"}
                  </div>
                  <span className="truncate max-w-20">
                    {task.assigneeName?.split(" ")[0]}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={12} />
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}
                </div>
              </div>

              {/* Action Overlay (Hover) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                {status === "todo" && (
                  <button
                    onClick={() => handleStatusChange(task.id, "ongoing")}
                    className="p-1.5 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
                    title="Mulai Kerjakan"
                  >
                    <ArrowRight size={14} />
                  </button>
                )}
                {status === "ongoing" && (
                  <button
                    onClick={() => handleStatusChange(task.id, "done")}
                    className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                    title="Selesaikan"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                )}
                {status === "done" && (
                  <button
                    onClick={() => handleStatusChange(task.id, "ongoing")}
                    className="p-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                    title="Kembalikan ke Ongoing"
                  >
                    <ArrowRight size={14} className="rotate-180" />
                  </button>
                )}

                <button
                  onClick={() => promptDelete(task.id)}
                  className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                  title="Hapus Tugas"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-xs text-gray-400">Kosong</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full relative">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
          <p className="text-sm text-gray-500">
            Monitoring pekerjaan anggota divisi.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm shadow-sm"
        >
          <Plus size={16} /> Buat Tugas
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
        {renderColumn(
          "To Do",
          "todo",
          <Circle size={18} className="text-gray-500" />,
          "bg-gray-100",
        )}
        {renderColumn(
          "In Progress",
          "ongoing",
          <Clock size={18} className="text-orange-500" />,
          "bg-orange-100",
        )}
        {renderColumn(
          "Completed",
          "done",
          <CheckCircle2 size={18} className="text-green-500" />,
          "bg-green-100",
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Buat Tugas Baru
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Tugas
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Proker
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={formData.prokerId}
                    onChange={(e) =>
                      setFormData({ ...formData, prokerId: e.target.value })
                    }
                  >
                    {prokerOptions.length === 0 && (
                      <option value="">Belum ada proker</option>
                    )}
                    {prokerOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Ke
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={formData.assignedUserId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignedUserId: e.target.value,
                      })
                    }
                  >
                    {memberOptions.length === 0 && (
                      <option value="">Belum ada anggota</option>
                    )}
                    {memberOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tenggat Waktu
                </label>
                <input
                  required
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  disabled={isCreating}
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Buat Tugas"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Hapus Tugas?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak
                dapat dibatalkan.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setTaskToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Hapus...
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
