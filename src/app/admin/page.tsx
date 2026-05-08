"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
   Activity, TrendingUp, DollarSign, UserPlus, Mail, 
   ShieldCheck, AlertCircle, Clock, Database, ChevronRight, 
   Package, Star, Briefcase, Calendar, CheckCircle2,
   Edit3, Trash2, X, RefreshCw, Users, Microscope, Gauge, Zap
} from "lucide-react";
import Link from "next/link";
import { inviteDoctor } from "../auth/actions";
import { 
   getHospitalDoctors, getHospitalStats, submitAdminReview, 
   getHospitalCases, getDoctorCases, updateDoctorPeerRating,
   deleteDoctor, updateDoctorDetails
} from "../clinical/actions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
   const [doctors, setDoctors] = useState<any[]>([]);
   const [stats, setStats] = useState<any>(null);
   const [pyHealthStats, setPyHealthStats] = useState<any>(null);
   const [liveSurgeries, setLiveSurgeries] = useState<any>({});
   const [loading, setLoading] = useState(true);
   const [showInvite, setShowInvite] = useState(false);
   const [selectedCase, setSelectedCase] = useState<any>(null);
   const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
   const [editDoctor, setEditDoctor] = useState<any>(null);
   const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);
   const [reviewText, setReviewText] = useState("");
   const [session, setSession] = useState<any>(null);
   const [view, setView] = useState<"pipeline" | "history" | "performance">("pipeline");
   const [activePractitioner, setActivePractitioner] = useState<string | null>(null);
   const [rating, setRating] = useState(85); 
   const [peerRatingInput, setPeerRatingInput] = useState(5.0);
   const [history, setHistory] = useState<any[]>([]);
   const [loadingHistory, setLoadingHistory] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [isDispatching, setIsDispatching] = useState(false);

   async function reload() {
      try {
         const docs = await getHospitalDoctors();
         const st = await getHospitalStats();
         setDoctors(docs || []);
         setStats(st);
      } catch (err) {
         console.error("Dashboard reload failed:", err);
      }
   }

   useEffect(() => {
      async function loadData() {
         setLoading(true);
         try {
            const sess = await fetch("/api/auth/session").then(r => r.json());
            setSession(sess.user);
            await reload();
         } catch (err) {
            console.error("Initial load failed:", err);
         } finally {
            setLoading(false);
         }
      }
      loadData();
      
      const interval = setInterval(reload, 10000); 
      
      // PyHealth Analytics
      async function loadPyHealth() {
         try {
             const res = await fetch("http://localhost:8000/api/pyhealth/stats");
             const data = await res.json();
             setPyHealthStats(data);
         } catch (e) {
             console.error("PyHealth engine offline:", e);
         }
      }
      loadPyHealth();

      // Real-Time Holoscan WebSocket Sync
      const ws = new WebSocket("ws://localhost:8000/ws/surgery");
      ws.onmessage = (event) => {
         try {
            const data = JSON.parse(event.data);
            if (data.type === "SURGERY_UPDATE") {
               setLiveSurgeries((prev: any) => ({ ...prev, [data.caseId]: data }));
            }
         } catch(e) {}
      };

      return () => {
         clearInterval(interval);
         ws.close();
      };
   }, []);

   useEffect(() => {
      async function loadHistory() {
         if (view === "history" || activePractitioner) {
            setLoadingHistory(true);
            try {
               const data = activePractitioner ? await getDoctorCases(activePractitioner) : await getHospitalCases();
               setHistory(data || []);
            } catch (err) {
               console.error("History load failed:", err);
            } finally {
               setLoadingHistory(false);
            }
         }
      }
      loadHistory();
   }, [view, activePractitioner]);

   const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setIsDispatching(true);
      
      const formData = new FormData(e.currentTarget);
      const hId = session?.hospitalId || "";
      if (hId) formData.append("hospitalId", hId);

      try {
         const result = await inviteDoctor(formData);
         if (result?.error) {
            setError(result.error);
            return;
         }

         setShowInvite(false);
         await reload();
      } catch (err: any) {
         setError(err.message || "Institutional Dispatch Failed");
      } finally {
         setIsDispatching(false);
      }
   };

   const handleDelete = async (id: string) => {
      const res = await deleteDoctor(id);
      if (res.success) {
         setDeleteDoctorId(null);
         setActivePractitioner(null);
         await reload();
      }
   };

   return (
      <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
         <Sidebar />
         <div className="flex-1 flex flex-col min-w-0">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className="text-3xl font-extrabold tracking-tight">Hospital Command Center</h1>
                     <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono italic">Institutional Oversight • {doctors?.length || 0} Registered Practitioners</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button 
                           onClick={() => setView("pipeline")}
                           className={cn(
                              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                              view === "pipeline" ? "bg-surgical-blue text-white shadow-lg shadow-surgical-blue/20" : "text-white/40 hover:text-white"
                           )}
                        >
                           Pipeline
                        </button>
                        <button 
                           onClick={() => setView("history")}
                           className={cn(
                              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                              view === "history" ? "bg-surgical-blue text-white shadow-lg shadow-surgical-blue/20" : "text-white/40 hover:text-white"
                           )}
                        >
                           Audit
                        </button>
                        <button 
                           onClick={() => setView("performance")}
                           className={cn(
                              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                              view === "performance" ? "bg-surgical-blue text-white shadow-lg shadow-surgical-blue/20" : "text-white/40 hover:text-white"
                           )}
                        >
                           Performance
                        </button>
                     </div>
                     <button onClick={() => { setShowInvite(true); setError(null); }} className="bg-surgical-blue px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-all flex items-center gap-2 shadow-lg shadow-surgical-blue/20 text-white">
                        <UserPlus size={14} /> Invite Practitioner
                     </button>
                  </div>
               </div>               <div className="grid grid-cols-5 gap-6">
                  {[
                     { icon: Activity, label: "Total Cases", value: stats?.totalCases || "0", trend: "+12%", color: "text-surgical-blue" },
                     { icon: Zap, label: "Live Surgeries", value: Object.keys(liveSurgeries).length.toString(), trend: "Real-Time", color: "text-surgical-crimson" },
                     { icon: TrendingUp, label: "Efficiency", value: stats?.efficiency || "0%", trend: "+5%", color: "text-surgical-teal" },
                     { icon: ShieldCheck, label: "AI Safety Score", value: pyHealthStats?.avgSafetyScore ? `${(pyHealthStats.avgSafetyScore).toFixed(1)}%` : "N/A", trend: "PyHealth", color: "text-white" },
                     { icon: CheckCircle2, label: "Compliance", value: stats?.compliance || "100%", trend: "Stable", color: "text-surgical-blue" },
                  ].map((stat, i) => (
                     <GlassCard key={i} className="p-6 border-white/5 bg-white/[0.01]">
                        <div className="flex items-start justify-between mb-4">
                           <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}><stat.icon size={20} /></div>
                           <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", stat.color.replace('text', 'bg').replace('text', 'text') + "/10", stat.color)}>{stat.trend}</span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                     </GlassCard>
                  ))}
               </div>

               {view === "performance" && (
                  <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                     <GlassCard className="p-0 border-white/5 bg-white/[0.01] overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-surgical-blue/10 text-surgical-blue rounded-xl"><Microscope size={18} /></div>
                              <div>
                                 <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Practitioner Performance Benchmarking</h3>
                                 <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono">Objective Kinetic Evaluation • ERIF-V1 Framework</p>
                              </div>
                           </div>
                        </div>
                        <div className="overflow-x-auto min-h-[300px]">
                           <table className="w-full text-left">
                              <thead className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40">
                                 <tr>
                                    <th className="px-6 py-4">Practitioner</th>
                                    <th className="px-6 py-4">Aggregate Score</th>
                                    <th className="px-6 py-4">Dissection Safety</th>
                                    <th className="px-6 py-4">CVS Proxy</th>
                                    <th className="px-6 py-4">Bleeding Risk</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {doctors?.map((doc: any) => {
                                    const score = doc.stats?.overallScore || (doc.peerRating || 4.5) * 20;
                                    const dissectionSafety = doc.stats?.dissectionSafety || 85;
                                    const cvsProxy = doc.stats?.cvsProxy || 92;
                                    const bleedingRisk = doc.stats?.bleedingRisk || 8;
                                    return (
                                       <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                                          <td className="px-6 py-4">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surgical-blue/10 flex items-center justify-center text-surgical-blue font-black text-xs">{doc.name?.substring(0,1)}</div>
                                                <div>
                                                   <p className="text-[11px] font-bold">{doc.name}</p>
                                                   <p className="text-[9px] text-white/20 uppercase tracking-tighter">{doc.department}</p>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-6 py-4">
                                             <span className="text-xs font-black text-surgical-teal">{score.toFixed(1)}%</span>
                                          </td>
                                          <td className="px-6 py-4">
                                             <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                   <div className="h-full bg-surgical-blue" style={{ width: `${dissectionSafety}%` }} />
                                                </div>
                                                <span className="text-[9px] text-white/40">{dissectionSafety.toFixed(0)}%</span>
                                             </div>
                                          </td>
                                          <td className="px-6 py-4">
                                             <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                   <div className="h-full bg-surgical-teal" style={{ width: `${cvsProxy}%` }} />
                                                </div>
                                                <span className="text-[9px] text-white/40">{cvsProxy.toFixed(0)}%</span>
                                             </div>
                                          </td>
                                          <td className="px-6 py-4">
                                             <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                   <div className="h-full bg-surgical-crimson" style={{ width: `${bleedingRisk}%` }} />
                                                </div>
                                                <span className="text-[9px] text-white/40">{bleedingRisk.toFixed(0)}%</span>
                                             </div>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                             <button onClick={() => { setActivePractitioner(doc.id); setView("history"); }} className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors bg-white/5 px-2 py-1 rounded">Audit</button>
                                          </td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                     </GlassCard>
                  </div>
               )}

               <div className={cn("grid grid-cols-12 gap-6 pb-20", view === "performance" && "hidden")}>
                  {/* Case History / Pipeline */}
                  <GlassCard className={cn("p-0 border-white/5 bg-white/[0.01] overflow-hidden transition-all duration-500", view === "history" || activePractitioner ? "col-span-12" : "col-span-8")}>
                      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-surgical-blue/10 text-surgical-blue rounded-xl animate-pulse"><Activity size={18} /></div>
                            <div>
                               <h3 className="text-sm font-black uppercase tracking-widest">
                                  {activePractitioner ? `Audit: ${doctors.find(d => d.id === activePractitioner)?.name}` : view === "history" ? "Institutional Case History" : "Surgical Activity Pipeline"}
                               </h3>
                               <p className="text-[9px] text-white/30 uppercase tracking-widest font-mono">
                                  {activePractitioner ? "Filtered Practitioner Records" : view === "history" ? "Comprehensive Global Audit" : "Real-Time Practitioner Mirroring"}
                               </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            {activePractitioner && (
                               <button onClick={() => setActivePractitioner(null)} className="text-[10px] font-bold uppercase text-surgical-crimson bg-surgical-crimson/10 px-3 py-1 rounded-lg border border-surgical-crimson/20">Exit Audit</button>
                            )}
                            <div className="flex items-center gap-2">
                               <div className={cn("w-1.5 h-2 rounded-full animate-pulse", view === "history" ? "bg-white/10" : "bg-surgical-teal")} />
                               <span className={cn("text-[9px] font-bold uppercase tracking-widest", view === "history" ? "text-white/20" : "text-surgical-teal")}>
                                  {view === "history" ? "Auditing" : "Monitoring"}
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                           <thead className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40">
                              {view === "pipeline" && !activePractitioner ? (
                                 <tr>
                                    <th className="px-6 py-4">Practitioner</th>
                                    <th className="px-6 py-4">Facility</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Oversight</th>
                                    <th className="px-6 py-4 text-right">Time</th>
                                 </tr>
                              ) : (
                                 <tr>
                                    <th className="px-6 py-4">Procedure</th>
                                    <th className="px-6 py-4">Practitioner</th>
                                    <th className="px-6 py-4">Patient MRN</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Audit Status</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                 </tr>
                              )}
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {view === "pipeline" && !activePractitioner ? (
                                 stats?.recentActivity?.map((job: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-surgical-blue transition-colors font-black text-xs">
                                                {job.doctor?.name?.substring(0,1) || "D"}
                                             </div>
                                             <div>
                                                <p className="text-[11px] font-bold">{job.doctor?.name || "Dr. Staff"}</p>
                                                <p className="text-[9px] text-white/20 uppercase tracking-tighter italic">{job.doctor?.email}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <p className="text-[11px] font-bold truncate max-w-[150px]">{job.doctor?.hospital?.name || "Primary Hub"}</p>
                                          <p className="text-[9px] text-white/20 font-mono italic underline decoration-white/5 uppercase select-none">Institutional Peer</p>
                                       </td>
                                       <td className="px-6 py-4">
                                          <span className={cn(
                                             "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                                             job.status === "COMPLETED" ? "bg-surgical-teal/10 text-surgical-teal border-surgical-teal/20" :
                                             job.status === "FAILED" ? "bg-surgical-crimson/10 text-surgical-crimson border-surgical-crimson/20" :
                                             "bg-surgical-blue/10 text-surgical-blue border-surgical-blue/20 animate-pulse"
                                          )}>
                                             {job.status}
                                          </span>
                                       </td>
                                       <td className="px-6 py-4">
                                          {job.status === "COMPLETED" && (
                                             <button 
                                                onClick={() => setSelectedCase(job)}
                                                className="text-[9px] font-bold uppercase tracking-widest text-surgical-blue hover:text-white transition-colors flex items-center gap-1.5"
                                             >
                                                <ShieldCheck size={12} /> {job.reviewStatus === "REVIEWED" ? "Update" : "Review"}
                                             </button>
                                          )}
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <div className="flex flex-col items-end">
                                             <span className="text-[10px] font-mono text-white/40">{new Date(job.createdAt).toLocaleTimeString()}</span>
                                             <span className="text-[8px] text-white/10 uppercase font-bold">{new Date(job.createdAt).toDateString()}</span>
                                          </div>
                                       </td>
                                    </tr>
                                 ))
                              ) : (
                                 history.map((c: any, i: number) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                       <td className="px-6 py-4">
                                          <div>
                                             <p className="text-[11px] font-bold">{c.procedureName}</p>
                                             <p className="text-[9px] text-white/20 uppercase font-mono italic">CPT: {c.cptCode || "N/A"}</p>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <p className="text-[11px] font-bold">{c.doctor?.name}</p>
                                          <p className="text-[9px] text-white/20 uppercase tracking-tighter">{c.doctor?.department}</p>
                                       </td>
                                       <td className="px-6 py-4">
                                          <p className="text-[11px] font-mono font-bold">{c.patient?.mrn}</p>
                                       </td>
                                       <td className="px-6 py-4">
                                          {c.rating ? (
                                             <div className="flex items-center gap-1.5">
                                                <div className="flex -space-x-0.5">
                                                   {[...Array(5)].map((_, i) => (
                                                      <div key={i} className={cn("w-1.5 h-3 rounded-full", i < Math.floor(c.rating/20) ? "bg-surgical-teal" : "bg-white/10")} />
                                                   ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-surgical-teal">{c.rating}%</span>
                                             </div>
                                          ) : (
                                             <span className="text-[9px] text-white/10 uppercase font-bold tracking-tighter">Unrated</span>
                                          )}
                                       </td>
                                       <td className="px-6 py-4">
                                          <button 
                                             onClick={() => setSelectedCase({ ...c, doctor: c.doctor, filename: c.procedureName })}
                                             className={cn(
                                                "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all hover:scale-105",
                                                c.reviewStatus === "REVIEWED" ? "bg-surgical-teal/10 text-surgical-teal border-surgical-teal/20" : "bg-white/5 text-white/30 border-white/5 hover:text-white"
                                             )}
                                          >
                                             {c.reviewStatus === "REVIEWED" ? "Reported" : "Initiate Audit"}
                                          </button>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <div className="flex flex-col items-end text-white/40">
                                             <span className="text-[10px] font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                                             <span className="text-[8px] uppercase font-bold">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                          </div>
                                       </td>
                                    </tr>
                                 ))
                              )}
                              {((!loading && ((!activePractitioner && view === "pipeline") && (!stats?.recentActivity || stats.recentActivity.length === 0)) || ((activePractitioner || view === "history") && !loadingHistory && history.length === 0))) && (
                                 <tr><td colSpan={6} className="px-6 py-12 text-center text-white/10 uppercase tracking-widest text-[10px] animate-pulse">Scanning clinical records...</td></tr>
                              )}
                              {loading && (
                                 <tr><td colSpan={6} className="px-6 py-12 text-center text-white/10 uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Data Pipeline...</td></tr>
                              )}
                           </tbody>
                        </table>
                      </div>
                  </GlassCard>

                  {/* Practitioner Oversight Hub - High Fidelity Cards */}
                  {view === "pipeline" && !activePractitioner && (
                    <div className="col-span-4 space-y-4">
                        <div className="flex items-center justify-between px-2">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Administrative Oversight</h3>
                        </div>
                        <div className="space-y-4 overflow-y-auto max-h-[850px] pr-2 custom-scrollbar">
                           {doctors?.length === 0 && !loading && (
                              <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                 <Users className="mx-auto text-white/5 mb-3" size={32} />
                                 <p className="text-[10px] uppercase font-bold tracking-widest text-white/10">No practitioners registered</p>
                              </div>
                           )}
                           {doctors?.map((doc: any) => {
                              const totalCases = doc._count?.cases || 0;
                              return (
                                 <GlassCard 
                                    key={doc.id} 
                                    className="p-8 border-white/5 bg-white/[0.01] relative group overflow-hidden"
                                 >
                                    {/* Action Shortcuts improved spacing */}
                                    <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                                       <button onClick={() => setEditDoctor(doc)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-surgical-blue hover:bg-surgical-blue/10 transition-all shadow-xl"><Edit3 size={15} /></button>
                                       <button onClick={() => setDeleteDoctorId(doc.id)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-surgical-crimson hover:bg-surgical-crimson/10 transition-all shadow-xl"><Trash2 size={15} /></button>
                                    </div>

                                    <div className="absolute top-0 right-0 w-40 h-40 bg-surgical-blue/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-surgical-blue/10 transition-all duration-700" />
                                    
                                    <div className="flex flex-col relative">
                                       <div className="flex items-start gap-6">
                                          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-surgical-blue font-black text-2xl shadow-inner relative shrink-0">
                                             {doc.name?.substring(0,1) || "P"}
                                             <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surgical-teal border-4 border-surgical-dark shadow-lg shadow-surgical-teal/20" />
                                          </div>
                                          
                                          <div className="min-w-0 flex-1 pr-16">
                                             <h4 className="text-2xl font-black tracking-tight leading-tight truncate overflow-hidden whitespace-nowrap">{doc.name}</h4>
                                             
                                             <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <div className="flex items-center gap-1.5 text-[9px] text-white/30 uppercase font-mono bg-white/5 px-2 py-1 rounded-lg border border-white/5 whitespace-nowrap">
                                                   <Calendar size={11} /> {new Date(doc.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-surgical-teal uppercase font-black bg-surgical-teal/5 px-2 py-1 rounded-lg border border-surgical-teal/20 whitespace-nowrap">
                                                   <Database size={11} /> {doc.hospital?.name || "Native Facility"}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-white/30 uppercase font-mono bg-white/5 px-2 py-1 rounded-lg border border-white/5 whitespace-nowrap">
                                                   <Briefcase size={11} /> Staff Physician
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                          <div>
                                             <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-2 font-bold whitespace-nowrap">Clinical Status</p>
                                             <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-white/40 border border-white/10 px-3 py-1.5 bg-white/5 rounded-xl uppercase tracking-widest">{doc.department}</span>
                                                <span className="text-[9px] font-black text-surgical-teal border border-surgical-teal/20 px-3 py-1.5 bg-surgical-teal/5 rounded-xl uppercase tracking-widest flex items-center gap-1.5">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-surgical-teal animate-pulse" /> Active
                                                </span>
                                             </div>
                                          </div>

                                          <div className="text-right">
                                             <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-1 font-bold whitespace-nowrap">Peer Rating</p>
                                             <button 
                                                onClick={() => { setSelectedDoctor(doc); setPeerRatingInput(doc.peerRating || 5.0); }}
                                                className="flex items-center gap-2 group/rate justify-end"
                                             >
                                                <Star size={18} className="text-surgical-blue fill-surgical-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                                                <span className="text-3xl font-black tracking-tighter group-hover/rate:text-surgical-blue transition-colors underline decoration-surgical-blue/30 underline-offset-8">{doc.peerRating?.toFixed(1) || "5.0"}</span>
                                             </button>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-0 mt-8 relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
                                       <div className="p-4 border-r border-white/5 text-center transition-all hover:bg-white/5 cursor-default">
                                          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1.5 font-bold">Total Cases</p>
                                          <p className="text-2xl font-black tracking-tight text-white">{totalCases}</p>
                                       </div>
                                       <button 
                                          onClick={() => { setActivePractitioner(doc.id); setView("history"); }}
                                          className="p-4 text-center group/link transition-all hover:bg-surgical-blue hover:text-white"
                                       >
                                          <p className="text-[9px] text-white/20 group-hover/link:text-white/60 uppercase tracking-widest mb-1.5 font-bold">Audit History</p>
                                          <div className="flex items-center justify-center gap-1.5">
                                             <span className="text-xs font-black uppercase tracking-widest">Access Vault</span>
                                             <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                          </div>
                                       </button>
                                    </div>
                                 </GlassCard>
                              );
                           })}
                        </div>
                    </div>
                  )}
               </div>
            </main>
         </div>

         {/* Destructive Confirm Modal */}
         <AnimatePresence>
            {deleteDoctorId && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                     <GlassCard className="w-[400px] p-10 border-surgical-crimson/20 bg-surgical-dark shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden text-white">
                        <div className="absolute top-0 left-0 w-full h-1 bg-surgical-crimson" />
                        <div className="w-20 h-20 rounded-full bg-surgical-crimson/10 flex items-center justify-center mx-auto mb-6 text-surgical-crimson animate-pulse"><AlertCircle size={40} /></div>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">Destructive Protocol</h3>
                        <p className="text-xs text-white/40 leading-relaxed mb-8 uppercase tracking-tighter">Permanently eliminate clinician and wipe all history?</p>
                        <div className="flex flex-col gap-3">
                           <button onClick={() => handleDelete(deleteDoctorId)} className="w-full py-4 bg-surgical-crimson text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-surgical-crimson/90 transition-all">Confirm Elimination</button>
                           <button onClick={() => setDeleteDoctorId(null)} className="w-full py-4 bg-white/5 text-white/40 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:text-white transition-all">Abort Protocol</button>
                        </div>
                     </GlassCard>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Edit Practitioner Modal */}
         <AnimatePresence>
            {editDoctor && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                     <GlassCard className="w-[480px] p-8 border-white/10 bg-surgical-dark shadow-2xl relative text-white">
                        <div className="absolute top-0 left-0 w-full h-1 bg-surgical-blue" />
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-surgical-blue/10 text-surgical-blue rounded-xl"><Edit3 size={20} /></div>
                              <h3 className="text-lg font-bold uppercase tracking-widest">Edit Credentials</h3>
                           </div>
                           <button onClick={() => setEditDoctor(null)} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
                        </div>
                        <form action={async (formData) => {
                           const res = await updateDoctorDetails(formData);
                           if (res.success) { setEditDoctor(null); await reload(); }
                        }} className="space-y-5">
                           <input type="hidden" name="doctorId" value={editDoctor.id} />
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Full Identity</label>
                              <input defaultValue={editDoctor.name} name="name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Medical Email</label>
                              <input defaultValue={editDoctor.email} name="email" type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Clinical Department</label>
                              <input defaultValue={editDoctor.department} name="department" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none" />
                           </div>
                           <button type="submit" className="w-full py-4 bg-surgical-blue text-white rounded-xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-surgical-blue/90 shadow-lg shadow-surgical-blue/20 transition-all">Authorize Profile Update</button>
                        </form>
                     </GlassCard>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Invite Modal */}
         <AnimatePresence>
            {showInvite && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                     <GlassCard className="w-[480px] p-8 border-white/10 bg-surgical-dark shadow-2xl text-white">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-surgical-teal/10 text-surgical-teal rounded-xl"><Mail size={20} /></div>
                              <h3 className="text-lg font-bold uppercase tracking-widest">Invite Practitioner</h3>
                           </div>
                           <button onClick={() => setShowInvite(false)} className="text-white/20 hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-5">
                           {error && (
                              <div className="bg-surgical-crimson/10 border border-surgical-crimson/20 p-4 rounded-xl flex items-center gap-3">
                                 <AlertCircle size={14} className="text-surgical-crimson shrink-0" />
                                 <p className="text-[9px] text-surgical-crimson font-bold uppercase tracking-widest">{error}</p>
                              </div>
                           )}
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Full Identity</label>
                              <input name="name" required placeholder="DR. JONATHAN REED" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all text-white outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Medical Email</label>
                              <input name="email" type="email" required placeholder="REED@HOSPITAL.COM" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all text-white outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Clinical Department</label>
                              <input name="department" required placeholder="GENERAL SURGERY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all text-white outline-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Access Credentials</label>
                              <input name="password" type="password" required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all text-white outline-none" />
                           </div>
                           <button 
                              type="submit" 
                              disabled={isDispatching}
                              className="w-full py-4 bg-surgical-teal text-white rounded-xl text-[11px] font-extrabold uppercase tracking-widest shadow-lg shadow-surgical-teal/20 mt-4 disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:bg-surgical-teal/90"
                           >
                              {isDispatching ? <RefreshCw className="animate-spin" size={14} /> : <Mail size={14} />}
                              {isDispatching ? "Synthesizing Access Key..." : "Dispatch Digital Invite"}
                           </button>
                        </form>
                     </GlassCard>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Peer Rating Modal */}
         <AnimatePresence>
            {selectedDoctor && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                     <GlassCard className="w-[450px] p-8 border-white/10 bg-surgical-dark shadow-2xl relative overflow-hidden text-white">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-surgical-blue to-surgical-teal" />
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-surgical-blue/10 text-surgical-blue rounded-xl shadow-inner"><Star size={20} /></div>
                              <div>
                                 <h3 className="text-lg font-bold uppercase tracking-widest text-white/80">Peer Evaluation</h3>
                                 <p className="text-[10px] text-white/40 uppercase tracking-tighter">Prestige Score: {selectedDoctor.name}</p>
                              </div>
                           </div>
                           <button onClick={() => setSelectedDoctor(null)} className="text-white/20 hover:text-white transition-colors">✕</button>
                        </div>
                        <form action={async (formData) => {
                           const res = await updateDoctorPeerRating(formData);
                           if (res.success) { setSelectedDoctor(null); await reload(); }
                        }} className="space-y-6">
                           <input type="hidden" name="doctorId" value={selectedDoctor.id} />
                           <div className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Clinical Prestige</label>
                                 <span className="text-2xl font-black text-surgical-blue">{peerRatingInput.toFixed(1)}</span>
                              </div>
                              <input name="rating" type="range" min="1" max="5" step="0.1" value={peerRatingInput} onChange={(e) => setPeerRatingInput(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-surgical-blue transition-all" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Department</label>
                              <input name="department" defaultValue={selectedDoctor.department} placeholder="GENERAL SURGERY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all text-white outline-none" />
                           </div>
                           <button type="submit" className="w-full py-4 bg-surgical-blue text-white rounded-xl text-[11px] font-extrabold uppercase tracking-widest shadow-lg shadow-surgical-blue/20 transition-all hover:bg-surgical-blue/90">Authorize Rating</button>
                        </form>
                     </GlassCard>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Review Modal */}
         <AnimatePresence>
            {selectedCase && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                     <GlassCard className="w-[500px] p-8 border-white/10 bg-surgical-dark shadow-2xl text-white">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-surgical-blue/10 text-surgical-blue rounded-xl"><ShieldCheck size={20} /></div>
                              <h3 className="text-lg font-bold uppercase tracking-widest">Case Audit</h3>
                           </div>
                           <button onClick={() => setSelectedCase(null)} className="text-white/20 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="space-y-6">
                           <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                              <p className="text-[10px] uppercase font-bold text-white/40">Practitioner: {selectedCase.doctor?.name}</p>
                              <p className="text-xs font-bold text-surgical-blue">{selectedCase.filename || selectedCase.procedureName}</p>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between px-1"><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Surgical Rating</label><span className="text-xs font-mono font-bold text-surgical-teal">{rating}%</span></div>
                              <input type="range" min="0" max="100" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-surgical-teal" />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Clinical Notes</label>
                              <textarea defaultValue={selectedCase.adminReview || ""} onChange={(e) => setReviewText(e.target.value)} placeholder="Enter quality assurance notes..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono min-h-[120px] outline-none focus:border-surgical-blue/50 transition-all resize-none text-white" />
                           </div>
                           <button onClick={async () => {
                                 const fd = new FormData(); fd.append("caseId", selectedCase.caseId || selectedCase.id); fd.append("review", reviewText || (document.querySelector("textarea") as HTMLTextAreaElement).value); fd.append("rating", rating.toString());
                                 const res = await submitAdminReview(fd); if (res.success) { setSelectedCase(null); setRating(85); await reload(); }
                              }} className="w-full py-4 bg-surgical-blue text-white rounded-xl text-[11px] font-extrabold uppercase tracking-widest shadow-lg shadow-surgical-blue/20 transition-all">Authorize Review</button>
                        </div>
                     </GlassCard>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
