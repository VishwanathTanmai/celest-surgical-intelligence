"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Users, Activity, Heart, Shield, Clock, Calendar, 
  ChevronRight, ArrowLeft, BarChart3, Archive, 
  MapPin, Stethoscope, User, Hash, TrendingUp,
  ExternalLink, FileText, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPatientById } from "../../clinical/actions";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function PatientDashboard() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await getPatientById(id as string);
      setPatient(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-surgical-dark text-white items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-surgical-blue border-t-transparent rounded-full animate-spin" />
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Sequencing Clinical Identity...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
     return (
        <div className="flex h-screen bg-surgical-dark text-white items-center justify-center">
           <GlassCard className="p-12 text-center border-white/10 max-w-md">
              <AlertCircle size={40} className="mx-auto text-surgical-crimson mb-4" />
              <h1 className="text-xl font-bold uppercase tracking-widest mb-2">Record Not Found</h1>
              <p className="text-sm text-white/40 mb-6">The patient identity could not be retrieved from the institutional database.</p>
              <Link href="/patients" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
                 <ArrowLeft size={14} /> Return to Registry
              </Link>
           </GlassCard>
        </div>
     );
  }

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
          {/* Header & Navigation */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-6">
                <Link href="/patients" className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white border border-white/5 shadow-lg group">
                   <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                  <div className="flex items-center gap-2 text-surgical-blue text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                    <span className="w-2 h-[2px] bg-surgical-blue" /> Clinical Patient Dashboard
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-4">
                     {patient.name}
                     <span className="px-3 py-1 bg-surgical-teal/10 border border-surgical-teal/20 text-surgical-teal text-[10px] rounded-md font-mono">
                        {patient.mrn}
                     </span>
                  </h1>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button className="px-6 py-2.5 bg-surgical-blue text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-surgical-blue/20 hover:bg-surgical-blue/90 transition-all">
                   Manage Record
                </button>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
             {/* Profile Summary Sidebar */}
             <div className="col-span-12 lg:col-span-4 space-y-6">
                <GlassCard className="p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-surgical-blue/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-surgical-blue/10 transition-all duration-700" />
                   
                   <div className="flex flex-col items-center text-center mb-8 relative">
                      <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-surgical-blue shadow-2xl mb-4 group-hover:scale-105 transition-transform duration-500">
                         <Users size={48} />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight">{patient.name}</h2>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mt-1">Acquired {new Date(patient.createdAt).toLocaleDateString()}</p>
                   </div>

                   <div className="space-y-4">
                      {[
                        { icon: User, label: "Identity Meta", value: `${patient.gender || "UNSPECIFIED"} • ${patient.age || "??"} YRS` },
                        { icon: Heart, label: "Blood Type", value: patient.bloodGroup || "O+" },
                        { icon: Shield, label: "Institutional Coverage", value: patient.insuranceProvider || "DIRECT PAY" },
                        { icon: MapPin, label: "Region", value: "Primary Facility Hub" },
                      ].map((meta, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className="p-2 rounded-lg bg-white/5 text-white/40"><meta.icon size={16} /></div>
                            <div>
                               <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">{meta.label}</p>
                               <p className="text-[12px] font-bold tracking-tight">{meta.value}</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </GlassCard>

                {/* Aggregated Stats */}
                <div className="grid grid-cols-2 gap-4">
                   <GlassCard className="p-6 border-white/5 bg-surgical-blue/5">
                      <div className="flex items-center gap-3 mb-4 text-surgical-blue opacity-80">
                         <Activity size={18} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Interventions</span>
                      </div>
                      <p className="text-3xl font-black font-mono">{patient.cases?.length || 0}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-tighter mt-1">Total Procedures</p>
                   </GlassCard>
                   <GlassCard className="p-6 border-white/5 bg-white/[0.01]">
                      <div className="flex items-center gap-3 mb-4 text-surgical-teal opacity-80">
                         <TrendingUp size={18} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Stability</span>
                      </div>
                      <p className="text-3xl font-black font-mono">100<span className="text-base text-white/20 ml-1">%</span></p>
                      <p className="text-[9px] text-white/30 uppercase tracking-tighter mt-1">Case Compliance</p>
                   </GlassCard>
                </div>
             </div>

             {/* Content Timeline / History */}
             <div className="col-span-12 lg:col-span-8 space-y-6">
                <GlassCard className="p-0 border-white/5 bg-white/[0.01] overflow-hidden">
                   <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-surgical-blue/10 text-surgical-blue rounded-xl"><Archive size={18} /></div>
                         <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Surgical Life-Cycle History</h3>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter italic">Total records: {patient.cases?.length || 0}</span>
                   </div>

                   <div className="p-8">
                      {(!patient.cases || patient.cases.length === 0) ? (
                         <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <Clock size={40} className="mx-auto text-white/10 mb-4" />
                            <p className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em]">No Procedural Intervention History</p>
                         </div>
                      ) : (
                         <div className="space-y-12 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-surgical-blue to-white/5" />

                            {patient.cases.map((c: any, i: number) => (
                               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={c.id} className="relative pl-16 group">
                                  {/* Milestone Dot */}
                                  <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-surgical-dark border-[3px] border-surgical-blue group-hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all z-10" />
                                  
                                  <GlassCard className={cn(
                                     "p-6 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all relative overflow-hidden group-hover:border-surgical-blue/20",
                                     c.reviewStatus === "REVIEWED" ? "border-surgical-teal/20" : ""
                                  )}>
                                     {c.reviewStatus === "REVIEWED" && (
                                        <div className="absolute top-0 right-0 p-2 bg-surgical-teal/10 text-surgical-teal">
                                           <CheckCircle2 size={12} />
                                        </div>
                                     )}
                                     
                                     <div className="flex items-start justify-between">
                                        <div className="space-y-4 flex-1">
                                           <div className="flex items-center gap-3">
                                              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40 font-mono">
                                                 {new Date(c.createdAt).toLocaleDateString()}
                                              </span>
                                              <span className="text-surgical-blue text-[10px] font-black uppercase tracking-widest">
                                                 Surgical Intervention
                                              </span>
                                           </div>
                                           <div>
                                              <h4 className="text-xl font-bold tracking-tight text-white/90 group-hover:text-surgical-blue transition-colors">{c.procedureName}</h4>
                                              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mt-1">
                                                 By {c.doctor?.name} • Duration: {c.duration} • Department: {c.doctor?.department}
                                              </p>
                                           </div>
                                           <div className="flex items-center gap-4">
                                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                                 <Hash size={10} className="text-white/20" />
                                                 <span className="text-[9px] font-bold text-white/60">CPT: {c.cptCode}</span>
                                              </div>
                                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                                 <Activity size={10} className="text-surgical-teal" />
                                                 <span className="text-[9px] font-bold text-white/60">Performance: {c.rating ? `${c.rating}%` : "Pending Audit"}</span>
                                              </div>
                                           </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-3 h-full justify-between py-1">
                                           <Link 
                                              href={`/?caseId=${c.id}`} 
                                              className="flex items-center gap-2 px-4 py-2 bg-surgical-blue/10 hover:bg-surgical-blue text-surgical-blue hover:text-white rounded-lg transition-all border border-surgical-blue/20 text-[10px] font-bold uppercase tracking-widest"
                                           >
                                              <ExternalLink size={12} /> Open Case
                                           </Link>
                                           <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
                                              <FileText size={12} /> Notes
                                           </button>
                                        </div>
                                     </div>
                                  </GlassCard>
                               </motion.div>
                            ))}
                         </div>
                      )}
                   </div>
                </GlassCard>

                {/* Appointments Quick View */}
                <GlassCard className="p-8 border-white/5 bg-white/[0.01] overflow-hidden">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-surgical-teal/10 text-surgical-teal rounded-xl"><Calendar size={18} /></div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Scheduled Engagements</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      {(!patient.appointments || patient.appointments.length === 0) ? (
                         <div className="col-span-2 py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 text-white/20 text-[9px] uppercase font-bold tracking-widest">
                            No active outpatient schedules
                         </div>
                      ) : (
                         patient.appointments.map((apt: any) => (
                            <div key={apt.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-surgical-teal/20 transition-all flex items-center justify-between group">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-surgical-teal/10 flex flex-col items-center justify-center border border-surgical-teal/20 text-surgical-teal">
                                     <span className="text-[8px] font-bold uppercase">{new Date(apt.startTime).toLocaleString('default', { month: 'short' })}</span>
                                     <span className="text-sm font-bold leading-tight">{new Date(apt.startTime).getDate()}</span>
                                  </div>
                                  <div>
                                     <p className="text-[11px] font-bold text-white/80">{apt.notes || "Clinical Follow-up"}</p>
                                     <p className="text-[9px] text-white/30 uppercase font-mono">{new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                               </div>
                               <ChevronRight size={14} className="text-white/10 group-hover:text-surgical-teal group-hover:translate-x-1 transition-all" />
                            </div>
                         ))
                      )}
                   </div>
                </GlassCard>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
