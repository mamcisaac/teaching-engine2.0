# 🧪 TEST CASE: Single Unit Enhancement & QA

## Objective
Test the enhancement and QA agent system on ONE unit before full deployment.

## Selected Test Unit
`generated-lessons/mathematiques/nombres-0-10-full.json`
- 20 lessons on numbers 0-10
- Clear progression of complexity
- Good variety of activities for testing decision point relevance

## Test Execution Plan

### Step 1: Enhancement Agent Test

**Agent Prompt:**
```
You are a Grade 1 French Immersion expert teacher enhancing lesson plans.

MANDATORY FIRST STEPS:
1. Read /Users/michaelmcisaac/Github/teaching-engine2.0/agent-instructions/ENHANCEMENT_AGENT_INSTRUCTIONS.md
2. Read /Users/michaelmcisaac/Github/teaching-engine2.0/scripts/knowledge/best-practices-library.cjs
3. Read /Users/michaelmcisaac/Github/teaching-engine2.0/scripts/knowledge/pedagogical-principles.cjs

THEN enhance this single unit:
/Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons/mathematiques/nombres-0-10-full.json

For EACH of the 20 lessons:
1. Read and understand what mathematics concept is being taught
2. Identify what specific challenges Grade 1 students might face with THIS concept
3. Add decision points ONLY where they would genuinely help (0-3 per lesson)
4. Specify materials based on what students are actually doing in the activity
5. Fix any French language issues in learning goals

Example of GOOD decision points for a lesson on counting 0-3:
- "Si confusion entre 0 et lettre O → montrer que 0 représente 'rien' avec mains vides"
- "Si difficulté avec correspondence un-à-un → ralentir et pointer chaque objet"

Example of BAD decision points:
- "Si les élèves ont des difficultés → les aider" (too generic!)
- "Si problème → simplifier" (not specific!)

Save your enhanced version as: nombres-0-10-full-TEST-ENHANCED.json

Report:
- How many lessons genuinely needed 0, 1, 2, or 3 decision points
- What patterns you noticed in material needs
- Any language fixes applied
```

### Step 2: QA Agent Test

**QA Agent Prompt:**
```
You are a senior pedagogical reviewer checking enhancement quality.

FIRST, read:
1. /Users/michaelmcisaac/Github/teaching-engine2.0/agent-instructions/QA_AGENT_INSTRUCTIONS.md
2. Original: /Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons/mathematiques/nombres-0-10-full.json
3. Enhanced: /Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons/mathematiques/nombres-0-10-full-TEST-ENHANCED.json

Review lessons 1, 5, 10, 15, and 20 in detail.

CHECK FOR:
1. Are decision points contextual to the specific math concepts?
2. Do materials match the actual counting/number activities?
3. Is there variety across lessons (not copy-paste)?
4. Are some lessons left with 0 decision points if appropriate?

SCORE using the 100-point rubric:
- Decision Point Quality: __/40
- Material Specifications: __/30  
- Language Compliance: __/20
- Preservation of Original: __/10
- TOTAL: __/100

FLAG any of these RED FLAGS:
- Same decision points repeated
- Generic materials remaining
- Forced 3 decision points everywhere
- English in learning goals

Create a report: QA_REPORT_nombres-0-10.md
```

### Step 3: Remediation Test (if needed)

If QA score < 80, test remediation:

**Remediation Agent Prompt:**
```
The enhanced unit scored [SCORE]/100 with these issues:
[SPECIFIC ISSUES FROM QA REPORT]

Fix ONLY the identified issues in:
/Users/michaelmcisaac/Github/teaching-engine2.0/generated-lessons/mathematiques/nombres-0-10-full-TEST-ENHANCED.json

Specific fixes needed:
1. [Fix from QA report]
2. [Fix from QA report]

Save corrected version as: nombres-0-10-full-REMEDIATED.json
```

## Success Criteria

The test is successful if:

✅ **Enhancement Agent:**
- Produces varied decision points based on lesson content
- Some lessons have 0, some 1, some 2, rarely 3 points
- Materials match actual activities (counting objects, number cards, etc.)
- French language properly used

✅ **QA Agent:**
- Correctly identifies quality issues
- Provides specific examples of problems
- Scores reasonably (expecting 80-90 for good enhancement)
- Catches any copy-paste patterns

✅ **System Overall:**
- Agents follow instructions precisely
- Context-aware enhancements, not mechanical
- QA catches real issues
- Process is replicable for 50 units

## Test Timeline

1. **Hour 1:** Enhancement agent processes test unit
2. **Hour 2:** QA agent reviews enhanced unit
3. **Hour 3:** Analysis of results and adjustments
4. **Hour 4:** If successful, prepare for full deployment

## Adjustments Log

Document any instruction adjustments needed based on test results:
- [ ] Enhancement instructions clarity
- [ ] QA rubric calibration
- [ ] Remediation process
- [ ] Parallel coordination plan

## Go/No-Go Decision

After test:
- **GO:** If test unit scores 80+ with contextual enhancements
- **ADJUST:** If issues found but fixable
- **STOP:** If fundamental problems with agent approach

This test ensures we don't waste time on mechanical enhancements across all 975 lessons.