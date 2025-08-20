# Lesson Plan Templates

Clean template system for AI-generated Grade 1 French Immersion lessons that prevents hallucination.

## The System

**One file:** `PerfectLessonTemplate.ts`

### Template Structure
```typescript
interface LessonPlanTemplate {
  // Context (from unit plan)
  subject: SubjectType;
  unitTitle: string;
  lessonNumber: number;
  
  // AI generates
  title: string;
  vocabulary: VocabularyItem[];  // Limited by month
  mindsOn: Activity;             // ~10 minutes
  action: Activity;              // ~30 minutes  
  consolidation: Activity;       // ~5 minutes
  materials: string[];           // Standard supplies only
  assessment: Method;
  differentiation: Strategies;
}
```

### AI Prompt Generator (85 words)
```typescript
import { generateAIPrompt } from './PerfectLessonTemplate';

const prompt = generateAIPrompt(
  'Mathématiques',
  'Les nombres jusqu\'à 10',
  3,  // Lesson 3
  10, // of 10
  10  // October
);
```

Produces:
```
Grade 1 French Immersion Mathématiques lesson for "Les nombres jusqu'à 10" (lesson 3/10).

Requirements:
- 45 minutes: Opening (≈10 min), Main activity (≈30 min), Closing (≈5 min)
- Language: 40% French, max 3 new vocabulary
- Include: movement, partner work, visual supports for vocabulary
- Materials: standard classroom supplies only

Use manipulatives and counting objects.

Generate: title, objectives, vocabulary with gestures, three activities, and assessment method.

Focus on hands-on learning appropriate for 6-year-olds.
```

## Key Constraints

| Month | Max Vocabulary | French % |
|-------|---------------|----------|
| Sept  | 3 words       | 30%      |
| Oct   | 3 words       | 40%      |
| Nov   | 4 words       | 50%      |
| Dec   | 4 words       | 60%      |
| Jan   | 4 words       | 65%      |
| Feb   | 5 words       | 70%      |
| Mar   | 5 words       | 75%      |
| Apr   | 5 words       | 80%      |
| May   | 5 words       | 85%      |
| June  | 5 words       | 85%      |

## Why It Works

✅ **Prevents hallucination:**
- No temporal context fields
- No class size assumptions
- No energy level predictions
- No schedule dependencies

✅ **Enforces best practices:**
- Required movement breaks
- Partner work not whole-class
- Visual supports for vocabulary
- Standard materials only

✅ **Simple and effective:**
- 85-word prompts
- ~300 lines of code total
- Easy validation
- Clean AI output

## Usage

1. **Generate prompt** with unit context and month
2. **Send to AI** (Claude, GPT-4, etc.)
3. **Validate** vocabulary count and requirements
4. **Emily contextualizes** for her actual classroom

## Archives

- `archived-iterations/` - Development journey
- `archived-overengineered/` - Original 1,500+ line system

---

**Result:** AI generates solid lesson skeletons without hallucinating context that doesn't exist.