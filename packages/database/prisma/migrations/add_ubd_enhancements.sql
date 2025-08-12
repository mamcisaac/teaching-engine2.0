-- Migration: Add UbD (Understanding by Design) Enhancements
-- This adds transfer goals, performance tasks, and WHERETO framework support

-- Add transfer goals to UnitPlan
ALTER TABLE UnitPlan ADD COLUMN enduringUnderstandings TEXT;
ALTER TABLE UnitPlan ADD COLUMN transferableSkills TEXT; -- JSON array
ALTER TABLE UnitPlan ADD COLUMN performanceIndicators TEXT; -- JSON array

-- Add performance task design to UnitPlan
ALTER TABLE UnitPlan ADD COLUMN performanceTask TEXT; -- JSON object with scenario, role, audience, format
ALTER TABLE UnitPlan ADD COLUMN assessmentRubric TEXT; -- JSON object with criteria and levels
ALTER TABLE UnitPlan ADD COLUMN evidenceTypes TEXT; -- JSON array: observation, conversation, product

-- Add WHERETO framework to ETFOLessonPlan
ALTER TABLE ETFOLessonPlan ADD COLUMN wheretoFramework TEXT; -- JSON object with all WHERETO components
ALTER TABLE ETFOLessonPlan ADD COLUMN engagementHooks TEXT; -- JSON array
ALTER TABLE ETFOLessonPlan ADD COLUMN reflectionActivities TEXT; -- JSON array
ALTER TABLE ETFOLessonPlan ADD COLUMN performanceOpportunities TEXT;

-- Add data-driven instruction support
ALTER TABLE ETFOLessonPlan ADD COLUMN priorKnowledgeCheck TEXT;
ALTER TABLE ETFOLessonPlan ADD COLUMN formativeCheckpoints TEXT; -- JSON array
ALTER TABLE ETFOLessonPlan ADD COLUMN interventionStrategies TEXT; -- JSON array

-- Add transfer goals to LongRangePlan for year-long planning
ALTER TABLE LongRangePlan ADD COLUMN yearlyTransferGoals TEXT; -- JSON object
ALTER TABLE LongRangePlan ADD COLUMN crossCurricularConnections TEXT; -- JSON array

-- Create new table for Performance Task Templates (reusable across units)
CREATE TABLE PerformanceTaskTemplate (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  gradeMin INTEGER NOT NULL,
  gradeMax INTEGER NOT NULL,
  scenario TEXT NOT NULL,
  role TEXT NOT NULL,
  audience TEXT NOT NULL,
  format TEXT NOT NULL,
  rubricTemplate TEXT, -- JSON object
  isPublic BOOLEAN DEFAULT FALSE,
  timesUsed INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- Create indexes for performance task templates
CREATE INDEX idx_performance_task_template_user ON PerformanceTaskTemplate(userId);
CREATE INDEX idx_performance_task_template_subject_grade ON PerformanceTaskTemplate(subject, gradeMin, gradeMax);
CREATE INDEX idx_performance_task_template_public ON PerformanceTaskTemplate(isPublic, subject);

-- Create new table for Essential Questions Bank (reusable across subjects/grades)
CREATE TABLE EssentialQuestionTemplate (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  question TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  gradeMin INTEGER NOT NULL,
  gradeMax INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'factual', 'analytical', 'hypothetical', 'priority'
  bloomsLevel TEXT, -- 'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
  cognitiveLoad TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  timesUsed INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for essential questions
CREATE INDEX idx_essential_question_subject_grade ON EssentialQuestionTemplate(subject, gradeMin, gradeMax);
CREATE INDEX idx_essential_question_category ON EssentialQuestionTemplate(category, bloomsLevel);
CREATE INDEX idx_essential_question_rating ON EssentialQuestionTemplate(rating DESC);

-- Create new table for Transfer Skills Taxonomy (reusable skills)
CREATE TABLE TransferSkillTemplate (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  skillName TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'cognitive', 'metacognitive', 'social', 'communication'
  gradeMin INTEGER NOT NULL,
  gradeMax INTEGER NOT NULL,
  performanceIndicators TEXT, -- JSON array
  assessmentMethods TEXT, -- JSON array
  isCore BOOLEAN DEFAULT FALSE, -- Core 21st century skills
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for transfer skills
CREATE INDEX idx_transfer_skill_category ON TransferSkillTemplate(category);
CREATE INDEX idx_transfer_skill_grade ON TransferSkillTemplate(gradeMin, gradeMax);
CREATE INDEX idx_transfer_skill_core ON TransferSkillTemplate(isCore);

-- Create relationship table for UnitPlan to Transfer Skills
CREATE TABLE UnitPlanTransferSkill (
  unitPlanId TEXT NOT NULL,
  transferSkillId TEXT NOT NULL,
  emphasis TEXT DEFAULT 'developing', -- 'introducing', 'developing', 'mastering'
  PRIMARY KEY (unitPlanId, transferSkillId),
  FOREIGN KEY (unitPlanId) REFERENCES UnitPlan(id) ON DELETE CASCADE,
  FOREIGN KEY (transferSkillId) REFERENCES TransferSkillTemplate(id) ON DELETE CASCADE
);

-- Insert core transfer skills for Grade 1
INSERT INTO TransferSkillTemplate (skillName, description, category, gradeMin, gradeMax, performanceIndicators, isCore) VALUES
('Critical Thinking', 'Analyze information and make reasoned decisions', 'cognitive', 1, 8, '["Ask thoughtful questions", "Compare and contrast ideas", "Make predictions based on evidence"]', TRUE),
('Communication', 'Express ideas clearly and listen actively', 'communication', 1, 8, '["Share ideas using words, pictures, or actions", "Listen to others with attention", "Ask questions for clarification"]', TRUE),
('Creativity', 'Generate new ideas and original solutions', 'cognitive', 1, 8, '["Think of multiple solutions to problems", "Use imagination in learning", "Try new approaches"]', TRUE),
('Collaboration', 'Work effectively with others', 'social', 1, 8, '["Take turns and share materials", "Help classmates when needed", "Contribute to group goals"]', TRUE),
('Self-Regulation', 'Monitor and adjust own learning', 'metacognitive', 1, 8, '["Recognize when they need help", "Persist through challenges", "Reflect on their learning"]', TRUE);

-- Insert essential questions for core subjects
INSERT INTO EssentialQuestionTemplate (question, subject, gradeMin, gradeMax, category, bloomsLevel) VALUES
('How do patterns help us understand our world?', 'Mathematics', 1, 3, 'analytical', 'analyze'),
('What makes a good friend?', 'Études sociales', 1, 3, 'analytical', 'evaluate'),
('How do living things grow and change?', 'Sciences et technologie', 1, 3, 'factual', 'understand'),
('Comment les mots nous aident-ils à partager nos pensées?', 'Français langue première', 1, 3, 'analytical', 'analyze'),
('Why are stories important?', 'English Language Arts', 1, 3, 'analytical', 'evaluate'),
('How does art help us express ourselves?', 'Arts', 1, 3, 'analytical', 'create');