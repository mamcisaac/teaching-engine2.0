/*
  Warnings:

  - You are about to drop the column `standardCodes` on the `Milestone` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Milestone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "userId" INTEGER,
    "description" TEXT,
    "targetDate" DATETIME,
    "estHours" INTEGER,
    "deadlineId" INTEGER,
    CONSTRAINT "Milestone_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Milestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Milestone_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "ReportDeadline" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("deadlineId", "description", "estHours", "id", "subjectId", "targetDate", "title", "userId") SELECT "deadlineId", "description", "estHours", "id", "subjectId", "targetDate", "title", "userId" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
