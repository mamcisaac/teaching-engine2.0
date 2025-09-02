-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "lessonPlanId" TEXT,
    "lessonTitle" TEXT,
    "subject" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Note_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Note_studentId_idx" ON "Note"("studentId");

-- CreateIndex
CREATE INDEX "Note_teacherId_idx" ON "Note"("teacherId");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE INDEX "Note_studentId_createdAt_idx" ON "Note"("studentId", "createdAt");

-- CreateIndex (for subject filtering)
CREATE INDEX "Note_subject_idx" ON "Note"("subject");

-- CreateIndex (for lesson context)
CREATE INDEX "Note_lessonPlanId_idx" ON "Note"("lessonPlanId");