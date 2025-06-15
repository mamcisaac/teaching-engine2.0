-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "materialsTextEn" TEXT;
ALTER TABLE "Activity" ADD COLUMN "materialsTextFr" TEXT;
ALTER TABLE "Activity" ADD COLUMN "privateNoteEn" TEXT;
ALTER TABLE "Activity" ADD COLUMN "privateNoteFr" TEXT;
ALTER TABLE "Activity" ADD COLUMN "publicNoteEn" TEXT;
ALTER TABLE "Activity" ADD COLUMN "publicNoteFr" TEXT;
ALTER TABLE "Activity" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Activity" ADD COLUMN "titleFr" TEXT;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "Milestone" ADD COLUMN "descriptionFr" TEXT;
ALTER TABLE "Milestone" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Milestone" ADD COLUMN "titleFr" TEXT;

-- AlterTable
ALTER TABLE "Newsletter" ADD COLUMN "contentEn" TEXT;
ALTER TABLE "Newsletter" ADD COLUMN "contentFr" TEXT;
ALTER TABLE "Newsletter" ADD COLUMN "polishedDraftEn" TEXT;
ALTER TABLE "Newsletter" ADD COLUMN "polishedDraftFr" TEXT;
ALTER TABLE "Newsletter" ADD COLUMN "rawDraftEn" TEXT;
ALTER TABLE "Newsletter" ADD COLUMN "rawDraftFr" TEXT;
ALTER TABLE "Newsletter" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "Newsletter" ADD COLUMN "titleFr" TEXT;

-- AlterTable
ALTER TABLE "OralRoutineTemplate" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "OralRoutineTemplate" ADD COLUMN "descriptionFr" TEXT;
ALTER TABLE "OralRoutineTemplate" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "OralRoutineTemplate" ADD COLUMN "titleFr" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Subject" ADD COLUMN "nameFr" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'teacher',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en'
);
INSERT INTO "new_User" ("email", "id", "name", "password", "role") SELECT "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
