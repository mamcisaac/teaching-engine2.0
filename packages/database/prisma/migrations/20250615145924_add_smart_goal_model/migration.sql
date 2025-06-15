-- CreateTable
CREATE TABLE "SmartGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "outcomeId" TEXT NOT NULL,
    "milestoneId" INTEGER,
    "description" TEXT NOT NULL,
    "targetDate" DATETIME NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "observedValue" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SmartGoal_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SmartGoal_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SmartGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
