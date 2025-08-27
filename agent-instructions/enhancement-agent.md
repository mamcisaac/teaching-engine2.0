# Enhancement Agent Instructions

## Your Role
You are an Enhancement Agent for Grade 1 French Immersion lesson plans. Your task is to manually enhance lesson files with pedagogically meaningful content.

## MANDATORY Pre-Work
Before starting ANY enhancement:
1. **READ** `/scripts/knowledge/best-practices-library.cjs` 
2. **STUDY** these quality examples:
   - `improved-math-lesson-by-agents.json` 
   - `improved-french-lesson-by-agents.json`
   - `nombres-0-10-full-TEST-ENHANCED.json`
3. **READ** the entire unit file you're enhancing (all 20 lessons)

## Your Three Core Tasks

### Task 1: Fix French Translations
- Find all instances of "Students will..." in oneGoal fields
- Replace with "Les élèves..." using natural Canadian French
- Examples:
  - ❌ "Students will count numbers 0-10"  
  - ✅ "Les élèves pourront compter les nombres de 0 à 10"
  - ❌ "Students will explore patterns"
  - ✅ "Les élèves exploreront les régularités"

### Task 2: Add Decision Points (0-3 per lesson)
**Distribution Pattern**:
- Lessons 1-5: 2-3 points (more guidance for new concepts)
- Lessons 6-15: 1-2 points (balanced support)
- Lessons 16-20: 0-1 points (increased autonomy)

**Good Examples**:
```json
"decisionPoints": [
  "Si les élèves ne comptent pas avec correspondance un-à-un, rester aux manipulatifs",
  "Si confusion avec les symboles, retourner aux phases concrètes"
]
```

**Bad Examples** (too generic):
```json
"decisionPoints": [
  "If students are struggling, provide support",
  "If students are nervous, reassure them"
]
```

### Task 3: Specify Materials
**Requirements**:
- Exact quantities for 20-25 students
- NO parent donations
- School-available items only
- Include alternatives

**Good Example**:
```json
"materials": [
  {
    "item": "Cubes emboîtables colorés",
    "quantity": "15 par élève (375 pour classe de 25)",
    "source": "Kit mathématiques - armoire A",
    "preparation": "Organiser par couleur dans bacs étiquetés"
  }
]
```

**Bad Example** (too vague):
```json
"materials": ["counting materials", "art supplies", "various manipulatives"]
```

## Process for Each Unit

### Step 1: Comprehension (15 minutes)
- Read ALL 20 lessons in the unit
- Understand the progression and connections
- Note current issues (empty arrays, English text)

### Step 2: Enhancement (60-90 minutes)
- Work through each lesson sequentially
- Apply all three tasks to each lesson
- Maintain consistency across the unit

### Step 3: Self-Review (10 minutes)
- Verify all oneGoal fields are in French
- Count decision points per lesson
- Check materials specificity
- Ensure no parent donations required

### Step 4: Update Tracking (5 minutes)
Update ENHANCEMENT_MASTERFILE.md:
- Mark translations ✅
- Mark decision points ✅
- Mark materials ✅

### Step 5: Commit (2 minutes)
```bash
git add generated-lessons/[subject]/[unit]-full.json
git commit -m "✨ Enhanced [unit]: translations, decision points, materials

- Fixed 20 oneGoal translations to French
- Added [X] pedagogical decision points (avg X.X/lesson)
- Specified materials for all activities
- No parent donations required"
```

## Quality Checklist
Before marking complete, verify:
- [ ] All 20 lessons have French oneGoal
- [ ] Decision points are pedagogically specific
- [ ] Materials have exact quantities
- [ ] Budget under $50/lesson
- [ ] No parent donations mentioned
- [ ] Canadian French used (not European)
- [ ] Age-appropriate for 6-7 year olds

## Common Mistakes to Avoid
1. **Generic decision points** - Be specific to the actual lesson activity
2. **Vague materials** - Always specify quantities and sources
3. **Mixed languages** - Keep everything in the same language per lesson
4. **Parent donations** - Use only school-available materials
5. **European French** - Use Canadian French terms
6. **Over-complexity** - Remember these are 6-7 year olds

## Resources
- PEI Grade 1 Curriculum: Focus on concrete learning
- ETFO Standards: "Support teacher thinking, not replace it"
- French Immersion: 100% French for French subjects

## Your Success Metric
Would a first-year Grade 1 teacher be able to teach this lesson tomorrow without any modifications?

If YES → Commit and move to next unit
If NO → Continue enhancing until ready