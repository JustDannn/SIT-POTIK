import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Wallet,
  CheckCircle,
  Archive,
  History,
  AlertCircle,
  BookOpen,
  PieChart,
  Database,
  Share2,
  GraduationCap,
  Zap,
  Calendar,
  PenTool,
  Building2,
  Users,
  ScrollText,
} from "lucide-react";

export const getMenuForUser = (role?: string, divisionName?: string) => {
  const baseMenu = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];
  if (role === "Ketua") {
    return [
      ...baseMenu,
      { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 },
      {
        title: "Laporan & Approval",
        href: "/dashboard/approval",
        icon: AlertCircle,
      },
      { title: "Konten Publikasi", href: "/dashboard/content", icon: PenTool },
      { title: "Ringkasan Org", href: "/dashboard/overview", icon: Building2 },
    ];
  }
  if (role === "Koordinator") {
    let managementMenu = [
      { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 },
      { title: "Task Management", href: "/dashboard/tasks", icon: CheckCircle },
      { title: "Log Aktivitas", href: "/dashboard/logs", icon: History },
      { title: "Laporan Divisi", href: "/dashboard/reports", icon: FileText },
    ];

    let divisionMenu: any[] = [];
    const div = divisionName?.toLowerCase() || "";
    if (div.includes("layanan")) {
      managementMenu = managementMenu.filter(
        (item) => item.title !== "Program Kerja",
      );
    }
    // Divisi Riset & Data
    if (div.includes("riset") || div.includes("infografis")) {
      divisionMenu = [
        {
          title: "Publikasi",
          href: "/dashboard/publications",
          icon: BookOpen,
        },
      ];
    }
    // Divisi Media & Branding
    else if (div.includes("media") || div.includes("branding")) {
      divisionMenu = [
        { title: "Content Plan", href: "/dashboard/content", icon: PenTool },
      ];
    }
    // Divisi pr & sdm
    else if (
      div.includes("public") ||
      div.includes("relation") ||
      div.includes("manusia")
    ) {
      return [
        ...baseMenu,
        { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 },
        {
          title: "Konten & Publikasi",
          href: "/dashboard/content",
          icon: PenTool,
        },
        {
          title: "Relasi & Partner",
          href: "/dashboard/partners",
          icon: Building2,
        },
        { title: "Anggota & SDM", href: "/dashboard/members", icon: Users },
        { title: "Laporan", href: "/dashboard/reports", icon: ScrollText },
      ];
    } else if (div.includes("layanan") || div.includes("data")) {
      divisionMenu = [];
    } else if (div.includes("edukasi") || div.includes("pelatihan")) {
      return [
        ...baseMenu,
        { title: "Program & Event", href: "/dashboard/events", icon: Calendar },
        {
          title: "Peserta & Alumni",
          href: "/dashboard/participants",
          icon: GraduationCap,
        },
        { title: "Impact Stories", href: "/dashboard/impacts", icon: Zap },
        { title: "Laporan", href: "/dashboard/reports", icon: ScrollText },
      ];
    }

    // Gabungkan semuanya
    // Urutan: Dashboard -> Menu Spesifik Divisi -> Menu Manajerial Umum
    return [...baseMenu, ...divisionMenu, ...managementMenu];
  }

  // SEKRETARIS
  if (role === "Sekretaris") {
    return [
      ...baseMenu,
      { title: "Notulensi", href: "/dashboard/minutes", icon: FileText },
      { title: "Arsip Dokumen", href: "/dashboard/archives", icon: Archive },
      { title: "Laporan", href: "/dashboard/reports", icon: ScrollText },
    ];
  }

  // BENDAHARA
  if (role === "Bendahara") {
    return [
      ...baseMenu,
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
    ];
  }

  // ANGGOTA (DEFAULT)
  return [
    ...baseMenu,
    { title: "Proker Saya", href: "/dashboard/proker", icon: BarChart3 },
    { title: "Task Saya", href: "/dashboard/tasks", icon: CheckCircle },
    { title: "Log Aktivitas", href: "/dashboard/logs", icon: History },
  ];
};
