import React from "react";
import { getPublicationBySlug } from "../actions";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicationImageViewer from "@/components/PublicationImageViewer";
import {
  ArrowLeft,
  Calendar,
  User,
  Download,
  Share2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicationBySlug(slug);
  if (!data) return { title: "Not Found | Pojok Statistik" };

  return {
    title: `${data.title} | Pojok Statistik TUS`,
    description: data.excerpt || "Publikasi Riset Pojok Statistik",
  };
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicationBySlug(slug);

  if (!data) return notFound();

  const isInfographic = data.category === "Infografis";
  const isPaper = data.category === "Paper";

  return (
    <div className="min-h-screen relative bg-gray-50 selection:bg-orange-100 selection:text-orange-900 font-sans">
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-orange-400/20 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] right-[-10%] w-150 h-150 bg-blue-400/10 rounded-full blur-[100px] opacity-60" />
      </div>

      <Navbar />

      <div className="h-24" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {/* BACK BUTTON */}
        <div className="mb-6">
          <Link
            href="/publications"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 hover:bg-white/60"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>

        {/* --- GLASS CONTENT CARD --- */}
        <article className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-4xl overflow-hidden shadow-xl shadow-gray-200/50">
          {/* HERO SECTION: GRID LAYOUT*/}
          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-gray-100">
            {/* KOLOM KIRI: Header Info */}
            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center bg-linear-to-br from-white/50 to-transparent">
              <div>
                {/* Category Badge */}
                <span
                  className={cn(
                    "inline-block px-3 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 shadow-sm",
                    isInfographic
                      ? "bg-purple-100 text-purple-700"
                      : "bg-orange-100 text-orange-700",
                  )}
                >
                  {data.category}
                </span>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                  {data.title}
                </h1>

                {/* Excerpt */}
                {data.excerpt && (
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    {data.excerpt}
                  </p>
                )}

                {/* Meta Data */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-orange-500" />
                    <span className="font-medium">
                      {data.publishedAt
                        ? new Date(data.publishedAt).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-orange-500" />
                    <span className="font-medium">
                      {data.author?.name || "Tim Riset"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: Gambar*/}
            <div className="lg:col-span-7 bg-gray-100 relative min-h-75 lg:min-h-125 border-l border-white/50">
              {/* component Viewer */}
              <PublicationImageViewer
                src={data.thumbnailUrl}
                alt={data.title}
                category={data.category}
              />
            </div>
          </div>

          {/* CONTENT BODY SECTION */}
          <div className="p-8 md:p-12 lg:px-16 max-w-5xl mx-auto">
            {/* Isi Konten */}
            <div className="prose prose-lg prose-orange max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
              {data.content}
            </div>

            {/* PAPER DOWNLOAD SECTION */}
            {isPaper && data.fileUrl && (
              <div className="mt-16 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Download Full Paper
                    </h3>
                    <p className="text-sm text-gray-500">
                      Dapatkan dokumen lengkap riset ini dalam format PDF.
                    </p>
                  </div>
                </div>
                <a
                  href={data.fileUrl}
                  target="_blank"
                  download
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <Download size={20} /> Download PDF
                </a>
              </div>
            )}
          </div>
        </article>

        <div className="mt-12 text-center text-gray-400 text-sm">
          © 2026 Pojok Statistik Telkom University Surabaya
        </div>
      </main>
    </div>
  );
}
