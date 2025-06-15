-- CreateTable
CREATE TABLE "ThematicUnit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionFr" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ThematicUnit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThematicUnitOutcome" (
    "thematicUnitId" INTEGER NOT NULL,
    "outcomeId" TEXT NOT NULL,

    PRIMARY KEY ("thematicUnitId", "outcomeId"),
    CONSTRAINT "ThematicUnitOutcome_thematicUnitId_fkey" FOREIGN KEY ("thematicUnitId") REFERENCES "ThematicUnit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ThematicUnitOutcome_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThematicUnitActivity" (
    "thematicUnitId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    PRIMARY KEY ("thematicUnitId", "activityId"),
    CONSTRAINT "ThematicUnitActivity_thematicUnitId_fkey" FOREIGN KEY ("thematicUnitId") REFERENCES "ThematicUnit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ThematicUnitActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
