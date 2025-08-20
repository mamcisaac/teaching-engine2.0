/*
  Warnings:

  - You are about to alter the column `differentiation` on the `ETFOLessonPlan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `materials` on the `ETFOLessonPlan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `monthlyThemes` on the `LongRangePlan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `differentiationStrategies` on the `UnitPlan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `essentialQuestions` on the `UnitPlan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `keyVocabulary` on the `UnitPlan` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- CreateTable
CREATE TABLE "UnitPlanResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnitPlanResource_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ETFOLessonPlanResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ETFOLessonPlanResource_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitPlanTransferSkill" (
    "unitPlanId" TEXT NOT NULL,
    "transferSkillId" TEXT NOT NULL,
    "emphasis" TEXT NOT NULL DEFAULT 'developing',

    PRIMARY KEY ("unitPlanId", "transferSkillId"),
    CONSTRAINT "UnitPlanTransferSkill_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UnitPlanTransferSkill_transferSkillId_fkey" FOREIGN KEY ("transferSkillId") REFERENCES "TransferSkillTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ETFOLessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "unitPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "mindsOn" TEXT,
    "action" TEXT,
    "consolidation" TEXT,
    "learningGoals" TEXT,
    "materials" JSONB,
    "grouping" TEXT,
    "differentiation" JSONB,
    "assessmentNotes" TEXT,
    "grade" INTEGER,
    "subject" TEXT,
    "language" TEXT,
    "isSubFriendly" BOOLEAN NOT NULL DEFAULT true,
    "subNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlan" ("action", "assessmentNotes", "consolidation", "createdAt", "date", "differentiation", "duration", "grade", "grouping", "id", "isSubFriendly", "language", "learningGoals", "materials", "mindsOn", "subNotes", "subject", "title", "unitPlanId", "updatedAt", "userId") SELECT "action", "assessmentNotes", "consolidation", "createdAt", "date", "differentiation", "duration", "grade", "grouping", "id", "isSubFriendly", "language", "learningGoals", "materials", "mindsOn", "subNotes", "subject", "title", "unitPlanId", "updatedAt", "userId" FROM "ETFOLessonPlan";
DROP TABLE "ETFOLessonPlan";
ALTER TABLE "new_ETFOLessonPlan" RENAME TO "ETFOLessonPlan";
CREATE INDEX "ETFOLessonPlan_userId_date_idx" ON "ETFOLessonPlan"("userId", "date");
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");
CREATE INDEX "ETFOLessonPlan_grade_subject_idx" ON "ETFOLessonPlan"("grade", "subject");
CREATE INDEX "ETFOLessonPlan_language_idx" ON "ETFOLessonPlan"("language");
CREATE INDEX "ETFOLessonPlan_userId_isSubFriendly_idx" ON "ETFOLessonPlan"("userId", "isSubFriendly");
CREATE INDEX "ETFOLessonPlan_userId_updatedAt_idx" ON "ETFOLessonPlan"("userId", "updatedAt");
CREATE TABLE "new_LongRangePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "description" TEXT,
    "learningGoals" TEXT,
    "monthlyThemes" JSONB,
    "overarchingQuestions" TEXT,
    "assessmentOverview" TEXT,
    "resourceNeeds" TEXT,
    "indigenousPerspectives" TEXT,
    "parentCommunication" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LongRangePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LongRangePlan" ("academicYear", "assessmentOverview", "createdAt", "description", "grade", "id", "indigenousPerspectives", "learningGoals", "monthlyThemes", "overarchingQuestions", "parentCommunication", "resourceNeeds", "subject", "title", "updatedAt", "userId") SELECT "academicYear", "assessmentOverview", "createdAt", "description", "grade", "id", "indigenousPerspectives", "learningGoals", "monthlyThemes", "overarchingQuestions", "parentCommunication", "resourceNeeds", "subject", "title", "updatedAt", "userId" FROM "LongRangePlan";
DROP TABLE "LongRangePlan";
ALTER TABLE "new_LongRangePlan" RENAME TO "LongRangePlan";
CREATE INDEX "LongRangePlan_userId_academicYear_idx" ON "LongRangePlan"("userId", "academicYear");
CREATE INDEX "LongRangePlan_userId_subject_grade_idx" ON "LongRangePlan"("userId", "subject", "grade");
CREATE INDEX "LongRangePlan_academicYear_grade_subject_idx" ON "LongRangePlan"("academicYear", "grade", "subject");
CREATE INDEX "LongRangePlan_userId_updatedAt_idx" ON "LongRangePlan"("userId", "updatedAt");
CREATE TABLE "new_UnitPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "longRangePlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "bigIdeas" TEXT,
    "essentialQuestions" JSONB,
    "description" TEXT,
    "assessmentPlan" TEXT,
    "culminatingTask" TEXT,
    "differentiationStrategies" JSONB,
    "keyVocabulary" JSONB,
    "priorKnowledge" TEXT,
    "communityConnections" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UnitPlan_longRangePlanId_fkey" FOREIGN KEY ("longRangePlanId") REFERENCES "LongRangePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnitPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UnitPlan" ("assessmentPlan", "bigIdeas", "communityConnections", "createdAt", "culminatingTask", "description", "differentiationStrategies", "endDate", "essentialQuestions", "id", "keyVocabulary", "longRangePlanId", "priorKnowledge", "startDate", "title", "updatedAt", "userId") SELECT "assessmentPlan", "bigIdeas", "communityConnections", "createdAt", "culminatingTask", "description", "differentiationStrategies", "endDate", "essentialQuestions", "id", "keyVocabulary", "longRangePlanId", "priorKnowledge", "startDate", "title", "updatedAt", "userId" FROM "UnitPlan";
DROP TABLE "UnitPlan";
ALTER TABLE "new_UnitPlan" RENAME TO "UnitPlan";
CREATE INDEX "UnitPlan_userId_startDate_idx" ON "UnitPlan"("userId", "startDate");
CREATE INDEX "UnitPlan_longRangePlanId_idx" ON "UnitPlan"("longRangePlanId");
CREATE INDEX "UnitPlan_userId_updatedAt_idx" ON "UnitPlan"("userId", "updatedAt");
CREATE INDEX "UnitPlan_startDate_endDate_idx" ON "UnitPlan"("startDate", "endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
