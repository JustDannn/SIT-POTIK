import {
  LayoutDashboard,
  BarChart3,
  FileText,
  PenTool,
  Building2,
  Users,
  Wallet,
  ScrollText,
  CheckCircle,
  Archive,
  History,
  AlertCircle,
} from "lucide-react";

export type MenuItem = {
  title: string;
  href: string;
  icon: any;
};

// Mapping Role ke Menu sesuai Deskripsi User
export const ROLE_MENUS: Record<string, MenuItem[]> = {
  // 1. ANGGOTA (Eksekutor)
  Anggota: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Proker Saya", href: "/dashboard/proker", icon: BarChart3 },
    { title: "Task Saya", href: "/dashboard/tasks", icon: CheckCircle },
    { title: "Log Aktivitas", href: "/dashboard/logs", icon: History },
  ],

  // 2. KOORDINATOR (Manajer Divisi)
  Koordinator: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 }, // Manage Proker
    {
      title: "Task Management",
      href: "/dashboard/tasks/manage",
      icon: CheckCircle,
    },
    { title: "Log Aktivitas", href: "/dashboard/logs", icon: History },
    { title: "Laporan", href: "/dashboard/reports", icon: FileText },
    { title: "Konten", href: "/dashboard/content", icon: PenTool }, // Opsional
  ],

  // 3. KETUA (Decision Maker)
  Ketua: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 }, // View All
    {
      title: "Laporan & Approval",
      href: "/dashboard/approvals",
      icon: AlertCircle,
    },
    {
      title: "Konten Publikasi",
      href: "/dashboard/content/review",
      icon: PenTool,
    },
    { title: "Ringkasan Org", href: "/dashboard/overview", icon: Building2 },
  ],

  // 4. SEKRETARIS (Admin & Arsip)
  Sekretaris: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Notulensi", href: "/dashboard/minutes", icon: FileText },
    { title: "Arsip Dokumen", href: "/dashboard/archives", icon: Archive },
    { title: "Laporan", href: "/dashboard/reports", icon: ScrollText }, // Opsional
  ],

  // 5. BENDAHARA (Finance)
  Bendahara: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      title: "Keuangan Proker",
      href: "/dashboard/finance/proker",
      icon: Wallet,
    },
    {
      title: "Keuangan Umum",
      href: "/dashboard/finance/general",
      icon: Building2,
    },
    { title: "LPJ", href: "/dashboard/lpj", icon: ScrollText },
  ],

  // 6. DOSEN (Overseer)
  Dosen: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 }, // View Only
    {
      title: "Laporan (Approval)",
      href: "/dashboard/approvals",
      icon: CheckCircle,
    },
  ],
};
