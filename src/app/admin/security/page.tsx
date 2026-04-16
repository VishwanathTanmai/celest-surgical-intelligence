"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldCheck, History, Shield, Lock, Terminal, Activity, FileText, UserPlus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuditLogs } from "@/app/clinical/actions";
import { cn } from "@/lib/utils";

const ACTION_ICONS: any = {
  "LOGIN": Lock,
  "CASE_UPLOAD": Activity,
  "INVENTORY_CHANGE": History,
  "DOCTOR_INVITE": UserPlus,
  "PATIENT_CREATE": FileText,
  "APPOINTMENT_CREATE": History,
};

export default function SecurityAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAuditLogs();
      setLogs(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-surgical-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                 <span className="w-2 h-[2px] bg-surgical-blue" /> Administrative Compliance
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Security & Audit Hub</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Immutable System Traceability • {logs.length} Live Events</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="bg-surgical-blue/10 border border-surgical-blue/20 px-4 py-2 rounded-xl flex items-center gap-2">
                  <Shield size={14} className="text-surgical-blue" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-surgical-blue">HIPAA Compliant</span>
               </div>
               <button className="bg-white/5 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all flex items-center gap-2 text-white/40 hover:text-white">
                  <Terminal size={14} /> Export Logs (.PDF)
               </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
             {[
               { icon: Lock, label: "Logins", value: logs.filter(l => l.action === "LOGIN").length, color: "text-surgical-blue" },
               { icon: Activity, label: "Acquisitions", value: logs.filter(l => l.action === "CASE_UPLOAD").length, color: "text-surgical-teal" },
               { icon: ShieldCheck, label: "System Health", value: "Optimal", color: "text-white" },
               { icon: History, label: "Active Audit", value: "Live", color: "text-surgical-blue" },
             ].map((stat, i) => (
               <GlassCard key={i} className="p-6 border-white/5 bg-white/[0.01]">
                  <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="flex items-center justify-between">
                     <p className="text-2xl font-bold">{stat.value}</p>
                     <stat.icon size={18} className={stat.color} />
                  </div>
               </GlassCard>
             ))}
          </div>

          <GlassCard className="p-0 border-white/5 bg-white/[0.01] overflow-hidden">
             <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                   <Terminal size={16} className="text-surgical-blue" />
                   System Event Stream
                </h3>
                <span className="text-[9px] font-mono text-white/20 uppercase">Last updated: Just Now</span>
             </div>
             
             {loading ? (
                <div className="p-20 text-center text-white/5 uppercase tracking-[0.4em] animate-pulse text-xs">Decrypting Audit Logs...</div>
             ) : (
                <div className="divide-y divide-white/5">
                   {logs.map((log, i) => {
                      const Icon = ACTION_ICONS[log.action] || Info;
                      return (
                         <div key={log.id} className="flex items-center gap-6 p-5 hover:bg-white/[0.02] transition-colors group">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-surgical-blue/10 group-hover:text-surgical-blue transition-colors shrink-0">
                               <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between mb-1">
                                  <p className="text-[12px] font-bold text-white/90">{log.action.replace(/_/g, ' ')}</p>
                                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{new Date(log.createdAt).toLocaleString()}</span>
                               </div>
                               <p className="text-[11px] text-white/40 line-clamp-1">{log.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                               <p className="text-[10px] font-bold text-white/60 mb-0.5">{log.user?.name || "System"}</p>
                               <span className="text-[8px] font-mono text-surgical-blue uppercase bg-surgical-blue/5 px-2 py-0.5 rounded border border-surgical-blue/10">Authorized</span>
                            </div>
                         </div>
                      );
                   })}
                   {logs.length === 0 && (
                      <div className="p-20 text-center text-white/10 uppercase tracking-widest text-[10px] italic">Traceability Event Stream is Idle</div>
                   )}
                </div>
             )}
          </GlassCard>
        </main>
      </div>
    </div>
  );
}
