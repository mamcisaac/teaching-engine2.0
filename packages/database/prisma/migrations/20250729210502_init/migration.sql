-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassroomAnnouncement_userId_createdAt_idx" ON "ClassroomAnnouncement"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassroomAnnouncement_userId_updatedAt_idx" ON "ClassroomAnnouncement"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "CurriculumExpectation_strand_grade_idx" ON "CurriculumExpectation"("strand", "grade");

-- CreateIndex
CREATE INDEX "CurriculumExpectation_subject_strand_idx" ON "CurriculumExpectation"("subject", "strand");

-- CreateIndex
CREATE INDEX "CurriculumExpectation_subject_grade_strand_idx" ON "CurriculumExpectation"("subject", "grade", "strand");

-- CreateIndex
CREATE INDEX "CurriculumImport_userId_createdAt_idx" ON "CurriculumImport"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CurriculumImport_status_createdAt_idx" ON "CurriculumImport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CurriculumImport_userId_status_createdAt_idx" ON "CurriculumImport"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "DaybookEntry_userId_overallRating_idx" ON "DaybookEntry"("userId", "overallRating");

-- CreateIndex
CREATE INDEX "DaybookEntry_userId_updatedAt_idx" ON "DaybookEntry"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "DaybookEntry_lessonPlanId_idx" ON "DaybookEntry"("lessonPlanId");

-- CreateIndex
CREATE INDEX "DaybookEntry_userId_date_overallRating_idx" ON "DaybookEntry"("userId", "date", "overallRating");

-- CreateIndex
CREATE INDEX "DaybookEntry_date_overallRating_idx" ON "DaybookEntry"("date", "overallRating");

-- CreateIndex
CREATE INDEX "DaybookEntry_userId_wouldReuseLesson_idx" ON "DaybookEntry"("userId", "wouldReuseLesson");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_isSubFriendly_idx" ON "ETFOLessonPlan"("userId", "isSubFriendly");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_assessmentType_idx" ON "ETFOLessonPlan"("userId", "assessmentType");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_updatedAt_idx" ON "ETFOLessonPlan"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_date_duration_idx" ON "ETFOLessonPlan"("date", "duration");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_date_grade_idx" ON "ETFOLessonPlan"("userId", "date", "grade");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_date_subject_idx" ON "ETFOLessonPlan"("userId", "date", "subject");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_grade_subject_date_idx" ON "ETFOLessonPlan"("grade", "subject", "date");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_userId_grade_subject_idx" ON "ETFOLessonPlan"("userId", "grade", "subject");

-- CreateIndex
CREATE INDEX "ETFOLessonPlan_isSubFriendly_grade_subject_idx" ON "ETFOLessonPlan"("isSubFriendly", "grade", "subject");

-- CreateIndex
CREATE INDEX "ExternalActivity_isActive_subject_gradeMin_gradeMax_idx" ON "ExternalActivity"("isActive", "subject", "gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "ExternalActivity_isActive_activityType_subject_idx" ON "ExternalActivity"("isActive", "activityType", "subject");

-- CreateIndex
CREATE INDEX "ExternalActivity_internalRating_subject_idx" ON "ExternalActivity"("internalRating", "subject");

-- CreateIndex
CREATE INDEX "ExternalActivity_isFree_subject_gradeMin_gradeMax_idx" ON "ExternalActivity"("isFree", "subject", "gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "LongRangePlan_academicYear_grade_subject_idx" ON "LongRangePlan"("academicYear", "grade", "subject");

-- CreateIndex
CREATE INDEX "LongRangePlan_userId_updatedAt_idx" ON "LongRangePlan"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "LongRangePlan_userId_academicYear_subject_idx" ON "LongRangePlan"("userId", "academicYear", "subject");

-- CreateIndex
CREATE INDEX "LongRangePlan_academicYear_subject_grade_idx" ON "LongRangePlan"("academicYear", "subject", "grade");

-- CreateIndex
CREATE INDEX "Newsletter_userId_dateFrom_dateTo_idx" ON "Newsletter"("userId", "dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "Newsletter_isDraft_sentAt_idx" ON "Newsletter"("isDraft", "sentAt");

-- CreateIndex
CREATE INDEX "Newsletter_userId_createdAt_idx" ON "Newsletter"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PlanTemplate_isSystem_averageRating_idx" ON "PlanTemplate"("isSystem", "averageRating");

-- CreateIndex
CREATE INDEX "PlanTemplate_createdByUserId_type_idx" ON "PlanTemplate"("createdByUserId", "type");

-- CreateIndex
CREATE INDEX "PlanTemplate_lastUsedAt_idx" ON "PlanTemplate"("lastUsedAt");

-- CreateIndex
CREATE INDEX "SubstitutePlan_userId_dateFor_grade_idx" ON "SubstitutePlan"("userId", "dateFor", "grade");

-- CreateIndex
CREATE INDEX "SubstitutePlan_dateFor_grade_subject_idx" ON "SubstitutePlan"("dateFor", "grade", "subject");

-- CreateIndex
CREATE INDEX "SubstitutePlan_isActive_dateFor_idx" ON "SubstitutePlan"("isActive", "dateFor");

-- CreateIndex
CREATE INDEX "SubstitutePlan_userId_isActive_dateFor_idx" ON "SubstitutePlan"("userId", "isActive", "dateFor");

-- CreateIndex
CREATE INDEX "UnitPlan_userId_updatedAt_idx" ON "UnitPlan"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "UnitPlan_startDate_endDate_idx" ON "UnitPlan"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "UnitPlan_userId_startDate_endDate_idx" ON "UnitPlan"("userId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "UnitPlan_longRangePlanId_startDate_idx" ON "UnitPlan"("longRangePlanId", "startDate");
