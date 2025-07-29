/**
 * Print Styles Module
 * 
 * Centralized CSS styles for all print templates.
 * Organized by:
 * - Common print styles (shared across all templates)
 * - Base component styles (headers, sections, etc.)
 * - Specific component styles (unit plans, lesson plans, etc.)
 * - ETFO template styles
 */

// Common print media styles
export const PRINT_MEDIA_STYLES = `
  @media print {
    @page {
      margin: 0.75in;
      size: letter;
    }
    
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .no-break {
      page-break-inside: avoid;
    }
  }
`;

// Base body and typography styles
export const BASE_BODY_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
    color: #333;
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in;
  }
`;

// Common header styles
export const HEADER_STYLES = `
  .header {
    border-bottom: 2px solid #2563eb;
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #1e40af;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }
  
  .generated-note {
    font-size: 12px;
    color: #6b7280;
    text-align: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
`;

// Common section styles
export const SECTION_STYLES = `
  .section {
    margin-bottom: 1.5rem;
    page-break-inside: avoid;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .metadata {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
`;

// Grid and layout styles
export const LAYOUT_STYLES = `
  .two-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .diff-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .diff-section {
    background: #f9fafb;
    padding: 0.75rem;
    border-radius: 4px;
  }
  
  .diff-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #374151;
  }
`;

// List styles
export const LIST_STYLES = `
  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.25rem;
  }
`;

// Unit Plan specific styles
export const UNIT_PLAN_STYLES = `
  .expectation-item {
    background: #f9fafb;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border-left: 3px solid #3b82f6;
  }
  
  .expectation-code {
    font-weight: bold;
    color: #1e40af;
  }
  
  .vocab-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .vocab-item {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 14px;
  }
`;

// Lesson Plan specific styles
export const LESSON_PLAN_STYLES = `
  .lesson-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    background: #f0fdf4;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .info-item {
    text-align: center;
  }
  
  .info-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
  }
  
  .info-value {
    font-weight: bold;
    color: #047857;
  }
  
  .three-part {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .lesson-part {
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #f9fafb;
  }
  
  .part-header {
    background: #047857;
    color: white;
    padding: 0.5rem;
    font-weight: bold;
    text-align: center;
  }
  
  .part-content {
    padding: 1rem;
    min-height: 150px;
  }
  
  .sub-friendly {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }
  
  .sub-title {
    font-weight: bold;
    color: #92400e;
    margin-bottom: 0.5rem;
  }
`;

// Color theme variants for different document types
export const COLOR_THEMES = {
  unitPlan: {
    header: '#2563eb',
    title: '#1e40af',
    accent: '#3b82f6'
  },
  lessonPlan: {
    header: '#059669',
    title: '#047857',
    accent: '#10b981'
  },
  etfo: {
    header: '#1e40af',
    title: '#1e40af',
    accent: '#3b82f6'
  }
};

// ETFO specific styles
export const ETFO_STYLES = `
  .etfo-header {
    border-bottom: 3px solid #1e40af;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .etfo-logo {
    font-size: 18px;
    font-weight: bold;
    color: #1e40af;
    margin-bottom: 0.5rem;
  }
  
  .school-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 1rem 0;
    text-align: left;
  }
  
  .school-info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .school-info-label {
    font-weight: bold;
    min-width: 80px;
  }
  
  .school-info-line {
    flex: 1;
    border-bottom: 1px solid #333;
    height: 1px;
    margin-left: 10px;
  }
  
  .planning-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .planning-section {
    border: 1px solid #333;
    border-radius: 4px;
    min-height: 120px;
  }
  
  .planning-section-header {
    background: #f8fafc;
    border-bottom: 1px solid #333;
    padding: 0.5rem;
    font-weight: bold;
    color: #1f2937;
  }
  
  .planning-section-content {
    padding: 1rem;
    min-height: 80px;
    background: white;
  }
  
  .three-column-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .two-column-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .one-column-grid {
    grid-template-columns: 1fr;
  }
  
  .fill-lines {
    height: 100%;
    background-image: repeating-linear-gradient(
      transparent,
      transparent 24px,
      #e5e7eb 24px,
      #e5e7eb 25px
    );
  }
`;

// ETFO Week grid styles
export const ETFO_WEEK_STYLES = `
  .week-grid {
    display: grid;
    grid-template-columns: auto 1fr 1fr 1fr 1fr 1fr;
    gap: 1px;
    border: 1px solid #333;
    margin-bottom: 1rem;
  }
  
  .week-cell {
    border: 1px solid #333;
    padding: 0.5rem;
    min-height: 60px;
    background: white;
  }
  
  .week-header {
    background: #f1f5f9;
    font-weight: bold;
    text-align: center;
  }
  
  .time-slot {
    background: #f8fafc;
    font-size: 12px;
    writing-mode: vertical-lr;
    text-orientation: mixed;
    text-align: center;
  }
`;

// ETFO specific component styles
export const ETFO_COMPONENT_STYLES = `
  .units-overview {
    margin-bottom: 2rem;
  }
  
  .unit-box {
    border: 2px solid #333;
    margin-bottom: 1rem;
    background: white;
  }
  
  .unit-header {
    background: #e5e7eb;
    padding: 0.75rem;
    border-bottom: 1px solid #333;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 1rem;
    align-items: center;
  }
  
  .unit-title {
    font-weight: bold;
    font-size: 16px;
  }
  
  .unit-content {
    padding: 1rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    min-height: 100px;
  }
  
  .expectations-section {
    border-left: 3px solid #3b82f6;
    padding-left: 0.5rem;
  }
  
  .expectations-title {
    font-weight: bold;
    color: #1e40af;
    margin-bottom: 0.5rem;
  }
`;

// ETFO Lesson Plan specific styles
export const ETFO_LESSON_STYLES = `
  .lesson-meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    border: 2px solid #333;
    padding: 1rem;
    background: #f8fafc;
  }
  
  .meta-item {
    text-align: center;
  }
  
  .meta-label {
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 0.25rem;
  }
  
  .meta-value {
    border-bottom: 1px solid #333;
    height: 25px;
  }
  
  .three-part-lesson {
    border: 2px solid #333;
    margin-bottom: 1.5rem;
  }
  
  .lesson-part {
    border-bottom: 1px solid #333;
    min-height: 180px;
  }
  
  .lesson-part:last-child {
    border-bottom: none;
  }
  
  .lesson-part-header {
    background: #1e40af;
    color: white;
    padding: 0.75rem;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .lesson-part-content {
    padding: 1rem;
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 1rem;
    min-height: 140px;
  }
  
  .activity-area {
    background: white;
  }
  
  .materials-area {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
  }
  
  .materials-title {
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 0.5rem;
    color: #374151;
  }
`;

// ETFO Daybook specific styles
export const ETFO_DAYBOOK_STYLES = `
  .week-overview {
    border: 2px solid #333;
    margin-bottom: 1rem;
    background: white;
  }
  
  .week-header {
    background: #1e40af;
    color: white;
    padding: 0.5rem;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
  }
  
  .week-grid {
    display: grid;
    grid-template-columns: 100px repeat(5, 1fr);
    border-collapse: collapse;
  }
  
  .time-column {
    background: #f1f5f9;
    border-right: 1px solid #333;
    padding: 0.5rem;
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    writing-mode: vertical-lr;
    text-orientation: mixed;
  }
  
  .day-header {
    background: #e5e7eb;
    border: 1px solid #333;
    padding: 0.5rem;
    text-align: center;
    font-weight: bold;
  }
  
  .lesson-cell {
    border: 1px solid #333;
    padding: 0.25rem;
    min-height: 80px;
    background: white;
    font-size: 11px;
  }
  
  .daily-reflection {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .reflection-card {
    border: 1px solid #333;
    background: #fefce8;
    min-height: 120px;
  }
  
  .reflection-header {
    background: #eab308;
    color: white;
    padding: 0.5rem;
    font-weight: bold;
    text-align: center;
    font-size: 14px;
  }
  
  .reflection-content {
    padding: 0.5rem;
    height: 80px;
  }
`;

// Style combination functions for different document types
export function getUnitPlanStyles(): string {
  return [
    PRINT_MEDIA_STYLES,
    BASE_BODY_STYLES,
    HEADER_STYLES,
    SECTION_STYLES,
    LAYOUT_STYLES,
    LIST_STYLES,
    UNIT_PLAN_STYLES
  ].join('\n');
}

export function getLessonPlanStyles(): string {
  // Override header color for lesson plans
  const lessonHeaderStyles = HEADER_STYLES.replace('#2563eb', '#059669').replace('#1e40af', '#047857');
  
  return [
    PRINT_MEDIA_STYLES,
    BASE_BODY_STYLES,
    lessonHeaderStyles,
    SECTION_STYLES,
    LAYOUT_STYLES,
    LIST_STYLES,
    LESSON_PLAN_STYLES
  ].join('\n');
}

export function getETFOStyles(): string {
  return [
    PRINT_MEDIA_STYLES.replace('0.75in', '0.5in'), // ETFO uses smaller margins
    BASE_BODY_STYLES,
    ETFO_STYLES,
    ETFO_WEEK_STYLES,
    ETFO_COMPONENT_STYLES,
    LIST_STYLES
  ].join('\n');
}

export function getETFOLessonStyles(): string {
  return [
    PRINT_MEDIA_STYLES.replace('0.75in', '0.5in'),
    BASE_BODY_STYLES,
    ETFO_STYLES,
    ETFO_LESSON_STYLES,
    LIST_STYLES
  ].join('\n');
}

export function getETFODaybookStyles(): string {
  return [
    PRINT_MEDIA_STYLES.replace('0.75in', '0.5in').replace('letter', 'letter landscape'),
    BASE_BODY_STYLES.replace('8.5in', '11in'),
    ETFO_STYLES,
    ETFO_DAYBOOK_STYLES,
    LIST_STYLES
  ].join('\n');
}

export function getETFOWeeklyOverviewStyles(): string {
  return [
    PRINT_MEDIA_STYLES.replace('0.75in', '0.5in'),
    BASE_BODY_STYLES,
    ETFO_STYLES,
    LIST_STYLES
  ].join('\n');
}