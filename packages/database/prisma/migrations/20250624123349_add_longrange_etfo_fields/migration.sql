/*
  Warnings:

  - You are about to drop the `AISuggestedActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ActivityOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ActivityTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssessmentTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CognateActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CognateOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DailyPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DailyPlanItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailDelivery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaResourceActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaResourceOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MilestoneAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MilestoneOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OralRoutineOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Outcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OutcomeCluster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OutcomeEmbedding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParentContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParentMessageActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParentMessageOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReflectionOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SmartGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentAssessmentResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherReflection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThematicUnitActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThematicUnitOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimetableSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeeklySchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `assessmentId` on the `ReflectionJournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `outcomeId` on the `StudentGoal` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `StudentReflection` table. All the data in the column will be lost.
  - You are about to drop the column `outcomeId` on the `StudentReflection` table. All the data in the column will be lost.
  - You are about to drop the column `emailedTo` on the `SubPlanRecord` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Activity_milestoneId_orderIndex_idx";

-- DropIndex
DROP INDEX "EmailDelivery_status_idx";

-- DropIndex
DROP INDEX "EmailDelivery_parentSummaryId_idx";

-- DropIndex
DROP INDEX "EmailDelivery_parentMessageId_idx";

-- DropIndex
DROP INDEX "EmailTemplate_name_key";

-- DropIndex
DROP INDEX "LessonPlan_weekStart_key";

-- DropIndex
DROP INDEX "MilestoneAlert_userId_milestoneId_idx";

-- DropIndex
DROP INDEX "MilestoneAlert_userId_isRead_idx";

-- DropIndex
DROP INDEX "Outcome_code_key";

-- DropIndex
DROP INDEX "OutcomeCluster_clusterType_idx";

-- DropIndex
DROP INDEX "OutcomeCluster_importId_idx";

-- DropIndex
DROP INDEX "OutcomeEmbedding_outcomeId_idx";

-- DropIndex
DROP INDEX "OutcomeEmbedding_outcomeId_key";

-- DropIndex
DROP INDEX "ParentContact_email_studentId_key";

-- DropIndex
DROP INDEX "StudentAssessmentResult_studentId_assessmentId_key";

-- DropIndex
DROP INDEX "TeacherReflection_userId_outcomeId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AISuggestedActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Activity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ActivityOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ActivityTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AssessmentResult";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AssessmentTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CognateActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CognateOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyPlan";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DailyPlanItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmailDelivery";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmailTemplate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LessonPlan";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MediaResourceActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MediaResourceOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Milestone";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MilestoneAlert";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MilestoneOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OralRoutineOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Outcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OutcomeCluster";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OutcomeEmbedding";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ParentContact";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ParentMessageActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ParentMessageOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReflectionOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Resource";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SmartGoal";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudentAssessmentResult";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeacherReflection";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ThematicUnitActivity";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ThematicUnitOutcome";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TimetableSlot";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WeeklySchedule";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AIGeneratedPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "planData" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "qualityScore" REAL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIGeneratedPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanningConversation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlanningConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpectationCluster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "importId" TEXT NOT NULL,
    "clusterName" TEXT NOT NULL,
    "clusterType" TEXT NOT NULL,
    "expectationIds" JSONB NOT NULL,
    "centroid" JSONB,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "suggestedTheme" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpectationCluster_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CurriculumImport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CurriculumExpectation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "strand" TEXT NOT NULL,
    "substrand" TEXT,
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "descriptionFr" TEXT,
    "strandFr" TEXT,
    "substrandFr" TEXT,
    "importId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CurriculumExpectation_importId_fkey" FOREIGN KEY ("importId") REFERENCES "CurriculumImport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CurriculumExpectationEmbedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expectationId" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CurriculumExpectationEmbedding_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LongRangePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "term" TEXT,
    "grade" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "goals" TEXT,
    "themes" JSONB,
    "overarchingQuestions" TEXT,
    "assessmentOverview" TEXT,
    "resourceNeeds" TEXT,
    "professionalGoals" TEXT,
    "titleFr" TEXT,
    "descriptionFr" TEXT,
    "goalsFr" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LongRangePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LongRangePlanExpectation" (
    "longRangePlanId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,
    "plannedTerm" TEXT,

    PRIMARY KEY ("longRangePlanId", "expectationId"),
    CONSTRAINT "LongRangePlanExpectation_longRangePlanId_fkey" FOREIGN KEY ("longRangePlanId") REFERENCES "LongRangePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LongRangePlanExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "longRangePlanId" TEXT NOT NULL,
    "description" TEXT,
    "bigIdeas" TEXT,
    "essentialQuestions" JSONB,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "estimatedHours" INTEGER,
    "titleFr" TEXT,
    "descriptionFr" TEXT,
    "bigIdeasFr" TEXT,
    "assessmentPlan" TEXT,
    "successCriteria" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UnitPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnitPlan_longRangePlanId_fkey" FOREIGN KEY ("longRangePlanId") REFERENCES "LongRangePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitPlanExpectation" (
    "unitPlanId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,

    PRIMARY KEY ("unitPlanId", "expectationId"),
    CONSTRAINT "UnitPlanExpectation_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UnitPlanExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitPlanResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnitPlanResource_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ETFOLessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "unitPlanId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
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
    CONSTRAINT "ETFOLessonPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlan_unitPlanId_fkey" FOREIGN KEY ("unitPlanId") REFERENCES "UnitPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ETFOLessonPlanExpectation" (
    "lessonPlanId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,

    PRIMARY KEY ("lessonPlanId", "expectationId"),
    CONSTRAINT "ETFOLessonPlanExpectation_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ETFOLessonPlanExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ETFOLessonPlanResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ETFOLessonPlanResource_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DaybookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "lessonPlanId" TEXT,
    "whatWorked" TEXT,
    "whatDidntWork" TEXT,
    "nextSteps" TEXT,
    "studentEngagement" TEXT,
    "studentChallenges" TEXT,
    "studentSuccesses" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "whatWorkedFr" TEXT,
    "whatDidntWorkFr" TEXT,
    "nextStepsFr" TEXT,
    "notesFr" TEXT,
    "overallRating" INTEGER,
    "wouldReuseLesson" BOOLEAN,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DaybookEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DaybookEntry_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DaybookEntryExpectation" (
    "daybookEntryId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,
    "coverage" TEXT,

    PRIMARY KEY ("daybookEntryId", "expectationId"),
    CONSTRAINT "DaybookEntryExpectation_daybookEntryId_fkey" FOREIGN KEY ("daybookEntryId") REFERENCES "DaybookEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DaybookEntryExpectation_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "CurriculumExpectation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExternalActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "activityType" TEXT NOT NULL,
    "gradeMin" INTEGER NOT NULL,
    "gradeMax" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "materials" JSONB NOT NULL,
    "technology" JSONB,
    "groupSize" TEXT,
    "sourceRating" REAL,
    "sourceReviews" INTEGER,
    "internalRating" REAL,
    "internalReviews" INTEGER,
    "curriculumTags" JSONB NOT NULL,
    "learningGoals" JSONB,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "price" REAL,
    "license" TEXT,
    "lastVerified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "activityId" TEXT NOT NULL,
    "lessonPlanId" TEXT,
    "lessonSection" TEXT,
    "customizations" JSONB,
    "notes" TEXT,
    "timesUsed" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveness" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityImport_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ExternalActivity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityImport_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "activityId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "wouldRecommend" BOOLEAN,
    "gradeUsed" INTEGER,
    "subjectUsed" TEXT,
    "workedWell" TEXT,
    "challenges" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityRating_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ExternalActivity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityCollection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityCollectionItem" (
    "collectionId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("collectionId", "activityId"),
    CONSTRAINT "ActivityCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "ActivityCollection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityCollectionItem_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ExternalActivity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReflectionJournalEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "themeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReflectionJournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReflectionJournalEntry_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "ThematicUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReflectionJournalEntry" ("content", "createdAt", "date", "id", "themeId", "updatedAt", "userId") SELECT "content", "createdAt", "date", "id", "themeId", "updatedAt", "userId" FROM "ReflectionJournalEntry";
DROP TABLE "ReflectionJournalEntry";
ALTER TABLE "new_ReflectionJournalEntry" RENAME TO "ReflectionJournalEntry";
CREATE TABLE "new_StudentGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "themeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "StudentGoal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentGoal_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "ThematicUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StudentGoal" ("createdAt", "id", "status", "studentId", "text", "themeId") SELECT "createdAt", "id", "status", "studentId", "text", "themeId" FROM "StudentGoal";
DROP TABLE "StudentGoal";
ALTER TABLE "new_StudentGoal" RENAME TO "StudentGoal";
CREATE TABLE "new_StudentReflection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "content" TEXT,
    "text" TEXT,
    "date" DATETIME,
    "emoji" TEXT,
    "voicePath" TEXT,
    "themeId" INTEGER,
    "suggestedOutcomeIds" TEXT,
    "selTags" TEXT,
    "classificationConfidence" REAL,
    "classificationRationale" TEXT,
    "classifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentReflection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentReflection_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "ThematicUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StudentReflection" ("content", "createdAt", "date", "emoji", "id", "studentId", "text", "themeId", "updatedAt", "voicePath") SELECT "content", "createdAt", "date", "emoji", "id", "studentId", "text", "themeId", "updatedAt", "voicePath" FROM "StudentReflection";
DROP TABLE "StudentReflection";
ALTER TABLE "new_StudentReflection" RENAME TO "StudentReflection";
CREATE TABLE "new_SubPlanRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "daysCount" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "includeGoals" BOOLEAN NOT NULL DEFAULT true,
    "includeRoutines" BOOLEAN NOT NULL DEFAULT true,
    "includePlans" BOOLEAN NOT NULL DEFAULT true,
    "anonymized" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubPlanRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubPlanRecord" ("anonymized", "content", "createdAt", "date", "daysCount", "id", "includeGoals", "includePlans", "includeRoutines", "notes", "userId") SELECT "anonymized", "content", "createdAt", "date", "daysCount", "id", "includeGoals", "includePlans", "includeRoutines", "notes", "userId" FROM "SubPlanRecord";
DROP TABLE "SubPlanRecord";
ALTER TABLE "new_SubPlanRecord" RENAME TO "SubPlanRecord";
CREATE INDEX "SubPlanRecord_userId_date_idx" ON "SubPlanRecord"("userId", "date");
CREATE INDEX "SubPlanRecord_userId_createdAt_idx" ON "SubPlanRecord"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlanningConversation_userId_sessionId_idx" ON "PlanningConversation"("userId", "sessionId");

-- CreateIndex
CREATE INDEX "ExpectationCluster_importId_idx" ON "ExpectationCluster"("importId");

-- CreateIndex
CREATE INDEX "ExpectationCluster_clusterType_idx" ON "ExpectationCluster"("clusterType");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumExpectation_code_key" ON "CurriculumExpectation"("code");

-- CreateIndex
CREATE INDEX "CurriculumExpectation_subject_grade_idx" ON "CurriculumExpectation"("subject", "grade");

-- CreateIndex
CREATE INDEX "CurriculumExpectation_code_idx" ON "CurriculumExpectation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumExpectationEmbedding_expectationId_key" ON "CurriculumExpectationEmbedding"("expectationId");

-- CreateIndex
CREATE INDEX "CurriculumExpectationEmbedding_expectationId_idx" ON "CurriculumExpectationEmbedding"("expectationId");

-- CreateIndex
CREATE INDEX "LongRangePlan_userId_academicYear_idx" ON "LongRangePlan"("userId", "academicYear");

-- CreateIndex
CREATE INDEX "LongRangePlan_userId_subject_grade_idx" ON "LongRangePlan"("userId", "subject", "grade");

-- CreateIndex
CREATE INDEX "UnitPlan_userId_startDate_idx" ON "UnitPlan"("userId", "startDate");

-- CreateIndex
CREATE INDEX "UnitPlan_longRangePlanId_idx" ON "UnitPlan"("longRangePlanId");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_date_idx" ON "ETFOLessonPlan"("userId", "date");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "DaybookEntry_lessonPlanId_key" ON "DaybookEntry"("lessonPlanId");

-- CreateIndex
CREATE INDEX "DaybookEntry_userId_date_idx" ON "DaybookEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "ExternalActivity_subject_gradeMin_gradeMax_idx" ON "ExternalActivity"("subject", "gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "ExternalActivity_activityType_language_idx" ON "ExternalActivity"("activityType", "language");

-- CreateIndex
CREATE INDEX "ExternalActivity_isActive_lastVerified_idx" ON "ExternalActivity"("isActive", "lastVerified");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalActivity_source_externalId_key" ON "ExternalActivity"("source", "externalId");

-- CreateIndex
CREATE INDEX "ActivityImport_userId_activityId_idx" ON "ActivityImport"("userId", "activityId");

-- CreateIndex
CREATE INDEX "ActivityImport_lessonPlanId_idx" ON "ActivityImport"("lessonPlanId");

-- CreateIndex
CREATE INDEX "ActivityRating_activityId_rating_idx" ON "ActivityRating"("activityId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityRating_userId_activityId_key" ON "ActivityRating"("userId", "activityId");

-- CreateIndex
CREATE INDEX "ActivityCollection_userId_isPublic_idx" ON "ActivityCollection"("userId", "isPublic");
