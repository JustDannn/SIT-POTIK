"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DM_Serif_Display } from "next/font/google";
import TeamSection from "./TeamSection";
import type { TeamSectionProps } from "./TeamSection";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

const SquigglyLine = () => {
  return (
    <div className="w-full flex justify-center my-10 relative z-20">
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
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
    </div>
  );
};

interface MeetPageClientProps {
  team: TeamSectionProps;
  cms: {
    hero: Record<string, string>;
    mission: Record<string, string>;
  };
}

export default function MeetPageClient({ team, cms }: MeetPageClientProps) {
  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden">
      <section className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="absolute top-0 right-[-10%] w-100 h-125 hidden lg:block z-10 pointer-events-none">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9, rotate: 0 }}
            transition={{
              duration: 1.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute top-24 right-0 w-50 h-50 bg-blue-600 rounded-full opacity-90"
          />
          <motion.div
            initial={{ scale: 0, x: -80, y: 50, opacity: 0 }}
            animate={{ scale: 1, x: 0, y: 0, opacity: 0.9 }}
            transition={{
              duration: 1.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
            className="absolute top-25 right-30 w-32 h-32 bg-orange-400 rounded-full"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h1
            className={`${serifFont.className} text-5xl md:text-6xl text-gray-900 leading-tight mb-6`}
          >
            {cms.hero.title_line1 || "This is who we"} <br />{" "}
            {cms.hero.title_line2 || "are"}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-md">
            {cms.hero.description ||
              "Meet the technologists, activists, and designers working at Pojok Statistik Telkom University Surabaya."}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative h-100 w-full overflow-hidden rounded-tl-4xl rounded-br-4xl rounded-tr-[8rem] rounded-bl-4xl shadow-xl">
            <Image
              src={cms.hero.hero_image || "/team-meet.jpg"}
              alt="Team Meeting"
              width={600}
              height={400}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
            />
          </div>
        </motion.div>
      </section>

      <SquigglyLine />

      {/*MISSION*/}
      <section className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-10">
        <div className="absolute -bottom-12.5 -left-25 w-100 h-125 hidden lg:block z-10 pointer-events-none">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
            whileInView={{ scale: 1, opacity: 0.9, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-10 left-10 w-50 h-50 bg-blue-600 rounded-full opacity-90"
          />
          <motion.div
            initial={{ scale: 0, x: -30, y: 50, opacity: 0 }}
            whileInView={{ scale: 1, x: 0, y: -5, opacity: 0.9 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="absolute bottom-32 left-32 w-33 h-33 bg-orange-400 rounded-full"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative h-100 w-full overflow-hidden rounded-tr-4xl rounded-bl-[8rem] rounded-tl-4xl rounded-br-4xl shadow-xl">
            <Image
              src={cms.mission.image || "/mission-activity.jpg"}
              alt="Our Mission"
              width={600}
              height={400}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="order-1 lg:order-2"
        >
          <h2
            className={`${serifFont.className} text-5xl md:text-6xl text-gray-900 mb-6`}
          >
            {cms.mission.title || "Mission"}
          </h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              {cms.mission.body ||
                "Pojok Statistik is a non-profit unit building a better data literacy future..."}
            </p>
            <p>
              {cms.mission.body_secondary ||
                "We deliver people-first alternatives..."}
            </p>
          </div>
        </motion.div>
      </section>

      <div className="mt-20">
        <SquigglyLine />
      </div>

      {/* ─── Team Grid ─── */}
      <TeamSection dosen={team.dosen} agent={team.agent} />
    </main>
  );
}
