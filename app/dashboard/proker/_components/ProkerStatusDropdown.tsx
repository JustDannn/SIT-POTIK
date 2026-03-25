"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProkerStatus } from "../actions";

type ProkerStatus = "created" | "active" | "completed" | "archived";

const STATUS_OPTIONS: Array<{ value: ProkerStatus; label: string }> = [
  { value: "created", label: "Planning" },
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Selesai" },
  { value: "archived", label: "Diarsipkan" },
];

const badgeClassByStatus: Record<ProkerStatus, string> = {
  created: "bg-indigo-100 text-indigo-700 border-indigo-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ProkerStatusDropdown({
  prokerId,
  currentStatus,
}: {
  prokerId: number;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const normalizedStatus: ProkerStatus = useMemo(() => {
    if (
      currentStatus === "created" ||
      currentStatus === "active" ||
      currentStatus === "completed" ||
      currentStatus === "archived"
    ) {
      return currentStatus;
    }
    return "created";
  }, [currentStatus]);

  const selectedLabel =
    STATUS_OPTIONS.find((s) => s.value === normalizedStatus)?.label ??
    "Planning";

  const handleChange = (nextStatus: ProkerStatus) => {
    setOpen(false);

    if (nextStatus === normalizedStatus) return;

    startTransition(async () => {
      const res = await updateProkerStatus(prokerId, nextStatus);
      if (res?.success) {
        router.refresh();
      } else {
        alert(res?.error || "Gagal mengubah status proker.");
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase border transition-opacity",
          badgeClassByStatus[normalizedStatus],
          isPending && "opacity-60 cursor-not-allowed",
        )}
      >
        {selectedLabel}
        <ChevronDown
          size={12}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-36 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="flex flex-col py-1">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(option.value)}
                className="px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                {option.label}
                {normalizedStatus === option.value && (
                  <CheckCircle2 size={14} className="text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
