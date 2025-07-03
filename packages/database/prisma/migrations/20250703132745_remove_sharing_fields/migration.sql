/*
  Warnings:

  - You are about to drop the column `isPublic` on the `ActivityCollection` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `PlanTemplate` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivityCollection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActivityCollection" ("createdAt", "description", "id", "name", "updatedAt", "userId") SELECT "createdAt", "description", "id", "name", "updatedAt", "userId" FROM "ActivityCollection";
DROP TABLE "ActivityCollection";
ALTER TABLE "new_ActivityCollection" RENAME TO "ActivityCollection";
CREATE INDEX "ActivityCollection_userId_idx" ON "ActivityCollection"("userId");
CREATE TABLE "new_PlanTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionFr" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT,
    "gradeMin" INTEGER,
    "gradeMax" INTEGER,
    "tags" JSONB NOT NULL,
    "keywords" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" INTEGER,
    "content" JSONB NOT NULL,
    "estimatedWeeks" INTEGER,
    "unitStructure" JSONB,
    "estimatedMinutes" INTEGER,
    "lessonStructure" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "averageRating" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlanTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlanTemplate" ("averageRating", "category", "content", "createdAt", "createdByUserId", "description", "descriptionFr", "estimatedMinutes", "estimatedWeeks", "gradeMax", "gradeMin", "id", "isSystem", "keywords", "lastUsedAt", "lessonStructure", "subject", "tags", "title", "titleFr", "type", "unitStructure", "updatedAt", "usageCount") SELECT "averageRating", "category", "content", "createdAt", "createdByUserId", "description", "descriptionFr", "estimatedMinutes", "estimatedWeeks", "gradeMax", "gradeMin", "id", "isSystem", "keywords", "lastUsedAt", "lessonStructure", "subject", "tags", "title", "titleFr", "type", "unitStructure", "updatedAt", "usageCount" FROM "PlanTemplate";
DROP TABLE "PlanTemplate";
ALTER TABLE "new_PlanTemplate" RENAME TO "PlanTemplate";
CREATE INDEX "PlanTemplate_type_category_idx" ON "PlanTemplate"("type", "category");
CREATE INDEX "PlanTemplate_subject_gradeMin_gradeMax_idx" ON "PlanTemplate"("subject", "gradeMin", "gradeMax");
CREATE INDEX "PlanTemplate_isSystem_idx" ON "PlanTemplate"("isSystem");
CREATE INDEX "PlanTemplate_createdByUserId_idx" ON "PlanTemplate"("createdByUserId");
CREATE INDEX "PlanTemplate_usageCount_idx" ON "PlanTemplate"("usageCount");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
