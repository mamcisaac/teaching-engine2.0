/*
  Warnings:

  - A unique constraint covering the columns `[weekStart]` on the table `LessonPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LessonPlan_weekStart_key" ON "LessonPlan"("weekStart");
