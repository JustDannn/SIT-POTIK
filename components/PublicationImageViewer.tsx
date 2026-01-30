"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ImageIcon,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  src: string | null;
  alt: string;
  category: string;
}

export default function PublicationImageViewer({
  src,
  alt,
  category,
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isInfographic = category === "Infografis";

  const containerRef = useRef<HTMLDivElement>(null);

  // Body scroll NOT locked - user wants to scroll page when cursor outside image

  // --- ESCAPE KEY TO CLOSE ---
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setTimeout(resetZoom, 200);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // --- 2. WHEEL ZOOM LOGIC (only inside image box) ---
  useEffect(() => {
    const container = containerRef.current;
    if (!isOpen || !container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default hanya di dalam image box, biar scroll di luar = scroll halaman
      e.preventDefault();

      const delta = -e.deltaY;
      const zoomFactor = 0.1;

      setScale((prevScale) => {
        let newScale = prevScale + (delta > 0 ? zoomFactor : -zoomFactor);
        return Math.min(Math.max(newScale, 1), 5);
      });
    };

    // Attach hanya ke container (image box), bukan document
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeViewer = () => {
    setIsOpen(false);
    setTimeout(resetZoom, 200);
  };

  // --- MANUAL BUTTONS ---
  const handleZoomInBtn = () => setScale((p) => Math.min(p + 0.5, 5));
  const handleZoomOutBtn = () => {
    setScale((p) => {
      const newS = Math.max(p - 0.5, 1);
      if (newS === 1) setPosition({ x: 0, y: 0 });
      return newS;
    });
  };

  // --- LOGIC DRAG (only when zoomed in) ---
  const onMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const onMouseUp = () => setIsDragging(false);

  return (
    <>
      {/* --- THUMBNAIL (View di Halaman Utama) --- */}
      <div
        className="group relative w-full h-full cursor-zoom-in overflow-hidden rounded-xl"
        onClick={() => setIsOpen(true)}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={cn(
              "absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105",
              isInfographic ? "object-contain p-6 bg-gray-50" : "object-cover",
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            {isInfographic ? <ImageIcon size={80} /> : <FileText size={80} />}
          </div>
        )}

        {src && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold text-gray-800 transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <Maximize2 size={16} /> Klik untuk Zoom
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL LIGHTBOX (Fullscreen) --- */}
      {isOpen && src && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onMouseUp={onMouseUp}
          onClick={(e) => {
            // Close when clicking backdrop (not the image or controls)
            if (e.target === e.currentTarget) {
              closeViewer();
            }
          }}
        >
          {/* HEADER TOOLBAR */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-50 pointer-events-none fixed top-0 left-0 right-0">
            <h3 className="text-white font-medium truncate max-w-md pointer-events-auto drop-shadow-md pl-2">
              {alt}
            </h3>

            <div className="flex items-center gap-4 pointer-events-auto">
              <div className="flex items-center bg-gray-800/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-xl">
                <button
                  onClick={handleZoomOutBtn}
                  disabled={scale <= 1}
                  className="p-2 text-white hover:bg-gray-700 rounded-md disabled:opacity-30 transition-colors"
                >
                  <ZoomOut size={20} />
                </button>
                <span className="w-14 text-center text-sm font-mono text-gray-300 font-bold">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomInBtn}
                  disabled={scale >= 5}
                  className="p-2 text-white hover:bg-gray-700 rounded-md disabled:opacity-30 transition-colors"
                >
                  <ZoomIn size={20} />
                </button>
                <div className="w-px h-4 bg-gray-600 mx-1"></div>
                <button
                  onClick={resetZoom}
                  className="p-2 text-white hover:bg-gray-700 rounded-md transition-colors"
                  title="Reset Scale"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <button
                onClick={closeViewer}
                className="p-2 bg-white/10 hover:bg-red-600/80 text-white rounded-full transition-colors border border-white/20"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* MAIN CANVAS AREA */}
          <div
            ref={containerRef}
            className="flex-1 w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
            onClick={(e) => {
              // Close when clicking the canvas area but not the image
              if (e.target === e.currentTarget) {
                closeViewer();
              }
            }}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                cursor:
                  scale === 1 ? "default" : isDragging ? "grabbing" : "grab",
                // FIX PROPORSIONAL:
                maxWidth: "90vw",
                maxHeight: "85vh",
                objectFit: "contain",
              }}
              className="select-none shadow-2xl rounded-sm"
            />

            {/* HINT */}
            {scale === 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-sm pointer-events-none bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 animate-pulse">
                Scroll di gambar untuk zoom, Drag untuk geser
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
