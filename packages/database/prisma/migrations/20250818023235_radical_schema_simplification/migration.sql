/*
  Warnings:

  - You are about to drop the column `accommodations` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `differentiationStrategies` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `extensions` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `modifications` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentStrategy` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `crossCurricularConnections` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `culturalCelebrationIntegration` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosticAssessments` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `differentationFramework` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `differentiationFramework` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `differentiationPlans` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `endOfYearPerformanceTasks` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `familyEngagementPlan` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `formativeStrategies` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `professionalGoals` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `resourceLibrary` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `thematicOverview` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `yearlyEssentialQuestions` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `crossCurricularConnections` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `environmentalEducation` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `fieldTripsAndGuestSpeakers` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `successCriteria` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `technologyIntegration` on the `UnitPlan` table. All the data in the column will be lost.

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
    "duration" INTEGER NOT NULL,
    "mindsOn" TEXT,
    "action" TEXT,
    "consolidation" TEXT,
    "learningGoals" TEXT,
    "materials" TEXT,
    "grouping" TEXT,
    "titleFr" TEXT,
    "mindsOnFr" TEXT,
    "actionFr" TEXT,
    "consolidationFr" TEXT,
    "learningGoalsFr" TEXT,
    "differentiation" TEXT,
    "assessmentType" TEXT,
    "assessmentNotes" TEXT,
    "isSubFriendly" BOOLEAN NOT NULL DEFAULT true,
    "subNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "grade" INTEGER,
    "language" TEXT,
    "subject" TEXT,
    "indigenousPerspectives" TEXT,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlan" ("action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "duration", "grade", "grouping", "id", "indigenousPerspectives", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "materials", "mindsOn", "mindsOnFr", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId") SELECT "action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "duration", "grade", "grouping", "id", "indigenousPerspectives", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "materials", "mindsOn", "mindsOnFr", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId" FROM "ETFOLessonPlan";
DROP TABLE "ETFOLessonPlan";
ALTER TABLE "new_ETFOLessonPlan" RENAME TO "ETFOLessonPlan";
CREATE INDEX "ETFOLessonPlan_userId_date_idx" ON "ETFOLessonPlan"("userId", "date");
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");
CREATE INDEX "ETFOLessonPlan_grade_subject_idx" ON "ETFOLessonPlan"("grade", "subject");
CREATE INDEX "ETFOLessonPlan_language_idx" ON "ETFOLessonPlan"("language");
CREATE INDEX "ETFOLessonPlan_userId_isSubFriendly_idx" ON "ETFOLessonPlan"("userId", "isSubFriendly");
CREATE INDEX "ETFOLessonPlan_userId_assessmentType_idx" ON "ETFOLessonPlan"("userId", "assessmentType");
CREATE INDEX "ETFOLessonPlan_userId_updatedAt_idx" ON "ETFOLessonPlan"("userId", "updatedAt");
CREATE INDEX "ETFOLessonPlan_date_duration_idx" ON "ETFOLessonPlan"("date", "duration");
CREATE INDEX "ETFOLessonPlan_userId_date_grade_idx" ON "ETFOLessonPlan"("userId", "date", "grade");
CREATE INDEX "ETFOLessonPlan_userId_date_subject_idx" ON "ETFOLessonPlan"("userId", "date", "subject");
CREATE INDEX "ETFOLessonPlan_grade_subject_date_idx" ON "ETFOLessonPlan"("grade", "subject", "date");
CREATE INDEX "ETFOLessonPlan_userId_grade_subject_idx" ON "ETFOLessonPlan"("userId", "grade", "subject");
CREATE INDEX "ETFOLessonPlan_isSubFriendly_grade_subject_idx" ON "ETFOLessonPlan"("isSubFriendly", "grade", "subject");
CREATE TABLE "new_LongRangePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "term" TEXT,
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "goals" TEXT,
    "themes" JSONB,
    "overarchingQuestions" TEXT,
    "assessmentOverview" TEXT,
    "resourceNeeds" TEXT,
    "titleFr" TEXT,
    "descriptionFr" TEXT,
    "goalsFr" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "indigenousPerspectives" TEXT,
    "parentCommunication" TEXT,
    CONSTRAINT "LongRangePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LongRangePlan" ("academicYear", "assessmentOverview", "createdAt", "description", "descriptionFr", "endDate", "goals", "goalsFr", "grade", "id", "indigenousPerspectives", "overarchingQuestions", "parentCommunication", "resourceNeeds", "startDate", "subject", "term", "themes", "title", "titleFr", "updatedAt", "userId") SELECT "academicYear", "assessmentOverview", "createdAt", "description", "descriptionFr", "endDate", "goals", "goalsFr", "grade", "id", "indigenousPerspectives", "overarchingQuestions", "parentCommunication", "resourceNeeds", "startDate", "subject", "term", "themes", "title", "titleFr", "updatedAt", "userId" FROM "LongRangePlan";
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
    "bigIdeas" TEXT,
    "essentialQuestions" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "estimatedHours" INTEGER,
    "titleFr" TEXT,
    "descriptionFr" TEXT,
    "bigIdeasFr" TEXT,
    "assessmentPlan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "communityConnections" TEXT,
    "culminatingTask" TEXT,
    "differentiationStrategies" TEXT,
    "indigenousPerspectives" TEXT,
    "keyVocabulary" TEXT,
    "parentCommunicationPlan" TEXT,
    "priorKnowledge" TEXT,
    CONSTRAINT "UnitPlan_longRangePlanId_fkey" FOREIGN KEY ("longRangePlanId") REFERENCES "LongRangePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnitPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UnitPlan" ("assessmentPlan", "bigIdeas", "bigIdeasFr", "communityConnections", "createdAt", "culminatingTask", "description", "descriptionFr", "differentiationStrategies", "endDate", "essentialQuestions", "estimatedHours", "id", "indigenousPerspectives", "keyVocabulary", "longRangePlanId", "parentCommunicationPlan", "priorKnowledge", "startDate", "title", "titleFr", "updatedAt", "userId") SELECT "assessmentPlan", "bigIdeas", "bigIdeasFr", "communityConnections", "createdAt", "culminatingTask", "description", "descriptionFr", "differentiationStrategies", "endDate", "essentialQuestions", "estimatedHours", "id", "indigenousPerspectives", "keyVocabulary", "longRangePlanId", "parentCommunicationPlan", "priorKnowledge", "startDate", "title", "titleFr", "updatedAt", "userId" FROM "UnitPlan";
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
