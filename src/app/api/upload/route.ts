import { NextRequest, NextResponse } from "next/server";
import { mkdir, unlink } from "fs/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import path from "path";
import { analyzeSurgicalEvidence } from "@/lib/gemini";
import { createJob, updateJob } from "@/lib/jobs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("video") as File | null;
    let doctorId = formData.get("doctorId") as string;
    if (!doctorId) doctorId = session.id;
    const patientId = formData.get("patientId") as string;

    const rawScreenshots = formData.get("screenshots") as string;
    
    // Safety check: Either video or screenshots must be present
    if (!file && (!rawScreenshots || JSON.parse(rawScreenshots).length === 0)) {
       return NextResponse.json({ error: "No clinical evidence provided (Missing Video or Screenshots)" }, { status: 400 });
    }
    if (!patientId) return NextResponse.json({ error: "Missing identity metadata (Patient)" }, { status: 400 });

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });
    let filename = "PROC-LOG-EVIDENCE";
    let relativeUrl = "";
    
    if (file) {
       filename = `PROC-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
       relativeUrl = `/uploads/${filename}`;
       tempFilePath = path.join(uploadDir, filename);

       const writeStream = createWriteStream(tempFilePath);
       const readableStream = Readable.fromWeb(file.stream() as any);
       await new Promise((resolve, reject) => {
         readableStream.pipe(writeStream);
         writeStream.on("finish", () => resolve(null));
         writeStream.on("error", reject);
         readableStream.on("error", reject);
       });
    }

    const job = await createJob(filename, relativeUrl, doctorId);

    // Process screenshots if present
    const screenshotUrls: string[] = [];
    if (rawScreenshots) {
       try {
          const base64Images = JSON.parse(rawScreenshots) as string[];
          for (let i = 0; i < base64Images.length; i++) {
             const base64Data = base64Images[i].replace(/^data:image\/\w+;base64,/, "");
             const ssFilename = `SS-${Date.now()}-${i}.jpg`;
             const ssPath = path.join(uploadDir, ssFilename);
             const ssUrl = `/uploads/${ssFilename}`;
             require("fs").writeFileSync(ssPath, base64Data, "base64");
             screenshotUrls.push(ssUrl);
          }
       } catch (e) { console.error("Screenshot capture failed:", e); }
    }

    // Fire and forget with relational profile
    (async () => {
      try {
        await updateJob(job.id, { status: "PROCESSING", progress: 10 });

        // Resolve authentic Metadata
        const doctor = await prisma.user.findUnique({ 
          where: { id: doctorId },
          include: { hospital: true }
        });
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });

        if (!doctor) throw new Error("Doctor profile not found in database.");

        const manualImages = rawScreenshots ? JSON.parse(rawScreenshots) as string[] : [];
        const analysis = await analyzeSurgicalEvidence({ 
          filePath: tempFilePath || undefined,
          base64Images: manualImages
        }, { 
          doctorName: doctor.name, 
          doctorAge: "—", 
          department: "Surgical Hub", 
          hospital: doctor.hospital.name 
        });
        
        // Persist structured AI Analysis permanently via native SQLite Enterprise Schema
        const dbCase = await prisma.case.create({
          data: {
             procedureName: analysis.procedureName || "Unknown Procedure",
             duration: analysis.duration || "N/A",
             cptCode: analysis.cptCode || "N/A",
             icdCode: analysis.icdCode || "N/A",
             scribeNote: analysis.scribeNote || "Report failed generation.",
             researchPaper: analysis.researchPaper || "",
             financialReport: analysis.financialReport || "",
             forensicReport: analysis.forensicReport || "",
             teachingPaper: analysis.teachingPaper || "",
             billingReport: analysis.billingReport || "",
             insuranceAudit: analysis.insuranceAudit || "",
             surgicalNotes: analysis.surgicalNotes || "",
             steps: JSON.stringify(analysis.steps || []),
             instruments: JSON.stringify(analysis.instruments || []),
             roiMetrics: JSON.stringify(analysis.roiMetrics || {}),
             patientFollowUp: JSON.stringify(analysis.patientFollowUp || []),
             surgeonPerformance: JSON.stringify(analysis.surgeonPerformance || []),
             screenshots: JSON.stringify(screenshotUrls),
             
             // Surgical Analyzer (Objective Metrics)
             motionStability: analysis.surgicalAnalyzer?.motionStability || 0.0,
             dissectionSafety: analysis.surgicalAnalyzer?.dissectionSafety || 0.0,
             bleedingRisk: analysis.surgicalAnalyzer?.bleedingRisk || 0.0,
             clipStability: analysis.surgicalAnalyzer?.clipStability || 0.0,
             cvsProxy: analysis.surgicalAnalyzer?.cvsProxy || 0.0,
             visualTelemetry: JSON.stringify(analysis.surgicalAnalyzer?.visualTelemetry || {}),
             overallScore: analysis.surgicalAnalyzer?.overallScore || 0.0,

             // Bleeding Intelligence (ERIF-V2 Mapping)
             bleedingDetected: analysis.surgicalAnalyzer?.bleedingIntelligence?.detected || false,
             approxBloodLoss: analysis.surgicalAnalyzer?.bleedingIntelligence?.approxBloodLoss || 0.0,
             bleedingDuration: analysis.surgicalAnalyzer?.bleedingIntelligence?.duration || "0s",
             bleedingLocations: JSON.stringify(analysis.surgicalAnalyzer?.bleedingIntelligence?.locations || []),
             maxBleedingTime: analysis.surgicalAnalyzer?.bleedingIntelligence?.maxBleedingTime || "00:00",
             bleedingIntensityGraph: JSON.stringify(analysis.surgicalAnalyzer?.bleedingIntelligence?.intensityGraph || []),

             doctorId: doctorId,
             patientId: patientId
          }
        });

        // Link the success job back to the permanent relational Case
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED", progress: 100, caseId: dbCase.id }
        });

        console.log(`[CELEST-ENTERPRISE] Case ${dbCase.id} successfully committed! Job ${job.id} Successful`);
      } catch (err: any) {
        console.error(`[CELEST-BACKTHREAD] Job ${job.id} Failed:`, err.message);
        await updateJob(job.id, { status: "FAILED", error: err.message });
      }
    })();

    return NextResponse.json({ success: true, jobId: job.id, message: "Analysis running in background." });
  } catch (error: any) {
    if (tempFilePath) { try { await unlink(tempFilePath); } catch (e) {} }
    return NextResponse.json({ error: error.message || "Ingestion Failed" }, { status: 500 });
  }
}
