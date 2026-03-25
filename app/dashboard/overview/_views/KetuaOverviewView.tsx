"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Network,
  Building2,
  CheckCircle2,
  UserCircle,
  XCircle,
  Edit,
  X,
  Save,
  KeyRound,
  Copy,
  Check,
  Clock, // Tambahan icon buat waktu expired
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateMember, generateTokenAction } from "../actions";

// ... [Interface definitions (Role, Division, Member, dll) tetep sama persis kayak kode lu] ...
interface Role {
  id: number;
  roleName: string;
}

interface Division {
  id: number;
  divisionName: string;
}

interface Member {
  id: string;
  name: string;
  status: "active" | "inactive";
  roleId: number;
  divisionId: number | null;
  role?: Role;
  division?: Division | null;
}
interface EditingMember extends Omit<Member, "roleId" | "divisionId"> {
  roleId: string;
  divisionId: string;
}

interface DivisionStat {
  id: number;
  name: string;
  count: number;
}

interface OrgData {
  bph: Member[];
  staff: Member[];
  stats: {
    divisionBreakdown: DivisionStat[];
  };
}

interface References {
  roles: Role[];
  divisions: Division[];
}

// --- KOMPONEN TOAST ---
const Toast = ({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) => (
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

export default function KetuaOverviewView({
  data,
  references,
}: {
  data: OrgData;
  references: References;
}) {
  const [activeTab, setActiveTab] = useState("structure");
  const [search, setSearch] = useState("");

  const [editingUser, setEditingUser] = useState<EditingMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // STATE UNTUK GENERATE TOKEN
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenExpiredAt, setTokenExpiredAt] = useState<string | null>(null); // State buat nyimpen waktu expired
  const [copied, setCopied] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const roles = references?.roles ?? [];
  const divisions = references?.divisions ?? [];
  const allMembers = [...data.bph, ...data.staff];

  const filteredMembers = allMembers.filter(
    (m: Member) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.division?.divisionName?.toLowerCase().includes(search.toLowerCase()) ||
      m.role?.roleName?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);

    try {
      const fixedDivisionId =
        editingUser.divisionId !== "" ? parseInt(editingUser.divisionId) : null;

      const res = await updateMember(editingUser.id, {
        roleId: parseInt(editingUser.roleId),
        divisionId: fixedDivisionId,
        status: editingUser.status,
      });

      if (res?.success) {
        setNotification({
          type: "success",
          message: "Data member berhasil diperbarui!",
        });
        setEditingUser(null);
      } else {
        setNotification({
          type: "error",
          message: "Gagal update (Server Error).",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Gagal memperbarui data member.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // HANDLE GENERATE TOKEN (Tanpa FormData sekarang)
  const handleGenerateToken = async () => {
    setIsGenerating(true);
    setGeneratedToken(null);
    setTokenExpiredAt(null);
    setCopied(false);

    try {
      const result = await generateTokenAction();
      if (result.success && result.token) {
        setGeneratedToken(result.token);
        setTokenExpiredAt(result.expiresAt || null);
        setNotification({ type: "success", message: "Token berhasil dibuat!" });
      } else {
        setNotification({ type: "error", message: result.error || "Gagal." });
      }
    } catch {
      setNotification({ type: "error", message: "Gagal generate token." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format tanggal untuk UI
  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-8 pb-10 relative">
      {/* ... [Toast, Header, Tab 1, Tab 2, Modal Edit persis sama kayak lu] ... */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ringkasan Organisasi
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola struktur dan akses peran anggota.
          </p>
        </div>

        {/* Tools (Tabs & Actions) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("structure")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "structure"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Network size={16} /> Struktur
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                activeTab === "directory"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Users size={16} /> Kelola Member
            </button>
          </div>

          <button
            onClick={() => {
              setIsTokenModalOpen(true);
              // Langsung generate kalau belum ada token yang ditampilin
              if (!generatedToken) {
                handleGenerateToken();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <KeyRound size={16} />
            <span className="hidden sm:inline">Generate Token</span>
          </button>
        </div>
      </div>

      {/* === TAB 1: VISUAL STRUKTUR === */}
      {activeTab === "structure" && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Level Atas: Ketua */}
          <div className="flex justify-center">
            {data.bph
              .filter((m: Member) => m.role?.roleName === "Ketua")
              .map((ketua: Member) => (
                <div key={ketua.id} className="text-center relative">
                  <div className="w-24 h-24 mx-auto bg-linear-to-br from-orange-400 to-orange-600 rounded-full p-1 shadow-lg mb-3">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                      <UserCircle size={64} className="text-gray-300" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {ketua.name}
                  </h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    Ketua Umum
                  </span>
                  <div className="absolute top-full left-1/2 w-px h-8 bg-gray-300 -translate-x-1/2"></div>
                </div>
              ))}
          </div>

          {/* Level Tengah: BPH Lainnya */}
          <div className="relative pt-8">
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gray-300"></div>
            <div className="absolute top-0 left-1/2 w-px h-8 bg-gray-300 -translate-x-1/2"></div>

            <div className="flex flex-wrap justify-center gap-8">
              {data.bph
                .filter((m: Member) => m.role?.roleName !== "Ketua")
                .map((bph: Member) => (
                  <div
                    key={bph.id}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm w-48 text-center relative mt-4"
                  >
                    <div className="absolute -top-4 left-1/2 w-px h-4 bg-gray-300 -translate-x-1/2"></div>
                    <h4 className="font-bold text-gray-900">{bph.name}</h4>
                    <p className="text-xs text-gray-500 uppercase mt-1">
                      {bph.role?.roleName}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Level Bawah: Statistik Divisi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-gray-100 mt-8">
            {data.stats.divisionBreakdown.map((div: DivisionStat) => (
              <div
                key={div.id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <Building2 size={20} />
                  </div>
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {div.count} Anggota
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {div.name}
                </h3>
                <p className="text-sm text-gray-500">Divisi Teknis</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === TAB 2: DIREKTORI & EDIT === */}
      {activeTab === "directory" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari member, divisi, atau jabatan..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nama</th>
                  <th className="px-6 py-3 font-semibold">Jabatan</th>
                  <th className="px-6 py-3 font-semibold">Divisi</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member: Member) => (
                  <tr
                    key={member.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      member.status === "inactive" && "opacity-50 bg-gray-50",
                    )}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                        {member.name.charAt(0)}
                      </div>
                      {member.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          member.role?.roleName === "Ketua"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700",
                        )}
                      >
                        {member.role?.roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {member.division?.divisionName || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full inline-block mr-2",
                          member.status === "active"
                            ? "bg-green-500"
                            : "bg-red-500",
                        )}
                      ></span>
                      {member.status === "active" ? "Aktif" : "Non-Aktif"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          setEditingUser({
                            ...member,
                            roleId: String(member.roleId),
                            divisionId:
                              member.divisionId !== null
                                ? String(member.divisionId)
                                : "",
                          })
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 justify-end"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length === 0 && (
              <div className="p-8 text-center text-gray-400 italic">
                Member tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* === MODAL EDIT MEMBER === */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Edit Member</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-orange-500"
                    value={editingUser.roleId || ""}
                    onChange={(e) => {
                      const newRoleId = e.target.value;
                      const newRole = roles.find(
                        (r: Role) => String(r.id) === newRoleId,
                      );
                      const isNonDiv = [
                        "Ketua",
                        "Sekretaris",
                        "Bendahara",
                      ].includes(newRole?.roleName ?? "");
                      setEditingUser({
                        ...editingUser,
                        roleId: newRoleId,
                        divisionId: isNonDiv ? "" : editingUser.divisionId,
                      });
                    }}
                  >
                    {roles.map((r: Role) => (
                      <option key={r.id} value={r.id}>
                        {r.roleName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Divisi
                  </label>
                  {(() => {
                    const selectedRole = roles.find(
                      (r: Role) => String(r.id) === String(editingUser.roleId),
                    );
                    const isNonDivisionRole = [
                      "Ketua",
                      "Sekretaris",
                      "Bendahara",
                    ].includes(selectedRole?.roleName ?? "");
                    return isNonDivisionRole ? (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed">
                        Tidak memerlukan divisi
                      </div>
                    ) : (
                      <select
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-orange-500"
                        value={editingUser.divisionId || ""}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            divisionId: e.target.value,
                          })
                        }
                      >
                        <option value="">Tanpa Divisi</option>
                        {divisions.map((d: Division) => (
                          <option key={d.id} value={d.id}>
                            {d.divisionName}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-orange-500"
                  value={editingUser.status || "active"}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      status: e.target.value as Member["status"],
                    })
                  }
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-Aktif</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isSaving ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save size={16} /> Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL GENERATE TOKEN BARU (DISEDERHANAKAN) === */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <KeyRound size={18} className="text-gray-500" /> Token
                Registrasi
              </h3>
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500">Membuat token baru...</p>
                </div>
              ) : generatedToken ? (
                <div className="space-y-5 text-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      Token Siap Digunakan!
                    </h4>
                    <p className="text-sm text-gray-500">
                      Token ini akan memberikan akses sebagai{" "}
                      <span className="font-semibold text-gray-700">
                        Anggota
                      </span>
                      .
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-orange-50 px-3 py-3 rounded-lg border border-orange-200 text-xl font-mono text-center text-orange-700 tracking-widest font-bold shadow-inner">
                      {generatedToken}
                    </code>
                    <button
                      onClick={handleCopyToken}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition shadow-sm"
                      title="Copy Token"
                    >
                      {copied ? (
                        <Check size={24} className="text-green-600" />
                      ) : (
                        <Copy size={24} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-orange-600 bg-orange-50/50 py-2 rounded-md">
                    <Clock size={14} />
                    <span>
                      Kadaluarsa:{" "}
                      <strong>{formatExpirationDate(tokenExpiredAt)}</strong>
                    </span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={handleGenerateToken}
                      className="flex-1 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition"
                    >
                      Buat Baru
                    </button>
                    <button
                      onClick={() => setIsTokenModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Gagal menampilkan token. Silakan coba lagi.
                  </p>
                  <button
                    onClick={handleGenerateToken}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition"
                  >
                    Coba Generate Lagi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
