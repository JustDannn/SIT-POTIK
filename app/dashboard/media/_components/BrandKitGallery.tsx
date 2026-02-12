"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { createBrandKit, deleteBrandKit } from "../actions";
import {
  Palette,
  Type as TypeIcon,
  FileImage,
  FileText,
  Layers,
  Star,
  Download,
  Trash2,
  Plus,
  X,
  Loader2,
  UploadCloud,
  Check,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BrandKitCategory =
  | "logo"
  | "font"
  | "template"
  | "guideline"
  | "color_palette"
  | "icon";

interface BrandKit {
  id: number;
  name: string;
  category: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  description: string | null;
  version: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  uploader: { name: string } | null;
}

interface BrandKitGalleryProps {
  brandKits: BrandKit[];
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  logo: { icon: Star, color: "text-violet-600", bgColor: "bg-violet-50" },
  font: { icon: TypeIcon, color: "text-blue-600", bgColor: "bg-blue-50" },
  template: { icon: Layers, color: "text-green-600", bgColor: "bg-green-50" },
  guideline: {
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  color_palette: {
    icon: Palette,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  icon: { icon: FileImage, color: "text-cyan-600", bgColor: "bg-cyan-50" },
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "logo", label: "Logos" },
  { id: "font", label: "Fonts" },
  { id: "template", label: "Templates" },
  { id: "guideline", label: "Guidelines" },
  { id: "color_palette", label: "Colors" },
  { id: "icon", label: "Icons" },
];

export default function BrandKitGallery({ brandKits }: BrandKitGalleryProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  // UI State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BrandKit | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState<{
    name: string;
    category: BrandKitCategory;
    description: string;
    version: string;
  }>({
    name: "",
    category: "logo",
    description: "",
    version: "1.0",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filtered items
  const filteredKits =
    selectedCategory === "all"
      ? brandKits
      : brandKits.filter((k) => k.category === selectedCategory);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (file.type.startsWith("image/")) {
        setUploadPreview(URL.createObjectURL(file));
      } else {
        setUploadPreview(null);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const fileName = `brand-${Date.now()}-${uploadFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;

      const { error: uploadError } = await supabase.storage
        .from("brand-kit")
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("brand-kit")
        .getPublicUrl(fileName);

      // Create thumbnail URL for images
      let thumbnailUrl = null;
      if (uploadFile.type.startsWith("image/")) {
        thumbnailUrl = data.publicUrl;
      }

      await createBrandKit({
        ...uploadForm,
        fileUrl: data.publicUrl,
        thumbnailUrl: thumbnailUrl || undefined,
      });

      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadForm({
        name: "",
        category: "logo",
        description: "",
        version: "1.0",
      });
      router.refresh();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload gagal. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: BrandKit) => {
    if (!confirm(`Hapus "${item.name}" dari Brand Kit?`)) return;

    startTransition(async () => {
      try {
        await deleteBrandKit(item.id);
        router.refresh();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Gagal menghapus asset.");
      }
    });
  };

  const getFileExtension = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    return ext || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Brand Kit</h2>
          <p className="text-sm text-gray-500">
            Official logos, fonts, and design guidelines
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
        >
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === cat.id
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {cat.label}
            {cat.id !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({brandKits.filter((k) => k.category === cat.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredKits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredKits.map((item) => {
            const config =
              CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.logo;
            const Icon = config.icon;
            const isImage =
              item.thumbnailUrl ||
              ["jpg", "jpeg", "png", "svg", "webp", "gif"].includes(
                getFileExtension(item.fileUrl),
              );

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {/* Preview */}
                <div className="aspect-video bg-gray-50 relative overflow-hidden">
                  {isImage ? (
                    <Image
                      src={item.thumbnailUrl || item.fileUrl}
                      alt={item.name}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center",
                        config.bgColor,
                      )}
                    >
                      <Icon size={48} className={config.color} />
                      <span className="mt-2 text-xs font-medium text-gray-500 uppercase">
                        .{getFileExtension(item.fileUrl)}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                      title="Preview"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <a
                      href={item.fileUrl}
                      download={item.name}
                      className="p-2.5 bg-white rounded-xl hover:bg-gray-100 transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isPending}
                      className="p-2.5 bg-white rounded-xl hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>

                  {/* Category Badge */}
                  <div
                    className={cn(
                      "absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold capitalize",
                      config.bgColor,
                      config.color,
                    )}
                  >
                    {item.category.replace("_", " ")}
                  </div>

                  {/* Version Badge */}
                  {item.version && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-600">
                      v{item.version}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {item.updatedAt &&
                        new Date(item.updatedAt).toLocaleDateString("id-ID")}
                    </span>
                    {item.uploader && (
                      <span className="text-xs text-gray-500">
                        by {item.uploader.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Palette className="mx-auto mb-4 text-gray-300" size={56} />
          <p className="font-medium">No brand assets yet</p>
          <p className="text-sm mb-4">
            Start building your brand kit by uploading assets.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} />
            Add First Asset
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">
                Add Brand Asset
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpload} className="p-6 space-y-5">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File
                </label>
                <label
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all",
                    uploadFile
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 hover:border-violet-400 hover:bg-violet-50",
                  )}
                >
                  {uploadFile ? (
                    <>
                      {uploadPreview ? (
                        <Image
                          src={uploadPreview}
                          alt="Preview"
                          width={128}
                          height={128}
                          className="max-h-32 object-contain mb-2"
                        />
                      ) : (
                        <FileText className="text-green-500 mb-2" size={32} />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {uploadFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Click to change
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-gray-400 mb-2" size={32} />
                      <span className="text-sm font-medium text-gray-600">
                        Click to upload
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, SVG, PDF, TTF, OTF
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".png,.jpg,.jpeg,.svg,.webp,.gif,.pdf,.ai,.eps,.ttf,.otf,.woff,.woff2"
                  />
                </label>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.name}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g., Primary Logo Horizontal"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm((f) => ({
                      ...f,
                      category: e.target.value as BrandKitCategory,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 bg-white"
                >
                  <option value="logo">Logo</option>
                  <option value="font">Font</option>
                  <option value="template">Template</option>
                  <option value="guideline">Guideline</option>
                  <option value="color_palette">Color Palette</option>
                  <option value="icon">Icon</option>
                </select>
              </div>

              {/* Version & Description Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={uploadForm.version}
                    onChange={(e) =>
                      setUploadForm((f) => ({ ...f, version: e.target.value }))
                    }
                    placeholder="1.0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || !uploadForm.name || isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Asset
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
