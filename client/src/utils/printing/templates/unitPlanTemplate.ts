/**
 * Unit Plan Template Module
 * 
 * Generates HTML for unit plan documents using reusable components.
 * Replaces the massive 271-line generateUnitPlanHTML function with a clean, modular approach.
 */

import {
  createHTMLDocument,
  createUnitPlanHeader,
  createMetadataSection,
  createSection,
  createListSection,
  createVocabularyGrid,
  createExpectationsSection,
  createDifferentiationGrid,
  createGeneratedFooter
} from '../components/htmlComponents';
import { getUnitPlanStyles } from '../styles/printStyles';
import type { UnitPlan, LongRangePlan } from '../types';

/**
 * Generates complete HTML for a unit plan document
 * 
 * @param unitPlan - The unit plan data
 * @param longRangePlan - Optional long-range plan reference
 * @returns Complete HTML string ready for printing
 */
export function generateUnitPlanHTML(unitPlan: UnitPlan, longRangePlan?: LongRangePlan): string {
  const title = `${unitPlan.title} - Unit Plan`;
  const styles = getUnitPlanStyles();
  
  // Build document body using reusable components
  const bodyParts: string[] = [
    // Header with title, dates, and optional info
    createUnitPlanHeader(unitPlan, longRangePlan),
    
    // Unit overview metadata
    createMetadataSection('Unit Overview', unitPlan.description),
    
    // Big Ideas section
    createSection('Big Ideas', unitPlan.bigIdeas, 'section', 'no-break'),
    
    // Essential Questions
    createListSection('Essential Questions', unitPlan.essentialQuestions, 'section', 'no-break'),
    
    // Success Criteria
    createListSection('Success Criteria', unitPlan.successCriteria, 'section', 'no-break'),
    
    // Assessment Plan
    createSection('Assessment Plan', unitPlan.assessmentPlan, 'section', 'no-break'),
    
    // Key Vocabulary grid
    createVocabularyGrid(unitPlan.keyVocabulary),
    
    // Curriculum Expectations
    createExpectationsSection(unitPlan.expectations),
    
    // Differentiation Strategies grid
    createDifferentiationGrid(unitPlan.differentiationStrategies),
    
    // Cross-Curricular Connections
    createSection('Cross-Curricular Connections', unitPlan.crossCurricularConnections, 'section', 'no-break'),
    
    // Generated footer
    createGeneratedFooter()
  ];
  
  // Filter out empty sections and join
  const body = bodyParts.filter(part => part.trim() !== '').join('\n');
  
  return createHTMLDocument(title, styles, body);
}

/**
 * Validates unit plan data before generating HTML
 * 
 * @param unitPlan - The unit plan data to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateUnitPlan(unitPlan: UnitPlan): string[] {
  const errors: string[] = [];
  
  if (!unitPlan.title || unitPlan.title.trim() === '') {
    errors.push('Unit plan title is required');
  }
  
  if (!unitPlan.startDate) {
    errors.push('Start date is required');
  }
  
  if (!unitPlan.endDate) {
    errors.push('End date is required');
  }
  
  if (unitPlan.startDate && unitPlan.endDate && unitPlan.startDate > unitPlan.endDate) {
    errors.push('Start date cannot be after end date');
  }
  
  return errors;
}

/**
 * Generates a preview summary of the unit plan content
 * 
 * @param unitPlan - The unit plan data
 * @returns Object with preview information
 */
export function getUnitPlanPreview(unitPlan: UnitPlan): {
  title: string;
  duration: string;
  sectionsCount: number;
  hasVocabulary: boolean;
  hasExpectations: boolean;
  hasDifferentiation: boolean;
} {
  const startDate = new Date(unitPlan.startDate);
  const endDate = new Date(unitPlan.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let sectionsCount = 0;
  if (unitPlan.description) {
sectionsCount++;
}
  if (unitPlan.bigIdeas) {
sectionsCount++;
}
  if (unitPlan.essentialQuestions?.length) {
sectionsCount++;
}
  if (unitPlan.successCriteria?.length) {
sectionsCount++;
}
  if (unitPlan.assessmentPlan) {
sectionsCount++;
}
  if (unitPlan.keyVocabulary?.length) {
sectionsCount++;
}
  if (unitPlan.expectations?.length) {
sectionsCount++;
}
  if (unitPlan.differentiationStrategies) {
sectionsCount++;
}
  if (unitPlan.crossCurricularConnections) {
sectionsCount++;
}
  
  return {
    title: unitPlan.title,
    duration: `${durationDays} days`,
    sectionsCount,
    hasVocabulary: Boolean(unitPlan.keyVocabulary?.length),
    hasExpectations: Boolean(unitPlan.expectations?.length),
    hasDifferentiation: Boolean(unitPlan.differentiationStrategies)
  };
}