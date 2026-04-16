"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Navbar } from "@/components/layout/Navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Database, Plus, Search, AlertCircle, ShoppingCart, RefreshCcw, Box, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getHospitalInventory, updateInventory, createInventoryItem } from "@/app/clinical/actions";
import { cn } from "@/lib/utils";

const STATUS_MAP: any = {
  "IN_STOCK": { color: "text-surgical-teal bg-surgical-teal/10", icon: Box },
  "LOW_STOCK": { color: "text-amber-500 bg-amber-500/10", icon: AlertCircle },
  "OUT_OF_STOCK": { color: "text-surgical-crimson bg-surgical-crimson/10", icon: Package },
};

export default function ClinicalInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  async function load() {
    const data = await getHospitalInventory();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (id: string, newQty: number) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("quantity", String(newQty));
    await updateInventory(formData);
    load();
  };

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-surgical-dark text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-surgical-teal text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                 <span className="w-2 h-[2px] bg-surgical-teal" /> Hospital Logistics
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Clinical Inventory</h1>
              <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-mono">Precision Resource Management • {items.length} Active SKUs</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="bg-surgical-teal px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-surgical-teal/90 transition-all flex items-center gap-2 shadow-lg shadow-surgical-teal/20 text-white">
               <Plus size={14} /> Add Supply Item
            </button>
          </div>

          <GlassCard className="p-4 border-white/5 bg-white/[0.01]">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-surgical-teal transition-colors" size={18} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Hospital Supplies (Sutures, Blades, Mesh)..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all placeholder:text-white/10" 
              />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
               <div className="p-20 text-center text-white/5 uppercase tracking-[0.5em] animate-pulse text-xs">Syncing Logistics Engine...</div>
            ) : (
              filtered.map((item, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={item.id}>
                  <GlassCard className="p-6 border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-surgical-teal/10 group-hover:text-surgical-teal transition-colors">
                            <Database size={24} />
                         </div>
                         <div>
                            <p className="text-[15px] font-bold text-white/90">{item.name}</p>
                            <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase">{item.category} • SKU-{item.id.substring(0, 8)}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-12">
                         <div className="text-right">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Status</p>
                            <div className={cn("text-[9px] font-extrabold uppercase py-1 px-2 rounded-md border flex items-center gap-1.5", 
                              STATUS_MAP[item.status].color, item.status === "IN_STOCK" ? "border-surgical-teal/20" : "border-amber-500/20"
                            )}>
                               {React.createElement(STATUS_MAP[item.status].icon, { size: 10 })}
                               {item.status.replace(/_/g, ' ')}
                            </div>
                         </div>
                         <div className="text-right flex items-center gap-4 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                            <div className="text-right">
                               <p className="text-[9px] text-white/30 uppercase tracking-widest mb-0.5">Quantity</p>
                               <p className="text-xl font-mono font-bold text-surgical-teal">{item.quantity}<span className="text-[10px] text-white/20 ml-1">{item.unit}</span></p>
                            </div>
                            <div className="flex flex-col gap-1">
                               <button onClick={() => handleUpdate(item.id, item.quantity + 1)} className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white">▲</button>
                               <button onClick={() => handleUpdate(item.id, item.quantity - 1)} className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white">▼</button>
                            </div>
                         </div>
                         <button className="p-3 rounded-xl bg-white/5 text-white/20 group-hover:bg-surgical-teal group-hover:text-white transition-all">
                            <ShoppingCart size={20} />
                         </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/10 uppercase tracking-widest text-xs">No Clinical Resources In Database</div>
            )}
          </div>
         </main>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <GlassCard className="w-[500px] p-8 border-white/10 bg-surgical-dark shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-surgical-teal/10 text-surgical-teal rounded-xl"><Package size={20} /></div>
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-widest text-white/80">Logistics Ingestion</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-tighter">Add Clinical Resource to Database</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAdd(false)} className="text-white/20 hover:text-white transition-colors">✕</button>
                </div>

                <form action={async (formData) => {
                  const res = await createInventoryItem(formData);
                  if (res.success) {
                    setShowAdd(false);
                    load();
                  }
                }} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Item Name</label>
                    <input name="name" required placeholder="POLYPROPYLENE SUTURE 4-0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all font-mono" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Category</label>
                      <select name="category" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all">
                        <option value="SUTURES">SUTURES</option>
                        <option value="BLADES">BLADES</option>
                        <option value="STAPLERS">STAPLERS</option>
                        <option value="MESH">MESH</option>
                        <option value="GLOVES">GLOVES</option>
                        <option value="OTHERS">OTHERS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Unit Type</label>
                      <input name="unit" defaultValue="UNITS" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Initial Quantity</label>
                      <input name="quantity" type="number" required defaultValue="20" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Min Threshold</label>
                      <input name="minQuantity" type="number" required defaultValue="5" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-surgical-teal/50 transition-all font-mono" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-surgical-teal text-white rounded-xl text-[11px] font-extrabold uppercase tracking-[0.2em] shadow-lg shadow-surgical-teal/20 mt-4 hover:bg-surgical-teal/90 transition-all">
                    Finalize Ingestion Update
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
