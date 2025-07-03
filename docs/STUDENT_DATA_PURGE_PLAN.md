# Student Data Purge Plan

**CRITICAL**: This application must NOT store any student information. It is solely for teacher planning assistance.

## Files to Remove Completely

### 1. Database Schema Files
- **packages/database/prisma/schema.prisma**
  - Remove: Student model (lines 215-229)
  - Remove: StudentGoal model (lines 231-240)
  - Remove: StudentReflection model (lines 242-261)
  - Remove: StudentArtifact model (lines 263-272)
  - Remove: ParentSummary model (lines 274-286)
  - Update: Newsletter model - remove studentIds field

### 2. API Route Files (Delete Entirely)
- `server/src/routes/student.ts`
- `server/src/routes/parentSummary.ts`
- `server/src/controllers/studentController.ts`

### 3. Service Files (Delete Entirely)
- `server/src/services/studentService.ts`
- `server/src/services/__tests__/studentService.test.ts`
- `server/src/services/ai/aiParentSummaryService.ts`

### 4. Client Components (Delete Entirely)
- `client/src/components/newsletter/StudentSelector.tsx`
- Any parent communication related components
- Student goal/reflection components

### 5. Test Files
- `server/tests/integration/routes-student.comprehensive.test.ts`
- Any test files related to student data
- Remove student factories from `server/tests/factories/testFactories.ts`

## Files to Modify

### 1. Newsletter Functionality
**Current**: Newsletters are tied to specific students
**Change To**: Newsletters should be general templates without student associations

Files to modify:
- `server/src/routes/newsletters.ts` - Remove student selection
- `server/src/controllers/newsletterController.ts` - Remove student references
- Newsletter database model - Remove studentIds field

### 2. Lesson Planning
**Current**: May reference student names or groups
**Change To**: Use generic placeholders like "Group A", "Group B" instead of actual names

### 3. AI Services
Review and modify:
- Remove any AI prompts that generate student-specific content
- Focus only on lesson planning and curriculum development

## Database Migration

```sql
-- Drop all student-related tables
DROP TABLE IF EXISTS "StudentArtifact" CASCADE;
DROP TABLE IF EXISTS "StudentReflection" CASCADE;
DROP TABLE IF EXISTS "StudentGoal" CASCADE;
DROP TABLE IF EXISTS "Student" CASCADE;
DROP TABLE IF EXISTS "ParentSummary" CASCADE;

-- Remove student references from newsletters
ALTER TABLE "Newsletter" DROP COLUMN IF EXISTS "studentIds";
```

## Code Search Patterns to Verify Removal

Run these searches to ensure complete removal:
```bash
# Find any remaining student references
grep -r "student" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "Student" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "pupil" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "learner" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .

# Find any parent/guardian references
grep -r "parent" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "guardian" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .

# Find any PII patterns
grep -r "email.*student" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "phone.*student" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
grep -r "grade.*level" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" .
```

## Feature Replacements

### Instead of Student Data, Focus On:

1. **Lesson Plan Templates**
   - Generic lesson plans without student names
   - Activities for "small groups" not "John's group"

2. **Curriculum Planning**
   - Standards alignment
   - Unit planning
   - Resource organization

3. **Teaching Strategies**
   - Differentiation strategies (without naming students)
   - General accommodation suggestions
   - Classroom management techniques

4. **Professional Development**
   - Teaching reflection tools
   - Best practices library
   - Collaboration with other teachers

5. **Resource Management**
   - Material lists
   - Time management
   - Activity libraries

## Implementation Steps

1. **Backup Current Database** (if in production)
2. **Create Migration Branch**
3. **Remove Database Models**
4. **Delete Student-Related Files**
5. **Update Remaining Files**
6. **Run Tests**
7. **Update Documentation**
8. **Deploy with Migration**

## Privacy Benefits

By removing all student data:
- ✅ No FERPA compliance needed
- ✅ No COPPA concerns
- ✅ No GDPR requirements for minors
- ✅ No risk of student data breaches
- ✅ Simplified security model
- ✅ Focus on teacher productivity only

## Timeline

This is a HIGH PRIORITY change that should be implemented immediately to ensure the app complies with its intended scope as a teacher planning tool only.