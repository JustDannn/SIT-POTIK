import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string; // Buat tooltip nanti
  className?: string;
}

export default function StatCard({ title, value, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32",
        className,
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Info size={16} className="text-gray-300 cursor-help" />
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
    </div>
  );
}
