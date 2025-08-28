-- Performance optimization migration for single-teacher use
-- Adds strategic indexes for Emily's classroom analytics and reporting

-- Additional composite indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_student_artifact_user_date_type 
ON StudentArtifact(userId, dateCollected, artifactType);

CREATE INDEX IF NOT EXISTS idx_student_artifact_user_type_archived 
ON StudentArtifact(userId, artifactType, isArchived);

CREATE INDEX IF NOT EXISTS idx_student_progress_user_level_date 
ON StudentOutcomeProgress(userId, currentLevel, lastAssessmentDate);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_level 
ON StudentOutcomeProgress(studentId, currentLevel);

-- Indexes for evidence triangulation analysis
CREATE INDEX IF NOT EXISTS idx_artifact_outcome_evidence_date 
ON StudentArtifactOutcome(evidenceType, dateAssessed);

CREATE INDEX IF NOT EXISTS idx_artifact_outcome_user_evidence 
ON StudentArtifactOutcome(artifactId, evidenceType) 
WHERE EXISTS (SELECT 1 FROM StudentArtifact WHERE StudentArtifact.id = StudentArtifactOutcome.artifactId);

-- Indexes for report generation
CREATE INDEX IF NOT EXISTS idx_student_grade_active_user 
ON Student(grade, isActive, userId);

-- Covering index for common student queries (SQLite supports covering indexes)
CREATE INDEX IF NOT EXISTS idx_student_artifact_covering 
ON StudentArtifact(studentId, userId, isArchived, dateCollected, artifactType, processingStatus);

-- Index for storage quota monitoring
CREATE INDEX IF NOT EXISTS idx_student_artifact_size_user 
ON StudentArtifact(userId, fileSize) WHERE fileSize IS NOT NULL;

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_student_artifact_cleanup 
ON StudentArtifact(isArchived, dateCollected, processingStatus);

-- Performance monitoring views for single-teacher analytics
CREATE VIEW IF NOT EXISTS teacher_performance_summary AS
SELECT 
  s.userId,
  COUNT(DISTINCT s.id) as active_students,
  COUNT(DISTINCT sa.id) as total_artifacts,
  COUNT(DISTINCT CASE WHEN sa.dateCollected >= date('now', '-30 days') THEN sa.id END) as recent_artifacts,
  COUNT(DISTINCT sop.id) as total_assessments,
  COUNT(DISTINCT CASE WHEN sop.lastAssessmentDate >= date('now', '-30 days') THEN sop.id END) as recent_assessments,
  SUM(CASE WHEN sa.fileSize IS NOT NULL THEN sa.fileSize ELSE 0 END) as total_storage_bytes
FROM Student s
LEFT JOIN StudentArtifact sa ON s.id = sa.studentId AND sa.isArchived = 0
LEFT JOIN StudentOutcomeProgress sop ON s.id = sop.studentId
WHERE s.isActive = 1
GROUP BY s.userId;

-- Evidence triangulation summary view
CREATE VIEW IF NOT EXISTS evidence_triangulation_summary AS
SELECT 
  s.userId,
  s.id as studentId,
  s.firstName || ' ' || s.lastName as studentName,
  COUNT(CASE WHEN sao.evidenceType = 'OBSERVATION' THEN 1 END) as observation_count,
  COUNT(CASE WHEN sao.evidenceType = 'CONVERSATION' THEN 1 END) as conversation_count,  
  COUNT(CASE WHEN sao.evidenceType = 'PRODUCT' THEN 1 END) as product_count,
  COUNT(sao.artifactId) as total_evidence
FROM Student s
LEFT JOIN StudentArtifact sa ON s.id = sa.studentId AND sa.isArchived = 0
LEFT JOIN StudentArtifactOutcome sao ON sa.id = sao.artifactId
WHERE s.isActive = 1
GROUP BY s.userId, s.id, s.firstName, s.lastName;

-- Progress distribution view for quick analytics
CREATE VIEW IF NOT EXISTS progress_distribution AS
SELECT 
  s.userId,
  ce.subject,
  sop.currentLevel,
  COUNT(*) as count,
  COUNT(DISTINCT s.id) as unique_students
FROM StudentOutcomeProgress sop
JOIN Student s ON sop.studentId = s.id
JOIN CurriculumExpectation ce ON sop.outcomeId = ce.id
WHERE s.isActive = 1
GROUP BY s.userId, ce.subject, sop.currentLevel;