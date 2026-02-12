"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  uploadMediaAsset,
  deleteMediaAsset,
  updateMediaAsset,
} from "../actions";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Folder,
  UploadCloud,
  Search,
  Filter,
  Grid3X3,
  List,
  Trash2,
  Download,
  Edit3,
  X,
  Loader2,
  Check,
  MoreVertical,
  Eye,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaAsset {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  size: number | null;
  type: "image" | "video" | "document" | "audio";
  mimeType: string | null;
  folder: string | null;
  tags: string | null;
  createdAt: Date | null;
  program: { title: string } | null;
  division: { divisionName: string } | null;
  uploader: { name: string } | null;
}

interface AssetGalleryProps {
  assets: MediaAsset[];
  folders: string[];
  programs?: { id: number; title: string }[];
  divisions?: { id: number; divisionName: string }[];
}

const TYPE_ICONS = {
  image: ImageIcon,
  video: Video,
  document: FileText,
  audio: Music,
};

const TYPE_COLORS = {
  image: "text-blue-500 bg-blue-50",
  video: "text-purple-500 bg-purple-50",
  document: "text-orange-500 bg-orange-50",
  audio: "text-green-500 bg-green-50",
};

export default function AssetGallery({
  assets,
  folders,
  programs = [],
  divisions = [],
}: AssetGalleryProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      searchQuery === "" ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder =
      selectedFolder === "all" || asset.folder === selectedFolder;

    const matchesType = selectedType === "all" || asset.type === selectedType;

    return matchesSearch && matchesFolder && matchesType;
  });

  // Handle file upload
  const handleUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `media-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;

        // Determine type
        let type: "image" | "video" | "document" | "audio" = "document";
        if (file.type.startsWith("image/")) type = "image";
        else if (file.type.startsWith("video/")) type = "video";
        else if (file.type.startsWith("audio/")) type = "audio";

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from("media-assets")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("media-assets")
          .getPublicUrl(fileName);

        // Save to database
        await uploadMediaAsset({
          filename: file.name,
          url: data.publicUrl,
          size: file.size,
          type,
          mimeType: file.type,
          folder: selectedFolder !== "all" ? selectedFolder : "general",
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      router.refresh();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload gagal. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm(`Hapus "${asset.filename}"?`)) return;

    startTransition(async () => {
      try {
        await deleteMediaAsset(asset.id);
        setSelectedAsset(null);
        router.refresh();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Gagal menghapus file.");
      }
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search files, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Folder Filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 bg-white"
          >
            <option value="all">All Folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 bg-white"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="audio">Audio</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "grid"
                  ? "bg-violet-100 text-violet-600"
                  : "text-gray-500 hover:bg-gray-50",
              )}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === "list"
                  ? "bg-violet-100 text-violet-600"
                  : "text-gray-500 hover:bg-gray-50",
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
          dragActive
            ? "border-violet-400 bg-violet-50"
            : "border-gray-300 hover:border-violet-300 hover:bg-violet-50/30",
          isUploading && "pointer-events-none opacity-70",
        )}
      >
        {isUploading ? (
          <div className="space-y-3">
            <Loader2
              className="mx-auto animate-spin text-violet-600"
              size={32}
            />
            <p className="text-sm text-gray-600 font-medium">
              Uploading... {Math.round(uploadProgress)}%
            </p>
            <div className="w-48 mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-gray-600 font-medium mb-1">
              Drag & drop files here
            </p>
            <p className="text-sm text-gray-400 mb-3">or</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold cursor-pointer hover:bg-violet-700 transition-colors">
              <UploadCloud size={16} />
              Browse Files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
              />
            </label>
          </>
        )}
      </div>

      {/* Assets Grid/List */}
      {filteredAssets.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredAssets.map((asset) => {
              const TypeIcon = TYPE_ICONS[asset.type];
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "group relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1",
                    selectedAsset?.id === asset.id && "ring-2 ring-violet-500",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {asset.type === "image" ? (
                      <img
                        src={asset.thumbnailUrl || asset.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-full h-full flex items-center justify-center",
                          TYPE_COLORS[asset.type],
                        )}
                      >
                        <TypeIcon size={40} />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(asset.url, "_blank");
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <a
                        href={asset.url}
                        download={asset.filename}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(asset);
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {asset.filename}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(asset.size)}
                      </span>
                      {asset.folder && (
                        <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                          {asset.folder}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    File
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    Folder
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    Size
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3">
                    Uploaded
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-600 px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.map((asset) => {
                  const TypeIcon = TYPE_ICONS[asset.type];
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              TYPE_COLORS[asset.type],
                            )}
                          >
                            <TypeIcon size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {asset.filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        {asset.type}
                      </td>
                      <td className="px-4 py-3">
                        {asset.folder && (
                          <span className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-md">
                            {asset.folder}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatFileSize(asset.size)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {asset.createdAt &&
                          new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={asset.url}
                            download={asset.filename}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                          >
                            <Download size={14} />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(asset);
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Folder className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="font-medium">No assets found</p>
          <p className="text-sm">Upload files or adjust your filters.</p>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview */}
            <div className="bg-gray-100 aspect-video relative">
              {selectedAsset.type === "image" ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.filename}
                  className="w-full h-full object-contain"
                />
              ) : selectedAsset.type === "video" ? (
                <video
                  src={selectedAsset.url}
                  controls
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {React.createElement(TYPE_ICONS[selectedAsset.type], {
                    size: 64,
                    className: "text-gray-400",
                  })}
                </div>
              )}
              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedAsset.filename}
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium capitalize">{selectedAsset.type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Size</span>
                  <p className="font-medium">
                    {formatFileSize(selectedAsset.size)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Folder</span>
                  <p className="font-medium">{selectedAsset.folder || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Uploaded by</span>
                  <p className="font-medium">
                    {selectedAsset.uploader?.name || "-"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <a
                  href={selectedAsset.url}
                  download={selectedAsset.filename}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors"
                >
                  <Download size={16} />
                  Download
                </a>
                <button
                  onClick={() => handleDelete(selectedAsset)}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
