-- CreateTable
CREATE TABLE "ReportDeadline" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "remindDaysBefore" INTEGER NOT NULL DEFAULT 14,
    CONSTRAINT "ReportDeadline_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "activityType" TEXT NOT NULL DEFAULT 'LESSON',
    "milestoneId" INTEGER NOT NULL,
    "userId" INTEGER,
    "durationMins" INTEGER,
    "privateNote" TEXT,
    "publicNote" TEXT,
    "completedAt" DATETIME,
    CONSTRAINT "Activity_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("completedAt", "durationMins", "id", "milestoneId", "privateNote", "publicNote", "title", "userId") SELECT "completedAt", "durationMins", "id", "milestoneId", "privateNote", "publicNote", "title", "userId" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE TABLE "new_Milestone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "userId" INTEGER,
    "targetDate" DATETIME,
    "estHours" INTEGER,
    "deadlineId" INTEGER,
    CONSTRAINT "Milestone_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Milestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Milestone_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "ReportDeadline" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Milestone" ("estHours", "id", "subjectId", "targetDate", "title", "userId") SELECT "estHours", "id", "subjectId", "targetDate", "title", "userId" FROM "Milestone";
DROP TABLE "Milestone";
ALTER TABLE "new_Milestone" RENAME TO "Milestone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
