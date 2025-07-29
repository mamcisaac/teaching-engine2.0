/**
 * Print Utils - Refactored Version
 * 
 * Main print utilities that use the new modular printing system.
 * This file maintains the same public API as the original but uses
 * the clean, modular components internally.
 */

// Import specific functions for the utility functions below
import { 
  generateUnitPlanHTML,
  generateLessonPlanHTML,
  generateLongRangePlanBlankTemplate,
  generateUnitPlanBlankTemplate,
  generateLessonPlanBlankTemplate,
  generateDaybookBlankTemplate,
  generateWeeklyOverviewBlankTemplate
} from './printing';
// Import types for use in this file
import type { UnitPlan, LessonPlan, ETFOSchoolInfo, LongRangePlan } from './printing';

// Re-export types that were previously defined in this file
export type {
  UnitPlan,
  LessonPlan,
  ETFOSchoolInfo,
  LongRangePlan,
  UnitPlanReference
} from './printing';

/**
 * Prints HTML content in a new window
 * 
 * @param html - HTML content to print
 * @param filename - Optional filename (not used but kept for API compatibility)
 */
export const printHTML = (html: string, _filename = 'document'): void => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

/**
 * Downloads HTML content as a file
 * 
 * @param html - HTML content to download
 * @param filename - Filename for the download (without extension)
 */
export const downloadHTML = (html: string, filename = 'document'): void => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Re-export the main template generation functions with the same signatures
// This ensures backward compatibility with existing code
export { 
  generateUnitPlanHTML,
  generateLessonPlanHTML,
  generateLongRangePlanBlankTemplate,
  generateUnitPlanBlankTemplate,
  generateLessonPlanBlankTemplate,
  generateDaybookBlankTemplate,
  generateWeeklyOverviewBlankTemplate
};

/**
 * Convenience function to print a unit plan
 * 
 * @param unitPlan - Unit plan data
 * @param longRangePlan - Optional long-range plan reference
 * @param filename - Optional filename for identification
 */
export const printUnitPlan = (
  unitPlan: UnitPlan, 
  longRangePlan?: LongRangePlan, 
  filename?: string
): void => {
  const html = generateUnitPlanHTML(unitPlan, longRangePlan);
  printHTML(html, filename);
};

/**
 * Convenience function to download a unit plan
 * 
 * @param unitPlan - Unit plan data
 * @param longRangePlan - Optional long-range plan reference
 * @param filename - Optional filename (defaults to unit title)
 */
export const downloadUnitPlan = (
  unitPlan: UnitPlan, 
  longRangePlan?: LongRangePlan, 
  filename?: string
): void => {
  const html = generateUnitPlanHTML(unitPlan, longRangePlan);
  const defaultFilename = filename || `unit-plan-${unitPlan.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  downloadHTML(html, defaultFilename);
};

/**
 * Convenience function to print a lesson plan
 * 
 * @param lessonPlan - Lesson plan data
 * @param unitPlan - Optional unit plan reference
 * @param filename - Optional filename for identification
 */
export const printLessonPlan = (
  lessonPlan: LessonPlan, 
  unitPlan?: UnitPlan, 
  filename?: string
): void => {
  const html = generateLessonPlanHTML(lessonPlan, unitPlan);
  printHTML(html, filename);
};

/**
 * Convenience function to download a lesson plan
 * 
 * @param lessonPlan - Lesson plan data
 * @param unitPlan - Optional unit plan reference
 * @param filename - Optional filename (defaults to lesson title)
 */
export const downloadLessonPlan = (
  lessonPlan: LessonPlan, 
  unitPlan?: UnitPlan, 
  filename?: string
): void => {
  const html = generateLessonPlanHTML(lessonPlan, unitPlan);
  const defaultFilename = filename || `lesson-plan-${lessonPlan.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
  downloadHTML(html, defaultFilename);
};

/**
 * Convenience function to print ETFO templates
 * 
 * @param templateType - Type of ETFO template
 * @param schoolInfo - Optional school information
 * @param filename - Optional filename for identification
 */
export const printETFOTemplate = (
  templateType: 'longRange' | 'unitPlan' | 'lessonPlan' | 'daybook' | 'weeklyOverview',
  schoolInfo?: ETFOSchoolInfo,
  filename?: string
): void => {
  let html: string;
  
  switch (templateType) {
    case 'longRange':
      html = generateLongRangePlanBlankTemplate(schoolInfo);
      break;
    case 'unitPlan':
      html = generateUnitPlanBlankTemplate(schoolInfo);
      break;
    case 'lessonPlan':
      html = generateLessonPlanBlankTemplate(schoolInfo);
      break;
    case 'daybook':
      html = generateDaybookBlankTemplate(schoolInfo);
      break;
    case 'weeklyOverview':
      html = generateWeeklyOverviewBlankTemplate(schoolInfo);
      break;
    default:
      throw new Error(`Unknown ETFO template type: ${templateType}`);
  }
  
  printHTML(html, filename);
};

/**
 * Convenience function to download ETFO templates
 * 
 * @param templateType - Type of ETFO template
 * @param schoolInfo - Optional school information
 * @param filename - Optional filename (defaults to template type)
 */
export const downloadETFOTemplate = (
  templateType: 'longRange' | 'unitPlan' | 'lessonPlan' | 'daybook' | 'weeklyOverview',
  schoolInfo?: ETFOSchoolInfo,
  filename?: string
): void => {
  let html: string;
  let defaultFilename: string;
  
  switch (templateType) {
    case 'longRange':
      html = generateLongRangePlanBlankTemplate(schoolInfo);
      defaultFilename = 'etfo-long-range-plan-template';
      break;
    case 'unitPlan':
      html = generateUnitPlanBlankTemplate(schoolInfo);
      defaultFilename = 'etfo-unit-plan-template';
      break;
    case 'lessonPlan':
      html = generateLessonPlanBlankTemplate(schoolInfo);
      defaultFilename = 'etfo-lesson-plan-template';
      break;
    case 'daybook':
      html = generateDaybookBlankTemplate(schoolInfo);
      defaultFilename = 'etfo-daybook-template';
      break;
    case 'weeklyOverview':
      html = generateWeeklyOverviewBlankTemplate(schoolInfo);
      defaultFilename = 'etfo-weekly-overview-template';
      break;
    default:
      throw new Error(`Unknown ETFO template type: ${templateType}`);
  }
  
  downloadHTML(html, filename || defaultFilename);
};