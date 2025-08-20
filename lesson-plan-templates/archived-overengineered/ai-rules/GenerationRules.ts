/**
 * 🤖 AI GENERATION RULES & CONSTRAINTS
 * Hard rules that AI must follow when generating lessons
 * These prevent common AI mistakes and ensure Grade 1 appropriateness
 */

import { LessonGenerationContext } from '../types/LessonContext';
import { SubjectType } from '../types/LessonPlanTemplate';

export interface AIGenerationRules {
  // ABSOLUTE PROHIBITIONS - AI must NEVER:
  readonly NEVER: string[];
  
  // MANDATORY REQUIREMENTS - AI must ALWAYS:
  readonly ALWAYS: string[];
  
  // VOCABULARY INTRODUCTION LIMITS
  readonly vocabularyRules: {
    maxPerLesson: Map<number, number>; // month -> max words
    requireVisualSupport: boolean;
    requireGestures: boolean;
    requireCognates: boolean;
    banAbstractDefinitions: boolean;
  };
  
  // ATTENTION SPAN RULES
  readonly attentionRules: {
    maxContinuousInstruction: number; // minutes
    requiredMovementBreaks: number;
    maxSittingTime: number; // minutes
    transitionTimeRequired: number; // minutes between activities
  };
  
  // LANGUAGE BALANCE RULES (French Immersion)
  readonly languageRules: {
    frenchPercentageByMonth: Map<number, number>; // month -> percentage
    allowEnglishForSafety: boolean;
    requireFrenchFirst: boolean;
    maxConsecutiveFrenchMinutes: number;
  };
  
  // BANNED PATTERNS - Common AI mistakes
  readonly bannedPatterns: string[];
}

// Grade 1 French Immersion Specific Rules
export const GRADE1_FRENCH_IMMERSION_RULES: AIGenerationRules = {
  NEVER: [
    'Expect silent independent work for more than 5 minutes',
    'Introduce more than 5 new French words in one lesson',
    'Use abstract explanations without concrete examples',
    'Require written output exceeding 3 sentences',
    'Plan activities requiring fine motor skills for more than 10 minutes',
    'Assume prior knowledge not explicitly taught',
    'Use worksheets as primary learning activity',
    'Expect students to sit still for more than 10 minutes',
    'Give multi-step instructions without visual support',
    'Use complex French grammar structures in September-December',
    'Require reading beyond Grade 1 level',
    'Plan activities requiring sharing of family information',
    'Use food in activities without checking allergies note',
    'Expect perfect French pronunciation',
    'Use competition as primary motivation',
    'Require memorization without context',
    'Skip movement breaks in afternoon lessons',
    'Use negative behavior consequences',
    'Assume all students have same home resources',
    'Plan craft activities taking more than 15 minutes'
  ],
  
  ALWAYS: [
    'Include visual supports for every new concept',
    'Provide wait time after asking questions (5-10 seconds)',
    'Use positive reinforcement language',
    'Include at least one movement activity',
    'Connect to students\' real-life experiences',
    'Model everything before expecting student attempts',
    'Use gestures with French vocabulary',
    'Build on previous lesson\'s vocabulary',
    'Include differentiation for struggling and advanced learners',
    'Have a backup activity if lesson runs short',
    'Use concrete materials for math concepts',
    'Include Indigenous perspectives authentically',
    'Celebrate attempts, not just correct answers',
    'Use songs/rhymes for memory support',
    'Provide choice when possible',
    'Include partner talk time',
    'Check for understanding before moving on',
    'Use familiar contexts for new learning',
    'Include sensory elements when appropriate',
    'End with student success experience'
  ],
  
  vocabularyRules: {
    maxPerLesson: new Map([
      [9, 3],   // September
      [10, 3],  // October
      [11, 4],  // November
      [12, 4],  // December
      [1, 4],   // January
      [2, 5],   // February
      [3, 5],   // March
      [4, 5],   // April
      [5, 5],   // May
      [6, 5]    // June
    ]),
    requireVisualSupport: true,
    requireGestures: true,
    requireCognates: true,
    banAbstractDefinitions: true
  },
  
  attentionRules: {
    maxContinuousInstruction: 7,
    requiredMovementBreaks: 2,
    maxSittingTime: 10,
    transitionTimeRequired: 2
  },
  
  languageRules: {
    frenchPercentageByMonth: new Map([
      [9, 30],  // September - 30% French
      [10, 40], // October - 40% French
      [11, 50], // November - 50% French
      [12, 60], // December - 60% French
      [1, 65],  // January - 65% French
      [2, 70],  // February - 70% French
      [3, 75],  // March - 75% French
      [4, 80],  // April - 80% French
      [5, 85],  // May - 85% French
      [6, 85]   // June - 85% French
    ]),
    allowEnglishForSafety: true,
    requireFrenchFirst: true,
    maxConsecutiveFrenchMinutes: 10
  },
  
  bannedPatterns: [
    'Students will understand...', // Too vague
    'Students will appreciate...', // Not measurable
    'Discuss as a class...', // Too open-ended for Grade 1
    'Complete the worksheet...', // Worksheet-focused
    'Work quietly...', // Unrealistic for Grade 1
    'Think about...', // Too abstract
    'Reflect on...', // Too metacognitive for 6-year-olds
    'Write a paragraph...', // Beyond Grade 1 capability
    'Research...', // Not age-appropriate
    'Independently read...', // Most can\'t read yet
    'Memorize...', // Rote learning without context
    'Copy from the board...', // Passive learning
    'Wait quietly...', // Unrealistic expectation
    'Share with the class...', // Too broad, anxiety-inducing
    'Explain why...', // Often too complex for Grade 1
  ]
};

// Subject-Specific Overrides
export const SUBJECT_SPECIFIC_RULES: Map<SubjectType, Partial<AIGenerationRules>> = new Map([
  ['Sciences de la nature', {
    ALWAYS: [
      'Include hands-on exploration',
      'Start with observable phenomena',
      'Use "I wonder" questions',
      'Include safety reminders for materials',
      'Connect to seasonal changes'
    ],
    NEVER: [
      'Use abstract scientific concepts',
      'Require written hypotheses',
      'Use dangerous materials',
      'Expect precise measurements'
    ]
  }],
  
  ['Mathématiques', {
    ALWAYS: [
      'Use manipulatives for every new concept',
      'Count real objects before abstract numbers',
      'Include pattern recognition',
      'Use number rhymes and songs',
      'Practice counting in meaningful contexts'
    ],
    NEVER: [
      'Introduce algorithms before conceptual understanding',
      'Use numbers above 20 before January',
      'Require fast mental math',
      'Use timed tests'
    ]
  }],
  
  ['Formation personnelle et sociale', {
    ALWAYS: [
      'Create emotionally safe environment',
      'Allow opt-out options',
      'Use puppets or stories for sensitive topics',
      'Respect family privacy',
      'Include calm-down strategies'
    ],
    NEVER: [
      'Force sharing of personal information',
      'Use scenarios that might trigger trauma',
      'Make assumptions about family structures',
      'Use body image comparisons'
    ]
  }]
]);

// Validation function for AI output
export function validateAIGeneration(
  lesson: any,
  context: LessonGenerationContext,
  subject: SubjectType
): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];
  const rules = GRADE1_FRENCH_IMMERSION_RULES;
  const subjectRules = SUBJECT_SPECIFIC_RULES.get(subject);
  
  // Check vocabulary limits
  const month = context.temporal.monthOfYear;
  const maxVocab = rules.vocabularyRules.maxPerLesson.get(month) || 3;
  if (lesson.vocabulary && lesson.vocabulary.length > maxVocab) {
    violations.push(`Too many vocabulary words: ${lesson.vocabulary.length} > ${maxVocab} for month ${month}`);
  }
  
  // Check for banned patterns in activities
  const allText = JSON.stringify(lesson.activities);
  for (const bannedPattern of rules.bannedPatterns) {
    if (allText.toLowerCase().includes(bannedPattern.toLowerCase())) {
      violations.push(`Contains banned pattern: "${bannedPattern}"`);
    }
  }
  
  // Check attention span rules
  if (lesson.activities?.action) {
    for (const activity of lesson.activities.action) {
      if (activity.duration > rules.attentionRules.maxContinuousInstruction) {
        violations.push(`Activity exceeds attention limit: ${activity.duration} minutes`);
      }
    }
  }
  
  // Check movement breaks
  const movementActivities = allText.match(/boug|mov|dans|saut|march|lev/gi) || [];
  if (movementActivities.length < rules.attentionRules.requiredMovementBreaks) {
    violations.push('Insufficient movement breaks for Grade 1');
  }
  
  return {
    isValid: violations.length === 0,
    violations
  };
}

// Helper function for AI to check if material is appropriate
export function isMaterialAppropriate(material: string, context: LessonGenerationContext): boolean {
  const inappropriate = [
    'scissors', // Needs close supervision
    'glue gun', // Dangerous
    'small beads', // Choking hazard
    'permanent markers', // Staining risk
    'stapler', // Injury risk
    'push pins', // Sharp
    'rubber cement', // Toxic fumes
    'spray paint', // Obviously no
    'exact-o knife', // Dangerous
    'hot plate', // Burn risk
  ];
  
  // September-November: limit scissors use
  if (context.temporal.monthOfYear <= 11 && material.includes('scissors')) {
    return false;
  }
  
  return !inappropriate.some(item => material.toLowerCase().includes(item));
}

// Energy-based activity selection
export function getAppropriateActivityEnergy(
  context: LessonGenerationContext
): 'calm' | 'moderate' | 'active' {
  const { energy, temporal } = context;
  
  // After recess/lunch: need calm
  if (temporal.timeOfDay === 'after-recess' || temporal.timeOfDay === 'after-lunch') {
    return 'calm';
  }
  
  // End of day Friday: need active
  if (temporal.dayOfWeek === 'Friday' && temporal.timeOfDay === 'end-of-day') {
    return 'active';
  }
  
  // Morning: moderate
  if (temporal.timeOfDay === 'morning') {
    return 'moderate';
  }
  
  // Default based on energy level
  switch (energy.expectedEnergyLevel) {
    case 'very-low': return 'active'; // Wake them up
    case 'low': return 'moderate';
    case 'moderate': return 'moderate';
    case 'high': return 'calm';
    case 'very-high': return 'calm'; // Settle them down
  }
}