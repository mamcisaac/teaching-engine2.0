-- AlterTable
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "differentiationStrategies" JSONB;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "engagementHooks" JSONB;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "formativeCheckpoints" JSONB;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "interventionStrategies" JSONB;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "performanceOpportunities" TEXT;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "priorKnowledgeCheck" TEXT;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "reflectionActivities" JSONB;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "wheretoFramework" JSONB;

-- AlterTable
ALTER TABLE "LongRangePlan" ADD COLUMN "crossCurricularConnections" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "culturalCelebrationIntegration" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "diagnosticAssessments" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "differentationFramework" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "endOfYearPerformanceTasks" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "familyEngagementPlan" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "formativeStrategies" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "implementationFeasibility" REAL;
ALTER TABLE "LongRangePlan" ADD COLUMN "improvementAreas" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "inclusiveMaterialsCalendar" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "interventionTriggers" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "lastOptimized" DATETIME;
ALTER TABLE "LongRangePlan" ADD COLUMN "learningProgressions" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "monthlyAdjustmentProtocols" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "monthlyPreparationGuides" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "nextYearRecommendations" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "optimizationScore" REAL;
ALTER TABLE "LongRangePlan" ADD COLUMN "pedagogicalCertification" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "professionalDevelopmentPlan" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "qualityVerificationData" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "realWorldApplications" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "researchComplianceScore" REAL;
ALTER TABLE "LongRangePlan" ADD COLUMN "resourceTimeline" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "skillSpiraling" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "studentSuccessPredictions" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "successfulStrategies" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "summativeMilestones" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "sustainedHooks" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "thematicConnections" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "yearlyEngagementPlan" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "yearlyEssentialQuestions" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "yearlyTransferGoals" JSONB;

-- AlterTable
ALTER TABLE "UnitPlan" ADD COLUMN "assessmentRubric" JSONB;
ALTER TABLE "UnitPlan" ADD COLUMN "enduringUnderstandings" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "evidenceTypes" JSONB;
ALTER TABLE "UnitPlan" ADD COLUMN "performanceIndicators" JSONB;
ALTER TABLE "UnitPlan" ADD COLUMN "performanceTask" JSONB;
ALTER TABLE "UnitPlan" ADD COLUMN "transferableSkills" JSONB;

-- CreateTable
CREATE TABLE "PerformanceTaskTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeMin" INTEGER NOT NULL,
    "gradeMax" INTEGER NOT NULL,
    "scenario" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "rubricTemplate" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PerformanceTaskTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EssentialQuestionTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeMin" INTEGER NOT NULL,
    "gradeMax" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "bloomsLevel" TEXT,
    "cognitiveLoad" TEXT DEFAULT 'medium',
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TransferSkillTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "gradeMin" INTEGER NOT NULL,
    "gradeMax" INTEGER NOT NULL,
    "performanceIndicators" JSONB,
    "assessmentMethods" JSONB,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UnitPlanTransferSkill" (
    "unitPlanId" TEXT NOT NULL,
    "transferSkillId" TEXT NOT NULL,
    "emphasis" TEXT NOT NULL DEFAULT 'developing',

    PRIMARY KEY ("unitPlanId", "transferSkillId"),
    CONSTRAINT "UnitPlanTransferSkill_transferSkillId_fkey" FOREIGN KEY ("transferSkillId") REFERENCES "TransferSkillTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UnitPlanTransferSkill_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PerformanceTaskTemplate_userId_idx" ON "PerformanceTaskTemplate"("userId");

-- CreateIndex
CREATE INDEX "PerformanceTaskTemplate_subject_gradeMin_gradeMax_idx" ON "PerformanceTaskTemplate"("subject", "gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "PerformanceTaskTemplate_isPublic_subject_idx" ON "PerformanceTaskTemplate"("isPublic", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "EssentialQuestionTemplate_question_key" ON "EssentialQuestionTemplate"("question");

-- CreateIndex
CREATE INDEX "EssentialQuestionTemplate_subject_gradeMin_gradeMax_idx" ON "EssentialQuestionTemplate"("subject", "gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "EssentialQuestionTemplate_category_bloomsLevel_idx" ON "EssentialQuestionTemplate"("category", "bloomsLevel");

-- CreateIndex
CREATE INDEX "EssentialQuestionTemplate_rating_idx" ON "EssentialQuestionTemplate"("rating");

-- CreateIndex
CREATE INDEX "TransferSkillTemplate_category_idx" ON "TransferSkillTemplate"("category");

-- CreateIndex
CREATE INDEX "TransferSkillTemplate_gradeMin_gradeMax_idx" ON "TransferSkillTemplate"("gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "TransferSkillTemplate_isCore_idx" ON "TransferSkillTemplate"("isCore");

-- CreateIndex
CREATE INDEX "LongRangePlan_userId_optimizationScore_idx" ON "LongRangePlan"("userId", "optimizationScore");

-- CreateIndex
CREATE INDEX "LongRangePlan_pedagogicalCertification_idx" ON "LongRangePlan"("pedagogicalCertification");

-- CreateIndex
CREATE INDEX "LongRangePlan_lastOptimized_idx" ON "LongRangePlan"("lastOptimized");

-- CreateIndex
CREATE INDEX "LongRangePlan_optimizationScore_pedagogicalCertification_idx" ON "LongRangePlan"("optimizationScore", "pedagogicalCertification");
