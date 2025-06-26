/*
  Warnings:

  - You are about to drop the `AIGeneratedPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CognatePair` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DailyOralRoutine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Holiday` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Newsletter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OralRoutineTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanningConversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReflectionJournalEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportDeadline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShareLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubstituteInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherPreferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThematicUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YearPlanEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `themeId` on the `StudentGoal` table. All the data in the column will be lost.
  - You are about to drop the column `themeId` on the `StudentReflection` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CognatePair_wordFr_wordEn_userId_key";

-- DropIndex
DROP INDEX "PlanningConversation_userId_sessionId_idx";

-- DropIndex
DROP INDEX "ShareLink_token_key";

-- AlterTable
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "grade" INTEGER;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "language" TEXT;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "subject" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AIGeneratedPlan";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CognatePair";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyOralRoutine";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EquipmentBooking";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Holiday";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MaterialList";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MediaResource";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Newsletter";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Notification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OralRoutineTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlanningConversation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReflectionJournalEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReportDeadline";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ShareLink";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubstituteInfo";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeacherPreferences";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ThematicUnit";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "YearPlanEntry";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "WeeklyPlannerState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "defaultView" TEXT NOT NULL DEFAULT 'week',
    "timeSlotDuration" INTEGER NOT NULL DEFAULT 30,
    "showWeekends" BOOLEAN NOT NULL DEFAULT false,
    "startOfWeek" INTEGER NOT NULL DEFAULT 1,
    "workingHours" TEXT NOT NULL DEFAULT '{"start":"08:00","end":"16:00"}',
    "sidebarExpanded" BOOLEAN NOT NULL DEFAULT true,
    "showMiniCalendar" BOOLEAN NOT NULL DEFAULT true,
    "showResourcePanel" BOOLEAN NOT NULL DEFAULT true,
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "autoSaveInterval" INTEGER NOT NULL DEFAULT 30,
    "showUncoveredOutcomes" BOOLEAN NOT NULL DEFAULT true,
    "defaultLessonDuration" INTEGER NOT NULL DEFAULT 60,
    "currentWeekStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveView" TEXT,
    "draftChanges" TEXT,
    "undoHistory" TEXT NOT NULL DEFAULT '[]',
    "redoHistory" TEXT NOT NULL DEFAULT '[]',
    "maxHistorySize" INTEGER NOT NULL DEFAULT 50,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasOfflineChanges" BOOLEAN NOT NULL DEFAULT false,
    "offlineData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyPlannerState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionFr" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT,
    "gradeMin" INTEGER,
    "gradeMax" INTEGER,
    "tags" JSONB NOT NULL,
    "keywords" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "estimatedWeeks" INTEGER,
    "unitStructure" JSONB,
    "estimatedMinutes" INTEGER,
    "lessonStructure" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "averageRating" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlanTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TemplateRating_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PlanTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemplateVariation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameFr" TEXT,
    "description" TEXT,
    "modificationNotes" TEXT,
    "content" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TemplateVariation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PlanTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DaybookEntryExpectation" (
    "daybookEntryId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,
    "coverage" TEXT,

    PRIMARY KEY ("daybookEntryId", "expectationId"),
    CONSTRAINT "DaybookEntryExpectation_daybookEntryId_fkey" FOREIGN KEY ("daybookEntryId") REFERENCES "DaybookEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DaybookEntryExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DaybookEntryExpectation" ("coverage", "daybookEntryId", "expectationId") SELECT "coverage", "daybookEntryId", "expectationId" FROM "DaybookEntryExpectation";
DROP TABLE "DaybookEntryExpectation";
ALTER TABLE "new_DaybookEntryExpectation" RENAME TO "DaybookEntryExpectation";
CREATE TABLE "new_ETFOLessonPlanExpectation" (
    "lessonPlanId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,

    PRIMARY KEY ("lessonPlanId", "expectationId"),
    CONSTRAINT "ETFOLessonPlanExpectation_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlanExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlanExpectation" ("expectationId", "lessonPlanId") SELECT "expectationId", "lessonPlanId" FROM "ETFOLessonPlanExpectation";
DROP TABLE "ETFOLessonPlanExpectation";
ALTER TABLE "new_ETFOLessonPlanExpectation" RENAME TO "ETFOLessonPlanExpectation";
CREATE TABLE "new_LongRangePlanExpectation" (
    "longRangePlanId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,
    "plannedTerm" TEXT,

    PRIMARY KEY ("longRangePlanId", "expectationId"),
    CONSTRAINT "LongRangePlanExpectation_longRangePlanId_fkey" FOREIGN KEY ("longRangePlanId") REFERENCES "LongRangePlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LongRangePlanExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LongRangePlanExpectation" ("expectationId", "longRangePlanId", "plannedTerm") SELECT "expectationId", "longRangePlanId", "plannedTerm" FROM "LongRangePlanExpectation";
DROP TABLE "LongRangePlanExpectation";
ALTER TABLE "new_LongRangePlanExpectation" RENAME TO "LongRangePlanExpectation";
CREATE TABLE "new_StudentGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "unitPlanId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "StudentGoal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudentGoal" ("createdAt", "id", "status", "studentId", "text") SELECT "createdAt", "id", "status", "studentId", "text" FROM "StudentGoal";
DROP TABLE "StudentGoal";
ALTER TABLE "new_StudentGoal" RENAME TO "StudentGoal";
CREATE TABLE "new_StudentReflection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "content" TEXT,
    "text" TEXT,
    "date" DATETIME,
    "emoji" TEXT,
    "voicePath" TEXT,
    "unitPlanId" TEXT,
    "suggestedOutcomeIds" TEXT,
    "selTags" TEXT,
    "classificationConfidence" REAL,
    "classificationRationale" TEXT,
    "classifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentReflection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudentReflection" ("classificationConfidence", "classificationRationale", "classifiedAt", "content", "createdAt", "date", "emoji", "id", "selTags", "studentId", "suggestedOutcomeIds", "text", "updatedAt", "voicePath") SELECT "classificationConfidence", "classificationRationale", "classifiedAt", "content", "createdAt", "date", "emoji", "id", "selTags", "studentId", "suggestedOutcomeIds", "text", "updatedAt", "voicePath" FROM "StudentReflection";
DROP TABLE "StudentReflection";
ALTER TABLE "new_StudentReflection" RENAME TO "StudentReflection";
CREATE TABLE "new_UnitPlanExpectation" (
    "unitPlanId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,

    PRIMARY KEY ("unitPlanId", "expectationId"),
    CONSTRAINT "UnitPlanExpectation_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UnitPlanExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UnitPlanExpectation" ("expectationId", "unitPlanId") SELECT "expectationId", "unitPlanId" FROM "UnitPlanExpectation";
DROP TABLE "UnitPlanExpectation";
ALTER TABLE "new_UnitPlanExpectation" RENAME TO "UnitPlanExpectation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPlannerState_userId_key" ON "WeeklyPlannerState"("userId");

-- CreateIndex
CREATE INDEX "WeeklyPlannerState_userId_idx" ON "WeeklyPlannerState"("userId");

-- CreateIndex
CREATE INDEX "WeeklyPlannerState_userId_lastSyncedAt_idx" ON "WeeklyPlannerState"("userId", "lastSyncedAt");

-- CreateIndex
CREATE INDEX "WeeklyPlannerState_userId_hasOfflineChanges_idx" ON "WeeklyPlannerState"("userId", "hasOfflineChanges");

-- CreateIndex
CREATE INDEX "WeeklyPlannerState_currentWeekStart_idx" ON "WeeklyPlannerState"("currentWeekStart");

-- CreateIndex
CREATE INDEX "PlanTemplate_type_category_idx" ON "PlanTemplate"("type", "category");

-- CreateIndex
CREATE INDEX "PlanTemplate_subject_gradeMin_gradeMax_idx" ON "PlanTemplate"("subject", "gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "PlanTemplate_isSystem_isPublic_idx" ON "PlanTemplate"("isSystem", "isPublic");

-- CreateIndex
CREATE INDEX "PlanTemplate_createdByUserId_idx" ON "PlanTemplate"("createdByUserId");

-- CreateIndex
CREATE INDEX "PlanTemplate_usageCount_idx" ON "PlanTemplate"("usageCount");

-- CreateIndex
CREATE INDEX "TemplateRating_templateId_rating_idx" ON "TemplateRating"("templateId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateRating_templateId_userId_key" ON "TemplateRating"("templateId", "userId");

-- CreateIndex
CREATE INDEX "TemplateVariation_templateId_idx" ON "TemplateVariation"("templateId");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_grade_subject_idx" ON "ETFOLessonPlan"("grade", "subject");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_language_idx" ON "ETFOLessonPlan"("language");
