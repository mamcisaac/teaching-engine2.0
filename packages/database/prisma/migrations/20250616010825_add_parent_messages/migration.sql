-- CreateTable
CREATE TABLE "ParentMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "contentFr" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParentMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParentMessageOutcome" (
    "parentMessageId" INTEGER NOT NULL,
    "outcomeId" TEXT NOT NULL,

    PRIMARY KEY ("parentMessageId", "outcomeId"),
    CONSTRAINT "ParentMessageOutcome_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "ParentMessage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParentMessageOutcome_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ParentMessageActivity" (
    "parentMessageId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    PRIMARY KEY ("parentMessageId", "activityId"),
    CONSTRAINT "ParentMessageActivity_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "ParentMessage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ParentMessageActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
