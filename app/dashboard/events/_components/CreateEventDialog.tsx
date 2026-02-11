"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Paperclip,
  Save,
  Loader2,
  Plus,
  AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createEvent } from "../actions";

interface Member {
  id: string;
  name: string;
  image?: string | null;
}

export default function CreateEventDialog({
  isOpen,
  onClose,
  divisionMembers,
}: {
  isOpen: boolean;
  onClose: () => void;
  divisionMembers: Member[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<
    { userId: string; role: string }[]
  >([]);
  const [showMemberSelect, setShowMemberSelect] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
    setSelectedMembers([]);
    setAttachment(null);
    setShowMemberSelect(false);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => resetForm());
    }
  }, [isOpen]);

  // Close member dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(e.target as Node)
      ) {
        setShowMemberSelect(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMember = (memberId: string) => {
    if (!selectedMembers.find((m) => m.userId === memberId)) {
      setSelectedMembers([
        ...selectedMembers,
        { userId: memberId, role: "Anggota" },
      ]);
    }
    setShowMemberSelect(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.userId !== memberId));
  };

  const toggleRole = (memberId: string) => {
    setSelectedMembers(
      selectedMembers.map((m) =>
        m.userId === memberId
          ? { ...m, role: m.role === "PIC" ? "Anggota" : "PIC" }
          : m,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const startDateTime = `${formData.startDate}T${formData.startTime || "00:00"}`;
    const endDateTime =
      formData.endDate && formData.endTime
        ? `${formData.endDate}T${formData.endTime}`
        : "";

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("location", formData.location);
    submitData.append("startDate", startDateTime);
    submitData.append("endDate", endDateTime);
    submitData.append("members", JSON.stringify(selectedMembers));

    if (attachment) {
      submitData.append("attachment", attachment);
    }

    const res = await createEvent(submitData);

    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      alert(res.error);
    }
  };

  if (!isOpen) return null;

  // Members not yet selected
  const availableMembers = divisionMembers.filter(
    (m) => !selectedMembers.find((sm) => sm.userId === m.id),
  );

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">Buat Jadwal Baru</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Title Input */}
            <input
              placeholder="Nama Kegiatan / Event..."
              className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              autoFocus
            />

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Calendar size={12} /> Mulai
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                  <input
                    type="time"
                    className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                  <Clock size={12} /> Selesai
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                  <input
                    type="time"
                    className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <MapPin size={16} />
              </div>
              <input
                placeholder="Lokasi (e.g. Zoom / Aula)"
                className="flex-1 border-b border-gray-200 py-2 outline-none text-gray-700 focus:border-indigo-500 transition-colors"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 px-2">
              <div className="flex items-center gap-2 mb-1">
                <AlignLeft size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-700">
                  Deskripsi
                </span>
              </div>
              <textarea
                className="w-full min-h-25 bg-gray-50 rounded-xl p-4 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-100 text-sm text-gray-700 resize-none"
                placeholder="Tulis detail kegiatan disini..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Add Guests / Members */}
            <div className="space-y-3 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">
                    Tim & Peserta
                  </span>
                </div>

                {/* Member Dropdown Trigger */}
                <div className="relative" ref={memberDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowMemberSelect(!showMemberSelect)}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Tambah Anggota
                  </button>

                  {/* Dropdown Menu */}
                  {showMemberSelect && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-20 max-h-60 overflow-y-auto">
                      {availableMembers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                          Semua anggota sudah ditambahkan
                        </div>
                      ) : (
                        availableMembers.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleAddMember(member.id)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden shrink-0 flex items-center justify-center text-indigo-600 text-xs font-bold">
                              {member.image ? (
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                member.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {member.name}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Members List */}
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((sm) => {
                  const m = divisionMembers.find((dm) => dm.id === sm.userId);
                  if (!m) return null;
                  return (
                    <div
                      key={sm.userId}
                      className="flex items-center gap-2 bg-white border border-gray-200 pl-1 pr-2 py-1 rounded-full shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                        {m.image ? (
                          <Image
                            src={m.image}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            width={24}
                            height={24}
                          />
                        ) : (
                          m.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {m.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRole(sm.userId)}
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors",
                          sm.role === "PIC"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                        )}
                      >
                        {sm.role}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(sm.userId)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attachments */}
            <div className="px-2">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-700">
                  Lampiran
                </span>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all"
              >
                {attachment ? (
                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium text-sm">
                    <Paperclip size={16} /> {attachment.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachment(null);
                      }}
                      className="p-1 hover:bg-indigo-100 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    Klik untuk upload file (PDF/PPT/Doc)
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* FOOTER ACTIONS (sticky) */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
            >
              <span className="inline-flex">
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
              </span>
              <span>Simpan Jadwal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
