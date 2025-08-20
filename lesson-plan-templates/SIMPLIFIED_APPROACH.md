# Simplified Lesson Template Approach

## What Changed

### ❌ REMOVED (Hallucination Triggers)
- Time of day assumptions ("after-lunch", "Friday afternoon")
- Energy level predictions
- Holiday proximity guessing
- Class size assumptions
- Previous lesson dependencies
- Complex context requirements
- 1,500+ lines of overengineered code

### ✅ KEPT (Essential Structure)
- ETFO three-part structure (Minds On/Action/Consolidation)
- Vocabulary limits by month (3-5 words)
- French percentage by month (30% → 85%)
- Movement requirement
- Standard materials only
- Simple assessment methods

## The Perfect Template

**File:** `PerfectLessonTemplate.ts` (150 lines)

**Core Structure:**
```typescript
interface LessonPlanTemplate {
  // What we know
  subject: SubjectType;
  unitTitle: string;
  lessonNumber: number;
  
  // What AI generates
  title: string;
  vocabulary: VocabularyItem[]; // Max 3-5 based on month
  mindsOn: Activity;
  action: Activity;
  consolidation: Activity;
  materials: string[];
  assessment: AssessmentMethod;
  differentiation: Strategies;
}
```

## Why This Works

1. **No Unknowable Context**: Every field can be determined from available information
2. **Structure Enforces Best Practices**: Required gestures, movement, visual supports
3. **Prevents Hallucination**: No fields for AI to fill with made-up context
4. **Simple Validation**: Easy to check if generated lesson meets requirements
5. **Emily Decides Context**: She knows if it's Friday afternoon, not the AI

## How AI Uses It

1. AI receives: subject, unit title, lesson number, month
2. AI generates: activities that fit the structure
3. Template validates: vocabulary count, timing, movement included
4. Emily receives: solid lesson skeleton she can adapt

## Files

- `PerfectLessonTemplate.ts` - The clean, simple template
- `ExampleUsage.ts` - Shows how AI fills it
- `archived-overengineered/` - The old complex system (kept for reference)

## Result

**Before**: 1,500+ lines trying to predict unknowable context
**After**: 150 lines enforcing known best practices

The template now does what it should: provide structure for AI generation without inducing hallucinations.