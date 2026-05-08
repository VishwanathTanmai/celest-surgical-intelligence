"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Layers, 
  Video, 
  BarChart3, 
  Settings, 
  Users, 
  History, 
  ShieldCheck, 
  Plus, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSurgical } from "@/context/SurgicalContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";

const DOCTOR_NAV = [
  { icon: Activity, label: "Clinical Workspace", href: "/" },
  { icon: BarChart3, label: "Personal Analytics", href: "/analytics" },
  { icon: History, label: "My Case Archives", href: "/archives" },
  { icon: Users, label: "Patient Registry", href: "/patients" },
  { icon: FileText, label: "Hospital EMR", href: "/clinical/emr" },
];

const ADMIN_NAV = [
  { icon: Layers, label: "Hospital Dashboard", href: "/admin" },
  { icon: Users, label: "Doctor Oversight", href: "/admin/doctors" },
  { icon: Database, label: "Clinical Inventory", href: "/admin/inventory" },
  { icon: FileText, label: "Hospital EMR", href: "/clinical/emr" },
  { icon: ShieldCheck, label: "Security & Audit", href: "/admin/security" },
];

export function Sidebar() {
  const { analysisResult, quotaCount, quotaPercentage, isOverMonthlyLimit, activeJobs, resetQuota } = useSurgical();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => setUser(data.user || null));
  }, []);

  const menuItems = user?.role === "ADMIN" ? ADMIN_NAV : DOCTOR_NAV;

  const handleLogout = async () => {
    await signOutAction();
  };

  if (!mounted) return <aside className="w-64 h-screen border-r border-white/5 bg-surgical-dark p-6 shrink-0" />;

  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-surgical-dark flex flex-col p-6 overflow-hidden shrink-0">
      <Link href={user?.role === "ADMIN" ? "/admin" : "/"} className="flex items-center gap-3 mb-10 px-2 transition-all hover:opacity-80 cursor-pointer">
        <div className="w-8 h-8 bg-gradient-to-br from-surgical-blue to-surgical-teal rounded-lg flex items-center justify-center font-bold text-white tracking-widest shadow-lg shadow-surgical-blue/20">
          C
        </div>
        <div>
          <h1 className="text-[15px] font-bold tracking-tight uppercase">Celest</h1>
          <p className="text-[8px] text-surgical-blue font-mono tracking-widest uppercase">Intelligence Platform</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item, i) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all group",
                isActive 
                  ? "bg-surgical-blue text-white shadow-lg shadow-surgical-blue/20" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={cn(isActive ? "text-white" : "group-hover:text-surgical-blue transition-colors")} />
                <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-surgical-blue/20 border border-white/10 flex items-center justify-center text-[10px] font-bold text-surgical-blue shrink-0">
              {user?.name?.[0] || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold truncate">
                {user?.name || "Authenticating..."}
              </p>
              <p className="text-[9px] text-white/40 uppercase tracking-tighter truncate">{user?.role || "Session"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors group shrink-0">
            <LogOut size={16} className="text-white/20 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Navbar() {
  const { analysisResult, isAnalyzing, activeJobs } = useSurgical();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => setUser(data.user || null));
  }, []);

  const notifications = React.useMemo(() => {
    let notifs = [];
    if (analysisResult) {
      notifs.push({ id: 'done', title: "Analysis Complete", desc: `Successfully processed ${analysisResult.procedureName}`, time: "Just now", icon: CheckCircle2, color: "text-surgical-teal", bg: "bg-surgical-teal/10" });
    }
    if (isAnalyzing) {
      notifs.push({ id: 'analyzing', title: "AI Extraction Active", desc: "Synthesizing multimodal scribe notes...", time: "In progress...", icon: Loader2, color: "text-surgical-blue", bg: "bg-surgical-blue/10", spin: true });
    }
    activeJobs.forEach(job => {
      notifs.push({ id: job.id, title: "Data Ingestion", desc: `Streaming ${job.filename} (${job.progress}%)`, time: "Active", icon: Activity, color: "text-white/60", bg: "bg-white/5" });
    });
    if (notifs.length === 0) {
      notifs.push({ id: 'idle', title: "System Ready", desc: "Awaiting new surgical acquisition.", time: "Idle", icon: AlertCircle, color: "text-white/30", bg: "bg-white/5" });
    }
    return notifs;
  }, [analysisResult, isAnalyzing, activeJobs]);

  if (!mounted) return <header className="h-16 border-b border-white/5 px-8 bg-surgical-dark/80 shrink-0" />;

  return (
    <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-surgical-dark/80 backdrop-blur-md z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-white/40 group cursor-pointer hover:text-white transition-colors">
          <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
          <span className="text-[11px] uppercase tracking-widest font-bold">
            CELEST • {analysisResult ? analysisResult.procedureName : (isAnalyzing ? "IDENTIFYING CASE..." : "IDLE")}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/5" />

        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-surgical-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search forensic archives..." 
            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[11px] w-64 focus:outline-none focus:border-surgical-blue/50 transition-all placeholder:tracking-tight"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-white/5 rounded-lg transition-colors group">
            <Bell size={18} className="text-white/40 group-hover:text-white transition-colors" />
            {(isAnalyzing || activeJobs.length > 0 || analysisResult) && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-surgical-teal rounded-full border-2 border-surgical-dark animate-pulse" />
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-80 glass-effect border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/70">Real-Time Activity</h4>
                  <span className="text-[9px] font-mono text-surgical-blue px-2 py-0.5 bg-surgical-blue/10 rounded-full">{notifications.length} Events</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={cn("p-2 rounded-lg shrink-0 h-fit", n.bg, n.color)}>
                        <n.icon size={14} className={cn(n.spin && "animate-spin")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[11px] font-bold tracking-tight text-white/90 truncate">{n.title}</p>
                          <span className="text-[8px] font-mono text-white/30 uppercase tracking-tighter shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-white/50 leading-tight">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link 
          href={user?.role === "ADMIN" ? "/admin/doctors" : "/"}
          className="bg-surgical-blue px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-surgical-blue/90 transition-all shadow-lg shadow-surgical-blue/20 group"
        >
          {user?.role === "ADMIN" ? <UserPlus size={14} className="group-hover:scale-110 transition-transform" /> : <Plus size={14} className="group-hover:rotate-90 transition-transform" />}
          {user?.role === "ADMIN" ? "Institutional Registry" : "New Acquisition"}
        </Link>
      </div>
    </header>
  );
}
