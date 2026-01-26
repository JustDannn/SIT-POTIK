import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  PenTool, 
  Building2, 
  Users, 
  Wallet,
  ScrollText
} from "lucide-react";

export type MenuItem = {
  title: string;
  href: string;
  icon: any;
};

export const ROLE_MENUS: Record<string, MenuItem[]> = {
  // Flow Ketua: Overview, Review Laporan, Review Konten
  Ketua: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Monitoring Proker", href: "/dashboard/proker", icon: BarChart3 },
    { title: "Approval Laporan", href: "/dashboard/approval/reports", icon: FileText },
    { title: "Approval Konten", href: "/dashboard/approval/content", icon: PenTool },
    { title: "Ringkasan Organisasi", href: "/dashboard/overview", icon: Building2 },
  ],

  // Flow Anggota: Proker, Task, Log
  Anggota: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Proker Saya", href: "/dashboard/proker", icon: BarChart3 },
    { title: "Tugas (Tasks)", href: "/dashboard/tasks", icon: FileText },
  ],

  // Flow Koordinator: Manage Proker, Task, Upload Report
  Koordinator: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Manajemen Proker", href: "/dashboard/proker/manage", icon: BarChart3 },
    { title: "Manajemen Task", href: "/dashboard/tasks/manage", icon: FileText },
    { title: "Upload Laporan", href: "/dashboard/reports/upload", icon: ScrollText },
    { title: "Submit Konten", href: "/dashboard/content/submit", icon: PenTool },
  ],

  // Flow Sekretaris: Notulensi, Arsip
  Sekretaris: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Notulensi Rapat", href: "/dashboard/minutes", icon: FileText },
    { title: "Arsip Dokumen", href: "/dashboard/archives", icon: Building2 },
  ],

  // Flow Bendahara: Keuangan, LPJ
  Bendahara: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Keuangan & Anggaran", href: "/dashboard/finance", icon: Wallet },
    { title: "LPJ", href: "/dashboard/lpj", icon: ScrollText },
  ],
};