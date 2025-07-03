/*
  Warnings:

  - You are about to drop the `ParentSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentArtifact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentReflection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `studentIds` on the `Newsletter` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Student_userId_lastName_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ParentSummary";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Student";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudentArtifact";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudentGoal";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StudentReflection";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "grade" INTEGER,
    "subject" TEXT,
    "schoolName" TEXT,
    "schoolBoard" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "allowGuests" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,
    "teamCode" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "coverImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedById" INTEGER NOT NULL,
    "invitedUserId" INTEGER,
    "message" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME NOT NULL,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamInvitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SharedPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planType" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sharedById" INTEGER NOT NULL,
    "sharedWithId" INTEGER,
    "teamId" TEXT,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canCopy" BOOLEAN NOT NULL DEFAULT true,
    "canComment" BOOLEAN NOT NULL DEFAULT true,
    "canReshare" BOOLEAN NOT NULL DEFAULT false,
    "shareCode" TEXT NOT NULL,
    "isPublicLink" BOOLEAN NOT NULL DEFAULT false,
    "linkExpiresAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "message" TEXT,
    "sharedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SharedPlan_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SharedPlan_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planType" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlanComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PlanComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamCalendar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamCalendar_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamCalendarEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calendarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "eventType" TEXT NOT NULL,
    "location" TEXT,
    "attachments" JSONB,
    "createdByUserId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamCalendarEvent_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "TeamCalendar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "category" TEXT,
    "tags" JSONB NOT NULL,
    "contributedById" INTEGER NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamResource_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamDiscussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "lastReplyAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamDiscussion_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscussionReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discussionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "isAnswer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscussionReply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "TeamDiscussion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceLibraryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleFr" TEXT,
    "description" TEXT,
    "descriptionFr" TEXT,
    "resourceType" TEXT NOT NULL,
    "fileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "content" TEXT,
    "subject" TEXT NOT NULL,
    "gradeMin" INTEGER NOT NULL,
    "gradeMax" INTEGER NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isFrenchImmersion" BOOLEAN NOT NULL DEFAULT false,
    "frenchLevel" TEXT,
    "categories" JSONB NOT NULL,
    "tags" JSONB NOT NULL,
    "curriculumCodes" JSONB NOT NULL,
    "contributorId" INTEGER NOT NULL,
    "schoolName" TEXT,
    "schoolBoard" TEXT,
    "averageRating" REAL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" DATETIME,
    "approvedBy" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResourceLibraryItem_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "gradeUsed" INTEGER,
    "effectiveness" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceRating_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "ResourceLibraryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceBookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,
    "notes" TEXT,
    "tags" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planType" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "changedBy" INTEGER NOT NULL,
    "changeNotes" TEXT,
    "changeType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Newsletter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "dateFrom" DATETIME NOT NULL,
    "dateTo" DATETIME NOT NULL,
    "tone" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Newsletter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Newsletter" ("createdAt", "dateFrom", "dateTo", "id", "isDraft", "sections", "sentAt", "title", "titleFr", "tone", "updatedAt", "userId") SELECT "createdAt", "dateFrom", "dateTo", "id", "isDraft", "sections", "sentAt", "title", "titleFr", "tone", "updatedAt", "userId" FROM "Newsletter";
DROP TABLE "Newsletter";
ALTER TABLE "new_Newsletter" RENAME TO "Newsletter";
CREATE INDEX "Newsletter_userId_idx" ON "Newsletter"("userId");
CREATE INDEX "Newsletter_isDraft_idx" ON "Newsletter"("isDraft");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamCode_key" ON "Team"("teamCode");

-- CreateIndex
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");

-- CreateIndex
CREATE INDEX "Team_isPublic_idx" ON "Team"("isPublic");

-- CreateIndex
CREATE INDEX "Team_teamCode_idx" ON "Team"("teamCode");

-- CreateIndex
CREATE INDEX "Team_grade_subject_idx" ON "Team"("grade", "subject");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_role_idx" ON "TeamMember"("teamId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "TeamInvitation_email_status_idx" ON "TeamInvitation"("email", "status");

-- CreateIndex
CREATE INDEX "TeamInvitation_invitedUserId_status_idx" ON "TeamInvitation"("invitedUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_teamId_email_key" ON "TeamInvitation"("teamId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "SharedPlan_shareCode_key" ON "SharedPlan"("shareCode");

-- CreateIndex
CREATE INDEX "SharedPlan_sharedById_idx" ON "SharedPlan"("sharedById");

-- CreateIndex
CREATE INDEX "SharedPlan_sharedWithId_idx" ON "SharedPlan"("sharedWithId");

-- CreateIndex
CREATE INDEX "SharedPlan_teamId_idx" ON "SharedPlan"("teamId");

-- CreateIndex
CREATE INDEX "SharedPlan_shareCode_idx" ON "SharedPlan"("shareCode");

-- CreateIndex
CREATE INDEX "SharedPlan_planType_planId_idx" ON "SharedPlan"("planType", "planId");

-- CreateIndex
CREATE INDEX "PlanComment_planType_planId_idx" ON "PlanComment"("planType", "planId");

-- CreateIndex
CREATE INDEX "PlanComment_userId_idx" ON "PlanComment"("userId");

-- CreateIndex
CREATE INDEX "PlanComment_parentId_idx" ON "PlanComment"("parentId");

-- CreateIndex
CREATE INDEX "TeamCalendar_teamId_idx" ON "TeamCalendar"("teamId");

-- CreateIndex
CREATE INDEX "TeamCalendarEvent_calendarId_idx" ON "TeamCalendarEvent"("calendarId");

-- CreateIndex
CREATE INDEX "TeamCalendarEvent_startDate_endDate_idx" ON "TeamCalendarEvent"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "TeamResource_teamId_idx" ON "TeamResource"("teamId");

-- CreateIndex
CREATE INDEX "TeamResource_contributedById_idx" ON "TeamResource"("contributedById");

-- CreateIndex
CREATE INDEX "TeamResource_category_idx" ON "TeamResource"("category");

-- CreateIndex
CREATE INDEX "TeamDiscussion_teamId_isPinned_idx" ON "TeamDiscussion"("teamId", "isPinned");

-- CreateIndex
CREATE INDEX "TeamDiscussion_teamId_category_idx" ON "TeamDiscussion"("teamId", "category");

-- CreateIndex
CREATE INDEX "TeamDiscussion_authorId_idx" ON "TeamDiscussion"("authorId");

-- CreateIndex
CREATE INDEX "DiscussionReply_discussionId_idx" ON "DiscussionReply"("discussionId");

-- CreateIndex
CREATE INDEX "DiscussionReply_authorId_idx" ON "DiscussionReply"("authorId");

-- CreateIndex
CREATE INDEX "ResourceLibraryItem_subject_gradeMin_gradeMax_idx" ON "ResourceLibraryItem"("subject", "gradeMin", "gradeMax");

-- CreateIndex
CREATE INDEX "ResourceLibraryItem_resourceType_language_idx" ON "ResourceLibraryItem"("resourceType", "language");

-- CreateIndex
CREATE INDEX "ResourceLibraryItem_isApproved_idx" ON "ResourceLibraryItem"("isApproved");

-- CreateIndex
CREATE INDEX "ResourceLibraryItem_contributorId_idx" ON "ResourceLibraryItem"("contributorId");

-- CreateIndex
CREATE INDEX "ResourceLibraryItem_isFrenchImmersion_frenchLevel_idx" ON "ResourceLibraryItem"("isFrenchImmersion", "frenchLevel");

-- CreateIndex
CREATE INDEX "ResourceRating_resourceId_rating_idx" ON "ResourceRating"("resourceId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceRating_resourceId_userId_key" ON "ResourceRating"("resourceId", "userId");

-- CreateIndex
CREATE INDEX "ResourceBookmark_userId_idx" ON "ResourceBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceBookmark_userId_resourceId_key" ON "ResourceBookmark"("userId", "resourceId");

-- CreateIndex
CREATE INDEX "PlanVersion_planType_planId_idx" ON "PlanVersion"("planType", "planId");

-- CreateIndex
CREATE INDEX "PlanVersion_changedBy_idx" ON "PlanVersion"("changedBy");

-- CreateIndex
CREATE UNIQUE INDEX "PlanVersion_planType_planId_versionNumber_key" ON "PlanVersion"("planType", "planId", "versionNumber");
