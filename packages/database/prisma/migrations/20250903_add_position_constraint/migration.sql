-- Add index for efficient sorting by date and position
CREATE INDEX IF NOT EXISTS "ETFOLessonPlan_date_position_idx" ON "ETFOLessonPlan"("date", "position");