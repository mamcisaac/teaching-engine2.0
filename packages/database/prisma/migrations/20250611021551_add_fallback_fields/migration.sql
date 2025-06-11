-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "activityType" TEXT NOT NULL DEFAULT 'LESSON',
    "milestoneId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    "durationMins" INTEGER,
    "privateNote" TEXT,
    "publicNote" TEXT,
    "materialsText" TEXT,
    "tags" JSONB NOT NULL DEFAULT [],
    "isSubFriendly" BOOLEAN NOT NULL DEFAULT true,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    CONSTRAINT "Activity_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("activityType", "completedAt", "durationMins", "id", "materialsText", "milestoneId", "orderIndex", "privateNote", "publicNote", "tags", "title", "userId") SELECT "activityType", "completedAt", "durationMins", "id", "materialsText", "milestoneId", "orderIndex", "privateNote", "publicNote", "tags", "title", "userId" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE INDEX "Activity_milestoneId_orderIndex_idx" ON "Activity"("milestoneId", "orderIndex");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
