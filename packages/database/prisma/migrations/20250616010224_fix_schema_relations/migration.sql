-- CreateTable
CREATE TABLE "MediaResource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaResource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaResourceOutcome" (
    "mediaResourceId" INTEGER NOT NULL,
    "outcomeId" TEXT NOT NULL,

    PRIMARY KEY ("mediaResourceId", "outcomeId"),
    CONSTRAINT "MediaResourceOutcome_mediaResourceId_fkey" FOREIGN KEY ("mediaResourceId") REFERENCES "MediaResource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MediaResourceOutcome_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaResourceActivity" (
    "mediaResourceId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,

    PRIMARY KEY ("mediaResourceId", "activityId"),
    CONSTRAINT "MediaResourceActivity_mediaResourceId_fkey" FOREIGN KEY ("mediaResourceId") REFERENCES "MediaResource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MediaResourceActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
