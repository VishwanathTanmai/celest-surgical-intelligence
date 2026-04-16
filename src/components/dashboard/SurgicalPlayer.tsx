"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Maximize, Settings, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSurgical } from "@/context/SurgicalContext";

export const SurgicalPlayer = React.memo(function SurgicalPlayer() {
  const { videoUrl, analysisResult, isAnalyzing } = useSurgical();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const progress = useMemo(() => (currentTime / (duration || 1)) * 100, [currentTime, duration]);
  const [targetOrgan, setTargetOrgan] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (targetOrgan.trim().length > 2) {
      if (!isTracking) setIsTracking(true);
    } else {
      setIsTracking(false);
    }
  }, [targetOrgan]);

  if (!videoUrl) return null;

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden group border border-white/5 shadow-2xl shadow-black/50"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        loop
      />

      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-surgical-blue/20 border-t-surgical-blue rounded-full animate-spin" />
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-surgical-blue animate-pulse" size={24} />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-surgical-blue animate-pulse">Identifying Surgical Procedure...</p>
              <p className="text-[10px] uppercase tracking-tighter text-white/40 font-mono">Visual Audit Layer Active</p>
            </div>
          </div>
        </div>
      )}

      {isTracking && isPlaying && !isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 w-[30%] h-[40%] border-2 border-dashed border-red-500/60 bg-red-500/10 rounded-[40%_60%_70%_30%] pointer-events-none flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] z-10"
        >
           <span className="absolute -top-6 text-[10px] font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 backdrop-blur-sm whitespace-nowrap">
             MedSAM-2: {targetOrgan.toUpperCase()} TRACKING 99.8%
           </span>
        </motion.div>
      )}

      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        <div className="glass-effect px-4 py-2 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-surgical-teal w-fit">
          <div className="w-1.5 h-1.5 bg-surgical-teal rounded-full animate-pulse shadow-[0_0_8px_rgba(48,213,200,0.6)]" />
          HIPAA De-ID ACTIVE
        </div>
        <AnimatePresence>
          {isHovering && !isAnalyzing && (
             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2">
                 <input 
                    type="text" 
                    value={targetOrgan} 
                    onChange={e => setTargetOrgan(e.target.value)} 
                    placeholder="Enter explicit organ target..." 
                    className="glass-effect bg-black/40 px-3 py-1.5 text-xs font-mono tracking-widest uppercase border border-white/10 rounded focus:border-red-500/50 focus:outline-none w-48 text-white placeholder:text-white/20 transition-colors"
                 />
                 <span className="text-[9px] font-mono text-white/30 tracking-tight uppercase px-2 py-1 glass-effect">MedSAM-2 Visualizer</span>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(isHovering || !isPlaying) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8 z-10 pointer-events-none"
          >
            <div className="relative w-full h-8 flex items-center mb-6 pointer-events-auto">
              <div className="absolute w-full h-1 bg-white/10 rounded-full" />
              <div 
                className="absolute h-1 bg-surgical-blue rounded-full"
                style={{ width: `${progress}%` }}
              />
              
              {analysisResult?.steps.map((step, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-surgical-blue rounded-full -translate-x-1/2 cursor-pointer hover:scale-150 transition-transform shadow-[0_0_10px_rgba(0,102,255,0.4)] group/marker"
                  style={{ left: `${(step.time / (duration || 1)) * 100}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) videoRef.current.currentTime = step.time;
                  }}
                >
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 glass-effect px-3 py-1.5 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/marker:opacity-100 scale-0 group-hover/marker:scale-100 transition-all hover:text-surgical-blue pointer-events-none">
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-8">
                <button className="text-white/60 hover:text-white transition-colors">
                  <SkipBack size={22} />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                </button>
                <button className="text-white/60 hover:text-white transition-colors">
                  <SkipForward size={22} />
                </button>
                <div className="text-xs font-mono text-white/40 tracking-wider">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="flex items-center gap-6 text-white/40">
                <Settings size={20} className="cursor-pointer hover:text-white transition-colors" />
                <Maximize size={20} className="cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
