# ETFO Assessment Generation Template

## CRITICAL INSTRUCTIONS FOR AGENTS

You are a pedagogical expert generating Grade 1 French Immersion assessments following ETFO best practices.

### YOUR TASK
Generate detailed, pedagogically-sound assessment criteria for lessons in your assigned unit. 

### INPUT DATA LOCATION
Database: `/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/prisma/dev.db`

### WHAT YOU MUST DO

1. **Query your assigned lessons** using this SQL:
```sql
SELECT 
  e.id,
  e.title,
  e.learningGoals,
  e.lessonNumber,
  u.title as unit_title,
  l.subject
FROM ETFOLessonPlan e
JOIN UnitPlan u ON e.unitPlanId = u.id
JOIN LongRangePlan l ON u.longRangePlanId = l.id
WHERE u.title = '[YOUR_ASSIGNED_UNIT]'
  AND (e.assessmentNotes = 'Observation continue' OR e.assessmentNotes IS NULL OR e.assessmentNotes = '')
ORDER BY e.lessonNumber;
```

2. **For each lesson**, also query its curriculum expectations:
```sql
SELECT c.code, c.description
FROM ETFOLessonPlanExpectation lpe
JOIN CurriculumExpectation c ON lpe.expectationId = c.id
WHERE lpe.lessonPlanId = '[LESSON_ID]';
```

3. **Generate assessment criteria** based on:
   - The lesson title and learning goals
   - Linked curriculum expectations
   - Subject-specific assessment needs
   - Grade 1 developmental appropriateness

### ASSESSMENT STRUCTURE

For each lesson, create JSON with:
- **observable**: 3-5 specific, measurable behaviors aligned with learning goals
- **checkpoints**: 2-3 clear milestones for tracking progress

Example format:
```json
{
  "observable": [
    "L'élève utilise correctement les manipulatifs pour représenter l'addition",
    "L'élève peut expliquer sa stratégie de comptage",
    "L'élève reconnaît les symboles + et = dans les équations"
  ],
  "checkpoints": [
    "Représente l'addition avec des objets concrets",
    "Résout des problèmes d'addition jusqu'à 10"
  ]
}
```

### ETFO ASSESSMENT PRINCIPLES

1. **Formative Focus**: Emphasize ongoing observation and feedback
2. **Developmentally Appropriate**: Match Grade 1 cognitive and physical abilities
3. **Observable Behaviors**: Use action verbs (demonstrates, identifies, uses, explains)
4. **Clear Milestones**: Define specific, achievable checkpoints
5. **French Language**: All assessments in French for immersion context
6. **Inclusive**: Consider diverse learners and multiple ways to demonstrate understanding

### OUTPUT FORMAT

Create a SQL script file named `assessments-[unit-name].sql` containing UPDATE statements:

```sql
-- Assessment for lesson: [title]
UPDATE ETFOLessonPlan 
SET assessmentNotes = '{"observable":["behavior1","behavior2","behavior3"],"checkpoints":["milestone1","milestone2"]}',
    assessmentType = 'formative'
WHERE id = '[lesson_id]';
```

### QUALITY REQUIREMENTS

- Each observable behavior must directly relate to the learning goals
- Checkpoints must be measurable and specific
- Language must be clear and professional
- Assessments must align with curriculum expectations
- Consider multiple intelligences and learning styles

### DO NOT

- Use generic phrases like "Observation continue"
- Create vague or unmeasurable criteria
- Ignore the specific learning goals of each lesson
- Copy assessments between lessons without adaptation
- Use English in the assessment criteria