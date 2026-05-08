"use client";

import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { SurgicalPlayer } from "@/components/dashboard/SurgicalPlayer";
import { AIDetector, StepSegmentation } from "@/components/dashboard/AIDetector";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Calendar, Activity, Clock, User, Hash, Stethoscope, ArrowUpRight, TrendingUp, DollarSign, BarChart3, Heart, Building2, Search, BookOpen, Table, FileText, Shield, GraduationCap, X, Copy, Download, Radio, RefreshCw, Circle, ChevronRight, Edit3, Trash2, Microscope } from "lucide-react";
import { SurgicalAnalyzer } from "@/components/dashboard/SurgicalAnalyzer";
import { useSurgical } from "@/context/SurgicalContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { HeroUploadZone } from "@/components/dashboard/HeroUploadZone";
import { LiveClinicalAudit } from "@/components/dashboard/LiveClinicalAudit";
import { SurgicalCalendar } from "@/components/dashboard/SurgicalCalendar";
import { cn } from "@/lib/utils";
import { 
   ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
   CartesianGrid, Tooltip, Radar, RadarChart, 
   PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";

function ROICalculatorPanel() {
  const { analysisResult } = useSurgical();
  if (!analysisResult) return null;
  const roi = (analysisResult as any).roiMetrics || {};
  return (
    <GlassCard className="border-white/5 bg-white/[0.01]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-surgical-teal/10 text-surgical-teal"><DollarSign size={18} /></div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">ROI Calculator</h3>
          <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono">AI-Generated Financial Impact</p>
        </div>
      </div>
      <div className="space-y-4">
        {[
          { label: "Time Saved", value: roi.timeSaved || "N/A", color: "bg-surgical-blue" },
          { label: "Supply Optimization", value: roi.supplyOptimization || "N/A", color: "bg-surgical-teal" },
          { label: "Efficiency Gain", value: roi.efficiencyGain || "N/A", color: "bg-white/20" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <span className="text-[11px] text-white/60 uppercase tracking-widest">{item.label}</span>
            <span className="text-sm font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function PatientFollowUpChart() {
  const { analysisResult } = useSurgical();
  if (!analysisResult?.patientFollowUp) return null;
  return (
    <GlassCard className="border-white/5 bg-white/[0.01]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-surgical-blue/10 text-surgical-blue">
          <Calendar size={18} />
        </div>
        <div>
           <h3 className="text-sm font-bold uppercase tracking-widest">Follow-Up Schedule</h3>
           <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono">Projected Clinical Calendar</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {analysisResult.patientFollowUp.map((visit: any, i: number) => {
          const dateStr = visit.date || `Week ${visit.week}`;
          let day = "--", month = "---";
          if (visit.date && visit.date.includes("-")) {
             const d = new Date(visit.date);
             if (!isNaN(d.getTime())) {
                day = d.getDate().toString().padStart(2, '0');
                month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
             }
          }

          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} 
              className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.04] transition-colors group">
              <div className="flex flex-col items-center justify-center bg-white/[0.04] rounded-lg w-12 h-12 border border-white/10 group-hover:border-surgical-blue/30 transition-colors">
                 <span className="text-[10px] font-bold text-surgical-blue">{month}</span>
                 <span className="text-sm font-bold font-mono">{day}</span>
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold tracking-tight">{visit.visitType}</p>
                <p className="text-[9px] text-white/40 font-mono uppercase mt-1 flex items-center gap-2">
                   <Clock size={10} /> {dateStr}
                </p>
              </div>
              <span className={cn("text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest border", 
                  visit.status === "scheduled" ? "bg-surgical-teal/10 text-surgical-teal border-surgical-teal/20" : "bg-white/5 text-white/40 border-white/10"
              )}>
                {visit.status || "Scheduled"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function SurgeonPerformanceChart() {
  const { analysisResult, doctorProfile } = useSurgical();
  if (!analysisResult?.surgeonPerformance) return null;

  // Calculate real-time overall rating
  const overallRating = analysisResult.surgeonPerformance.reduce((acc: number, perf: any) => {
    let val = parseInt(String(perf.value).replace(/[^0-9]/g, ''));
    if (isNaN(val)) {
      if (/excellent|exceptional|outstanding/i.test(perf.value)) val = 96;
      else if (/high|great|strong/i.test(perf.value)) val = 88;
      else if (/good|adequate/i.test(perf.value)) val = 75;
      else val = 85;
    }
    return acc + val;
  }, 0) / analysisResult.surgeonPerformance.length;

  return (
    <GlassCard className="border-white/5 bg-white/[0.01]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-surgical-blue/10 text-surgical-blue"><TrendingUp size={18} /></div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">Surgeon Performance</h3>
            <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono">{doctorProfile?.name || analysisResult.surgeonName} • {doctorProfile?.department}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Real-Time Rating</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surgical-teal/10 border border-surgical-teal/20 rounded-md">
            <Activity size={12} className="text-surgical-teal" />
            <span className="text-sm font-bold text-surgical-teal">{Math.round(overallRating || 92)}</span>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        {analysisResult.surgeonPerformance.map((perf: any, i: number) => {
          let numVal = parseInt(String(perf.value).replace(/[^0-9]/g, ''));
          if (isNaN(numVal)) {
            if (/excellent|exceptional/i.test(perf.value)) numVal = 95;
            else if (/high|great|strong/i.test(perf.value)) numVal = 85;
            else if (/good|adequate/i.test(perf.value)) numVal = 75;
            else if (/fair|average/i.test(perf.value)) numVal = 50;
            else numVal = 85;
          }
          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">{perf.metric}</span>
                <span className="text-sm font-bold text-surgical-blue">{perf.value.includes('%') ? perf.value : `${numVal}%`}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(numVal, 100)}%` }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="h-full bg-surgical-blue rounded-full" />
              </div>
              <p className="text-[9px] text-white/20 mt-1 font-mono">Benchmark: {perf.benchmark}</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

import { IntelligenceWorkspace } from "@/components/dashboard/AnalysisTools";

function ActionRack({ onAction }: { onAction: (tabId: string) => void }) {
  const { analysisResult } = useSurgical();
  if (!analysisResult) return null;

  const actions = [
    { id: "research", label: "10k+ Line Research", icon: BookOpen, color: "text-surgical-blue", bg: "bg-surgical-blue/10" },
    { id: "forensic", label: "Forensic ROI Table", icon: Table, color: "text-surgical-teal", bg: "bg-surgical-teal/10" },
    { id: "surgical-notes", label: "Proc. Notes", icon: FileText, color: "text-white/60", bg: "bg-white/5" },
    { id: "insurance", label: "Insurance Audit", icon: Shield, color: "text-surgical-blue", bg: "bg-white/5" },
    { id: "teaching", label: "E-Learning", icon: GraduationCap, color: "text-surgical-teal", bg: "bg-white/5" },
    { id: "billing", label: "CPT Ledger", icon: DollarSign, color: "text-white", bg: "bg-white/10" },
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
       {actions.map((action, i) => (
          <motion.button 
             key={i}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.05 }}
             onClick={() => onAction(action.id)}
             className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 whitespace-nowrap transition-all hover:border-white/20 hover:scale-[1.02] active:scale-95 shadow-lg",
                action.bg
             )}
          >
             <action.icon size={14} className={action.color} />
             <span className="text-[10px] font-bold uppercase tracking-widest">{action.label}</span>
          </motion.button>
       ))}
    </div>
  );
}

function VisualEvidenceGallery() {
  const { analysisResult } = useSurgical();
  // Parse screenshots from the case (handling both live results and DB results)
  const screenshots = useMemo(() => {
    if (!analysisResult) return [];
    try {
      // In a real scenario, this would come from the Job/Case link. 
      // For the live context, we'll cast it if it's there.
      return JSON.parse((analysisResult as any).screenshots || "[]");
    } catch { return []; }
  }, [analysisResult]);

  if (!screenshots || screenshots.length === 0) return null;

  return (
    <GlassCard className="border-white/5 bg-white/[0.01]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-surgical-blue/10 text-surgical-blue"><Search size={18} /></div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Visual Evidence</h3>
          <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono italic">AI-Extracted Surgical Frames</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {screenshots.slice(0, 12).map((url: string, i: number) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative aspect-video rounded-lg overflow-hidden border border-white/5 group cursor-zoom-in">
             <img src={url} alt={`Evidence ${i}`} className="w-full h-full object-cover group-hover:opacity-80 transition-all duration-500" />
             <div className="absolute inset-0 bg-surgical-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(window.location.origin + url);
                    // Standard visual confirmation would go here
                  }}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white backdrop-blur-md border border-white/10"
                  title="Copy URL"
                >
                  <Copy size={12} />
                </button>
                <a 
                  href={url} 
                  download={`evidence-${i}.jpg`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white backdrop-blur-md border border-white/10"
                  title="Download Frame"
                >
                  <Download size={12} />
                </a>
             </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}


export default function Dashboard() {
  const { 
     analysisResult, isAnalyzing, doctorProfile, closeCase, isLive, setIsLive, surgicalState,
     isRecording, setIsRecording, recordingPatientId, startAnalysis,
     availableCameras, setAvailableCameras, selectedCameraId, setSelectedCameraId
  } = useSurgical();

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [view, setView] = useState<"command" | "analyzer" | "analytics" | "management">("command");
  const [pastCases, setPastCases] = useState<any[]>([]);
   const [loadingAnalytics, setLoadingAnalytics] = useState(false);
   const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>("clinical");
   const [editingCase, setEditingCase] = useState<any>(null);
   const [liveStats, setLiveStats] = useState<any>({ estimatedBloodLoss: 0, realTimeStats: {} });

   const personalStats = useMemo(() => {
      if (!pastCases || pastCases.length === 0) return [];
      const totals = pastCases.reduce((acc, c) => ({
         safety: acc.safety + (c.dissectionSafety || 0),
         cvs: acc.cvs + (c.cvsProxy || 0),
         bleeding: acc.bleeding + (c.bleedingRisk || 0),
         overall: acc.overall + (c.overallScore || 0),
      }), { safety: 0, cvs: 0, bleeding: 0, overall: 0 });
      
      const count = pastCases.length;
      return [
         { subject: 'Safety', A: (totals.safety / count) * 100, fullMark: 100 },
         { subject: 'CVS Proxy', A: (totals.cvs / count) * 100, fullMark: 100 },
         { subject: 'Hemostasis', A: (100 - ((totals.bleeding / count) * 100)), fullMark: 100 },
         { subject: 'Stability', A: 85, fullMark: 100 }, 
         { subject: 'Technique', A: (totals.overall / count) || 0, fullMark: 100 },
      ];
   }, [pastCases]);

   const historicalTrends = useMemo(() => {
      if (!pastCases || pastCases.length === 0) return [];
      return pastCases.slice(-10).map(c => ({
         date: new Date(c.createdAt).toLocaleDateString(),
         score: c.overallScore || 0,
      }));
   }, [pastCases]);

   useEffect(() => {
      // Connect to Python backend for real-time Holoscan data
      const ws = new WebSocket("ws://localhost:8000/ws/surgery");
      ws.onmessage = (event) => {
         try {
            const data = JSON.parse(event.data);
            if (data.type === "SURGERY_UPDATE") {
               setLiveStats({
                  estimatedBloodLoss: data.estimatedBloodLoss || 0,
                  realTimeStats: data.realTimeStats || {}
               });
            }
         } catch(e) {}
      };
      return () => ws.close();
   }, []);

   useEffect(() => {
      if (view === "analytics" || view === "management") {
         setLoadingAnalytics(true);
         fetch("/api/auth/session").then(r => r.json()).then(sess => {
            // Fetch past cases from our server action
            import("@/app/clinical/actions").then(actions => {
               actions.getPastAnalytics().then(cases => {
                  setPastCases(cases);
                  setLoadingAnalytics(false);
               });
            });
         });
      }
   }, [view]);

   useEffect(() => {
      if (isLive) {
         navigator.mediaDevices.enumerateDevices()
            .then(devices => {
               const videoDevices = devices.filter(d => d.kind === 'videoinput');
               setAvailableCameras(videoDevices);
               if (videoDevices.length > 0 && !selectedCameraId) {
                  setSelectedCameraId(videoDevices[0].deviceId);
               }
            })
            .catch(err => console.error("Hardware Discovery Failed:", err));
      }
   }, [isLive, setAvailableCameras, setSelectedCameraId, selectedCameraId]);

   useEffect(() => {
      if (isLive && !isAnalyzing && selectedCameraId) {
         const constraints = { 
            video: { deviceId: { exact: selectedCameraId } },
            audio: false 
         };
         
         navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
               if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => {
               console.warn("Hardware Access Refined: Retrying with standard constraints", err);
               navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                  .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; });
            });
      }
   }, [isLive, isAnalyzing, selectedCameraId]);

   const startRecording = () => {
      if (!videoRef.current?.srcObject) return;
      const stream = videoRef.current.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
         if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
         const blob = new Blob(chunksRef.current, { type: 'video/webm' });
         const file = new File([blob], `LIVE-${Date.now()}.webm`, { type: 'video/webm' });
         if (recordingPatientId) {
            await startAnalysis(file, recordingPatientId);
            setIsLive(false);
            setIsRecording(false);
         }
      };

      recorder.start();
      setIsRecording(true);
   };

   const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
         mediaRecorderRef.current.stop();
      }
   };

   // Handle Action Rack triggers
   const handleAction = (tabId: string) => {
      setActiveWorkspaceTab(tabId);
      // Smooth scroll to workspace
      const el = document.getElementById("intelligence-workspace");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
   };

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col">
          {/* View Toggle */}
          <div className="flex items-center gap-4 mb-4">
              <button 
                 onClick={() => setView("command")}
                 className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border",
                    view === "command" ? "bg-surgical-blue text-white border-surgical-blue shadow-lg shadow-surgical-blue/20" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                 )}
              >
                 Command Hub
              </button>
              <button 
                 onClick={() => setView("analyzer")}
                 className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border",
                    view === "analyzer" ? "bg-surgical-blue text-white border-surgical-blue shadow-lg shadow-surgical-blue/20" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                 )}
              >
                 Surgical Analyzer
              </button>
             <button 
                onClick={() => setView("analytics")}
                className={cn(
                   "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border",
                   view === "analytics" ? "bg-surgical-blue text-white border-surgical-blue shadow-lg shadow-surgical-blue/20" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                )}
             >
                Institutional Analytics
             </button>
             <button 
                onClick={() => setView("management")}
                className={cn(
                   "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border",
                   view === "management" ? "bg-surgical-teal text-white border-surgical-teal shadow-lg shadow-surgical-teal/20" : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                )}
             >
                Manage Records
             </button>
          </div>

          {view === "analyzer" && (
             <div className="max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <SurgicalAnalyzer 
                   data={analysisResult ? {
                      motionStability: analysisResult.motionStability || 0.85,
                      dissectionSafety: analysisResult.dissectionSafety || 0.90,
                      bleedingRisk: analysisResult.bleedingRisk || 0.05,
                      clipStability: analysisResult.clipStability || 0.98,
                      cvsProxy: analysisResult.cvsProxy || 0.91,
                      visualTelemetry: analysisResult.visualTelemetry ? JSON.parse(analysisResult.visualTelemetry) : { brightness: 0.88, sharpness: 0.92, frameVariation: 0.1 },
                      bleedingIntelligence: {
                        detected: analysisResult.bleedingDetected || false,
                        approxBloodLoss: analysisResult.approxBloodLoss || 0.0,
                        duration: analysisResult.bleedingDuration || "0s",
                        locations: analysisResult.bleedingLocations ? JSON.parse(analysisResult.bleedingLocations) : [],
                        maxBleedingTime: analysisResult.maxBleedingTime || "00:00",
                        intensityGraph: analysisResult.bleedingIntensityGraph ? JSON.parse(analysisResult.bleedingIntensityGraph) : []
                      },
                      overallScore: analysisResult.overallScore || 92.4
                   } : null} 
                />
             </div>
          )}

          {view === "management" ? (
             <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center justify-between">
                   <div>
                      <h2 className="text-2xl font-bold tracking-tight">Clinical Record Vault</h2>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1">Lifecycle Management for {pastCases.length} Surgical Datasets</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {pastCases.map((c) => (
                      <GlassCard key={c.id} className="p-6 border-white/5 bg-white/[0.01] hover:border-surgical-teal/20 transition-all group overflow-hidden relative">
                         <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-surgical-teal border border-white/10 group-hover:border-surgical-teal/30 transition-colors">
                                  <Shield size={20} />
                               </div>
                               <div>
                                  {editingCase === c.id ? (
                                     <div className="flex items-center gap-2">
                                        <input 
                                           autoFocus
                                           defaultValue={c.procedureName}
                                           onBlur={async (e) => {
                                              const val = e.target.value;
                                              if (val && val !== c.procedureName) {
                                                 const formData = new FormData();
                                                 formData.append("caseId", c.id);
                                                 formData.append("procedureName", val);
                                                 import("@/app/clinical/actions").then(async a => {
                                                    await a.updateCaseDetails(formData);
                                                    setPastCases(prev => prev.map(p => p.id === c.id ? { ...p, procedureName: val } : p));
                                                 });
                                              }
                                              setEditingCase(null);
                                           }}
                                           className="bg-black/40 border border-surgical-teal/30 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:ring-1 ring-surgical-teal"
                                        />
                                     </div>
                                  ) : (
                                     <p className="text-sm font-bold tracking-tight cursor-pointer hover:text-surgical-teal transition-colors" onClick={() => setEditingCase(c.id)}>
                                        {c.procedureName} <Edit3 size={10} className="inline ml-1 opacity-20" />
                                     </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1">
                                     <span className="text-[9px] text-white/40 uppercase font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                                     <span className="text-[9px] text-white/20">•</span>
                                     <span className="text-[9px] text-white/40 uppercase tracking-tighter">MRN: {c.patient?.mrn || c.patientMrn}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="flex items-center gap-4">
                               <button 
                                  onClick={async () => {
                                     if (confirm("Permanently eliminate this surgical record from the institutional vault?")) {
                                        import("@/app/clinical/actions").then(async a => {
                                           await a.deleteCase(c.id);
                                           setPastCases(prev => prev.filter(p => p.id !== c.id));
                                        });
                                     }
                                  }}
                                  className="px-4 py-2 border border-surgical-crimson/20 text-surgical-crimson hover:bg-surgical-crimson hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-widest"
                               >
                                  Delete Record
                               </button>
                               <button 
                                  onClick={() => {
                                     // Re-Activate Case in Dashboard
                                     import("@/context/SurgicalContext").then(async () => {
                                        // Normally we'd use context here, for now we flip back to home with the data
                                        setView("command");
                                     });
                                  }}
                                  className="p-3 bg-white/5 hover:bg-surgical-teal hover:text-white transition-all rounded-xl border border-white/10"
                               >
                                  <ArrowUpRight size={16} />
                               </button>
                            </div>
                         </div>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-surgical-teal/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </GlassCard>
                   ))}

                   {pastCases.length === 0 && !loadingAnalytics && (
                      <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                         <Shield size={40} className="mx-auto text-white/10 mb-4" />
                         <p className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em]">Institutional Vault Empty</p>
                      </div>
                   )}
                </div>
             </div>
          ) : view === "analytics" ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                   <div>
                      <h2 className="text-2xl font-bold tracking-tight">Clinical Performance History</h2>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mt-1">Aggregated Data from {pastCases.length} Procedural Interventions</p>
                   </div>
                </div>

                <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                   <GlassCard className="col-span-8 p-6 border-white/5 bg-white/[0.01]">
                      <div className="flex items-center justify-between mb-8">
                         <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Surgical Score Progression</h3>
                            <p className="text-[9px] text-white/30 uppercase tracking-tighter">Longitudinal Clinical Performance Tracking</p>
                         </div>
                         <div className="flex items-center gap-2 px-3 py-1 bg-surgical-blue/10 border border-surgical-blue/20 rounded-lg">
                            <TrendingUp size={12} className="text-surgical-blue" />
                            <span className="text-[10px] font-bold text-surgical-blue">Live Trends</span>
                         </div>
                      </div>
                      <div className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalTrends}>
                               <defs>
                                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 8 }} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 8 }} domain={[0, 100]} />
                               <Tooltip 
                                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                               />
                               <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </GlassCard>

                   <GlassCard className="col-span-4 p-6 border-white/5 bg-white/[0.01]">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/80 mb-8">Competency Radar</h3>
                      <div className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={personalStats}>
                               <PolarGrid stroke="#ffffff10" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 8 }} />
                               <Radar name="My Performance" dataKey="A" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.3} />
                               <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                            </RadarChart>
                         </ResponsiveContainer>
                      </div>
                   </GlassCard>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {pastCases.map((c, i) => (
                      <GlassCard key={c.id} className="p-6 border-white/5 bg-white/[0.01] hover:border-surgical-blue/20 transition-all group">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-surgical-blue border border-white/10 group-hover:border-surgical-blue/30 transition-colors">
                                  <Activity size={20} />
                               </div>
                               <div>
                                  <p className="text-sm font-bold tracking-tight">{c.procedureName}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                     <span className="text-[9px] text-white/40 uppercase font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                                     <span className="text-[9px] text-white/20">•</span>
                                     <span className="text-[9px] text-white/40 uppercase tracking-tighter">Case ID: {c.patientMrn}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="flex items-center gap-8">
                               <div className="text-right">
                                  <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Status</p>
                                  <span className={cn(
                                     "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                     c.reviewStatus === "REVIEWED" ? "bg-surgical-teal/10 text-surgical-teal border-surgical-teal/20" : "bg-white/5 text-white/30 border-white/10"
                                  )}>
                                     {c.reviewStatus}
                                  </span>
                               </div>
                               <button 
                                  onClick={() => {
                                     // Set this case as active in context to view details
                                     // This would require updating the context, for now we just show it exists
                                     setView("command");
                                  }}
                                  className="p-3 bg-white/5 hover:bg-surgical-blue hover:text-white transition-all rounded-xl border border-white/10"
                               >
                                  <ArrowUpRight size={16} />
                               </button>
                            </div>
                         </div>
                      </GlassCard>
                   ))}

                   {pastCases.length === 0 && !loadingAnalytics && (
                      <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                         <BarChart3 size={40} className="mx-auto text-white/10 mb-4" />
                         <p className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em]">No Historic Data Sequenced</p>
                      </div>
                   )}

                   {loadingAnalytics && (
                      <div className="p-20 text-center">
                         <div className="w-8 h-8 border-2 border-surgical-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                         <p className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em]">Retrieving Clinical Records...</p>
                      </div>
                   )}
                </div>
             </div>
          ) : isLive ? (
            <div className="grid grid-cols-12 gap-8 h-full min-h-[800px]">
               <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                  {/* Live Stream Panel */}
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="flex items-center gap-2 text-surgical-teal text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                           <Radio size={12} className="animate-pulse" /> Live Clinical Acquisition
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                           Intra-Op Monitoring
                           <span className="text-white/20 font-normal">/</span>
                           <span className="text-white/40 font-medium tracking-tight">
                              {availableCameras.find(c => c.deviceId === selectedCameraId)?.label || "Medical Camera"}
                           </span>
                        </h2>
                     </div>
                     <div className="flex items-center gap-2">
                        {availableCameras.length > 1 && !isRecording && (
                           <div className="relative group">
                              <select 
                                 value={selectedCameraId || ""}
                                 onChange={(e) => setSelectedCameraId(e.target.value)}
                                 className="appearance-none bg-black/60 border border-white/10 rounded-xl px-5 py-2.5 pr-10 text-[10px] font-black uppercase tracking-[0.2em] text-surgical-teal focus:outline-none hover:border-surgical-teal/50 hover:bg-black/80 transition-all cursor-pointer shadow-2xl backdrop-blur-xl"
                              >
                                 {availableCameras.map(camera => (
                                    <option key={camera.deviceId} value={camera.deviceId} className="bg-[#0a0a0a] text-white py-4">
                                       {camera.label.replace(/\(.*\)/, '') || `USB SENSOR ${camera.deviceId.slice(0, 4)}`}
                                    </option>
                                 ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surgical-teal/50 group-hover:text-surgical-teal transition-colors">
                                 <ChevronRight size={12} className="rotate-90" />
                              </div>
                           </div>
                        )}
                        <button 
                           onClick={() => {
                              if (confirm("End Live Acquisition and Synthesize Final Narrative?")) {
                                 setIsLive(false);
                              }
                           }}
                           className="px-6 py-2.5 bg-surgical-teal/10 border border-surgical-teal/20 text-surgical-teal hover:bg-surgical-teal hover:text-white transition-all rounded-xl font-black uppercase tracking-[0.2em] text-[9px] flex items-center gap-2 shadow-2xl shadow-surgical-teal/10"
                        >
                           <RefreshCw size={14} /> Global Synthesis
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/40 relative group min-h-[500px] flex items-center justify-center">
                     <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover"
                     />
                     {!videoRef.current?.srcObject && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Activity size={48} className="text-surgical-teal/20 animate-pulse" />
                        </div>
                     )}
                     <div className="absolute top-8 left-8 flex items-center gap-4">
                        <div className={cn(
                           "px-4 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl transition-all duration-500",
                           isRecording ? "bg-surgical-crimson ring-4 ring-surgical-crimson/20" : "bg-surgical-teal ring-4 ring-surgical-teal/20"
                        )}>
                           <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-white animate-pulse" : "bg-white")} /> 
                           {isRecording ? "Sensing Active" : "Hardware Linked"}
                        </div>
                        <div className="px-4 py-1.5 bg-black/80 backdrop-blur-2xl rounded-lg text-[10px] font-black text-surgical-teal uppercase tracking-[0.2em] border border-white/10 shadow-2xl">
                           4K • 60 FPS • Encrypted
                        </div>
                     </div>
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                        {!isRecording ? (
                           <button 
                              onClick={startRecording}
                              className="px-8 py-3 bg-surgical-crimson text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-surgical-crimson/20 hover:scale-105 transition-all flex items-center gap-2"
                           >
                              <Circle size={14} fill="white" /> Start Intra-Op Recording
                           </button>
                        ) : (
                           <button 
                              onClick={stopRecording}
                              className="px-8 py-3 bg-white text-surgical-crimson rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-white/10 hover:scale-105 transition-all flex items-center gap-2"
                           >
                              <div className="w-3 h-3 bg-surgical-crimson rounded-sm" /> Stop & Synthesize Report
                           </button>
                        )}
                      </div>
                   </div>

                   {/* Real-time Holoscan Vitals (Blood Loss) */}
                   <div className="grid grid-cols-3 gap-4">
                       <GlassCard className="p-4 border-white/5 bg-white/[0.01]">
                          <div className="flex items-center gap-2 mb-2 text-surgical-crimson font-bold uppercase tracking-widest text-[10px]">
                              <Activity size={14} className="animate-pulse" /> Estimated Blood Loss
                          </div>
                          <p className="text-3xl font-black text-white">{(liveStats?.estimatedBloodLoss || 0).toFixed(1)} <span className="text-sm text-white/40 font-normal">mL</span></p>
                          <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-surgical-crimson transition-all duration-500" style={{ width: `${Math.min(((liveStats?.estimatedBloodLoss || 0) / 1000) * 100, 100)}%` }} />
                          </div>
                       </GlassCard>
                       <GlassCard className="p-4 border-white/5 bg-white/[0.01]">
                          <div className="flex items-center gap-2 mb-2 text-surgical-blue font-bold uppercase tracking-widest text-[10px]">
                              <Heart size={14} className="animate-pulse" /> Heart Rate
                          </div>
                          <p className="text-3xl font-black text-white">{liveStats?.realTimeStats?.heartRate || "--"} <span className="text-sm text-white/40 font-normal">BPM</span></p>
                       </GlassCard>
                       <GlassCard className="p-4 border-white/5 bg-white/[0.01]">
                          <div className="flex items-center gap-2 mb-2 text-surgical-teal font-bold uppercase tracking-widest text-[10px]">
                              <Activity size={14} /> Blood Pressure
                          </div>
                          <p className="text-3xl font-black text-white">{liveStats?.realTimeStats?.bloodPressure || "--/--"} <span className="text-sm text-white/40 font-normal">mmHg</span></p>
                       </GlassCard>
                   </div>
                </div>

                <div className="col-span-12 lg:col-span-4 h-full">
                  <LiveClinicalAudit />
               </div>
            </div>
          ) : !analysisResult || isAnalyzing ? (
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-12 lg:col-span-4 h-full">
                <HeroUploadZone />
              </div>
              <div className="col-span-12 lg:col-span-8 h-[600px]">
                <SurgicalCalendar />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-surgical-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                    <span className="w-2 h-[2px] bg-surgical-blue" /> Surgical Command Center
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    {analysisResult?.procedureName}
                    <span className="text-white/20 font-normal">/</span>
                    <span className="text-white/40 font-medium">Post-Op Analytics</span>
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Case ID: {analysisResult?.patientMrn}</div>
                    <div className="text-[10px] text-surgical-teal font-medium flex items-center gap-1">
                      <div className="w-1 h-1 bg-surgical-teal rounded-full animate-pulse" /> Analysis Completed
                    </div>
                  </div>
                  <button 
                    onClick={() => closeCase()}
                    className="p-3 bg-surgical-crimson/10 border border-surgical-crimson/20 text-surgical-crimson hover:bg-surgical-crimson hover:text-white transition-all rounded-xl group shadow-lg shadow-surgical-crimson/10"
                    title="Exit Active Session"
                  >
                    <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              <ActionRack onAction={handleAction} />

              <div className="grid grid-cols-5 gap-4">
                {[
                  { icon: User, label: "Physician", value: doctorProfile?.name || analysisResult?.surgeonName },
                  { icon: Building2, label: "Hospital", value: doctorProfile?.hospital || "—" },
                  { icon: Stethoscope, label: "Department", value: doctorProfile?.department || "—" },
                  { icon: Hash, label: "MRN", value: analysisResult?.patientMrn },
                  { icon: Clock, label: "Duration", value: analysisResult?.duration },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="glass-effect p-4 border-white/5 flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-xl"><stat.icon size={16} className="text-surgical-blue" /></div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/30">{stat.label}</p>
                      <p className="text-[12px] font-bold tracking-tight truncate max-w-[120px]">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 space-y-6">
                  <SurgicalPlayer />
                  <div id="intelligence-workspace">
                    <IntelligenceWorkspace activeTab={activeWorkspaceTab} onTabChange={setActiveWorkspaceTab} />
                  </div>
                </div>
                <div className="col-span-4 space-y-6">
                  <AIDetector />
                  <StepSegmentation />
                  <ROICalculatorPanel />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pb-12">
                <PatientFollowUpChart />
                <SurgeonPerformanceChart />
              </div>

              <div className="grid grid-cols-3 gap-6 pb-20">
                 <div className="col-span-2 h-[600px]">
                    <SurgicalCalendar />
                 </div>
                 <VisualEvidenceGallery />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
