/**
 * 🛡️ PRE-GENERATION VALIDATOR
 * Validates context BEFORE AI generates lesson
 * Prevents invalid generation attempts
 */

import { LessonGenerationContext } from '../types/LessonContext';
import { SubjectType } from '../types/LessonPlanTemplate';

export interface PreGenerationValidation {
  canGenerate: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

export function validatePreGeneration(
  context: LessonGenerationContext,
  subject: SubjectType
): PreGenerationValidation {
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];
  
  // CRITICAL: Check for problematic dates
  const problematicDates = checkProblematicDates(context);
  if (problematicDates.length > 0) {
    warnings.push(...problematicDates);
  }
  
  // CHECK: Appropriate progression
  const progressionIssues = checkProgression(context);
  if (progressionIssues.length > 0) {
    errors.push(...progressionIssues);
  }
  
  // CHECK: Energy level compatibility
  const energyIssues = checkEnergyCompatibility(context, subject);
  if (energyIssues.length > 0) {
    warnings.push(...energyIssues);
  }
  
  // CHECK: Material availability
  const materialIssues = checkMaterialAvailability(context, subject);
  if (materialIssues.length > 0) {
    warnings.push(...materialIssues);
  }
  
  // GENERATE: Recommendations
  recommendations.push(...generateRecommendations(context, subject));
  
  return {
    canGenerate: errors.length === 0,
    warnings,
    errors,
    recommendations
  };
}

function checkProblematicDates(context: LessonGenerationContext): string[] {
  const warnings: string[] = [];
  const { temporal, cultural } = context;
  
  // Day before holiday - attention will be poor
  if (temporal.proximityToHoliday?.includes('day before')) {
    warnings.push('Day before holiday: Keep activities highly engaging and active');
  }
  
  // Day after holiday - routines disrupted
  if (temporal.proximityToHoliday?.includes('day after')) {
    warnings.push('Day after holiday: Re-establish routines, expect lower retention');
  }
  
  // Picture day - schedule disrupted
  if (cultural.schoolEvents.some(e => e.toLowerCase().includes('picture day'))) {
    warnings.push('Picture day: Schedule disrupted, keep lesson flexible');
  }
  
  // December lessons - holiday excitement
  if (temporal.monthOfYear === 12) {
    warnings.push('December: High excitement levels, need calm activities');
  }
  
  // June lessons - end of year restlessness
  if (temporal.monthOfYear === 6) {
    warnings.push('June: End-of-year restlessness, keep highly engaging');
  }
  
  // Monday morning - slow start
  if (temporal.dayOfWeek === 'Monday' && temporal.timeOfDay === 'morning') {
    warnings.push('Monday morning: Gentle start needed, build energy gradually');
  }
  
  // Friday afternoon - high energy
  if (temporal.dayOfWeek === 'Friday' && temporal.timeOfDay === 'end-of-day') {
    warnings.push('Friday afternoon: Very high energy, need active learning');
  }
  
  return warnings;
}

function checkProgression(context: LessonGenerationContext): string[] {
  const errors: string[] = [];
  const { progression } = context;
  
  // Can't be lesson 10 without previous 9
  if (progression.lessonsCompletedInUnit > 0) {
    if (!progression.keyConceptsPreviouslyTaught || 
        progression.keyConceptsPreviouslyTaught.length === 0) {
      errors.push('Cannot generate lesson without knowing previous concepts taught');
    }
  }
  
  // Can't introduce advanced concepts too early
  if (progression.lessonsCompletedInUnit < 3) {
    if (progression.skillsCurrentlyDeveloping && 
        progression.skillsCurrentlyDeveloping.some(s => 
          s.includes('advanced') || s.includes('complex'))) {
      errors.push('Complex skills cannot be introduced in first 3 lessons of unit');
    }
  }
  
  // Check vocabulary progression
  if (progression.vocabularyPreviouslyIntroduced) {
    const vocabCount = progression.vocabularyPreviouslyIntroduced.length;
    const expectedMax = progression.lessonsCompletedInUnit * 5; // Max 5 per lesson
    if (vocabCount > expectedMax) {
      errors.push(`Vocabulary count (${vocabCount}) exceeds reasonable progression`);
    }
  }
  
  return errors;
}

function checkEnergyCompatibility(
  context: LessonGenerationContext,
  subject: SubjectType
): string[] {
  const warnings: string[] = [];
  const { energy, temporal } = context;
  
  // High energy + sitting subject = problem
  if (energy.expectedEnergyLevel === 'very-high') {
    if (subject === 'Mathématiques' || subject === 'Français (Immersion)') {
      warnings.push('Very high energy: Add extra movement breaks for academic subjects');
    }
  }
  
  // Low energy + active subject = adjust
  if (energy.expectedEnergyLevel === 'very-low') {
    if (subject === 'Arts visuels' || subject === 'Sciences de la nature') {
      warnings.push('Very low energy: Start with energizing activity');
    }
  }
  
  // After recess = settling needed
  if (temporal.timeOfDay === 'after-recess') {
    warnings.push('Post-recess: Start with calming activity to transition');
  }
  
  // Before lunch = hunger distraction
  if (temporal.timeOfDay === 'before-lunch') {
    warnings.push('Pre-lunch hunger: Keep activities short and engaging');
  }
  
  return warnings;
}

function checkMaterialAvailability(
  context: LessonGenerationContext,
  subject: SubjectType
): string[] {
  const warnings: string[] = [];
  const { classroom } = context;
  
  // Science without materials
  if (subject === 'Sciences de la nature') {
    if (!classroom.availableManipulatives || classroom.availableManipulatives.length < 5) {
      warnings.push('Limited science materials: Focus on observation and found objects');
    }
  }
  
  // Math without manipulatives
  if (subject === 'Mathématiques') {
    const mathManipulatives = classroom.availableManipulatives?.filter(m => 
      m.includes('cube') || m.includes('block') || m.includes('counter')
    );
    if (!mathManipulatives || mathManipulatives.length === 0) {
      warnings.push('No math manipulatives: Use classroom objects for counting');
    }
  }
  
  // Arts without supplies
  if (subject === 'Arts visuels') {
    if (!classroom.commonClassroomMaterials?.includes('construction paper')) {
      warnings.push('Limited art supplies: Focus on drawing and found materials');
    }
  }
  
  // Space limitations
  if (classroom.spaceLimitations?.includes('small classroom')) {
    warnings.push('Small classroom: Avoid whole-class movement activities');
  }
  
  return warnings;
}

function generateRecommendations(
  context: LessonGenerationContext,
  subject: SubjectType
): string[] {
  const recommendations: string[] = [];
  const { temporal, progression, energy } = context;
  
  // September recommendations
  if (temporal.monthOfYear === 9) {
    recommendations.push('September: Focus on routines, classroom community, basic vocabulary');
    recommendations.push('Use lots of visuals and gestures, minimal French text');
  }
  
  // First lesson of unit
  if (progression.lessonsCompletedInUnit === 0) {
    recommendations.push('First lesson: Hook engagement, establish vocabulary, build interest');
  }
  
  // Last lesson of unit
  if (progression.lessonsCompletedInUnit === progression.totalLessonsInUnit - 1) {
    recommendations.push('Final lesson: Celebration of learning, review, student sharing');
  }
  
  // Subject-specific recommendations
  switch (subject) {
    case 'Français (Immersion)':
      if (temporal.monthOfYear <= 10) {
        recommendations.push('Early year French: Focus on oral language, songs, repetition');
      }
      break;
      
    case 'Mathématiques':
      if (progression.conceptsNeedingReview?.includes('counting')) {
        recommendations.push('Review counting: Integrate into transitions and routines');
      }
      break;
      
    case 'Sciences de la nature':
      if (temporal.season === 'fall' || temporal.season === 'spring') {
        recommendations.push('Seasonal opportunity: Take learning outside if possible');
      }
      break;
      
    case 'Formation personnelle et sociale':
      if (energy.attentionChallenges.includes('post-conflict')) {
        recommendations.push('Post-conflict: Include emotion regulation activities');
      }
      break;
  }
  
  // Energy-based recommendations
  if (energy.expectedEnergyLevel === 'very-high') {
    recommendations.push('High energy: Start with movement, use active learning throughout');
  } else if (energy.expectedEnergyLevel === 'very-low') {
    recommendations.push('Low energy: Use engaging hooks, keep pace dynamic, add movement');
  }
  
  // Time-based recommendations
  if (temporal.timeOfDay === 'morning') {
    recommendations.push('Morning: Good time for new concept introduction');
  } else if (temporal.timeOfDay === 'end-of-day') {
    recommendations.push('End of day: Review and consolidation work best');
  }
  
  return recommendations;
}

// Special handling for extreme cases
export function handleExtremeContext(context: LessonGenerationContext): {
  shouldProceed: boolean;
  alternativeSuggestion?: string;
} {
  const { temporal, cultural, energy } = context;
  
  // Halloween day - impossible to teach normally
  if (temporal.proximityToHoliday === 'day of Halloween') {
    return {
      shouldProceed: false,
      alternativeSuggestion: 'Halloween day: Use halloween-themed activities only'
    };
  }
  
  // Last day of school
  if (temporal.monthOfYear === 6 && temporal.weekOfSchoolYear >= 39) {
    return {
      shouldProceed: false,
      alternativeSuggestion: 'Last week: Fun reviews, games, celebrations only'
    };
  }
  
  // Fire drill scheduled
  if (cultural.schoolEvents.some(e => e.toLowerCase().includes('fire drill'))) {
    return {
      shouldProceed: true,
      alternativeSuggestion: 'Fire drill day: Plan lesson in short segments'
    };
  }
  
  // First day back from break
  if (temporal.proximityToHoliday === 'first day after break') {
    return {
      shouldProceed: true,
      alternativeSuggestion: 'First day back: Re-establish routines, review previous learning'
    };
  }
  
  return { shouldProceed: true };
}