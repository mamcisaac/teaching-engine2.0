# 🎯 PARALLEL ENHANCEMENT COORDINATOR - INSTRUCTIONS

## Your Role
You coordinate parallel enhancement agents to process all 50 unit files (975 lessons) with quality assurance. You ensure each agent follows best practices and that QA verification happens.

## System Architecture

```
Phase 1: Knowledge Loading (All Agents)
├── Read ETFO best practices
├── Read pedagogical principles  
└── Internalize "support thinking" philosophy

Phase 2: Parallel Enhancement (10 agents × 5 units each)
├── Agent 1: Arts visuels units 1-5
├── Agent 2: Arts visuels units 6-10
├── Agent 3: Français units 1-5
├── Agent 4: Français units 6-10
├── Agent 5: Mathématiques units 1-5
├── Agent 6: Mathématiques units 6-10
├── Agent 7: Sciences units 1-5
├── Agent 8: Sciences units 6-10
├── Agent 9: Sciences humaines (5 units)
└── Agent 10: Formation personnelle (5 units)

Phase 3: QA Review (5 QA agents)
├── QA Agent 1: Review Arts visuels
├── QA Agent 2: Review Français
├── QA Agent 3: Review Mathématiques
├── QA Agent 4: Review Sciences
└── QA Agent 5: Review Humaines + Formation

Phase 4: Fix & Verify
└── Remediation agents fix issues found by QA
```

## Coordination Instructions

### Phase 1: Knowledge Loading (Sequential)
Each enhancement agent MUST first:
```
1. Read /agent-instructions/ENHANCEMENT_AGENT_INSTRUCTIONS.md
2. Read /scripts/knowledge/best-practices-library.cjs
3. Read /scripts/knowledge/pedagogical-principles.cjs
4. Confirm understanding of "support thinking, not replace it"
```

### Phase 2: Enhancement Distribution

**Agent Assignment:**
```python
assignments = {
    "agent_1": {
        "units": [
            "arts-visuels/premiers-pas-artistiques-full.json",
            "arts-visuels/aventure-lignes-formes-full.json",
            "arts-visuels/magie-couleurs-full.json",
            "arts-visuels/exploration-3d-full.json",
            "arts-visuels/impression-motifs-full.json"
        ],
        "subject": "Arts visuels"
    },
    "agent_2": {
        "units": [
            "arts-visuels/textures-materiaux-full.json",
            "arts-visuels/fetes-hivernales-full.json",
            "arts-visuels/techniques-artistiques-avancees-full.json",
            "arts-visuels/art-environnemental-printanier-full.json",
            "arts-visuels/notre-galerie-art-francaise-full.json"
        ],
        "subject": "Arts visuels"
    },
    # ... etc for all 10 agents
}
```

### Phase 3: QA Process

**QA Distribution:**
- Each QA agent reviews ALL units for their assigned subject
- Reviews must check for patterns across units
- Must use scoring system from QA_AGENT_INSTRUCTIONS.md

### Phase 4: Remediation

For any unit scoring below 80:
1. Create specific remediation instructions
2. Assign remediation agent with exact fixes needed
3. Re-run QA on fixed units

## Parallel Agent Prompt Template

```
You are Enhancement Agent [N] specializing in [SUBJECT].

FIRST, read these required documents:
1. /agent-instructions/ENHANCEMENT_AGENT_INSTRUCTIONS.md
2. /scripts/knowledge/best-practices-library.cjs  
3. /scripts/knowledge/pedagogical-principles.cjs

Your assigned units are:
[LIST OF 5 UNITS]

For EACH unit:
1. Read the entire unit file to understand pedagogical flow
2. For each lesson in the unit:
   - Analyze the specific content and activities
   - Add contextual decision points (0-3, as needed)
   - Specify materials based on actual activities
   - Fix language compliance issues
   - Preserve all original content

3. Save enhanced version as [name]-enhanced.json

Remember: 
- Decision points must be contextual to THAT specific lesson
- Materials must match what students are actually doing
- Some lessons may need 0 decision points (that's fine!)
- Never force enhancements

Report when complete with:
- Number of lessons enhanced
- Number of decision points added
- Number of material specifications improved
- Any issues encountered
```

## Quality Gates

**Before Phase 3:** All enhancement agents must report completion
**Before Phase 4:** All QA scores must be recorded
**Final Gate:** All units must score 80+ or have documented exceptions

## Monitoring Checklist

### During Enhancement Phase:
- [ ] Agents reading required knowledge docs?
- [ ] Agents processing assigned units?
- [ ] Decision points varying by lesson?
- [ ] Materials being specified?

### During QA Phase:
- [ ] QA agents using scoring rubric?
- [ ] Pattern detection across units?
- [ ] Issues being documented?

### During Remediation:
- [ ] Specific fixes being applied?
- [ ] Re-verification happening?
- [ ] Final scores improving?

## Success Metrics

**Minimum Acceptable:**
- 95% of units score 80+
- 0 units with copy-paste decision points
- 100% French learning goals
- Average 1.5 decision points per lesson (not 3!)

**Target Excellence:**
- 100% of units score 85+
- Rich variety in decision points
- Materials specified for actual activities
- Natural, helpful enhancements

## Final Verification

Before declaring complete:
1. Spot-check 10 random lessons across subjects
2. Verify no mechanical patterns
3. Confirm "support thinking" philosophy applied
4. Generate final report with statistics

## Parallel Execution Command

```bash
# Launch all 10 enhancement agents
for i in {1..10}; do
    agent_task "Enhancement Agent $i" \
        --instructions "agent-instructions/ENHANCEMENT_AGENT_INSTRUCTIONS.md" \
        --units "assignments[agent_$i]" \
        --parallel &
done
wait

# Launch 5 QA agents
for subject in "arts" "francais" "math" "sciences" "humaines"; do
    agent_task "QA Agent $subject" \
        --instructions "agent-instructions/QA_AGENT_INSTRUCTIONS.md" \
        --subject "$subject" \
        --parallel &
done
wait
```

Remember: Quality over speed. Better to have thoughtful, contextual enhancements than mechanical replacements.