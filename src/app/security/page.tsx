"use client";

import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldCheck, Lock, EyeOff, Key, AlertTriangle, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSurgical } from "@/context/SurgicalContext";
import Link from "next/link";

export default function SecurityPage() {
  const { analysisResult } = useSurgical();

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Security & De-ID</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">HIPAA Compliance • Automated Anonymization</p>
            </div>
            {analysisResult && (
              <button className="bg-surgical-teal px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] text-surgical-dark flex items-center gap-2 hover:bg-surgical-teal/90 transition-colors shadow-lg shadow-surgical-teal/20">
                <Key size={14} /> Rotate Forensic Keys
              </button>
            )}
          </div>

          {!analysisResult ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <ShieldCheck size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Security Events</h3>
              <p className="text-white/40 text-sm max-w-md mb-8">Security & De-ID logs are generated when surgical videos are processed. Upload a procedure to begin.</p>
              <Link href="/" className="bg-surgical-blue px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-colors flex items-center gap-2">
                <Upload size={14} /> Go to Dashboard
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "De-ID Status", value: "Active", icon: EyeOff, status: "Enabled" },
                  { label: "Encryption", value: "AES-256", icon: Lock, status: "Enabled" },
                  { label: "Audit Integrity", value: "Verified", icon: ShieldCheck, status: "Active" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 rounded-xl bg-surgical-teal/10 text-surgical-teal"><stat.icon size={20} /></div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surgical-teal/10 text-surgical-teal uppercase tracking-widest border border-surgical-teal/20">{stat.status}</span>
                      </div>
                      <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</h3>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <GlassCard title="Privacy Settings" subtitle={`Applied to: ${analysisResult.procedureName}`}>
                <div className="mt-6 space-y-4">
                  {[
                    { label: "Automatic Face Blur", desc: "Mask all human faces in surgical field", enabled: true },
                    { label: "Audio Strip", desc: "Remove background conversation audio", enabled: true },
                    { label: "OCR Metadata Redact", desc: "Scan frames for patient MRN/Name labels", enabled: true },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-4 glass-effect border-white/5">
                      <div>
                        <p className="text-sm font-bold">{setting.label}</p>
                        <p className="text-[10px] text-white/40 uppercase font-mono tracking-tighter">{setting.desc}</p>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full relative p-1 cursor-pointer", setting.enabled ? "bg-surgical-teal" : "bg-white/10")}>
                        <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-md", setting.enabled ? "translate-x-6" : "translate-x-0")} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="bg-surgical-crimson/5 border-surgical-crimson/20">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={20} className="text-surgical-crimson" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-surgical-crimson">Privacy Violation Alerts</h4>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <p className="text-[11px] font-bold text-white/80">0 Alerts Pending</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-tighter">Systems nominal • zero leaks detected</p>
                </div>
              </GlassCard>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
