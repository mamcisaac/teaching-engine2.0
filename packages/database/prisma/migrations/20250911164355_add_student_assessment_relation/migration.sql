/*
  Warnings:

  - You are about to drop the column `behaviorAlerts` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledTime` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `searchContent` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `skippedReason` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `substituteNotes` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `taughtDate` on the `ETFOLessonPlan` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ETFOLessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "unitPlanId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "slotNumber" INTEGER DEFAULT 1,
    "lessonNumber" INTEGER,
    "lessonType" TEXT DEFAULT 'core',
    "isScheduled" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER NOT NULL,
    "mindsOn" TEXT,
    "action" TEXT,
    "consolidation" TEXT,
    "learningGoals" TEXT,
    "materials" JSONB,
    "grouping" TEXT,
    "titleFr" TEXT,
    "mindsOnFr" TEXT,
    "actionFr" TEXT,
    "consolidationFr" TEXT,
    "learningGoalsFr" TEXT,
    "accommodations" JSONB,
    "modifications" JSONB,
    "extensions" JSONB,
    "assessmentType" TEXT,
    "assessmentNotes" TEXT,
    "isSubFriendly" BOOLEAN NOT NULL DEFAULT true,
    "subNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "grade" INTEGER,
    "language" TEXT,
    "subject" TEXT,
    "differentiationStrategies" JSONB,
    "engagementHooks" JSONB,
    "formativeCheckpoints" JSONB,
    "interventionStrategies" JSONB,
    "performanceOpportunities" TEXT,
    "priorKnowledgeCheck" TEXT,
    "reflectionActivities" JSONB,
    "wheretoFramework" JSONB,
    "indigenousPerspectives" TEXT,
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlan" ("accommodations", "action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "differentiationStrategies", "duration", "engagementHooks", "extensions", "formativeCheckpoints", "grade", "grouping", "id", "indigenousPerspectives", "interventionStrategies", "isScheduled", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "lessonNumber", "lessonType", "materials", "mindsOn", "mindsOnFr", "modifications", "performanceOpportunities", "priorKnowledgeCheck", "reflectionActivities", "slotNumber", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId", "wheretoFramework") SELECT "accommodations", "action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "differentiationStrategies", "duration", "engagementHooks", "extensions", "formativeCheckpoints", "grade", "grouping", "id", "indigenousPerspectives", "interventionStrategies", "isScheduled", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "lessonNumber", "lessonType", "materials", "mindsOn", "mindsOnFr", "modifications", "performanceOpportunities", "priorKnowledgeCheck", "reflectionActivities", "slotNumber", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId", "wheretoFramework" FROM "ETFOLessonPlan";
DROP TABLE "ETFOLessonPlan";
ALTER TABLE "new_ETFOLessonPlan" RENAME TO "ETFOLessonPlan";
CREATE INDEX "ETFOLessonPlan_userId_date_idx" ON "ETFOLessonPlan"("userId", "date");
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");
CREATE INDEX "ETFOLessonPlan_unitPlanId_lessonNumber_idx" ON "ETFOLessonPlan"("unitPlanId", "lessonNumber");
CREATE INDEX "ETFOLessonPlan_grade_subject_idx" ON "ETFOLessonPlan"("grade", "subject");
CREATE INDEX "ETFOLessonPlan_language_idx" ON "ETFOLessonPlan"("language");
CREATE INDEX "ETFOLessonPlan_userId_isSubFriendly_idx" ON "ETFOLessonPlan"("userId", "isSubFriendly");
CREATE INDEX "ETFOLessonPlan_userId_updatedAt_idx" ON "ETFOLessonPlan"("userId", "updatedAt");
CREATE INDEX "ETFOLessonPlan_isSubFriendly_grade_subject_idx" ON "ETFOLessonPlan"("isSubFriendly", "grade", "subject");
CREATE INDEX "ETFOLessonPlan_userId_grade_subject_idx" ON "ETFOLessonPlan"("userId", "grade", "subject");
CREATE INDEX "ETFOLessonPlan_grade_subject_date_idx" ON "ETFOLessonPlan"("grade", "subject", "date");
CREATE INDEX "ETFOLessonPlan_userId_date_subject_idx" ON "ETFOLessonPlan"("userId", "date", "subject");
CREATE INDEX "ETFOLessonPlan_userId_date_grade_idx" ON "ETFOLessonPlan"("userId", "date", "grade");
CREATE INDEX "ETFOLessonPlan_date_duration_idx" ON "ETFOLessonPlan"("date", "duration");
CREATE INDEX "ETFOLessonPlan_userId_assessmentType_idx" ON "ETFOLessonPlan"("userId", "assessmentType");
CREATE INDEX "ETFOLessonPlan_userId_date_slotNumber_idx" ON "ETFOLessonPlan"("userId", "date", "slotNumber");
CREATE INDEX "ETFOLessonPlan_lessonType_isScheduled_idx" ON "ETFOLessonPlan"("lessonType", "isScheduled");
CREATE INDEX "ETFOLessonPlan_unitPlanId_lessonType_idx" ON "ETFOLessonPlan"("unitPlanId", "lessonType");
CREATE UNIQUE INDEX "ETFOLessonPlan_unitPlanId_lessonNumber_key" ON "ETFOLessonPlan"("unitPlanId", "lessonNumber");
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
    "isAnecdotal" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentAssessment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentAssessment" ("createdAt", "date", "expectationId", "id", "isAnecdotal", "lessonId", "level", "notes", "studentId", "subject", "title", "updatedAt", "userId") SELECT "createdAt", "date", "expectationId", "id", "isAnecdotal", "lessonId", "level", "notes", "studentId", "subject", "title", "updatedAt", "userId" FROM "StudentAssessment";
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
