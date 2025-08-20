/*
  Warnings:

  - You are about to drop the column `engagementHooks` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `formativeCheckpoints` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `interventionStrategies` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `performanceOpportunities` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `priorKnowledgeCheck` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `reflectionActivities` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `wheretoFramework` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `implementationFeasibility` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `improvementAreas` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `inclusiveMaterialsCalendar` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `interventionTriggers` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `lastOptimized` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `learningProgressions` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyAdjustmentProtocols` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyPreparationGuides` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `nextYearRecommendations` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `optimizationScore` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `pedagogicalCertification` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `professionalDevelopmentPlan` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `qualityVerificationData` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `realWorldApplications` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `researchComplianceScore` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `resourceTimeline` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `skillSpiraling` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `studentSuccessPredictions` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `successfulStrategies` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `summativeMilestones` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `sustainedHooks` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `thematicConnections` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `yearlyEngagementPlan` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `yearlyTransferGoals` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentRubric` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `enduringUnderstandings` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `evidenceTypes` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `learningSkills` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `performanceIndicators` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `performanceTask` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `socialJusticeConnections` on the `UnitPlan` table. All the data in the column will be lost.
  - You are about to drop the column `transferableSkills` on the `UnitPlan` table. All the data in the column will be lost.

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
    "indigenousPerspectives" TEXT,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlan" ("accommodations", "action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "differentiationStrategies", "duration", "extensions", "grade", "grouping", "id", "indigenousPerspectives", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "materials", "mindsOn", "mindsOnFr", "modifications", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId") SELECT "accommodations", "action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "differentiationStrategies", "duration", "extensions", "grade", "grouping", "id", "indigenousPerspectives", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "materials", "mindsOn", "mindsOnFr", "modifications", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId" FROM "ETFOLessonPlan";
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
    "professionalGoals" TEXT,
    "titleFr" TEXT,
    "descriptionFr" TEXT,
    "goalsFr" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "crossCurricularConnections" JSONB,
    "culturalCelebrationIntegration" JSONB,
    "diagnosticAssessments" JSONB,
    "differentationFramework" JSONB,
    "endOfYearPerformanceTasks" JSONB,
    "familyEngagementPlan" JSONB,
    "formativeStrategies" JSONB,
    "yearlyEssentialQuestions" JSONB,
    "differentiationFramework" TEXT,
    "thematicOverview" TEXT,
    "assessmentStrategy" TEXT,
    "differentiationPlans" TEXT,
    "indigenousPerspectives" TEXT,
    "resourceLibrary" TEXT,
    "parentCommunication" TEXT,
    CONSTRAINT "LongRangePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LongRangePlan" ("academicYear", "assessmentOverview", "assessmentStrategy", "createdAt", "crossCurricularConnections", "culturalCelebrationIntegration", "description", "descriptionFr", "diagnosticAssessments", "differentationFramework", "differentiationFramework", "differentiationPlans", "endOfYearPerformanceTasks", "familyEngagementPlan", "formativeStrategies", "goals", "goalsFr", "grade", "id", "indigenousPerspectives", "overarchingQuestions", "parentCommunication", "professionalGoals", "resourceLibrary", "resourceNeeds", "subject", "term", "thematicOverview", "themes", "title", "titleFr", "updatedAt", "userId", "yearlyEssentialQuestions") SELECT "academicYear", "assessmentOverview", "assessmentStrategy", "createdAt", "crossCurricularConnections", "culturalCelebrationIntegration", "description", "descriptionFr", "diagnosticAssessments", "differentationFramework", "differentiationFramework", "differentiationPlans", "endOfYearPerformanceTasks", "familyEngagementPlan", "formativeStrategies", "goals", "goalsFr", "grade", "id", "indigenousPerspectives", "overarchingQuestions", "parentCommunication", "professionalGoals", "resourceLibrary", "resourceNeeds", "subject", "term", "thematicOverview", "themes", "title", "titleFr", "updatedAt", "userId", "yearlyEssentialQuestions" FROM "LongRangePlan";
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
    "essentialQuestions" JSONB,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "estimatedHours" INTEGER,
    "titleFr" TEXT,
    "descriptionFr" TEXT,
    "bigIdeasFr" TEXT,
    "assessmentPlan" TEXT,
    "successCriteria" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "communityConnections" TEXT,
    "crossCurricularConnections" TEXT,
    "culminatingTask" TEXT,
    "differentiationStrategies" JSONB,
    "environmentalEducation" TEXT,
    "fieldTripsAndGuestSpeakers" TEXT,
    "indigenousPerspectives" TEXT,
    "keyVocabulary" JSONB,
    "parentCommunicationPlan" TEXT,
    "priorKnowledge" TEXT,
    "technologyIntegration" TEXT,
    CONSTRAINT "UnitPlan_longRangePlanId_fkey" FOREIGN KEY ("longRangePlanId") REFERENCES "LongRangePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnitPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UnitPlan" ("assessmentPlan", "bigIdeas", "bigIdeasFr", "communityConnections", "createdAt", "crossCurricularConnections", "culminatingTask", "description", "descriptionFr", "differentiationStrategies", "endDate", "environmentalEducation", "essentialQuestions", "estimatedHours", "fieldTripsAndGuestSpeakers", "id", "indigenousPerspectives", "keyVocabulary", "longRangePlanId", "parentCommunicationPlan", "priorKnowledge", "startDate", "successCriteria", "technologyIntegration", "title", "titleFr", "updatedAt", "userId") SELECT "assessmentPlan", "bigIdeas", "bigIdeasFr", "communityConnections", "createdAt", "crossCurricularConnections", "culminatingTask", "description", "descriptionFr", "differentiationStrategies", "endDate", "environmentalEducation", "essentialQuestions", "estimatedHours", "fieldTripsAndGuestSpeakers", "id", "indigenousPerspectives", "keyVocabulary", "longRangePlanId", "parentCommunicationPlan", "priorKnowledge", "startDate", "successCriteria", "technologyIntegration", "title", "titleFr", "updatedAt", "userId" FROM "UnitPlan";
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
