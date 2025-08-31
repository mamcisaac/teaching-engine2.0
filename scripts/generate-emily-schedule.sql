-- Generate Emily's Perfect Daily Schedule
-- 975 lessons across 195 school days (Sept 3, 2025 - June 20, 2026)
-- 5 lessons per day following optimal distribution

-- Create a temporary table to hold the schedule
CREATE TEMP TABLE IF NOT EXISTS daily_schedule (
  lesson_id TEXT,
  date TEXT,
  subject TEXT,
  lesson_number INTEGER
);

-- Get lessons for each subject in order
WITH french_lessons AS (
  SELECT elp.id, ROW_NUMBER() OVER (ORDER BY up.startDate, elp.title) as rn
  FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Français (Immersion)'
),
math_lessons AS (
  SELECT elp.id, ROW_NUMBER() OVER (ORDER BY up.startDate, elp.title) as rn
  FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Mathématiques'
),
science_lessons AS (
  SELECT elp.id, ROW_NUMBER() OVER (ORDER BY up.startDate, elp.title) as rn
  FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Sciences de la nature'
),
arts_lessons AS (
  SELECT elp.id, ROW_NUMBER() OVER (ORDER BY up.startDate, elp.title) as rn
  FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Arts visuels'
),
social_lessons AS (
  SELECT elp.id, ROW_NUMBER() OVER (ORDER BY up.startDate, elp.title) as rn
  FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Sciences humaines'
),
health_lessons AS (
  SELECT elp.id, ROW_NUMBER() OVER (ORDER BY up.startDate, elp.title) as rn
  FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Formation personnelle et sociale'
)
SELECT 
  COUNT(*) as total_lessons,
  (SELECT COUNT(*) FROM french_lessons) as french_count,
  (SELECT COUNT(*) FROM math_lessons) as math_count,
  (SELECT COUNT(*) FROM science_lessons) as science_count,
  (SELECT COUNT(*) FROM arts_lessons) as arts_count,
  (SELECT COUNT(*) FROM social_lessons) as social_count,
  (SELECT COUNT(*) FROM health_lessons) as health_count
FROM ETFOLessonPlan;

-- Update dates for first day's lessons as an example
-- Day 1: September 3, 2025
UPDATE ETFOLessonPlan 
SET date = '2025-09-03T08:45:00.000Z'
WHERE id IN (
  SELECT id FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Français (Immersion)'
  ORDER BY up.startDate, elp.title
  LIMIT 1
);

UPDATE ETFOLessonPlan 
SET date = '2025-09-03T09:30:00.000Z'
WHERE id IN (
  SELECT id FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Mathématiques'
  ORDER BY up.startDate, elp.title
  LIMIT 1
);

UPDATE ETFOLessonPlan 
SET date = '2025-09-03T10:30:00.000Z'
WHERE id IN (
  SELECT id FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Sciences de la nature'
  ORDER BY up.startDate, elp.title
  LIMIT 1
);

UPDATE ETFOLessonPlan 
SET date = '2025-09-03T11:15:00.000Z'
WHERE id IN (
  SELECT id FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Arts visuels'
  ORDER BY up.startDate, elp.title
  LIMIT 1
);

UPDATE ETFOLessonPlan 
SET date = '2025-09-03T13:00:00.000Z'
WHERE id IN (
  SELECT id FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
  WHERE lrp.subject = 'Sciences humaines'
  ORDER BY up.startDate, elp.title
  LIMIT 1
);

-- Verify the updates
SELECT 
  date,
  titleFr,
  lrp.subject
FROM ETFOLessonPlan elp
JOIN UnitPlan up ON elp.unitPlanId = up.id
JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
WHERE date LIKE '2025-09-03%'
ORDER BY date;