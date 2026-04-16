"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, Search, ArrowRight, UserPlus, Heart, Activity, Shield, Hash, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPatients, createPatient } from "../clinical/actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSurgical } from "@/context/SurgicalContext";
import { useRouter } from "next/navigation";

export default function PatientRegistry() {
  const { setLastRegisteredPatient } = useSurgical();
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPatients() {
    const data = await getPatients();
    setPatients(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createPatient(formData);
      if (result.success) {
        setLastRegisteredPatient(result.patient);
        setShowAdd(false);
        router.push("/?prompt=true");
      } else {
        setError(result.error || "Failed to commit record to database.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-surgical-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                 <span className="w-2 h-[2px] bg-surgical-blue" /> Institutional Registry
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Clinical Patient Database</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono italic">Longitudinal Clinical History • {patients.length} Registered Identites</p>
            </div>
            <button onClick={() => { setShowAdd(true); setError(null); }} className="bg-surgical-blue px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-all flex items-center gap-2 shadow-lg shadow-surgical-blue/20">
               <UserPlus size={14} /> Register New Acquisition
            </button>
          </div>

          <GlassCard className="p-4 border-white/5 bg-white/[0.01]">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-surgical-blue transition-colors" size={18} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Digital Health Records (Name, MRN)..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all placeholder:text-white/10" 
              />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 gap-4 pb-12">
            {loading ? (
               <div className="p-20 text-center text-white/10 uppercase tracking-[0.5em] animate-pulse text-xs italic">Syncing Clinical Repository...</div>
            ) : (
              filtered.map((patient, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={patient.id}>
                  <Link href={`/patients/${patient.id}`}>
                    <GlassCard className="p-6 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-surgical-blue/20 transition-all group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-surgical-blue/10 group-hover:text-surgical-blue transition-all border border-transparent group-hover:border-surgical-blue/20">
                              <Users size={28} />
                           </div>
                           <div>
                              <p className="text-[17px] font-bold text-white/90 group-hover:text-surgical-blue transition-colors">{patient.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                 <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">{patient.mrn}</p>
                                 <span className="text-white/10 text-[10px]">•</span>
                                 <p className="text-[9px] text-surgical-teal font-bold uppercase tracking-widest">{patient.gender || "Gender Unspecified"} • {patient.age || "??"} YRS</p>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-12">
                           <div className="text-right">
                              <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1 font-bold">Interventions</p>
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                                 <Activity size={10} className="text-surgical-blue" />
                                 <span className="text-[10px] font-mono font-bold">{patient._count?.cases || 0}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1 font-bold">Coverage</p>
                              <span className="text-[9px] font-extrabold uppercase py-1 px-2 rounded-md bg-surgical-teal/5 border border-surgical-teal/20 text-surgical-teal">
                                 {patient.insuranceProvider || "Direct Pay"}
                              </span>
                           </div>
                           <div className="p-3 rounded-xl bg-white/5 text-white/20 group-hover:bg-surgical-blue group-hover:text-white transition-all group-hover:scale-105 active:scale-95 shadow-lg">
                              <ArrowRight size={20} />
                           </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-20 text-center text-white/10 uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-3xl">Scanning clinical records... Zero Matches Found</div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <GlassCard className="w-[520px] p-8 border-white/10 bg-surgical-dark shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-surgical-blue to-surgical-teal" />
                   
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-surgical-blue/10 text-surgical-blue rounded-xl shadow-inner"><UserPlus size={20} /></div>
                         <div>
                            <h3 className="text-lg font-bold uppercase tracking-widest text-white/80">Clinical Acquisition</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-tighter">Onboard digital health record</p>
                         </div>
                      </div>
                      <button onClick={() => setShowAdd(false)} className="bg-white/5 p-2 rounded-lg text-white/20 hover:text-white hover:bg-surgical-crimson/20 transition-all">✕</button>
                   </div>
                   
                   <form onSubmit={handleCreate} className="space-y-5">
                      <AnimatePresence>
                        {error && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-surgical-crimson/10 border border-surgical-crimson/20 p-4 rounded-xl flex items-center gap-3 mb-2 animate-pulse">
                             <div className="w-1.5 h-1.5 bg-surgical-crimson rounded-full" />
                             <span className="text-[10px] font-bold text-surgical-crimson uppercase tracking-widest">{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Full Legal Identity</label>
                           <input name="name" required placeholder="E.G. HAROLD FINCH" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none shadow-inner" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">MRN Status</label>
                                 <button 
                                    type="button"
                                    onClick={(e) => {
                                       const input = (e.currentTarget.parentElement?.nextElementSibling as HTMLInputElement);
                                       if (input) input.value = `MRN-${Math.floor(Math.random() * 90000) + 10000}`;
                                    }}
                                    className="text-[9px] font-bold text-surgical-blue uppercase tracking-widest hover:text-white transition-all"
                                 >
                                    Auto-Generate
                                 </button>
                              </div>
                              <input name="mrn" required placeholder="MRN-XXXXX" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none shadow-inner font-mono" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Age (YRS)</label>
                              <input name="age" type="number" required placeholder="42" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none shadow-inner" />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Gender</label>
                              <select name="gender" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white/80 outline-none">
                                 <option value="MALE" className="bg-surgical-dark">MALE</option>
                                 <option value="FEMALE" className="bg-surgical-dark">FEMALE</option>
                                 <option value="NON-BINARY" className="bg-surgical-dark">NON-BINARY</option>
                                 <option value="OTHER" className="bg-surgical-dark">OTHER</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Blood Registry</label>
                              <select name="bloodGroup" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white/80 outline-none">
                                 {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                                    <option key={bg} value={bg} className="bg-surgical-dark">{bg}</option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Insurance Provider / Coverage</label>
                           <input name="insuranceProvider" placeholder="E.G. BLUE CROSS / PRIVATE" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none shadow-inner" />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl text-[11px] font-extrabold uppercase tracking-[0.2em] shadow-lg shadow-surgical-blue/20 mt-4 transition-all flex items-center justify-center gap-3 overflow-hidden group ${isSubmitting ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' : 'bg-surgical-blue text-white hover:bg-surgical-blue/90 active:scale-[0.98]'}`}
                      >
                         {isSubmitting ? (
                            <div className="flex items-center gap-2">
                               <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                               <span>Committing Record...</span>
                            </div>
                         ) : (
                            <>
                               <span>Authorize Digital Ingestion</span>
                               <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </>
                         )}
                      </button>
                   </form>
                </GlassCard>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
