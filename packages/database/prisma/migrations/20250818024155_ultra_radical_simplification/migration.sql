/*
  Warnings:

  - You are about to drop the `ETFOLessonPlanResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitPlanResource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitPlanTransferSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `actionFr` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentType` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `consolidationFr` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `grouping` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `indigenousPerspectives` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `learningGoals` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `learningGoalsFr` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `mindsOnFr` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `titleFr` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentOverview` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionFr` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `goalsFr` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `indigenousPerspectives` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `overarchingQuestions` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `parentCommunication` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `resourceNeeds` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `term` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `themes` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `titleFr` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentPlan` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `bigIdeas` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `bigIdeasFr` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `communityConnections` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionFr` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `differentiationStrategies` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `essentialQuestions` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedHours` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `indigenousPerspectives` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `keyVocabulary` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `parentCommunicationPlan` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `priorKnowledge` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `titleFr` on the `UnitPlan` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ETFOLessonPlanResource";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UnitPlanResource";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UnitPlanTransferSkill";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ETFOLessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "unitPlanId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "mindsOn" TEXT,
    "action" TEXT,
    "consolidation" TEXT,
    "materials" TEXT,
    "differentiation" TEXT,
    "assessmentNotes" TEXT,
    "isSubFriendly" BOOLEAN NOT NULL DEFAULT true,
    "subNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlan" ("action", "assessmentNotes", "consolidation", "createdAt", "date", "differentiation", "duration", "id", "isSubFriendly", "materials", "mindsOn", "subNotes", "title", "unitPlanId", "updatedAt", "userId") SELECT "action", "assessmentNotes", "consolidation", "createdAt", "date", "differentiation", "duration", "id", "isSubFriendly", "materials", "mindsOn", "subNotes", "title", "unitPlanId", "updatedAt", "userId" FROM "ETFOLessonPlan";
DROP TABLE "ETFOLessonPlan";
ALTER TABLE "new_ETFOLessonPlan" RENAME TO "ETFOLessonPlan";
CREATE INDEX "ETFOLessonPlan_userId_date_idx" ON "ETFOLessonPlan"("userId", "date");
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");
CREATE INDEX "ETFOLessonPlan_userId_isSubFriendly_idx" ON "ETFOLessonPlan"("userId", "isSubFriendly");
CREATE INDEX "ETFOLessonPlan_userId_updatedAt_idx" ON "ETFOLessonPlan"("userId", "updatedAt");
CREATE INDEX "ETFOLessonPlan_date_duration_idx" ON "ETFOLessonPlan"("date", "duration");
CREATE TABLE "new_LongRangePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LongRangePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LongRangePlan" ("academicYear", "createdAt", "description", "grade", "id", "subject", "title", "updatedAt", "userId") SELECT "academicYear", "createdAt", "description", "grade", "id", "subject", "title", "updatedAt", "userId" FROM "LongRangePlan";
DROP TABLE "LongRangePlan";
ALTER TABLE "new_LongRangePlan" RENAME TO "LongRangePlan";
CREATE INDEX "LongRangePlan_userId_academicYear_idx" ON "LongRangePlan"("userId", "academicYear");
CREATE INDEX "LongRangePlan_userId_subject_grade_idx" ON "LongRangePlan"("userId", "subject", "grade");
CREATE INDEX "LongRangePlan_academicYear_grade_subject_idx" ON "LongRangePlan"("academicYear", "grade", "subject");
CREATE INDEX "LongRangePlan_userId_updatedAt_idx" ON "LongRangePlan"("userId", "updatedAt");
CREATE INDEX "LongRangePlan_userId_academicYear_subject_idx" ON "LongRangePlan"("userId", "academicYear", "subject");
CREATE INDEX "LongRangePlan_academicYear_subject_grade_idx" ON "LongRangePlan"("academicYear", "subject", "grade");
CREATE TABLE "new_UnitPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "longRangePlanId" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "culminatingTask" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UnitPlan_longRangePlanId_fkey" FOREIGN KEY ("longRangePlanId") REFERENCES "LongRangePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnitPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UnitPlan" ("createdAt", "culminatingTask", "description", "endDate", "id", "longRangePlanId", "startDate", "title", "updatedAt", "userId") SELECT "createdAt", "culminatingTask", "description", "endDate", "id", "longRangePlanId", "startDate", "title", "updatedAt", "userId" FROM "UnitPlan";
DROP TABLE "UnitPlan";
ALTER TABLE "new_UnitPlan" RENAME TO "UnitPlan";
CREATE INDEX "UnitPlan_userId_startDate_idx" ON "UnitPlan"("userId", "startDate");
CREATE INDEX "UnitPlan_longRangePlanId_idx" ON "UnitPlan"("longRangePlanId");
CREATE INDEX "UnitPlan_userId_updatedAt_idx" ON "UnitPlan"("userId", "updatedAt");
CREATE INDEX "UnitPlan_startDate_endDate_idx" ON "UnitPlan"("startDate", "endDate");
CREATE INDEX "UnitPlan_userId_startDate_endDate_idx" ON "UnitPlan"("userId", "startDate", "endDate");
CREATE INDEX "UnitPlan_longRangePlanId_startDate_idx" ON "UnitPlan"("longRangePlanId", "startDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
