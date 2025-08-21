# 🎯 PROMPT REFINEMENTS Based on Critique Analysis

## Consistent Patterns from All Evaluations

After analyzing critiques from French (89%), Math (88%), and Science (92%) units, here are the refinements to incorporate into agent prompts:

## 1. VOCABULARY HANDLING (Critical Issue)

### The Problem:
- Curriculum expectations use complex terms (e.g., "reconnaître", "démontrer", "caractéristiques")
- These are TOO ADVANCED for Grade 1
- BUT we must align with official curriculum

### The Solution:
```
VOCABULARY GUIDANCE:
1. Keep curriculum terms for documentation/alignment
2. Teach using simplified language:
   - "reconnaître" → teach as "voir" (see)
   - "démontrer" → teach as "montrer" (show)
   - "caractéristiques" → teach as "comment c'est" (how it is)
3. Include BOTH in lessons:
   - Official: "Reconnaître des arrangements"
   - Teaching: "Voir des groupes de points"
```

## 2. EXPLICIT LESSON CONNECTIONS

### Add to Design Agent:
```json
{
  "progression": "Builds on Lesson 3's counting skills by adding visual patterns"
}
```

### Add to Teaching Agent:
```json
{
  "mindsOn": {
    "activity": "Review yesterday's numbers 1-3, then introduce 4-5",
    "openingConnection": "Hier, nous avons compté jusqu'à 3..."
  }
}
```

## 3. VISUAL/GESTURAL SUPPORTS (Non-negotiable for Grade 1)

### Every lesson MUST include:
```json
{
  "visualSupports": ["number cards", "hand gestures", "real objects"],
  "tprElements": ["jump for each number", "clap patterns", "finger counting"],
  "nonVerbalOptions": ["point to answer", "show with fingers", "nod/shake head"]
}
```

## 4. WHAT NOT TO CHANGE (Already Perfect)

### Keep These As-Is:
- ✅ `~X min` timing notation (DON'T make verbose)
- ✅ 3 decision points (DON'T add alternatives)
- ✅ ONE clear goal (DON'T complicate)
- ✅ Emergency backup (Already good)
- ✅ isCore true/false (Clear enough)

## 5. REFINED AGENT PROMPTS

### Design Agent Addition:
```
For each lesson include:
"progression": "Explicitly builds on Lesson [X] by [specific connection]"
```

### Teaching Agent Addition:
```
CRITICAL REQUIREMENTS:
1. Vocabulary: Use simple teaching language alongside curriculum terms
2. Connections: Start each lesson referencing previous learning
3. Visuals: EVERY activity needs visual/gestural support for French Immersion
4. Keep timing as "~X min" (this is already perfect)
```

### Critic Agent Addition:
```
EVALUATE but DON'T PENALIZE for:
- Curriculum vocabulary (required by standards)
- ~X min notation (this signals flexibility perfectly)
- 3 decision points (sufficient flexibility)

DO PENALIZE for:
- Missing visual supports for French Immersion
- No explicit lesson connections
- Overcomplicated structure
```

## Implementation Note

These refinements should be added to the base prompts WITHOUT removing the simplicity focus. The goal is to address consistent valid critiques while maintaining the "85% Rule" - we want excellent usable lessons, not theoretical perfection.

Remember: **The best lesson plan is the one that gets used.**