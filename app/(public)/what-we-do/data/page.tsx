"use client";

import React from "react";
import { motion } from "framer-motion";
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
import { DM_Serif_Display } from "next/font/google";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

const floatingIcons = [
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
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden">
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* TEXT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge Kecil */}
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-sm font-semibold mb-6">
            Layanan Data & Statistik
          </span>

          <h1
            className={`${serifFont.className} text-5xl md:text-6xl text-gray-900 leading-tight mb-6`}
          >
            Unlock Insights, <br />
            <span className="text-cyan-600">Drive Decisions</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
            Kami menyediakan akses data strategis, konsultasi metodologi, dan
            pengolahan statistik profesional untuk mendukung validitas riset
            akademik dan pengambilan keputusan berbasis data.
          </p>

          <button className="px-8 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Ajukan Permintaan Data
          </button>
        </motion.div>

        {/* IMAGE */}
        <div className="relative flex justify-center items-center mt-10 lg:mt-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="absolute top-10 right-10 w-32 h-32 bg-lime-400 rounded-full z-10"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-100 h-110 bg-cyan-600 rounded-[80px] -rotate-6 overflow-hidden"
          >
            {/* MAIN IMAGE */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-end justify-center rotate-6"
            >
              <img
                src="/data-person.png"
                alt="Data Analyst Team"
                className="scale-120 object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

          {/*EXPLODING ICONS*/}
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: item.x,
                y: item.y,
                scale: 1,
                opacity: 1,
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 10,
                delay: 0.2 + item.delay,
                rotate: {
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                },
              }}
              className={`absolute z-20 flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg ${item.bg} border border-white/60 backdrop-blur-sm`}
            >
              <item.Icon className={`w-6 h-6 ${item.color}`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content lain di bawah ... */}
    </main>
  );
}
