/*
  Warnings:

  - You are about to drop the `DiscussionReply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceBookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceLibraryItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResourceRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SharedPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamCalendar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamCalendarEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamDiscussion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamInvitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamResource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DiscussionReply";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlanComment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlanVersion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ResourceBookmark";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ResourceLibraryItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ResourceRating";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SharedPlan";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Team";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamCalendar";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamCalendarEvent";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamDiscussion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamInvitation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamMember";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamResource";
PRAGMA foreign_keys=on;
