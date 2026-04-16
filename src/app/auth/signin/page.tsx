"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Building2, User, Mail, Lock, ShieldCheck, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import { signIn, signUpHospital } from "../actions";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTab = (loginState: boolean) => {
    setIsLogin(loginState);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = isLogin ? await signIn(formData) : await signUpHospital(formData);

    if (result?.error) {
       setError(result.error);
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-start p-6 relative py-20">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
         <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
               opacity: [0.1, 0.15, 0.1],
               scale: [1, 1.05, 1],
               y: [0, -20, 0],
               rotate: [0, 5, 0]
            }}
            transition={{ 
               duration: 10,
               repeat: Infinity,
               ease: "easeInOut"
            }}
            className="absolute -right-20 -top-20 w-[600px] h-[600px] opacity-20 blur-[80px] bg-surgical-blue/20 rounded-full"
         />
         <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
               opacity: [0.1, 0.1, 0.1],
               y: [0, 30, 0],
               rotate: [0, -5, 0]
            }}
            transition={{ 
               duration: 15,
               repeat: Infinity,
               ease: "easeInOut"
            }}
            className="absolute -left-20 -bottom-20 w-[500px] h-[500px] opacity-20 blur-[100px] bg-surgical-teal/20 rounded-full"
         />
      </div>

      <div className="container max-w-6xl relative z-10 flex flex-col lg:flex-row items-center justify-center gap-12">
        
        {/* 3D Animated Asset */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:block w-full max-w-md relative"
        >
          <div className="absolute inset-0 bg-surgical-teal/10 blur-[120px] rounded-full animate-pulse" />
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotateY: [0, 10, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10 drop-shadow-[0_0_50px_rgba(48,213,200,0.5)]"
          >
            <img 
              src="/auth-3d.png" 
              alt="Surgical 3D heart" 
              className="w-full h-auto object-contain drop-shadow-2xl brightness-125 saturate-[1.2]"
              onError={(e) => {
                 // High-fidelity fallback to ensure premium 3D presence
                 (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=2000&auto=format&fit=crop";
                 (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop
              }}
            />
          </motion.div>
          <div className="mt-8 text-center">
             <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Advanced Diagnostics</h2>
             <p className="text-[10px] font-mono text-surgical-teal uppercase tracking-[0.4em] mt-2 italic">Real-Time Anatomical Rendering Engine</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="w-full max-w-xl">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-surgical-blue to-surgical-teal flex items-center justify-center shadow-lg shadow-surgical-blue/20">
                  <ShieldCheck className="text-white" size={24} />
               </div>
               <h1 className="text-4xl font-extrabold tracking-tighter text-white">CELEST <span className="text-white/30 font-light">| HUB</span></h1>
            </div>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">Next-Gen Surgical Intelligence Enterprise Suite</p>
          </div>

          <GlassCard className="p-10 border-white/5 bg-white/[0.01] shadow-2xl backdrop-blur-3xl overflow-hidden relative">
            <div className="flex gap-4 mb-10 p-1 bg-white/5 rounded-2xl border border-white/5 relative z-10">
              <button onClick={() => toggleTab(true)} className={cn("flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all", isLogin ? "bg-surgical-blue text-white shadow-lg" : "text-white/40 hover:text-white")}>Portal Access</button>
              <button onClick={() => toggleTab(false)} className={cn("flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all", !isLogin ? "bg-surgical-teal text-white shadow-lg" : "text-white/40 hover:text-white")}>Hospital Registry</button>
            </div>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.form 
                  key={isLogin ? "login" : "signup"} 
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: isLogin ? 20 : -20 }} 
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  {!isLogin && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
                      <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-surgical-teal transition-colors" size={18} />
                        <input name="hospitalName" required placeholder="HOSPITAL NAME" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all placeholder:text-white/10" />
                      </div>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-surgical-teal transition-colors" size={18} />
                        <input name="location" placeholder="LOCATION (CITY/REGION)" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all placeholder:text-white/10" />
                      </div>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-surgical-teal transition-colors" size={18} />
                        <input name="adminName" required placeholder="ADMINISTRATOR NAME" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all placeholder:text-white/10" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-surgical-blue transition-colors" size={18} />
                      <input name="email" type="email" required placeholder="ENTER ACCOUNT EMAIL" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all placeholder:text-white/10" />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-surgical-blue transition-colors" size={18} />
                      <input name="password" type="password" required placeholder="SECRET ACCESS KEY" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all placeholder:text-white/10" />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-bold text-red-500 uppercase tracking-widest text-center animate-shake">
                       Authorization Failed • {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className={cn("w-full py-5 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-3 transition-all", isLogin ? "bg-surgical-blue hover:bg-surgical-blue/90 shadow-lg shadow-surgical-blue/20" : "bg-surgical-teal hover:bg-surgical-teal/90 shadow-lg shadow-surgical-teal/20")}>
                    {loading ? "AUTHENTICATING..." : isLogin ? "VALIDATE ACCESS" : "INITIALIZE REGISTRY"}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </motion.form>
              </AnimatePresence>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5 text-center relative z-10">
               <p className="text-white/20 text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Stethoscope size={12} /> HIPAA-Compliant Surgical Intelligence Network
               </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
;
}
