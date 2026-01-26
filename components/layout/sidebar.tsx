"use client";

import React, { useState, useMemo } from "react"; // Tambah useMemo
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROLE_MENUS, MenuItem } from "@/config/menu";
import { LogOut, Search, ChevronLeft, ChevronRight, Sun } from "lucide-react";
import Image from "next/image";

// Import DiceBear
import { createAvatar } from "@dicebear/core";
import { dylan } from "@dicebear/collection";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menus: MenuItem[] = ROLE_MENUS[user.role] || [];

  const avatarDataUri = useMemo(() => {
    const avatar = createAvatar(dylan, {
      seed: user.name, // Nama user jadi basis generate gambar unik
      size: 128,
      backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
      radius: 50,
    });
    return avatar.toDataUri();
  }, [user.name]);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-gray-200 bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-100 z-10"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* 1. User Profile Section */}
      <div
        className={cn(
          "flex items-center gap-3 p-6",
          isCollapsed && "justify-center px-2",
        )}
      >
        {/* Container Avatar */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
          <Image
            src={user.avatarUrl || avatarDataUri}
            alt={user.name}
            fill
            className="object-cover"
          />
        </div>

        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden transition-opacity duration-300">
            <span className="truncate text-sm font-bold text-gray-900">
              {user.name}
            </span>
            <span className="truncate text-xs text-gray-500">{user.email}</span>
          </div>
        )}
      </div>

      {/* 2. Search Bar */}
      <div className="px-4 mb-4">
        <div
          className={cn(
            "flex items-center rounded-lg bg-gray-100 p-2 transition-all",
            isCollapsed
              ? "justify-center bg-transparent hover:bg-gray-100 cursor-pointer"
              : "",
          )}
        >
          <Search size={20} className="text-gray-500" />
          {!isCollapsed && (
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          )}
        </div>
      </div>

      {/* 3. Dynamic Menu Items */}
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto scrollbar-hide">
        {menus.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                isCollapsed && "justify-center px-2",
              )}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 4. Footer (Logout & Theme) */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors",
            isCollapsed && "justify-center px-2",
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sun size={16} /> Light mode
            </div>
            <div className="relative h-5 w-9 rounded-full bg-orange-200 cursor-pointer">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-orange-500 shadow-sm"></div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
