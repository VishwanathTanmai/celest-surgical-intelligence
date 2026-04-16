"use client";

import React, { useMemo } from "react";
import { useSurgical } from "@/context/SurgicalContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PenLine, FileText, Send, Sparkles, Wand2, Download, Copy, Share2, Stethoscope, Briefcase, Loader2, CheckCircle2, ShieldCheck, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateCaseModule } from "@/app/clinical/actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const IntelligenceWorkspace = React.memo(function WorkspacePanel({ 
  activeTab: controlledTab, 
  onTabChange 
}: { 
  activeTab?: string; 
  onTabChange?: (tab: string) => void;
}) {
  const { analysisResult, isAnalyzing, selectCase } = useSurgical();
  const [localTab, setLocalTab] = React.useState<string>("clinical");
  const [synthesizing, setSynthesizing] = React.useState<string | null>(null);
  
  const activeTab = controlledTab || localTab;
  const setActiveTab = (tab: string) => {
    if (onTabChange) onTabChange(tab);
    else setLocalTab(tab);
  };

  if (!analysisResult && !isAnalyzing) return null;

  const tabs = [
    { id: "clinical", label: "Scribe Note", icon: PenLine, content: analysisResult?.scribeNote },
    { id: "surgical-notes", label: "Surgical Notes", icon: Stethoscope, content: analysisResult?.surgicalNotes },
    { id: "research", label: "Medical Research", icon: FileText, content: analysisResult?.researchPaper },
    { id: "forensic", label: "Forensic ROI", icon: CheckCircle2, content: analysisResult?.forensicReport },
    { id: "insurance", label: "Insurance Audit", icon: ShieldCheck, content: analysisResult?.insuranceAudit },
    { id: "teaching", label: "E-Learning", icon: Sparkles, content: analysisResult?.teachingPaper },
    { id: "billing", label: "CPT Audit", icon: Briefcase, content: analysisResult?.billingReport }
  ] as const;

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  const handleSynthesize = async () => {
    const caseId = (analysisResult as any).id;
    if (!caseId) {
       console.error("Clinical ID missing for module synthesis. Context:", analysisResult);
       alert("Error: Critical Clinical ID missing from transmission stream.");
       return;
    }

    setSynthesizing(activeTab);
    try {
      const res = await generateCaseModule(caseId, activeTab);
      if (res.error) {
         alert(`Synthesis Failed: ${res.error}`);
      } else if (res.success) {
         // Smoothly refresh the active case data without a home page redirect
         await selectCase(caseId);
      }
    } catch (err: any) {
      alert(`Network Error: ${err.message}`);
    }
    setSynthesizing(null);
  };

  const isAdminReviewed = (analysisResult as any)?.reviewStatus === "REVIEWED";

  return (
    <GlassCard
      title="Surgical Intelligence Workspace"
      subtitle="Exhaustive Multi-Modal AI Generative Diagnostics"
      className="h-full flex flex-col"
    >
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-2 mt-4">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex whitespace-nowrap items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === t.id ? "bg-surgical-blue text-white shadow-lg shadow-surgical-blue/20" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            )}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 mt-6 overflow-hidden flex flex-col gap-4">
        <div className="flex-1 min-h-[350px] glass-effect p-8 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar relative z-0">
           {synthesizing === activeTab ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4 animate-in zoom-in duration-500">
                 <Loader2 size={40} className="animate-spin text-surgical-teal" />
                 <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-surgical-teal mb-2">Targeted Synthesis Active</p>
                    <p className="max-w-[250px] text-[11px] leading-relaxed italic">Drafting high-fidelity clinical report with dedicated enterprise tokens...</p>
                 </div>
              </div>
           ) : analysisResult ? (
            <div className="text-white/80 animate-in fade-in duration-700">
               {typeof activeContent === "string" && activeContent.length > 5 ? (
                  <div className="markdown-container text-white/80 leading-relaxed font-sans">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold text-surgical-blue border-b border-white/10 pb-2 mb-4 uppercase tracking-widest mt-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold text-surgical-teal mt-8 mb-4 uppercase tracking-wider" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-md font-bold text-white/60 mt-6 mb-2 uppercase" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 text-[13px] leading-relaxed text-white/70" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 space-y-2 text-[12px]" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-6 space-y-2 text-[12px]" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-8 border border-white/5 rounded-2xl bg-white/[0.01] shadow-2xl">
                            <table className="min-w-full divide-y divide-white/5 font-mono" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-white/5" {...props} />,
                        th: ({node, ...props}) => <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-surgical-blue" {...props} />,
                        td: ({node, ...props}) => <td className="px-6 py-4 text-[12px] text-white/50 border-t border-white/5" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-surgical-teal" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-surgical-blue/30 pl-6 py-2 italic my-6 bg-white/5 text-white/60" {...props} />
                      }}
                    >
                      {activeContent.replace(/\\n/g, "\n")}
                    </ReactMarkdown>
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                        <MessageSquare size={32} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Module Not Synthesized</h4>
                        <p className="text-[10px] text-white/20 mt-2 max-w-[280px] leading-relaxed">This data module requires targeted high-fidelity generation to bypass global token limits.</p>
                     </div>
                     <button 
                        onClick={handleSynthesize}
                        className="px-8 py-3 bg-surgical-teal text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-surgical-teal/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                     >
                        <Wand2 size={14} /> Synthesize Enterprise Data
                     </button>
                  </div>
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
              <Loader2 size={32} className="animate-spin text-surgical-blue" />
              <p className="max-w-[200px] text-center uppercase tracking-tighter">Drafting massive 10,000+ word enterprise dataset from multimodal stream...</p>
            </div>
          )}
        </div>

        {isAdminReviewed && (analysisResult as any).adminReview && (
          <div className="glass-effect p-4 border-surgical-teal/20 bg-surgical-teal/5 rounded-xl">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-surgical-teal" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-surgical-teal">Administrator Quality Review</span>
             </div>
             <p className="text-[11px] text-white/70 italic leading-relaxed">
                {(analysisResult as any).adminReview}
             </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-white/20">
            <button 
              onClick={() => {
                if (activeContent) {
                  navigator.clipboard.writeText(activeContent as string);
                  alert("Clinical Report Copied to Clipboard");
                }
              }}
              className="hover:text-white transition-colors"
            >
              <Copy size={16}/>
            </button>
            <button 
              onClick={() => window.print()}
              className="hover:text-white transition-colors"
            >
              <Download size={16}/>
            </button>
            <button className="hover:text-white transition-colors cursor-not-allowed opacity-50"><Share2 size={16}/></button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Enterprise Mode Active</span>
            <Wand2 size={12} className="text-surgical-blue animate-pulse" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
});
