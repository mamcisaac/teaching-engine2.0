/*
  Warnings:

  - You are about to drop the column `differentiation` on the `ETFOLessonPlan` table. All the data in the column will be lost.
  - You are about to drop the column `learningGoals` on the `LongRangePlan` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyThemes` on the `LongRangePlan` table. All the data in the column will be lost.

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
    "engagementHooks" JSONB,
    "formativeCheckpoints" JSONB,
    "interventionStrategies" JSONB,
    "performanceOpportunities" TEXT,
    "priorKnowledgeCheck" TEXT,
    "reflectionActivities" JSONB,
    "wheretoFramework" JSONB,
    "indigenousPerspectives" TEXT,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlan" ("action", "assessmentNotes", "consolidation", "createdAt", "date", "duration", "grade", "grouping", "id", "isSubFriendly", "language", "learningGoals", "materials", "mindsOn", "subNotes", "subject", "title", "unitPlanId", "updatedAt", "userId") SELECT "action", "assessmentNotes", "consolidation", "createdAt", "date", "duration", "grade", "grouping", "id", "isSubFriendly", "language", "learningGoals", "materials", "mindsOn", "subNotes", "subject", "title", "unitPlanId", "updatedAt", "userId" FROM "ETFOLessonPlan";
DROP TABLE "ETFOLessonPlan";
ALTER TABLE "new_ETFOLessonPlan" RENAME TO "ETFOLessonPlan";
CREATE INDEX "ETFOLessonPlan_userId_date_idx" ON "ETFOLessonPlan"("userId", "date");
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "crossCurricularConnections" JSONB,
    "culturalCelebrationIntegration" JSONB,
    "diagnosticAssessments" JSONB,
    "differentationFramework" JSONB,
    "endOfYearPerformanceTasks" JSONB,
    "familyEngagementPlan" JSONB,
    "formativeStrategies" JSONB,
    "implementationFeasibility" REAL,
    "improvementAreas" JSONB,
    "inclusiveMaterialsCalendar" JSONB,
    "interventionTriggers" JSONB,
    "lastOptimized" DATETIME,
    "learningProgressions" JSONB,
    "monthlyAdjustmentProtocols" JSONB,
    "monthlyPreparationGuides" JSONB,
    "nextYearRecommendations" JSONB,
    "optimizationScore" REAL,
    "pedagogicalCertification" TEXT,
    "professionalDevelopmentPlan" JSONB,
    "qualityVerificationData" JSONB,
    "realWorldApplications" JSONB,
    "researchComplianceScore" REAL,
    "resourceTimeline" JSONB,
    "skillSpiraling" JSONB,
    "studentSuccessPredictions" JSONB,
    "successfulStrategies" JSONB,
    "summativeMilestones" JSONB,
    "sustainedHooks" JSONB,
    "thematicConnections" JSONB,
    "yearlyEngagementPlan" JSONB,
    "yearlyEssentialQuestions" JSONB,
    "yearlyTransferGoals" JSONB,
    "differentiationFramework" TEXT,
    "thematicOverview" TEXT,
    "assessmentStrategy" TEXT,
    "differentiationPlans" TEXT,
    "indigenousPerspectives" TEXT,
    "resourceLibrary" TEXT,
    "parentCommunication" TEXT,
    CONSTRAINT "LongRangePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LongRangePlan" ("academicYear", "assessmentOverview", "createdAt", "description", "grade", "id", "indigenousPerspectives", "overarchingQuestions", "parentCommunication", "resourceNeeds", "subject", "title", "updatedAt", "userId") SELECT "academicYear", "assessmentOverview", "createdAt", "description", "grade", "id", "indigenousPerspectives", "overarchingQuestions", "parentCommunication", "resourceNeeds", "subject", "title", "updatedAt", "userId" FROM "LongRangePlan";
DROP TABLE "LongRangePlan";
ALTER TABLE "new_LongRangePlan" RENAME TO "LongRangePlan";
CREATE INDEX "LongRangePlan_userId_academicYear_idx" ON "LongRangePlan"("userId", "academicYear");
CREATE INDEX "LongRangePlan_userId_subject_grade_idx" ON "LongRangePlan"("userId", "subject", "grade");
CREATE INDEX "LongRangePlan_academicYear_grade_subject_idx" ON "LongRangePlan"("academicYear", "grade", "subject");
CREATE INDEX "LongRangePlan_userId_updatedAt_idx" ON "LongRangePlan"("userId", "updatedAt");
CREATE INDEX "LongRangePlan_optimizationScore_pedagogicalCertification_idx" ON "LongRangePlan"("optimizationScore", "pedagogicalCertification");
CREATE INDEX "LongRangePlan_lastOptimized_idx" ON "LongRangePlan"("lastOptimized");
CREATE INDEX "LongRangePlan_pedagogicalCertification_idx" ON "LongRangePlan"("pedagogicalCertification");
CREATE INDEX "LongRangePlan_userId_optimizationScore_idx" ON "LongRangePlan"("userId", "optimizationScore");
CREATE INDEX "LongRangePlan_academicYear_subject_grade_idx" ON "LongRangePlan"("academicYear", "subject", "grade");
CREATE INDEX "LongRangePlan_userId_academicYear_subject_idx" ON "LongRangePlan"("userId", "academicYear", "subject");
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
    "learningSkills" JSONB,
    "parentCommunicationPlan" TEXT,
    "priorKnowledge" TEXT,
    "socialJusticeConnections" TEXT,
    "technologyIntegration" TEXT,
    "assessmentRubric" JSONB,
    "enduringUnderstandings" TEXT,
    "evidenceTypes" JSONB,
    "performanceIndicators" JSONB,
    "performanceTask" JSONB,
    "transferableSkills" JSONB,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" DATETIME,
    "lockedReason" TEXT,
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
CREATE INDEX "UnitPlan_longRangePlanId_startDate_idx" ON "UnitPlan"("longRangePlanId", "startDate");
CREATE INDEX "UnitPlan_userId_startDate_endDate_idx" ON "UnitPlan"("userId", "startDate", "endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
