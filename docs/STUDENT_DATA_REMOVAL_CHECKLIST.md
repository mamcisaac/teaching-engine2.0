# Student Data Removal Checklist

**⚠️ CRITICAL: This app must NOT store any student information**

## Database Schema Changes

### 1. Remove from schema.prisma
```prisma
// REMOVE THESE MODELS ENTIRELY:
- model Student (lines 215-229)
- model StudentGoal (lines 231-240)
- model StudentReflection (lines 242-261)
- model StudentArtifact (lines 263-272)
- model ParentSummary (lines 274-286)

// MODIFY:
- model Newsletter - Remove studentIds field (line 301)
```

### 2. Create Migration
```bash
# Generate migration to drop tables
cd packages/database
npx prisma migrate dev --name remove_student_data

# Migration will include:
DROP TABLE IF EXISTS "StudentArtifact" CASCADE;
DROP TABLE IF EXISTS "StudentReflection" CASCADE;
DROP TABLE IF EXISTS "StudentGoal" CASCADE;
DROP TABLE IF EXISTS "ParentSummary" CASCADE;
DROP TABLE IF EXISTS "Student" CASCADE;
ALTER TABLE "Newsletter" DROP COLUMN "studentIds";
```

## Files to Delete

### Backend Files
```bash
# Controllers
rm server/src/controllers/studentController.ts

# Services
rm server/src/services/studentService.ts
rm server/src/services/ai/aiParentSummaryService.ts
rm -rf server/src/services/ai/parentSummary/

# Routes
rm server/src/routes/student.ts
rm server/src/routes/parentSummary.ts

# Tests
rm server/src/services/__tests__/studentService.test.ts
rm server/tests/integration/routes-student.comprehensive.test.ts
rm server/tests/integration/aiParentSummaryService.*.test.ts
```

### Frontend Files
```bash
# Components
rm -rf client/src/components/newsletter/StudentSelector.tsx
rm -rf client/src/components/students/
rm -rf client/src/components/parent-summary/
rm -rf client/src/pages/parent-summary/

# Any student-related pages
rm -rf client/src/pages/students/
```

## Files to Modify

### 1. Newsletter System
Transform from student-specific to general templates:

**server/src/routes/newsletters.ts**
- Remove student selection endpoints
- Remove studentIds from request body
- Make newsletters general communication templates

**server/src/controllers/newsletterController.ts**
- Remove all student references
- Update to handle general newsletters only

**client/src/pages/newsletters/**
- Remove student selection UI
- Update to template-based system

### 2. Test Factories
**server/tests/factories/testFactories.ts**
- Remove createTestStudent function
- Remove student-related factory functions
- Remove any parent/guardian references

### 3. Route Index Files
**server/src/routes/index.ts**
- Remove student route imports
- Remove parentSummary route imports

### 4. Database Seed Files
**packages/database/prisma/seed.ts**
- Remove any student seeding
- Remove parent summary seeding

## Code to Search and Clean

### 1. Remove Student References
```bash
# Find all files with student references
grep -r "student" --include="*.ts" --include="*.tsx" server/ client/
grep -r "Student" --include="*.ts" --include="*.tsx" server/ client/

# Check for:
- Variable names with "student"
- Function parameters
- Type definitions
- Comments mentioning students
```

### 2. Remove Parent/Guardian References
```bash
grep -r "parent" --include="*.ts" --include="*.tsx" server/ client/
grep -r "guardian" --include="*.ts" --include="*.tsx" server/ client/
```

### 3. Remove Grade Level Storage
```bash
# Grade level should only be used for curriculum planning, not tied to students
grep -r "grade.*student" --include="*.ts" --include="*.tsx" server/ client/
```

## API Endpoints to Remove

```
DELETE /api/students/*
DELETE /api/students
GET    /api/students
POST   /api/students
PUT    /api/students/:id

DELETE /api/parent-summary/*
GET    /api/parent-summary
POST   /api/parent-summary

# Modify newsletter endpoints to remove student selection
PUT    /api/newsletters (remove studentIds from body)
```

## Environment Variables
Check and remove any student-related configs:
- Remove any student data retention policies
- Remove parent communication settings
- Keep only teacher planning configurations

## Documentation Updates

### 1. README.md
- Remove any mention of student tracking features
- Update feature list to emphasize teacher planning only
- Add privacy statement: "This application does not store any student data"

### 2. API Documentation
- Remove all student-related endpoint documentation
- Update newsletter documentation
- Add clear statement about no student data storage

### 3. User Guides
- Remove any guides about managing students
- Remove parent communication guides
- Focus on lesson planning and curriculum features

## Verification Steps

After removal, verify:

1. **Database**
   ```sql
   -- These queries should return errors (tables don't exist)
   SELECT * FROM "Student";
   SELECT * FROM "StudentGoal";
   SELECT * FROM "StudentReflection";
   SELECT * FROM "StudentArtifact";
   SELECT * FROM "ParentSummary";
   ```

2. **API Tests**
   ```bash
   # All student endpoints should return 404
   curl -X GET http://localhost:3000/api/students
   curl -X POST http://localhost:3000/api/students
   ```

3. **Code Search**
   ```bash
   # Should return minimal/no results
   grep -r "studentId" --include="*.ts" server/
   grep -r "Student" --include="*.ts" server/src/
   ```

## Final Checklist

- [ ] Database migration created and run
- [ ] All student tables dropped
- [ ] Student files deleted
- [ ] Newsletter system updated
- [ ] Test files updated
- [ ] Documentation updated
- [ ] No student PII anywhere in codebase
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Privacy policy updated

## Post-Removal Features

The app should now focus exclusively on:
- ✅ Lesson planning
- ✅ Curriculum management
- ✅ Resource organization
- ✅ Teaching strategies
- ✅ Professional development
- ✅ Schedule management
- ❌ NO student data
- ❌ NO parent communication
- ❌ NO grade tracking
- ❌ NO attendance