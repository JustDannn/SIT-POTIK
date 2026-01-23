"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const DropdownItem = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link href={href} className="block group">
      <div className="relative px-4 py-3 text-sm text-gray-600 transition-all duration-200 hover:bg-orange-50 hover:text-gray-900">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
        <span className="relative z-10 font-medium">{children}</span>
      </div>
    </Link>
  );
};
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sidebarVariants = {
    open: {
      width: "auto",
      opacity: 1,
      marginRight: "2rem",
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      },
    },
    closed: {
      width: 0,
      opacity: 0,
      marginRight: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-gray-100 flex items-center">
      <div className="max-w-7xl w-full mx-auto px-6 flex items-center overflow-visible">
        <motion.div
          initial="closed"
          animate={isScrolled ? "open" : "closed"}
          variants={sidebarVariants}
          className="flex items-center gap-4 overflow-hidden h-10 shrink-0"
        >
          <div className="flex gap-3 min-w-max h-full">
            <img
              src="/logo-telkom.png"
              alt="Telkom"
              className="h-full w-auto object-contain"
            />
            <img
              src="/logo-pojok.png"
              alt="Pojok Statistik"
              className="h-full w-auto object-contain"
            />
          </div>

          {/* Separator Line vertikal*/}
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
        </motion.div>

        {/*MENU SECTION*/}
        <motion.div
          layout
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="flex-1 flex items-center justify-between whitespace-nowrap"
        >
          {/* Menu Kiri */}
          <ul className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <li>
              <Link
                href="/meet"
                className="hover:text-blue-600 transition-colors"
              >
                Meet Pojok TUS
              </Link>
            </li>
            <li
              className="relative h-20 flex items-center" // h-20 biar area hovernya nyambung sampe navbar
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-blue-600 transition-colors focus:outline-none">
                What We Do
                <span
                  className={`text-[10px] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                >
                  <ChevronDown />
                </span>
              </button>

              {/* Isi Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      clipPath: "inset(0% 0% 100% 0%)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      clipPath: "inset(0% 0% 0% 0%)",
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      clipPath: "inset(0% 0% 100% 0%)",
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[80%] left-0 w-56 bg-white shadow-xl rounded-lg border border-gray-100 overflow-hidden py-2"
                  >
                    {/* List Menu */}
                    <DropdownItem href="/what-we-do/pr-sdm">
                      PR & SDM
                    </DropdownItem>
                    <DropdownItem href="/what-we-do/data">
                      Layanan Data
                    </DropdownItem>
                    <DropdownItem href="/what-we-do/riset">
                      Riset & Infografis
                    </DropdownItem>
                    <DropdownItem href="/what-we-do/edukasi">
                      Edukasi & Pelatihan
                    </DropdownItem>
                    <DropdownItem href="/what-we-do/media">
                      Media & Branding
                    </DropdownItem>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            <li>
              <Link
                href="/impact"
                className="hover:text-blue-600 transition-colors"
              >
                Impact
              </Link>
            </li>
            <li>
              <Link
                href="/publications"
                className="hover:text-blue-600 transition-colors"
              >
                Publications
              </Link>
            </li>
            <li>
              <Link
                href="/updates"
                className="hover:text-blue-600 transition-colors"
              >
                Updates
              </Link>
            </li>
          </ul>

          {/* Tombol Contact */}
          <Link
            href="/contact"
            className="bg-black text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 ml-4"
          >
            <span>
              <FaEnvelope />
            </span>{" "}
            Contact Us
          </Link>
        </motion.div>
      </div>
    </nav>
  );
}
