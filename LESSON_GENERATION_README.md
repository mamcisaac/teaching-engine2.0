# 📚 Perfect Lesson Generation Pipeline

## Overview
This pipeline generates **production-ready lesson plans** for Grade 1 French Immersion across all subjects. It implements the **85% Rule**: lessons scoring ≥85% are considered perfect for classroom use.

## ✨ Key Features
- **Multi-agent architecture**: Design → Teaching → Critic → (Optional Improvement)
- **Three-part lesson structure**: Minds On (~8 min), Action (~27 min), Consolidation (~10 min)
- **85% Excellence Threshold**: Prevents over-engineering
- **French Immersion optimized**: Visual supports, TPR, silent period respect
- **Substitute-teacher friendly**: Emergency backup plans included

## 📁 Project Structure
```
teaching-engine2.0/
├── generated-lessons/        # All generated lesson plans
│   ├── french/               # French language arts units
│   ├── math/                 # Mathematics units
│   ├── science/              # Natural sciences units
│   ├── arts/                 # Visual arts units (to be generated)
│   ├── health/               # Health/FPS units (to be generated)
│   └── social-studies/       # Social studies units (to be generated)
├── pipeline-docs/            # Pipeline documentation and prompts
│   ├── design-agent-prompt.txt
│   ├── teaching-agent-prompt.txt
│   ├── critic-agent-prompt.txt
│   ├── PERFECT_PIPELINE_PRINCIPLES.md
│   └── PROMPT_REFINEMENTS.md
├── scripts/
│   ├── generate-perfect-unit.js    # Main generation script
│   ├── run-perfect-pipeline.js     # Pipeline orchestration
│   ├── batch-generate-all-units.js # Batch generation for 50 units
│   └── import-lessons-to-db.js     # Database import utilities
└── batch-generation-tracking.json   # Progress tracking

```

## 🚀 Quick Start

### Generate a Single Unit
```bash
# Generate prompts for a specific subject
node scripts/generate-perfect-unit.js math

# Run the full pipeline (requires AI agents)
node scripts/run-perfect-pipeline.js math
```

### Batch Generate All Units
```bash
# Preview what will be generated
node scripts/batch-generate-all-units.js

# Execute batch generation (47 units × 20 lessons = 940 lessons)
node scripts/batch-generate-all-units.js --execute
```

## 📊 Current Status

### ✅ Completed Units (3/50)
| Subject | Unit | Score | Status |
|---------|------|-------|--------|
| Français | Bienvenue en français | 88% | EXCELLENT |
| Mathématiques | Fondations des nombres 0-10 | 88% | EXCELLENT |
| Sciences | Petits scientifiques sécuritaires | 92% | EXCELLENT |

### 📋 Pending Units (47/50)
- **Arts visuels**: 10 units
- **Formation personnelle et sociale**: 5 units  
- **Français (Immersion)**: 9 additional units
- **Mathématiques**: 9 additional units
- **Sciences de la nature**: 9 additional units
- **Sciences humaines**: 5 units

## 🎯 Pipeline Philosophy

### The 85% Rule
> "Perfect is the enemy of good. Units scoring ≥85% are production-ready."

### Key Principles
1. **Simplicity > Sophistication**: Teachers need usable, not perfect
2. **One Goal Per Lesson**: Crystal clear focus
3. **Maximum 3 Decision Points**: Flexibility without overwhelm
4. **Visual Supports Mandatory**: Essential for French Immersion
5. **Real-World Connections**: How people actually use this daily

### Lesson Structure
```json
{
  "lessonNumber": 1-20,
  "title": "Simple French title",
  "oneGoal": "The ONE thing students will learn",
  "isCore": true/false,
  "curriculumAlignment": ["expectation codes"],
  
  "mindsOn": {
    "activity": "Opening with connection to previous",
    "duration": "~8 min",
    "visualSupport": "Required visual elements"
  },
  
  "action": {
    "activities": ["3 main activities"],
    "duration": "~27 min",
    "tprElements": "Movement and physical response"
  },
  
  "consolidation": {
    "activity": "Reflection and assessment",
    "duration": "~10 min",
    "nonVerbalOptions": "Silent period support"
  }
}
```

## 🔧 Technical Details

### Agent Prompts
- **Design Agent**: Creates 20-lesson progression (14 core, 6 extension)
- **Teaching Agent**: Expands to full three-part lessons
- **Critic Agent**: Evaluates on Simplicity (40%), Progression (30%), Authenticity (30%)

### Vocabulary Guidelines
- Maximum 3 new words per lesson
- Curriculum terms spread across multiple lessons
- Simplified teaching language alongside official terms

### Assessment Focus
- Observable behaviors, not perfection
- Comprehension before production
- Non-verbal options throughout

## 📈 Success Metrics
- **Target Score**: 85-92%
- **Maximum Iterations**: 2 (prevent over-engineering)
- **Average Generation Time**: ~5 minutes per unit
- **Success Rate**: 100% (all units ≥85% on first generation)

## 🛠️ Development

### Adding New Units
1. Add unit data to `strategically-perfect-unit-plans.json`
2. Include curriculum expectations
3. Run generation script
4. Verify ≥85% score
5. Import to database if needed

### Customizing Prompts
Edit prompts in `scripts/generate-perfect-unit.js`:
- Adjust vocabulary limits
- Modify decision points
- Add subject-specific requirements

## 📝 Notes
- All lessons are in French for Grade 1 French Immersion
- Designed for 6-7 year olds with 7-8 minute attention spans
- Respects silent period in early language acquisition
- Includes pronunciation guides for all vocabulary
- Emergency backup plans for substitute teachers

## 🎓 Educational Foundation
Based on:
- ETFO best practices (adapted for simplicity)
- PEI curriculum expectations
- French Immersion pedagogy
- Universal Design for Learning principles
- Grade 1 developmental appropriateness

## 📧 Contact
For questions about the pipeline or lesson generation, see the main project documentation.

---

*"The best lesson plan is the one that gets used."*