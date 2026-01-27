"use client";

import React from "react";
import {
  Calendar,
  Instagram,
  Video,
  Image as ImageIcon,
  MoreHorizontal,
  Clock,
  CheckCircle,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper Icon Channel
const getChannelIcon = (channel: string) => {
  if (channel.includes("ig"))
    return <Instagram size={16} className="text-pink-600" />;
  if (channel.includes("tiktok"))
    return <Video size={16} className="text-black" />;
  return <ImageIcon size={16} className="text-gray-600" />;
};

// Helper Status Badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700 border-green-200";
    case "ready":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "process":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export default function KetuaContentView({ data }: { data: any[] }) {
  // Pisahin Upcoming vs Published biar rapi
  const now = new Date();
  const upcoming = data.filter(
    (d) => new Date(d.date) > now || d.status !== "published",
  );
  const published = data.filter((d) => d.status === "published");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Konten & Publikasi
          </h1>
          <p className="text-gray-500 text-sm">
            Pantau jadwal postingan media sosial.
          </p>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
          + Request Konten
        </button>
      </div>

      {/* SECTION 1: UPCOMING (Fokus Utama) */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-orange-500" /> Akan Tayang / Dalam
          Proses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {upcoming.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Header Card */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-50 p-1.5 rounded-lg border">
                    {getChannelIcon(item.channel)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase">
                      {item.channel.replace("_", " ")}
                    </p>
                    <p className="text-xs font-bold text-gray-800">
                      {item.date
                        ? new Date(item.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Belum dijadwalkan"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                    getStatusBadge(item.status),
                  )}
                >
                  {item.status}
                </span>
              </div>

              {/* Body Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                    {item.picName.charAt(0)}
                  </div>
                  <span>{item.picName}</span>
                </div>
              </div>

              {/* Footer Visual Dummy */}
              <div className="h-32 w-full bg-gray-50 relative">
                {item.assetUrl ? (
                  <img
                    src={item.assetUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 text-xs italic">
                    No Preview Available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: RECENTLY PUBLISHED */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500" /> Baru Saja Tayang
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {published.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {item.assetUrl && (
                    <img
                      src={item.assetUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    {getChannelIcon(item.channel)}
                    <span>
                      Posted on{" "}
                      {new Date(item.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-900">
                <MoreHorizontal size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
