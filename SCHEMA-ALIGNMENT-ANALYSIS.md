# Database Schema vs Generation Pipeline Analysis

## Current Misalignments

### Database Schema (ETFOLessonPlan)
```typescript
{
  // Core Fields
  title: string
  date: DateTime
  duration: number
  
  // Three-Part Lesson (STRINGS, not objects)
  mindsOn?: string
  action?: string
  consolidation?: string
  
  // Learning
  learningGoals?: string
  materials?: JSON
  grouping?: string
  
  // Differentiation (JSON fields)
  accommodations?: JSON
  modifications?: JSON
  extensions?: JSON
  differentiationStrategies?: JSON
  
  // Assessment
  assessmentType?: string
  assessmentNotes?: string
  formativeCheckpoints?: JSON
  
  // Engagement
  engagementHooks?: JSON
  interventionStrategies?: JSON
  
  // Substitute Support
  isSubFriendly: boolean
  subNotes?: string
  
  // French Versions
  titleFr?: string
  mindsOnFr?: string
  actionFr?: string
  consolidationFr?: string
  learningGoalsFr?: string
}
```

### Our Generated JSON Structure
```json
{
  "title": "Bonjour tout le monde",
  "oneGoal": "Students will recognize...",
  "vocabulary": {
    "bonjour": "bon-ZHOOR"
  },
  "threeDecisionPoints": {
    "energy": "If high → ...",
    "comprehension": "If understanding → ...",
    "problems": "If silly → ..."
  },
  "simpleActivities": "Greeting circle game...",
  "materials": ["Ball", "Cards"],
  "assessmentChecklist": ["□ Student responds..."],
  "emergencyBackup": "If French isn't working..."
}
```

## Key Misalignments

### 1. Three-Part Lesson Structure
**Problem**: DB expects separate strings for mindsOn, action, consolidation. We generate a single "simpleActivities" field.

**Solution**: Agents should generate explicit three-part structure:
```json
{
  "mindsOn": "Opening (8 min): Greeting circle to activate prior knowledge",
  "action": "Main (27 min): Pass ball, practice greetings with movements",
  "consolidation": "Closing (10 min): Reflection circle, thumbs up/down"
}
```

### 2. Differentiation Strategy Storage
**Problem**: Our "threeDecisionPoints" doesn't map cleanly to DB differentiation fields.

**Better Mapping**:
- `threeDecisionPoints` → `differentiationStrategies` (JSON)
- Energy adaptations → `interventionStrategies` (JSON)
- Comprehension levels → `accommodations` (JSON)
- Problem scenarios → `modifications` (JSON)

### 3. Vocabulary and Pronunciation
**Problem**: No dedicated vocabulary field in DB.

**Solution**: Store in `engagementHooks`:
```json
{
  "vocabulary": {
    "bonjour": "bon-ZHOOR",
    "au revoir": "oh reh-VWAHR"
  },
  "pronunciationGuide": true
}
```

### 4. Assessment Structure
**Problem**: Assessment checklist as array doesn't fit string field.

**Solution**: 
- Checklist → `assessmentNotes` (as multiline string)
- Observable behaviors → `formativeCheckpoints` (JSON)

### 5. Missing French Translations
**Problem**: DB has French fields (titleFr, mindsOnFr, etc.) we don't generate.

**Solution**: Either:
- Generate French translations (complex)
- Leave null for English immersion approach
- Add simple French titles only

## Recommended Pipeline Updates

### 1. Update Design Agent Prompt
```javascript
// Generate lessons with explicit three-part structure
{
  "lessonNumber": 1,
  "title": "Bonjour tout le monde",
  "learningGoals": "Students will recognize and respond to basic greetings",
  "mindsOn": {
    "duration": 8,
    "activity": "Greeting circle with ball passing",
    "materials": ["Ball", "Visual cards"]
  },
  "action": {
    "duration": 27,
    "activities": ["Main greeting practice", "Movement greetings", "Partner work"],
    "materials": ["All materials"]
  },
  "consolidation": {
    "duration": 10,
    "activity": "Reflection and self-assessment",
    "assessment": ["Observable behaviors"]
  }
}
```

### 2. Update Teaching Agent
- Generate proper three-part lesson structure
- Map decision points to correct differentiation fields
- Format assessment as both notes and checkpoints

### 3. Update Import Script
Better field mapping:
```javascript
{
  // Three-part as strings
  mindsOn: lesson.mindsOn.activity + ` (${lesson.mindsOn.duration} min)`,
  action: lesson.action.activities.join('; '),
  consolidation: lesson.consolidation.activity,
  
  // Differentiation as JSON
  differentiationStrategies: lesson.threeDecisionPoints,
  accommodations: extractAccommodations(lesson),
  
  // Assessment properly stored
  assessmentNotes: lesson.assessmentChecklist.join('\n'),
  formativeCheckpoints: lesson.consolidation.assessment,
  
  // Vocabulary in engagement
  engagementHooks: {
    vocabulary: lesson.vocabulary,
    pronunciationSupport: true
  }
}
```

## Impact Assessment

### What Works Well Already
✅ Learning goals map directly
✅ Materials already JSON
✅ Substitute support maps to subNotes
✅ Core structure is compatible

### What Needs Adjustment
⚠️ Three-part lesson needs restructuring
⚠️ Decision points need proper field mapping
⚠️ Assessment needs dual storage
⚠️ Vocabulary needs engagement hooks placement

### What's Missing
❌ French translations
❌ Grade/subject metadata
❌ Curriculum expectation links
❌ Performance opportunities

## Recommendation

**Option 1: Minimal Changes (Recommended)**
- Keep current generation structure
- Update import script to better map fields
- Add three-part activity splitting in import
- Store decision points in differentiationStrategies

**Option 2: Full Alignment**
- Redesign generation to match DB schema exactly
- Generate proper three-part lessons
- Add French translations
- Include all optional fields

**Option 3: Schema Evolution**
- Propose DB schema changes to better match our approach
- Add vocabulary table
- Add decision_points JSON field
- Simplify three-part structure to JSON

## Decision

Given that we already have a working 89% system, I recommend **Option 1: Minimal Changes**. This preserves our validated approach while ensuring proper database storage.

The import script can handle the transformation, keeping our generation system focused on pedagogical quality rather than schema compliance.