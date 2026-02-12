import React from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { publications, users } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { Calendar, User, ArrowRight } from "lucide-react";

// Fetch Public Articles
async function getPublicUpdates() {
  return await db
    .select({
      title: publications.title,
      slug: publications.slug,
      category: publications.category,
      content: publications.content, // Ambil dikit buat excerpt
      publishedAt: publications.publishedAt,
      fileUrl: publications.fileUrl,
      author: users.name,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(
      and(
        eq(publications.status, "published"),
        // Hanya tampilkan kategori yang relevan buat news
        inArray(publications.category, [
          "Artikel",
          "Press Release",
          "Dokumentasi",
        ]),
      ),
    )
    .orderBy(desc(publications.publishedAt));
}

export default async function UpdatesPage() {
  const updates = await getPublicUpdates();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Updates & News
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kabar terbaru, press release, dan dokumentasi kegiatan Pojok
            Statistik Telkom University Surabaya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {updates.map((item, idx) => (
            <Link
              href={`/updates/${item.slug}`}
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col"
            >
              {/* Thumbnail Image */}
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                {item.fileUrl ? (
                  <Image
                    src={item.fileUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold opacity-80">
                    POTIK UPDATE
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    {item.author?.split(" ")[0]}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                  {/* Simple strip tags for excerpt */}
                  {item.content?.replace(/<[^>]*>?/gm, "").substring(0, 100)}...
                </p>

                <div className="flex items-center text-indigo-600 text-sm font-bold mt-auto group-hover:gap-2 transition-all">
                  Baca Selengkapnya <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {updates.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            Belum ada update terbaru.
          </div>
        )}
      </div>
    </div>
  );
}
