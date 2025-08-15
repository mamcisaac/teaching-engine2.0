-- Add critical pedagogical fields to LongRangePlan

-- First, preserve existing data from typo field
CREATE TEMPORARY TABLE temp_differentiation_data AS
SELECT id, differentationFramework 
FROM LongRangePlan
WHERE differentationFramework IS NOT NULL;

-- Add new fields to LongRangePlan (SQLite requires separate ALTER TABLE for each column)
ALTER TABLE LongRangePlan ADD COLUMN differentiationFramework TEXT;
ALTER TABLE LongRangePlan ADD COLUMN thematicOverview TEXT;
ALTER TABLE LongRangePlan ADD COLUMN assessmentStrategy TEXT;
ALTER TABLE LongRangePlan ADD COLUMN differentiationPlans TEXT;
ALTER TABLE LongRangePlan ADD COLUMN indigenousPerspectives TEXT;
ALTER TABLE LongRangePlan ADD COLUMN resourceLibrary TEXT;
ALTER TABLE LongRangePlan ADD COLUMN parentCommunication TEXT;

-- Copy data from old field to new field
UPDATE LongRangePlan
SET differentiationFramework = (
  SELECT differentationFramework 
  FROM temp_differentiation_data 
  WHERE temp_differentiation_data.id = LongRangePlan.id
)
WHERE id IN (SELECT id FROM temp_differentiation_data);

-- Add indigenousPerspectives to ETFOLessonPlan for consistency
ALTER TABLE ETFOLessonPlan ADD COLUMN indigenousPerspectives TEXT;

-- Initialize new fields with default values for existing records
UPDATE LongRangePlan
SET thematicOverview = 'To be developed - ' || title || ' Grade ' || grade || ' ' || subject
WHERE thematicOverview IS NULL;

UPDATE LongRangePlan
SET assessmentStrategy = json('{"diagnostic":{"frequency":"Beginning of each unit","methods":["Pre-assessments","KWL charts","Entrance tickets"],"purpose":"Identify prior knowledge and misconceptions"},"formative":{"frequency":"Daily","methods":["Observations","Exit tickets","Thumbs up/down","Think-pair-share"],"purpose":"Monitor learning progress and adjust instruction"},"summative":{"frequency":"End of each unit","methods":["Projects","Presentations","Tests","Portfolios"],"purpose":"Evaluate mastery of learning objectives"}}')
WHERE assessmentStrategy IS NULL;

UPDATE LongRangePlan
SET differentiationPlans = json('{"forStruggling":[],"forOnLevel":[],"forAdvanced":[],"universalSupports":[]}')
WHERE differentiationPlans IS NULL;

UPDATE LongRangePlan
SET indigenousPerspectives = json('{"integration":"To be developed","resources":[],"connections":[],"consultations":"Pending consultation with Indigenous education specialists"}')
WHERE indigenousPerspectives IS NULL;

UPDATE LongRangePlan
SET resourceLibrary = json('{"books":[],"digitalResources":[],"manipulatives":[],"videos":[],"websites":[],"communityResources":[]}')
WHERE resourceLibrary IS NULL;

UPDATE LongRangePlan
SET parentCommunication = json('{"frequency":"Monthly","methods":["Newsletter","Email updates","Parent-teacher conferences"],"topics":["Learning objectives","Upcoming projects","Home support strategies"]}')
WHERE parentCommunication IS NULL;

-- Initialize indigenousPerspectives for existing lesson plans
UPDATE ETFOLessonPlan
SET indigenousPerspectives = json('{"integration":"To be developed","resources":[],"connections":[]}')
WHERE indigenousPerspectives IS NULL;

-- Clean up
DROP TABLE temp_differentiation_data;

-- Note: SQLite doesn't support DROP COLUMN directly
-- The old differentationFramework column will remain but unused
-- A future migration with table recreation would be needed to remove it completely