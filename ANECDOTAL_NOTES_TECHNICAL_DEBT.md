# ⚠️ CRITICAL TECHNICAL DEBT: Anecdotal Notes Implementation

## Current Status (December 2024)
Anecdotal notes are implemented as a **temporary workaround** using the existing StudentAssessment model with an `isAnecdotal` flag to separate them from real assessments.

## The Problem
Anecdotal notes are stored as fake StudentAssessment records rather than having their own dedicated data model.

### Current Implementation:
- Notes are created as StudentAssessment records with `subject: "ANECDOTAL_{timestamp}_{subject}"`
- An `isAnecdotal` boolean flag separates them from real assessments
- Server automatically detects and flags anecdotal notes on creation
- API endpoints exclude anecdotal notes by default unless explicitly requested

## Why This Is Technical Debt

1. **Data Model Violation**: Anecdotal notes are NOT assessments but we're storing them as such
2. **Semantic Confusion**: Using `level: 'MEETING'` for non-assessment data is meaningless
3. **Database Pollution**: The StudentAssessment table contains mixed-purpose data
4. **API Complexity**: Every assessment query needs to filter out anecdotal notes
5. **Migration Risk**: Future changes to assessment structure affect anecdotal notes

## Current Mitigation (Option 2 Implementation)

We've implemented server-side separation to minimize damage:

```typescript
// Server detects and flags anecdotal notes
const isAnecdotal = validatedData.subject?.startsWith('ANECDOTAL_') || false;

// API excludes anecdotal notes by default
where: {
  isAnecdotal: includeAnecdotal === 'true' ? undefined : false
}
```

This prevents:
- Analytics pollution
- Report contamination
- Differentiation group corruption

## Proper Solution (Option 1)

### 1. Create Dedicated Model
```prisma
model AnecdotalNote {
  id        String   @id @default(cuid())
  studentId String
  userId    String
  text      String   @db.Text
  context   Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  student Student @relation(fields: [studentId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
}
```

### 2. Create Dedicated API
```typescript
// /api/anecdotal-notes
router.post('/api/anecdotal-notes', authenticate, async (req, res) => {
  const note = await prisma.anecdotalNote.create({
    data: { ... }
  });
  return res.json(note);
});
```

### 3. Migration Path
1. Create new AnecdotalNote table
2. Migrate existing records where `isAnecdotal === true`
3. Update client code to use new endpoints
4. Remove isAnecdotal flag from StudentAssessment

## Migration Script (Future)
```sql
-- Step 1: Copy anecdotal notes to new table
INSERT INTO AnecdotalNote (id, studentId, userId, text, createdAt)
SELECT id, studentId, userId, notes, createdAt
FROM StudentAssessment
WHERE isAnecdotal = true;

-- Step 2: Delete from StudentAssessment
DELETE FROM StudentAssessment WHERE isAnecdotal = true;

-- Step 3: Drop the isAnecdotal column
ALTER TABLE StudentAssessment DROP COLUMN isAnecdotal;
```

## Timeline
- **Current**: Option 2 workaround implemented
- **Q1 2025**: Plan proper migration
- **Q2 2025**: Implement Option 1 with proper data model
- **Q3 2025**: Complete migration and cleanup

## Risks of Keeping Current Implementation
1. **Data Integrity**: Mixed-purpose data in assessment table
2. **Performance**: Every assessment query filters unnecessary records
3. **Maintenance**: Future developers won't understand why assessments have notes
4. **Scale**: As notes grow, assessment queries slow down
5. **Reports**: Risk of anecdotal notes appearing in assessment reports if filter fails

## Action Items
- [ ] Add monitoring for anecdotal note creation
- [ ] Track percentage of assessments that are actually notes
- [ ] Document all places that need updating during migration
- [ ] Create migration plan document
- [ ] Schedule technical debt review for Q1 2025

## Code Locations Requiring Future Updates
- `/client/src/hooks/useAnecdotalNotes.ts` - Uses assessment API
- `/client/src/utils/anecdotalNotes.ts` - Utility functions
- `/server/src/routes/student-assessments.ts` - Contains workaround logic
- `/packages/database/prisma/schema.prisma` - Has temporary isAnecdotal field

## Warning for Developers
**DO NOT** remove the `isAnecdotal` flag or its filtering logic without completing the full migration to a proper AnecdotalNote model. This flag is the ONLY thing preventing anecdotal notes from polluting assessment data throughout the application.