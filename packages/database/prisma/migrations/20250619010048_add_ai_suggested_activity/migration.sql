-- CreateTable
CREATE TABLE "AISuggestedActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "outcomeId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "materials" TEXT NOT NULL DEFAULT '[]',
    "duration" INTEGER NOT NULL,
    "theme" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AISuggestedActivity_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AISuggestedActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
