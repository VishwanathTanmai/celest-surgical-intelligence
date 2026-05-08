import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import https from "https";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Optimized for structured clinical overview extraction
export const jsonModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    maxOutputTokens: 8192,
  }
});

// Optimized for exhaustive, multi-page clinical report synthesis
export const textModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
  }
});

// Alias for backwards compatibility if needed, but we should use specific ones
export const model = jsonModel;

interface DoctorInfo { doctorName: string; doctorAge: string; department: string; hospital: string; }

function httpsRequest(url: string, options: https.RequestOptions, body?: Buffer | null): Promise<{ headers: any; data: any }> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => { try { resolve({ headers: res.headers, data: data ? JSON.parse(data) : {} }); } catch { resolve({ headers: res.headers, data: {} }); } });
    });
    req.on("error", reject);
    if (body) req.end(body); else req.end();
  });
}

function streamUpload(url: string, filePath: string, fileSize: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = https.request({
      hostname: parsedUrl.hostname, path: parsedUrl.pathname + parsedUrl.search, method: "POST",
      headers: { "X-Goog-Upload-Command": "upload, finalize", "X-Goog-Upload-Offset": "0", "Content-Length": String(fileSize), "Content-Type": "video/mp4" }
    }, (res) => { let d = ""; res.on("data", c => d += c); res.on("end", () => { try { resolve(JSON.parse(d)); } catch { reject(new Error("Parse error")); } }); });
    req.on("error", reject);
    fs.createReadStream(filePath, { highWaterMark: 8 * 1024 * 1024 }).pipe(req);
  });
}

async function uploadFileViaREST(filePath: string): Promise<{ fileUri: string; mimeType: string }> {
  const fileSize = fs.statSync(filePath).size;
  console.log(`[CELEST-AI] Streaming upload (${(fileSize / 1024 / 1024).toFixed(0)}MB)...`);
  const initRes = await httpsRequest(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${API_KEY}`, {
    method: "POST", headers: {
      "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(fileSize), "X-Goog-Upload-Header-Content-Type": "video/mp4", "Content-Type": "application/json"
    }
  }, Buffer.from(JSON.stringify({ file: { displayName: path.basename(filePath) } })));
  const uploadUrl = initRes.headers["x-goog-upload-url"];
  if (!uploadUrl) throw new Error("Failed to get upload URL");
  const uploadData = await streamUpload(uploadUrl, filePath, fileSize);
  if (!uploadData?.file?.uri) throw new Error("No file URI returned");
  console.log(`[CELEST-AI] Upload complete: ${uploadData.file.name}`);
  return { fileUri: uploadData.file.uri, mimeType: "video/mp4" };
}

async function waitForFileActive(fileUri: string): Promise<void> {
  const fileName = fileUri.split("/").pop();
  for (let i = 0; i < 120; i++) {
    const res = await httpsRequest(`https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${API_KEY}`, { method: "GET" });
    if (res.data.state === "ACTIVE") { console.log("\n[CELEST-AI] File ACTIVE."); return; }
    if (res.data.state === "FAILED") throw new Error("Google processing failed");
    process.stdout.write(".");
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error("Processing timed out");
}

export async function analyzeSurgicalEvidence(evidence: { filePath?: string, base64Images?: string[] }, doctor: DoctorInfo) {
  let fileParts: any[] = [];
  if (evidence.filePath) {
    const { fileUri, mimeType } = await uploadFileViaREST(evidence.filePath);
    await waitForFileActive(fileUri);
    fileParts.push({ fileData: { mimeType, fileUri } });
  }

  if (evidence.base64Images) {
    evidence.base64Images.forEach(b64 => {
      fileParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: b64.includes("base64,") ? b64.split("base64,")[1] : b64
        }
      });
    });
  }

  console.log("[CELEST-AI] Running exhaustive, multi-modal evidence synthesis...");
  const prompt = `You are an elite surgical AI. Identify the EXACT procedure performed from the provided visual evidence (Video OR Images).

CRITICAL REQUIREMENT: Identify the EXACT procedure performed using clinical-grade terminology and CPT/ICD-10 standards. Analyze anatomical landmarks, surgical techniques, and instrument interactions to verify the EXACT intervention. AVOID generic or "random" labels.

Analyze this surgical video for Dr. ${doctor.doctorName} (${doctor.department}, ${doctor.hospital}).

You are tasked with generating a massive, exhaustive set of documentation. Maximize your token limit to produce the most detailed, high-fidelity output possible. Use standard Markdown formats and EXHAUSTIVE tabular data. DO NOT use literal line breaks inside JSON strings; use \\n.

REQUIRED SECTIONS (Each must be thousands of words and contain multiple detailed markdown tables):

TASK 1: Core Operative Note (scribeNote)
Generate a highly detailed operative report including pre-op, intra-op phases (exact surgical steps identified via anatomical landmarks), post-op orders, instruments used, and exact timelines.

TASK 2: Massive Academic Research Paper (researchPaper)
Draft an extensive, publication-ready research paper (approx. 10,000 lines of depth). Include Abstract, Introduction, Lit Review, Methodology, Analysis of Surgical Technique, Results, Discussion, and Conclusion. Use exhaustive technical detail.

TASK 3: Financial Insurance Report (financialReport)
Detailed cost-benefit analysis. Calculate EBL, surgical time, supply costs in Rupees (₹) and Dollars ($). Include tabular breakdowns of OR time cost, supply optimization, and projected insurance reimbursement models.

TASK 4: Forensic ROI & Audit Report (forensicReport)
A rigorous forensic audit of the procedure. Analyze any technical deviations, efficiency gains, safety protocols, and ROI. Use STRICTLY TABULAR FORMAT ONLY. NO PROSE.

TASK 5: Teaching Paper / E-Learning Module (teachingPaper)
A comprehensive curriculum module for medical students based on this case. Include learning objectives, step-by-step technical walkthroughs, Q&A sections, and assessment tables.

TASK 6: CPT AI Billing Report (billingReport)
An exhaustive justification for every possible ICD-10 and CPT code mapped to the procedure. Include modifier justifications and a tabular billing ledger.

TASK 7: Insurance AI Audit (insuranceAudit)
Identify any implants used (name, serial format, count) and clinical adherence to standard training protocols. Include a tabular audit checklist.

TASK 8: Surgical Procedure Notes (surgicalNotes)
Formal procedural documentation for the hospital record, focusing on technique and precision.

TASK 10: Bleeding Intelligence (ERIF-V2 Mandatory Check)
First, determine if any bleeding occurred during the procedure.
ONLY if bleeding was detected, provide:
1. Approximate blood loss (in mL).
2. Duration of bleeding (total active bleeding time).
3. List of anatomical locations where bleeding occurred.
4. Timestamp (HH:MM) at which peak bleeding intensity happened.
5. Bleeding intensity data points for every identified surgical step (0.0 to 1.0).

Return EXACTLY valid JSON matching this schema:
{
  "procedureName": "Official Name",
  "duration": "HH:MM",
  "steps": [{"time":0,"label":"Phase","duration":"1m","status":"completed","progress":100}],
  "instruments": [{"name":"Scalpel","count":1,"active":true}],
  "scribeNote": "Extensive text here...",
  "cptCode": "00000",
  "icdCode": "000.0",
  "roiMetrics": {"timeSaved":"X hrs","supplyOptimization":"₹XX,XXX","efficiencyGain":"XX%"},
  "patientFollowUp": [{"date":"2024-05-15","visitType":"Check","status":"scheduled"}],
  "surgeonPerformance": [{"metric":"Eefficacy","value":"XX%","benchmark":"Avg"}],
  "researchPaper": "# Massive deep-dive research paper content...",
  "financialReport": "# Complete Financial Report here...",
  "forensicReport": "# Forensic Audit here...",
  "teachingPaper": "# Teaching Curriculum here...",
  "billingReport": "# Billing Ledger here...",
  "insuranceAudit": "# Insurance AI Audit here...",
  "surgicalNotes": "# Formal Procedural Documentation here...",
  "surgicalAnalyzer": {
    "motionStability": 0.85,
    "dissectionSafety": 0.92,
    "bleedingRisk": 0.05,
    "clipStability": 0.98,
    "cvsProxy": 0.90,
    "visualTelemetry": {
      "brightness": 0.88,
      "sharpness": 0.95,
      "frameVariation": 0.12
    },
    "bleedingIntelligence": {
      "detected": true,
      "approxBloodLoss": 45.5,
      "duration": "12m 30s",
      "locations": ["Cystic Artery Bed", "Liver Surface"],
      "maxBleedingTime": "14:22",
      "intensityGraph": [{"step": "Gallbladder Dissection", "intensity": 0.4}, {"step": "Artery Ligation", "intensity": 0.8}]
    },
    "overallScore": 91.5
  }
}
`;

  const result = await jsonModel.generateContent([
    ...fileParts,
    { text: prompt },
  ]);
  const text = result.response.text();

  function sanitizeJson(raw: string): string {
    let s = raw.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("No JSON object found");
    s = s.substring(start, end + 1);
    s = s.replace(/"([^"]+)"\s*:\s*"([\s\S]*?)"(?=\s*[,}\]])/g, (match, key, val) => {
      const sanitizedVal = val
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
      return `"${key}": "${sanitizedVal}"`;
    });
    return s;
  }

  try { return JSON.parse(text); } catch { }
  try { return JSON.parse(sanitizeJson(text)); } catch (e: any) {
    let repaired = sanitizeJson(text);
    let openBraces = (repaired.match(/{/g) || []).length - (repaired.match(/}/g) || []).length;
    let openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;
    repaired = repaired.replace(/,\s*"[^"]*$/, '').replace(/,\s*$/, '');
    for (let i = 0; i < openBrackets; i++) repaired += ']';
    for (let i = 0; i < openBraces; i++) repaired += '}';
    return JSON.parse(repaired);
  }
}
export async function generateTargetedModule(scribeNote: string, moduleType: string) {
  console.log(`[CELEST-AI] Synthesizing targeted deep-dive: ${moduleType}...`);

  const instructionMap: Record<string, string> = {
    "research": "Draft an exhaustive, publication-ready research paper (approx. 10,000 lines of depth). Include Abstract, Introduction, Lit Review, Methodology, Analysis of Surgical Technique, Results, Discussion, and Conclusion.",
    "forensic": "Generate a rigorous forensic audit of the procedure using STRICTLY TABULAR FORMAT ONLY. Analyze technical deviations, safety protocols, and ROI.",
    "teaching": "Create a comprehensive medical curriculum module for medical students based on this case. Include step-by-step technical walkthroughs and assessment tables.",
    "billing": "Produce an exhaustive justification for every possible ICD-10 and CPT code. Include modifier justifications and a tabular billing ledger.",
    "insurance": "Conduct an Insurance AI Audit identifying implants and clinical adherence to standard protocols. Include a tabular audit checklist.",
    "surgical-notes": "Draft formal procedural documentation for the hospital record, focusing on technique and precision."
  };

  const instruction = instructionMap[moduleType] || "Generate a detailed clinical report.";

  const prompt = `You are an elite surgical AI agent. Using the provided Operative Scribe Note below, fulfill the following task:

TASK: ${instruction}

OPERATIVE SCRIBE NOTE:
${scribeNote}

CRITICAL: Return only the text of the report in Markdown format. Be exhaustive. Maximum tokens for this single module.`;

  const result = await textModel.generateContent(prompt);
  const text = result.response.text();

  // Hardening: Ensure the AI complied with the "exhaustive" requirement
  if (text.length < 100) {
    throw new Error("AI Synthesis failed to generate exhaustive documentation. Please try again.");
  }

  // Sanitization: Strip unintended markdown code blocks if the AI includes them despite instructions
  return text.trim().replace(/^```markdown\s*/gi, '').replace(/^```\s*/gi, '').replace(/```\s*$/g, '');
}
