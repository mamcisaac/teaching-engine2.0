# Emily's Lesson Generation System

## 🎯 Overview

This system generates 975 pedagogically perfect lesson plans for Emily McIsaac's Grade 1 French Immersion classroom using a two-agent AI collaboration system.

## 📚 Lesson Requirements

- **Total Lessons**: 975 across the school year
- **Distribution**:
  - Français (Immersion): 195 lessons
  - Mathématiques: 195 lessons
  - Sciences de la nature: 195 lessons
  - Arts visuels: 195 lessons
  - Sciences humaines: 97 lessons
  - Formation personnelle et sociale: 98 lessons

## 🤖 Two-Agent Generation System

The system uses two Claude AI agents working collaboratively:

### Generator Agent
- Creates initial lesson sets based on unit plans and LRP
- Ensures ETFO compliance (8-27-10 minute structure)
- Generates subject-appropriate activities
- Includes complete differentiation

### Critic Agent
- Reviews lessons for perfection
- Checks subject appropriateness (no literacy centers in math!)
- Verifies skill progression
- Ensures French grammar correctness

### Iterative Refinement
```
Generator → Creates lessons
Critic → Reviews and finds issues
Generator → Fixes identified issues
Critic → Verifies improvements
[Repeat until perfect]
```

## 🚀 Usage

### Test with One Unit
```bash
node two-agent-lesson-generator.cjs --test
```

### Generate All 975 Lessons
```bash
node two-agent-lesson-generator.cjs
```

## 📁 File Structure

```
scripts/
├── two-agent-lesson-generator.cjs   # Main generation system
├── initialize-database.cjs          # Database setup with units
└── README.md                         # This file

EMILY-PERFECT-LESSONS/               # Output directory
├── Français_Immersion/              # 195 lessons
├── Mathématiques/                   # 195 lessons
├── Sciences_de_la_nature/           # 195 lessons
├── Arts_visuels/                    # 195 lessons
├── Sciences_humaines/                # 97 lessons
└── Formation_personnelle_et_sociale/ # 98 lessons
```

## ✅ Quality Assurance

Each lesson includes:
- **ETFO Structure**: 8 min Minds On, 27 min Action, 10 min Consolidation
- **Differentiation**: 16 strategies per lesson (4 each for struggling, advanced, ELL, IEP)
- **Assessment**: Diagnostic, formative, and summative strategies
- **French Immersion**: 8-10 vocabulary words, all instruction in French
- **Indigenous Perspectives**: Authentic Mi'kmaq connections
- **Cross-Curricular**: 2 connections per lesson
- **Parent Communication**: Home activity suggestions
- **Safety**: Age-appropriate considerations

## 🔄 Development History

### Phase 1: Mad Libs Templates ❌
- Template-based generation
- Wrong activities for subjects (literacy in math)
- No real progression
- **Status**: DELETED

### Phase 2: Two-Agent System ✅
- Real Claude AI generation
- Subject-appropriate activities
- Progressive skill development
- Iterative refinement to perfection
- **Status**: ACTIVE

## 📊 Expected Results

When run in Claude Code environment with Task tool access:
- 50 units processed
- ~3-5 iterations per unit for perfection
- 975 unique, thoughtful lessons
- 100% ETFO compliance
- 100% subject appropriateness
- Clear skill progression throughout year

## 🛠️ Requirements

- Node.js 18+
- Prisma database with unit plans
- Claude Code environment (for Task tool access)

## 📝 Notes

The two-agent system ensures:
1. No literacy centers in non-French subjects
2. Grammatically correct French throughout
3. Age-appropriate activities for 6-year-olds
4. Progressive skill development
5. Cohesive units that build on each other

## 🎉 Result

975 perfect lesson plans ready for Emily's Grade 1 French Immersion classroom, created through thoughtful AI collaboration rather than template substitution.