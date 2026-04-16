"use client";

import React from "react";

import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, History, List, Grid, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSurgical } from "@/context/SurgicalContext";
import Link from "next/link";

import { getHistoricalCases } from "./actions";

export default function ArchivesPage() {
  const { isAnalyzing } = useSurgical();
  const [dbCases, setDbCases] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getHistoricalCases().then(data => {
      setDbCases(data);
      setLoading(false);
    });
  }, [isAnalyzing]);

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Forensic Archives</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Immutable Clinical SQL Records • {dbCases.length} Entries</p>
            </div>
            {dbCases.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input type="text" placeholder="Search database keys..." className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm w-96 focus:outline-none focus:border-surgical-blue/50 transition-all font-mono" />
              </div>
            )}
          </div>

          {loading ? (
             <div className="w-full flex justify-center py-32"><span className="animate-pulse text-surgical-blue font-mono uppercase tracking-widest text-xs">Querying Database...</span></div>
          ) : dbCases.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <History size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Forensic Records</h3>
              <p className="text-white/40 text-sm max-w-md mb-8">Forensic archives are generated from real surgical analyses. Upload a procedure to begin.</p>
              <Link href="/" className="bg-surgical-blue px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-blue/90 transition-colors flex items-center gap-2">
                <Upload size={14} /> Go to Dashboard
              </Link>
            </motion.div>
          ) : (
            <GlassCard className="p-0 border-white/5 bg-white/[0.01] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.03] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Database UUID</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Procedure Profile</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">CPT Code</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Extracted Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {dbCases.map((sqlCase, i) => (
                    <motion.tr key={sqlCase.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[11px] font-mono text-surgical-blue truncate max-w-[120px]">{sqlCase.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold">{sqlCase.procedureName}</p>
                        <p className="text-[9px] text-white/20 uppercase font-mono tracking-tighter">{sqlCase.surgeonName} • {sqlCase.patientMrn}</p>
                      </td>
                      <td className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-white/60">{sqlCase.cptCode}</td>
                      <td className="px-6 py-4 text-right">
                         <span className="bg-surgical-teal/10 text-surgical-teal text-[9px] font-bold px-2 py-0.5 rounded-full border border-surgical-teal/20 uppercase tracking-tighter">Committed</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          )}
        </main>
      </div>
    </div>
  );
}
