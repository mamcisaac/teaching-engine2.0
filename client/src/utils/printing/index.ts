/**
 * Printing Module Index
 * 
 * Main entry point for the refactored printing utilities.
 * Exports all functions and types from the modular printing system.
 */

// Import necessary functions for the factory functions
import {
  generateLongRangePlanBlankTemplate as _generateLongRangePlanBlankTemplate,
  generateUnitPlanBlankTemplate as _generateUnitPlanBlankTemplate,
  generateLessonPlanBlankTemplate as _generateLessonPlanBlankTemplate,
  generateDaybookBlankTemplate as _generateDaybookBlankTemplate,
  generateWeeklyOverviewBlankTemplate as _generateWeeklyOverviewBlankTemplate
} from './templates/etfoTemplates';
import {
  generateLessonPlanHTML as _generateLessonPlanHTML,
  validateLessonPlan as _validateLessonPlan,
  getLessonPlanPreview as _getLessonPlanPreview  
} from './templates/lessonPlanTemplate';
import { 
  generateUnitPlanHTML as _generateUnitPlanHTML,
  validateUnitPlan as _validateUnitPlan,
  getUnitPlanPreview as _getUnitPlanPreview
} from './templates/unitPlanTemplate';
// Import types for internal use
import type { TemplateResult, TemplateType } from './types';
import { TemplateType as TemplateTypeEnum } from './types';

// Export all types
export type {
  UnitPlan,
  LessonPlan,
  ETFOSchoolInfo,
  LongRangePlan,
  UnitPlanReference,
  PrintOptions,
  TemplateResult,
  DocumentTheme,
  DocumentMetadata,
  CurriculumExpectation,
  DifferentiationStrategies,
  OptionalString,
  OptionalStringArray,
  OptionalDate,
  OptionalNumber,
  TemplateType
} from './types';

export { TemplateType as TemplateTypes } from './types';

// Export style functions
export {
  getUnitPlanStyles,
  getLessonPlanStyles,
  getETFOStyles,
  getETFOLessonStyles,
  getETFODaybookStyles,
  getETFOWeeklyOverviewStyles,
  COLOR_THEMES,
  // Export individual style constants for advanced usage
  PRINT_MEDIA_STYLES,
  BASE_BODY_STYLES,
  HEADER_STYLES,
  SECTION_STYLES,
  LAYOUT_STYLES,
  LIST_STYLES,
  UNIT_PLAN_STYLES,
  LESSON_PLAN_STYLES,
  ETFO_STYLES
} from './styles/printStyles';

// Export HTML components
export {
  createHTMLDocument,
  createDocumentHeader,
  createUnitPlanHeader,
  createLessonPlanHeader,
  createSection,
  createListSection,
  createMetadataSection,
  createVocabularyGrid,
  createExpectationsSection,
  createDifferentiationGrid,
  createLessonInfoGrid,
  createThreePartLesson,
  createLessonDifferentiationGrid,
  createSubFriendlyNotes,
  createGeneratedFooter,
  renderOptionalContent,
  hasArrayContent
} from './components/htmlComponents';

// Export base template functions
export {
  createBaseHTMLDocument,
  createDocumentWrapper,
  createTeachingEngineFooter,
  createPrintPage,
  createGridLayout,
  createFlexibleSection,
  createInfoCard,
  validateTemplateData
} from './components/baseTemplate';

// Export main template functions
export {
  generateUnitPlanHTML,
  validateUnitPlan,
  getUnitPlanPreview
} from './templates/unitPlanTemplate';

export {
  generateLessonPlanHTML,
  validateLessonPlan,
  calculateLessonTiming,
  getLessonPlanPreview,
  getLessonPlanCompleteness
} from './templates/lessonPlanTemplate';

// Export ETFO template functions
export {
  generateLongRangePlanBlankTemplate,
  generateUnitPlanBlankTemplate,
  generateLessonPlanBlankTemplate,
  generateDaybookBlankTemplate,
  generateWeeklyOverviewBlankTemplate
} from './templates/etfoTemplates';

// Re-export utility functions (these will be kept in the main printUtils.tsx)
// but we provide types and validation here
export interface PrintUtilityOptions {
  filename?: string;
  openInNewWindow?: boolean;
}

// Template factory function for easier usage
export function createTemplate(
  type: TemplateType,
  data: any,
  options?: PrintUtilityOptions
): TemplateResult {
  let html: string;
  let title: string;
  let filename: string;

  switch (type) {
    case TemplateTypeEnum.UNIT_PLAN:
      html = _generateUnitPlanHTML(data.unitPlan, data.longRangePlan);
      title = `${data.unitPlan.title} - Unit Plan`;
      filename = options?.filename || `unit-plan-${data.unitPlan.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
      break;
      
    case TemplateTypeEnum.LESSON_PLAN:
      html = _generateLessonPlanHTML(data.lessonPlan, data.unitPlan);
      title = `${data.lessonPlan.title} - Lesson Plan`;
      filename = options?.filename || `lesson-plan-${data.lessonPlan.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
      break;
      
    case TemplateTypeEnum.LONG_RANGE_PLAN:
      html = _generateLongRangePlanBlankTemplate(data.schoolInfo);
      title = 'ETFO Long-Range Plan Template';
      filename = options?.filename || 'etfo-long-range-plan-template';
      break;
      
    case TemplateTypeEnum.ETFO_UNIT_PLAN:
      html = _generateUnitPlanBlankTemplate(data.schoolInfo);
      title = 'ETFO Unit Plan Template';
      filename = options?.filename || 'etfo-unit-plan-template';
      break;
      
    case TemplateTypeEnum.ETFO_LESSON_PLAN:
      html = _generateLessonPlanBlankTemplate(data.schoolInfo);
      title = 'ETFO Lesson Plan Template';
      filename = options?.filename || 'etfo-lesson-plan-template';
      break;
      
    case TemplateTypeEnum.ETFO_DAYBOOK:
      html = _generateDaybookBlankTemplate(data.schoolInfo);
      title = 'ETFO Daybook Template';
      filename = options?.filename || 'etfo-daybook-template';
      break;
      
    case TemplateTypeEnum.ETFO_WEEKLY_OVERVIEW:
      html = _generateWeeklyOverviewBlankTemplate(data.schoolInfo);
      title = 'ETFO Weekly Overview Template';
      filename = options?.filename || 'etfo-weekly-overview-template';
      break;
      
    default:
      throw new Error(`Unsupported template type: ${type}`);
  }

  return {
    html,
    title,
    filename
  };
}

// Validation helper that works with any template type
export function validateTemplateInput(type: TemplateType, data: any): { isValid: boolean; errors: string[] } {
  switch (type) {
    case TemplateTypeEnum.UNIT_PLAN:
      return { isValid: true, errors: _validateUnitPlan(data.unitPlan) };
      
    case TemplateTypeEnum.LESSON_PLAN:
      return { isValid: true, errors: _validateLessonPlan(data.lessonPlan) };
      
    // ETFO templates don't require validation as they're blank templates
    case TemplateTypeEnum.LONG_RANGE_PLAN:
    case TemplateTypeEnum.ETFO_UNIT_PLAN:
    case TemplateTypeEnum.ETFO_LESSON_PLAN:
    case TemplateTypeEnum.ETFO_DAYBOOK:
    case TemplateTypeEnum.ETFO_WEEKLY_OVERVIEW:
      return { isValid: true, errors: [] };
      
    default:
      return { isValid: false, errors: [`Unknown template type: ${type}`] };
  }
}

// Convenience function to get template preview information
export function getTemplatePreview(type: TemplateType, data: any): any {
  switch (type) {
    case TemplateTypeEnum.UNIT_PLAN:
      return _getUnitPlanPreview(data.unitPlan);
      
    case TemplateTypeEnum.LESSON_PLAN:
      return _getLessonPlanPreview(data.lessonPlan);
      
    default:
      return null;
  }
}