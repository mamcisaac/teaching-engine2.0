-- AlterTable
ALTER TABLE "StudentOutcomeProgress" ADD COLUMN "lastAssessedDate" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudentArtifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "artifactType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "textContent" TEXT,
    "metadata" JSONB,
    "checksum" TEXT,
    "thumbnailPath" TEXT,
    "thumbnailUrl" TEXT,
    "collectionContext" TEXT,
    "dateCollected" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB,
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "processingError" TEXT,
    "processingCompletedAt" DATETIME,
    "lastAssessedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentArtifact_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentArtifact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StudentArtifact" ("artifactType", "collectionContext", "createdAt", "dateCollected", "description", "fileName", "filePath", "fileSize", "id", "isPrivate", "metadata", "mimeType", "processingError", "processingStatus", "studentId", "tags", "textContent", "title", "updatedAt", "userId") SELECT "artifactType", "collectionContext", "createdAt", "dateCollected", "description", "fileName", "filePath", "fileSize", "id", "isPrivate", "metadata", "mimeType", "processingError", "processingStatus", "studentId", "tags", "textContent", "title", "updatedAt", "userId" FROM "StudentArtifact";
DROP TABLE "StudentArtifact";
ALTER TABLE "new_StudentArtifact" RENAME TO "StudentArtifact";
CREATE INDEX "StudentArtifact_studentId_idx" ON "StudentArtifact"("studentId");
CREATE INDEX "StudentArtifact_userId_idx" ON "StudentArtifact"("userId");
CREATE INDEX "StudentArtifact_studentId_dateCollected_idx" ON "StudentArtifact"("studentId", "dateCollected");
CREATE INDEX "StudentArtifact_artifactType_idx" ON "StudentArtifact"("artifactType");
CREATE INDEX "StudentArtifact_userId_dateCollected_idx" ON "StudentArtifact"("userId", "dateCollected");
CREATE INDEX "StudentArtifact_processingStatus_idx" ON "StudentArtifact"("processingStatus");
CREATE INDEX "StudentArtifact_studentId_artifactType_idx" ON "StudentArtifact"("studentId", "artifactType");
CREATE INDEX "StudentArtifact_checksum_idx" ON "StudentArtifact"("checksum");
CREATE INDEX "StudentArtifact_isArchived_idx" ON "StudentArtifact"("isArchived");
CREATE INDEX "StudentArtifact_studentId_userId_checksum_idx" ON "StudentArtifact"("studentId", "userId", "checksum");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
