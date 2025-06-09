-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "lessonPlanId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyPlan_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyPlanItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "slotId" INTEGER,
    "activityId" INTEGER,
    "notes" TEXT,
    "dailyPlanId" INTEGER NOT NULL,
    CONSTRAINT "DailyPlanItem_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimetableSlot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DailyPlanItem_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DailyPlanItem_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
