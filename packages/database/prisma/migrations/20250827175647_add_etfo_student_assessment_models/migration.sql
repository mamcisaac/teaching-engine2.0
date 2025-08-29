-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "studentNumber" TEXT,
    "grade" INTEGER NOT NULL,
    "homeroom" TEXT,
    "specialNeeds" TEXT,
    "parentContact" JSONB,
    "enrollmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawalDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "artifactType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "textContent" TEXT,
    "metadata" JSONB,
    "collectionContext" TEXT,
    "dateCollected" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB,
    "processingStatus" TEXT NOT NULL DEFAULT 'READY',
    "processingError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentArtifact_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentArtifact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentArtifactOutcome" (
    "artifactId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "teacherNote" TEXT,
    "confidenceLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "contextualFactors" TEXT,
    "dateAssessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("artifactId", "outcomeId"),
    CONSTRAINT "StudentArtifactOutcome_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "StudentArtifact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentArtifactOutcome_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentOutcomeProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentLevel" TEXT NOT NULL DEFAULT 'NOT_YET',
    "previousLevel" TEXT,
    "lastAssessmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalEvidencePieces" INTEGER NOT NULL DEFAULT 0,
    "strongestEvidence" JSONB,
    "areasForGrowth" TEXT,
    "strengths" TEXT,
    "teacherNotes" TEXT,
    "parentShared" BOOLEAN NOT NULL DEFAULT false,
    "parentShareDate" DATETIME,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentOutcomeProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentOutcomeProgress_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentOutcomeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Student_userId_idx" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_userId_isActive_idx" ON "Student"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Student_userId_grade_idx" ON "Student"("userId", "grade");

-- CreateIndex
CREATE INDEX "Student_grade_isActive_idx" ON "Student"("grade", "isActive");

-- CreateIndex
CREATE INDEX "Student_studentNumber_idx" ON "Student"("studentNumber");

-- CreateIndex
CREATE INDEX "StudentArtifact_studentId_idx" ON "StudentArtifact"("studentId");

-- CreateIndex
CREATE INDEX "StudentArtifact_userId_idx" ON "StudentArtifact"("userId");

-- CreateIndex
CREATE INDEX "StudentArtifact_studentId_dateCollected_idx" ON "StudentArtifact"("studentId", "dateCollected");

-- CreateIndex
CREATE INDEX "StudentArtifact_artifactType_idx" ON "StudentArtifact"("artifactType");

-- CreateIndex
CREATE INDEX "StudentArtifact_userId_dateCollected_idx" ON "StudentArtifact"("userId", "dateCollected");

-- CreateIndex
CREATE INDEX "StudentArtifact_processingStatus_idx" ON "StudentArtifact"("processingStatus");

-- CreateIndex
CREATE INDEX "StudentArtifact_studentId_artifactType_idx" ON "StudentArtifact"("studentId", "artifactType");

-- CreateIndex
CREATE INDEX "StudentArtifactOutcome_outcomeId_idx" ON "StudentArtifactOutcome"("outcomeId");

-- CreateIndex
CREATE INDEX "StudentArtifactOutcome_evidenceType_idx" ON "StudentArtifactOutcome"("evidenceType");

-- CreateIndex
CREATE INDEX "StudentArtifactOutcome_dateAssessed_idx" ON "StudentArtifactOutcome"("dateAssessed");

-- CreateIndex
CREATE INDEX "StudentArtifactOutcome_confidenceLevel_idx" ON "StudentArtifactOutcome"("confidenceLevel");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_studentId_idx" ON "StudentOutcomeProgress"("studentId");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_outcomeId_idx" ON "StudentOutcomeProgress"("outcomeId");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_userId_idx" ON "StudentOutcomeProgress"("userId");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_currentLevel_idx" ON "StudentOutcomeProgress"("currentLevel");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_lastAssessmentDate_idx" ON "StudentOutcomeProgress"("lastAssessmentDate");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_studentId_currentLevel_idx" ON "StudentOutcomeProgress"("studentId", "currentLevel");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_outcomeId_currentLevel_idx" ON "StudentOutcomeProgress"("outcomeId", "currentLevel");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_userId_lastAssessmentDate_idx" ON "StudentOutcomeProgress"("userId", "lastAssessmentDate");

-- CreateIndex
CREATE INDEX "StudentOutcomeProgress_parentShared_idx" ON "StudentOutcomeProgress"("parentShared");

-- CreateIndex
CREATE UNIQUE INDEX "StudentOutcomeProgress_studentId_outcomeId_key" ON "StudentOutcomeProgress"("studentId", "outcomeId");
