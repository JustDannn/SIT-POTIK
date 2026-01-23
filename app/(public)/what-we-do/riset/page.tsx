"use client";

import React from "react";
import { motion } from "framer-motion";
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
import { DM_Serif_Display } from "next/font/google";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });
const floatingIcons = [
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

export default function RisetInfografisPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden">
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* TEXT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6">
            Riset & Infografis
          </span>

          <h1
            className={`${serifFont.className} text-5xl md:text-6xl text-gray-900 leading-tight mb-6`}
          >
            Transforming Complexity, <br />
            <span className="text-purple-600">Visualizing Impact</span>
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
            Kami melakukan kajian mendalam terhadap isu-isu strategis dan
            menerjemahkan data kompleks menjadi infografis yang mudah dipahami,
            menarik, dan berdampak untuk publikasi.
          </p>

          <button className="px-8 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Lihat Hasil Riset
          </button>
        </motion.div>

        {/* IMAGE*/}
        <div className="relative flex justify-center items-center mt-10 lg:mt-0">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="absolute top-0 right-20 w-32 h-32 bg-yellow-400 rounded-full z-10"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-100 h-100 bg-purple-600 rounded-[80px] rotate-12 overflow-hidden"
          >
            {/*MAIN IMAGE*/}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-end justify-center -rotate-12"
            >
              <img
                src="/riset-person.png"
                alt="Researcher & Designer Team"
                className="scale-200 object-contain drop-shadow-2xl"
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
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 10,
                delay: 0.2 + item.delay,
                rotate: {
                  repeat: Infinity,
                  duration: 3.5,
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
