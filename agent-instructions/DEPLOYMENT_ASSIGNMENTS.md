# 🚀 FULL DEPLOYMENT: Agent Assignments for 50 Units

## Test Results: SUCCESS ✅
- **Test Unit**: nombres-0-10 
- **QA Score**: 85/100
- **Key Success**: Only 20% of lessons needed decision points (not forced)
- **Decision**: PROCEED WITH FULL DEPLOYMENT

## Deployment Strategy
10 parallel enhancement agents processing 5 units each, followed by 5 QA agents reviewing by subject.

## Enhancement Agent Assignments

### Agent 1: Arts Visuels (Units 1-5)
```
Units to enhance:
1. arts-visuels/premiers-pas-artistiques-full.json
2. arts-visuels/aventure-lignes-formes-full.json  
3. arts-visuels/magie-couleurs-full.json
4. arts-visuels/exploration-3d-full.json
5. arts-visuels/impression-motifs-full.json
```

### Agent 2: Arts Visuels (Units 6-10)
```
Units to enhance:
6. arts-visuels/textures-materiaux-full.json
7. arts-visuels/fetes-hivernales-full.json
8. arts-visuels/techniques-artistiques-avancees-full.json
9. arts-visuels/art-environnemental-printanier-full.json
10. arts-visuels/notre-galerie-art-francaise-full.json
```

### Agent 3: Français (Units 1-5)
```
Units to enhance:
1. francais/bienvenue-full.json
2. francais/explorateurs-de-mots-full.json
3. francais/famille-full.json
4. francais/histoires-automne-full.json
5. francais/communication-creative-full.json
```

### Agent 4: Français (Units 6-10)
```
Units to enhance:
6. francais/celebrations-dhiver-full.json
7. francais/jeunes-auteurs-creatifs-full.json
8. francais/poesie-et-rythmes-full.json
9. francais/exploration-de-textes-full.json
10. francais/notre-annee-francaise-full.json
```

### Agent 5: Mathématiques (Units 1-5)
```
Units to enhance:
1. mathematiques/nombres-0-10-full.json (SKIP - already enhanced as test)
2. mathematiques/nombres-11-20-full.json
3. mathematiques/addition-jusqua-10-full.json
4. mathematiques/soustraction-full.json
5. mathematiques/formes-2d-full.json
```

### Agent 6: Mathématiques (Units 6-10)
```
Units to enhance:
6. mathematiques/comparaison-full.json
7. mathematiques/mesure-non-standard-full.json
8. mathematiques/regularites-et-relations-full.json
9. mathematiques/strategies-calcul-full.json
10. mathematiques/egalite-celebration-full.json
```

### Agent 7: Sciences (Units 1-5)
```
Units to enhance:
1. sciences/petits-scientifiques-full.json
2. sciences/changements-saisonniers-full.json
3. sciences/croissance-besoins-full.json
4. sciences/materiaux-full.json
5. sciences/forces-mouvements-full.json
```

### Agent 8: Sciences (Units 6-10)
```
Units to enhance:
6. sciences/sons-vibrations-full.json
7. sciences/lumiere-chaleur-full.json
8. sciences/environnement-partage-full.json
9. sciences/eveil-printemps-full.json
10. sciences/exposition-finale-full.json
```

### Agent 9: Sciences Humaines (5 units)
```
Units to enhance:
1. sciences-humaines/moi-et-mon-ecole-full.json
2. sciences-humaines/ma-famille-et-mon-foyer-full.json
3. sciences-humaines/notre-communaute-automnale-full.json
4. sciences-humaines/notre-quartier-et-voisinage-full.json
5. sciences-humaines/celebrations-traditions-hivernales-full.json
```

### Agent 10: Formation Personnelle (5 units)
```
Units to enhance:
1. formation-personnelle/corps-securite-full.json
2. formation-personnelle/emotions-sentiments-full.json
3. formation-personnelle/amities-full.json
4. formation-personnelle/nutrition-et-mode-de-vie-sain-full.json
5. formation-personnelle/grandir-full.json
```

## QA Agent Assignments (Phase 2)

### QA Agent 1: Review All Arts Visuels
- Review 10 enhanced units from Agents 1-2
- Sample 5 lessons per unit
- Score using 100-point rubric

### QA Agent 2: Review All Français
- Review 10 enhanced units from Agents 3-4
- Sample 5 lessons per unit
- Score using 100-point rubric

### QA Agent 3: Review All Mathématiques
- Review 10 enhanced units from Agents 5-6
- Sample 5 lessons per unit
- Score using 100-point rubric

### QA Agent 4: Review All Sciences
- Review 10 enhanced units from Agents 7-8
- Sample 5 lessons per unit
- Score using 100-point rubric

### QA Agent 5: Review Humaines + Formation
- Review 10 enhanced units from Agents 9-10
- Sample 5 lessons per unit
- Score using 100-point rubric

## Critical Instructions for All Agents

### Enhancement Agents MUST:
1. Read `/agent-instructions/ENHANCEMENT_AGENT_INSTRUCTIONS.md`
2. Read `/scripts/knowledge/best-practices-library.cjs`
3. Read `/scripts/knowledge/pedagogical-principles.cjs`
4. Understand "support thinking, not replace it"
5. Add decision points ONLY where genuinely helpful (0-3 per lesson)
6. Specify materials based on actual activities
7. Fix language compliance issues
8. Preserve all original content

### QA Agents MUST:
1. Read `/agent-instructions/QA_AGENT_INSTRUCTIONS.md`
2. Use the 100-point scoring rubric
3. Check for red flags (copy-paste, forced enhancements)
4. Verify contextual relevance
5. Create detailed QA reports

## Expected Outcomes

Based on test results:
- ~20% of lessons should have decision points (not 100%!)
- Decision points should be contextually specific
- Materials should match actual activities
- Scores should be 80-90 range
- No copy-paste patterns detected

## Timeline

**Phase 1**: Enhancement (4 hours)
- Hour 1: Agents read knowledge docs
- Hours 2-4: Process assigned units

**Phase 2**: QA Review (2 hours)
- Sample and score enhanced units

**Phase 3**: Remediation (1 hour)
- Fix any units scoring <80

**Total**: 7 hours for complete enhancement of 975 lessons

## Success Metrics

✅ All 50 units enhanced
✅ Average QA score >80
✅ No mechanical patterns detected
✅ Appropriate restraint (not all lessons enhanced)
✅ Teachers supported, not scripted