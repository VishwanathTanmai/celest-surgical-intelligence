"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, FileText, CheckCircle2, Search, UserPlus } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createAppointment, getDoctorSchedule, getPatients } from "@/app/clinical/actions";

export function SurgicalCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalStep, setModalStep] = useState<"choice" | "existing" | "new">("choice");
  const [registrySearchTerm, setRegistrySearchTerm] = useState("");
  const [existingPatients, setExistingPatients] = useState<any[]>([]);
  const [targetPatient, setTargetPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [currentMonth]);

  const loadSchedule = async () => {
    const data = await getDoctorSchedule();
    setAppointments(data || []);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  useEffect(() => {
    if (modalStep === "existing") {
      getPatients().then(setExistingPatients);
    }
  }, [modalStep]);

  const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("startTime", format(selectedDate, "yyyy-MM-dd") + " " + formData.get("time"));
    
    if (targetPatient) {
      formData.append("patientId", targetPatient.id);
    }

    const res = await createAppointment(formData);
    if (res.success) {
      setShowAddModal(false);
      setModalStep("choice");
      setTargetPatient(null);
      loadSchedule();
    }
    setLoading(false);
  };

  return (
    <GlassCard className="p-0 border-white/5 bg-white/[0.01] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-surgical-blue/10 text-surgical-blue rounded-xl shadow-lg shadow-surgical-blue/10">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">{format(currentMonth, "MMMM yyyy")}</h3>
            <p className="text-[9px] text-white/30 uppercase tracking-tighter font-mono">Real-Time Patient Scheduler</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"><ChevronLeft size={18} /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"><ChevronRight size={18} /></button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="ml-4 flex items-center gap-2 bg-surgical-blue hover:bg-surgical-blue/90 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-surgical-blue/20"
          >
            <Plus size={14} /> Schedule Patient
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 p-6 border-r border-white/5">
          <div className="grid grid-cols-7 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day: Date, i: number) => {
              const apptsInDay = appointments.filter((a: any) => isSameDay(new Date(a.startTime), day));
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-xl border transition-all flex flex-col p-2 relative group",
                    !isSameMonth(day, currentMonth) ? "bg-transparent border-transparent opacity-10" : "bg-white/[0.02] border-white/5 hover:border-surgical-blue/40",
                    isSameDay(day, selectedDate) && "border-surgical-blue bg-surgical-blue/5 shadow-inner"
                  )}
                >
                   <span className={cn(
                     "text-xs font-mono font-bold transition-all",
                     isSameDay(day, new Date()) ? "text-surgical-teal" : isSameDay(day, selectedDate) ? "text-surgical-blue" : "text-white/40"
                   )}>{format(day, "d")}</span>
                   
                   <div className="mt-auto flex gap-0.5 justify-center flex-wrap">
                      {apptsInDay.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1 h-1 rounded-full bg-surgical-blue/50" />
                      ))}
                      {apptsInDay.length > 3 && <div className="text-[7px] text-white/20">+{apptsInDay.length-3}</div>}
                   </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day View */}
        <div className="w-[380px] flex flex-col bg-white/[0.01]">
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{format(selectedDate, "EEEE")}</h4>
            <div className="text-lg font-black tracking-tight">{format(selectedDate, "MMMM do, yyyy")}</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {appointments.filter(a => isSameDay(new Date(a.startTime), selectedDate)).length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <FileText size={40} strokeWidth={1} />
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-4">No Surgeries Scheduled</p>
               </div>
             ) : (
               appointments.filter(a => isSameDay(new Date(a.startTime), selectedDate)).map((appt, i) => (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   transition={{ delay: i * 0.1 }}
                   key={i} 
                   className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-surgical-blue/30 transition-all cursor-pointer group"
                 >
                    <div className="flex items-center justify-between mb-3">
                       <span className="flex items-center gap-1.5 px-2 py-0.5 bg-surgical-blue/10 border border-surgical-blue/20 rounded-md text-[9px] font-bold text-surgical-blue uppercase tracking-widest">
                         <Clock size={10} /> {format(new Date(appt.startTime), "HH:mm")}
                       </span>
                       <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                          appt.status === "SCHEDULED" ? "text-surgical-teal border border-surgical-teal/20" : "text-white/20 border border-white/10"
                       )}>
                         {appt.status}
                       </span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-surgical-blue group-hover:border-surgical-blue/30 transition-all">
                          <User size={18} />
                       </div>
                       <div>
                         <p className="text-sm font-black truncate">{appt.patient?.name || "Anonymous Patient"}</p>
                         <p className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">MRN: {appt.patient?.mrn || "N/A"}</p>
                       </div>
                    </div>
                    {appt.notes && (
                      <div className="mt-3 p-2 bg-black/20 rounded-lg text-[10px] text-white/40 font-medium leading-relaxed italic border-l-2 border-surgical-blue/50">
                        {appt.notes}
                      </div>
                    )}
                 </motion.div>
               ))
             )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-12 bg-surgical-dark/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">
                        {modalStep === "choice" ? "Patient Identification" : 
                         modalStep === "existing" ? "Select Existing Patient" : "Onboard New Patient"}
                      </h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{format(selectedDate, "MMM do, yyyy")}</p>
                   </div>
                   <button onClick={() => { setShowAddModal(false); setModalStep("choice"); setTargetPatient(null); }} className="text-white/20 hover:text-white transition-colors">✕</button>
                </div>

                <AnimatePresence mode="wait">
                  {modalStep === "choice" ? (
                    <motion.div key="choice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 gap-4">
                       <button onClick={() => setModalStep("existing")} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-6 hover:border-surgical-blue/40 hover:bg-white/[0.08] transition-all group text-left">
                          <div className="w-12 h-12 rounded-xl bg-surgical-blue/10 flex items-center justify-center text-surgical-blue group-hover:scale-110 transition-transform"><Search size={22} /></div>
                          <div>
                             <p className="text-sm font-black uppercase tracking-widest mb-1">Select Existing</p>
                             <p className="text-[10px] text-white/30 font-medium">Search institutional registry</p>
                          </div>
                       </button>
                       <button onClick={() => setModalStep("new")} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-6 hover:border-surgical-blue/40 hover:bg-white/[0.08] transition-all group text-left">
                          <div className="w-12 h-12 rounded-xl bg-surgical-blue/10 flex items-center justify-center text-surgical-blue group-hover:scale-110 transition-transform"><UserPlus size={22} /></div>
                          <div>
                             <p className="text-sm font-black uppercase tracking-widest mb-1">Register New</p>
                             <p className="text-[10px] text-white/30 font-medium">Create clinical identity now</p>
                          </div>
                       </button>
                    </motion.div>
                  ) : modalStep === "existing" ? (
                    <motion.div key="existing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div className="relative">
                           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                           <input 
                              value={registrySearchTerm}
                              onChange={(e) => setRegistrySearchTerm(e.target.value)}
                              placeholder="Search MRN or Name..." 
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-surgical-blue/50 outline-none transition-all font-mono uppercase tracking-widest text-xs" 
                           />
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                           {existingPatients.filter(p => p.name.toLowerCase().includes(registrySearchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(registrySearchTerm.toLowerCase())).map(p => (
                              <button key={p.id} onClick={() => { setTargetPatient(p); setModalStep("new"); }} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-surgical-blue/30 hover:bg-white/[0.08] transition-all group">
                                 <div>
                                    <p className="text-[13px] font-bold group-hover:text-surgical-blue transition-colors text-left">{p.name}</p>
                                    <p className="text-[9px] text-white/30 font-mono text-left">{p.mrn}</p>
                                 </div>
                                 <Plus size={14} className="text-white/10 group-hover:text-surgical-blue" />
                              </button>
                           ))}
                        </div>
                        <button onClick={() => setModalStep("choice")} className="w-full text-[10px] text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors font-bold mt-4">← Back to Options</button>
                    </motion.div>
                  ) : (
                    <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <form onSubmit={handleAddAppointment} className="space-y-5 text-left">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Patient Full Name</label>
                            <input name="patientName" required defaultValue={targetPatient?.name || ""} readOnly={!!targetPatient} placeholder="JONATHAN REED" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-surgical-blue/50 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">MRN (Medical Record Number)</label>
                              {!targetPatient && (
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
                              )}
                            </div>
                            <input name="mrn" required defaultValue={targetPatient?.mrn || ""} readOnly={!!targetPatient} placeholder="MRN-82739" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-surgical-blue/50 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Surgery Time</label>
                            <input name="time" type="time" required defaultValue="09:00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-surgical-blue/50 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 block">Clinical Notes</label>
                            <textarea name="notes" placeholder="ROUTINE LAPAROSCOPIC CHOLECYSTECTOMY..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest focus:border-surgical-blue/50 outline-none transition-all h-24 resize-none" />
                          </div>

                          <button 
                            disabled={loading}
                            type="submit" 
                            className={cn(
                              "w-full bg-surgical-blue py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-surgical-blue/20 flex items-center justify-center gap-2 mt-4",
                              loading && "opacity-50"
                            )}
                          >
                            {loading ? "Persisting to Database..." : <><CheckCircle2 size={16} /> Confirm Schedule</>}
                          </button>
                          <button onClick={() => { setModalStep("choice"); setTargetPatient(null); }} type="button" className="w-full text-[10px] text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors font-bold mt-4">← Finalize Selection</button>
                        </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
