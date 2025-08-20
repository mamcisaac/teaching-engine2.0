/**
 * Build Complete Prompts
 * Constructs comprehensive prompts with ALL unit information - no truncation
 */

class CompletePromptBuilder {
  /**
   * Build the main generation prompt for a unit
   * Ensures ALL information is included without cutoffs
   */
  buildUnitGenerationPrompt(unit) {
    // Format vocabulary with definitions if available
    const vocabularySection = this.formatVocabulary(unit.keyVocabulary);
    
    // Format expectations with full descriptions
    const expectationsSection = this.formatExpectations(unit.expectations);
    
    // Format essential questions
    const questionsSection = this.formatQuestions(unit.essentialQuestions);
    
    // Format differentiation strategies
    const differentiationSection = this.formatDifferentiation(unit.differentiationStrategies);
    
    // Calculate time requirements
    const timeRequirements = this.calculateTimeRequirements(unit);
    
    return `You are an expert Grade 1 French Immersion teacher creating ETFO-compliant lesson plans.

CRITICAL INSTRUCTIONS:
1. You have received COMPLETE unit information below - use ALL of it
2. Generate EXACTLY ${unit.lessonCount} complete lesson plans
3. Each lesson MUST be 45 minutes (8 min Minds On, 27 min Action, 10 min Consolidation)
4. Include ALL vocabulary terms across the lessons
5. Address ALL curriculum expectations listed
6. Output as structured JSON for direct database storage

════════════════════════════════════════════════════════════════════

COMPLETE UNIT INFORMATION:

UNIT TITLE: "${unit.title}"
${unit.titleFr ? `TITRE EN FRANÇAIS: "${unit.titleFr}"` : ''}
SUBJECT: ${unit.longRangePlan.subject}
GRADE: Grade ${unit.longRangePlan.grade} (6-7 year olds)
DATES: ${this.formatDateRange(unit.startDate, unit.endDate)}
TOTAL LESSONS NEEDED: ${unit.lessonCount}

════════════════════════════════════════════════════════════════════

UNIT DESCRIPTION:
${unit.description || 'Focus on grade-appropriate skill development in this subject area.'}

${unit.descriptionFr ? `DESCRIPTION EN FRANÇAIS:
${unit.descriptionFr}` : ''}

════════════════════════════════════════════════════════════════════

BIG IDEAS (Complete Text - Use ALL of this):
${unit.bigIdeas || 'Students will develop foundational understanding and skills appropriate for Grade 1.'}

${unit.bigIdeasFr ? `GRANDES IDÉES:
${unit.bigIdeasFr}` : ''}

════════════════════════════════════════════════════════════════════

ESSENTIAL QUESTIONS (Address ALL of these):
${questionsSection}

════════════════════════════════════════════════════════════════════

CURRICULUM EXPECTATIONS (Must address ALL):
${expectationsSection}

════════════════════════════════════════════════════════════════════

KEY VOCABULARY (Include ALL terms across lessons):
Total Terms: ${unit.keyVocabulary.length}
${vocabularySection}

════════════════════════════════════════════════════════════════════

CULMINATING TASK (Build toward this):
${unit.culminatingTask || 'Students will demonstrate their understanding of all unit concepts through an integrated performance task.'}

════════════════════════════════════════════════════════════════════

ASSESSMENT PLAN:
${unit.assessmentPlan || 'Use formative assessment throughout, including observations, conversations, and products. Include self-assessment and peer feedback opportunities.'}

SUCCESS CRITERIA:
${this.formatSuccessCriteria(unit.successCriteria)}

════════════════════════════════════════════════════════════════════

DIFFERENTIATION STRATEGIES (Apply these):
${differentiationSection}

PRIOR KNOWLEDGE:
${unit.priorKnowledge || 'Students have basic French vocabulary and are developing early literacy and numeracy skills.'}

════════════════════════════════════════════════════════════════════

CONNECTIONS AND PERSPECTIVES:

Indigenous Perspectives:
${unit.indigenousPerspectives || 'Include Mi\'kmaq perspectives where authentic and appropriate to the content.'}

Community Connections:
${unit.communityConnections || 'Connect to local PEI community and student experiences.'}

Cross-Curricular:
${unit.crossCurricularConnections || 'Integrate literacy, numeracy, and other subject areas as appropriate.'}

Environmental Education:
${unit.environmentalEducation || 'Include environmental awareness where relevant.'}

Technology Integration:
${unit.technologyIntegration || 'Use age-appropriate technology tools to support learning.'}

════════════════════════════════════════════════════════════════════

PARENT COMMUNICATION:
${unit.parentCommunicationPlan || 'Regular communication through newsletters and learning celebrations.'}

════════════════════════════════════════════════════════════════════

LESSON GENERATION REQUIREMENTS:

1. PROGRESSION:
   - Lessons 1-5: Introduce concepts with heavy concrete support
   - Lessons 6-15: Practice and explore with gradual release
   - Lessons 16-${unit.lessonCount}: Synthesize and prepare for culminating task

2. EACH LESSON MUST INCLUDE:
   a) Bilingual title (French/English)
   b) Clear learning goals (what students will learn/do)
   c) Success criteria (2-3 observable behaviors)
   d) Vocabulary (distribute ALL ${unit.keyVocabulary.length} terms across lessons)
   e) Three-part structure:
      - Minds On (8 min): Hook/activation
      - Action (27 min): 2-3 varied activities
      - Consolidation (10 min): Synthesis/assessment
   f) Assessment strategies (formative, specific tools)
   g) Differentiation (struggling, IEP, ELL, advanced)
   h) Materials (standard Grade 1 classroom supplies)
   i) Safety considerations (where applicable)
   j) Grouping strategies (individual, partner, small group, whole class)

3. TIME REQUIREMENTS:
${timeRequirements}

4. FRENCH IMMERSION REQUIREMENTS:
   - ${this.getFrenchPercentage(unit)}% French instruction
   - Visual supports and gestures for comprehension
   - Gradual release of English support

5. GRADE 1 CONSIDERATIONS:
   - Attention span: 5-7 minute activity segments
   - Movement breaks every 10-15 minutes
   - Concrete manipulatives and hands-on learning
   - Visual schedules and clear routines
   - Positive behavior support

════════════════════════════════════════════════════════════════════

OUTPUT FORMAT:

Provide your response as a JSON object with this structure:
{
  "unitTitle": "${unit.title}",
  "lessonCount": ${unit.lessonCount},
  "overview": "Brief description of the ${unit.lessonCount}-lesson progression",
  "lessons": [
    {
      "lessonNumber": 1,
      "title": "Bilingual Title / Titre bilingue",
      "titleFr": "Titre en français",
      "date": "calculated based on unit dates",
      "learningGoals": "What students will learn/do",
      "learningGoalsFr": "Objectifs d'apprentissage",
      "successCriteria": ["Observable behavior 1", "Observable behavior 2", "Observable behavior 3"],
      "vocabulary": ["term1", "term2", "term3"],
      "mindsOn": {
        "duration": 8,
        "description": "Hook/activation activity description",
        "materials": ["material1", "material2"],
        "grouping": "whole class/partners/small groups"
      },
      "action": {
        "duration": 27,
        "activities": [
          {
            "name": "Activity 1 Name",
            "duration": 10,
            "description": "Detailed activity description",
            "materials": ["material1", "material2"],
            "grouping": "partners"
          },
          {
            "name": "Activity 2 Name",
            "duration": 10,
            "description": "Detailed activity description",
            "materials": ["material1", "material2"],
            "grouping": "small groups"
          },
          {
            "name": "Activity 3 Name",
            "duration": 7,
            "description": "Detailed activity description",
            "materials": ["material1", "material2"],
            "grouping": "individual"
          }
        ]
      },
      "consolidation": {
        "duration": 10,
        "description": "Synthesis/assessment activity",
        "assessmentStrategy": "Specific formative assessment approach",
        "materials": ["material1"],
        "grouping": "whole class"
      },
      "differentiation": {
        "forStruggling": ["Strategy 1", "Strategy 2"],
        "forIEP": ["Accommodation 1", "Accommodation 2"],
        "forELL": ["Support 1", "Support 2"],
        "forAdvanced": ["Extension 1", "Extension 2"]
      },
      "materials": ["Complete list of all materials needed"],
      "safety": "Any safety considerations or N/A",
      "notes": "Any additional teacher notes"
    }
    // ... continue for all ${unit.lessonCount} lessons
  ]
}

BEGIN GENERATION NOW - Remember to create EXACTLY ${unit.lessonCount} complete lessons:`;
  }

  /**
   * Format vocabulary with proper structure
   */
  formatVocabulary(vocabulary) {
    if (!vocabulary || vocabulary.length === 0) {
      return 'No specific vocabulary provided - incorporate grade-appropriate French terms';
    }

    if (vocabulary.length <= 20) {
      return vocabulary.map((term, i) => `${i + 1}. ${term}`).join('\n');
    }

    // For large vocabulary lists, show all but formatted nicely
    const chunks = [];
    for (let i = 0; i < vocabulary.length; i += 10) {
      const chunk = vocabulary.slice(i, i + 10);
      chunks.push(chunk.join(', '));
    }
    return chunks.join('\n');
  }

  /**
   * Format expectations with full descriptions
   */
  formatExpectations(expectations) {
    if (!expectations || expectations.length === 0) {
      return 'General curriculum expectations for this grade and subject';
    }

    return expectations.map(exp => {
      let expText = `\n${exp.code}: ${exp.title || exp.description}`;
      if (exp.description && exp.description !== exp.title) {
        expText += `\n   Description: ${exp.description}`;
      }
      if (exp.specificExpectation) {
        expText += `\n   Specific: ${exp.specificExpectation}`;
      }
      if (exp.example) {
        expText += `\n   Example: ${exp.example}`;
      }
      return expText;
    }).join('\n');
  }

  /**
   * Format essential questions
   */
  formatQuestions(questions) {
    if (!questions || questions.length === 0) {
      return '1. How can we explore and understand this topic?\n2. What connections can we make to our lives?\n3. How can we demonstrate our learning?';
    }

    if (Array.isArray(questions)) {
      return questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    }

    return questions;
  }

  /**
   * Format differentiation strategies
   */
  formatDifferentiation(strategies) {
    if (!strategies || Object.keys(strategies).length === 0) {
      return `For Struggling Learners:
- Provide visual supports and manipulatives
- Break tasks into smaller steps
- Offer peer support and partnering

For IEP Students:
- Follow individual accommodation plans
- Provide extra time and modified tasks
- Use assistive technology as needed

For ELL Students:
- Use visuals and gestures
- Provide vocabulary pre-teaching
- Allow first language support

For Advanced Learners:
- Offer extension activities
- Encourage peer mentoring
- Provide choice in demonstrating learning`;
    }

    let formatted = '';
    for (const [key, value] of Object.entries(strategies)) {
      formatted += `\n${key}:\n`;
      if (Array.isArray(value)) {
        formatted += value.map(v => `- ${v}`).join('\n');
      } else {
        formatted += `- ${value}`;
      }
    }
    return formatted;
  }

  /**
   * Format success criteria
   */
  formatSuccessCriteria(criteria) {
    if (!criteria || (Array.isArray(criteria) && criteria.length === 0)) {
      return `- I can participate in learning activities
- I can show my understanding through words, pictures, or actions
- I can work well with others`;
    }

    if (Array.isArray(criteria)) {
      return criteria.map(c => `- ${c}`).join('\n');
    }

    return criteria;
  }

  /**
   * Calculate time requirements
   */
  calculateTimeRequirements(unit) {
    const totalMinutes = unit.lessonCount * 45;
    const totalHours = totalMinutes / 60;
    const mindsOnTotal = unit.lessonCount * 8;
    const actionTotal = unit.lessonCount * 27;
    const consolidationTotal = unit.lessonCount * 10;

    return `- Total instructional time: ${totalHours} hours (${totalMinutes} minutes)
- Minds On total: ${mindsOnTotal} minutes across ${unit.lessonCount} lessons
- Action total: ${actionTotal} minutes across ${unit.lessonCount} lessons  
- Consolidation total: ${consolidationTotal} minutes across ${unit.lessonCount} lessons`;
  }

  /**
   * Get French percentage based on month
   */
  getFrenchPercentage(unit) {
    const month = new Date(unit.startDate).getMonth() + 1;
    const percentages = {
      9: 30, 10: 40, 11: 50, 12: 60,
      1: 65, 2: 70, 3: 75, 4: 80,
      5: 85, 6: 85
    };
    return percentages[month] || 50;
  }

  /**
   * Format date range
   */
  formatDateRange(startDate, endDate) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const start = new Date(startDate).toLocaleDateString('en-US', options);
    const end = new Date(endDate).toLocaleDateString('en-US', options);
    return `${start} to ${end}`;
  }

  /**
   * Build validation prompt for generated lessons
   */
  buildValidationPrompt(lessons, unit) {
    return `Review these ${lessons.length} lessons for quality and ETFO compliance.

UNIT: "${unit.title}"
EXPECTED LESSON COUNT: ${unit.lessonCount}
SUBJECT: ${unit.longRangePlan.subject}

LESSONS TO VALIDATE:
${JSON.stringify(lessons, null, 2)}

VALIDATION CHECKLIST:
1. ✓ Exactly ${unit.lessonCount} lessons present
2. ✓ Each lesson has 8 min Minds On, 27 min Action, 10 min Consolidation
3. ✓ All ${unit.keyVocabulary.length} vocabulary terms distributed across lessons
4. ✓ All curriculum expectations addressed:
   ${unit.expectations.map(e => e.code).join(', ')}
5. ✓ Progressive skill building from concrete to abstract
6. ✓ Culminating task preparation in final lessons
7. ✓ All required components present per lesson
8. ✓ Grade 1 developmental appropriateness
9. ✓ French immersion percentage appropriate (${this.getFrenchPercentage(unit)}%)
10. ✓ Differentiation strategies included

Return a validation report as JSON:
{
  "valid": true/false,
  "lessonCount": ${unit.lessonCount},
  "issues": [],
  "strengths": [],
  "recommendations": []
}`;
  }
}

// Export for use
module.exports = { CompletePromptBuilder };

// Test if run directly
if (require.main === module) {
  const builder = new CompletePromptBuilder();
  
  // Create a sample unit for testing
  const sampleUnit = {
    title: "Fondations des nombres",
    titleFr: "Fondations des nombres",
    lessonCount: 20,
    startDate: new Date('2024-09-03'),
    endDate: new Date('2024-09-30'),
    description: "Introduction to number concepts for Grade 1",
    bigIdeas: "Numbers help us count, compare, and describe our world. Understanding quantity and relationships between numbers builds mathematical thinking.",
    essentialQuestions: [
      "How do numbers help us understand the world?",
      "What patterns can we find in numbers?",
      "How can we show quantities in different ways?"
    ],
    keyVocabulary: [
      "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
      "plus", "moins", "égal", "compter", "nombre", "combien", "ensemble", "groupe"
    ],
    expectations: [
      {
        code: "1.N1",
        description: "Count forward to 50 and backward from 20"
      },
      {
        code: "1.N2",
        description: "Subitize quantities to 5"
      },
      {
        code: "1.N3",
        description: "Compare and order numbers to 20"
      }
    ],
    culminatingTask: "Create a number book showing counting, comparing, and patterns",
    longRangePlan: {
      subject: "Mathématiques",
      grade: 1
    }
  };

  const prompt = builder.buildUnitGenerationPrompt(sampleUnit);
  
  console.log('\n📝 SAMPLE PROMPT (first 2000 characters):');
  console.log('=' .repeat(60));
  console.log(prompt.substring(0, 2000));
  console.log('...\n');
  console.log(`Total prompt length: ${prompt.length} characters`);
  console.log('✅ Complete prompt ready for subagent processing');
}