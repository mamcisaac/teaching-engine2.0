# Phase 2 Material Generation Agent Instructions

## YOUR MISSION
You are a specialized material generation agent. Using analysis reports from Phase 1, you will create perfect, lesson-specific materials and decision points for assigned lesson files.

## REQUIRED READING
1. **FIRST**: Read `/Users/michaelmcisaac/Github/teaching-engine2.0/AGENT_BEST_PRACTICES.md` completely
2. **THEN**: Read the Phase 1 analysis report for your assigned subject
3. **REVIEW**: The specific requirements below

## MATERIAL GENERATION PRINCIPLES

### Perfect Materials Must Be:
1. **Activity-Specific**: Directly supports what students DO in this lesson
2. **Pedagogically Sound**: Helps achieve the stated learning goal
3. **Grade-Appropriate**: Suitable for 6-7 year old French immersion students
4. **Realistic**: Teachers can actually obtain and use these materials
5. **Detailed**: Specific quantities, preparation, and alternatives

### Perfect Decision Points Must Be:
1. **Scenario-Specific**: Address real situations for THIS lesson's content
2. **Actionable**: Tell teachers exactly what to do
3. **French-Appropriate**: Written in French for French immersion lessons
4. **Pedagogically Sound**: Based on actual teaching challenges

## SUBJECT-SPECIFIC MATERIAL LIBRARIES

### Arts Materials Focus
- Drawing/painting supplies with specific techniques
- Texture exploration materials
- Color theory tools
- Creative expression supports
- Art appreciation resources

### French Language Materials Focus  
- Vocabulary development tools
- Communication practice materials
- Literacy supports (appropriate for Grade 1 level)
- Pronunciation aids
- Cultural connection resources

### Mathematics Materials Focus
- Concrete manipulatives for number concepts
- Measurement tools and references
- Pattern and geometry materials  
- Problem-solving supports
- Mathematical communication aids

### Science Materials Focus
- Observation and investigation tools
- Hands-on exploration materials
- Scientific vocabulary supports
- Recording and documentation tools
- Safety equipment and materials

### Health/Personal Formation Materials Focus
- Social-emotional learning tools
- Self-awareness and identity materials
- Relationship and communication supports
- Personal safety resources
- Wellness and nutrition tools

### Social Studies Materials Focus
- Community connection materials
- Cultural exploration resources
- Identity and belonging supports
- Historical and geographical tools
- Civic participation materials

## MATERIAL GENERATION PROTOCOL

### Step 1: Analysis Review
1. Read your subject's Phase 1 analysis report thoroughly
2. Identify Priority 1 (Critical) files that need immediate attention
3. Note specific problems documented for each lesson

### Step 2: Lesson-by-Lesson Material Creation
For each lesson identified as needing improvement:

1. **Read the actual lesson content**:
   - Title and goal
   - Opening, main, and closing activities  
   - Key vocabulary and concepts
   - Duration and pacing

2. **Design appropriate materials using this template**:

```json
{
  "required": [
    {
      "item": "[SPECIFIC material name that supports this lesson's activity]",
      "quantity": "[EXACT quantity needed - be specific: '2 per student (50 total)']",
      "preparation": "[CLEAR setup instructions - what teacher does beforehand]",
      "alternatives": [
        "[MEANINGFUL alternative 1 - genuinely different approach]",
        "[MEANINGFUL alternative 2 - different but equally effective]", 
        "[MEANINGFUL alternative 3 - accessible backup option]"
      ]
    }
  ],
  "optional": [
    {
      "item": "[ENHANCEMENT material that enriches but isn't essential]",
      "quantity": "[Specific quantity]",
      "purpose": "[WHY this enhances the lesson]"
    }
  ]
}
```

3. **Create lesson-specific decision points**:
```
[
  "Si [SPECIFIC scenario for this lesson] → [SPECIFIC action to take]",
  "Si [ANOTHER realistic scenario] → [CLEAR guidance for teacher]"
]
```

### Step 3: Quality Verification
Before finalizing materials, check each one:

✅ **Relevance Test**: Does this material directly support this lesson's stated goal?
✅ **Activity Match**: Would a teacher use this material for this specific activity?
✅ **Grade Level**: Is this appropriate for 6-7 year olds?
✅ **French Context**: Does this support French immersion learning?
✅ **Quantity Logic**: Is the quantity realistic and justified?
✅ **Preparation Clarity**: Are setup instructions clear and doable?
✅ **Alternative Quality**: Are alternatives genuinely useful and different?

## MATERIAL GENERATION CHECKLIST

For each lesson you improve:

✅ **Content Understanding**: I read and understood what this lesson teaches
✅ **Specific Materials**: Materials directly match this lesson's activity
✅ **Realistic Quantities**: Numbers make sense for Grade 1 class
✅ **Clear Preparation**: Teachers know exactly how to set up
✅ **Meaningful Alternatives**: 3 different, useful backup options
✅ **French Appropriate**: Language and cultural context suitable
✅ **Decision Points**: Address real teaching scenarios for this lesson
✅ **Quality Verification**: Materials pass all quality tests above

## COMMON MATERIAL EXAMPLES BY ACTIVITY TYPE

### For Counting Activities:
- Specific: "Cubes unifix de couleurs vives"
- Not: "Matériel de comptage"

### For Drawing Activities:  
- Specific: "Crayons de cire triangulaires (grip facile)"
- Not: "Matériel d'art"

### For Reading Activities:
- Specific: "Livres grand format avec images claires"
- Not: "Matériel de lecture"

### For Movement Activities:
- Specific: "Foulards de danse multicolores" 
- Not: "Matériel de mouvement"

## DELIVERABLES

For each file you improve, provide:

1. **Improvement Summary**:
   - File name and total lessons improved
   - Brief description of changes made
   - Key quality improvements achieved

2. **Updated JSON Structure**: 
   - Complete, properly formatted materials sections
   - Populated decision points arrays
   - All improvements implemented

3. **Implementation Notes**:
   - Any special considerations for teachers
   - Particularly innovative or effective material choices
   - Rationale for major changes

## SUCCESS CRITERIA

You succeed when:
- Every assigned lesson has materials that clearly support its specific activity
- All template materials are eliminated
- Decision points address realistic teaching scenarios  
- Materials are appropriate for Grade 1 French immersion context
- Teachers can understand the lesson purpose from the materials list

Remember: Teachers will use these materials lists to prepare lessons. Students will learn with these materials. Make every material count!