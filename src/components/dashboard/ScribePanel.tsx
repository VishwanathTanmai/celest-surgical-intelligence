"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileText, Copy, Download } from "lucide-react";
import { useSurgical } from "@/context/SurgicalContext";

export const ScribePanel = React.memo(function ScribePanel() {
  const { analysisResult } = useSurgical();
  if (!analysisResult?.scribeNote) return null;

  const copyToClipboard = () => navigator.clipboard.writeText(analysisResult.scribeNote);

  return (
    <GlassCard className="border-white/5 bg-white/[0.01]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-surgical-teal/10 text-surgical-teal"><FileText size={18} /></div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">AI Operative Scribe</h3>
            <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono">Gemini 3 Flash • Auto-Generated Report</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="p-2 glass-effect hover:border-white/20 transition-all" title="Copy"><Copy size={14} className="text-white/40" /></button>
          <button className="p-2 glass-effect hover:border-white/20 transition-all" title="Download"><Download size={14} className="text-white/40" /></button>
        </div>
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed font-mono text-[12px] max-h-[500px] overflow-y-auto pr-4 whitespace-pre-wrap">
        {analysisResult.scribeNote}
      </div>
    </GlassCard>
  );
});
