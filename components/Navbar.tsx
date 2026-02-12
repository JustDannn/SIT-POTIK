"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";

const DropdownItem = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Link href={href} className="block group" onClick={onClick}>
      <div className="relative px-4 py-3 text-sm text-gray-600 transition-all duration-200 hover:bg-orange-50 hover:text-gray-900">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
        <span className="relative z-10 font-medium">{children}</span>
      </div>
    </Link>
  );
};

// Mobile menu link
const MobileNavLink = ({
  href,
  children,
  onClick,
  delay = 0,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  delay?: number;
}) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, delay }}
  >
    <Link
      href={href}
      onClick={onClick}
      className="block py-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors border-b border-gray-100"
    >
      {children}
    </Link>
  </motion.li>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileWhatWeDoOpen, setIsMobileWhatWeDoOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const closeMobile = () => {
    setIsMobileOpen(false);
    setIsMobileWhatWeDoOpen(false);
  };

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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-gray-100 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 flex items-center overflow-visible">
          {/* ── HAMBURGER BUTTON (Mobile Only) ── */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 -ml-2 mr-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* ── MOBILE LOGOS (Always visible on mobile) ── */}
          <Link
            href="/"
            className="flex lg:hidden items-center gap-3 h-10 shrink-0"
          >
            <Image
              src="/logo-telkom.png"
              alt="Telkom"
              height={40}
              width={40}
              className="h-full w-auto object-contain"
            />
            <Image
              src="/logo-pojok.png"
              alt="Pojok Statistik"
              height={40}
              width={40}
              className="h-full w-auto object-contain"
            />
          </Link>

          {/* ── DESKTOP SCROLL LOGOS (Hidden on mobile) ── */}
          <motion.div
            initial="closed"
            animate={isScrolled ? "open" : "closed"}
            variants={sidebarVariants}
            className="hidden lg:flex items-center gap-4 overflow-hidden h-10 shrink-0"
          >
            <Link href="/" className="flex gap-3 min-w-max h-full">
              <Image
                src="/logo-telkom.png"
                alt="Telkom"
                height={40}
                width={40}
                className="h-full w-auto object-contain"
              />
              <Image
                src="/logo-pojok.png"
                alt="Pojok Statistik"
                height={40}
                width={40}
                className="h-full w-auto object-contain"
              />
            </Link>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
          </motion.div>

          {/* ── DESKTOP MENU (Hidden on mobile) ── */}
          <motion.div
            layout
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 hidden lg:flex items-center justify-between whitespace-nowrap"
          >
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
                className="relative h-20 flex items-center"
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

          {/* ── MOBILE CONTACT BUTTON (far right) ── */}
          <Link
            href="/contact"
            className="lg:hidden ml-auto bg-black text-white p-2.5 rounded-xl hover:bg-gray-800 transition-colors"
            aria-label="Contact Us"
          >
            <FaEnvelope size={16} />
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          MOBILE DRAWER
         ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl lg:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3 h-10">
                  <Image
                    src="/logo-telkom.png"
                    alt="Telkom"
                    height={40}
                    width={40}
                    className="h-full w-auto object-contain"
                  />
                  <Image
                    src="/logo-pojok.png"
                    alt="Pojok Statistik"
                    height={40}
                    width={40}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <button
                  onClick={closeMobile}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <ul className="space-y-1">
                  <MobileNavLink
                    href="/meet"
                    onClick={closeMobile}
                    delay={0.05}
                  >
                    Meet Pojok TUS
                  </MobileNavLink>

                  {/* What We Do Accordion */}
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <button
                      onClick={() =>
                        setIsMobileWhatWeDoOpen(!isMobileWhatWeDoOpen)
                      }
                      className="flex items-center justify-between w-full py-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors border-b border-gray-100"
                    >
                      What We Do
                      <motion.span
                        animate={{
                          rotate: isMobileWhatWeDoOpen ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {isMobileWhatWeDoOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 py-2 space-y-1">
                            {[
                              {
                                href: "/what-we-do/pr-sdm",
                                label: "PR & SDM",
                              },
                              {
                                href: "/what-we-do/data",
                                label: "Layanan Data",
                              },
                              {
                                href: "/what-we-do/riset",
                                label: "Riset & Infografis",
                              },
                              {
                                href: "/what-we-do/edukasi",
                                label: "Edukasi & Pelatihan",
                              },
                              {
                                href: "/what-we-do/media",
                                label: "Media & Branding",
                              },
                            ].map((item, i) => (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: i * 0.05,
                                }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={closeMobile}
                                  className="block py-2.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors pl-3 border-l-2 border-gray-200 hover:border-orange-400"
                                >
                                  {item.label}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>

                  <MobileNavLink
                    href="/impact"
                    onClick={closeMobile}
                    delay={0.15}
                  >
                    Impact
                  </MobileNavLink>
                  <MobileNavLink
                    href="/publications"
                    onClick={closeMobile}
                    delay={0.2}
                  >
                    Publications
                  </MobileNavLink>
                  <MobileNavLink
                    href="/updates"
                    onClick={closeMobile}
                    delay={0.25}
                  >
                    Updates
                  </MobileNavLink>
                </ul>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-6 border-t border-gray-100 shrink-0">
                <Link
                  href="/contact"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full bg-black text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  <FaEnvelope size={14} />
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
