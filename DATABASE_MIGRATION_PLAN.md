# Database Migration Consolidation Plan

## Overview
This document details the consolidation of database migrations across 8 pull requests, reducing migration complexity by 40% while preserving all functionality.

## Current State: 5 Separate Migrations

### From PR #323 (Anecdotal Notes)
1. **Migration**: `20250829231850_add_user_grade_program_fields`
   - Fixes User table indexes
   - Uses `IF EXISTS` for safer index dropping

2. **Migration**: `20250901_add_anecdotal_notes`
   - Creates new Note table
   - Adds 6 performance indexes

### From PR #316 (Quick Reflections)
3. **Migration**: `20250901_simple_assessment`
   - Adds `quickAssessment` field to ETFOLessonPlan
   - Adds `quickAssessmentNotes` field to ETFOLessonPlan

### From PR #310 (Drag-Drop Dashboard)
4. **Migration**: `20250902200420_add_position_column`
   - Adds `position` field to ETFOLessonPlan

5. **Migration**: `20250903_add_position_constraint`
   - Adds indexes for position-based sorting

## Consolidated Plan: 3 Optimized Migrations

### Migration 1: Fix User Indexes
**File**: `20250829231850_fix_user_indexes.sql`
```sql
-- Fix from PR #323: Safer index management
BEGIN;

-- Drop indexes if they exist (prevents errors)
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "User_fullName_idx";
DROP INDEX IF EXISTS "User_createdAt_idx";

-- Recreate with proper configuration
CREATE INDEX CONCURRENTLY "User_email_idx" ON "User"("email");
CREATE INDEX CONCURRENTLY "User_fullName_idx" ON "User"("fullName");
CREATE INDEX CONCURRENTLY "User_createdAt_idx" ON "User"("createdAt" DESC);

COMMIT;
```

### Migration 2: Create Note System
**File**: `20250901_add_note_system.sql`
```sql
-- From PR #323: Complete anecdotal notes system
BEGIN;

-- Create Note table with all fields
CREATE TABLE IF NOT EXISTS "Note" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "lessonPlanId" TEXT,
  "lessonTitle" TEXT,
  "subject" TEXT,
  "tags" TEXT[],
  "isPrivate" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE "Note" 
  ADD CONSTRAINT "Note_studentId_fkey" 
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE;

ALTER TABLE "Note" 
  ADD CONSTRAINT "Note_teacherId_fkey" 
  FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Note" 
  ADD CONSTRAINT "Note_lessonPlanId_fkey" 
  FOREIGN KEY ("lessonPlanId") REFERENCES "ETFOLessonPlan"("id") ON DELETE SET NULL;

-- Create performance indexes
CREATE INDEX CONCURRENTLY "Note_studentId_idx" ON "Note"("studentId");
CREATE INDEX CONCURRENTLY "Note_teacherId_idx" ON "Note"("teacherId");
CREATE INDEX CONCURRENTLY "Note_createdAt_idx" ON "Note"("createdAt" DESC);
CREATE INDEX CONCURRENTLY "Note_subject_idx" ON "Note"("subject");
CREATE INDEX CONCURRENTLY "Note_lessonPlanId_idx" ON "Note"("lessonPlanId");
CREATE INDEX CONCURRENTLY "Note_studentId_createdAt_idx" ON "Note"("studentId", "createdAt" DESC);

-- Add update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_note_updated_at 
  BEFORE UPDATE ON "Note" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### Migration 3: ETFOLessonPlan Enhancements
**File**: `20250902_lesson_plan_enhancements.sql`
```sql
-- Consolidated from PR #316 + PR #310
BEGIN;

-- Add new columns with proper defaults
ALTER TABLE "ETFOLessonPlan" 
  ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "quickAssessment" TEXT,
  ADD COLUMN IF NOT EXISTS "quickAssessmentNotes" TEXT;

-- Add check constraint for quickAssessment values
ALTER TABLE "ETFOLessonPlan" 
  ADD CONSTRAINT "ETFOLessonPlan_quickAssessment_check" 
  CHECK ("quickAssessment" IS NULL OR "quickAssessment" IN ('good', 'okay', 'needs_work'));

-- Create optimized compound indexes for sorting and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "ETFOLessonPlan_date_position_idx" 
  ON "ETFOLessonPlan"("date", "position");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "ETFOLessonPlan_userId_date_position_idx" 
  ON "ETFOLessonPlan"("userId", "date", "position");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "ETFOLessonPlan_quickAssessment_idx" 
  ON "ETFOLessonPlan"("quickAssessment") 
  WHERE "quickAssessment" IS NOT NULL;

-- Update existing records to have sequential positions
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY "userId", "date" 
    ORDER BY "createdAt"
  ) - 1 as new_position
  FROM "ETFOLessonPlan"
  WHERE "position" = 0
)
UPDATE "ETFOLessonPlan" 
SET "position" = numbered.new_position
FROM numbered
WHERE "ETFOLessonPlan".id = numbered.id;

COMMIT;
```

## Rollback Scripts

### Rollback Migration 3
```sql
BEGIN;

-- Remove indexes
DROP INDEX IF EXISTS "ETFOLessonPlan_quickAssessment_idx";
DROP INDEX IF EXISTS "ETFOLessonPlan_userId_date_position_idx";
DROP INDEX IF EXISTS "ETFOLessonPlan_date_position_idx";

-- Remove constraint
ALTER TABLE "ETFOLessonPlan" 
  DROP CONSTRAINT IF EXISTS "ETFOLessonPlan_quickAssessment_check";

-- Remove columns
ALTER TABLE "ETFOLessonPlan" 
  DROP COLUMN IF EXISTS "quickAssessmentNotes",
  DROP COLUMN IF EXISTS "quickAssessment",
  DROP COLUMN IF EXISTS "position";

COMMIT;
```

### Rollback Migration 2
```sql
BEGIN;

-- Remove trigger
DROP TRIGGER IF EXISTS update_note_updated_at ON "Note";
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove indexes
DROP INDEX IF EXISTS "Note_studentId_createdAt_idx";
DROP INDEX IF EXISTS "Note_lessonPlanId_idx";
DROP INDEX IF EXISTS "Note_subject_idx";
DROP INDEX IF EXISTS "Note_createdAt_idx";
DROP INDEX IF EXISTS "Note_teacherId_idx";
DROP INDEX IF EXISTS "Note_studentId_idx";

-- Drop table
DROP TABLE IF EXISTS "Note";

COMMIT;
```

### Rollback Migration 1
```sql
BEGIN;

-- Simply remove indexes if needed
DROP INDEX IF EXISTS "User_createdAt_idx";
DROP INDEX IF EXISTS "User_fullName_idx";
DROP INDEX IF EXISTS "User_email_idx";

COMMIT;
```

## Migration Benefits

### Performance Improvements
1. **CONCURRENTLY keyword**: Prevents table locks during index creation
2. **Compound indexes**: Optimizes common query patterns
3. **Partial indexes**: Reduces index size for nullable fields
4. **Proper foreign keys**: Ensures data integrity

### Safety Features
1. **IF NOT EXISTS clauses**: Prevents duplicate object errors
2. **Transaction wrapping**: Atomic operations
3. **Check constraints**: Data validation at database level
4. **Rollback scripts**: Easy recovery from issues

### Maintenance Benefits
1. **40% fewer migrations**: 5 → 3 files
2. **Logical grouping**: Related changes together
3. **Clear documentation**: Purpose and source of each change
4. **Version tracking**: Easy to identify when changes were made

## Testing Plan

### Local Testing
```bash
# Apply migrations
npm run db:migrate

# Test functionality
npm run test:integration

# Test rollback
npm run db:rollback
```

### Staging Testing
1. Apply migrations to staging database
2. Run full test suite
3. Perform user acceptance testing
4. Monitor for performance issues

### Production Deployment
1. Schedule maintenance window
2. Backup production database
3. Apply migrations with monitoring
4. Verify all features working
5. Keep rollback scripts ready

## Prisma Schema Updates

After migrations, update Prisma schema:

```prisma
model Note {
  id            String   @id @default(cuid())
  studentId     String
  teacherId     String
  content       String
  lessonPlanId  String?
  lessonTitle   String?
  subject       String?
  tags          String[]
  isPrivate     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  teacher       User     @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  lessonPlan    ETFOLessonPlan? @relation(fields: [lessonPlanId], references: [id], onDelete: SetNull)

  @@index([studentId])
  @@index([teacherId])
  @@index([createdAt])
  @@index([subject])
  @@index([lessonPlanId])
  @@index([studentId, createdAt])
}

model ETFOLessonPlan {
  // ... existing fields ...
  
  position             Int      @default(0)
  quickAssessment      String?  // 'good' | 'okay' | 'needs_work'
  quickAssessmentNotes String?
  
  notes               Note[]
  
  @@index([date, position])
  @@index([userId, date, position])
  @@index([quickAssessment])
}
```

## Migration Schedule

| Phase | Migration | PRs Covered | Risk Level |
|-------|-----------|-------------|------------|
| 1 | Fix User Indexes | PR #323 | Low |
| 2 | Create Note System | PR #323 | Medium |
| 3 | ETFOLessonPlan Enhancements | PR #316, #310 | Medium |

## Conclusion

This consolidated migration plan reduces complexity while maintaining all functionality. The approach prioritizes safety, performance, and maintainability, making future database changes easier to manage.

---
*Document Version: 1.0*  
*Created: September 3, 2025*  
*Migration Strategy for Teaching Engine 2.0*