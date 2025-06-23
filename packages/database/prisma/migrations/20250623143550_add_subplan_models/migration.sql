/*
  Warnings:

  - The primary key for the `CurriculumImport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updatedAt` to the `StudentReflection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "EmailDelivery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "parentMessageId" INTEGER,
    "parentSummaryId" INTEGER,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerId" TEXT,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailDelivery_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "ParentMessage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EmailDelivery_parentSummaryId_fkey" FOREIGN KEY ("parentSummaryId") REFERENCES "ParentSummary" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "contentFr" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "variables" TEXT NOT NULL DEFAULT '[]',
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutcomeEmbedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outcomeId" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OutcomeEmbedding_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutcomeCluster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "importId" TEXT NOT NULL,
    "clusterName" TEXT NOT NULL,
    "clusterType" TEXT NOT NULL,
    "outcomeIds" JSONB NOT NULL,
    "centroid" JSONB,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "suggestedTheme" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutcomeCluster_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CurriculumImport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassRoutine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "timeOfDay" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassRoutine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubPlanRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "daysCount" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "includeGoals" BOOLEAN NOT NULL DEFAULT true,
    "includeRoutines" BOOLEAN NOT NULL DEFAULT true,
    "includePlans" BOOLEAN NOT NULL DEFAULT true,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "emailedTo" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubPlanRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CurriculumImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "filename" TEXT,
    "originalName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "filePath" TEXT,
    "grade" INTEGER,
    "subject" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOADING',
    "sourceFormat" TEXT,
    "sourceFile" TEXT,
    "rawText" TEXT,
    "parsedData" TEXT,
    "errorMessage" TEXT,
    "totalOutcomes" INTEGER NOT NULL DEFAULT 0,
    "processedOutcomes" INTEGER NOT NULL DEFAULT 0,
    "errorLog" JSONB,
    "metadata" JSONB,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "CurriculumImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CurriculumImport" ("createdAt", "errorMessage", "filePath", "fileSize", "filename", "id", "mimeType", "originalName", "parsedData", "processedAt", "rawText", "status", "updatedAt", "userId") SELECT "createdAt", "errorMessage", "filePath", "fileSize", "filename", "id", "mimeType", "originalName", "parsedData", "processedAt", "rawText", "status", "updatedAt", "userId" FROM "CurriculumImport";
DROP TABLE "CurriculumImport";
ALTER TABLE "new_CurriculumImport" RENAME TO "CurriculumImport";
CREATE INDEX "CurriculumImport_userId_status_idx" ON "CurriculumImport"("userId", "status");
CREATE INDEX "CurriculumImport_createdAt_idx" ON "CurriculumImport"("createdAt");
CREATE TABLE "new_Outcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "importId" TEXT,
    CONSTRAINT "Outcome_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CurriculumImport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Outcome" ("code", "createdAt", "description", "domain", "grade", "id", "subject", "updatedAt") SELECT "code", "createdAt", "description", "domain", "grade", "id", "subject", "updatedAt" FROM "Outcome";
DROP TABLE "Outcome";
ALTER TABLE "new_Outcome" RENAME TO "Outcome";
CREATE UNIQUE INDEX "Outcome_code_key" ON "Outcome"("code");
CREATE TABLE "new_StudentReflection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "activityId" INTEGER,
    "content" TEXT,
    "text" TEXT,
    "date" DATETIME,
    "emoji" TEXT,
    "voicePath" TEXT,
    "outcomeId" TEXT,
    "themeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentReflection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentReflection_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentReflection_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StudentReflection_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "ThematicUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StudentReflection" ("activityId", "content", "createdAt", "date", "emoji", "id", "outcomeId", "studentId", "text", "themeId", "voicePath") SELECT "activityId", "content", "createdAt", "date", "emoji", "id", "outcomeId", "studentId", "text", "themeId", "voicePath" FROM "StudentReflection";
DROP TABLE "StudentReflection";
ALTER TABLE "new_StudentReflection" RENAME TO "StudentReflection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "EmailDelivery_parentMessageId_idx" ON "EmailDelivery"("parentMessageId");

-- CreateIndex
CREATE INDEX "EmailDelivery_parentSummaryId_idx" ON "EmailDelivery"("parentSummaryId");

-- CreateIndex
CREATE INDEX "EmailDelivery_status_idx" ON "EmailDelivery"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OutcomeEmbedding_outcomeId_key" ON "OutcomeEmbedding"("outcomeId");

-- CreateIndex
CREATE INDEX "OutcomeEmbedding_outcomeId_idx" ON "OutcomeEmbedding"("outcomeId");

-- CreateIndex
CREATE INDEX "OutcomeCluster_importId_idx" ON "OutcomeCluster"("importId");

-- CreateIndex
CREATE INDEX "OutcomeCluster_clusterType_idx" ON "OutcomeCluster"("clusterType");

-- CreateIndex
CREATE INDEX "ClassRoutine_userId_category_idx" ON "ClassRoutine"("userId", "category");

-- CreateIndex
CREATE INDEX "ClassRoutine_userId_isActive_idx" ON "ClassRoutine"("userId", "isActive");

-- CreateIndex
CREATE INDEX "SubPlanRecord_userId_date_idx" ON "SubPlanRecord"("userId", "date");

-- CreateIndex
CREATE INDEX "SubPlanRecord_userId_createdAt_idx" ON "SubPlanRecord"("userId", "createdAt");
