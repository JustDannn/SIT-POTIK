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
  BookOpen,
  PieChart,
  Database,
  Share2,
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
    const managementMenu = [
      { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 },
      { title: "Task Management", href: "/dashboard/tasks", icon: CheckCircle },
      { title: "Log Aktivitas", href: "/dashboard/logs", icon: History },
      { title: "Laporan Divisi", href: "/dashboard/reports", icon: FileText },
    ];

    let divisionMenu: any[] = [];
    const div = divisionName?.toLowerCase() || "";

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
      div.includes("humas") ||
      div.includes("public") ||
      div.includes("relation")
    ) {
      divisionMenu = [
        // Sisi Eksternal
        {
          title: "Database Mitra",
          href: "/dashboard/partners",
          icon: Building2,
        },
        // Sisi Internal
        { title: "Database Anggota", href: "/dashboard/members", icon: Users },
      ];
    } else if (div.includes("layanan") || div.includes("data")) {
      divisionMenu = [
        {
          title: "Buku Tamu",
          href: "/dashboard/bukutamu",
          icon: Database,
        },
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
