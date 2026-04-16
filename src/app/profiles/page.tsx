"use client";

import React from "react";

import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, Award, FileCheck, Star, Activity, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useSurgical } from "@/context/SurgicalContext";
import Link from "next/link";

export default function ProfilesPage() {
  const { analysisResult } = useSurgical();

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Physician Profiles</h1>
            <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Performance & Credentialing Intelligence</p>
          </div>

          {!analysisResult ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <User size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Physician Data</h3>
              <p className="text-white/40 text-sm max-w-md mb-8">Physician profiles are generated from real surgical analyses. Upload a procedure to begin.</p>
              <Link href="/" className="bg-surgical-blue px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-colors flex items-center gap-2">
                <Upload size={14} /> Go to Dashboard
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <GlassCard className="p-6 border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-surgical-blue/20 border border-surgical-blue/30 flex items-center justify-center text-surgical-blue">
                      <User size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold tracking-tight">{analysisResult.surgeonName}</h3>
                        <span className="bg-surgical-teal/10 text-surgical-teal text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active</span>
                      </div>
                      <div className="flex items-center gap-6 text-[11px] uppercase tracking-widest text-white/40 font-mono">
                        <span className="flex items-center gap-2"><Award size={12} className="text-surgical-blue" /> Clinical Lead</span>
                        <span>MRN: {analysisResult.patientMrn}</span>
                      </div>
                    </div>
                    <div className="flex gap-12 text-center">
                      <div><p className="text-[10px] uppercase tracking-widest text-white/20">Procedure</p><p className="text-sm font-bold mt-1">{analysisResult.procedureName}</p></div>
                      <div><p className="text-[10px] uppercase tracking-widest text-white/20">CPT Code</p><p className="text-sm font-bold mt-1">{analysisResult.cptCode}</p></div>
                      <div><p className="text-[10px] uppercase tracking-widest text-white/20">ICD Code</p><p className="text-sm font-bold mt-1">{analysisResult.icdCode}</p></div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
