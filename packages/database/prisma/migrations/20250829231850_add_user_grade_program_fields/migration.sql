-- DropIndex (if exists)
DROP INDEX IF EXISTS "idx_student_artifact_cleanup";
DROP INDEX IF EXISTS "idx_student_artifact_covering";
DROP INDEX IF EXISTS "idx_student_artifact_user_type_archived";
DROP INDEX IF EXISTS "idx_student_artifact_user_date_type";
DROP INDEX IF EXISTS "idx_artifact_outcome_user_evidence";
DROP INDEX IF EXISTS "idx_artifact_outcome_evidence_date";
DROP INDEX IF EXISTS "idx_student_progress_user_level_date";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "grade" TEXT;
ALTER TABLE "User" ADD COLUMN "program" TEXT;

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "expectation" TEXT NOT NULL,
    "expectationCode" TEXT,
    "level" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "artifacts" JSONB,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentId" TEXT,
    "teacherId" INTEGER NOT NULL,
    "dateRangeStart" DATETIME NOT NULL,
    "dateRangeEnd" DATETIME NOT NULL,
    "subjects" JSONB,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "studentId" TEXT,
    "assessmentId" TEXT,
    "uploadedBy" INTEGER NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "tags" JSONB,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Artifact_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Artifact_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "studentId" TEXT,
    "studentNumber" TEXT,
    "dateOfBirth" DATETIME,
    "grade" INTEGER NOT NULL,
    "program" TEXT,
    "homeroom" TEXT,
    "hasIEP" BOOLEAN NOT NULL DEFAULT false,
    "iepGoals" JSONB,
    "accommodations" JSONB,
    "specialNeeds" TEXT,
    "parentContact" JSONB,
    "enrollmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawalDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("createdAt", "enrollmentDate", "firstName", "grade", "homeroom", "id", "isActive", "lastName", "notes", "parentContact", "specialNeeds", "studentNumber", "updatedAt", "userId", "withdrawalDate") SELECT "createdAt", "enrollmentDate", "firstName", "grade", "homeroom", "id", "isActive", "lastName", "notes", "parentContact", "specialNeeds", "studentNumber", "updatedAt", "userId", "withdrawalDate" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");
CREATE INDEX "Student_userId_idx" ON "Student"("userId");
CREATE INDEX "Student_userId_isActive_idx" ON "Student"("userId", "isActive");
CREATE INDEX "Student_userId_grade_idx" ON "Student"("userId", "grade");
CREATE INDEX "Student_grade_isActive_idx" ON "Student"("grade", "isActive");
CREATE INDEX "Student_studentNumber_idx" ON "Student"("studentNumber");
CREATE INDEX "Student_studentId_idx" ON "Student"("studentId");
CREATE INDEX "Student_status_idx" ON "Student"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Assessment_studentId_idx" ON "Assessment"("studentId");

-- CreateIndex
CREATE INDEX "Assessment_teacherId_idx" ON "Assessment"("teacherId");

-- CreateIndex
CREATE INDEX "Assessment_subject_idx" ON "Assessment"("subject");

-- CreateIndex
CREATE INDEX "Assessment_level_idx" ON "Assessment"("level");

-- CreateIndex
CREATE INDEX "Assessment_evidenceType_idx" ON "Assessment"("evidenceType");

-- CreateIndex
CREATE INDEX "Assessment_date_idx" ON "Assessment"("date");

-- CreateIndex
CREATE INDEX "Assessment_studentId_subject_idx" ON "Assessment"("studentId", "subject");

-- CreateIndex
CREATE INDEX "Assessment_studentId_date_idx" ON "Assessment"("studentId", "date");

-- CreateIndex
CREATE INDEX "Report_teacherId_idx" ON "Report"("teacherId");

-- CreateIndex
CREATE INDEX "Report_studentId_idx" ON "Report"("studentId");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Artifact_studentId_idx" ON "Artifact"("studentId");

-- CreateIndex
CREATE INDEX "Artifact_assessmentId_idx" ON "Artifact"("assessmentId");

-- CreateIndex
CREATE INDEX "Artifact_uploadedBy_idx" ON "Artifact"("uploadedBy");

-- CreateIndex
CREATE INDEX "Artifact_processingStatus_idx" ON "Artifact"("processingStatus");

-- CreateIndex
CREATE INDEX "Artifact_createdAt_idx" ON "Artifact"("createdAt");
