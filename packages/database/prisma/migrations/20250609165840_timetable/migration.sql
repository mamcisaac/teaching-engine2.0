-- CreateTable
CREATE TABLE "TimetableSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "subjectId" INTEGER,
    CONSTRAINT "TimetableSlot_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeeklySchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" INTEGER NOT NULL,
    "lessonPlanId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "slotId" INTEGER,
    CONSTRAINT "WeeklySchedule_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeeklySchedule_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeeklySchedule_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimetableSlot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WeeklySchedule" ("activityId", "day", "id", "lessonPlanId") SELECT "activityId", "day", "id", "lessonPlanId" FROM "WeeklySchedule";
DROP TABLE "WeeklySchedule";
ALTER TABLE "new_WeeklySchedule" RENAME TO "WeeklySchedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
