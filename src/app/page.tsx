"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Brain, Shield, Zap, Activity, Microscope, Video, Lock, Clock, Send, CheckCircle2, Menu, X } from "lucide-react";
import ThreeDScene from "@/components/landing/ThreeDScene";
import { sendContactEmail } from "./actions/contact";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const result = await sendContactEmail(formData);
    
    if (result.success) {
      setFormStatus("success");
      setFormMessage(result.message || "Message sent successfully!");
      (e.target as HTMLFormElement).reset();
    } else {
      setFormStatus("error");
      setFormMessage(result.error || "Failed to send message.");
    }
    
    setTimeout(() => {
      if (result.success) setFormStatus("idle");
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-surgical-teal/30 overflow-x-hidden font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-surgical-blue to-surgical-teal flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <Microscope size={18} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
              CELEST
            </span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Specifications", "Workflow", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <div className="flex items-center gap-4">
              <Link href="/auth/signin" className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors font-bold">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-6 py-2.5 rounded-full bg-surgical-teal/20 hover:bg-surgical-teal/30 text-surgical-teal border border-surgical-teal/20 text-[10px] uppercase tracking-widest font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-md">
                Sign Up <ChevronRight size={14} />
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-[#0a0a0a] border-b border-white/5 p-6 flex flex-col gap-4 shadow-2xl">
            {["Features", "Specifications", "Workflow", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors py-2">
                {item}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/auth/signin" className="px-6 py-3 rounded-xl bg-white/5 text-white text-center border border-white/10 text-xs uppercase tracking-widest font-bold">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-6 py-3 rounded-xl bg-surgical-teal/20 text-surgical-teal text-center border border-surgical-teal/20 text-xs uppercase tracking-widest font-bold">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <ThreeDScene />
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center mt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surgical-teal/10 border border-surgical-teal/20 text-surgical-teal text-[10px] font-black tracking-[0.2em] uppercase mb-8 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-surgical-teal animate-pulse" />
            Next-Gen Surgical AI
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6 max-w-5xl"
          >
            Operative Intelligence <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-surgical-blue via-surgical-teal to-white">
              Synthesized.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl font-light mb-12"
          >
            CELEST transforms raw surgical video into actionable clinical intelligence, forensic documentation, and real-time intraoperative guidance.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/auth/signup" className="px-8 py-4 rounded-xl bg-white text-black hover:bg-white/90 text-xs uppercase tracking-[0.2em] font-black transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2">
              <Zap size={16} /> Create Account
            </Link>
            <a href="#features" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs uppercase tracking-[0.2em] font-bold transition-all backdrop-blur-md">
              Explore Architecture
            </a>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[9px] uppercase tracking-widest">Scroll to Discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Core Architecture</h2>
            <p className="text-white/40 max-w-xl">Advanced computational models designed for high-stakes medical environments.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Contextual AI Agent", desc: "Monitors surgical steps in real-time, anticipating needs and flagging deviations from standardized protocols.", color: "text-surgical-blue", bg: "bg-surgical-blue/10" },
              { icon: Activity, title: "Live Vitals Telemetry", desc: "Seamless integration with Holoscan for real-time blood loss estimation, heart rate, and surgical metrics.", color: "text-surgical-crimson", bg: "bg-surgical-crimson/10" },
              { icon: Shield, title: "Forensic Vault", desc: "Immutable storage of operative data, generating automated CPT billing codes and malpractice defense logs.", color: "text-surgical-teal", bg: "bg-surgical-teal/10" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={feature.color} size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specifications" className="py-32 bg-black/50 border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Technical Specifications</h2>
              <p className="text-white/40 mb-12 text-lg">Engineered for zero-latency environments where every millisecond dictates clinical outcomes.</p>
              
              <div className="space-y-6">
                {[
                  { icon: Video, title: "4K 60FPS Ingestion", desc: "Hardware-accelerated video processing pipeline via WebRTC and MediaRecorder APIs." },
                  { icon: Clock, title: "Sub-100ms Latency", desc: "Optimized WebSocket transport layer for instantaneous telemetry synchronization." },
                  { icon: Lock, title: "End-to-End Encryption", desc: "HIPAA-compliant data transit with secure JWT authentication and edge-runtime validation." },
                  { icon: Zap, title: "NVIDIA Holoscan Ready", desc: "Native bindings for accelerated AI inference on Clara architecture." },
                ].map((spec, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 mt-1">
                      <spec.icon size={18} className="text-surgical-teal" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold mb-1">{spec.title}</h4>
                      <p className="text-xs text-white/40 leading-relaxed">{spec.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-surgical-blue/20 to-surgical-teal/20 blur-[100px] rounded-full" />
              <div className="relative p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">System Diagnostics</span>
                  <span className="px-3 py-1 bg-surgical-teal/10 text-surgical-teal text-[9px] font-bold uppercase tracking-widest rounded-md border border-surgical-teal/20">Optimal</span>
                </div>
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center"><span className="text-white/40">Inference Engine</span><span className="text-white">Gemini 1.5 Pro</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/40">Frame Buffer</span><span className="text-white">Active (128mb)</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/40">Socket Status</span><span className="text-surgical-teal">Connected wss://</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/40">Data Vault</span><span className="text-white">Prisma DB Edge</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="workflow" className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Operational Workflow</h2>
            <p className="text-white/40 max-w-xl mx-auto">From live incision to comprehensive post-op documentation in three phases.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {[
              { step: "01", title: "Capture", desc: "Establish video feed from endoscope or room cameras. CELEST begins ingesting frames securely." },
              { step: "02", title: "Analyze", desc: "AI models process the feed, tracking instruments, segmenting anatomy, and monitoring vitals in real-time." },
              { step: "03", title: "Synthesize", desc: "Upon case closure, a comprehensive report detailing ROI, billing codes, and safety metrics is generated." },
            ].map((phase, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-3xl font-black text-surgical-teal shadow-2xl mb-6">
                  {phase.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{phase.title}</h3>
                <p className="text-sm text-white/50">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surgical-blue/5 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-16 backdrop-blur-xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Initiate Deployment</h2>
              <p className="text-white/40">Contact our engineering team to schedule a technical demonstration for your institution.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Full Name</label>
                  <input required type="text" id="name" name="name" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-surgical-teal/50 transition-colors placeholder:text-white/20" placeholder="Dr. Sarah Chen" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Institutional Email</label>
                  <input required type="email" id="email" name="email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-surgical-teal/50 transition-colors placeholder:text-white/20" placeholder="schen@hospital.org" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Deployment Requirements</label>
                <textarea required id="message" name="message" rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-surgical-teal/50 transition-colors placeholder:text-white/20 resize-none" placeholder="We are looking to integrate CELEST into 12 ORs..."></textarea>
              </div>

              {formStatus === "error" && (
                <div className="p-4 rounded-xl bg-surgical-crimson/10 border border-surgical-crimson/20 text-surgical-crimson text-xs font-medium text-center">
                  {formMessage}
                </div>
              )}
              {formStatus === "success" && (
                <div className="p-4 rounded-xl bg-surgical-teal/10 border border-surgical-teal/20 text-surgical-teal text-xs font-medium text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> {formMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={formStatus === "submitting" || formStatus === "success"}
                className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus === "submitting" ? (
                  <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Processing...</>
                ) : formStatus === "success" ? (
                  <><CheckCircle2 size={16} /> Transmission Complete</>
                ) : (
                  <><Send size={16} /> Transmit Request</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Microscope size={20} className="text-surgical-teal" />
            <span className="text-sm font-black tracking-[0.2em] uppercase">CELEST</span>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            © {new Date().getFullYear()} Taurean Surgical Intelligence. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="mailto:contactus@taureansurgical.com" className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors">Contact</a>
            <Link href="/privacy" className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
