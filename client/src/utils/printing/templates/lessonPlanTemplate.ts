/**
 * Lesson Plan Template Module
 * 
 * Generates HTML for lesson plan documents using reusable components.
 * Replaces the large generateLessonPlanHTML function with a clean, modular approach.
 */

import {
  createHTMLDocument,
  createLessonPlanHeader,
  createLessonInfoGrid,
  createSection,
  createThreePartLesson,
  createListSection,
  createLessonDifferentiationGrid,
  createSubFriendlyNotes,
  createGeneratedFooter
} from '../components/htmlComponents';
import { getLessonPlanStyles } from '../styles/printStyles';
import type { LessonPlan, UnitPlanReference } from '../types';

/**
 * Generates complete HTML for a lesson plan document
 * 
 * @param lessonPlan - The lesson plan data
 * @param unitPlan - Optional unit plan reference
 * @returns Complete HTML string ready for printing
 */
export function generateLessonPlanHTML(lessonPlan: LessonPlan, unitPlan?: UnitPlanReference): string {
  const title = `${lessonPlan.title} - Lesson Plan`;
  const styles = getLessonPlanStyles();
  
  // Build document body using reusable components
  const bodyParts: string[] = [
    // Header with title, unit, and date
    createLessonPlanHeader(lessonPlan, unitPlan),
    
    // Lesson metadata grid (duration, grouping, assessment, sub-friendly)
    createLessonInfoGrid(lessonPlan),
    
    // Learning Goals section
    createSection('Learning Goals', lessonPlan.learningGoals, 'section', 'no-break'),
    
    // Three-part lesson structure (Minds On, Action, Consolidation)
    createThreePartLesson(lessonPlan),
    
    // Materials needed
    createListSection('Materials Needed', lessonPlan.materials, 'section', 'no-break'),
    
    // Differentiation grid (accommodations, modifications, extensions)
    createLessonDifferentiationGrid(
      lessonPlan.accommodations,
      lessonPlan.modifications,
      lessonPlan.extensions
    ),
    
    // Sub-friendly notes (if applicable)
    createSubFriendlyNotes(lessonPlan),
    
    // Assessment notes
    createSection('Assessment Notes', lessonPlan.assessmentNotes, 'section', 'no-break'),
    
    // Generated footer
    createGeneratedFooter()
  ];
  
  // Filter out empty sections and join
  const body = bodyParts.filter(part => part.trim() !== '').join('\n');
  
  return createHTMLDocument(title, styles, body);
}

/**
 * Validates lesson plan data before generating HTML
 * 
 * @param lessonPlan - The lesson plan data to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateLessonPlan(lessonPlan: LessonPlan): string[] {
  const errors: string[] = [];
  
  if (!lessonPlan.title || lessonPlan.title.trim() === '') {
    errors.push('Lesson plan title is required');
  }
  
  if (!lessonPlan.date) {
    errors.push('Lesson date is required');
  }
  
  if (!lessonPlan.duration || lessonPlan.duration <= 0) {
    errors.push('Lesson duration must be greater than 0');
  }
  
  if (lessonPlan.duration && lessonPlan.duration > 480) { // 8 hours max
    errors.push('Lesson duration seems unusually long (over 8 hours)');
  }
  
  return errors;
}

/**
 * Calculates time allocations for the three-part lesson structure
 * 
 * @param duration - Total lesson duration in minutes
 * @returns Object with time allocations for each part
 */
export function calculateLessonTiming(duration: number): {
  mindsOn: number;
  action: number;
  consolidation: number;
  total: number;
} {
  const mindsOn = Math.round(duration * 0.15);
  const action = Math.round(duration * 0.70);
  const consolidation = Math.round(duration * 0.15);
  
  return {
    mindsOn,
    action,
    consolidation,
    total: mindsOn + action + consolidation
  };
}

/**
 * Generates a preview summary of the lesson plan content
 * 
 * @param lessonPlan - The lesson plan data
 * @returns Object with preview information
 */
export function getLessonPlanPreview(lessonPlan: LessonPlan): {
  title: string;
  date: string;
  duration: string;
  timing: ReturnType<typeof calculateLessonTiming>;
  sectionsCount: number;
  hasMaterials: boolean;
  hasDifferentiation: boolean;
  isSubFriendly: boolean;
} {
  const timing = calculateLessonTiming(lessonPlan.duration);
  
  let sectionsCount = 0;
  if (lessonPlan.learningGoals) {
sectionsCount++;
}
  if (lessonPlan.mindsOn) {
sectionsCount++;
}
  if (lessonPlan.action) {
sectionsCount++;
}
  if (lessonPlan.consolidation) {
sectionsCount++;
}
  if (lessonPlan.materials?.length) {
sectionsCount++;
}
  if (lessonPlan.accommodations?.length || lessonPlan.modifications?.length || lessonPlan.extensions?.length) {
sectionsCount++;
}
  if (lessonPlan.assessmentNotes) {
sectionsCount++;
}
  if (lessonPlan.isSubFriendly && lessonPlan.subNotes) {
sectionsCount++;
}
  
  return {
    title: lessonPlan.title,
    date: new Date(lessonPlan.date).toLocaleDateString(),
    duration: `${lessonPlan.duration} minutes`,
    timing,
    sectionsCount,
    hasMaterials: Boolean(lessonPlan.materials?.length),
    hasDifferentiation: Boolean(
      lessonPlan.accommodations?.length || 
      lessonPlan.modifications?.length || 
      lessonPlan.extensions?.length
    ),
    isSubFriendly: Boolean(lessonPlan.isSubFriendly)
  };
}

/**
 * Generates a quick checklist for lesson plan completeness
 * 
 * @param lessonPlan - The lesson plan data
 * @returns Object indicating which sections are complete
 */
export function getLessonPlanCompleteness(lessonPlan: LessonPlan): {
  hasLearningGoals: boolean;
  hasMindsOn: boolean;
  hasAction: boolean;
  hasConsolidation: boolean;
  hasMaterials: boolean;
  hasAssessment: boolean;
  completenessScore: number;
} {
  const checks = {
    hasLearningGoals: Boolean(lessonPlan.learningGoals?.trim()),
    hasMindsOn: Boolean(lessonPlan.mindsOn?.trim()),
    hasAction: Boolean(lessonPlan.action?.trim()),
    hasConsolidation: Boolean(lessonPlan.consolidation?.trim()),
    hasMaterials: Boolean(lessonPlan.materials?.length),
    hasAssessment: Boolean(lessonPlan.assessmentType?.trim() || lessonPlan.assessmentNotes?.trim())
  };
  
  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = Object.keys(checks).length;
  const completenessScore = Math.round((completedCount / totalCount) * 100);
  
  return {
    ...checks,
    completenessScore
  };
}