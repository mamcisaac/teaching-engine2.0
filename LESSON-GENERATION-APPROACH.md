# Lesson Generation Approach - Teaching Engine 2.0

## Overview
This document describes the multi-agent lesson generation system for Emily McIsaac's Grade 1 French Immersion classroom, designed to create 975 lessons across 50 units in 6 subjects.

## Current Approach: Simplified Pedagogy with Unit Coherence

### Core Principles
1. **ONE clear learning goal per lesson** - Focus on what matters most
2. **Maximum 3 decision points** - Manageable cognitive load for teachers
3. **Teacher thinking support** - Guide decisions, don't script actions
4. **Unit-based generation** - Create coherent progressions, not isolated lessons

### Agent Architecture

#### 1. Design Agent
- Creates progression map for entire unit
- Ensures vocabulary spirals and skills build incrementally
- Respects Grade 1 constraints (7-8 minute attention spans, 3-5 new words/lesson)

#### 2. Teaching Agent
- Transforms design into complete lessons
- Provides if-then decision guidance
- Includes pronunciation guides for all French vocabulary
- Creates emergency backup plans for non-French speakers

#### 3. Critic Agent
- Evaluates unit coherence and progression
- Verifies simplicity and usability
- Ensures substitute teacher accessibility
- Provides actionable improvement feedback

#### 4. Improvement Agent
- Addresses critic feedback systematically
- Refines lessons based on evaluation
- Ensures all requirements are met

## Key Features of Generated Lessons

### Essential Components
Each lesson includes:
- **One clear goal** - Single focused learning objective
- **Vocabulary with pronunciation** - e.g., "bonjour": "bon-ZHOOR"
- **Three decision points**:
  - Energy level response
  - Comprehension adjustment
  - Problem management
- **Simple activities** - Not scripted instructions
- **Minimal materials** - Classroom objects, no special resources
- **Assessment checklist** - 3 observable behaviors
- **Emergency backup** - Zero-French-required alternative

### Example Structure
```json
{
  "lessonNumber": 1,
  "title": "Bonjour tout le monde",
  "oneGoal": "Students will recognize and respond to basic greetings",
  "vocabulary": {
    "bonjour": "bon-ZHOOR",
    "au revoir": "oh reh-VWAHR"
  },
  "threeDecisionPoints": {
    "energy": "If high → movement; If low → quiet; If mixed → split",
    "comprehension": "If understanding → add more; If confused → repeat",
    "problems": "If silly → make it game; If tears → comfort"
  },
  "assessmentChecklist": [
    "□ Student responds to 'bonjour'",
    "□ Student attempts greeting",
    "□ Student engages with activity"
  ],
  "emergencyBackup": "Play Simon Says in English, model French between rounds"
}
```

## Unit Structure Requirements

### Lesson Distribution (Total: 975)
- **Français (Immersion)**: 195 lessons (10 units, 19-20 lessons each)
- **Mathématiques**: 195 lessons (10 units, 19-20 lessons each)
- **Sciences de la nature**: 195 lessons (10 units, 19-20 lessons each)
- **Arts visuels**: 192 lessons (10 units, 16-20 lessons each)
- **Sciences humaines**: 96 lessons (5 units, 17-20 lessons each)
- **Formation personnelle et sociale**: 99 lessons (5 units, 19-21 lessons each)

### Progression Phases
1. **Activation (25% of unit)**: Introduction, exploration, heavy scaffolding
2. **Development (50% of unit)**: Practice, gradual release, peer interaction
3. **Consolidation (25% of unit)**: Application, demonstration, celebration

## Best Practices Integration

### Simplified from ETFO Requirements
- **Original**: 8-27-10 minute rigid structure → **Now**: Flexible time brackets
- **Original**: 16 differentiation strategies → **Now**: 3 adaptive decision points
- **Original**: Scripted paths → **Now**: Teacher thinking support

### Grade 1 Specific Considerations
- 7-8 minute attention spans
- Concrete materials essential
- Movement every 10 minutes
- French immersion silent period respected
- Heavy visual and gesture support

## System Performance

### Current Status
- **Completed**: "Bienvenue en français" unit (20 lessons)
- **Score**: 89/100 on evaluation criteria
- **Key Success**: Passes substitute teacher test
- **Improvement**: From 35% "sophisticated theater" to 89% practical support

### Evaluation Criteria
1. **Simplicity** (40%): One goal, 3 decisions, substitute-friendly
2. **Progression** (30%): Coherent unit flow, vocabulary spiraling
3. **Authenticity** (30%): Real flexibility, teacher support

## Implementation Process

### To Generate a Unit:
1. Load unit plan data (title, duration, expectations)
2. Run Design Agent to create progression map
3. Run Teaching Agent to generate all lessons
4. Run Critic Agent to evaluate
5. Run Improvement Agent if needed
6. Save to database (not JSON files)

### Files Structure
```
/scripts/
  ├── knowledge/best-practices-library.cjs  # Best practices and standards
  ├── generate-perfect-unit.js              # Unit generation orchestrator
  ├── design-agent-prompt.txt               # Design agent instructions
  ├── teaching-agent-prompt.txt             # Teaching agent instructions
  └── critic-agent-prompt.txt               # Critic agent instructions

/output/
  ├── unit-progression-map.json             # Lesson progression design
  ├── bienvenue-unit-lessons.json          # Initial generated lessons
  ├── bienvenue-unit-IMPROVED.json         # Final improved lessons
  └── unit-critique.md                      # Evaluation feedback
```

## Next Steps

### Immediate Priorities
1. Generate remaining 49 units using established approach
2. Integrate with database for proper storage
3. Create subject-specific adaptations for Math, Science, Arts

### Future Enhancements
1. Automated curriculum alignment verification
2. Parent communication materials generation
3. Cross-curricular connection identification
4. Digital resource integration

## Conclusion

The system successfully generates pedagogically sound, teacher-friendly lessons that:
- Support real classroom teaching
- Accommodate substitute teachers
- Provide practical assessment tools
- Build coherent unit progressions

With an 89% evaluation score, the approach is ready for full-scale implementation across all 975 lessons Emily needs for her Grade 1 French Immersion classroom.