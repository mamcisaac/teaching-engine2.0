/**
 * SIMPLIFIED LESSON TEMPLATE FOR AI GENERATION
 * Only what AI actually needs to know
 */

export interface SimpleLessonTemplate {
  // WHAT WE KNOW
  subject: string;
  unitTitle: string;
  lessonNumber: number; // e.g., 3 of 10
  monthOfYear: number; // For French percentage only
  
  // ETFO STRUCTURE (always the same)
  structure: {
    mindsOn: 10;     // minutes
    action: 30;      // minutes  
    consolidation: 5; // minutes
  };
  
  // GENERATED CONTENT
  title: string;
  vocabulary: string[]; // Max 3-5 based on month
  activities: {
    mindsOn: string;
    action: string;
    consolidation: string;
  };
  materials: string[]; // From standard classroom supplies only
  assessment: string; // Simple observation
}

// WHAT AI MUST FOLLOW (not context-dependent)
export const GRADE1_RULES = {
  // By month (only thing that changes)
  vocabularyMax: {
    9: 3,  // September
    10: 3, // October
    11: 4, // November
    12: 4, // December
    1: 4,  // January
    2: 5,  // February
    3: 5,  // March
    4: 5,  // April
    5: 5,  // May
    6: 5   // June
  },
  
  frenchPercentage: {
    9: 30,  // September
    10: 40, // October
    11: 50, // November
    12: 60, // December
    1: 65,  // January
    2: 70,  // February
    3: 75,  // March
    4: 80,  // April
    5: 85,  // May
    6: 85   // June
  },
  
  // ALWAYS TRUE for Grade 1
  alwaysInclude: [
    'visual supports',
    'movement break',
    'partner talk',
    'concrete materials'
  ],
  
  // NEVER for Grade 1
  neverUse: [
    'silent independent work over 5 minutes',
    'abstract discussion',
    'worksheets as main activity',
    'reading beyond Grade 1 level',
    'writing more than 3 sentences'
  ],
  
  // Standard materials (always available)
  standardMaterials: [
    'crayons', 'markers', 'pencils', 'paper',
    'glue sticks', 'scissors', 'unifix cubes',
    'counting bears', 'dice', 'books'
  ]
};

// SIMPLE PROMPT TEMPLATE
export function generatePrompt(
  subject: string,
  unitTitle: string,
  lessonNumber: number,
  totalLessons: number,
  month: number
): string {
  const vocabMax = GRADE1_RULES.vocabularyMax[month] || 3;
  const frenchPercent = GRADE1_RULES.frenchPercentage[month] || 30;
  
  return `
Generate a Grade 1 French Immersion ${subject} lesson.

CONTEXT:
- Unit: ${unitTitle}
- Lesson ${lessonNumber} of ${totalLessons}
- Month: ${month} (Use ${frenchPercent}% French, ${100-frenchPercent}% English)
- Max new vocabulary: ${vocabMax} words

STRUCTURE (45 minutes total):
1. Minds On (10 min): Engaging hook with movement or mystery
2. Action (30 min): Hands-on learning with 1-2 movement breaks
3. Consolidation (5 min): Quick wrap-up (thumbs up/down, exit ticket, or partner share)

REQUIREMENTS:
- Use concrete materials (manipulatives, real objects)
- Include visual supports for all new vocabulary
- Add gestures for French words
- Include partner talk (not whole class sharing)
- Keep instructions simple (one step at a time)

DO NOT:
- Use worksheets as main activity
- Expect silent work over 5 minutes
- Have abstract discussions
- Ask "why" questions (too complex)
- Assume reading/writing ability

MATERIALS:
Use only standard classroom supplies: crayons, paper, scissors, glue, counting bears, dice, etc.

Generate: title, vocabulary list, three activities, materials needed, and simple assessment method.`;
}