"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  ShieldCheck,
  UserPlus,
  X,
  Search,
  Check,
  Trash2,
  Users,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDivisionMembers,
  addParticipant,
  removeParticipant,
} from "../../actions";

interface Participant {
  id: number;
  userId: string;
  userName: string | null;
  role: string;
  joinedAt: string;
  user?: { name: string };
}

interface Member {
  id: string;
  name: string | null;
}

export default function EventTeam({
  eventId,
  divisionId,
  participants: initialParticipants = [],
}: {
  eventId: number;
  divisionId: number;
  participants: Participant[];
}) {
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<
    { userId: string; role: string }[]
  >([]);
  const [isPending, startTransition] = useTransition();
  // Use null to distinguish "not loaded yet" from "loaded but empty"
  const [allMembers, setAllMembers] = useState<Member[] | null>(null);
  const loadingMembers = showModal && allMembers === null;

  // Fetch division members when modal opens
  useEffect(() => {
    if (!showModal || allMembers !== null) return;

    let cancelled = false;

    getDivisionMembers(divisionId).then((members) => {
      if (!cancelled) {
        setAllMembers(members);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showModal, divisionId, allMembers]);

  // Filter out already-assigned members
  const existingUserIds = participants.map((p) => p.userId);
  const availableMembers = (allMembers ?? []).filter(
    (m) =>
      !existingUserIds.includes(m.id) &&
      !selectedMembers.some((s) => s.userId === m.id),
  );
  const filteredMembers = availableMembers.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleMember(userId: string) {
    setSelectedMembers((prev) => {
      const existing = prev.find((s) => s.userId === userId);
      if (existing) return prev.filter((s) => s.userId !== userId);
      return [...prev, { userId, role: "Anggota" }];
    });
  }

  function setMemberRole(userId: string, role: string) {
    setSelectedMembers((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, role } : s)),
    );
  }

  function handleSubmit() {
    if (selectedMembers.length === 0) return;
    startTransition(async () => {
      for (const member of selectedMembers) {
        await addParticipant(eventId, member.userId, member.role);
      }
      // Refresh: add new members to local state
      const newParticipants = selectedMembers.map((m) => {
        const memberInfo = (allMembers ?? []).find((a) => a.id === m.userId);
        return {
          id: Date.now() + Math.random(), // temp id
          userId: m.userId,
          userName: memberInfo?.name || "Unknown",
          role: m.role,
          joinedAt: new Date().toISOString(),
        };
      });
      setParticipants((prev) => [...prev, ...newParticipants]);
      setSelectedMembers([]);
      setSearch("");
      setShowModal(false);
    });
  }

  function handleRemove(participantId: number) {
    startTransition(async () => {
      const result = await removeParticipant(participantId);
      if (result.success) {
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      }
    });
  }

  // Separate PIC and Anggota
  const pics = participants.filter((p) => p.role === "PIC");
  const anggota = participants.filter((p) => p.role !== "PIC");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900">
          Tim Pelaksana ({participants.length})
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Tambah Anggota</span>
        </button>
      </div>

      {/* PIC Section */}
      {pics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-orange-600">
            <Crown size={16} />
            <span>PIC Utama</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pics.map((p) => (
              <MemberCard
                key={p.id}
                participant={p}
                onRemove={() => handleRemove(p.id)}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Anggota Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <Users size={16} />
          <span>Anggota ({anggota.length})</span>
        </div>
        {anggota.length === 0 && pics.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
            Belum ada anggota tim yang ditugaskan.
          </div>
        ) : anggota.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
            Belum ada anggota selain PIC.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anggota.map((p) => (
              <MemberCard
                key={p.id}
                participant={p}
                onRemove={() => handleRemove(p.id)}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== ADD MEMBER MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              setSelectedMembers([]);
              setSearch("");
            }}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Tambah Anggota Tim
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih anggota dan tentukan peran mereka
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMembers([]);
                  setSearch("");
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 pt-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari anggota..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Selected Members Preview */}
            {selectedMembers.length > 0 && (
              <div className="px-6 pt-4">
                <p className="text-xs font-bold text-gray-500 mb-2">
                  DIPILIH ({selectedMembers.length})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedMembers.map((s) => {
                    const member = (allMembers ?? []).find(
                      (m) => m.id === s.userId,
                    );
                    return (
                      <div
                        key={s.userId}
                        className="flex items-center justify-between bg-indigo-50 px-3 py-2.5 rounded-xl border border-indigo-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {member?.name?.charAt(0) || "?"}
                          </div>
                          <span className="font-bold text-sm text-gray-900 truncate">
                            {member?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={s.role}
                            onChange={(e) =>
                              setMemberRole(s.userId, e.target.value)
                            }
                            className="text-xs font-bold px-2 py-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-700 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-200"
                          >
                            <option value="PIC">PIC Utama</option>
                            <option value="Anggota">Anggota</option>
                          </select>
                          <button
                            onClick={() => toggleMember(s.userId)}
                            className="p-1 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <X size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Member List */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2">
              {loadingMembers ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Memuat anggota divisi...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  {search
                    ? "Tidak ada anggota yang cocok."
                    : "Semua anggota sudah ditambahkan."}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold shrink-0">
                        {member.name?.charAt(0) || "?"}
                      </div>
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {member.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMembers([]);
                  setSearch("");
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedMembers.length === 0 || isPending}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isPending ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Tambahkan ({selectedMembers.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({
  participant,
  onRemove,
  isPending,
}: {
  participant: Participant;
  onRemove: () => void;
  isPending: boolean;
}) {
  const name = participant.userName || participant.user?.name || "Unknown User";
  const isPIC = participant.role === "PIC";

  return (
    <div
      className={cn(
        "bg-white border p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow group relative",
        isPIC ? "border-orange-200" : "border-gray-200",
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
          isPIC ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600",
        )}
      >
        {name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 line-clamp-1">{name}</p>
        <div className="flex items-center gap-1 mt-1">
          {isPIC && <ShieldCheck size={14} className="text-orange-500" />}
          <span
            className={cn(
              "text-xs font-bold uppercase",
              isPIC ? "text-orange-600" : "text-gray-500",
            )}
          >
            {participant.role}
          </span>
        </div>
      </div>
      <button
        onClick={onRemove}
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-xl transition-all cursor-pointer disabled:opacity-30"
        title="Hapus anggota"
      >
        <Trash2 size={16} className="text-red-400" />
      </button>
    </div>
  );
}
