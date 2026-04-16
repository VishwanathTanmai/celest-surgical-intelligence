"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, Plus, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDoctorSchedule, createAppointment } from "../clinical/actions";
import { cn } from "@/lib/utils";

const STATUS_COLORS: any = {
  "SCHEDULED": "text-surgical-blue bg-surgical-blue/10 border-surgical-blue/20",
  "COMPLETED": "text-surgical-teal bg-surgical-teal/10 border-surgical-teal/20",
  "CANCELLED": "text-surgical-crimson bg-surgical-crimson/10 border-surgical-crimson/20",
};

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [user, setUser] = useState<any>(null);

  async function loadData() {
    const sess = await fetch("/api/auth/session").then(r => r.json());
    setUser(sess.user);
    const data = await getDoctorSchedule();
    setAppointments(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createAppointment(formData);
    if (res.success) {
      setShowAdd(false);
      loadData();
    } else {
      alert(res.error);
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
              <h1 className="text-3xl font-extrabold tracking-tight">Clinical Engagement</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Real-Time Pathway Scheduling • {appointments.length} Active</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="bg-surgical-blue px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-all flex items-center gap-2 shadow-lg shadow-surgical-blue/20">
               <Plus size={14} /> New Appointment
            </button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 space-y-4">
               {loading ? (
                 <div className="p-20 text-center text-white/10 uppercase tracking-widest text-xs animate-pulse">Syncing Clinical Calendar...</div>
               ) : (
                 appointments.map((apt, i) => (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={apt.id}>
                       <GlassCard className="p-6 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white/5 rounded-2xl border border-white/10 group-hover:border-surgical-blue/30 transition-colors">
                                   <span className="text-[10px] font-bold text-surgical-blue uppercase">{new Date(apt.startTime).toLocaleString('default', { month: 'short' })}</span>
                                   <span className="text-lg font-bold font-mono">{new Date(apt.startTime).getDate()}</span>
                                </div>
                                <div>
                                   <h4 className="text-[16px] font-bold mb-1 text-white/90">{apt.patient.name}</h4>
                                   <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest font-mono">
                                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-surgical-blue" /> {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      <span className="flex items-center gap-1.5 text-surgical-teal">MRN: {apt.patient.mrn}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                <span className={cn("text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md border tracking-[0.1em]", STATUS_COLORS[apt.status])}>
                                   {apt.status}
                                </span>
                                <button className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-white transition-all">
                                   <ChevronRight size={20} />
                                </button>
                             </div>
                          </div>
                          {apt.notes && <p className="mt-4 text-[11px] text-white/30 border-t border-white/5 pt-4 italic">"{apt.notes}"</p>}
                       </GlassCard>
                    </motion.div>
                 ))
               )}
               {!loading && appointments.length === 0 && (
                 <div className="p-20 text-center text-white/10 uppercase tracking-widest text-xs border-2 border-dashed border-white/5 rounded-3xl">No Appointments Scheduled</div>
               )}
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <GlassCard className="w-[520px] p-8 border-white/10 bg-surgical-dark shadow-2xl text-white">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-surgical-blue/10 text-surgical-blue rounded-xl"><Calendar size={20} /></div>
                         <div>
                            <h3 className="text-xl font-bold uppercase tracking-widest">Schedule Pathway</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-tighter">Coordinate Clinical Engagement</p>
                         </div>
                      </div>
                      <button onClick={() => setShowAdd(false)} className="text-white/20 hover:text-white transition-colors">✕</button>
                   </div>
                   <form onSubmit={handleCreate} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Patient MRN</label>
                         <input name="mrn" required placeholder="E.G. MRN-12345" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all font-mono" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Start Time</label>
                         <input name="startTime" type="datetime-local" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Clinical Notes</label>
                         <textarea name="notes" placeholder="ADD INTRA-OPERATIVE CONTEXT..." className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-blue/50 transition-all resize-none" />
                      </div>
                      <button type="submit" className="w-full py-4 bg-gradient-to-r from-surgical-blue to-surgical-teal text-white rounded-xl text-[11px] font-extrabold uppercase tracking-[0.2em] shadow-lg shadow-surgical-blue/20 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all">
                         Finalize Appointment
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
