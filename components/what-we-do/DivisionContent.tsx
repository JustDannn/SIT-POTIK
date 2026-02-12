"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { DM_Serif_Display } from "next/font/google";
import { ArrowRight, Quote, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

// ─── Types ───────────────────────────────────────────
export interface FeatureSpotlight {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

export interface ProgramCard {
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkText?: string;
}

export interface DivisionContentProps {
  /** Accent color class prefix e.g. "cyan", "purple", "emerald", "rose", "orange" */
  accent: string;

  /** Mission section */
  mission: {
    heading: string;
    body: string;
    bodySecondary?: string;
  };

  /** Quote section */
  quote?: {
    text: string;
    author: string;
    role?: string;
  };

  /** Feature spotlight blocks (Mozilla-style: bold heading + image + description) */
  features: FeatureSpotlight[];

  /** Programs/initiatives grid */
  programs: ProgramCard[];

  /** Bottom CTA */
  cta: {
    heading: string;
    description: string;
    primaryText: string;
    primaryLink: string;
    secondaryText?: string;
    secondaryLink?: string;
  };
}

// ─── Accent color helper ─────────────────────────────
function accentClasses(accent: string) {
  const map: Record<
    string,
    { gradient: string; bg: string; bgLight: string; text: string; border: string; ring: string }
  > = {
    cyan: {
      gradient: "from-cyan-500 to-teal-500",
      bg: "bg-cyan-600",
      bgLight: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-200",
      ring: "ring-cyan-500/20",
    },
    purple: {
      gradient: "from-purple-500 to-fuchsia-500",
      bg: "bg-purple-600",
      bgLight: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
      ring: "ring-purple-500/20",
    },
    emerald: {
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-600",
      bgLight: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      ring: "ring-emerald-500/20",
    },
    rose: {
      gradient: "from-rose-500 to-pink-500",
      bg: "bg-rose-600",
      bgLight: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
      ring: "ring-rose-500/20",
    },
    orange: {
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-600",
      bgLight: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200",
      ring: "ring-orange-500/20",
    },
    blue: {
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-600",
      bgLight: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
      ring: "ring-blue-500/20",
    },
  };
  return map[accent] ?? map.cyan;
}

// ─── Fade-up wrapper ─────────────────────────────────
function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────
export default function DivisionContent({
  accent,
  mission,
  quote,
  features,
  programs,
  cta,
}: DivisionContentProps) {
  const colors = accentClasses(accent);

  return (
    <div className="relative">
      {/* ── MISSION + QUOTE (Mozilla-style split) ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Mission */}
          <FadeUp>
            <div className="relative">
              <div
                className={cn(
                  "absolute -left-5 top-1 w-1.5 h-14 rounded-full",
                  colors.bg,
                )}
              />
              <h2
                className={cn(
                  serifFont.className,
                  "text-3xl md:text-[2.6rem] leading-tight text-gray-900 mb-8",
                )}
              >
                {mission.heading}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {mission.body}
              </p>
              {mission.bodySecondary && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {mission.bodySecondary}
                </p>
              )}
            </div>
          </FadeUp>

          {/* Right: Quote */}
          {quote && (
            <FadeUp delay={0.15}>
              <div className="relative">
                <Quote
                  className={cn("w-10 h-10 mb-4 opacity-30", colors.text)}
                />
                <blockquote
                  className={cn(
                    serifFont.className,
                    "text-2xl md:text-3xl leading-snug text-gray-800 italic mb-6",
                  )}
                >
                  &ldquo;{quote.text}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className={cn("w-10 h-0.5 rounded-full", colors.bg)}
                  />
                  <div>
                    <p className="font-bold text-gray-900">{quote.author}</p>
                    {quote.role && (
                      <p className="text-sm text-gray-500">{quote.role}</p>
                    )}
                  </div>
                </div>
              </div>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ── FEATURE SPOTLIGHTS ── */}
      {features.length > 0 && (
        <section className="relative py-20 overflow-hidden">
          {/* Subtle background */}
          <div className="absolute inset-0 bg-linear-to-b from-gray-50/80 to-white pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-28">
            {features.map((feature, idx) => {
              const isReversed = idx % 2 === 1;

              return (
                <div
                  key={idx}
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center",
                    isReversed && "lg:direction-rtl",
                  )}
                >
                  {/* Text */}
                  <FadeUp
                    delay={0.1}
                    className={cn(isReversed && "lg:order-2 lg:direction-ltr")}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute -left-5 top-1 w-1.5 h-10 rounded-full",
                          colors.bg,
                        )}
                      />
                      <h3
                        className={cn(
                          serifFont.className,
                          "text-2xl md:text-[2.2rem] leading-tight text-gray-900 mb-5",
                        )}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                        {feature.description}
                      </p>
                    </div>
                  </FadeUp>

                  {/* Image */}
                  <FadeUp
                    delay={0.25}
                    className={cn(isReversed && "lg:order-1 lg:direction-ltr")}
                  >
                    {feature.image ? (
                      <motion.div
                        whileHover={{ scale: 1.02, rotate: isReversed ? -1 : 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5"
                      >
                        <Image
                          src={feature.image}
                          alt={feature.imageAlt || feature.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {/* Color overlay on hover */}
                        <div
                          className={cn(
                            "absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-500 bg-linear-to-br",
                            colors.gradient,
                          )}
                        />
                      </motion.div>
                    ) : (
                      <div
                        className={cn(
                          "aspect-4/3 rounded-3xl flex items-center justify-center",
                          colors.bgLight,
                          "border-2 border-dashed",
                          colors.border,
                        )}
                      >
                        <p className={cn("text-sm font-medium", colors.text)}>
                          Image Placeholder
                        </p>
                      </div>
                    )}
                  </FadeUp>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PROGRAMS / INITIATIVES GRID ── */}
      {programs.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <FadeUp>
            <div className="text-center mb-14">
              <h2
                className={cn(
                  serifFont.className,
                  "text-3xl md:text-4xl text-gray-900 mb-3",
                )}
              >
                Our{" "}
                <span
                  className={cn(
                    "text-transparent bg-clip-text bg-linear-to-r",
                    colors.gradient,
                  )}
                >
                  Programs
                </span>
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Initiatives we run to deliver on our mission.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, idx) => (
              <FadeUp key={idx} delay={idx * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group h-full"
                >
                  <div
                    className={cn(
                      "h-full bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500",
                      "ring-1",
                      colors.ring,
                    )}
                  >
                    {/* Card Image */}
                    {program.image ? (
                      <div className="relative aspect-16/10 overflow-hidden">
                        <Image
                          src={program.image}
                          alt={program.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "aspect-16/10",
                          colors.bgLight,
                          "flex items-center justify-center",
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            colors.bg,
                          )}
                        >
                          <Sparkle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Card Body */}
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-gray-700 transition-colors">
                        {program.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        {program.description}
                      </p>

                      {program.link && (
                        <Link
                          href={program.link}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
                            colors.text,
                          )}
                        >
                          {program.linkText || "Learn more"}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <FadeUp>
          <motion.div
            whileInView={{ scale: [0.97, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-12 md:p-16 text-center"
          >
            {/* Decorative blobs */}
            <div
              className={cn(
                "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-linear-to-br",
                colors.gradient,
              )}
            />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 blur-[60px]" />

            <div className="relative z-10">
              <h2
                className={cn(
                  serifFont.className,
                  "text-3xl md:text-5xl text-white mb-4",
                )}
              >
                {cta.heading}
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
                {cta.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href={cta.primaryLink}
                  className="group inline-flex items-center gap-2 px-7 py-4 bg-white text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all hover:shadow-xl"
                >
                  {cta.primaryText}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                {cta.secondaryText && cta.secondaryLink && (
                  <Link
                    href={cta.secondaryLink}
                    className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all"
                  >
                    {cta.secondaryText}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </FadeUp>
      </section>
    </div>
  );
}

// Small sparkle icon for placeholder cards
function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}
