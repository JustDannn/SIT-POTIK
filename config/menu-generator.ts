import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Wallet,
  CheckCircle,
  Archive,
  History,
  BookOpen,
  Zap,
  Calendar,
  PenTool,
  Building2,
  ScrollText,
  Globe,
  FolderOpen,
  Palette,
} from "lucide-react";

type MenuItem = {
  title: string;
  href: string;
  icon: unknown;
};

export const getMenuForUser = (role?: string, divisionName?: string) => {
  const baseMenu: MenuItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];
  if (role === "Ketua") {
    return [
      ...baseMenu,
      { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 },
      { title: "Ringkasan Org", href: "/dashboard/overview", icon: Building2 },
    ];
  }
  if (role === "Koordinator") {
    let managementMenu: MenuItem[] = [
      { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 },
      { title: "Task Management", href: "/dashboard/tasks", icon: CheckCircle },
    ];

    let divisionMenu: MenuItem[] = [];
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
      return [
        ...baseMenu,
        { title: "Program Kerja", href: "/dashboard/proker", icon: BarChart3 },
        { title: "CMS Website", href: "/dashboard/media/cms", icon: Globe },
        {
          title: "Asset Repository",
          href: "/dashboard/media/repository",
          icon: FolderOpen,
        },
        {
          title: "Campaigns",
          href: "/dashboard/media/campaigns",
          icon: Calendar,
        },
        {
          title: "Brand Kit",
          href: "/dashboard/media/brand-kit",
          icon: Palette,
        },
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
      ];
    } else if (div.includes("layanan") || div.includes("data")) {
      divisionMenu = [];
    } else if (div.includes("edukasi") || div.includes("pelatihan")) {
      return [
        ...baseMenu,
        { title: "Program & Event", href: "/dashboard/events", icon: Calendar },
        { title: "Impact Stories", href: "/dashboard/impacts", icon: Zap },
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
      { title: "Notulensi", href: "/dashboard/minutes", icon: FileText },
      { title: "Arsip Dokumen", href: "/dashboard/archives", icon: Archive },
    ];
  }

  // ANGGOTA (DEFAULT)
  return [
    ...baseMenu,
    { title: "Proker Saya", href: "/dashboard/proker", icon: BarChart3 },
    { title: "Task Saya", href: "/dashboard/tasks", icon: CheckCircle },
    { title: "Log Aktivitas", href: "/dashboard/logs", icon: History },
    { title: "Notulensi", href: "/dashboard/minutes", icon: ScrollText },
    { title: "Arsip Dokumen", href: "/dashboard/archives", icon: Archive },
  ];
};
