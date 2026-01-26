"use client";

import HeroSection, {
  FloatingIconItem,
} from "@/components/what-we-do/HeroSection";
import {
  Database,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Search,
  Server,
  TrendingUp,
  Binary,
} from "lucide-react";

const dataIcons: FloatingIconItem[] = [
  {
    Icon: Database,
    color: "text-cyan-600",
    bg: "bg-cyan-100",
    x: -140,
    y: -130,
    delay: 0.1,
  },
  {
    Icon: Server,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    x: 10,
    y: -170,
    delay: 0.2,
  },
  {
    Icon: PieChart,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    x: 160,
    y: -110,
    delay: 0.15,
  },
  {
    Icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-100",
    x: 190,
    y: 30,
    delay: 0.3,
  },
  {
    Icon: FileSpreadsheet,
    color: "text-teal-600",
    bg: "bg-teal-100",
    x: 150,
    y: 160,
    delay: 0.25,
  },
  {
    Icon: Binary,
    color: "text-slate-600",
    bg: "bg-slate-200",
    x: -20,
    y: 190,
    delay: 0.35,
  },
  {
    Icon: Search,
    color: "text-violet-600",
    bg: "bg-violet-100",
    x: -150,
    y: 120,
    delay: 0.2,
  },
  {
    Icon: BarChart3,
    color: "text-blue-600",
    bg: "bg-blue-100",
    x: -190,
    y: -10,
    delay: 0.1,
  },
];
export default function LayananDataPage() {
  return (
    <main className="min-h-screen pt-15 pb-20 overflow-x-hidden">
      <HeroSection
        badge={{
          text: "Layanan Data & Statistik",
          className: "bg-cyan-100 text-cyan-700",
        }}
        title={{
          firstLine: "Unlock Insights,",
          highlightText: "Drive Decisions",
          highlightClassName: "text-cyan-600",
        }}
        description="Kami menyediakan akses data strategis, konsultasi metodologi, dan pengolahan statistik profesional untuk mendukung validitas riset akademik dan pengambilan keputusan berbasis data."
        buttons={[{ text: "Ajukan Permintaan Data", variant: "primary" }]}
        image={{
          src: "/data-person.png",
          alt: "Data Analyst Team",
          cardColor: "bg-cyan-600",
          blobColor: "bg-lime-400",
          rotation: "left",
        }}
        floatingIcons={dataIcons}
      />

      {/* Section lain di bawah Hero... */}
    </main>
  );
}
