-- CreateTable
CREATE TABLE "CognatePair" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordFr" TEXT NOT NULL,
    "wordEn" TEXT NOT NULL,
    "notes" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CognatePair_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CognateOutcome" (
    "cognatePairId" INTEGER NOT NULL,
    "outcomeId" TEXT NOT NULL,

    PRIMARY KEY ("cognatePairId", "outcomeId"),
    CONSTRAINT "CognateOutcome_cognatePairId_fkey" FOREIGN KEY ("cognatePairId") REFERENCES "CognatePair" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CognateOutcome_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CognateActivity" (
    "cognatePairId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    PRIMARY KEY ("cognatePairId", "activityId"),
    CONSTRAINT "CognateActivity_cognatePairId_fkey" FOREIGN KEY ("cognatePairId") REFERENCES "CognatePair" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CognateActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CognatePair_wordFr_wordEn_userId_key" ON "CognatePair"("wordFr", "wordEn", "userId");
