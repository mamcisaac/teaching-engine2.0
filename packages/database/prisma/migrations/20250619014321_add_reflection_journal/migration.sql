-- AlterTable
ALTER TABLE "AssessmentTemplate" ADD COLUMN "rubricCriteria" TEXT;

-- CreateTable
CREATE TABLE "ReflectionJournalEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "themeId" INTEGER,
    "assessmentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReflectionJournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReflectionJournalEntry_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "ThematicUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReflectionJournalEntry_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssessmentResult" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReflectionOutcome" (
    "reflectionId" INTEGER NOT NULL,
    "outcomeId" TEXT NOT NULL,

    PRIMARY KEY ("reflectionId", "outcomeId"),
    CONSTRAINT "ReflectionOutcome_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "ReflectionJournalEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReflectionOutcome_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
