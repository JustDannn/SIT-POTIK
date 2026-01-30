'use client'

import React from 'react'
import { 
  BookOpen, 
  PieChart, 
  Clock, 
  Plus, 
  ArrowRight, 
  FileText, 
  Image as ImageIcon 
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function KoordinatorRisetView({ user, data }: { user: any, data: any }) {
  const { stats, recentUploads } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Halo, {user.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Koordinator Divisi <span className="font-semibold text-orange-600">{user.division.divisionName}</span>
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard/publications" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
             <Plus size={16} /> Artikel Baru
          </Link>
          <Link href="/dashboard/infographics" className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200">
             <Plus size={16} /> Upload Infografis
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Artikel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-colors">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen size={24} />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Total Artikel/Paper</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.articles}</h3>
           </div>
        </div>

        {/* Card Infografis */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-purple-300 transition-colors">
           <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <PieChart size={24} />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Total Infografis</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.infographics}</h3>
           </div>
        </div>

        {/* Card Pending */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-yellow-300 transition-colors">
           <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <Clock size={24} />
           </div>
           <div>
              <p className="text-sm text-gray-500 font-medium">Menunggu Review</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
           </div>
        </div>
      </div>

      {/* RECENT ACTIVITY & GUIDELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Uploads (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Upload Terakhir</h3>
              <Link href="/dashboard/publications" className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                 Lihat Semua <ArrowRight size={14}/>
              </Link>
           </div>
           
           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {recentUploads.length === 0 ? (
                 <div className="p-8 text-center text-gray-400 text-sm italic">
                    Belum ada publikasi. Mulai upload sekarang!
                 </div>
              ) : (
                 <div className="divide-y divide-gray-100">
                    {recentUploads.map((item: any) => (
                       <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                             {/* Icon based on category */}
                             <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", 
                                item.category === 'Infografis' ? "bg-purple-50 border-purple-100 text-purple-600" : "bg-blue-50 border-blue-100 text-blue-600")}>
                                {item.category === 'Infografis' ? <ImageIcon size={20}/> : <FileText size={20}/>}
                             </div>
                             <div>
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                      {item.category}
                                   </span>
                                   <span className="text-xs text-gray-400">• {new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                             </div>
                          </div>
                          
                          {/* Status Badge */}
                          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase", 
                             item.status === 'published' ? "bg-green-100 text-green-700" : 
                             item.status === 'review' ? "bg-yellow-100 text-yellow-700" : 
                             "bg-gray-100 text-gray-600")}>
                             {item.status}
                          </span>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* Quick Guideline */}
        <div className="space-y-4">
           <h3 className="font-bold text-gray-800">Panduan Riset</h3>
           <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-lg">
              <h4 className="font-bold mb-2">Alur Publikasi</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                 <li className="flex gap-2">
                    <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    Upload Draft (Artikel / Infografis)
                 </li>
                 <li className="flex gap-2">
                    <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    Review oleh Ketua Umum
                 </li>
                 <li className="flex gap-2">
                    <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    Published ke Website Utama
                 </li>
              </ul>
              <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors border border-white/10">
                 Download Template Paper
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}