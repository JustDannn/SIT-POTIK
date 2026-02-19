import React from "react";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

type AttentionItem = {
  id: string | number;
  title: string;
  subtitle: string;
  link: string;
  type: "proker" | "laporan" | "lpj";
};

export default function AttentionWidget({ items }: { items: AttentionItem[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1.5 rounded-lg">
            <Bell size={16} className="text-gray-600" />
          </div>
          <h3 className="font-bold text-gray-800">Attention Needed</h3>
        </div>
        <Link
          href="/dashboard/approval"
          className="text-xs font-semibold text-orange-500 hover:text-orange-600"
        >
          See All
        </Link>
      </div>

      {/* List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between py-1"
          >
            <div className="flex items-start gap-3">
              {/* Icon Bulat Kecil */}
              <div className="mt-1 h-2 w-2 rounded-full bg-orange-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
            <Link
              href={item.link}
              className="text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1"
            >
              Review
            </Link>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">
            Aman terkendali, Bos! 👍
          </p>
        )}
      </div>
    </div>
  );
}
