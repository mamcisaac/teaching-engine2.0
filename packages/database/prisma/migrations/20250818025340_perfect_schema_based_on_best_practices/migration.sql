-- AlterTable
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "grade" INTEGER;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "grouping" TEXT;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "language" TEXT;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "learningGoals" TEXT;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "subject" TEXT;

-- AlterTable
ALTER TABLE "LongRangePlan" ADD COLUMN "assessmentOverview" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "indigenousPerspectives" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "learningGoals" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "monthlyThemes" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "overarchingQuestions" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "parentCommunication" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "resourceNeeds" TEXT;

-- AlterTable
ALTER TABLE "UnitPlan" ADD COLUMN "assessmentPlan" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "bigIdeas" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "communityConnections" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "differentiationStrategies" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "essentialQuestions" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "keyVocabulary" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "priorKnowledge" TEXT;

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_grade_subject_idx" ON "ETFOLessonPlan"("grade", "subject");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_grade_subject_idx" ON "ETFOLessonPlan"("userId", "grade", "subject");
