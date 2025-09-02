-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ETFOLessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "unitPlanId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
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
CREATE INDEX "ETFOLessonPlan_userId_date_position_idx" ON "ETFOLessonPlan"("userId", "date", "position");
CREATE INDEX "ETFOLessonPlan_unitPlanId_idx" ON "ETFOLessonPlan"("unitPlanId");
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
