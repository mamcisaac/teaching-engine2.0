/*
  Warnings:

  - You are about to drop the column `affectedStudentIds` on the `UnavailableBlock` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UnavailableBlock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teacherId" INTEGER,
    "date" DATETIME NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UnavailableBlock_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UnavailableBlock" ("blockType", "createdAt", "date", "endMin", "id", "reason", "startMin", "teacherId", "updatedAt") SELECT "blockType", "createdAt", "date", "endMin", "id", "reason", "startMin", "teacherId", "updatedAt" FROM "UnavailableBlock";
DROP TABLE "UnavailableBlock";
ALTER TABLE "new_UnavailableBlock" RENAME TO "UnavailableBlock";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
