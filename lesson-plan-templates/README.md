# Lesson Plan Templates

## Simple Structure for AI Generation

**Purpose:** Provide a clean template structure that prevents AI from hallucinating while ensuring Grade 1 French Immersion best practices.

## Files

### Core System
- `PerfectLessonTemplate.ts` - Template structure + simple prompt generator (85 words)
- `ActuallyPerfectPrompts.ts` - The final, simplified approach

### Examples & Documentation  
- `ExampleUsage.ts` - Shows the full flow: prompt → AI → validation
- `SIMPLIFIED_APPROACH.md` - Explains the simplification journey
- `COMPLETE_SYSTEM.md` - Overview of the entire system

### Archive
- `archived-overengineered/` - The old 1,500+ line system for reference

## The Template

```typescript
interface LessonPlanTemplate {
  // What we know
  subject: SubjectType;
  unitTitle: string;
  lessonNumber: number;
  
  // What AI generates (no hallucination possible)
  title: string;
  vocabulary: VocabularyItem[]; // Limited by month
  mindsOn: Activity;
  action: Activity;  
  consolidation: Activity;
  materials: string[]; // Standard supplies only
  assessment: AssessmentMethod;
  differentiation: Strategies;
}
```

## Key Constraints

- **Vocabulary:** 3 words (Sept) → 5 words (June)
- **French:** 30% (Sept) → 85% (June)  
- **Duration:** Always 45 minutes (10/30/5 split)
- **Movement:** Required in at least one activity
- **Materials:** Standard classroom supplies only

## Usage

### Step 1: Generate AI Prompt (85 words)
```typescript
import { generateAIPrompt } from './PerfectLessonTemplate';

const prompt = generateAIPrompt(
  'Mathématiques',
  'Les nombres jusqu\'à 10',
  3,  // Lesson 3
  10, // of 10 total
  10  // October
);

// Produces simple prompt:
// "Grade 1 French Immersion Mathématiques lesson for "Les nombres jusqu'à 10" (lesson 3/10).
//  Requirements:
//  - 45 minutes: Opening (≈10 min), Main activity (≈30 min), Closing (≈5 min)
//  - Language: 40% French, max 3 new vocabulary
//  - Include: movement, partner work, visual supports for vocabulary
//  - Materials: standard classroom supplies only
//  Use manipulatives and counting objects.
//  Generate: title, objectives, vocabulary with gestures, three activities, and assessment method.
//  Focus on hands-on learning appropriate for 6-year-olds."
```

### Step 2: Send to AI
Simple constraints prevent hallucination:
- No temporal context to guess
- Clear requirements (vocab, timing, materials)  
- Natural language generation

### Step 3: Validate Response
```typescript
import { validateLesson } from './PerfectLessonTemplate';

const validation = validateLesson(aiGeneratedLesson, 10); // October
if (validation.valid) {
  // Ready for Emily!
}
```

## Why This Works

1. **No temporal context** - No "Friday afternoon" nonsense
2. **Knowable fields only** - Everything can be determined
3. **Structure enforces quality** - Required gestures, movement, visuals
4. **Simple validation** - Easy to check if valid
5. **Emily adds context** - She knows her actual students

## What AI Cannot Hallucinate

With these templates, AI **CANNOT** add:
- ❌ "After lunch, students will be tired..."
- ❌ "Since it's Friday..."  
- ❌ "The 25 students in class..."
- ❌ "Building on yesterday's lesson..."
- ❌ "For the Halloween party..."

AI **MUST** provide:
- ✅ Exact vocabulary count for the month
- ✅ Activities totaling 45 minutes
- ✅ At least one movement activity
- ✅ Only standard materials
- ✅ Observable assessment

## Old System

The previous 1,500+ line system tried to predict unknowable context and induced AI hallucinations. It's archived in `archived-overengineered/` for reference.