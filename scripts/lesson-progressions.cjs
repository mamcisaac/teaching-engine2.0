/**
 * Research-based lesson progressions for Grade 1 French Immersion
 * Each subject has specific skill sequences that build logically
 */

const MATH_PROGRESSIONS = {
  'Fondations des nombres': {
    '1.N1': [ // Counting 0-100
      'Introduce counting 0-3 with concrete objects and finger counting',
      'Extend counting to 0-5, practice one-to-one correspondence with manipulatives',
      'Introduce number recognition 0-5 with numerals and number words',
      'Count forward and backward 0-5, introduce "one more/one less" concept',
      'Extend counting to 0-10 with ten frames introduction',
      'Practice skip counting by 2s to 10 using pairs of objects',
      'Introduce counting by 5s using hand gestures and tally marks',
      'Count collections to 10, emphasizing last number tells "how many"',
      'Introduce teen numbers 11-15 as "10 and some more"',
      'Extend counting to 20 with emphasis on decade transition'
    ],
    '1.N2': [ // Subitizing
      'Recognize instantly quantities 1-3 using dot patterns',
      'Extend subitizing to 4-5 using dice patterns and dominoes',
      'Practice quick recognition with ten frame flash cards (1-5)',
      'Introduce finger patterns for instant recognition',
      'Combine two small groups to make 5 (decomposition)',
      'Extend subitizing to 6 using standard dice arrangements',
      'Practice with scattered vs organized arrangements',
      'Quick recognition games with 1-10 using ten frames',
      'Connect subitizing to addition facts within 5',
      'Assessment and consolidation of instant recognition 1-10'
    ]
  },
  'Comptage et cardinalité': {
    '1.N3': [ // Understanding counting
      'Establish counting principles: stable order and one-to-one',
      'Practice counting objects in different arrangements',
      'Introduce cardinality - last number tells total',
      'Count out specific quantities from larger groups',
      'Practice counting with movement (claps, jumps, steps)',
      'Count backwards from 10 with rocket launch context',
      'Introduce ordinal numbers (first through fifth)',
      'Count on from given numbers without starting at 1',
      'Practice conservation - same quantity different arrangements',
      'Apply counting to solve simple story problems'
    ],
    '1.N4': [ // Represent numbers to 20
      'Represent numbers 0-5 multiple ways (objects, drawings, numerals)',
      'Use ten frames to show numbers 6-10',
      'Introduce base-ten concept with bundling sticks',
      'Show teen numbers as "10 and some more"',
      'Create number books with multiple representations',
      'Use number lines to show position and magnitude',
      'Practice with place value mats for tens and ones',
      'Represent numbers with tally marks and organize by fives',
      'Connect representations to real-world quantities',
      'Create and interpret picture graphs with numbers to 20'
    ]
  }
};

const FRENCH_PROGRESSIONS = {
  'Bienvenue en français': {
    '1CO.0': [ // Phonological awareness
      'Distinguish initial sounds in familiar French words',
      'Identify rhyming words in French comptines',
      'Clap syllables in French vocabulary words',
      'Recognize same beginning sounds (alliteration)',
      'Blend two syllables to make simple words',
      'Identify final sounds in CVC French words',
      'Segment simple words into individual sounds',
      'Manipulate initial sounds to create new words',
      'Practice with French tongue twisters for sound discrimination',
      'Apply phonological skills to decode new vocabulary'
    ],
    '1CO.1': [ // Active listening
      'Follow one-step French classroom instructions',
      'Listen and respond with gestures to show understanding',
      'Identify key words in simple French stories',
      'Sequence story events using picture cards',
      'Listen for specific information in French songs',
      'Respond to yes/no questions about heard content',
      'Participate in call-and-response French activities',
      'Listen and draw based on French descriptions',
      'Retell simple stories with visual supports',
      'Demonstrate comprehension through dramatic play'
    ]
  }
};

const SCIENCE_PROGRESSIONS = {
  'Petits scientifiques sécuritaires': {
    '1.1.1': [ // Scientific safety
      'Identify science tools and their safe use',
      'Practice gentle handling of materials',
      'Learn safety symbols and their meanings',
      'Establish science center routines and expectations',
      'Practice proper cleanup procedures',
      'Identify potential hazards in experiments',
      'Learn emergency procedures for spills',
      'Practice using safety equipment (goggles, aprons)',
      'Create classroom safety posters',
      'Apply safety rules in hands-on investigation'
    ],
    '1.1.2': [ // Scientific method basics
      'Learn to make observations using senses',
      'Practice describing what we notice',
      'Ask questions about observations',
      'Make predictions before experiments',
      'Record observations with drawings',
      'Compare predictions with results',
      'Share findings with partners',
      'Use simple data collection sheets',
      'Create science journals for recording',
      'Present discoveries to class'
    ]
  }
};

/**
 * Get specific progression for a lesson
 * @param {string} subject - The subject area
 * @param {string} unitTitle - The unit title
 * @param {string} expectationCode - The curriculum expectation code
 * @param {number} lessonNumber - The lesson number within the progression
 * @returns {string} Specific skill/content for this lesson
 */
function getSpecificProgression(subject, unitTitle, expectationCode, lessonNumber) {
  // Determine which progression map to use
  let progressions = {};
  
  if (subject.includes('Mathématiques')) {
    progressions = MATH_PROGRESSIONS;
  } else if (subject.includes('Français')) {
    progressions = FRENCH_PROGRESSIONS;
  } else if (subject.includes('Sciences')) {
    progressions = SCIENCE_PROGRESSIONS;
  }
  
  // Get unit progressions
  const unitProgressions = progressions[unitTitle] || {};
  const expectationProgressions = unitProgressions[expectationCode] || [];
  
  // Return specific progression or generic if not found
  if (expectationProgressions[lessonNumber - 1]) {
    return expectationProgressions[lessonNumber - 1];
  }
  
  // Fallback to generic progression
  return `Continue developing ${expectationCode} skills through hands-on practice`;
}

/**
 * Get prior learning context based on specific progressions
 * @param {string} subject - The subject area
 * @param {string} unitTitle - The unit title
 * @param {string} expectationCode - The curriculum expectation code
 * @param {number} lessonNumber - Current lesson number
 * @returns {string} Description of prior learning
 */
function getPriorLearning(subject, unitTitle, expectationCode, lessonNumber) {
  if (lessonNumber === 1) {
    return 'Beginning of unit - establishing foundational concepts';
  }
  
  const priorProgression = getSpecificProgression(
    subject, 
    unitTitle, 
    expectationCode, 
    lessonNumber - 1
  );
  
  return `Previous lesson: ${priorProgression}`;
}

/**
 * Get next steps based on specific progressions
 * @param {string} subject - The subject area
 * @param {string} unitTitle - The unit title
 * @param {string} expectationCode - The curriculum expectation code
 * @param {number} lessonNumber - Current lesson number
 * @param {number} totalLessons - Total lessons in unit
 * @returns {string} Description of next steps
 */
function getNextSteps(subject, unitTitle, expectationCode, lessonNumber, totalLessons) {
  if (lessonNumber === totalLessons) {
    return 'Culminating task demonstration and celebration';
  }
  
  const nextProgression = getSpecificProgression(
    subject, 
    unitTitle, 
    expectationCode, 
    lessonNumber + 1
  );
  
  return `Next lesson: ${nextProgression}`;
}

module.exports = {
  MATH_PROGRESSIONS,
  FRENCH_PROGRESSIONS,
  SCIENCE_PROGRESSIONS,
  getSpecificProgression,
  getPriorLearning,
  getNextSteps
};