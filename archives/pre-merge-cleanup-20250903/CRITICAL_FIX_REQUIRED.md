# 🔴 CRITICAL FIXES REQUIRED: Action Plan for True Curriculum Excellence

## Priority 1: IMMEDIATE FIXES (Blocking Issues)

### A. Fix 94 English Decision Points → French
**Files affected:** 9 files with English contamination
```bash
# Files to fix:
generated-lessons/francais/poesie-et-rythmes-full.json (17 instances)
generated-lessons/sciences/croissance-besoins-full.json (9 instances)  
generated-lessons/arts-visuels/magie-couleurs-full.json (16 instances)
generated-lessons/sciences/environnement-partage-full.json (21 instances)
# ... and 5 more
```
**Fix:** Convert all to French with proper "Si... → Alors..." format

### B. Fix 480 JSON Structure Errors
**Issue:** Using "moment" instead of "question" field
```json
// WRONG:
"moment": "Si un élève..."

// RIGHT:
"question": "Si un élève...?"
```
**Files:** 6 files with 480 total errors

### C. Complete Cut-off Content
**Issue:** Many decision points missing ifYes/ifNo
**Fix:** Complete all partial sentences and responses

## Priority 2: VOCABULARY COMPLIANCE

### Must Remove/Replace:
| Current (WRONG) | Replace With (RIGHT) | Reason |
|----------------|---------------------|---------|
| grand-maman, grand-papa | mémère, pépère | Too complex phonetically |
| aide-moi | aide | Simpler for Grade 1 |
| communiquer nos pensées | parler français | Too abstract |
| structures familiales | ma famille | Too complex concept |
| identifieront | trouvent | Complex verb form |
| démontreront | montrent | Too advanced |

### Vocabulary Load Fixes:
- **Current:** 10+ words per lesson
- **Required:** 3-5 words maximum
- **Action:** Split vocabulary across multiple lessons

## Priority 3: DIFFERENTIATION QUALITY

### Replace ALL Generic Phrases:
```json
// REMOVE this meaningless boilerplate:
"Adapter selon les besoins individuels du plan éducatif"

// REPLACE with specific strategies like:
"Pour les élèves qui ont de la difficulté avec les sons /u/ et /ou/, 
utiliser des miroirs pour montrer la forme de la bouche"
```

### Required for Each Differentiation:
1. **Specific** challenge addressed
2. **Concrete** strategy or modification  
3. **Measurable** success indicator
4. **Materials** needed for support

## Priority 4: ASSESSMENT AUTHENTICITY

### Current Problems:
- Generic "observe and document"
- No specific success criteria
- Vague formative assessments

### Required Improvements:
```json
// WRONG:
"observable": ["Student participates"]

// RIGHT:
"observable": [
  "L'élève compte de 1 à 5 en français sans aide",
  "L'élève pointe correctement 3 couleurs nommées",
  "L'élève utilise 'j'ai' et 'tu as' en contexte"
]
```

## Priority 5: CULTURAL SENSITIVITY

### Family Units Must Acknowledge:
- Single-parent families
- Grandparent-raised children
- Foster families
- Same-sex parents
- Extended family structures

### Indigenous Perspectives:
- Currently superficial or missing
- Need authentic integration
- Consult PEI Mi'kmaq resources

## Implementation Timeline

### Day 1 (8 hours) - CRITICAL
- [ ] Fix all English decision points (3 hours)
- [ ] Fix JSON structure errors (2 hours)
- [ ] Complete cut-off content (3 hours)

### Day 2 (8 hours) - VOCABULARY
- [ ] Replace complex vocabulary (4 hours)
- [ ] Reduce vocabulary lists to 3-5 words (4 hours)

### Day 3 (8 hours) - QUALITY
- [ ] Rewrite differentiation strategies (4 hours)
- [ ] Create specific assessments (4 hours)

### Day 4 (4 hours) - POLISH
- [ ] Cultural sensitivity review (2 hours)
- [ ] Final testing and validation (2 hours)

## Testing Checklist

### Language Validation:
```bash
# No English should remain:
grep -r "Are students\|Should I\|Do students" generated-lessons/
# Should return: 0 results
```

### Structure Validation:
```bash
# No "moment" fields should exist:
grep -r '"moment":' generated-lessons/
# Should return: 0 results
```

### Vocabulary Validation:
```bash
# No complex terms should remain:
grep -r "grand-maman\|grand-papa\|aide-moi" generated-lessons/
# Should return: 0 results
```

## Success Criteria

A truly perfect curriculum will have:
1. ✅ 100% French language consistency
2. ✅ Age-appropriate vocabulary (3-5 words/lesson)
3. ✅ Specific, helpful differentiation strategies
4. ✅ Measurable assessment criteria
5. ✅ Consistent JSON structure
6. ✅ Cultural sensitivity and inclusivity
7. ✅ Natural Canadian French patterns
8. ✅ ETFO best practices throughout

## The Bottom Line

**Current State:** Structurally complete but educationally compromised
**Required Work:** 28 hours of focused quality improvement
**Priority:** CRITICAL - Cannot be used in current state

**This is the difference between:**
- Claiming completion ❌
- Achieving excellence ✅

Emily and her students deserve true excellence, not rushed completion.

---
*Critical Fix Plan Created*
*Estimated Time: 28 hours*
*Priority: IMMEDIATE*