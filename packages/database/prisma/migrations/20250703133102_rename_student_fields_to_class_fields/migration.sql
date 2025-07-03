/*
  Warnings:

  - You are about to drop the column `studentChallenges` on the `DaybookEntry` table. All the data in the column will be lost.
  - You are about to drop the column `studentEngagement` on the `DaybookEntry` table. All the data in the column will be lost.
  - You are about to drop the column `studentSuccesses` on the `DaybookEntry` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DaybookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "lessonPlanId" TEXT,
    "whatWorked" TEXT,
    "whatDidntWork" TEXT,
    "nextSteps" TEXT,
    "classEngagement" TEXT,
    "commonChallenges" TEXT,
    "notableAchievements" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "whatWorkedFr" TEXT,
    "whatDidntWorkFr" TEXT,
    "nextStepsFr" TEXT,
    "notesFr" TEXT,
    "overallRating" INTEGER,
    "wouldReuseLesson" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DaybookEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DaybookEntry_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DaybookEntry" ("createdAt", "date", "id", "lessonPlanId", "nextSteps", "nextStepsFr", "notes", "notesFr", "overallRating", "privateNotes", "updatedAt", "userId", "whatDidntWork", "whatDidntWorkFr", "whatWorked", "whatWorkedFr", "wouldReuseLesson") SELECT "createdAt", "date", "id", "lessonPlanId", "nextSteps", "nextStepsFr", "notes", "notesFr", "overallRating", "privateNotes", "updatedAt", "userId", "whatDidntWork", "whatDidntWorkFr", "whatWorked", "whatWorkedFr", "wouldReuseLesson" FROM "DaybookEntry";
DROP TABLE "DaybookEntry";
ALTER TABLE "new_DaybookEntry" RENAME TO "DaybookEntry";
CREATE UNIQUE INDEX "DaybookEntry_lessonPlanId_key" ON "DaybookEntry"("lessonPlanId");
CREATE INDEX "DaybookEntry_userId_date_idx" ON "DaybookEntry"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
