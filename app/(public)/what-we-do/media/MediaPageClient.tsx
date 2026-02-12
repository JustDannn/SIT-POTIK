"use client";

import HeroSection, {
  FloatingIconItem,
} from "@/components/what-we-do/HeroSection";
import DivisionContent, {
  DivisionContentProps,
} from "@/components/what-we-do/DivisionContent";
import {
  Camera,
  Palette,
  Instagram,
  Clapperboard,
  PenTool,
  Smartphone,
  Layers,
  Sparkles,
} from "lucide-react";

const mediaIcons: FloatingIconItem[] = [
  {
    Icon: Camera,
    color: "text-rose-600",
    bg: "bg-rose-100",
    x: -150,
    y: -130,
    delay: 0.1,
  },
  {
    Icon: Palette,
    color: "text-pink-500",
    bg: "bg-pink-100",
    x: 10,
    y: -180,
    delay: 0.2,
  },
  {
    Icon: Instagram,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-100",
    x: 160,
    y: -110,
    delay: 0.15,
  },
  {
    Icon: Clapperboard,
    color: "text-red-500",
    bg: "bg-red-100",
    x: 190,
    y: 30,
    delay: 0.3,
  },
  {
    Icon: Sparkles,
    color: "text-yellow-500",
    bg: "bg-yellow-100",
    x: 140,
    y: 170,
    delay: 0.25,
  },
  {
    Icon: Smartphone,
    color: "text-violet-600",
    bg: "bg-violet-100",
    x: -20,
    y: 200,
    delay: 0.35,
  },
  {
    Icon: Layers,
    color: "text-orange-500",
    bg: "bg-orange-100",
    x: -160,
    y: 120,
    delay: 0.2,
  },
  {
    Icon: PenTool,
    color: "text-blue-500",
    bg: "bg-blue-100",
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

export default function MediaPageClient({ cms }: { cms: ContentFromCMS }) {
  const buttons: { text: string; variant: "primary" | "secondary" }[] = [
    { text: cms.hero.button1Text || "Lihat Portfolio", variant: "primary" },
  ];
  if (cms.hero.button2Text)
    buttons.push({ text: cms.hero.button2Text, variant: "secondary" });

  return (
    <main className="min-h-screen pt-15 pb-20 overflow-x-hidden">
      <HeroSection
        badge={{
          text: cms.hero.badgeText || "Media & Creative Branding",
          className: "bg-rose-100 text-rose-700",
        }}
        title={{
          firstLine: cms.hero.titleLine1 || "Crafting Identity,",
          highlightText: cms.hero.titleHighlight || "Shaping Narratives",
          highlightClassName: "text-rose-600",
        }}
        description={
          cms.hero.description ||
          "Sebagai wajah kreatif organisasi, kami mengelola identitas visual, produksi konten multimedia, dan strategi media sosial untuk memastikan pesan Pojok Statistik tersampaikan dengan estetik dan berdampak."
        }
        buttons={buttons}
        image={{
          src: cms.hero.heroImage || "/media-person.png",
          alt: "Creative Media Team",
          cardColor: "bg-rose-600",
          blobColor: "bg-gray-900 opacity-80",
          rotation: "right",
        }}
        floatingIcons={mediaIcons}
      />
      <DivisionContent accent="rose" {...cms} />
    </main>
  );
}
