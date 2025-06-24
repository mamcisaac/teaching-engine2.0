-- AlterTable
ALTER TABLE "UnitPlan" ADD COLUMN "communityConnections" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "crossCurricularConnections" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "culminatingTask" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "differentiationStrategies" JSONB;
ALTER TABLE "UnitPlan" ADD COLUMN "environmentalEducation" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "fieldTripsAndGuestSpeakers" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "indigenousPerspectives" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "keyVocabulary" JSONB;
ALTER TABLE "UnitPlan" ADD COLUMN "learningSkills" JSONB;
ALTER TABLE "UnitPlan" ADD COLUMN "parentCommunicationPlan" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "priorKnowledge" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "socialJusticeConnections" TEXT;
ALTER TABLE "UnitPlan" ADD COLUMN "technologyIntegration" TEXT;
