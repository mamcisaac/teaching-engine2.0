-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentAssessmentResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "assessmentResultId" INTEGER NOT NULL,
    "score" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentAssessmentResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentAssessmentResult_assessmentResultId_fkey" FOREIGN KEY ("assessmentResultId") REFERENCES "AssessmentResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudentAssessmentResult" ("assessmentResultId", "createdAt", "id", "notes", "score", "studentId", "updatedAt") SELECT "assessmentResultId", "createdAt", "id", "notes", "score", "studentId", "updatedAt" FROM "StudentAssessmentResult";
DROP TABLE "StudentAssessmentResult";
ALTER TABLE "new_StudentAssessmentResult" RENAME TO "StudentAssessmentResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
