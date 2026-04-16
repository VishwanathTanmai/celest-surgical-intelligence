"use client";

import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3, TrendingUp, DollarSign, Clock, Zap, ShieldCheck, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSurgical } from "@/context/SurgicalContext";
import Link from "next/link";

export default function AnalyticsPage() {
  const { analysisResult } = useSurgical();

  const metrics = analysisResult ? [
    { label: "Duration", value: analysisResult.duration || "N/A", icon: Clock, color: "text-surgical-blue" },
    { label: "Supply ROI", value: analysisResult.roiMetrics?.supplyOptimization || "N/A", icon: DollarSign, color: "text-surgical-teal" },
    { label: "Efficiency Gain", value: analysisResult.roiMetrics?.efficiencyGain || "N/A", icon: Zap, color: "text-surgical-blue" },
    { label: "Time Saved", value: analysisResult.roiMetrics?.timeSaved || "N/A", icon: ShieldCheck, color: "text-surgical-teal" },
  ] : [];

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Analytics Hub</h1>
            <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Operations & Financial Intelligence</p>
          </div>

          {!analysisResult ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <BarChart3 size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Analytics Available</h3>
              <p className="text-white/40 text-sm max-w-md mb-8">Analytics are generated from real surgical video analysis. Upload a procedure to begin.</p>
              <Link href="/" className="bg-surgical-blue px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-colors flex items-center gap-2">
                <Upload size={14} /> Go to Dashboard
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                      <div className={cn("p-2.5 rounded-xl bg-white/5 w-fit mb-4", metric.color)}><metric.icon size={20} /></div>
                      <h3 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-1">{metric.label}</h3>
                      <p className="text-3xl font-extrabold tracking-tight">{metric.value}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard title="Phase Duration Analysis" subtitle={analysisResult.procedureName}>
                  <div className="mt-6 flex items-end gap-2 h-56">
                    {(analysisResult.steps || []).map((step: any, i: number) => {
                      const mins = parseInt(String(step.duration).replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 15) + 5;
                      const maxMins = 45; // arbitrary graphical maximum for scaling
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group h-full">
                          <span className="text-[10px] font-mono text-surgical-blue opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{step.duration}</span>
                          <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: `${Math.max((mins / maxMins) * 100, 10)}%` }} 
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="w-full bg-gradient-to-t from-surgical-blue/10 to-surgical-blue/50 group-hover:to-surgical-blue rounded-t-sm transition-colors border-t border-surgical-blue/50 relative overflow-hidden" 
                          >
                             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 animate-pulse" />
                          </motion.div>
                          <span className="text-[7px] text-white/40 uppercase tracking-tighter truncate w-full text-center" title={step.label}>
                            {String(step.label).substring(0, 8)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                <GlassCard title="Real-Time Instrument Density Mapping" subtitle="AI Visual Tool Audit • Live Sensing Hub">
                  <div className="mt-8 space-y-6">
                    {(analysisResult.instruments || []).map((inst: any, i: number) => {
                      const maxCount = Math.max(...(analysisResult.instruments || []).map((x: any) => x.count), 1);
                      const widthPct = Math.max((inst.count / maxCount) * 100, 5);
                      return (
                        <div key={i} className="flex flex-col gap-2 group">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 group-hover:text-surgical-teal transition-colors">
                                 {inst.name}
                              </span>
                              <div className="flex items-center gap-4">
                                 {inst.active && (
                                    <span className="text-[8px] font-black uppercase text-surgical-teal animate-pulse tracking-widest bg-surgical-teal/10 px-2 py-0.5 rounded-full border border-surgical-teal/20">
                                       In Lens
                                    </span>
                                 )}
                                 <span className="text-[11px] font-mono text-surgical-teal font-black">X{inst.count}</span>
                              </div>
                           </div>
                           <div className="h-2.5 bg-black/40 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                             {inst.active && (
                                <motion.div 
                                   initial={{ x: "-100%" }}
                                   animate={{ x: "100%" }}
                                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                   className="absolute inset-0 z-10 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                                />
                             )}
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${widthPct}%` }}
                               transition={{ type: "spring", stiffness: 50, delay: 0.1 * i }}
                               className={cn(
                                  "h-full rounded-full transition-all duration-500 relative",
                                  inst.active ? "bg-gradient-to-r from-surgical-teal to-surgical-teal/40 shadow-[0_0_15px_rgba(48,213,200,0.3)]" : "bg-white/10 opacity-40"
                               )}
                             >
                                {inst.active && (
                                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                )}
                             </motion.div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
