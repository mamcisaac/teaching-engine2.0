-- AlterTable
ALTER TABLE "User" ADD COLUMN "grade" TEXT;
ALTER TABLE "User" ADD COLUMN "program" TEXT;

-- CreateTable
CREATE TABLE "SubstituteInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "classroomNumber" TEXT,
    "gradeLevel" TEXT,
    "classSize" INTEGER,
    "officePhone" TEXT,
    "principalName" TEXT,
    "vicePrincipalName" TEXT,
    "nearbyTeacher" TEXT,
    "nearbyTeacherRoom" TEXT,
    "emergencyProcedures" TEXT,
    "fireExitRoute" TEXT,
    "allergies" TEXT,
    "medicalNeeds" TEXT,
    "behaviorNotes" TEXT,
    "specialNeeds" TEXT,
    "studentHelpers" TEXT,
    "classroomRules" TEXT,
    "rewardSystem" TEXT,
    "consequenceSystem" TEXT,
    "attentionSignal" TEXT,
    "morningRoutine" TEXT,
    "attendanceProcedure" TEXT,
    "bathroomPolicy" TEXT,
    "lunchProcedure" TEXT,
    "dismissalProcedure" TEXT,
    "materialsLocation" TEXT,
    "technologyAccess" TEXT,
    "copiesLocation" TEXT,
    "extraActivities" TEXT,
    "specialSchedule" TEXT,
    "importantInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubstituteInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "expectation" TEXT NOT NULL,
    "expectationCode" TEXT,
    "level" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "artifacts" JSONB,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentId" TEXT,
    "teacherId" INTEGER NOT NULL,
    "dateRangeStart" DATETIME NOT NULL,
    "dateRangeEnd" DATETIME NOT NULL,
    "subjects" JSONB,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Report_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "studentId" TEXT,
    "assessmentId" TEXT,
    "uploadedBy" INTEGER NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "tags" JSONB,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Artifact_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Artifact_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "actualDuration" INTEGER,
    "wentWell" BOOLEAN NOT NULL DEFAULT true,
    "needsFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LessonCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonCompletion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LessonReflection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LessonReflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonReflection_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT,
    "expectationId" TEXT,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "notes" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentAssessment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ETFOLessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "unitPlanId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "slotNumber" INTEGER DEFAULT 1,
    "lessonNumber" INTEGER,
    "lessonType" TEXT DEFAULT 'core',
    "isScheduled" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER NOT NULL,
    "mindsOn" TEXT,
    "action" TEXT,
    "consolidation" TEXT,
    "learningGoals" TEXT,
    "materials" JSONB,
    "grouping" TEXT,
    "titleFr" TEXT,
    "mindsOnFr" TEXT,
    "actionFr" TEXT,
    "consolidationFr" TEXT,
    "learningGoalsFr" TEXT,
    "accommodations" JSONB,
    "modifications" JSONB,
    "extensions" JSONB,
    "assessmentType" TEXT,
    "assessmentNotes" TEXT,
    "isSubFriendly" BOOLEAN NOT NULL DEFAULT true,
    "subNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "grade" INTEGER,
    "language" TEXT,
    "subject" TEXT,
    "differentiationStrategies" JSONB,
    "engagementHooks" JSONB,
    "formativeCheckpoints" JSONB,
    "interventionStrategies" JSONB,
    "performanceOpportunities" TEXT,
    "priorKnowledgeCheck" TEXT,
    "reflectionActivities" JSONB,
    "wheretoFramework" JSONB,
    "indigenousPerspectives" TEXT,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ETFOLessonPlan" ("accommodations", "action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "differentiationStrategies", "duration", "engagementHooks", "extensions", "formativeCheckpoints", "grade", "grouping", "id", "indigenousPerspectives", "interventionStrategies", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "materials", "mindsOn", "mindsOnFr", "modifications", "performanceOpportunities", "priorKnowledgeCheck", "reflectionActivities", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId", "wheretoFramework") SELECT "accommodations", "action", "actionFr", "assessmentNotes", "assessmentType", "consolidation", "consolidationFr", "createdAt", "date", "differentiationStrategies", "duration", "engagementHooks", "extensions", "formativeCheckpoints", "grade", "grouping", "id", "indigenousPerspectives", "interventionStrategies", "isSubFriendly", "language", "learningGoals", "learningGoalsFr", "materials", "mindsOn", "mindsOnFr", "modifications", "performanceOpportunities", "priorKnowledgeCheck", "reflectionActivities", "subNotes", "subject", "title", "titleFr", "unitPlanId", "updatedAt", "userId", "wheretoFramework" FROM "ETFOLessonPlan";
DROP TABLE "ETFOLessonPlan";
ALTER TABLE "new_ETFOLessonPlan" RENAME TO "ETFOLessonPlan";
CREATE INDEX "ETFOLessonPlan_userId_date_idx" ON "ETFOLessonPlan"("userId", "date");
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");
CREATE INDEX "ETFOLessonPlan_unitPlanId_lessonNumber_idx" ON "ETFOLessonPlan"("unitPlanId", "lessonNumber");
CREATE INDEX "ETFOLessonPlan_grade_subject_idx" ON "ETFOLessonPlan"("grade", "subject");
CREATE INDEX "ETFOLessonPlan_language_idx" ON "ETFOLessonPlan"("language");
CREATE INDEX "ETFOLessonPlan_userId_isSubFriendly_idx" ON "ETFOLessonPlan"("userId", "isSubFriendly");
CREATE INDEX "ETFOLessonPlan_userId_updatedAt_idx" ON "ETFOLessonPlan"("userId", "updatedAt");
CREATE INDEX "ETFOLessonPlan_isSubFriendly_grade_subject_idx" ON "ETFOLessonPlan"("isSubFriendly", "grade", "subject");
CREATE INDEX "ETFOLessonPlan_userId_grade_subject_idx" ON "ETFOLessonPlan"("userId", "grade", "subject");
CREATE INDEX "ETFOLessonPlan_grade_subject_date_idx" ON "ETFOLessonPlan"("grade", "subject", "date");
CREATE INDEX "ETFOLessonPlan_userId_date_subject_idx" ON "ETFOLessonPlan"("userId", "date", "subject");
CREATE INDEX "ETFOLessonPlan_userId_date_grade_idx" ON "ETFOLessonPlan"("userId", "date", "grade");
CREATE INDEX "ETFOLessonPlan_date_duration_idx" ON "ETFOLessonPlan"("date", "duration");
CREATE INDEX "ETFOLessonPlan_userId_assessmentType_idx" ON "ETFOLessonPlan"("userId", "assessmentType");
CREATE INDEX "ETFOLessonPlan_userId_date_slotNumber_idx" ON "ETFOLessonPlan"("userId", "date", "slotNumber");
CREATE INDEX "ETFOLessonPlan_lessonType_isScheduled_idx" ON "ETFOLessonPlan"("lessonType", "isScheduled");
CREATE INDEX "ETFOLessonPlan_unitPlanId_lessonType_idx" ON "ETFOLessonPlan"("unitPlanId", "lessonType");
CREATE UNIQUE INDEX "ETFOLessonPlan_unitPlanId_lessonNumber_key" ON "ETFOLessonPlan"("unitPlanId", "lessonNumber");
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "studentId" TEXT,
    "studentNumber" TEXT,
    "dateOfBirth" DATETIME,
    "grade" INTEGER NOT NULL,
    "program" TEXT,
    "homeroom" TEXT,
    "hasIEP" BOOLEAN NOT NULL DEFAULT false,
    "iepGoals" JSONB,
    "accommodations" JSONB,
    "specialNeeds" TEXT,
    "parentContact" JSONB,
    "enrollmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawalDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("createdAt", "enrollmentDate", "firstName", "grade", "homeroom", "id", "isActive", "lastName", "notes", "parentContact", "specialNeeds", "studentNumber", "updatedAt", "userId", "withdrawalDate") SELECT "createdAt", "enrollmentDate", "firstName", "grade", "homeroom", "id", "isActive", "lastName", "notes", "parentContact", "specialNeeds", "studentNumber", "updatedAt", "userId", "withdrawalDate" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");
CREATE INDEX "Student_userId_idx" ON "Student"("userId");
CREATE INDEX "Student_userId_isActive_idx" ON "Student"("userId", "isActive");
CREATE INDEX "Student_userId_grade_idx" ON "Student"("userId", "grade");
CREATE INDEX "Student_grade_isActive_idx" ON "Student"("grade", "isActive");
CREATE INDEX "Student_studentNumber_idx" ON "Student"("studentNumber");
CREATE INDEX "Student_studentId_idx" ON "Student"("studentId");
CREATE INDEX "Student_status_idx" ON "Student"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SubstituteInfo_userId_key" ON "SubstituteInfo"("userId");

-- CreateIndex
CREATE INDEX "SubstituteInfo_userId_idx" ON "SubstituteInfo"("userId");

-- CreateIndex
CREATE INDEX "Assessment_studentId_idx" ON "Assessment"("studentId");

-- CreateIndex
CREATE INDEX "Assessment_teacherId_idx" ON "Assessment"("teacherId");

-- CreateIndex
CREATE INDEX "Assessment_subject_idx" ON "Assessment"("subject");

-- CreateIndex
CREATE INDEX "Assessment_level_idx" ON "Assessment"("level");

-- CreateIndex
CREATE INDEX "Assessment_evidenceType_idx" ON "Assessment"("evidenceType");

-- CreateIndex
CREATE INDEX "Assessment_date_idx" ON "Assessment"("date");

-- CreateIndex
CREATE INDEX "Assessment_studentId_subject_idx" ON "Assessment"("studentId", "subject");

-- CreateIndex
CREATE INDEX "Assessment_studentId_date_idx" ON "Assessment"("studentId", "date");

-- CreateIndex
CREATE INDEX "Report_teacherId_idx" ON "Report"("teacherId");

-- CreateIndex
CREATE INDEX "Report_studentId_idx" ON "Report"("studentId");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Artifact_studentId_idx" ON "Artifact"("studentId");

-- CreateIndex
CREATE INDEX "Artifact_assessmentId_idx" ON "Artifact"("assessmentId");

-- CreateIndex
CREATE INDEX "Artifact_uploadedBy_idx" ON "Artifact"("uploadedBy");

-- CreateIndex
CREATE INDEX "Artifact_processingStatus_idx" ON "Artifact"("processingStatus");

-- CreateIndex
CREATE INDEX "Artifact_createdAt_idx" ON "Artifact"("createdAt");

-- CreateIndex
CREATE INDEX "LessonCompletion_userId_idx" ON "LessonCompletion"("userId");

-- CreateIndex
CREATE INDEX "LessonCompletion_lessonId_idx" ON "LessonCompletion"("lessonId");

-- CreateIndex
CREATE INDEX "LessonCompletion_completedAt_idx" ON "LessonCompletion"("completedAt");

-- CreateIndex
CREATE INDEX "LessonCompletion_userId_completedAt_idx" ON "LessonCompletion"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LessonCompletion_userId_lessonId_key" ON "LessonCompletion"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "LessonReflection_userId_idx" ON "LessonReflection"("userId");

-- CreateIndex
CREATE INDEX "LessonReflection_lessonId_idx" ON "LessonReflection"("lessonId");

-- CreateIndex
CREATE INDEX "LessonReflection_date_idx" ON "LessonReflection"("date");

-- CreateIndex
CREATE INDEX "LessonReflection_userId_date_idx" ON "LessonReflection"("userId", "date");

-- CreateIndex
CREATE INDEX "LessonReflection_status_idx" ON "LessonReflection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LessonReflection_userId_lessonId_key" ON "LessonReflection"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "StudentAssessment_userId_idx" ON "StudentAssessment"("userId");

-- CreateIndex
CREATE INDEX "StudentAssessment_studentId_idx" ON "StudentAssessment"("studentId");

-- CreateIndex
CREATE INDEX "StudentAssessment_userId_studentId_idx" ON "StudentAssessment"("userId", "studentId");

-- CreateIndex
CREATE INDEX "StudentAssessment_userId_date_idx" ON "StudentAssessment"("userId", "date");

-- CreateIndex
CREATE INDEX "StudentAssessment_userId_subject_idx" ON "StudentAssessment"("userId", "subject");

-- CreateIndex
CREATE INDEX "StudentAssessment_userId_level_idx" ON "StudentAssessment"("userId", "level");

-- CreateIndex
CREATE INDEX "StudentAssessment_userId_studentId_date_idx" ON "StudentAssessment"("userId", "studentId", "date");

-- CreateIndex
CREATE INDEX "StudentAssessment_studentId_subject_date_idx" ON "StudentAssessment"("studentId", "subject", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssessment_userId_studentId_subject_date_key" ON "StudentAssessment"("userId", "studentId", "subject", "date");
