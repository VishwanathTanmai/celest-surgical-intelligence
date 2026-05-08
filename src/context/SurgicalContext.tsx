"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getQuotaData, incrementQuota, isOverQuota, getRemainingQuota, getQuotaPercentage, resetQuota as resetQuotaLib } from "@/lib/quota";
import type { JobStatus, SurgicalJob } from "@/lib/jobs";
import { getCaseById } from "@/app/clinical/actions";

export interface SurgicalStep {
  time: number;
  label: string;
  duration: string;
  status: "completed" | "in-progress" | "pending";
  progress: number;
}

export interface Instrument {
  name: string;
  count: number;
  active: boolean;
}

export interface DoctorProfile {
  name: string;
  age: string;
  department: string;
  hospital: string;
}

export interface AnalysisResult {
  id?: string;
  procedureName: string;
  surgeonName: string;
  patientMrn: string;
  duration: string;
  steps: SurgicalStep[];
  instruments: Instrument[];
  scribeNote: string;
  cptCode: string;
  icdCode: string;
  roiMetrics: {
    timeSaved: string;
    supplyOptimization: string;
    efficiencyGain: string;
  };
  patientFollowUp?: { week: number; visitType: string; status: string }[];
  surgeonPerformance?: { metric: string; value: string; benchmark: string }[];
  researchPaper?: string;
  financialReport?: string;
  forensicReport?: string;
  teachingPaper?: string;
  billingReport?: string;
  insuranceAudit?: string;
  surgicalNotes?: string;
  reviewStatus?: string;
  adminReview?: string;
  screenshots?: string;
}

interface SurgicalContextType {
  videoUrl: string | null;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  error: string | null;
  doctorProfile: DoctorProfile | null;
  user: any | null;
  quotaCount: number;
  quotaPercentage: number;
  isOverMonthlyLimit: boolean;
  activeJobs: SurgicalJob[];
  lastRegisteredPatient: any | null;
  setVideoUrl: (url: string | null) => void;
  setDoctorProfile: (profile: DoctorProfile) => void;
  setLastRegisteredPatient: (patient: any | null) => void;
  startAnalysis: (file: File | null, patientId: string, screenshots?: string[]) => Promise<void>;
  refreshQuota: () => void;
  resetQuota: () => void;
  clearError: () => void;
  selectCase: (id: string) => Promise<void>;
  closeCase: () => void;
  // Live Hierarchical Architecture
  isLive: boolean;
  setIsLive: (val: boolean) => void;
  liveScribe: string[];
  setLiveScribe: (val: string[] | ((prev: string[]) => string[])) => void;
  surgicalState: {
     phase: number;
     landmarks: string[];
     activeTools: Record<string, number>;
     lastSummary: string;
  };
  setSurgicalState: (val: any | ((prev: any) => any)) => void;
  // Recording State
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
  recordingPatientId: string | null;
  setRecordingPatientId: (val: string | null) => void;
  // Hardware Discovery
  availableCameras: MediaDeviceInfo[];
  setAvailableCameras: (val: MediaDeviceInfo[]) => void;
  selectedCameraId: string | null;
  setSelectedCameraId: (val: string | null) => void;
}

const SurgicalContext = createContext<SurgicalContextType | undefined>(undefined);

export function SurgicalProvider({ children }: { children: ReactNode }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [quotaData, setQuotaData] = useState({ count: 0, month: 0, year: 0 });
  const [activeJobs, setActiveJobs] = useState<SurgicalJob[]>([]);
  const [lastRegisteredPatient, setLastRegisteredPatient] = useState<any | null>(null);
  
  // Live State Machine
  const [isLive, setIsLive] = useState(false);
  const [liveScribe, setLiveScribe] = useState<string[]>([]);
  const [surgicalState, setSurgicalState] = useState({
     phase: 1,
     landmarks: [],
     activeTools: {},
     lastSummary: ""
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPatientId, setRecordingPatientId] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        if (data.user) {
          setDoctorProfile({
             name: data.user.name,
             age: "—",
             department: data.user.department || "General Surgery",
             hospital: data.user.hospitalName || "General Hospital"
          });
        }
      });
  }, []);

  const refreshQuota = () => setQuotaData(getQuotaData());
  const resetQuota = () => {
    resetQuotaLib();
    refreshQuota();
  };
  const clearError = () => setError(null);

  useEffect(() => {
    setQuotaData(getQuotaData());
  }, []);

  const selectCase = async (id: string) => {
     const data = await getCaseById(id);
     if (data) {
        setAnalysisResult(data as any);
        router.push(`/?caseId=${id}`);
     }
  };

  const closeCase = () => {
     setAnalysisResult(null);
     setVideoUrl(null);
     router.push("/");
  };

  useEffect(() => {
     const cid = searchParams.get("caseId");
     if (cid && (!analysisResult || (analysisResult as any).id !== cid)) {
        selectCase(cid);
     }
  }, [searchParams]);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const processing = activeJobs.filter(j => j.status === "PENDING" || j.status === "PROCESSING");
      if (processing.length === 0) return;
      for (const job of processing) {
        try {
          const res = await fetch(`/api/analysis/${job.id}`);
          if (!res.ok) continue;
          const updated = await res.json();
          setActiveJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
          if (updated.status === "COMPLETED") {
            setAnalysisResult(updated.result);
            setVideoUrl(updated.videoUrl);
            setIsAnalyzing(false);
            incrementQuota();
            refreshQuota();
          } else if (updated.status === "FAILED") {
            setError(`Background Synthesis Failed: ${updated.error}`);
            setIsAnalyzing(false);
          }
        } catch (e) {}
      }
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [activeJobs]);

  const startAnalysis = async (file: File | null, patientId: string, screenshots?: string[]) => {
    if (isOverQuota()) { setError("Monthly quota reached (50/50)."); return; }
    
    setIsAnalyzing(true);
    setError(null);
    if (file) {
       setVideoUrl(URL.createObjectURL(file));
    }
 
    const formData = new FormData();
    if (file) {
       formData.append("video", file);
    }
    if (user?.id) {
       formData.append("doctorId", user.id);
    }
    formData.append("patientId", patientId);
    if (screenshots) {
       formData.append("screenshots", JSON.stringify(screenshots));
    }

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ingestion Error");
      setActiveJobs(prev => [...prev, { id: data.jobId, status: "PROCESSING", progress: 10, filename: file ? file.name : "Manual Frame Synthesis" } as SurgicalJob]);
    } catch (err: any) {
      setError(err.message);
      setVideoUrl(null);
      setIsAnalyzing(false);
    }
  };

  return (
    <SurgicalContext.Provider value={{
      videoUrl, isAnalyzing, analysisResult, error, doctorProfile, user,
      quotaCount: quotaData.count, quotaPercentage: getQuotaPercentage(),
      isOverMonthlyLimit: isOverQuota(), activeJobs,
      lastRegisteredPatient,
      setVideoUrl, setDoctorProfile, setLastRegisteredPatient,
      startAnalysis, refreshQuota, resetQuota, clearError, selectCase, closeCase,
      isLive, setIsLive, liveScribe, setLiveScribe, surgicalState, setSurgicalState,
      isRecording, setIsRecording, recordingPatientId, setRecordingPatientId,
      availableCameras, setAvailableCameras, selectedCameraId, setSelectedCameraId
    }}>
      {children}
    </SurgicalContext.Provider>
  );
}

export function useSurgical() {
  const ctx = useContext(SurgicalContext);
  if (!ctx) throw new Error("useSurgical must be used within SurgicalProvider");
  return ctx;
}
