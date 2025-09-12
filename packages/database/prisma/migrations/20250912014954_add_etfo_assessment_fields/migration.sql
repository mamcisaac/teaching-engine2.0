-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT,
    "expectationId" TEXT,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "notes" TEXT,
    "evidenceType" TEXT,
    "isAnecdotal" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentAssessment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentAssessment" ("createdAt", "date", "evidenceType", "expectationId", "id", "isAnecdotal", "lessonId", "level", "notes", "studentId", "subject", "title", "updatedAt", "userId") SELECT "createdAt", "date", "evidenceType", "expectationId", "id", "isAnecdotal", "lessonId", "level", "notes", "studentId", "subject", "title", "updatedAt", "userId" FROM "StudentAssessment";
DROP TABLE "StudentAssessment";
ALTER TABLE "new_StudentAssessment" RENAME TO "StudentAssessment";
CREATE INDEX "StudentAssessment_userId_idx" ON "StudentAssessment"("userId");
CREATE INDEX "StudentAssessment_studentId_idx" ON "StudentAssessment"("studentId");
CREATE INDEX "StudentAssessment_userId_studentId_idx" ON "StudentAssessment"("userId", "studentId");
CREATE INDEX "StudentAssessment_userId_date_idx" ON "StudentAssessment"("userId", "date");
CREATE INDEX "StudentAssessment_userId_subject_idx" ON "StudentAssessment"("userId", "subject");
CREATE INDEX "StudentAssessment_userId_level_idx" ON "StudentAssessment"("userId", "level");
CREATE INDEX "StudentAssessment_userId_studentId_date_idx" ON "StudentAssessment"("userId", "studentId", "date");
CREATE INDEX "StudentAssessment_studentId_subject_date_idx" ON "StudentAssessment"("studentId", "subject", "date");
CREATE UNIQUE INDEX "StudentAssessment_userId_studentId_subject_date_key" ON "StudentAssessment"("userId", "studentId", "subject", "date");
CREATE TABLE "new_StudentOutcomeProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "outcomeId" TEXT,
    "expectationId" TEXT,
    "userId" INTEGER NOT NULL,
    "currentLevel" TEXT NOT NULL DEFAULT 'NOT_YET',
    "previousLevel" TEXT,
    "lastAssessmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessmentCount" INTEGER NOT NULL DEFAULT 0,
    "totalEvidencePieces" INTEGER NOT NULL DEFAULT 0,
    "strongestEvidence" JSONB,
    "evidenceBalance" JSONB,
    "areasForGrowth" TEXT,
    "strengths" TEXT,
    "teacherNotes" TEXT,
    "parentShared" BOOLEAN NOT NULL DEFAULT false,
    "parentShareDate" DATETIME,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastAssessedDate" DATETIME,
    CONSTRAINT "StudentOutcomeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentOutcomeProgress_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentOutcomeProgress_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentOutcomeProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentOutcomeProgress" ("areasForGrowth", "createdAt", "currentLevel", "id", "isArchived", "lastAssessedDate", "lastAssessmentDate", "outcomeId", "parentShareDate", "parentShared", "previousLevel", "strengths", "strongestEvidence", "studentId", "teacherNotes", "totalEvidencePieces", "updatedAt", "userId") SELECT "areasForGrowth", "createdAt", "currentLevel", "id", "isArchived", "lastAssessedDate", "lastAssessmentDate", "outcomeId", "parentShareDate", "parentShared", "previousLevel", "strengths", "strongestEvidence", "studentId", "teacherNotes", "totalEvidencePieces", "updatedAt", "userId" FROM "StudentOutcomeProgress";
DROP TABLE "StudentOutcomeProgress";
ALTER TABLE "new_StudentOutcomeProgress" RENAME TO "StudentOutcomeProgress";
CREATE INDEX "StudentOutcomeProgress_studentId_idx" ON "StudentOutcomeProgress"("studentId");
CREATE INDEX "StudentOutcomeProgress_outcomeId_idx" ON "StudentOutcomeProgress"("outcomeId");
CREATE INDEX "StudentOutcomeProgress_userId_idx" ON "StudentOutcomeProgress"("userId");
CREATE INDEX "StudentOutcomeProgress_currentLevel_idx" ON "StudentOutcomeProgress"("currentLevel");
CREATE INDEX "StudentOutcomeProgress_lastAssessmentDate_idx" ON "StudentOutcomeProgress"("lastAssessmentDate");
CREATE INDEX "StudentOutcomeProgress_studentId_currentLevel_idx" ON "StudentOutcomeProgress"("studentId", "currentLevel");
CREATE INDEX "StudentOutcomeProgress_outcomeId_currentLevel_idx" ON "StudentOutcomeProgress"("outcomeId", "currentLevel");
CREATE INDEX "StudentOutcomeProgress_userId_lastAssessmentDate_idx" ON "StudentOutcomeProgress"("userId", "lastAssessmentDate");
CREATE INDEX "StudentOutcomeProgress_parentShared_idx" ON "StudentOutcomeProgress"("parentShared");
CREATE UNIQUE INDEX "StudentOutcomeProgress_studentId_expectationId_userId_key" ON "StudentOutcomeProgress"("studentId", "expectationId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
