"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Info, CheckCircle2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSurgical } from "@/context/SurgicalContext";

export const StepSegmentation = React.memo(function StepSegmentation() {
  const { analysisResult } = useSurgical();
  
  if (!analysisResult) return null;

  return (
    <GlassCard title="Surgical Step Segmentation" subtitle="Phase detection engine">
      <div className="space-y-4 mt-4">
        {analysisResult.steps.map((step, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-mono group-hover:border-surgical-blue/50 transition-colors">
                  {step.status === "completed" ? (
                    <CheckCircle2 size={12} className="text-surgical-teal" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
                  {step.label}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/40">{step.duration}</span>
            </div>
            
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${step.progress}%` }}
                className="h-full bg-gradient-to-r from-surgical-blue/40 to-surgical-blue" 
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});

export const AIDetector = React.memo(function AIDetector() {
  const { analysisResult } = useSurgical();

  if (!analysisResult) return null;

  return (
    <GlassCard title="Real-Time Instrument Analysis" subtitle="Multimodal detection loop">
      <div className="space-y-3 mt-4">
        {analysisResult.instruments.map((tool, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                tool.active ? "bg-surgical-teal animate-pulse" : "bg-white/10"
              )} />
              <span className="text-[11px] font-medium text-white/70 uppercase tracking-wider">{tool.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-surgical-blue">{tool.count} ops</span>
              <div className="relative group/info">
                <Info size={12} className="text-white/20 cursor-help hover:text-white/40" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">
          <span className="flex items-center gap-2">
            <Activity size={10} className="text-surgical-blue" />
            Confidence Index
          </span>
          <span>99.2%</span>
        </div>
        <div className="flex gap-1">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 h-3 rounded-[1px]",
                i < 19 ? "bg-surgical-blue/40" : "bg-surgical-blue/10"
              )} 
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
});
