import { AnalysisResult } from "@/context/SurgicalContext";
import { prisma } from "@/lib/db";

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface SurgicalJob {
  id: string;
  status: JobStatus;
  progress: number;
  result?: AnalysisResult;
  error?: string;
  videoUrl?: string;
  filename?: string;
}

export async function createJob(filename: string, videoUrl: string, doctorId: string): Promise<SurgicalJob> {
  const dbJob = await prisma.job.create({
    data: {
      status: "PENDING",
      progress: 0,
      filename,
      videoUrl,
      doctorId
    }
  });

  return {
    id: dbJob.id,
    status: dbJob.status as JobStatus,
    progress: dbJob.progress,
    filename: dbJob.filename || undefined,
    videoUrl: dbJob.videoUrl || undefined,
  };
}

export async function updateJob(id: string, updates: Partial<SurgicalJob>) {
  const data: any = {};
  if (updates.status) data.status = updates.status;
  if (updates.progress !== undefined) data.progress = updates.progress;
  if (updates.error) data.error = updates.error;
  
  await prisma.job.update({
    where: { id },
    data
  });
}

export async function getJob(id: string): Promise<SurgicalJob | undefined> {
  const dbJob = await prisma.job.findUnique({
    where: { id },
  });

  if (!dbJob) return undefined;

  let resultParsed: AnalysisResult | undefined = undefined;
  if (dbJob.caseId) {
    const dbCase = await prisma.case.findUnique({ 
      where: { id: dbJob.caseId },
      include: { doctor: true, patient: true }
    });

    if (dbCase) {
      const safeParse = (str: string, fallback: any) => {
        try { return JSON.parse(str); } catch { return fallback; }
      };
      resultParsed = {
        id: dbCase.id,
        procedureName: dbCase.procedureName,
        surgeonName: dbCase.doctor.name,
        patientMrn: dbCase.patient.mrn,
        duration: dbCase.duration,
        cptCode: dbCase.cptCode,
        icdCode: dbCase.icdCode,
        scribeNote: dbCase.scribeNote,
        researchPaper: dbCase.researchPaper,
        financialReport: dbCase.financialReport,
        forensicReport: dbCase.forensicReport,
        teachingPaper: dbCase.teachingPaper,
        billingReport: dbCase.billingReport,
        insuranceAudit: dbCase.insuranceAudit,
        surgicalNotes: dbCase.surgicalNotes,
        reviewStatus: dbCase.reviewStatus,
        adminReview: dbCase.adminReview || undefined,
        screenshots: dbCase.screenshots,
        steps: safeParse(dbCase.steps, []),
        instruments: safeParse(dbCase.instruments, []),
        roiMetrics: safeParse(dbCase.roiMetrics, {}),
        patientFollowUp: safeParse(dbCase.patientFollowUp, []),
        surgeonPerformance: safeParse(dbCase.surgeonPerformance, []),
      };
    }
  }

  return {
    id: dbJob.id,
    status: dbJob.status as JobStatus,
    progress: dbJob.progress,
    filename: dbJob.filename || undefined,
    videoUrl: dbJob.videoUrl || undefined,
    error: dbJob.error || undefined,
    result: resultParsed,
  };
}
