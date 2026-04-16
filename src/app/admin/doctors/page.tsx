"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, Activity, TrendingUp, Clock, ChevronRight, BarChart3, Star, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getHospitalDoctors } from "@/app/clinical/actions";
import { cn } from "@/lib/utils";

export default function DoctorOversight() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getHospitalDoctors();
      setDoctors(data);
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
          <div>
            <div className="flex items-center gap-2 text-surgical-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
               <span className="w-2 h-[2px] bg-surgical-blue" /> Administrative Oversight
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Practitioner Performance</h1>
            <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Real-Time Clinical Success Mapping • {doctors.length} Physicians</p>
          </div>

          {loading ? (
             <div className="p-20 text-center text-white/5 uppercase tracking-[0.5em] animate-pulse text-xs">Syncing Performance Data...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
               {doctors.map((doc, i) => (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={doc.id}>
                     <GlassCard className="p-8 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                           <Activity size={120} />
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                           <div className="flex gap-8">
                              <div className="w-20 h-20 rounded-3xl bg-surgical-blue/10 border border-surgical-blue/20 flex items-center justify-center text-surgical-blue text-2xl font-bold">
                                 {doc.name?.[0]}
                              </div>
                              <div>
                                 <h3 className="text-xl font-bold mb-2">{doc.name}</h3>
                                 <div className="flex items-center gap-6 mb-4">
                                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                                       <Calendar size={14} className="text-surgical-blue" /> Registered: {new Date(doc.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                                       <Activity size={14} className="text-surgical-teal" /> Hospital: Staff Physician
                                    </div>
                                 </div>
                                 <div className="flex gap-4">
                                    <div className="px-3 py-1 bg-white/5 rounded-md border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-widest">General Surgery</div>
                                    <div className="px-3 py-1 bg-surgical-teal/10 rounded-md border border-surgical-teal/20 text-[9px] font-bold text-surgical-teal uppercase tracking-widest">Active Status</div>
                                 </div>
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-12 text-right">
                              <div>
                                 <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Total Cases</p>
                                 <p className="text-3xl font-mono font-bold text-white/90">{doc._count?.cases || 0}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Success</p>
                                 <p className="text-3xl font-mono font-bold text-surgical-teal">98<span className="text-xs">%</span></p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Peer Rating</p>
                                 <div className="flex items-center justify-end gap-1">
                                    <Star size={18} className="text-surgical-blue fill-surgical-blue" />
                                    <p className="text-3xl font-mono font-bold text-white/90 underline decoration-surgical-blue">4.9</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                           <div className="flex gap-12">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 rounded-lg bg-white/5 text-white/30"><Clock size={14} /></div>
                                 <div>
                                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Avg Procedure</p>
                                    <p className="text-[11px] font-bold">42 MINS</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="p-2 rounded-lg bg-white/5 text-white/30"><TrendingUp size={14} /></div>
                                 <div>
                                    <p className="text-[9px] text-white/20 uppercase tracking-widest">Efficiency</p>
                                    <p className="text-[11px] font-bold">+12.4%</p>
                                 </div>
                              </div>
                           </div>
                           <button className="flex items-center gap-2 group/btn px-4 py-2 hover:bg-white/5 rounded-xl transition-all">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover/btn:text-surgical-blue transition-colors">Case History</span>
                              <ChevronRight size={14} className="text-white/20 group-hover/btn:text-surgical-blue" />
                           </button>
                        </div>
                     </GlassCard>
                  </motion.div>
               ))}
               {doctors.length === 0 && (
                 <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/10 uppercase tracking-widest text-xs">Awaiting Practitioner Enrollment</div>
               )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Calendar(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  );
}
