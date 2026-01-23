"use client";

import React from "react";
import { motion } from "framer-motion";
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
import { DM_Serif_Display } from "next/font/google";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });
const floatingIcons = [
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

export default function PrSdmPage() {
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-6">
            Public Relations & SDM
          </span>

          <h1
            className={`${serifFont.className} text-5xl md:text-6xl text-gray-900 leading-tight mb-6`}
          >
            Building Bridges, <br />
            <span className="text-blue-600">Empowering People</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
            Divisi PR & SDM bertanggung jawab dalam membangun citra positif
            Pojok Statistik serta mengelola pengembangan talenta internal untuk
            menciptakan lingkungan kerja yang harmonis dan produktif.
          </p>

          <button className="px-8 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Lihat Program Kerja
          </button>
        </motion.div>

        {/* IMAGE*/}
        <div className="relative flex justify-center items-center mt-10 lg:mt-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="absolute top-10 right-10 w-32 h-32 bg-orange-400 rounded-full z-10"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-100 h-110 bg-blue-600 rounded-[80px] -rotate-6 overflow-hidden"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute inset-0 flex items-end justify-center rotate-6"
            >
              <img
                src="/pr-sdm-person.png"
                alt="PR & SDM Team"
                className="scale-120 object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

          {/* EXPLODING ICONS*/}
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

      {/* Content lain di bawah... */}
    </main>
  );
}
