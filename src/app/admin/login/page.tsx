"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, Lock, Layout, UserPlus, Info } from "lucide-react";
import { signIn, signUpHospital } from "../../auth/actions";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const [isRegistry, setIsRegistry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = isRegistry ? await signUpHospital(formData) : await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surgical-dark flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-surgical-blue/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-surgical-teal/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-surgical-blue/10 text-surgical-blue rounded-2xl shadow-xl shadow-surgical-blue/10 border border-surgical-blue/20">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center">
            CELEST <span className="text-white/20 ml-2 font-light">COMMAND</span>
          </h1>
        </div>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-mono">Next-Gen Surgical Intelligence Portal</p>
      </motion.div>

      <GlassCard className="w-full max-w-[480px] p-10 border-white/10 bg-white/[0.02] backdrop-blur-2xl transition-all z-10 shadow-2xl overflow-hidden">
        <div className="flex bg-white/5 p-1.5 rounded-2xl mb-10 gap-1.5">
          <button
            onClick={() => { setIsRegistry(false); setError(null); }}
            className={cn(
              "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all outline-none",
              !isRegistry ? "bg-surgical-blue text-white shadow-lg shadow-surgical-blue/20" : "text-white/40 hover:text-white/60"
            )}
          >
            Portal Access
          </button>
          <button
            onClick={() => { setIsRegistry(true); setError(null); }}
            className={cn(
              "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all outline-none",
              isRegistry ? "bg-surgical-teal text-white shadow-lg shadow-surgical-teal/20" : "text-white/40 hover:text-white/60"
            )}
          >
            Hospital Registry
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isRegistry ? "registry" : "access"}
            initial={{ opacity: 0, x: isRegistry ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegistry ? -20 : 20 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-surgical-crimson/10 border border-surgical-crimson/20 rounded-xl flex items-start gap-3">
                <Info size={16} className="text-surgical-crimson mt-0.5" />
                <p className="text-[10px] text-surgical-crimson font-bold uppercase tracking-widest leading-relaxed">{error}</p>
              </motion.div>
            )}

            {isRegistry && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Institutional Identity</label>
                  <input name="hospitalName" required placeholder="HOSPITAL NAME" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all placeholder:text-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Institutional Location</label>
                  <input name="location" placeholder="CITY, COUNTRY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all placeholder:text-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Primary Administrator</label>
                  <input name="adminName" required placeholder="FULL NAME" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all placeholder:text-white/10" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Credential Email</label>
              <input name="email" type="email" required placeholder="ADMIN@INSTITUTION.COM" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all placeholder:text-white/10" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Secret Access Key</label>
                {!isRegistry && <button type="button" className="text-[9px] text-surgical-blue font-bold uppercase tracking-widest hover:underline">Forgot Key?</button>}
              </div>
              <div className="relative group">
                <input name="password" type="password" required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold tracking-[0.2em] focus:outline-none focus:border-surgical-blue/50 transition-all placeholder:text-white/10" />
                <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-surgical-blue/50 transition-all" />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={cn(
                "w-full py-4 rounded-xl text-[11px] font-extrabold uppercase tracking-[0.2em] mt-6 transition-all shadow-xl flex items-center justify-center gap-2",
                isRegistry
                  ? "bg-surgical-teal hover:bg-surgical-teal/90 shadow-surgical-teal/20"
                  : "bg-surgical-blue hover:bg-surgical-blue/90 shadow-surgical-blue/20",
                loading && "opacity-50 cursor-not-allowed animate-pulse"
              )}
            >
              {loading ? "Validating..." : isRegistry ? "Initialize Registry" : "Authorize Entry"}
            </button>
          </motion.form>
        </AnimatePresence>
      </GlassCard>

      <div className="mt-12 flex items-center gap-8 text-white/20 select-none z-10">
        <div className="flex items-center gap-2"><Layout size={14} /><span className="text-[10px] font-mono tracking-widest">ENTERPRISE 2.5</span></div>
        <div className="flex items-center gap-2"><Lock size={14} /><span className="text-[10px] font-mono tracking-widest">FIPS COMPLIANT</span></div>
      </div>
    </div>
  );
}
