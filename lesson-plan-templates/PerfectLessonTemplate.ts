/**
 * PERFECT LESSON PLAN TEMPLATE
 * Enforces best practices through structure
 * No hallucination-inducing fields
 */

export type SubjectType = 
  | 'Français (Immersion)'
  | 'Mathématiques'
  | 'Sciences de la nature'
  | 'Arts visuels'
  | 'Sciences humaines'
  | 'Formation personnelle et sociale';

export interface LessonPlanTemplate {
  // CORE IDENTIFIERS
  subject: SubjectType;
  unitTitle: string;
  lessonNumber: number;  // e.g., 3
  totalLessonsInUnit: number; // e.g., 10
  
  // LESSON BASICS
  title: string;
  titleEnglish?: string; // For teacher reference
  duration: 45; // Always 45 minutes
  
  // LEARNING OBJECTIVE (singular, clear)
  learningObjective: {
    statement: string; // "Students will be able to..."
    successCriteria: string[]; // 2-3 observable behaviors
  };
  
  // VOCABULARY (constrained by month)
  vocabulary: VocabularyItem[];
  
  // THREE-PART STRUCTURE
  mindsOn: Activity;
  action: Activity;
  consolidation: Activity;
  
  // MATERIALS (from standard supplies only)
  materials: string[];
  
  // ASSESSMENT (simple, observable)
  assessment: {
    method: 'observation' | 'exit-ticket' | 'thumbs-check' | 'partner-share';
    lookFor: string[]; // 2-3 specific things to observe
  };
  
  // DIFFERENTIATION (built into activities)
  differentiation: {
    support: string[]; // 2-3 strategies for struggling learners
    extension: string[]; // 1-2 options for fast finishers
  };
  
  // SAFETY (only if needed)
  safetyNotes?: string[];
}

export interface VocabularyItem {
  french: string;
  english: string;
  gesture: string; // Required for Grade 1
  visualCue: string; // Required for Grade 1
}

export interface Activity {
  description: string;
  duration: number;
  steps: string[]; // 3-5 clear steps
  grouping: 'whole-class' | 'partners' | 'small-groups' | 'individual';
  materials: string[];
  includesMovement: boolean; // Must be true for at least one activity
  teacherLanguage: {
    french: string[]; // Key phrases teacher will use
    english: string[]; // English support as needed
  };
}

// CONSTRAINTS BY MONTH
export const MONTHLY_CONSTRAINTS = {
  vocabularyLimit: new Map([
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
  
  frenchPercentage: new Map([
    [9, 30],  // September
    [10, 40], // October
    [11, 50], // November
    [12, 60], // December
    [1, 65],  // January
    [2, 70],  // February
    [3, 75],  // March
    [4, 80],  // April
    [5, 85],  // May
    [6, 85]   // June
  ])
};

// VALIDATION FUNCTION
export function validateLesson(lesson: LessonPlanTemplate, month: number): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check vocabulary limit
  const vocabLimit = MONTHLY_CONSTRAINTS.vocabularyLimit.get(month) || 3;
  if (lesson.vocabulary.length > vocabLimit) {
    errors.push(`Too many vocabulary items: ${lesson.vocabulary.length} > ${vocabLimit}`);
  }
  
  // Check duration
  if (lesson.mindsOn.duration + lesson.action.duration + lesson.consolidation.duration !== 45) {
    errors.push('Activities must total 45 minutes');
  }
  
  // Check for movement
  const hasMovement = lesson.mindsOn.includesMovement || 
                     lesson.action.includesMovement || 
                     lesson.consolidation.includesMovement;
  if (!hasMovement) {
    errors.push('At least one activity must include movement');
  }
  
  // Check activity durations
  if (lesson.mindsOn.duration < 5 || lesson.mindsOn.duration > 15) {
    errors.push('Minds On should be 5-15 minutes');
  }
  if (lesson.action.duration < 25 || lesson.action.duration > 35) {
    errors.push('Action should be 25-35 minutes');
  }
  if (lesson.consolidation.duration < 5 || lesson.consolidation.duration > 10) {
    errors.push('Consolidation should be 5-10 minutes');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// STANDARD CLASSROOM MATERIALS
export const STANDARD_MATERIALS = [
  'crayons',
  'markers', 
  'pencils',
  'erasers',
  'paper',
  'construction paper',
  'glue sticks',
  'scissors',
  'unifix cubes',
  'counting bears',
  'pattern blocks',
  'dice',
  'number cards',
  'books',
  'whiteboard',
  'chart paper'
];

// ASSESSMENT METHODS FOR GRADE 1
export const ASSESSMENT_METHODS = {
  'observation': 'Teacher observes and notes student behaviors',
  'exit-ticket': 'Students draw or write one thing they learned',
  'thumbs-check': 'Students show understanding with thumb position',
  'partner-share': 'Students tell partner key learning'
};

// ACTUALLY PERFECT AI PROMPT GENERATOR
export function generateAIPrompt(
  subject: SubjectType,
  unitTitle: string,
  lessonNumber: number,
  totalLessons: number,
  month: number
): string {
  const vocabLimit = MONTHLY_CONSTRAINTS.vocabularyLimit.get(month) || 3;
  const frenchPercent = MONTHLY_CONSTRAINTS.frenchPercentage.get(month) || 30;
  const focus = getSubjectFocus(subject);
  
  return `Grade 1 French Immersion ${subject} lesson for "${unitTitle}" (lesson ${lessonNumber}/${totalLessons}).

Requirements:
- 45 minutes: Opening (≈10 min), Main activity (≈30 min), Closing (≈5 min)
- Language: ${frenchPercent}% French, max ${vocabLimit} new vocabulary
- Include: movement, partner work, visual supports for vocabulary
- Materials: standard classroom supplies only

${focus}

Generate: title, objectives, vocabulary with gestures, three activities, and assessment method.

Focus on hands-on learning appropriate for 6-year-olds.`;
}

// SIMPLE SUBJECT FOCUS (one line each)
function getSubjectFocus(subject: SubjectType): string {
  const focuses: Record<SubjectType, string> = {
    'Français (Immersion)': 'Emphasize oral language, songs, and stories.',
    'Mathématiques': 'Use manipulatives and counting objects.',
    'Sciences de la nature': 'Start with observation and hands-on exploration.',
    'Arts visuels': 'Focus on process over product, exploration over technique.',
    'Sciences humaines': 'Connect to students\' families and classroom community.',
    'Formation personnelle et sociale': 'Ensure emotional safety, provide opt-out options.'
  };
  return focuses[subject] || '';
}