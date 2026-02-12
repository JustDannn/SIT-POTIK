import React from "react";
import Image from "next/image";
import { db } from "@/db";
import { publications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Download, FileText } from "lucide-react";

export const revalidate = 60;

async function getImpactBySlug(slug: string) {
  return await db.query.publications.findFirst({
    where: and(
      eq(publications.slug, slug),
      eq(publications.category, "Impact"),
    ),
    with: {
      author: {
        columns: { name: true, image: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getImpactBySlug(slug);
  if (!data) return { title: "Not Found | Pojok Statistik" };

  return {
    title: `${data.title} | Impact & Stories`,
    description:
      data.content?.slice(0, 160) || "Dokumentasi kegiatan Pojok Statistik TUS",
  };
}

export default async function ImpactDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getImpactBySlug(slug);

  if (!data) return notFound();

  return (
    <div className="min-h-screen relative bg-gray-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-indigo-400/15 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[30%] right-[-10%] w-150 h-150 bg-pink-400/10 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="h-24" />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        {/* Back */}
        <div className="mb-8">
          <Link
            href="/impact"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 hover:bg-white/60"
          >
            <ArrowLeft size={16} /> Kembali ke Impact & Stories
          </Link>
        </div>

        {/* Article Card */}
        <article className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-4xl overflow-hidden shadow-xl shadow-gray-200/50">
          {/* Hero Image */}
          {(data.thumbnailUrl || data.fileUrl) && (
            <div className="w-full max-h-112 overflow-hidden relative h-96">
              <Image
                src={data.thumbnailUrl || data.fileUrl || ""}
                alt={data.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div className="p-8 md:p-12 border-b border-gray-100">
            <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 border border-white/20">
              Impact Story
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {data.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                <span className="font-medium">
                  {data.createdAt
                    ? new Date(data.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                <span className="font-medium">
                  {data.author?.name || "Tim Pojok Statistik"}
                </span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8 md:p-12 lg:px-16 max-w-none">
            <div
              className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed font-serif"
              dangerouslySetInnerHTML={{ __html: data.content || "" }}
            />

            {/* File attachment download */}
            {data.fileUrl && data.thumbnailUrl && (
              <div className="mt-16 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Download Dokumentasi
                    </h3>
                    <p className="text-sm text-gray-500">
                      Unduh file dokumentasi lengkap kegiatan ini.
                    </p>
                  </div>
                </div>
                <a
                  href={data.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <Download size={20} /> Download File
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
