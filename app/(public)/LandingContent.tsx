"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { DM_Serif_Display } from "next/font/google";
import {
  ArrowRight,
  Calendar,
  FileText,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  BarChart3,
  Users,
  Zap,
  ChevronRight,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

interface Publication {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  category: string;
  publishedAt: string | null;
  author: { name: string; image: string | null } | null;
  division: { divisionName: string } | null;
}

interface EventItem {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  division: { divisionName: string } | null;
}

interface LandingContentProps {
  publications: Publication[];
  events: EventItem[];
}

// HELPERS
const CATEGORY_CONFIG: Record<
  string,
  { color: string; bg: string; icon: React.ElementType }
> = {
  Artikel: {
    color: "text-orange-600",
    bg: "bg-orange-100",
    icon: FileText,
  },
  Infografis: {
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: ImageIcon,
  },
  Impact: {
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    icon: Zap,
  },
  "Press Release": {
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: FileText,
  },
  Dokumentasi: {
    color: "text-pink-600",
    bg: "bg-pink-100",
    icon: ImageIcon,
  },
};

function getCategoryStyle(category: string) {
  return (
    CATEGORY_CONFIG[category] ?? {
      color: "text-gray-600",
      bg: "bg-gray-100",
      icon: FileText,
    }
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// LINE
function SquigglyDivider() {
  return (
    <div className="w-full flex justify-center my-16 relative z-20">
      <motion.svg
        width="100%"
        height="2"
        viewBox="0 0 1200 2"
        preserveAspectRatio="none"
        className="text-gray-300 w-full max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.path
          d="M0,1 L1200,1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1 },
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

// ─── FLOATING BLOB ──────────────────────────────────
function FloatingBlob({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
      className={cn("absolute rounded-full pointer-events-none", className)}
    />
  );
}

// ═══════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function LandingContent({
  publications,
  events,
}: LandingContentProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════════
          HERO 1 — Big Statement
         ═══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-24 pb-20"
      >
        {/* Background Blobs */}
        <FloatingBlob
          className="w-72 h-72 bg-blue-600/80 top-20 -right-20 lg:right-10 hidden lg:block"
          delay={0.2}
        />
        <FloatingBlob
          className="w-44 h-44 bg-orange-400/90 top-48 right-32 lg:right-52 hidden lg:block"
          delay={0.5}
        />
        <FloatingBlob
          className="w-20 h-20 bg-blue-400/60 bottom-32 left-10 hidden lg:block"
          delay={0.8}
        />
        <FloatingBlob
          className="w-14 h-14 bg-orange-300/70 top-36 left-20 hidden lg:block"
          delay={1}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6"
            >
              <Sparkles size={14} />
              Pojok Statistik Telkom University Surabaya
            </motion.div>

            <h1
              className={`${serifFont.className} text-5xl md:text-7xl text-gray-900 leading-[1.1] mb-6`}
            >
              Where Data
              <br />
              Meets{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-500 to-orange-500">
                Impact.
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-lg text-gray-600 leading-relaxed max-w-md mb-8"
            >
              We build data literacy, craft research, and create impactful
              stories — all from a small corner of campus with big ambitions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/what-we-do/riset"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-gray-900/20"
              >
                Explore Our Work
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/meet"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all hover:shadow-lg"
              >
                Meet the Team
              </Link>
            </motion.div>

            {/* Mini Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex gap-8 mt-12 pt-8 border-t border-gray-200/60"
            >
              {[
                { icon: BarChart3, label: "Research Published", value: "50+" },
                { icon: Users, label: "Active Members", value: "30+" },
                { icon: Zap, label: "Events Held", value: "20+" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-100">
                    <stat.icon size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.3,
            }}
            className="relative hidden lg:block"
          >
            <div className="relative h-125 w-full">
              {/* Frame accent */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-tl-[4rem] rounded-br-[4rem] rounded-tr-3xl rounded-bl-3xl border-2 border-blue-200/50" />
              <div className="relative h-full w-full overflow-hidden rounded-tl-[4rem] rounded-br-[4rem] rounded-tr-3xl rounded-bl-3xl shadow-2xl shadow-gray-300/40">
                <Image
                  src="/team-meet.jpg"
                  alt="Pojok Statistik Team"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <SquigglyDivider />

      {/* ═══════════════════════════════════════════════
          HERO 2 — What We Do (Quick Pillars)
         ═══════════════════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold mb-4">
            <Sparkles size={14} />
            What We Do
          </span>
          <h2
            className={`${serifFont.className} text-4xl md:text-5xl text-gray-900 mb-4`}
          >
            Five Pillars, One Mission
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
            Each division plays a vital role in empowering data literacy across
            campus and beyond.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              title: "PR & SDM",
              desc: "Public relations, human resources, and building strong team culture.",
              icon: Handshake,
              gradient: "from-rose-500 to-red-500",
              href: "/what-we-do/pr-sdm",
              delay: 0,
            },
            {
              title: "Riset & Infografis",
              desc: "Research papers, data analysis, and visual storytelling through infographics.",
              icon: BarChart3,
              gradient: "from-orange-400 to-amber-500",
              href: "/what-we-do/riset",
              delay: 0.05,
            },
            {
              title: "Edukasi & Pelatihan",
              desc: "Workshops, bootcamps, and hands-on programs to level up data skills.",
              icon: Users,
              gradient: "from-indigo-500 to-blue-600",
              href: "/what-we-do/edukasi",
              delay: 0.1,
            },
            {
              title: "Media & Branding",
              desc: "Creative campaigns, visual identity, and managing our digital presence.",
              icon: ImageIcon,
              gradient: "from-violet-500 to-pink-500",
              href: "/what-we-do/media",
              delay: 0.15,
            },
            {
              title: "Layanan Data",
              desc: "Data consultation, software installation, and supporting academic needs.",
              icon: Zap,
              gradient: "from-cyan-500 to-teal-500",
              href: "/what-we-do/data",
              delay: 0.2,
            },
          ].map((pillar) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: pillar.delay }}
            >
              <Link href={pillar.href} className="group block h-full">
                <div className="relative h-full bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  {/* Accent blob */}
                  <div
                    className={cn(
                      "absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10 bg-linear-to-br",
                      pillar.gradient,
                    )}
                  />

                  <div
                    className={cn(
                      "inline-flex p-3 rounded-2xl bg-linear-to-br text-white mb-4",
                      pillar.gradient,
                    )}
                  >
                    <pillar.icon size={22} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {pillar.desc}
                  </p>

                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
                    Learn more{" "}
                    <ChevronRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <SquigglyDivider />

      {/* ═══════════════════════════════════════════════
          PUBLICATIONS FEED — All Categories
         ═══════════════════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Background accent */}
        <FloatingBlob
          className="w-80 h-80 bg-orange-200/30 blur-[100px] -top-20 -left-40 hidden lg:block"
          delay={0}
        />
        <FloatingBlob
          className="w-60 h-60 bg-blue-200/30 blur-[80px] bottom-0 -right-20 hidden lg:block"
          delay={0.3}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6"
        >
          <div className="relative">
            <div className="absolute -left-5 top-1 w-1 h-10 bg-orange-500 rounded-full" />
            <h2
              className={`${serifFont.className} text-4xl md:text-5xl text-gray-900 mb-3`}
            >
              Latest{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-blue-600">
                Publications
              </span>
            </h2>
            <p className="text-gray-600 max-w-lg leading-relaxed">
              Articles, infographics, impact stories &mdash; everything we
              publish, all in one place.
            </p>
          </div>

          <Link
            href="/publications"
            className="group inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all hover:shadow-lg shrink-0"
          >
            View All
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>

        {/* Publication Grid */}
        {publications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {publications.map((item, idx) => {
              const catStyle = getCategoryStyle(item.category);
              const CatIcon = catStyle.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="group"
                >
                  <Link
                    href={
                      item.category === "Impact"
                        ? `/impact/${item.slug}`
                        : `/publications/${item.slug}`
                    }
                    className="block h-full"
                  >
                    <div className="h-full bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                      {/* Thumbnail */}
                      <div className="h-52 relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                        {item.thumbnailUrl || item.fileUrl ? (
                          <Image
                            src={item.thumbnailUrl || item.fileUrl || ""}
                            alt={item.title}
                            fill
                            className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                            <CatIcon size={48} className="text-gray-300" />
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <span
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest backdrop-blur-md bg-white/80 border border-white/60 shadow-sm",
                              catStyle.color,
                            )}
                          >
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h3>

                        {item.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                            {item.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            <span>{formatDate(item.publishedAt)}</span>
                          </div>
                          {item.author && (
                            <span className="text-xs text-gray-500 font-medium truncate max-w-30">
                              {item.author.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No publications yet</p>
            <p className="text-sm">Check back soon for new content.</p>
          </div>
        )}
      </section>

      <SquigglyDivider />

      {/* ═══════════════════════════════════════════════
          EVENTS — Recent / Upcoming Programs
         ═══════════════════════════════════════════════ */}
      {events.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-6 py-10 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6"
          >
            <div className="relative">
              <div className="absolute -left-5 top-1 w-1 h-10 bg-indigo-500 rounded-full" />
              <h2
                className={`${serifFont.className} text-4xl md:text-5xl text-gray-900 mb-3`}
              >
                Recent{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-pink-500">
                  Events
                </span>
              </h2>
              <p className="text-gray-600 max-w-lg leading-relaxed">
                Programs, workshops, and community events that shape our impact.
              </p>
            </div>

            <Link
              href="/impact"
              className="group inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all hover:shadow-lg shrink-0"
            >
              View Stories
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {events.map((event, idx) => {
              const statusColor =
                event.status === "ongoing"
                  ? "bg-green-100 text-green-700"
                  : event.status === "completed"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-blue-100 text-blue-700";

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="h-full bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50">
                          <Calendar size={18} className="text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors">
                            {event.title}
                          </h3>
                          {event.division && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {event.division.divisionName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0",
                          statusColor,
                        )}
                      >
                        {event.status}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                      {event.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(event.startDate)}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          CTA — Join Us
         ═══════════════════════════════════════════════ */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-12 md:p-16 text-center"
        >
          {/* Decorative blobs inside CTA */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/20 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-orange-500/20 blur-[60px]" />

          <div className="relative z-10">
            <h2
              className={`${serifFont.className} text-4xl md:text-5xl text-white mb-4`}
            >
              Ready to make an{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300">
                impact
              </span>
              ?
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
              Join Pojok Statistik and be part of a community that turns data
              into action.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/meet"
                className="group inline-flex items-center gap-2 px-7 py-4 bg-white text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all hover:shadow-xl"
              >
                Meet the Team
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/publications"
                className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all"
              >
                Browse Publications
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
