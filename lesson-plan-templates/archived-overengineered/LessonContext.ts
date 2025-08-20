/**
 * 🎯 LESSON CONTEXT FOR AI GENERATION
 * Critical context that AI needs to generate appropriate lessons
 */

export interface TemporalContext {
  monthOfYear: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  weekOfSchoolYear: number; // 1-40
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeOfDay: 'morning' | 'after-recess' | 'before-lunch' | 'after-lunch' | 'end-of-day';
  proximityToHoliday?: string; // "day before Halloween", "week after Christmas break"
  season: 'fall' | 'winter' | 'spring' | 'summer';
}

export interface ProgressionContext {
  lessonsCompletedInUnit: number;
  totalLessonsInUnit: number;
  keyConceptsPreviouslyTaught: string[];
  vocabularyPreviouslyIntroduced: string[];
  skillsCurrentlyDeveloping: string[];
  assessmentDataAvailable?: {
    conceptsNeedingReview: string[];
    conceptsMastered: string[];
  };
}

export interface Grade1Constraints {
  maxNewVocabularyPerLesson: number; // 3-5 for Grade 1
  maxContinuousFocusMinutes: number; // 7-10 for Grade 1
  frenchToEnglishRatio: number; // 0.3 in Sept → 0.8 in June
  concreteToAbstractRatio: number; // 0.9 for Grade 1 (mostly concrete)
  movementBreaksRequired: number; // Every 10-15 minutes
}

export interface ClassroomReality {
  typicalClassSize: number; // 20-25 for Grade 1
  availableManipulatives: string[]; // What's actually in the classroom
  availableTechnology: string[]; // Realistic for typical school
  commonClassroomMaterials: string[]; // Standard supplies
  spaceLimitations?: string[]; // "small classroom", "no sink"
}

export interface DailyRoutineIntegration {
  morningRoutines: string[]; // Calendar, weather, attendance
  classroomJobs?: string[]; // Line leader, materials helper
  establishedSignals: string[]; // Attention getters already in use
  snackTime?: string; // When/how snack happens
  cleanupRoutines: string[]; // Established cleanup procedures
}

export interface EnergyPatterns {
  expectedEnergyLevel: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  attentionChallenges: string[]; // "post-recess excitement", "pre-lunch hunger"
  recommendedPacing: 'slower' | 'normal' | 'dynamic';
}

export interface CulturalCalendarContext {
  upcomingEvents: string[]; // "Picture day tomorrow", "Concert practice this week"
  culturalObservances: string[]; // "Ramadan", "Indigenous History Month"
  schoolEvents: string[]; // "Assembly this morning", "Fire drill scheduled"
  seasonalConsiderations: string[]; // "First snow excitement", "Spring fever"
}

// Aggregate context for AI generation
export interface LessonGenerationContext {
  temporal: TemporalContext;
  progression: ProgressionContext;
  constraints: Grade1Constraints;
  classroom: ClassroomReality;
  routines: DailyRoutineIntegration;
  energy: EnergyPatterns;
  cultural: CulturalCalendarContext;
}

// Grade 1 French Immersion specific presets
export const GRADE1_DEFAULTS = {
  constraints: {
    september: {
      maxNewVocabularyPerLesson: 3,
      maxContinuousFocusMinutes: 7,
      frenchToEnglishRatio: 0.3,
      concreteToAbstractRatio: 0.95,
      movementBreaksRequired: 3
    },
    january: {
      maxNewVocabularyPerLesson: 4,
      maxContinuousFocusMinutes: 10,
      frenchToEnglishRatio: 0.6,
      concreteToAbstractRatio: 0.9,
      movementBreaksRequired: 2
    },
    june: {
      maxNewVocabularyPerLesson: 5,
      maxContinuousFocusMinutes: 12,
      frenchToEnglishRatio: 0.8,
      concreteToAbstractRatio: 0.85,
      movementBreaksRequired: 2
    }
  },
  
  energyPatterns: {
    mondayMorning: { expectedEnergyLevel: 'low', recommendedPacing: 'slower' },
    fridayAfternoon: { expectedEnergyLevel: 'very-high', recommendedPacing: 'dynamic' },
    afterRecess: { expectedEnergyLevel: 'high', recommendedPacing: 'dynamic' },
    beforeLunch: { expectedEnergyLevel: 'low', recommendedPacing: 'slower' }
  },
  
  typicalMaterials: [
    'crayons', 'markers', 'pencils', 'erasers', 'glue sticks', 'scissors',
    'construction paper', 'white paper', 'lined paper', 'chart paper',
    'unifix cubes', 'base-10 blocks', 'pattern blocks', 'counting bears',
    'dice', 'playing cards', 'number lines', 'hundreds chart',
    'books', 'flashcards', 'pocket chart', 'calendar',
    'whiteboard', 'markers', 'erasers'
  ]
};