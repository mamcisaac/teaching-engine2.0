-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN "description" TEXT;
ALTER TABLE "Milestone" ADD COLUMN "standardCodes" TEXT NOT NULL DEFAULT '[]';
