"use client";

import { useState, useCallback, useEffect } from "react";
import { useSurgical } from "@/context/SurgicalContext";
import { Upload, FileVideo, Sparkles, Shield, Activity, Users, Search, ChevronRight, Camera, Image as ImageIcon, X, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { getPatients } from "@/app/clinical/actions";
import { useSearchParams } from "next/navigation";

export function HeroUploadZone() {
  const { 
     startAnalysis, isAnalyzing, videoUrl, isOverMonthlyLimit, quotaCount, error, clearError, analysisResult, 
     lastRegisteredPatient, setLastRegisteredPatient,
     isLive, setIsLive, setSurgicalState, setLiveScribe,
     setRecordingPatientId
  } = useSurgical();
  const searchParams = useSearchParams();
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"patient" | "upload">("patient");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [acquisitionType, setAcquisitionType] = useState<"video" | "manual">("video");
  const [manualScreenshots, setManualScreenshots] = useState<string[]>([]);

  // Automated Handover Protocol
  useEffect(() => {
    const shouldPrompt = searchParams.get("prompt") === "true";
    if (shouldPrompt && lastRegisteredPatient) {
      setSelectedPatient(lastRegisteredPatient);
      setStep("upload");
    }
  }, [searchParams, lastRegisteredPatient]);

  const startLiveProcedure = () => {
     if (!selectedPatient) return;
     setIsLive(true);
     setRecordingPatientId(selectedPatient.id);
     setSurgicalState({
        phase: 1,
        landmarks: [],
        activeTools: {},
        lastSummary: "Awaiting Intra-Op Hardware Feed..."
     });
     setLiveScribe([]);
  };

  useEffect(() => {
    async function fetchPatients() {
      const data = await getPatients();
      setPatients(data);
      setLoading(false);
    }
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setStep("upload");
  };

  const captureScreenshots = async (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const screenshots: string[] = [];
      const capturePoints = Array.from({ length: 12 }, (_, i) => (i + 1) / 13);
      let pointIndex = 0;

      video.src = URL.createObjectURL(file);
      video.load();
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const captureNext = () => {
          if (pointIndex >= capturePoints.length) {
            URL.revokeObjectURL(video.src);
            resolve(screenshots);
            return;
          }
          video.currentTime = video.duration * capturePoints[pointIndex];
        };

        video.onseeked = () => {
          context?.drawImage(video, 0, 0, canvas.width, canvas.height);
          screenshots.push(canvas.toDataURL("image/jpeg", 0.7));
          pointIndex++;
          captureNext();
        };

        captureNext();
      };
    });
  };

  const handleUpload = async (file: File) => {
    if (isOverMonthlyLimit || !selectedPatient) return;
    const screenshots = await captureScreenshots(file);
    await startAnalysis(file, selectedPatient.id, screenshots);
  };

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (isOverMonthlyLimit) return;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "video/mp4") await handleUpload(file);
  }, [isOverMonthlyLimit, selectedPatient]);

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "video/mp4") await handleUpload(file);
  };

  if (videoUrl && analysisResult && !isAnalyzing) return null;
  if (isLive) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative w-full max-w-2xl rounded-3xl border-2 border-dashed p-12 transition-all duration-500",
          isDragging ? "border-surgical-blue bg-surgical-blue/5 scale-[1.02]" : "border-white/10 bg-white/[0.01]",
          error ? "border-surgical-crimson/30" : ""
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 z-10 px-12 text-center">
              <div className="w-20 h-20 rounded-full bg-surgical-crimson/10 border border-surgical-crimson/30 flex items-center justify-center text-surgical-crimson animate-pulse">
                <Activity size={32} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-2 font-mono">Ingestion Failed</h3>
              <p className="text-white/40 text-[11px] leading-relaxed max-w-[400px] font-mono">{error}</p>
              <button onClick={clearError} className="px-5 py-2 glass-effect text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">Dismiss & Retry</button>
            </motion.div>
          ) : isOverMonthlyLimit ? (
            <motion.div key="overload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 z-10 text-center">
              <Shield size={48} className="text-surgical-crimson/40" />
              <h3 className="text-xl font-bold text-white/60">Monthly Quota Reached ({quotaCount}/50)</h3>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 z-10">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-surgical-teal/20 border-t-surgical-teal rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-surgical-teal" size={28} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Synthesizing Surgical Intelligence</h3>
                <p className="text-white/30 text-[11px] uppercase tracking-widest font-mono italic animate-pulse">Multimodal Frame Analysis • Gemini Pro Active</p>
              </div>
            </motion.div>
          ) : step === "patient" ? (
            <motion.div key="patient" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center gap-6">
               <div className="text-center w-full">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-surgical-blue/10 border border-surgical-blue/20 flex items-center justify-center text-surgical-blue">
                       <Users size={28} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-1">Select Surgical Patient</h3>
                  <p className="text-white/30 text-[11px] uppercase tracking-widest font-mono mb-8">Target Live Hospital Registry</p>
                  
                  <div className="relative mb-6">
                     <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                     <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Active MRNs..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-surgical-blue/50 transition-all font-mono uppercase tracking-widest text-xs" 
                     />
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                     {loading ? (
                        <div className="p-12 text-center text-white/10 uppercase tracking-widest text-[10px] animate-pulse">Syncing Patients...</div>
                     ) : (
                        filteredPatients.map(p => (
                          <button key={p.id} onClick={() => handlePatientSelect(p)} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-surgical-blue/30 hover:bg-white/[0.08] transition-all group text-left">
                             <div>
                                <p className="text-[13px] font-bold group-hover:text-surgical-blue transition-colors">{p.name}</p>
                                <p className="text-[9px] text-white/30 font-mono uppercase tracking-[0.2em]">{p.mrn}</p>
                             </div>
                             <ChevronRight size={16} className="text-white/10 group-hover:text-surgical-blue transition-colors" />
                          </button>
                        ))
                     )}
                     {!loading && filteredPatients.length === 0 && (
                        <p className="p-8 text-center text-white/10 uppercase tracking-widest text-[10px]">No Registered Patients Found</p>
                     )}
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 z-10">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <FileVideo size={32} className="text-white/20" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold tracking-tight text-white mb-1">Upload Surgical Acquisition</h3>
                <div className="flex flex-col items-center gap-2">
                   <p className="text-white/30 text-[11px] uppercase tracking-widest font-mono">Target: {selectedPatient?.name} • {selectedPatient?.mrn}</p>
                   {lastRegisteredPatient?.id === selectedPatient?.id && (
                      <span className="text-[9px] font-black text-surgical-teal bg-surgical-teal/10 px-2 py-0.5 rounded-md border border-surgical-teal/20 uppercase tracking-widest animate-pulse">New Acquisition Linked</span>
                   )}
                </div>
              </div>
              <label className="cursor-pointer bg-surgical-blue px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-all flex items-center gap-2 shadow-lg shadow-surgical-blue/20">
                <Upload size={16} /> Select .MP4 File
                <input type="file" accept="video/mp4" className="hidden" onChange={onFileSelect} />
              </label>
              
              <button 
                onClick={startLiveProcedure}
                className="mt-4 px-8 py-3 rounded-xl border border-surgical-teal/30 bg-surgical-teal/5 text-surgical-teal font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-teal hover:text-white transition-all flex items-center gap-2"
              >
                <Radio size={16} className="animate-pulse" /> Start Live Acquisition
              </button>
              <button 
                onClick={() => {
                  setLastRegisteredPatient(null);
                  setStep("patient");
                }} 
                className="text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                ← Back to Registry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step === "upload" && !isAnalyzing && !error && (
           <div className="absolute top-6 left-6 flex items-center gap-2">
              <button 
                 onClick={() => setAcquisitionType("video")}
                 className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    acquisitionType === "video" ? "bg-surgical-blue text-white" : "bg-white/5 text-white/40"
                 )}
              >
                 MP4 Stream
              </button>
              <button 
                 onClick={() => setAcquisitionType("manual")}
                 className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    acquisitionType === "manual" ? "bg-surgical-teal text-white" : "bg-white/5 text-white/40"
                 )}
              >
                 Evidence Pack
              </button>
           </div>
        )}
      </motion.div>

      {acquisitionType === "manual" && step === "upload" && manualScreenshots.length > 0 && !isAnalyzing && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mt-6 grid grid-cols-4 gap-4">
            {manualScreenshots.map((src, i) => (
               <div key={i} className="relative aspect-video rounded-xl border border-white/10 overflow-hidden group">
                  <img src={src} className="w-full h-full object-cover" />
                  <button 
                     onClick={() => setManualScreenshots(prev => prev.filter((_, idx) => idx !== i))}
                     className="absolute top-1 right-1 p-1 bg-surgical-crimson text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                     <X size={10} />
                  </button>
               </div>
            ))}
            {manualScreenshots.length < 12 && (
               <label className="aspect-video rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-pointer text-white/20 hover:text-white/40">
                  <Camera size={18} />
                  <span className="text-[8px] font-bold uppercase">Add Frame</span>
                  <input 
                     type="file" 
                     multiple 
                     accept="image/*" 
                     className="hidden" 
                     onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(f => {
                           const reader = new FileReader();
                           reader.onload = (ev) => setManualScreenshots(prev => [...prev, ev.target?.result as string]);
                           reader.readAsDataURL(f);
                        });
                     }} 
                  />
               </label>
            )}
         </motion.div>
      )}

      {acquisitionType === "manual" && manualScreenshots.length > 0 && step === "upload" && !isAnalyzing && (
         <button 
            onClick={() => startAnalysis(null, selectedPatient.id, manualScreenshots)}
            className="mt-6 bg-surgical-teal px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-surgical-teal/20 hover:scale-[1.02] active:scale-95 transition-all text-white flex items-center gap-3"
         >
            <Sparkles size={16} />
            Authorize Clinical Synthesis
         </button>
      )}
    </div>
  );
}
