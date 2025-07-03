-- CreateTable
CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "dateFrom" DATETIME NOT NULL,
    "dateTo" DATETIME NOT NULL,
    "tone" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "metadata" JSONB,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "sentAt" DATETIME,
    "focusAreas" JSONB,
    "includeUpcomingEvents" BOOLEAN NOT NULL DEFAULT true,
    "lessonPlansUsed" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Newsletter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubstitutePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "dateFor" DATETIME NOT NULL,
    "grade" INTEGER,
    "subject" TEXT,
    "schedule" JSONB NOT NULL,
    "classroomRoutines" JSONB NOT NULL,
    "emergencyInfo" JSONB NOT NULL,
    "lessonPlans" JSONB NOT NULL,
    "behaviorPlan" JSONB NOT NULL,
    "studentNotes" JSONB NOT NULL,
    "materialsList" JSONB NOT NULL,
    "importantInfo" JSONB,
    "sourceUnitPlanId" TEXT,
    "sourceLessonPlanIds" JSONB,
    "generationContext" JSONB,
    "teacherContact" JSONB,
    "adminContact" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" DATETIME,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubstitutePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Newsletter_userId_isDraft_idx" ON "Newsletter"("userId", "isDraft");

-- CreateIndex
CREATE INDEX "Newsletter_userId_sentAt_idx" ON "Newsletter"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "Newsletter_dateFrom_dateTo_idx" ON "Newsletter"("dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "SubstitutePlan_userId_dateFor_idx" ON "SubstitutePlan"("userId", "dateFor");

-- CreateIndex
CREATE INDEX "SubstitutePlan_userId_isActive_idx" ON "SubstitutePlan"("userId", "isActive");

-- CreateIndex
CREATE INDEX "SubstitutePlan_grade_subject_idx" ON "SubstitutePlan"("grade", "subject");
