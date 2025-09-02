-- AlterTable: Add simple assessment fields to ETFOLessonPlan
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "quickAssessment" TEXT;
ALTER TABLE "ETFOLessonPlan" ADD COLUMN "quickAssessmentNotes" TEXT;