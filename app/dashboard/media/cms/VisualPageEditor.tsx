"use client";

import React, { useState, useTransition, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { saveCMSFields } from "./actions";
import type { PageDefinition, PageField } from "./types";
import {
  Save,
  Loader2,
  UploadCloud,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  Type,
  Image as ImageIcon,
  AlignLeft,
  Palette,
  Check,
  RotateCcw,
  PanelLeftClose,
  PanelLeft,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── SubComponents ───────────────────────────────────

function DeviceToggle({
  device,
  setDevice,
}: {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
}) {
  const items = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
  ];
  return (
    <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
      {items.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setDevice(key)}
          title={label}
          className={cn(
            "p-2 rounded-lg transition-all",
            device === key
              ? "bg-white text-violet-600 shadow-sm"
              : "text-gray-400 hover:text-gray-600",
          )}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}

function FieldTypeIcon({ type }: { type: PageField["type"] }) {
  const icons: Record<PageField["type"], typeof Type> = {
    text: Type,
    textarea: AlignLeft,
    image: ImageIcon,
    rich_text: AlignLeft,
    color: Palette,
  };
  const Icon = icons[type] || Type;
  return <Icon size={14} />;
}

// ─── Main Component ──────────────────────────────────
export default function VisualPageEditor({
  page,
  availablePages,
}: {
  page: PageDefinition;
  availablePages?: { slug: string; title: string; previewUrl: string }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPending, startTransition] = useTransition();

  // State
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [showPreview, setShowPreview] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([page.sections[0]?.id]),
  );
  const [editedValues, setEditedValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());
  const [iframeKey, setIframeKey] = useState(0);

  // Helpers
  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getFieldValue = useCallback(
    (sectionId: string, key: string, original: string) => {
      return editedValues[sectionId]?.[key] ?? original;
    },
    [editedValues],
  );

  const setFieldValue = (sectionId: string, key: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [key]: value },
    }));
    // Remove from saved
    setSavedFields((prev) => {
      const next = new Set(prev);
      next.delete(`${sectionId}:${key}`);
      return next;
    });
  };

  const hasUnsavedChanges = Object.values(editedValues).some(
    (section) => Object.keys(section).length > 0,
  );

  const changedFieldCount = Object.values(editedValues).reduce(
    (acc, section) => acc + Object.keys(section).length,
    0,
  );

  // Image Upload
  const handleImageUpload = async (
    sectionId: string,
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = `${sectionId}:${key}`;
    setUploadingKey(uploadKey);

    try {
      const fileName = `cms-${sectionId}-${key}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error } = await supabase.storage
        .from("cms")
        .upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("cms").getPublicUrl(fileName);
      setFieldValue(sectionId, key, data.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload gagal. Coba lagi.");
    } finally {
      setUploadingKey(null);
    }
  };

  // Save All Changes
  const handleSaveAll = () => {
    const allFields: {
      section: string;
      key: string;
      value: string;
      dbId: number | null;
    }[] = [];

    for (const section of page.sections) {
      const sectionEdits = editedValues[section.id];
      if (!sectionEdits) continue;

      for (const [key, value] of Object.entries(sectionEdits)) {
        const field = section.fields.find((f) => f.key === key);
        allFields.push({
          section: section.id,
          key,
          value,
          dbId: field?.dbId ?? null,
        });
      }
    }

    if (allFields.length === 0) return;

    startTransition(async () => {
      try {
        await saveCMSFields(allFields);
        // Mark all as saved
        const savedKeys = new Set(
          allFields.map((f) => `${f.section}:${f.key}`),
        );
        setSavedFields(savedKeys);
        setEditedValues({});
        // Refresh iframe
        setIframeKey((k) => k + 1);
        router.refresh();
      } catch (err) {
        console.error("Save failed:", err);
        alert("Gagal menyimpan. Coba lagi.");
      }
    });
  };

  // Discard
  const handleDiscard = () => {
    setEditedValues({});
    setSavedFields(new Set());
  };

  // Device widths
  const deviceWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // ─── Render ────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* ═══ Top Toolbar ═══ */}
      <div className="flex-none flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title={showPanel ? "Hide panel" : "Show panel"}
          >
            {showPanel ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          {/* Page selector */}
          {availablePages && availablePages.length > 1 ? (
            <div className="relative">
              <select
                value={page.slug}
                onChange={(e) =>
                  router.push(`/dashboard/media/cms?page=${e.target.value}`)
                }
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                {availablePages.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-sm font-bold text-gray-900">{page.title}</h1>
              <p className="text-xs text-gray-500">Visual Editor</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DeviceToggle device={device} setDevice={setDevice} />

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              showPreview
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
            Preview
          </button>

          <a
            href={page.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <>
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium">
                {changedFieldCount} unsaved
              </span>
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition-all"
              >
                <RotateCcw size={14} />
                Discard
              </button>
            </>
          )}
          <button
            onClick={handleSaveAll}
            disabled={!hasUnsavedChanges || isPending}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              hasUnsavedChanges
                ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Save size={14} />
            )}
            Publish Changes
          </button>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 flex overflow-hidden bg-gray-100">
        {/* ─── Left: Editor Panel ─── */}
        {showPanel && (
          <div className="w-105 flex-none bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-800">Page Sections</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Click any field to edit. Changes appear in preview after saving.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {page.sections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                const sectionEdits = editedValues[section.id] || {};
                const editCount = Object.keys(sectionEdits).length;

                return (
                  <div key={section.id}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          isExpanded
                            ? "bg-violet-100 text-violet-600"
                            : "bg-gray-100 text-gray-400",
                        )}
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 flex-1 text-left">
                        {section.label}
                      </span>
                      {editCount > 0 && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          {editCount} edited
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {section.fields.length} fields
                      </span>
                    </button>

                    {/* Fields */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        {section.fields.map((field) => {
                          const currentValue = getFieldValue(
                            section.id,
                            field.key,
                            field.value,
                          );
                          const isEdited =
                            editedValues[section.id]?.[field.key] !== undefined;
                          const isSaved = savedFields.has(
                            `${section.id}:${field.key}`,
                          );
                          const isUploading =
                            uploadingKey === `${section.id}:${field.key}`;

                          return (
                            <div
                              key={field.key}
                              className={cn(
                                "rounded-xl border p-3 transition-all",
                                isSaved
                                  ? "border-green-200 bg-green-50/50"
                                  : isEdited
                                    ? "border-violet-200 bg-violet-50/30"
                                    : "border-gray-100 bg-white hover:border-gray-200",
                              )}
                            >
                              {/* Field Label */}
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className={cn(
                                    "p-1 rounded",
                                    isSaved
                                      ? "bg-green-100 text-green-600"
                                      : "bg-gray-100 text-gray-400",
                                  )}
                                >
                                  <FieldTypeIcon type={field.type} />
                                </div>
                                <label className="text-xs font-semibold text-gray-700 flex-1">
                                  {field.label}
                                </label>
                                {isSaved && (
                                  <Check size={12} className="text-green-500" />
                                )}
                              </div>

                              {field.description && (
                                <p className="text-[11px] text-gray-400 mb-2">
                                  {field.description}
                                </p>
                              )}

                              {/* Field Input */}
                              {field.type === "image" ? (
                                <div className="space-y-2">
                                  {/* Preview */}
                                  {currentValue && (
                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                      <Image
                                        src={currentValue}
                                        alt={field.label}
                                        fill
                                        className="object-cover"
                                        sizes="360px"
                                      />
                                    </div>
                                  )}
                                  <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all text-xs">
                                    {isUploading ? (
                                      <Loader2
                                        className="animate-spin text-violet-500"
                                        size={14}
                                      />
                                    ) : (
                                      <UploadCloud
                                        className="text-gray-400"
                                        size={14}
                                      />
                                    )}
                                    <span className="font-medium text-gray-600">
                                      {isUploading
                                        ? "Uploading..."
                                        : "Change Image"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleImageUpload(
                                          section.id,
                                          field.key,
                                          e,
                                        )
                                      }
                                      disabled={isUploading}
                                    />
                                  </label>
                                  {/* Or paste URL */}
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) =>
                                      setFieldValue(
                                        section.id,
                                        field.key,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Or paste image URL..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                  />
                                </div>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  value={currentValue}
                                  onChange={(e) =>
                                    setFieldValue(
                                      section.id,
                                      field.key,
                                      e.target.value,
                                    )
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400 resize-none leading-relaxed"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={currentValue}
                                  onChange={(e) =>
                                    setFieldValue(
                                      section.id,
                                      field.key,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Right: Live Preview ─── */}
        {showPreview && (
          <div className="flex-1 flex items-start justify-center p-6 overflow-auto">
            <div
              className={cn(
                "bg-white rounded-2xl shadow-2xl shadow-gray-300/50 overflow-hidden transition-all duration-500 ring-1 ring-gray-200",
                device === "desktop" ? "w-full" : "",
              )}
              style={{
                width: deviceWidth[device],
                maxWidth: "100%",
                height: "calc(100vh - 10rem)",
              }}
            >
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={page.previewUrl}
                className="w-full h-full border-0"
                title="Page Preview"
              />
            </div>
          </div>
        )}

        {/* If both hidden, show empty state */}
        {!showPreview && !showPanel && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Eye size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">
                Toggle the panel or preview to start editing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
