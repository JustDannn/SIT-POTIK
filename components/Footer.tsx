"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full pt-20 pb-10 mt-20 border-t border-gray-100/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Logo & Brand */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            {/* Logos */}
            <div className="flex gap-4">
              {/* Ganti src sesuai file lo */}
              <img
                src="/logo-telkom.png"
                alt="Telkom University"
                className="h-12 object-contain"
              />
              <img
                src="/logo-pojok.png"
                alt="Pojok Statistik"
                className="h-12 object-contain"
              />
            </div>
          </div>

          {/* Menu & Contact */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-12 lg:gap-20 justify-end">
            {/* Group Navigasi & Kontak */}
            <div className="flex flex-col gap-10">
              {/* Menu Headings */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/about"
                  className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition"
                >
                  About us
                </Link>
                <Link
                  href="/contact"
                  className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition"
                >
                  Contacts
                </Link>
              </div>
              {/* Detail Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-black"></span>
                  <span className="h-2 w-2 rounded-full border border-gray-400"></span>
                  <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase ml-2">
                    Contact Us
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium text-gray-900">
                    +62 812-3456-7890
                  </p>
                  <p className="text-gray-600">
                    pojokstatistik@telkomuniversity.ac.id
                  </p>
                </div>
                <Link
                  href="/call"
                  className="inline-block text-orange-500 font-medium hover:text-orange-600 transition"
                >
                  Get a call &rarr;
                </Link>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center">
              <Link
                href="/brief"
                className="group relative flex items-center justify-center w-48 h-32 border border-orange-400 rounded-[50%] -rotate-12 hover:rotate-0 hover:bg-orange-50 hover:scale-105 transition-all duration-500 ease-out"
              >
                <span className="text-center font-medium text-gray-900 group-hover:scale-110 transition-transform">
                  Fill out <br /> the brief
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* SOCIALS & COPYRIGHT */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center pt-8 border-t border-gray-200">
          {/* Social Icons */}
          <div className="flex gap-6 mb-4 md:mb-0">
            <a href="#" className="text-gray-400 hover:text-red-600 transition">
              <Youtube size={24} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-pink-600 transition"
            >
              <Instagram size={24} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-blue-600 transition"
            >
              <Facebook size={24} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Pojok Statistik TUS — All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
