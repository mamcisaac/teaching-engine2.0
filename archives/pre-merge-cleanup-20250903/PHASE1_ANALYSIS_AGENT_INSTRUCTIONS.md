# Phase 1 Analysis Agent Instructions

## YOUR MISSION
You are a specialized subject analysis agent. Your job is to deeply analyze lesson files in your assigned subject and document exactly what improvements are needed.

## REQUIRED READING
1. **FIRST**: Read `/Users/michaelmcisaac/Github/teaching-engine2.0/AGENT_BEST_PRACTICES.md` completely
2. **THEN**: Read your specific subject assignment below

## SUBJECT ASSIGNMENTS

### Arts Agent
**Files to Analyze**: All files in `generated-lessons/arts-visuels/` ending in `-full.json`
**Focus**: Visual arts materials, creative processes, art appreciation activities

### French Agent  
**Files to Analyze**: All files in `generated-lessons/francais/` ending in `-full.json`
**Focus**: French language learning materials, communication activities, literacy tools

### Math Agent
**Files to Analyze**: All files in `generated-lessons/mathematiques/` ending in `-full.json`  
**Focus**: Mathematical manipulatives, number tools, measurement materials

### Science Agent
**Files to Analyze**: All files in `generated-lessons/sciences/` ending in `-full.json`
**Focus**: Scientific investigation tools, observation materials, experiment supplies

### Health Agent
**Files to Analyze**: All files in `generated-lessons/formation-personnelle/` ending in `-full.json`
**Focus**: Social-emotional learning tools, health education materials, personal development aids

### Social Studies Agent
**Files to Analyze**: All files in `generated-lessons/sciences-humaines/` ending in `-full.json`
**Focus**: Community study materials, cultural exploration tools, identity development resources

## ANALYSIS PROTOCOL

### Step 1: File Discovery
1. Use `find` or `ls` to identify ALL your assigned files
2. Count total files and lessons you'll analyze
3. Report the scope of your analysis

### Step 2: Deep Content Analysis
For EACH lesson in EACH file:

1. **Read the lesson thoroughly**:
   - `title`: What is this lesson really about?
   - `oneGoal`: What should students achieve?
   - `activity`: What do students actually DO?
   - `keyVocabulary`: What concepts are being taught?

2. **Evaluate current materials**:
   - Are materials specific to this lesson's activity?
   - Do materials support the stated learning goal?
   - Are quantities realistic and specific?
   - Are alternatives meaningful and different?

3. **Evaluate decision points**:
   - Are decision point arrays empty?
   - Do existing decision points address real teaching scenarios?
   - Are they specific to this lesson's content?
   - Are they written in appropriate language (French for immersion)?

### Step 3: Document Quality Issues
Create a comprehensive report using this format:

```
## [SUBJECT] ANALYSIS REPORT

### FILES ANALYZED
- Total files: X
- Total lessons: X

### CRITICAL ISSUES FOUND

#### Template Materials Still Present
- File: [filename]
- Lesson: [number] - [title]
- Problem: [specific issue]
- Example: [quote bad material]

#### Empty Decision Points  
- File: [filename]
- Lessons affected: [numbers]

#### Language Inconsistency
- File: [filename]
- Issue: [English labels in French immersion]
- Count: [number of instances]

#### Generic/Inappropriate Materials
- File: [filename]
- Lesson: [number] - [title]  
- Current material: [quote]
- Why problematic: [explanation]

### IMPROVEMENT RECOMMENDATIONS

#### Priority 1 Fixes (Critical)
[List most urgent improvements needed]

#### Priority 2 Fixes (Important)  
[List significant improvements needed]

#### Priority 3 Fixes (Enhancement)
[List quality improvements]

### SUBJECT-SPECIFIC INSIGHTS
[Any patterns or unique challenges for this subject]
```

## ANALYSIS CHECKLIST

Before submitting your report, verify:

✅ **Completeness**: I analyzed every lesson in every assigned file
✅ **Depth**: I read actual lesson content, not just skimmed  
✅ **Specificity**: I provided concrete examples of problems
✅ **Actionability**: My recommendations are clear and doable
✅ **Subject Focus**: I considered subject-specific pedagogical needs
✅ **Grade Level**: I evaluated appropriateness for Grade 1 (ages 6-7)
✅ **French Context**: I considered French immersion requirements
✅ **Teacher Utility**: I thought about practical classroom implementation

## REPORTING REQUIREMENTS

Your final report must include:
1. **Executive Summary**: 3-4 sentences on overall quality and priority issues  
2. **Detailed Issues**: Specific examples with file names and lesson numbers
3. **Improvement Recommendations**: Prioritized list of fixes needed
4. **Subject Insights**: Any unique patterns or challenges for your subject area

## SUCCESS CRITERIA

You succeed when:
- Every lesson in your assigned files has been thoroughly analyzed
- All quality issues are documented with specific examples
- Improvement recommendations are clear and actionable  
- Report provides concrete foundation for material generation agents

## TIME MANAGEMENT
- Analysis phase should take 30-45 minutes per file
- Don't rush - quality analysis prevents problems later
- Focus on understanding what each lesson actually teaches
- Document everything - other agents depend on your findings

Remember: Your analysis is the foundation for all subsequent improvements. Be thorough, be specific, and focus on what will truly help teachers and students.