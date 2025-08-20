/**
 * Conversation Templates
 * Flexible prompts for agentic conversation with Claude
 */

/**
 * Get initial unit presentation for Claude
 */
function getUnitPresentation(unit) {
  const lessonCount = calculateLessonCount(unit);
  const monthContext = getMonthContext(unit);
  
  return `I need to create ${lessonCount} progressive Grade 1 French Immersion lessons for the following unit:

UNIT: "${unit.title}"
SUBJECT: ${unit.longRangePlan.subject}
DATES: ${formatDateRange(unit.startDate, unit.endDate)}
GRADE: Grade 1 (6-7 year olds)

UNIT CONTEXT:
Big Ideas: ${unit.bigIdeas}
Essential Questions: ${formatQuestions(unit.essentialQuestions)}
Key Vocabulary: ${formatVocabulary(unit.keyVocabulary)}

CURRICULUM EXPECTATIONS TO ADDRESS:
${formatExpectations(unit.expectations)}

CULMINATING TASK:
${unit.culminatingTask || 'Students will demonstrate understanding of all unit expectations'}

REQUIREMENTS:
- ${lessonCount} lessons total, building progressively
- Each lesson: 45 minutes (8 min Minds On, 27 min Action, 10 min Consolidation)
- ${monthContext.frenchPercentage}% French instruction (${monthContext.descriptor})
- Include ${monthContext.vocabularyLimit} vocabulary terms per lesson
- Grade 1 appropriate (concrete → abstract progression)
- Daily movement and partner work required
- Mi'kmaq cultural connections where authentic

Please first provide an overview of how you'll structure these ${lessonCount} lessons to progressively build understanding and prepare for the culminating task. Include:
1. What specific skill/concept each lesson will focus on
2. How the lessons build on each other
3. How you'll balance the different expectations
4. When you'll transition from introducing concepts to practicing to synthesizing`;
}

/**
 * Request revision based on evaluation feedback
 */
function getRevisionRequest(feedback, currentOverview) {
  const specificGuidance = getSpecificGuidance(feedback);
  
  return `Thank you for the overview. I need some adjustments to better meet Grade 1 learning needs:

${feedback}

${specificGuidance}

Could you please revise the lesson progression with these points in mind? Keep what's working well, but adjust the areas mentioned above.`;
}

/**
 * Request individual lesson
 */
function getLessonRequest(context) {
  const { lessonNumber, totalLessons, previousLesson, overview } = context;
  
  const priorContext = previousLesson ? 
    `The previous lesson (${lessonNumber - 1}) focused on: ${previousLesson.mainConcept}. Students can now ${previousLesson.skillsAcquired}.` :
    `This is the first lesson of the unit, so we're starting fresh.`;
  
  const positionContext = getPositionContext(lessonNumber, totalLessons);
  
  return `Now please provide the complete ETFO lesson plan for Lesson ${lessonNumber} of ${totalLessons}.

${priorContext}

${positionContext}

For this lesson, please include:
1. Bilingual title (French/English)
2. Clear learning goals (what students will learn/do)
3. Success criteria (2-3 observable behaviors)
4. Vocabulary: ${getVocabularyRequirement(lessonNumber)}
5. Three-part lesson structure:
   - Minds On (8 min): Hook/activation activity
   - Action (27 min): Main learning activities (include 2-3 varied activities)
   - Consolidation (10 min): Synthesis/assessment activity
6. Assessment strategies (formative, observation tools)
7. Differentiation (support for struggling, IEP, ELL, and advanced learners)
8. Materials needed (standard Grade 1 classroom supplies)
9. Safety considerations (if applicable)
10. Mi'kmaq cultural connection (if authentic to content)

Remember this is for 6-7 year olds in French Immersion, so keep language simple, use lots of visuals and movement, and make it engaging!`;
}

/**
 * Calculate lesson count based on unit subject
 */
function calculateLessonCount(unit) {
  const subjectLessons = {
    'Français (Immersion)': 20,
    'Mathématiques': 20,
    'Sciences de la nature': 20,
    'Arts visuels': 20,
    'Sciences humaines': 19,
    'Formation personnelle et sociale': 20
  };
  
  // Try to match subject or default to 20
  for (const [subject, count] of Object.entries(subjectLessons)) {
    if (unit.longRangePlan.subject.includes(subject)) {
      return count;
    }
  }
  
  return 20; // Default
}

/**
 * Get month-specific context
 */
function getMonthContext(unit) {
  const startMonth = new Date(unit.startDate).getMonth() + 1;
  
  const monthData = {
    9: { frenchPercentage: 30, vocabularyLimit: 3, descriptor: 'heavy visual support needed' },
    10: { frenchPercentage: 40, vocabularyLimit: 3, descriptor: 'building confidence' },
    11: { frenchPercentage: 50, vocabularyLimit: 4, descriptor: 'half French, half English' },
    12: { frenchPercentage: 60, vocabularyLimit: 4, descriptor: 'majority French' },
    1: { frenchPercentage: 65, vocabularyLimit: 4, descriptor: 'increasing French' },
    2: { frenchPercentage: 70, vocabularyLimit: 5, descriptor: 'primarily French' },
    3: { frenchPercentage: 75, vocabularyLimit: 5, descriptor: 'mostly French' },
    4: { frenchPercentage: 80, vocabularyLimit: 5, descriptor: 'French-dominant' },
    5: { frenchPercentage: 85, vocabularyLimit: 5, descriptor: 'near-full French' },
    6: { frenchPercentage: 85, vocabularyLimit: 5, descriptor: 'full French immersion' }
  };
  
  return monthData[startMonth] || monthData[9];
}

/**
 * Format date range for display
 */
function formatDateRange(startDate, endDate) {
  const options = { month: 'long', day: 'numeric' };
  const start = new Date(startDate).toLocaleDateString('en-US', options);
  const end = new Date(endDate).toLocaleDateString('en-US', options);
  return `${start} - ${end}`;
}

/**
 * Format essential questions
 */
function formatQuestions(questions) {
  if (Array.isArray(questions)) {
    return questions.map((q, i) => `  ${i + 1}. ${q}`).join('\n');
  }
  return questions || 'How can we apply our learning?';
}

/**
 * Format vocabulary list
 */
function formatVocabulary(vocabulary) {
  if (!vocabulary || vocabulary.length === 0) {
    return 'To be determined based on lesson content';
  }
  
  if (vocabulary.length <= 10) {
    return vocabulary.join(', ');
  }
  
  return vocabulary.slice(0, 10).join(', ') + ` (and ${vocabulary.length - 10} more)`;
}

/**
 * Format curriculum expectations
 */
function formatExpectations(expectations) {
  if (!expectations || expectations.length === 0) {
    return 'General skill development for this subject area';
  }
  
  return expectations.map(exp => 
    `- ${exp.expectation.code}: ${exp.expectation.description}`
  ).join('\n');
}

/**
 * Get specific guidance based on feedback type
 */
function getSpecificGuidance(feedback) {
  if (feedback.includes('abstract')) {
    return `For Grade 1, please ensure early lessons use concrete manipulatives, physical objects, and hands-on exploration. Save abstract concepts for later lessons after concrete understanding is established.`;
  }
  
  if (feedback.includes('variety')) {
    return `Please include diverse activity types across lessons: games, partner work, investigations, creative tasks, movement activities, and problem-solving. Avoid repeating the same activity structure.`;
  }
  
  if (feedback.includes('expectation')) {
    return `Please ensure each curriculum expectation gets adequate coverage across the unit. Consider which lessons will introduce, practice, and synthesize each expectation.`;
  }
  
  if (feedback.includes('culminating')) {
    return `The final 2-3 lessons should explicitly prepare students for the culminating task. Include practice of the specific skills they'll need to demonstrate.`;
  }
  
  return `Please revise with these pedagogical principles in mind: concrete before abstract, variety in instruction, balanced expectation coverage, and clear progression toward the culminating task.`;
}

/**
 * Get context based on lesson position in unit
 */
function getPositionContext(lessonNumber, totalLessons) {
  const position = lessonNumber / totalLessons;
  
  if (position <= 0.25) {
    return `This is an early lesson, so focus on introducing concepts with lots of concrete support and exploration.`;
  }
  
  if (position <= 0.5) {
    return `We're building foundational understanding now. Students have some familiarity but still need guided practice.`;
  }
  
  if (position <= 0.75) {
    return `Students should now be ready to apply their learning in new contexts and make connections between concepts.`;
  }
  
  return `This is a late lesson, so students should be synthesizing their learning and preparing for the culminating task.`;
}

/**
 * Get vocabulary requirement for specific lesson
 */
function getVocabularyRequirement(lessonNumber) {
  if (lessonNumber === 1) {
    return `Introduce 3 new French vocabulary terms with gestures and visuals`;
  }
  
  if (lessonNumber <= 5) {
    return `Review previous vocabulary and add 2-3 new terms`;
  }
  
  if (lessonNumber <= 15) {
    return `Mix of review and 1-2 new terms as needed`;
  }
  
  return `Focus on consolidating and applying known vocabulary`;
}

/**
 * Get follow-up prompt for missing components
 */
function getCompletionRequest(missingComponents) {
  const componentDescriptions = {
    'consolidation': 'a 10-minute consolidation activity where students synthesize their learning',
    'assessment': 'specific formative assessment strategies and observation tools',
    'differentiation': 'specific strategies for struggling learners, IEP students, ELL students, and advanced learners',
    'materials': 'a list of materials needed for the lesson',
    'vocabulary': 'the French vocabulary terms with English translations and teaching strategies',
    'mindsOn': 'an 8-minute opening activity to hook students and activate prior knowledge',
    'action': 'the 27-minute main learning activities (include 2-3 varied activities)',
    'objectives': 'clear learning goals stating what students will know/be able to do'
  };
  
  const descriptions = missingComponents.map(component => 
    componentDescriptions[component] || component
  );
  
  return `The lesson looks good but is missing some required components. Please add:

${descriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

These are required for ETFO compliance and effective Grade 1 instruction.`;
}

module.exports = {
  getUnitPresentation,
  getRevisionRequest,
  getLessonRequest,
  getCompletionRequest,
  calculateLessonCount,
  getMonthContext,
  formatDateRange,
  formatQuestions,
  formatVocabulary,
  formatExpectations,
  getSpecificGuidance,
  getPositionContext,
  getVocabularyRequirement
};