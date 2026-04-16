"use client";

import React, { useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
    Activity, ShieldCheck, AlertTriangle, Zap, 
    Maximize2, Eye, Gauge, Hexagon, BarChart3,
    CloudLightning, Search, Workflow, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnalyzerProps {
    data: {
        motionStability: number;
        dissectionSafety: number;
        bleedingRisk: number;
        clipStability: number;
        cvsProxy: number;
        visualTelemetry: {
            brightness: number;
            sharpness: number;
            frameVariation: number;
        };
        overallScore: number;
    } | null;
}

export function SurgicalAnalyzer({ data }: AnalyzerProps) {
    if (!data) return (
        <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <Search size={48} className="text-white/5 mb-4 animate-pulse" />
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/20">Awaiting Clinical Data Ingestion</p>
        </div>
    );

    const metrics = [
        { label: "Motion Stability", value: data.motionStability, icon: Activity, color: "text-surgical-blue" },
        { label: "Dissection Safety", value: data.dissectionSafety, icon: ShieldCheck, color: "text-surgical-teal" },
        { label: "Bleeding Risk", value: data.bleedingRisk, icon: AlertTriangle, color: "text-surgical-crimson" },
        { label: "Clip Stability", value: data.clipStability, icon: Zap, color: "text-white" },
        { label: "CVS Proxy", value: data.cvsProxy, icon: Target, color: "text-surgical-blue" },
    ];

    const visualParams = [
        { label: "Brightness", value: data.visualTelemetry.brightness, icon: Eye },
        { label: "Sharpness", value: data.visualTelemetry.sharpness, icon: Maximize2 },
        { label: "Frame Dynamic", value: data.visualTelemetry.frameVariation, icon: BarChart3 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header: Score & ERIF Banner */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Hexagon className="text-surgical-blue fill-surgical-blue/20" size={24} />
                        Surgical Performance Hub
                    </h2>
                    <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-mono mt-1">
                        Ethically Reflexive AI (ERIF-V1) • Objective Kinetic Evaluation
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
                    <div className="px-6 py-2">
                        <p className="text-[8px] text-white/30 uppercase font-black text-center mb-0.5">Final Quality Index</p>
                        <p className="text-2xl font-black text-surgical-teal tracking-tighter">{data.overallScore.toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Main Objective Metrics */}
                <div className="col-span-8 grid grid-cols-2 gap-6">
                    {metrics.map((m, i) => (
                        <GlassCard key={i} className="p-6 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-surgical-blue/10 transition-all duration-700" />
                            <div className="flex items-start justify-between relative">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2.5 rounded-xl bg-white/5 shadow-inner", m.color)}>
                                        <m.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">{m.label}</p>
                                        <p className="text-xl font-black tracking-tighter mt-1">{(m.value * 100).toFixed(0)}%</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${m.value * 100}%` }}
                                            className={cn("h-full", m.value > 0.8 ? "bg-surgical-teal" : m.value > 0.5 ? "bg-surgical-blue" : "bg-surgical-crimson")}
                                        />
                                    </div>
                                    <p className="text-[8px] text-white/20 uppercase font-mono mt-2 tracking-tighter">Benchmarked</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}

                    <GlassCard className="col-span-2 p-10 border-surgical-blue/20 bg-surgical-blue/5 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-surgical-blue/10 to-transparent" />
                        <Workflow className="mx-auto mb-4 text-surgical-blue animate-spin-slow" size={32} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-2">Cognition-Aware Insight</h3>
                        <p className="text-[10px] text-white/50 leading-relaxed uppercase tracking-tighter">
                            Anatomical understanding transitioning from simulated overlays to objective Kinetic truth. Precise Calot identification active.
                        </p>
                        <div className="mt-6 pt-6 border-t border-white/10 flex justify-center gap-3">
                            <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-surgical-teal">YOLO-V11 Training</div>
                            <div className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-surgical-blue">MedSAM-2 Active</div>
                        </div>
                    </GlassCard>
                </div>

                {/* Secondary Visual Telemetry */}
                <div className="col-span-4 space-y-6">
                    <GlassCard className="p-8 border-white/5 bg-white/[0.01]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 flex items-center gap-2">
                            <Gauge size={14} /> Visual Parameters
                        </h3>
                        <div className="space-y-8">
                            {visualParams.map((v, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <v.icon size={16} className="text-surgical-blue/50" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{v.label}</span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-white/40">{(v.value * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${v.value * 100}%` }}
                                            className="h-full bg-surgical-blue/40"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8 border-surgical-crimson/10 bg-surgical-crimson/[0.02] relative group">
                        <CloudLightning className="absolute -top-4 -right-4 text-surgical-crimson/10 group-hover:scale-150 transition-transform duration-1000" size={80} />
                        <div className="relative">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-surgical-crimson mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} /> ERIF Sentinel
                            </h3>
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter">
                                Early detection of unsafe patterns active. Objective, reproducible evaluation prevents subjective assessment bias.
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
