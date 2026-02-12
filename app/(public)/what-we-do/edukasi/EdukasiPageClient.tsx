"use client";

import HeroSection, {
  FloatingIconItem,
} from "@/components/what-we-do/HeroSection";
import DivisionContent, {
  DivisionContentProps,
} from "@/components/what-we-do/DivisionContent";
import {
  GraduationCap,
  BookOpen,
  MonitorPlay,
  Award,
  Target,
  Users,
  Puzzle,
  CalendarCheck,
} from "lucide-react";

const edukasiIcons: FloatingIconItem[] = [
  {
    Icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    x: -140,
    y: -140,
    delay: 0.1,
  },
  {
    Icon: Target,
    color: "text-red-500",
    bg: "bg-red-100",
    x: 10,
    y: -180,
    delay: 0.2,
  },
  {
    Icon: MonitorPlay,
    color: "text-teal-600",
    bg: "bg-teal-100",
    x: 160,
    y: -120,
    delay: 0.15,
  },
  {
    Icon: Award,
    color: "text-orange-500",
    bg: "bg-orange-100",
    x: 190,
    y: 30,
    delay: 0.3,
  },
  {
    Icon: Users,
    color: "text-green-600",
    bg: "bg-green-100",
    x: 150,
    y: 170,
    delay: 0.25,
  },
  {
    Icon: CalendarCheck,
    color: "text-blue-500",
    bg: "bg-blue-100",
    x: -20,
    y: 200,
    delay: 0.35,
  },
  {
    Icon: BookOpen,
    color: "text-emerald-700",
    bg: "bg-emerald-200",
    x: -160,
    y: 120,
    delay: 0.2,
  },
  {
    Icon: Puzzle,
    color: "text-lime-600",
    bg: "bg-lime-100",
    x: -190,
    y: -20,
    delay: 0.1,
  },
];

type ContentFromCMS = Omit<DivisionContentProps, "accent"> & {
  hero: {
    badgeText: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
    button1Text: string;
    button2Text: string;
    heroImage: string;
  };
};

export default function EdukasiPageClient({ cms }: { cms: ContentFromCMS }) {
  const buttons: { text: string; variant: "primary" | "secondary" }[] = [
    { text: cms.hero.button1Text || "Daftar Workshop", variant: "primary" },
  ];
  if (cms.hero.button2Text)
    buttons.push({ text: cms.hero.button2Text, variant: "secondary" });

  return (
    <main className="min-h-screen pt-15 pb-20 overflow-x-hidden">
      <HeroSection
        badge={{
          text: cms.hero.badgeText || "Edukasi & Pelatihan",
          className: "bg-emerald-100 text-emerald-800",
        }}
        title={{
          firstLine: cms.hero.titleLine1 || "Ignite Potential,",
          highlightText: cms.hero.titleHighlight || "Master New Skills",
          highlightClassName: "text-emerald-600",
        }}
        description={
          cms.hero.description ||
          "Kami menyelenggarakan workshop statistik, pelatihan software (SPSS, R, Python), dan webinar edukatif untuk meningkatkan literasi data mahasiswa dan masyarakat umum."
        }
        buttons={buttons}
        image={{
          src: cms.hero.heroImage || "/edukasi-person.png",
          alt: "Tutor & Education Team",
          cardColor: "bg-emerald-600",
          blobColor: "bg-orange-400",
          rotation: "left",
        }}
        floatingIcons={edukasiIcons}
      />
      <DivisionContent accent="emerald" {...cms} />
    </main>
  );
}
