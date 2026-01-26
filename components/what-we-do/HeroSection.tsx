"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { DM_Serif_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const serifFont = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

export type FloatingIconItem = {
  Icon: LucideIcon;
  color: string; // class text-color
  bg: string; // class bg-color
  x: number;
  y: number;
  delay: number;
};

interface HeroSectionProps {
  badge: {
    text: string;
    className: string; // gabungan bg dan text color
  };
  title: {
    firstLine: string;
    highlightText: string;
    highlightClassName: string; // warna highlight
  };
  description: string;
  buttons: {
    text: string;
    variant: "primary" | "secondary";
    onClick?: () => void;
  }[];
  image: {
    src: string;
    alt: string;
    cardColor: string;
    blobColor: string;
    rotation?: "left" | "right";
  };
  floatingIcons: FloatingIconItem[];
}

export default function HeroSection({
  badge,
  title,
  description,
  buttons,
  image,
  floatingIcons,
}: HeroSectionProps) {
  const rotationClass = image.rotation === "right" ? "rotate-6" : "-rotate-6";
  const imageRotationClass =
    image.rotation === "right" ? "-rotate-6" : "rotate-6";

  return (
    <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
      {/* --- TEXT CONTENT --- */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Badge */}
        <span
          className={cn(
            "inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6",
            badge.className,
          )}
        >
          {badge.text}
        </span>

        {/* Title */}
        <h1
          className={`${serifFont.className} text-5xl md:text-6xl text-gray-900 leading-tight mb-6`}
        >
          {title.firstLine} <br />
          <span className={title.highlightClassName}>
            {title.highlightText}
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
          {description}
        </p>

        {/* Buttons (Dynamic Map) */}
        <div className="flex flex-wrap gap-4">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className={cn(
                "px-8 py-3 rounded-full font-medium transition shadow-lg hover:shadow-xl transform hover:-translate-y-1",
                btn.variant === "primary"
                  ? "bg-black text-white hover:bg-gray-800"
                  : "border-2 border-gray-200 text-gray-700 hover:border-rose-200 hover:bg-rose-50",
              )}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </motion.div>

      {/* --- IMAGE & ANIMATION --- */}
      <div className="relative flex justify-center items-center mt-10 lg:mt-0">
        {/* Small Blob */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className={cn(
            "absolute top-10 right-10 w-32 h-32 rounded-full z-10",
            image.blobColor,
          )}
        />

        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className={cn(
            "relative w-100 h-110 rounded-[80px] overflow-hidden",
            rotationClass,
            image.cardColor,
          )}
        >
          {/* Person Image */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={cn(
              "absolute inset-0 flex items-end justify-center",
              imageRotationClass,
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="scale-120 object-contain drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>

        {/* Floating Icons Loop */}
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
            className={cn(
              "absolute z-20 flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg border border-white/60 backdrop-blur-sm",
              item.bg,
            )}
          >
            <item.Icon className={cn("w-6 h-6", item.color)} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
