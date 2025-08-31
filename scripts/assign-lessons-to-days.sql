-- Assign all 970 lessons to 195 school days
-- Grade 1 French Immersion - Emily McIsaac
-- September 3, 2025 to June 20, 2026

-- Create temporary table with all lessons and their subjects
CREATE TEMP TABLE IF NOT EXISTS lesson_assignments AS
WITH numbered_lessons AS (
  SELECT 
    elp.id as lesson_id,
    elp.title,
    elp.titleFr,
    lrp.subject,
    ROW_NUMBER() OVER (PARTITION BY lrp.subject ORDER BY up.startDate, elp.title) as lesson_num
  FROM ETFOLessonPlan elp
  JOIN UnitPlan up ON elp.unitPlanId = up.id
  JOIN LongRangePlan lrp ON up.longRangePlanId = lrp.id
)
SELECT * FROM numbered_lessons;

-- Show lesson counts by subject
SELECT subject, COUNT(*) as total_lessons 
FROM lesson_assignments 
GROUP BY subject
ORDER BY total_lessons DESC;

-- Update lessons for first week (Sept 3-6, 2025)
-- Day 1: Tuesday, September 3, 2025
UPDATE ETFOLessonPlan SET date = '2025-09-03T08:45:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Français (Immersion)' AND lesson_num = 1);

UPDATE ETFOLessonPlan SET date = '2025-09-03T09:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Mathématiques' AND lesson_num = 1);

UPDATE ETFOLessonPlan SET date = '2025-09-03T10:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Sciences de la nature' AND lesson_num = 1);

UPDATE ETFOLessonPlan SET date = '2025-09-03T11:15:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Arts visuels' AND lesson_num = 1);

UPDATE ETFOLessonPlan SET date = '2025-09-03T13:00:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Sciences humaines' AND lesson_num = 1);

-- Day 2: Wednesday, September 4, 2025
UPDATE ETFOLessonPlan SET date = '2025-09-04T08:45:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Français (Immersion)' AND lesson_num = 2);

UPDATE ETFOLessonPlan SET date = '2025-09-04T09:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Mathématiques' AND lesson_num = 2);

UPDATE ETFOLessonPlan SET date = '2025-09-04T10:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Sciences de la nature' AND lesson_num = 2);

UPDATE ETFOLessonPlan SET date = '2025-09-04T11:15:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Arts visuels' AND lesson_num = 2);

UPDATE ETFOLessonPlan SET date = '2025-09-04T13:00:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Formation personnelle et sociale' AND lesson_num = 1);

-- Day 3: Thursday, September 5, 2025
UPDATE ETFOLessonPlan SET date = '2025-09-05T08:45:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Français (Immersion)' AND lesson_num = 3);

UPDATE ETFOLessonPlan SET date = '2025-09-05T09:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Mathématiques' AND lesson_num = 3);

UPDATE ETFOLessonPlan SET date = '2025-09-05T10:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Sciences de la nature' AND lesson_num = 3);

UPDATE ETFOLessonPlan SET date = '2025-09-05T11:15:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Arts visuels' AND lesson_num = 3);

UPDATE ETFOLessonPlan SET date = '2025-09-05T13:00:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Sciences humaines' AND lesson_num = 2);

-- Day 4: Friday, September 6, 2025
UPDATE ETFOLessonPlan SET date = '2025-09-06T08:45:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Français (Immersion)' AND lesson_num = 4);

UPDATE ETFOLessonPlan SET date = '2025-09-06T09:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Mathématiques' AND lesson_num = 4);

UPDATE ETFOLessonPlan SET date = '2025-09-06T10:30:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Sciences de la nature' AND lesson_num = 4);

UPDATE ETFOLessonPlan SET date = '2025-09-06T11:15:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Arts visuels' AND lesson_num = 4);

UPDATE ETFOLessonPlan SET date = '2025-09-06T13:00:00.000Z'
WHERE id = (SELECT lesson_id FROM lesson_assignments WHERE subject = 'Formation personnelle et sociale' AND lesson_num = 2);

-- Verify updates
SELECT 
  date(date) as lesson_date,
  COUNT(*) as lessons_count,
  GROUP_CONCAT(SUBSTR(titleFr, 1, 20), ', ') as lesson_titles
FROM ETFOLessonPlan
WHERE date >= '2025-09-03' AND date <= '2025-09-06'
GROUP BY date(date)
ORDER BY date(date);

-- Show remaining lessons to be scheduled
SELECT 
  'Total lessons' as category, COUNT(*) as count FROM ETFOLessonPlan
UNION ALL
SELECT 'Scheduled (Sept 3-6)', COUNT(*) FROM ETFOLessonPlan WHERE date >= '2025-09-03' AND date <= '2025-09-06'
UNION ALL  
SELECT 'Unscheduled', COUNT(*) FROM ETFOLessonPlan WHERE date IS NULL OR date < '2025-09-03';