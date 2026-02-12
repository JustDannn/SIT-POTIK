"use client";

import HeroSection, {
  FloatingIconItem,
} from "@/components/what-we-do/HeroSection";
import DivisionContent, {
  DivisionContentProps,
} from "@/components/what-we-do/DivisionContent";
import {
  Megaphone,
  Users,
  HeartHandshake,
  MessageCircle,
  Star,
  Briefcase,
  Award,
  Share2,
} from "lucide-react";

const prSdmIcons: FloatingIconItem[] = [
  {
    Icon: Megaphone,
    color: "text-orange-500",
    bg: "bg-orange-100",
    x: -140,
    y: -120,
    delay: 0.1,
  },
  {
    Icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-100",
    x: 20,
    y: -160,
    delay: 0.2,
  },
  {
    Icon: HeartHandshake,
    color: "text-pink-500",
    bg: "bg-pink-100",
    x: 160,
    y: -100,
    delay: 0.15,
  },
  {
    Icon: MessageCircle,
    color: "text-green-500",
    bg: "bg-green-100",
    x: 180,
    y: 40,
    delay: 0.3,
  },
  {
    Icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-100",
    x: 140,
    y: 150,
    delay: 0.25,
  },
  {
    Icon: Briefcase,
    color: "text-purple-500",
    bg: "bg-purple-100",
    x: -30,
    y: 180,
    delay: 0.35,
  },
  {
    Icon: Award,
    color: "text-red-500",
    bg: "bg-red-100",
    x: -160,
    y: 100,
    delay: 0.2,
  },
  {
    Icon: Share2,
    color: "text-cyan-500",
    bg: "bg-cyan-100",
    x: -180,
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

export default function PrSdmPageClient({ cms }: { cms: ContentFromCMS }) {
  const buttons: { text: string; variant: "primary" | "secondary" }[] = [
    { text: cms.hero.button1Text || "Lihat Program Kerja", variant: "primary" },
  ];
  if (cms.hero.button2Text)
    buttons.push({ text: cms.hero.button2Text, variant: "secondary" });

  return (
    <main className="min-h-screen pt-15 pb-20 overflow-x-hidden">
      <HeroSection
        badge={{
          text: cms.hero.badgeText || "Public Relations & SDM",
          className: "bg-orange-100 text-orange-600",
        }}
        title={{
          firstLine: cms.hero.titleLine1 || "Building Bridges,",
          highlightText: cms.hero.titleHighlight || "Empowering People",
          highlightClassName: "text-blue-600",
        }}
        description={
          cms.hero.description ||
          "Divisi PR & SDM bertanggung jawab dalam membangun citra positif Pojok Statistik serta mengelola pengembangan talenta internal untuk menciptakan lingkungan kerja yang harmonis dan produktif."
        }
        buttons={buttons}
        image={{
          src: cms.hero.heroImage || "/pr-sdm-person.png",
          alt: "PR & SDM Team",
          cardColor: "bg-blue-600",
          blobColor: "bg-orange-400",
          rotation: "left",
        }}
        floatingIcons={prSdmIcons}
      />
      <DivisionContent accent="blue" {...cms} />
    </main>
  );
}
