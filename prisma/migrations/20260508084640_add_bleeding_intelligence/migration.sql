-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procedureName" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "cptCode" TEXT NOT NULL,
    "icdCode" TEXT NOT NULL,
    "scribeNote" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "instruments" TEXT NOT NULL,
    "roiMetrics" TEXT NOT NULL,
    "patientFollowUp" TEXT NOT NULL,
    "surgeonPerformance" TEXT NOT NULL,
    "screenshots" TEXT NOT NULL DEFAULT '[]',
    "researchPaper" TEXT NOT NULL DEFAULT '',
    "financialReport" TEXT NOT NULL DEFAULT '',
    "forensicReport" TEXT NOT NULL DEFAULT '',
    "teachingPaper" TEXT NOT NULL DEFAULT '',
    "billingReport" TEXT NOT NULL DEFAULT '',
    "insuranceAudit" TEXT NOT NULL DEFAULT '',
    "surgicalNotes" TEXT NOT NULL DEFAULT '',
    "adminReview" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rating" INTEGER,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "surgicalState" TEXT NOT NULL DEFAULT '{}',
    "recordingUrl" TEXT NOT NULL DEFAULT '',
    "estimatedBloodLoss" REAL DEFAULT 0.0,
    "realTimeStats" TEXT NOT NULL DEFAULT '{}',
    "motionStability" REAL DEFAULT 0.0,
    "dissectionSafety" REAL DEFAULT 0.0,
    "bleedingRisk" REAL DEFAULT 0.0,
    "clipStability" REAL DEFAULT 0.0,
    "cvsProxy" REAL DEFAULT 0.0,
    "visualTelemetry" TEXT NOT NULL DEFAULT '{}',
    "overallScore" REAL DEFAULT 0.0,
    "bleedingDetected" BOOLEAN NOT NULL DEFAULT false,
    "approxBloodLoss" REAL DEFAULT 0.0,
    "bleedingDuration" TEXT NOT NULL DEFAULT '0s',
    "bleedingLocations" TEXT NOT NULL DEFAULT '[]',
    "maxBleedingTime" TEXT NOT NULL DEFAULT '00:00',
    "bleedingIntensityGraph" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Case_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Case_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("adminReview", "billingReport", "bleedingRisk", "clipStability", "cptCode", "createdAt", "cvsProxy", "dissectionSafety", "doctorId", "duration", "estimatedBloodLoss", "financialReport", "forensicReport", "icdCode", "id", "instruments", "insuranceAudit", "isLive", "motionStability", "overallScore", "patientFollowUp", "patientId", "procedureName", "rating", "realTimeStats", "recordingUrl", "researchPaper", "reviewStatus", "roiMetrics", "screenshots", "scribeNote", "steps", "surgeonPerformance", "surgicalNotes", "surgicalState", "teachingPaper", "visualTelemetry") SELECT "adminReview", "billingReport", "bleedingRisk", "clipStability", "cptCode", "createdAt", "cvsProxy", "dissectionSafety", "doctorId", "duration", "estimatedBloodLoss", "financialReport", "forensicReport", "icdCode", "id", "instruments", "insuranceAudit", "isLive", "motionStability", "overallScore", "patientFollowUp", "patientId", "procedureName", "rating", "realTimeStats", "recordingUrl", "researchPaper", "reviewStatus", "roiMetrics", "screenshots", "scribeNote", "steps", "surgeonPerformance", "surgicalNotes", "surgicalState", "teachingPaper", "visualTelemetry" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
