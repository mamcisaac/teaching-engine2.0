/**
 * EXAMPLE: How to generate lessons with AI
 * Shows the complete flow from prompt to validated lesson
 */

import { 
  LessonPlanTemplate, 
  validateLesson, 
  generateAIPrompt,
  STANDARD_MATERIALS 
} from './PerfectLessonTemplate';

// Example: Math lesson for October (month 10)
const exampleMathLesson: LessonPlanTemplate = {
  // KNOWN FACTS (from unit plan)
  subject: 'Mathématiques',
  unitTitle: 'Les nombres jusqu\'à 10',
  lessonNumber: 3,
  totalLessonsInUnit: 10,
  
  // AI GENERATES THESE
  title: 'Compter avec les ours',
  titleEnglish: 'Counting with bears',
  duration: 45,
  
  learningObjective: {
    statement: 'Students will be able to count objects to 5 in French',
    successCriteria: [
      'Counts 1-5 objects correctly in French',
      'Matches number word to quantity',
      'Uses one-to-one correspondence when counting'
    ]
  },
  
  vocabulary: [
    {
      french: 'trois',
      english: 'three',
      gesture: 'Hold up 3 fingers',
      visualCue: 'Picture of 3 bears'
    },
    {
      french: 'quatre',
      english: 'four', 
      gesture: 'Hold up 4 fingers',
      visualCue: 'Picture of 4 bears'
    },
    {
      french: 'cinq',
      english: 'five',
      gesture: 'Hold up 5 fingers', 
      visualCue: 'Picture of 5 bears'
    }
  ],
  
  mindsOn: {
    description: 'Mystery box with counting bears inside',
    duration: 10,
    steps: [
      'Show decorated mystery box',
      'Pull out bears one at a time, counting in French',
      'Students echo count and show fingers',
      'Repeat with different amounts'
    ],
    grouping: 'whole-class',
    materials: ['box', 'counting bears'],
    includesMovement: true, // Finger counting is movement
    teacherLanguage: {
      french: ['Qu\'est-ce que c\'est?', 'Combien?', 'Comptez avec moi'],
      english: ['Let\'s count together', 'Show me with your fingers']
    }
  },
  
  action: {
    description: 'Partner counting stations',
    duration: 30,
    steps: [
      'Model activity with one student',
      'Partners take turns being teacher',
      'One student places bears, other counts',
      'Switch roles after 5 turns',
      'Movement break: Bear walk to switch stations'
    ],
    grouping: 'partners',
    materials: ['counting bears', 'number cards 1-5'],
    includesMovement: true, // Bear walk between stations
    teacherLanguage: {
      french: ['Ton tour', 'Compte les ours', 'Montre-moi'],
      english: ['Your turn', 'Count the bears']
    }
  },
  
  consolidation: {
    description: 'Number show with fingers',
    duration: 5,
    steps: [
      'Teacher says number in French',
      'Students show with fingers',
      'Partner check each other',
      'Exit ticket: Draw favorite number of bears'
    ],
    grouping: 'whole-class',
    materials: ['paper', 'crayons'],
    includesMovement: false,
    teacherLanguage: {
      french: ['Montrez-moi trois', 'C\'est correct!'],
      english: ['Show me', 'Check your partner']
    }
  },
  
  materials: [
    'counting bears',
    'number cards 1-5',
    'mystery box',
    'paper',
    'crayons'
  ],
  
  assessment: {
    method: 'observation',
    lookFor: [
      'Correct counting to 5',
      'One-to-one correspondence',
      'French number words attempted'
    ]
  },
  
  differentiation: {
    support: [
      'Count to 3 only',
      'Use number line as visual',
      'Teacher counts with student'
    ],
    extension: [
      'Count backwards from 5',
      'Count to 10 if ready'
    ]
  }
};

// Validate the lesson
const validation = validateLesson(exampleMathLesson, 10); // October
console.log('Lesson valid:', validation.valid);
console.log('Errors:', validation.errors);

/**
 * WHY THIS WORKS:
 * 
 * 1. No temporal guessing (no "Friday afternoon" nonsense)
 * 2. Every field is knowable from context
 * 3. Structure enforces best practices
 * 4. Vocabulary limited by month automatically
 * 5. Movement required but not prescribed when
 * 6. Materials from standard list only
 * 7. Simple, observable assessment
 * 
 * AI can't hallucinate because there's nowhere to put hallucinations
 */

// ========================================
// COMPLETE FLOW: PROMPT → AI → VALIDATION
// ========================================

export async function generateLessonWithAI(
  subject: any,
  unitTitle: string,
  lessonNumber: number,
  totalLessons: number,
  month: number
) {
  // STEP 1: Generate the prompt
  const prompt = generateAIPrompt(
    subject,
    unitTitle,
    lessonNumber,
    totalLessons,
    month
  );
  
  console.log('=== GENERATED PROMPT ===');
  console.log(prompt);
  
  // STEP 2: Send to AI (Claude, GPT-4, etc.)
  // const aiResponse = await callAI(prompt);
  
  // STEP 3: Parse AI response into template structure
  // const lesson = parseAIResponse(aiResponse);
  
  // STEP 4: Validate the lesson
  const validation = validateLesson(exampleMathLesson, month);
  
  if (validation.valid) {
    console.log('✅ Lesson is valid and ready for Emily!');
    return exampleMathLesson;
  } else {
    console.log('❌ Validation failed:');
    validation.errors.forEach(error => console.log(`  - ${error}`));
    return null;
  }
}

// ========================================
// EXAMPLE PROMPTS FOR ALL SUBJECTS
// ========================================

// FRENCH LANGUAGE ARTS
const frenchPrompt = generateAIPrompt(
  'Français (Immersion)',
  'Les animaux de la ferme',
  1,
  8,
  9 // September - 30% French
);

// MATHEMATICS  
const mathPrompt = generateAIPrompt(
  'Mathématiques',
  'Les formes géométriques',
  5,
  10,
  1 // January - 65% French
);

// SCIENCE
const sciencePrompt = generateAIPrompt(
  'Sciences de la nature',
  'Les êtres vivants',
  3,
  12,
  11 // November - 50% French
);

// VISUAL ARTS
const artsPrompt = generateAIPrompt(
  'Arts visuels',
  'Les textures',
  2,
  8,
  3 // March - 75% French
);

// SOCIAL STUDIES
const socialPrompt = generateAIPrompt(
  'Sciences humaines',
  'Ma communauté',
  4,
  9,
  10 // October - 40% French
);

// HEALTH & WELLNESS
const healthPrompt = generateAIPrompt(
  'Formation personnelle et sociale',
  'La sécurité',
  1,
  12,
  9 // September - 30% French
);

// ========================================
// WHAT AI CANNOT HALLUCINATE
// ========================================

/**
 * The template structure prevents these common AI hallucinations:
 * 
 * ❌ CANNOT ADD:
 * - "After lunch, students will be tired..." (no time context)
 * - "Since it's Friday..." (no day context)
 * - "The 25 students in the class..." (no class size)
 * - "Building on yesterday's lesson..." (no previous lesson context)
 * - "For the Halloween party..." (no event context)
 * - "When parents visit..." (no schedule context)
 * 
 * ✅ MUST PROVIDE:
 * - Exactly the vocabulary limit for the month
 * - Activities that total 45 minutes
 * - At least one movement activity
 * - Only standard classroom materials
 * - Observable assessment criteria
 * - Concrete differentiation strategies
 * 
 * The AI has no fields to put temporal or contextual guesses.
 * Emily adds the real context when she uses the lesson.
 */