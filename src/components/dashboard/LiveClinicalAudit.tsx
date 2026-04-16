"use client";

import React from "react";
import { useSurgical } from "@/context/SurgicalContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, Shield, Hash, Layout, ClipboardList, PenTool as Tool, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LiveClinicalAudit() {
  const { surgicalState, liveScribe, isLive } = useSurgical();

  if (!isLive) return null;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Surgical State Machine - Mid-Term Context */}
      <GlassCard className="border-surgical-teal/20 bg-surgical-teal/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-surgical-teal/10 text-surgical-teal"><Activity size={18} /></div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-surgical-teal">Surgical State Machine</h3>
            <p className="text-[9px] text-surgical-teal/40 uppercase tracking-tighter font-mono italic">Mid-Term Context Monitor</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Phase Progress */}
          <div>
            <div className="flex justify-between items-end mb-2">
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Procedural Phase</span>
               <span className="text-surgical-teal font-mono text-[10px] font-bold">{surgicalState.phase} / 10</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(surgicalState.phase / 10) * 100}%` }}
                  className="h-full bg-surgical-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-white/20">
                   <Tool size={12} />
                   <span className="text-[9px] font-bold uppercase tracking-widest">Active Tools</span>
                </div>
                <div className="space-y-1">
                   {Object.entries(surgicalState.activeTools).length > 0 ? Object.entries(surgicalState.activeTools).map(([tool, count]) => (
                      <div key={tool} className="flex justify-between text-[10px]">
                         <span className="text-white/60">{tool}</span>
                         <span className="text-surgical-teal font-bold">{count}</span>
                      </div>
                   )) : <span className="text-[9px] text-white/10 italic">Awaiting detection...</span>}
                </div>
             </div>
             <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-white/20">
                   <Layout size={12} />
                   <span className="text-[9px] font-bold uppercase tracking-widest">Landmarks</span>
                </div>
                <div className="flex flex-wrap gap-1">
                   {surgicalState.landmarks.length > 0 ? surgicalState.landmarks.map((mark, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-surgical-blue/10 text-surgical-blue text-[8px] border border-surgical-blue/20">{mark}</span>
                   )) : <span className="text-[9px] text-white/10 italic">Initializing...</span>}
                </div>
             </div>
          </div>
        </div>
      </GlassCard>

      {/* Sliding State Window - Short-Term Context */}
      <GlassCard className="flex-1 border-white/5 bg-white/[0.01] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-surgical-blue/10 text-surgical-blue"><ClipboardList size={18} /></div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Sliding State Window</h3>
              <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono italic">Recursive Short-Term Context</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <div className="w-1 h-1 bg-surgical-blue rounded-full animate-ping" />
             <span className="text-[8px] font-bold text-surgical-blue uppercase tracking-widest">Live Scribe</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-mono">
           <AnimatePresence mode="popLayout">
              {liveScribe.length > 0 ? [...liveScribe].reverse().map((entry, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl bg-white/5 border-l-2 border-surgical-blue"
                 >
                    <div className="flex items-center gap-2 mb-1">
                       <CheckCircle2 size={10} className="text-surgical-blue" />
                       <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Segment {liveScribe.length - i} Complete</span>
                    </div>
                    <p className="text-[10px] text-white/70 leading-relaxed font-mono">
                       {entry}
                    </p>
                 </motion.div>
              )) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3 grayscale">
                    <Activity size={40} className="animate-pulse" />
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Awaiting Hardware Ingestion...</p>
                 </div>
              )}
           </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}
