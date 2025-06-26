-- CreateTable
CREATE TABLE "RecentPlanAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "planType" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecentPlanAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RecentPlanAccess_userId_planType_planId_key" ON "RecentPlanAccess"("userId", "planType", "planId");

-- CreateIndex
CREATE INDEX "RecentPlanAccess_userId_lastAccessed_idx" ON "RecentPlanAccess"("userId", "lastAccessed");

-- CreateIndex
CREATE INDEX "RecentPlanAccess_planType_planId_idx" ON "RecentPlanAccess"("planType", "planId");