-- Database Optimization Script for Teaching Engine 2.0
-- Additional composite indices for improved query performance

-- ==================== Additional Composite Indices ====================

-- DaybookEntry optimizations
-- Current indices: [userId, date], [userId, overallRating], [userId, updatedAt], [lessonPlanId]
-- Missing: Date range queries with subject/grade filtering
-- Note: These would be added to the Prisma schema as:
-- @@index([userId, date, subject])
-- @@index([date, grade])

-- UnitPlan optimizations  
-- Current indices: [userId, startDate], [longRangePlanId], [userId, updatedAt], [startDate, endDate]
-- Missing: Date range queries with grade/subject
-- Note: These would be added to the Prisma schema as:
-- @@index([userId, startDate, endDate])
-- @@index([startDate, endDate, grade])

-- ETFOLessonPlan optimizations
-- Current indices: [userId, date], [unitPlanId], [grade, subject], [language], [userId, isSubFriendly], [userId, assessmentType], [userId, updatedAt], [date, duration]
-- Missing: Combined filters for common queries
-- Note: These would be added to the Prisma schema as:
-- @@index([userId, date, grade])
-- @@index([userId, date, subject])
-- @@index([grade, subject, date])

-- CurriculumExpectation optimizations
-- Current indices: [subject, grade], [code], [strand, grade], [subject, strand]
-- Missing: Active status combinations
-- Note: These would be added to the Prisma schema as:
-- @@index([isActive, subject, grade])
-- @@index([isActive, strand, grade])

-- Newsletter optimizations (if applicable)
-- Missing: Date range with status
-- Note: These would be added to the Prisma schema as:
-- @@index([userId, dateFrom, dateTo])
-- @@index([userId, isDraft, sentAt])

-- ClassroomAnnouncement optimizations
-- Missing: User with time range
-- Note: These would be added to the Prisma schema as:
-- @@index([userId, createdAt])
-- @@index([userId, updatedAt])

-- Performance Notes:
-- 1. The existing indices are already well-designed for most common queries
-- 2. Additional indices should be added based on actual query patterns from monitoring
-- 3. Consider materialized views for complex aggregations if needed
-- 4. Monitor index usage with EXPLAIN QUERY PLAN to ensure effectiveness

-- ==================== Materialized Views (Future Enhancement) ====================

-- User Planning Metrics View (if implemented as a table)
-- This would aggregate planning statistics per user for dashboard display
/*
CREATE VIEW IF NOT EXISTS UserPlanningMetrics AS
SELECT 
  u.id as userId,
  u.name as userName,
  COUNT(DISTINCT lrp.id) as totalLongRangePlans,
  COUNT(DISTINCT up.id) as totalUnitPlans,
  COUNT(DISTINCT elp.id) as totalLessonPlans,
  COUNT(DISTINCT de.id) as totalDaybookEntries,
  AVG(CAST(de.overallRating as REAL)) as averageLessonRating,
  MAX(de.date) as lastPlanDate
FROM User u
LEFT JOIN LongRangePlan lrp ON u.id = lrp.userId
LEFT JOIN UnitPlan up ON lrp.id = up.longRangePlanId
LEFT JOIN ETFOLessonPlan elp ON up.id = elp.unitPlanId
LEFT JOIN DaybookEntry de ON elp.id = de.lessonPlanId
GROUP BY u.id, u.name;
*/

-- Curriculum Coverage View (if implemented as a table)
-- This would show curriculum expectation coverage across plans
/*
CREATE VIEW IF NOT EXISTS CurriculumCoverageMetrics AS
SELECT 
  ce.subject,
  ce.grade,
  ce.strand,
  COUNT(DISTINCT ce.id) as totalExpectations,
  COUNT(DISTINCT upe.expectationId) as unitPlanCoverage,
  COUNT(DISTINCT de.id) as lessonsCovered,
  ROUND(
    (COUNT(DISTINCT upe.expectationId) * 100.0) / COUNT(DISTINCT ce.id), 
    2
  ) as coveragePercentage
FROM CurriculumExpectation ce
LEFT JOIN UnitPlanExpectation upe ON ce.id = upe.expectationId
LEFT JOIN UnitPlan up ON upe.unitPlanId = up.id
LEFT JOIN ETFOLessonPlan elp ON up.id = elp.unitPlanId
LEFT JOIN DaybookEntry de ON elp.id = de.lessonPlanId
WHERE ce.isActive = 1
GROUP BY ce.subject, ce.grade, ce.strand;
*/

-- ==================== Query Optimization Recommendations ====================

-- 1. Date Range Queries
-- Common pattern: Find plans/entries within date ranges
-- Ensure compound indices include date fields early in the index

-- 2. User + Status/Type Filtering
-- Common pattern: User's items filtered by status, type, or active flag
-- Include userId as first field in compound indices

-- 3. Hierarchical Queries
-- Common pattern: Get all lessons in a unit, all units in a long-range plan
-- Foreign key indices are already optimized

-- 4. Search Queries
-- Common pattern: Text search within user's content
-- Consider full-text search indices if implementing search

-- 5. Dashboard Aggregations
-- Common pattern: Count/sum queries for dashboard metrics
-- Consider materialized views for complex aggregations

-- ==================== Index Monitoring Queries ====================

-- Use these queries to monitor index effectiveness:

-- Check index usage (SQLite-specific)
-- PRAGMA index_list('table_name');
-- PRAGMA index_info('index_name');

-- Query plan analysis
-- EXPLAIN QUERY PLAN SELECT ...;

-- Index statistics (if available)
-- .stats on
-- .eqp on

-- ==================== Implementation Notes ====================

-- To implement these optimizations in Prisma:
-- 1. Add the @@index directives to the appropriate models in schema.prisma
-- 2. Run: npx prisma db push (for development)
-- 3. Run: npx prisma migrate dev --name "add-performance-indices" (for production)
-- 4. Monitor query performance before and after
-- 5. Remove unused indices if they don't improve performance

-- Example Prisma schema additions:
/*
model DaybookEntry {
  // ... existing fields ...
  
  @@index([userId, date])
  @@index([userId, overallRating])
  @@index([userId, updatedAt])
  @@index([lessonPlanId])
  // New optimized indices:
  @@index([userId, date, grade])     // User's entries by date and grade
  @@index([date, grade, subject])    // Date range with grade/subject filter
}
*/