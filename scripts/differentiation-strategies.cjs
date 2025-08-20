/**
 * Dynamic differentiation strategies based on lesson content
 * Provides specific, actionable differentiation for each lesson type
 */

const DIFFERENTIATION_TYPES = {
  counting: {
    struggling: [
      'Provide number line or hundreds chart for reference',
      'Use smaller number ranges (0-5 instead of 0-10)',
      'Pair with peer for counting together',
      'Use concrete manipulatives for each number',
      'Allow finger counting and touch-counting'
    ],
    iep: [
      'Use assistive technology (counting apps with audio)',
      'Provide tactile numbers for tracing while counting',
      'Modified goal: count to 5 instead of 10',
      'Use visual schedules for counting routines',
      'Allow alternative demonstrations (point instead of verbal)'
    ],
    ell: [
      'Count in home language first, then French',
      'Use cognates when available (six/six, sept/seven)',
      'Provide number cards with numerals and words',
      'Use Total Physical Response (TPR) for counting',
      'Create bilingual number books'
    ],
    advanced: [
      'Count by 2s, 5s, or 10s',
      'Count backwards from 20',
      'Solve "counting on" problems',
      'Lead counting activities for small groups',
      'Create counting patterns for others to continue'
    ]
  },
  
  subitizing: {
    struggling: [
      'Start with organized patterns (dice, dominoes)',
      'Use consistent arrangements initially',
      'Limit to quantities 1-3 at first',
      'Allow counting to verify after guessing',
      'Use ten frames with counters'
    ],
    iep: [
      'Use larger dots with high contrast',
      'Allow extra time for recognition',
      'Modified goal: recognize 1-3 instantly',
      'Use tactile dot cards',
      'Provide consistent seating for visual focus'
    ],
    ell: [
      'Connect to familiar games from home culture',
      'Use visual vocabulary cards for number names',
      'Practice number names while showing quantities',
      'Allow pointing/gesturing before verbal response',
      'Partner with French-speaking peer'
    ],
    advanced: [
      'Practice with scattered arrangements',
      'Combine two groups to make larger numbers',
      'Create own dot patterns for others',
      'Play "quick flash" games with brief exposure',
      'Explain strategies for instant recognition'
    ]
  },
  
  phonological: {
    struggling: [
      'Focus on initial sounds only at first',
      'Use pictures to support sound identification',
      'Provide mirrors for watching mouth movements',
      'Practice with student\'s name and familiar words',
      'Use hand signals for different sounds'
    ],
    iep: [
      'Use amplification devices if needed',
      'Provide visual phonics cues',
      'Modified goal: identify initial sounds only',
      'Use multisensory approaches (sand tracing)',
      'Allow non-verbal responses (sorting pictures)'
    ],
    ell: [
      'Compare French sounds to home language',
      'Focus on sounds that exist in both languages first',
      'Use familiar vocabulary from student\'s experience',
      'Provide extra practice with French-specific sounds',
      'Create personal sound dictionaries'
    ],
    advanced: [
      'Manipulate sounds to create new words',
      'Identify all sounds in CVC words',
      'Lead phonological awareness games',
      'Create rhyming word families',
      'Help peers with sound discrimination'
    ]
  },
  
  listening: {
    struggling: [
      'Provide visual cues during oral instructions',
      'Break instructions into single steps',
      'Check understanding before proceeding',
      'Seat near teacher and away from distractions',
      'Use gestures and demonstrations'
    ],
    iep: [
      'Use FM system or preferential seating',
      'Provide written or pictorial backup',
      'Modified goal: follow one-step instructions',
      'Allow response through action not words',
      'Repeat key information individually'
    ],
    ell: [
      'Pre-teach key vocabulary with visuals',
      'Allow wait time for processing',
      'Pair with sympathetic French speaker',
      'Use cognates and familiar contexts',
      'Provide home language support when needed'
    ],
    advanced: [
      'Follow multi-step complex instructions',
      'Retell stories with details',
      'Help interpret for struggling peers',
      'Add details to simple instructions',
      'Create instructions for others to follow'
    ]
  },
  
  science: {
    struggling: [
      'Provide step-by-step visual procedures',
      'Partner for hands-on activities',
      'Use simplified recording sheets',
      'Focus on one variable at a time',
      'Offer choice in how to show learning'
    ],
    iep: [
      'Adapt materials for physical needs',
      'Provide larger manipulatives',
      'Modified goal: make one observation',
      'Use adaptive tools for recording',
      'Allow verbal recording instead of writing'
    ],
    ell: [
      'Label materials in multiple languages',
      'Use visual vocabulary cards for science terms',
      'Allow drawing before writing',
      'Connect to science experiences from home',
      'Provide sentence frames for observations'
    ],
    advanced: [
      'Design own simple experiments',
      'Make predictions with reasoning',
      'Record detailed observations',
      'Lead investigation stations',
      'Connect learning to real-world applications'
    ]
  }
};

/**
 * Get differentiation strategies based on lesson content
 * @param {string} lessonType - Type of lesson (counting, subitizing, phonological, etc.)
 * @returns {object} Differentiation strategies for all learner types
 */
function getDifferentiationStrategies(lessonType) {
  const strategies = DIFFERENTIATION_TYPES[lessonType] || DIFFERENTIATION_TYPES.counting;
  
  return {
    struggling: strategies.struggling[Math.floor(Math.random() * strategies.struggling.length)],
    iep: strategies.iep[Math.floor(Math.random() * strategies.iep.length)],
    ell: strategies.ell[Math.floor(Math.random() * strategies.ell.length)],
    advanced: strategies.advanced[Math.floor(Math.random() * strategies.advanced.length)]
  };
}

/**
 * Determine lesson type from expectation and content
 * @param {string} expectationCode - Curriculum expectation code
 * @param {string} lessonFocus - Specific focus of the lesson
 * @returns {string} Lesson type for differentiation
 */
function determineLessonType(expectationCode, lessonFocus) {
  // Math expectations
  if (expectationCode === '1.N1' || lessonFocus.includes('count')) {
    return 'counting';
  }
  if (expectationCode === '1.N2' || lessonFocus.includes('subitiz')) {
    return 'subitizing';
  }
  
  // French expectations
  if (expectationCode === '1CO.0' || lessonFocus.includes('phonolog')) {
    return 'phonological';
  }
  if (expectationCode === '1CO.1' || lessonFocus.includes('listen') || lessonFocus.includes('écoute')) {
    return 'listening';
  }
  
  // Science expectations
  if (expectationCode.includes('1.1') || expectationCode.includes('1.2') || lessonFocus.includes('scien')) {
    return 'science';
  }
  
  // Default to counting as it's most common
  return 'counting';
}

/**
 * Format differentiation for prompt
 * @param {object} strategies - Differentiation strategies object
 * @returns {string} Formatted differentiation text
 */
function formatDifferentiation(strategies) {
  return `DIFFERENTIATION (specific to this lesson):
- Support for struggling learners: ${strategies.struggling}
- IEP modifications: ${strategies.iep}
- ELL support: ${strategies.ell}
- Extensions for advanced learners: ${strategies.advanced}`;
}

module.exports = {
  DIFFERENTIATION_TYPES,
  getDifferentiationStrategies,
  determineLessonType,
  formatDifferentiation
};