"use client";

import React from "react";
import { motion } from "framer-motion";
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
import { DM_Serif_Display } from "next/font/google";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

const floatingIcons = [
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

export default function MediaBrandingPage() {
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold mb-6">
            Media & Creative Branding
          </span>

          <h1
            className={`${serifFont.className} text-5xl md:text-6xl text-gray-900 leading-tight mb-6`}
          >
            Crafting Identity, <br />
            <span className="text-rose-600">Shaping Narratives</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
            Sebagai wajah kreatif organisasi, kami mengelola identitas visual,
            produksi konten multimedia, dan strategi media sosial untuk
            memastikan pesan Pojok Statistik tersampaikan dengan estetik dan
            berdampak.
          </p>

          <div className="flex gap-4">
            <button className="px-8 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Lihat Portfolio
            </button>
            <button className="px-8 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-medium hover:border-rose-200 hover:bg-rose-50 transition">
              Instagram Kami
            </button>
          </div>
        </motion.div>

        {/* IMAGE */}
        <div className="relative flex justify-center items-center mt-10 lg:mt-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="absolute top-0 left-10 w-32 h-32 bg-gray-900 rounded-full z-10 opacity-80"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-100 h-110 bg-rose-600 rounded-[80px] rotate-6 overflow-hidden"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-end justify-center -rotate-6"
            >
              <img
                src="/media-person.png"
                alt="Creative Media Team"
                className="scale-120 object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: item.x,
                y: item.y,
                scale: 1,
                opacity: 1,
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 10,
                delay: 0.2 + item.delay,
                rotate: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                },
              }}
              className={`absolute z-20 flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg ${item.bg} border border-white/50 backdrop-blur-sm`}
            >
              <item.Icon className={`w-6 h-6 ${item.color}`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Section di bawahnya bakal mantep banget */}
    </main>
  );
}
