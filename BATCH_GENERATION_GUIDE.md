# 🚀 Complete Batch Generation Guide for Emily's Teaching System

## Overview
This system generates **977 lessons across 50 units** for Emily's Grade 1 French Immersion classroom, covering all subjects for the entire school year.

## 📊 Lesson Distribution (977 Total)

### Daily Subjects (195 lessons each)
- **Français (Immersion)**: 10 units × ~19-20 lessons
- **Mathématiques**: 10 units × ~19-20 lessons  
- **Sciences de la nature**: 10 units × ~19-20 lessons
- **Arts visuels**: 10 units × ~19-20 lessons

### Alternating Subjects
- **Sciences humaines**: 5 units × ~19-20 lessons = 97 total
- **Formation personnelle et sociale**: 5 units × 20 lessons = 100 total

## 🎯 Key Features

### Dynamic Lesson Extraction
- Automatically extracts lesson counts from unit descriptions
- Respects core/extension splits defined in unit plans
- Calculates from hours when lesson count not explicit
- Maintains subject-specific distributions

### Three-Agent Pipeline
1. **Design Agent**: Creates lesson progression with explicit connections
2. **Teaching Agent**: Expands to three-part structure (Minds On/Action/Consolidation)
3. **Critic Agent**: Evaluates using 85% Rule (Simplicity/Progression/Authenticity)

### Quality Assurance
- All units target 85%+ score
- Maximum 2 iterations (prevents over-engineering)
- Vocabulary limited to 3 words per lesson
- Visual supports mandatory for French Immersion
- Real-world connections included

## 🛠️ Running the System

### Step 1: Extract Unit Details
```bash
node scripts/extract-unit-details.js
```
This creates `unit-details-extracted.json` with:
- Accurate lesson counts per unit
- Core/extension splits
- Curriculum expectations
- Essential questions

### Step 2: Run Batch Generation (Demo Mode)
```bash
node scripts/batch-generate-complete.js
```
Currently in DEMO MODE - generates structure and one example unit.

### Step 3: Full Generation (Production)
To generate ALL units with real AI agents:
1. Edit `scripts/batch-generate-complete.js`
2. Set `DEMO_MODE = false`
3. Implement actual AI agent calls
4. Run the script (will take ~4 hours)

## 📁 Output Structure
```
generated-lessons/
├── français-immersion/
│   ├── bienvenue-en-français-design.json
│   ├── bienvenue-en-français-lessons.json
│   ├── bienvenue-en-français-evaluation.json
│   └── ... (9 more units)
├── mathématiques/
│   ├── fondations-des-nombres-0-10-design.json
│   ├── fondations-des-nombres-0-10-lessons.json
│   ├── fondations-des-nombres-0-10-evaluation.json
│   └── ... (9 more units)
├── sciences-de-la-nature/
│   └── ... (10 units)
├── arts-visuels/
│   └── ... (10 units)
├── sciences-humaines/
│   └── ... (5 units)
└── formation-personnelle-et-sociale/
    └── ... (5 units)
```

## 📈 Progress Tracking

### Completed Units (3/50)
- ✅ Bienvenue en français (20 lessons) - 88%
- ✅ Fondations des nombres 0-10 (20 lessons) - 88%
- ✅ Petits scientifiques sécuritaires (20 lessons) - 92%

### Pending Units (47/50)
- 🔄 10 Arts units (195 lessons)
- 🔄 5 Health/FPS units (100 lessons)
- 🔄 9 French units (175 lessons)
- 🔄 9 Math units (175 lessons)
- 🔄 9 Science units (175 lessons)
- 🔄 5 Social Studies units (97 lessons)

## 🎨 Unit Examples

### Arts visuels
```json
{
  "title": "Premiers pas artistiques",
  "lessonCount": 20,
  "coreCount": 14,
  "extensionCount": 6,
  "expectations": ["1AV.1", "1AV.2"]
}
```

### Formation personnelle et sociale
```json
{
  "title": "Mon corps et ma sécurité",
  "lessonCount": 20,
  "coreCount": 14,
  "extensionCount": 6,
  "safetyProtocols": "Emotional safety environment"
}
```

## ⚡ Implementation Notes

### For AI Agent Integration
When implementing actual AI agents:

1. **Design Agent Prompt**: Include unit-specific lesson count
```javascript
const prompt = `Create ${unit.lessonCount} lesson progression 
(${unit.coreCount} core, ${unit.extensionCount} extension)...`;
```

2. **Teaching Agent**: Respect three-part structure
3. **Critic Agent**: Apply 85% Rule strictly

### Time Estimates
- Design Agent: ~1 minute per unit
- Teaching Agent: ~2 minutes per unit
- Critic Agent: ~30 seconds per unit
- Improvement (if needed): ~2 minutes per unit
- **Total**: ~5 minutes per unit × 47 units = ~4 hours

## 🎯 Final Deliverable

When complete, Emily will have:
- **977 lessons** perfectly aligned with PEI curriculum
- **50 units** covering entire Grade 1 year
- **6 subjects** all taught in French
- **195 school days** fully planned
- **85%+ quality** on all units

## 🚦 Next Steps

1. **Verify** unit details extraction is accurate
2. **Test** with one complete subject (e.g., Arts)
3. **Run** full batch generation
4. **Import** to database if needed
5. **Deliver** to Emily for the perfect teaching year!

---

*"The best lesson plan is the one that gets used" - and with 977 ready-to-use lessons, Emily's entire year is planned!*