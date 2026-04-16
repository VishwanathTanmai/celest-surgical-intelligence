"use client";

import React from "react";

import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Video, Calendar, User, Search, Filter, Play, ExternalLink, MoreVertical, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSurgical } from "@/context/SurgicalContext";
import Link from "next/link";

export default function LibraryPage() {
  const { analysisResult, videoUrl } = useSurgical();


  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Surgical Library</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Digital Asset Management • {(analysisResult && videoUrl) ? "1" : "0"} Total Cases</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input type="text" placeholder="Search by MRN, Surgeon, or Procedure..." className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-80 focus:outline-none focus:border-surgical-blue/50 transition-all font-mono" />
              </div>
            </div>
          </div>

          {!(analysisResult && videoUrl) ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Video size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Procedures Recorded</h3>
              <p className="text-white/40 text-sm max-w-md mb-8">Upload a surgical .mp4 file from the Live Dashboard to populate the library with real clinical data.</p>
              <Link href="/" className="bg-surgical-blue px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-colors flex items-center gap-2">
                <Upload size={14} /> Go to Dashboard
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/">
                  <GlassCard className="group cursor-pointer hover:border-surgical-blue/30 transition-all duration-500 overflow-hidden p-0 border-white/5 bg-white/[0.01]">
                    <div className="aspect-video bg-black/40 relative overflow-hidden">
                      <video src={videoUrl} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                      <div className="absolute top-4 left-4 z-20 glass-effect px-2 py-1 text-[10px] font-bold text-surgical-teal uppercase tracking-tighter">Analyzed</div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[2px]">
                        <div className="w-12 h-12 rounded-full bg-surgical-blue flex items-center justify-center shadow-2xl shadow-surgical-blue/40 scale-90 group-hover:scale-100 transition-transform">
                          <Play size={20} fill="white" className="ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-surgical-blue transition-colors mb-4">{analysisResult.procedureName}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-white/40"><User size={14} className="text-surgical-blue" /><span className="text-xs uppercase tracking-widest">{analysisResult.surgeonName}</span></div>
                        <div className="flex items-center gap-3 text-white/40"><Calendar size={14} className="text-surgical-blue" /><span className="text-xs uppercase tracking-widest">{new Date().toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-3 text-white/40"><Video size={14} className="text-surgical-blue" /><span className="text-xs uppercase tracking-widest">{analysisResult.duration}</span></div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            </div>

          )}
        </main>
      </div>
    </div>
  );
}
