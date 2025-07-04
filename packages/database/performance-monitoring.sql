-- Database Performance Monitoring Script
-- Use these queries to monitor database performance and index effectiveness

-- ==================== Index Usage Analysis ====================

-- Check all indices for a table (SQLite)
-- Usage: Replace 'TableName' with actual table name
/*
PRAGMA index_list('DaybookEntry');
PRAGMA index_list('ETFOLessonPlan');  
PRAGMA index_list('UnitPlan');
PRAGMA index_list('CurriculumExpectation');
PRAGMA index_list('LongRangePlan');
*/

-- Get detailed index information
/*
PRAGMA index_info('DaybookEntry_userId_date_idx');
PRAGMA index_info('ETFOLessonPlan_grade_subject_idx');
*/

-- ==================== Query Performance Analysis ====================

-- Use EXPLAIN QUERY PLAN to analyze query execution
-- Example queries to test performance:

-- 1. Daybook entries for user within date range
/*
EXPLAIN QUERY PLAN
SELECT * FROM DaybookEntry 
WHERE userId = 1 
  AND date >= '2024-01-01' 
  AND date <= '2024-12-31'
ORDER BY date DESC;
*/

-- 2. Lesson plans by grade and subject
/*
EXPLAIN QUERY PLAN
SELECT * FROM ETFOLessonPlan 
WHERE grade = 5 
  AND subject = 'Mathematics'
  AND date >= '2024-01-01'
ORDER BY date;
*/

-- 3. Unit plans within date range
/*
EXPLAIN QUERY PLAN
SELECT * FROM UnitPlan 
WHERE userId = 1
  AND startDate >= '2024-01-01'
  AND endDate <= '2024-12-31'
ORDER BY startDate;
*/

-- 4. Active curriculum expectations by subject and grade
/*
EXPLAIN QUERY PLAN
SELECT * FROM CurriculumExpectation
WHERE isActive = 1
  AND subject = 'Mathematics'
  AND grade = 5
ORDER BY strand, code;
*/

-- ==================== Performance Benchmarking ====================

-- Create a performance test table to track query times
CREATE TABLE IF NOT EXISTS QueryPerformanceLog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_name TEXT NOT NULL,
  execution_time_ms REAL NOT NULL,
  row_count INTEGER,
  index_used TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example performance test queries with timing
-- Note: Actual implementation would use application-level timing

-- Test 1: User's recent daybook entries
/*
INSERT INTO QueryPerformanceLog (query_name, execution_time_ms, row_count, index_used)
SELECT 
  'user_recent_daybook_entries',
  -- Execution time would be measured by application
  0.0,
  COUNT(*),
  'userId_date_idx'
FROM DaybookEntry 
WHERE userId = 1 
  AND date >= date('now', '-30 days')
ORDER BY date DESC;
*/

-- Test 2: Lesson plans by grade/subject
/*
INSERT INTO QueryPerformanceLog (query_name, execution_time_ms, row_count, index_used)
SELECT 
  'lesson_plans_grade_subject',
  0.0,
  COUNT(*),
  'grade_subject_idx'
FROM ETFOLessonPlan 
WHERE grade = 5 AND subject = 'Mathematics';
*/

-- ==================== Database Statistics ====================

-- Table size and row counts
SELECT 
  name as table_name,
  sql as create_statement
FROM sqlite_master 
WHERE type = 'table' 
  AND name NOT LIKE 'sqlite_%'
ORDER BY name;

-- Get row counts for main tables
/*
SELECT 'User' as table_name, COUNT(*) as row_count FROM User
UNION ALL
SELECT 'DaybookEntry', COUNT(*) FROM DaybookEntry  
UNION ALL
SELECT 'ETFOLessonPlan', COUNT(*) FROM ETFOLessonPlan
UNION ALL
SELECT 'UnitPlan', COUNT(*) FROM UnitPlan
UNION ALL
SELECT 'LongRangePlan', COUNT(*) FROM LongRangePlan
UNION ALL
SELECT 'CurriculumExpectation', COUNT(*) FROM CurriculumExpectation
ORDER BY table_name;
*/

-- ==================== Index Effectiveness Analysis ====================

-- Check for unused indices (requires SQLite 3.38+)
-- PRAGMA optimize;

-- Analyze database statistics  
-- ANALYZE;

-- Get database page count and size
/*
PRAGMA page_count;
PRAGMA page_size;
PRAGMA cache_size;
*/

-- ==================== Slow Query Detection ====================

-- Common slow query patterns to monitor:

-- 1. Queries without proper indices (table scans)
-- Look for "SCAN TABLE" in EXPLAIN QUERY PLAN output

-- 2. Queries with large result sets
-- Monitor queries returning >1000 rows

-- 3. Complex joins without proper indices
-- Monitor multi-table queries

-- 4. Date range queries without date indices
-- Monitor WHERE clauses with date comparisons

-- ==================== Performance Optimization Recommendations ====================

-- Based on query patterns, consider these optimizations:

-- 1. Add missing indices identified by EXPLAIN QUERY PLAN
-- 2. Consider partial indices for frequently filtered columns
-- 3. Monitor foreign key constraint performance
-- 4. Consider query restructuring for complex joins
-- 5. Use LIMIT clauses for large result sets
-- 6. Consider pagination for UI queries

-- Example partial index (SQLite):
-- CREATE INDEX idx_active_expectations_partial 
-- ON CurriculumExpectation(subject, grade) 
-- WHERE isActive = 1;

-- ==================== Maintenance Queries ====================

-- Regular maintenance tasks:

-- 1. Update table statistics
-- ANALYZE;

-- 2. Rebuild indices if needed (SQLite doesn't fragment much)
-- REINDEX;

-- 3. Check database integrity
-- PRAGMA integrity_check;

-- 4. Check foreign key constraints
-- PRAGMA foreign_key_check;

-- 5. Optimize database
-- PRAGMA optimize;

-- ==================== Monitoring Queries for Application ====================

-- These queries can be used in the application to monitor performance:

-- 1. Average query time by type
/*
SELECT 
  query_name,
  AVG(execution_time_ms) as avg_time_ms,
  COUNT(*) as execution_count,
  MAX(execution_time_ms) as max_time_ms
FROM QueryPerformanceLog 
WHERE timestamp >= datetime('now', '-7 days')
GROUP BY query_name
ORDER BY avg_time_ms DESC;
*/

-- 2. Slowest queries in last 24 hours
/*
SELECT 
  query_name,
  execution_time_ms,
  row_count,
  timestamp
FROM QueryPerformanceLog 
WHERE timestamp >= datetime('now', '-1 day')
  AND execution_time_ms > 100  -- Queries taking >100ms
ORDER BY execution_time_ms DESC
LIMIT 10;
*/

-- 3. Database growth tracking
/*
CREATE TABLE IF NOT EXISTS DatabaseGrowthLog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert current counts (run periodically)
INSERT INTO DatabaseGrowthLog (table_name, row_count)
SELECT 'DaybookEntry', COUNT(*) FROM DaybookEntry
UNION ALL
SELECT 'ETFOLessonPlan', COUNT(*) FROM ETFOLessonPlan
UNION ALL  
SELECT 'UnitPlan', COUNT(*) FROM UnitPlan;
*/

-- ==================== Application Integration Notes ====================

-- For Node.js/Prisma integration:
-- 1. Use Prisma's query logging: prismaClient.$on('query', ...)
-- 2. Monitor slow queries with custom middleware
-- 3. Track query performance metrics in application logs
-- 4. Set up alerts for queries exceeding thresholds
-- 5. Use database monitoring tools in production

-- Example Prisma query logging:
/*
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log(`Query: ${e.query}`);
  console.log(`Duration: ${e.duration}ms`);
});
*/