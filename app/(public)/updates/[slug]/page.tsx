import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { publications, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params; // Next.js 15 await params

  const article = await db
    .select({
      title: publications.title,
      category: publications.category,
      content: publications.content,
      publishedAt: publications.publishedAt,
      fileUrl: publications.fileUrl,
      author: users.name,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(eq(publications.slug, slug))
    .limit(1);

  if (!article[0]) return notFound();

  const data = article[0];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* Hero / Header Image */}
      {data.fileUrl && (
        <div className="w-full h-100 relative mb-10">
          <Image
            src={data.fileUrl}
            alt={data.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>
        </div>
      )}

      <article className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Updates
        </Link>

        <div className="mb-8">
          <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm mb-2 block">
            {data.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {data.title}
          </h1>

          <div className="flex items-center justify-between border-y border-gray-100 py-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {data.author?.charAt(0)}
                </div>
                <span className="font-medium text-gray-900">{data.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {data.publishedAt
                  ? new Date(data.publishedAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-900">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed">
          {/* Render Content (Kalau HTML string bisa pake dangerouslySetInnerHTML) */}
          {/* Untuk MVP kita tampilkan raw text di-breaklines */}
          {data.content?.split("\n").map((paragraph, idx) => (
            <p key={idx} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
