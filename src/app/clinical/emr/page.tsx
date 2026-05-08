"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
   Activity, FileText, UserPlus, Heart, 
   ShieldCheck, AlertCircle, Clock, Database,
   Pill, Microscope, Search, CheckCircle2, FileSignature
} from "lucide-react";
import { getEMRRecords, createEMRRecord, getPatients } from "../actions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function EMRDashboard() {
   const [records, setRecords] = useState<any[]>([]);
   const [patients, setPatients] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [showAdd, setShowAdd] = useState(false);
   const [selectedRecord, setSelectedRecord] = useState<any>(null);

   async function loadData() {
      setLoading(true);
      try {
         const emrData = await getEMRRecords();
         const patientsData = await getPatients();
         setRecords(emrData || []);
         setPatients(patientsData || []);
      } catch (err) {
         console.error("EMR load failed:", err);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      loadData();
   }, []);

   const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      const hr = formData.get("heartRate");
      const bp = formData.get("bloodPressure");
      const vitals = { heartRate: hr ? parseInt(hr as string) : 0, bloodPressure: bp };
      formData.set("vitals", JSON.stringify(vitals));

      const meds = formData.get("meds");
      formData.set("prescriptions", JSON.stringify(meds ? (meds as string).split(",") : []));

      const res = await createEMRRecord(formData);
      if (res.success) {
         setShowAdd(false);
         await loadData();
      } else {
         alert("Failed to create record: " + res.error);
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
                     <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <FileSignature className="text-surgical-teal" /> Hospital EMR Hub
                     </h1>
                     <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono italic">Electronic Medical Records • PyHealth Intelligence</p>
                  </div>
                  <button onClick={() => setShowAdd(true)} className="bg-surgical-teal px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-teal/90 transition-all flex items-center gap-2 shadow-lg shadow-surgical-teal/20 text-white">
                     <UserPlus size={14} /> New Record
                  </button>
               </div>

               <div className="grid grid-cols-4 gap-6">
                  <GlassCard className="p-6 border-white/5 bg-white/[0.01]">
                     <div className="flex items-start justify-between mb-4">
                        <div className="p-2 rounded-xl bg-surgical-teal/10 text-surgical-teal"><FileText size={20} /></div>
                     </div>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total Records</p>
                     <p className="text-2xl font-bold">{records.length}</p>
                  </GlassCard>
                  <GlassCard className="p-6 border-white/5 bg-white/[0.01]">
                     <div className="flex items-start justify-between mb-4">
                        <div className="p-2 rounded-xl bg-surgical-blue/10 text-surgical-blue"><ShieldCheck size={20} /></div>
                     </div>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">AI Assessed</p>
                     <p className="text-2xl font-bold text-surgical-blue">100%</p>
                  </GlassCard>
               </div>

               <GlassCard className="p-0 border-white/5 bg-white/[0.01] overflow-hidden">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-surgical-teal/10 text-surgical-teal rounded-xl"><Database size={18} /></div>
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Clinical Ledger</h3>
                           <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono">Patient Interaction & AI Risk Index</p>
                        </div>
                     </div>
                  </div>
                  <div className="overflow-x-auto min-h-[400px]">
                     <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40">
                           <tr>
                              <th className="px-6 py-4">Patient</th>
                              <th className="px-6 py-4">Physician</th>
                              <th className="px-6 py-4">Vitals Summary</th>
                              <th className="px-6 py-4">PyHealth Risk Score</th>
                              <th className="px-6 py-4 text-right">Date</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {loading ? (
                              <tr><td colSpan={5} className="px-6 py-12 text-center text-white/10 uppercase tracking-widest text-[10px] animate-pulse">Accessing Secure Records...</td></tr>
                           ) : records.length === 0 ? (
                              <tr><td colSpan={5} className="px-6 py-12 text-center text-white/10 uppercase tracking-widest text-[10px]">No EMR Records Found</td></tr>
                           ) : (
                              records.map((record) => (
                                 <tr key={record.id} onClick={() => setSelectedRecord(record)} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                       <p className="text-[11px] font-bold">{record.patient?.name}</p>
                                       <p className="text-[9px] text-white/20 uppercase tracking-tighter">MRN: {record.patient?.mrn}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                       <p className="text-[11px] font-bold">Dr. {record.doctor?.name}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          <span className="text-[10px] text-white/60 bg-white/5 px-2 py-1 rounded"><Heart size={10} className="inline mr-1 text-surgical-crimson" />{record.vitals?.heartRate || "--"}</span>
                                          <span className="text-[10px] text-white/60 bg-white/5 px-2 py-1 rounded"><Activity size={10} className="inline mr-1 text-surgical-teal" />{record.vitals?.bloodPressure || "--/--"}</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-2">
                                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                             <div className={cn("h-full", record.pyhealthRiskScore > 50 ? "bg-surgical-crimson" : record.pyhealthRiskScore > 20 ? "bg-yellow-500" : "bg-surgical-teal")} style={{ width: `${record.pyhealthRiskScore}%` }} />
                                          </div>
                                          <span className="text-[10px] font-bold">{record.pyhealthRiskScore}%</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                       <span className="text-[10px] text-white/40">{new Date(record.createdAt).toLocaleDateString()}</span>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </main>
         </div>

         {/* Add Modal */}
         <AnimatePresence>
            {showAdd && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                     <GlassCard className="w-[500px] p-8 border-white/10 bg-surgical-dark shadow-2xl text-white">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-surgical-teal/10 text-surgical-teal rounded-xl"><UserPlus size={20} /></div>
                              <h3 className="text-lg font-bold uppercase tracking-widest">New Clinical Entry</h3>
                           </div>
                           <button onClick={() => setShowAdd(false)} className="text-white/20 hover:text-white transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Patient</label>
                              <select name="patientId" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-surgical-teal/50 outline-none">
                                 {patients.map(p => <option key={p.id} value={p.id} className="bg-black text-white">{p.name} ({p.mrn})</option>)}
                              </select>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Heart Rate</label>
                                 <input name="heartRate" type="number" placeholder="85" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-surgical-teal/50 outline-none" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Blood Pressure</label>
                                 <input name="bloodPressure" placeholder="120/80" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-surgical-teal/50 outline-none" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Clinical Notes</label>
                              <textarea name="clinicalNotes" required placeholder="Patient presents with..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs min-h-[100px] focus:border-surgical-teal/50 outline-none resize-none" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Prescriptions (Comma Separated)</label>
                              <input name="meds" placeholder="Amoxicillin, Ibuprofen" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-surgical-teal/50 outline-none" />
                           </div>
                           <button type="submit" className="w-full py-4 bg-surgical-teal text-white rounded-xl text-[11px] font-extrabold uppercase tracking-widest shadow-lg shadow-surgical-teal/20 transition-all hover:bg-surgical-teal/90 mt-4">Save Record</button>
                        </form>
                     </GlassCard>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* View Modal */}
         <AnimatePresence>
            {selectedRecord && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                     <GlassCard className="w-[500px] p-8 border-white/10 bg-surgical-dark shadow-2xl text-white">
                        <div className="flex items-center justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-surgical-blue/10 text-surgical-blue rounded-xl"><Microscope size={20} /></div>
                              <h3 className="text-lg font-bold uppercase tracking-widest">PyHealth Analysis</h3>
                           </div>
                           <button onClick={() => setSelectedRecord(null)} className="text-white/20 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="space-y-6">
                           <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Risk Assessment</p>
                              <div className="flex items-center gap-4">
                                 <span className={cn("text-3xl font-black", selectedRecord.pyhealthRiskScore > 50 ? "text-surgical-crimson" : "text-surgical-teal")}>{selectedRecord.pyhealthRiskScore}%</span>
                                 <p className="text-xs text-white/60">{selectedRecord.pyhealthInsights?.summary}</p>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] text-white/40 uppercase tracking-widest">Clinical Notes</p>
                              <p className="text-xs text-white/80 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{selectedRecord.clinicalNotes}</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] text-white/40 uppercase tracking-widest">Prescribed Medications</p>
                              <div className="flex gap-2 flex-wrap">
                                 {selectedRecord.prescriptions.map((m: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-surgical-teal/10 text-surgical-teal text-[10px] font-bold uppercase rounded-lg border border-surgical-teal/20 flex items-center gap-1"><Pill size={10} /> {m}</span>
                                 ))}
                                 {selectedRecord.prescriptions.length === 0 && <span className="text-xs text-white/40">None</span>}
                              </div>
                           </div>
                        </div>
                     </GlassCard>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
