"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DM_Serif_Display } from "next/font/google";
import { ArrowRight } from "lucide-react";
import type { TeamMember } from "./actions";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

// ─── Single Member Card ──────────────────────────────

function MemberCard({
  member,
  accent,
  index,
}: {
  member: TeamMember;
  accent: "blue" | "orange";
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="group"
    >
      {/* Photo */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-3 bg-white/10">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/40 text-5xl font-bold">
            {member.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name */}
      <h3
        className={`${serifFont.className} text-lg text-white leading-tight mb-0.5`}
      >
        {member.name}
      </h3>

      {/* Role */}
      <p className="text-sm text-white/70 mb-1">
        {member.divisionName
          ? `${member.roleName} — ${member.divisionName}`
          : member.roleName}
      </p>

      {/* Link */}
      <button
        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
          accent === "blue"
            ? "text-orange-300 hover:text-orange-200"
            : "text-blue-200 hover:text-blue-100"
        }`}
      >
        <span className="underline underline-offset-2">
          Meet {member.name.split(" ")[0]}
        </span>
        <ArrowRight size={14} className="mt-0.5" />
      </button>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────

export interface TeamSectionProps {
  dosen: TeamMember[];
  agent: TeamMember[];
}

export default function TeamSection({ dosen, agent }: TeamSectionProps) {
  const [activeTab, setActiveTab] = useState<"dosen" | "agent">("agent");

  const members = activeTab === "dosen" ? dosen : agent;
  const accent = activeTab === "dosen" ? "blue" : "orange";

  return (
    <section className="max-w-7xl mx-auto px-6">
      <div
        className={`rounded-2xl overflow-hidden transition-colors duration-400 ${
          activeTab === "dosen" ? "bg-blue-600/90" : "bg-orange-400/90"
        }`}
      >
        {/* Tab strip */}
        <div className="flex">
          <button
            onClick={() => setActiveTab("dosen")}
            className={`px-6 py-2.5 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "dosen"
                ? "bg-blue-700 text-white"
                : "bg-blue-600/50 text-white/60 hover:bg-blue-600/70"
            }`}
          >
            Dosen
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`px-6 py-2.5 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "agent"
                ? "bg-orange-500 text-white"
                : "bg-orange-400/50 text-white/60 hover:bg-orange-400/70"
            }`}
          >
            Agent
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 min-h-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {members.length > 0 ? (
                members.map((member, idx) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    accent={accent}
                    index={idx}
                  />
                ))
              ) : (
                <p className="text-white/50 col-span-full text-center py-12">
                  Belum ada anggota di kategori ini.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
