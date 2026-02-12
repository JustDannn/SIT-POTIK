"use client";

import HeroSection, {
  FloatingIconItem,
} from "@/components/what-we-do/HeroSection";
import DivisionContent, {
  DivisionContentProps,
} from "@/components/what-we-do/DivisionContent";
import {
  Microscope,
  ScrollText,
  Presentation,
  Brain,
  PenTool,
  Image as ImageIcon,
  LibraryBig,
  Lightbulb,
} from "lucide-react";

const risetIcons: FloatingIconItem[] = [
  {
    Icon: Microscope,
    color: "text-purple-600",
    bg: "bg-purple-100",
    x: -150,
    y: -130,
    delay: 0.1,
  },
  {
    Icon: Presentation,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    x: 0,
    y: -180,
    delay: 0.2,
  },
  {
    Icon: ScrollText,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-100",
    x: 150,
    y: -120,
    delay: 0.15,
  },
  {
    Icon: ImageIcon,
    color: "text-violet-600",
    bg: "bg-violet-100",
    x: 180,
    y: 20,
    delay: 0.3,
  },
  {
    Icon: PenTool,
    color: "text-amber-600",
    bg: "bg-amber-100",
    x: 140,
    y: 160,
    delay: 0.25,
  },
  {
    Icon: LibraryBig,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    x: -30,
    y: 200,
    delay: 0.35,
  },
  {
    Icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-200",
    x: -160,
    y: 110,
    delay: 0.2,
  },
  {
    Icon: Lightbulb,
    color: "text-yellow-500",
    bg: "bg-yellow-200",
    x: -190,
    y: -30,
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

export default function RisetPageClient({ cms }: { cms: ContentFromCMS }) {
  const buttons: { text: string; variant: "primary" | "secondary" }[] = [
    { text: cms.hero.button1Text || "Lihat Hasil Riset", variant: "primary" },
  ];
  if (cms.hero.button2Text)
    buttons.push({ text: cms.hero.button2Text, variant: "secondary" });

  return (
    <main className="min-h-screen pt-15 pb-20 overflow-x-hidden">
      <HeroSection
        badge={{
          text: cms.hero.badgeText || "Riset & Infografis",
          className: "bg-purple-100 text-purple-700",
        }}
        title={{
          firstLine: cms.hero.titleLine1 || "Transforming Complexity,",
          highlightText: cms.hero.titleHighlight || "Visualizing Impact",
          highlightClassName: "text-purple-600",
        }}
        description={
          cms.hero.description ||
          "Kami melakukan kajian mendalam terhadap isu-isu strategis dan menerjemahkan data kompleks menjadi infografis yang mudah dipahami, menarik, dan berdampak untuk publikasi."
        }
        buttons={buttons}
        image={{
          src: cms.hero.heroImage || "/riset-person.png",
          alt: "Researcher & Designer Team",
          cardColor: "bg-purple-600",
          blobColor: "bg-yellow-400",
          rotation: "right",
        }}
        floatingIcons={risetIcons}
      />
      <DivisionContent accent="purple" {...cms} />
    </main>
  );
}
