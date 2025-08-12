-- Add pedagogical optimization fields to LongRangePlan
-- This migration enhances long range plans with comprehensive UbD, WHERETO, and optimization features

ALTER TABLE "LongRangePlan" ADD COLUMN "yearlyEssentialQuestions" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "endOfYearPerformanceTasks" JSONB;  
ALTER TABLE "LongRangePlan" ADD COLUMN "learningProgressions" JSONB;

-- Assessment Framework (Year-Long)
ALTER TABLE "LongRangePlan" ADD COLUMN "diagnosticAssessments" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "formativeStrategies" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "summativeMilestones" JSONB;

-- WHERETO Framework Implementation  
ALTER TABLE "LongRangePlan" ADD COLUMN "yearlyEngagementPlan" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "sustainedHooks" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "differentationFramework" JSONB;

-- Cross-Curricular Integration
ALTER TABLE "LongRangePlan" ADD COLUMN "thematicConnections" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "skillSpiraling" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "realWorldApplications" JSONB;

-- Predictive Analytics & Data-Driven Planning
ALTER TABLE "LongRangePlan" ADD COLUMN "studentSuccessPredictions" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "interventionTriggers" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "monthlyAdjustmentProtocols" JSONB;

-- Cultural Responsiveness
ALTER TABLE "LongRangePlan" ADD COLUMN "familyEngagementPlan" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "culturalCelebrationIntegration" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "inclusiveMaterialsCalendar" JSONB;

-- Implementation Support
ALTER TABLE "LongRangePlan" ADD COLUMN "monthlyPreparationGuides" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "resourceTimeline" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "professionalDevelopmentPlan" JSONB;

-- Optimization Metadata
ALTER TABLE "LongRangePlan" ADD COLUMN "optimizationScore" DOUBLE PRECISION;
ALTER TABLE "LongRangePlan" ADD COLUMN "pedagogicalCertification" TEXT;
ALTER TABLE "LongRangePlan" ADD COLUMN "lastOptimized" TIMESTAMP(3);
ALTER TABLE "LongRangePlan" ADD COLUMN "qualityVerificationData" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "researchComplianceScore" DOUBLE PRECISION;
ALTER TABLE "LongRangePlan" ADD COLUMN "implementationFeasibility" DOUBLE PRECISION;

-- Continuous Improvement Tracking
ALTER TABLE "LongRangePlan" ADD COLUMN "successfulStrategies" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "improvementAreas" JSONB;
ALTER TABLE "LongRangePlan" ADD COLUMN "nextYearRecommendations" JSONB;

-- Create indexes for optimization queries
CREATE INDEX "LongRangePlan_userId_optimizationScore_idx" ON "LongRangePlan"("userId", "optimizationScore");
CREATE INDEX "LongRangePlan_pedagogicalCertification_idx" ON "LongRangePlan"("pedagogicalCertification");  
CREATE INDEX "LongRangePlan_lastOptimized_idx" ON "LongRangePlan"("lastOptimized");
CREATE INDEX "LongRangePlan_optimizationScore_pedagogicalCertification_idx" ON "LongRangePlan"("optimizationScore", "pedagogicalCertification");

-- Add comments for documentation
COMMENT ON COLUMN "LongRangePlan"."yearlyEssentialQuestions" IS 'Grade-appropriate essential questions spanning the entire academic year';
COMMENT ON COLUMN "LongRangePlan"."endOfYearPerformanceTasks" IS 'Culminating authentic assessment tasks demonstrating year-long learning';
COMMENT ON COLUMN "LongRangePlan"."learningProgressions" IS 'September to June learning progression mapping';
COMMENT ON COLUMN "LongRangePlan"."yearlyEngagementPlan" IS 'WHERETO framework implementation across the full year';
COMMENT ON COLUMN "LongRangePlan"."optimizationScore" IS 'Pedagogical optimization score (0-100) based on research-based best practices';
COMMENT ON COLUMN "LongRangePlan"."pedagogicalCertification" IS 'Quality certification: exemplary|proficient|acceptable|needs_improvement';
COMMENT ON COLUMN "LongRangePlan"."lastOptimized" IS 'Timestamp when plan was last pedagogically optimized';
COMMENT ON COLUMN "LongRangePlan"."qualityVerificationData" IS 'Comprehensive quality metrics from pedagogical analysis';
COMMENT ON COLUMN "LongRangePlan"."researchComplianceScore" IS 'Compliance with research-based educational practices (0-1)';
COMMENT ON COLUMN "LongRangePlan"."implementationFeasibility" IS 'Practicality assessment for classroom implementation (0-1)';