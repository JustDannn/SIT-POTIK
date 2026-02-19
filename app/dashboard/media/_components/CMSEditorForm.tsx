"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateSiteConfig } from "../actions";
import RichTextEditor from "@/components/RichTextEditor";
import Image from "next/image";
import {
  Save,
  Loader2,
  UploadCloud,
  X,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigItem {
  id: number;
  section: string;
  key: string;
  value: string;
  type: "text" | "image" | "rich_text" | "link" | "json" | null;
  label?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

interface CMSEditorFormProps {
  section: string;
  sectionLabel?: string;
  configs: ConfigItem[];
  onSave?: () => void;
}

const typeIcons = {
  text: Type,
  image: ImageIcon,
  rich_text: FileText,
  link: LinkIcon,
  json: Code,
};

export default function CMSEditorForm({
  section,
  sectionLabel,
  configs,
  onSave,
}: CMSEditorFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [savedKeys, setSavedKeys] = useState<Set<number>>(new Set());

  const handleValueChange = (id: number, value: string) => {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
    // Remove from saved when edited
    setSavedKeys((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleImageUpload = async (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(id);
    try {
      // Show preview immediately
      setPreviews((prev) => ({ ...prev, [id]: URL.createObjectURL(file) }));

      // Upload to Supabase
      const fileName = `cms-${section}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error: uploadError } = await supabase.storage
        .from("cms")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("cms").getPublicUrl(fileName);
      handleValueChange(id, data.publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload gagal. Silakan coba lagi.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async (config: ConfigItem) => {
    const newValue = editedValues[config.id];
    if (newValue === undefined) return;

    startTransition(async () => {
      try {
        await updateSiteConfig(config.id, newValue);
        setSavedKeys((prev) => new Set(prev).add(config.id));
        router.refresh();
        onSave?.();
      } catch (error) {
        console.error("Save failed:", error);
        alert("Gagal menyimpan. Silakan coba lagi.");
      }
    });
  };

  const handleSaveAll = async () => {
    const editedConfigs = configs.filter(
      (c) => editedValues[c.id] !== undefined,
    );

    startTransition(async () => {
      try {
        for (const config of editedConfigs) {
          await updateSiteConfig(config.id, editedValues[config.id]);
          setSavedKeys((prev) => new Set(prev).add(config.id));
        }
        router.refresh();
        onSave?.();
      } catch (error) {
        console.error("Save all failed:", error);
        alert("Gagal menyimpan. Silakan coba lagi.");
      }
    });
  };

  const renderInput = (config: ConfigItem) => {
    const currentValue = editedValues[config.id] ?? config.value;
    const type = config.type || "text";
    const isSaved = savedKeys.has(config.id);

    switch (type) {
      case "image":
        return (
          <div className="space-y-3">
            {/* Image Preview */}
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              {previews[config.id] || currentValue ? (
                <>
                  <Image
                    src={previews[config.id] || currentValue}
                    alt={config.label || config.key}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleValueChange(config.id, "");
                      setPreviews((prev) => {
                        const next = { ...prev };
                        delete next[config.id];
                        return next;
                      });
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all">
              {uploadingId === config.id ? (
                <Loader2 className="animate-spin text-violet-600" size={18} />
              ) : (
                <UploadCloud className="text-gray-500" size={18} />
              )}
              <span className="text-sm font-medium text-gray-600">
                {uploadingId === config.id ? "Uploading..." : "Upload Image"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(config.id, e)}
                disabled={uploadingId === config.id}
              />
            </label>
          </div>
        );

      case "rich_text":
        return (
          <RichTextEditor
            content={currentValue}
            onChange={(html) => handleValueChange(config.id, html)}
          />
        );

      case "link":
        return (
          <div className="relative">
            <LinkIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="url"
              value={currentValue}
              onChange={(e) => handleValueChange(config.id, e.target.value)}
              placeholder="https://..."
              className={cn(
                "w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all",
                isSaved
                  ? "border-green-300 focus:ring-green-100 bg-green-50"
                  : "border-gray-200 focus:ring-violet-100 focus:border-violet-400",
              )}
            />
          </div>
        );

      case "json":
        return (
          <textarea
            value={currentValue}
            onChange={(e) => handleValueChange(config.id, e.target.value)}
            rows={6}
            className={cn(
              "w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all resize-none",
              isSaved
                ? "border-green-300 focus:ring-green-100 bg-green-50"
                : "border-gray-200 focus:ring-violet-100 focus:border-violet-400",
            )}
            placeholder='{"key": "value"}'
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleValueChange(config.id, e.target.value)}
            className={cn(
              "w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all",
              isSaved
                ? "border-green-300 focus:ring-green-100 bg-green-50"
                : "border-gray-200 focus:ring-violet-100 focus:border-violet-400",
            )}
          />
        );
    }
  };

  const hasChanges = Object.keys(editedValues).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {sectionLabel || section.replace(/_/g, " ")}
          </h2>
          <p className="text-sm text-gray-500">
            {configs.length} configurable items
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveAll}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-70 transition-all shadow-lg shadow-violet-200"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            Save All
          </button>
        )}
      </div>

      {/* Config Fields */}
      <div className="space-y-6">
        {configs.map((config) => {
          const TypeIcon = typeIcons[config.type || "text"] || Type;
          const isSaved = savedKeys.has(config.id);
          const hasUnsavedChanges =
            editedValues[config.id] !== undefined && !isSaved;

          return (
            <div
              key={config.id}
              className={cn(
                "p-5 rounded-2xl border transition-all",
                isSaved
                  ? "bg-green-50/50 border-green-200"
                  : hasUnsavedChanges
                    ? "bg-violet-50/50 border-violet-200"
                    : "bg-white border-gray-100",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isSaved ? "bg-green-100" : "bg-gray-100",
                    )}
                  >
                    <TypeIcon
                      size={16}
                      className={isSaved ? "text-green-600" : "text-gray-600"}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {config.label || config.key}
                    </h3>
                    {config.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {config.description}
                      </p>
                    )}
                  </div>
                </div>
                {hasUnsavedChanges && (
                  <button
                    onClick={() => handleSave(config)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 disabled:opacity-70 transition-all"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <Save size={12} />
                    )}
                    Save
                  </button>
                )}
                {isSaved && (
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                    Saved
                  </span>
                )}
              </div>
              {renderInput(config)}
            </div>
          );
        })}
      </div>

      {configs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="font-medium">No configurations found</p>
          <p className="text-sm">Add configuration items to this section.</p>
        </div>
      )}
    </div>
  );
}
