# Visual Supports Field Analysis

## Summary
The `visualSupports` field has been **RETAINED** in the curriculum JSON files because it contains valuable pedagogical content that could enhance the teaching experience if rendered in the application.

## Current Status
- **47 files** have meaningful visual support content (good quality French descriptions)
- **16 files** have empty visual support fields (341 empty instances total)
- **Field location**: Within each lesson section (opening, main, closing)
- **Application usage**: Currently NOT rendered anywhere (ghost field)

## Content Quality Assessment

### Examples of Valuable Content:
```json
"visualSupports": "Cartes visuelles avec visages expressifs, gestuelle TPR pour chaque émotion, expressions faciales exagérées de l'enseignant(e)"

"visualSupports": "Silhouette corporelle affichée, gestes pour localiser cœur et ventre, démonstrations avec Émilie"

"visualSupports": "Arc-en-ciel visuel des émotions, cartes colorées organisées, geste d'acceptation (mains sur le cœur)"
```

### Value Proposition:
1. **Specific TPR guidance** - Total Physical Response gestures for French immersion
2. **Visual aid descriptions** - Clear guidance on what visual supports to prepare
3. **Demonstration notes** - How to model concepts visually for Grade 1 learners
4. **Emotional/physical cues** - Important for young learners' comprehension

## Recommendation

### Short Term (Current):
- ✅ **KEEP** the field - no harm in having it, adds no significant file size
- ✅ **DON'T FILL** empty ones - avoid busywork
- ✅ **PRESERVE** existing content - it's pedagogically valuable

### Long Term (Future Enhancement):
Consider adding visual supports rendering to the application:
1. Add a "Visual Supports" section in lesson view
2. Display these as teacher guidance tips
3. Could be toggled on/off based on teacher preference
4. Especially valuable for:
   - New teachers
   - Substitute teachers
   - French immersion context where visual support is critical

## Files with Best Visual Support Content:
1. `formation-personnelle/emotions-sentiments-full.json` - Excellent emotional/gestural guidance
2. `francais/bienvenue-full.json` - Good TPR and visual vocabulary supports
3. `sciences/petits-scientifiques-full.json` - Clear demonstration guidance

## Technical Notes:
- Field is optional (can be empty string)
- No schema enforcement needed
- No application changes required currently
- Could be easily added to UI in future sprint

## Decision: RETAINED ✅
The field stays because:
1. Contains valuable content in 47/50 files
2. Could enhance teaching if rendered
3. No maintenance burden
4. No negative impact on file size or performance

---
*Analysis Date: August 29, 2025*  
*Decision: Field retained for future value*