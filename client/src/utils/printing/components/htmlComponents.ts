/**
 * HTML Components Module
 * 
 * Reusable HTML component functions for print templates.
 * Each function generates a specific section or element of the final document.
 */

import { format } from 'date-fns';

import { escapeHtml } from '../../sanitization';
import type { UnitPlan, LessonPlan, LongRangePlan, UnitPlanReference, OptionalString, OptionalStringArray } from '../types';

// Base HTML document template
export function createHTMLDocument(title: string, styles: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

// Document header component
export function createDocumentHeader(
  title: string, 
  subtitle?: string,
  additionalInfo?: string[],
  headerClass = 'header'
): string {
  const subtitleHtml = subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : '';
  const additionalInfoHtml = additionalInfo?.map(info => 
    `<div class="subtitle">${escapeHtml(info)}</div>`
  ).join('') || '';

  return `
    <div class="${headerClass}">
      <div class="title">${escapeHtml(title)}</div>
      ${subtitleHtml}
      ${additionalInfoHtml}
    </div>
  `;
}

// Unit plan specific header
export function createUnitPlanHeader(unitPlan: UnitPlan, longRangePlan?: LongRangePlan): string {
  const additionalInfo: string[] = [];
  
  if (unitPlan.titleFr !== undefined && unitPlan.titleFr !== null && unitPlan.titleFr !== '') {
    additionalInfo.push(`Français: ${unitPlan.titleFr}`);
  }
  
  if (longRangePlan) {
    additionalInfo.push(`Long-Range Plan: ${longRangePlan.title}`);
  }
  
  const dateRange = `${format(new Date(unitPlan.startDate), 'MMMM d, yyyy')} - ${format(new Date(unitPlan.endDate), 'MMMM d, yyyy')}`;
  const hoursInfo = unitPlan.estimatedHours !== undefined && unitPlan.estimatedHours !== null && unitPlan.estimatedHours > 0 
    ? ` • ${unitPlan.estimatedHours} hours` 
    : '';
  
  additionalInfo.push(dateRange + hoursInfo);
  
  return createDocumentHeader(unitPlan.title, undefined, additionalInfo);
}

// Lesson plan specific header
export function createLessonPlanHeader(lessonPlan: LessonPlan, unitPlan?: UnitPlanReference): string {
  const additionalInfo: string[] = [];
  
  if (unitPlan) {
    additionalInfo.push(`Unit: ${unitPlan.title}`);
  }
  
  additionalInfo.push(format(new Date(lessonPlan.date), 'EEEE, MMMM d, yyyy'));
  
  return createDocumentHeader(lessonPlan.title, undefined, additionalInfo);
}

// Section component with optional content
export function createSection(
  title: string, 
  content?: string, 
  className = 'section',
  breakClass?: string
): string {
  if (!content || content.trim() === '') {
return '';
}
  
  const classNames = breakClass ? `${className} ${breakClass}` : className;
  
  return `
    <div class="${classNames}">
      <div class="section-title">${escapeHtml(title)}</div>
      <div>${escapeHtml(content)}</div>
    </div>
  `;
}

// List section component
export function createListSection(
  title: string, 
  items?: string[], 
  className = 'section',
  breakClass?: string
): string {
  if (!items || items.length === 0) {
return '';
}
  
  const classNames = breakClass ? `${className} ${breakClass}` : className;
  const listItems = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  
  return `
    <div class="${classNames}">
      <div class="section-title">${escapeHtml(title)}</div>
      <ul>
        ${listItems}
      </ul>
    </div>
  `;
}

// Metadata section component
export function createMetadataSection(title: string, content?: string): string {
  if (!content || content.trim() === '') {
return '';
}
  
  return `
    <div class="metadata no-break">
      <div class="section-title">${escapeHtml(title)}</div>
      <p>${escapeHtml(content)}</p>
    </div>
  `;
}

// Vocabulary grid component
export function createVocabularyGrid(vocabulary?: string[]): string {
  if (!vocabulary || vocabulary.length === 0) {
return '';
}
  
  const vocabItems = vocabulary.map(term => 
    `<div class="vocab-item">${escapeHtml(term)}</div>`
  ).join('');
  
  return `
    <div class="section no-break">
      <div class="section-title">Key Vocabulary</div>
      <div class="vocab-grid">
        ${vocabItems}
      </div>
    </div>
  `;
}

// Curriculum expectations component
export function createExpectationsSection(expectations?: { expectation: { code: string; description: string } }[]): string {
  if (!expectations || expectations.length === 0) {
return '';
}
  
  const expectationItems = expectations.map(exp => `
    <div class="expectation-item">
      <span class="expectation-code">${escapeHtml(exp.expectation.code)}</span>
      <p style="margin: 0.25rem 0 0 0;">${escapeHtml(exp.expectation.description)}</p>
    </div>
  `).join('');
  
  return `
    <div class="section">
      <div class="section-title">Curriculum Expectations</div>
      ${expectationItems}
    </div>
  `;
}

// Differentiation strategies grid component
export function createDifferentiationGrid(strategies?: {
  forStruggling?: string[];
  forAdvanced?: string[];
  forELL?: string[];
  forIEP?: string[];
}): string {
  if (!strategies) {
return '';
}
  
  const sections: string[] = [];
  
  if (strategies.forStruggling && strategies.forStruggling.length > 0) {
    const items = strategies.forStruggling.map(s => `<li>${escapeHtml(s)}</li>`).join('');
    sections.push(`
      <div class="diff-section">
        <div class="diff-title">For Struggling Learners</div>
        <ul>${items}</ul>
      </div>
    `);
  }
  
  if (strategies.forAdvanced && strategies.forAdvanced.length > 0) {
    const items = strategies.forAdvanced.map(s => `<li>${escapeHtml(s)}</li>`).join('');
    sections.push(`
      <div class="diff-section">
        <div class="diff-title">For Advanced Learners</div>
        <ul>${items}</ul>
      </div>
    `);
  }
  
  if (strategies.forELL && strategies.forELL.length > 0) {
    const items = strategies.forELL.map(s => `<li>${escapeHtml(s)}</li>`).join('');
    sections.push(`
      <div class="diff-section">
        <div class="diff-title">For English Language Learners</div>
        <ul>${items}</ul>
      </div>
    `);
  }
  
  if (strategies.forIEP && strategies.forIEP.length > 0) {
    const items = strategies.forIEP.map(s => `<li>${escapeHtml(s)}</li>`).join('');
    sections.push(`
      <div class="diff-section">
        <div class="diff-title">For Students with IEPs</div>
        <ul>${items}</ul>
      </div>
    `);
  }
  
  if (sections.length === 0) {
return '';
}
  
  return `
    <div class="section page-break">
      <div class="section-title">Differentiation Strategies</div>
      <div class="diff-grid">
        ${sections.join('')}
      </div>
    </div>
  `;
}

// Lesson info grid component for lesson plans
export function createLessonInfoGrid(lessonPlan: LessonPlan): string {
  return `
    <div class="lesson-info no-break">
      <div class="info-item">
        <div class="info-label">Duration</div>
        <div class="info-value">${lessonPlan.duration} minutes</div>
      </div>
      <div class="info-item">
        <div class="info-label">Grouping</div>
        <div class="info-value">${escapeHtml(lessonPlan.grouping ?? 'Not specified')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Assessment</div>
        <div class="info-value">${escapeHtml(lessonPlan.assessmentType ?? 'Not specified')}</div>
      </div>
      ${lessonPlan.isSubFriendly === true ? `
        <div class="info-item">
          <div class="info-label">Sub-Friendly</div>
          <div class="info-value">✓ Yes</div>
        </div>
      ` : ''}
    </div>
  `;
}

// Three-part lesson structure component
export function createThreePartLesson(lessonPlan: LessonPlan): string {
  const mindsOnTime = Math.round(lessonPlan.duration * 0.15);
  const actionTime = Math.round(lessonPlan.duration * 0.70);
  const consolidationTime = Math.round(lessonPlan.duration * 0.15);
  
  return `
    <div class="section">
      <div class="section-title">Three-Part Lesson Structure</div>
      <div class="three-part">
        <div class="lesson-part">
          <div class="part-header">
            Minds On (${mindsOnTime} min)
          </div>
          <div class="part-content">
            ${(lessonPlan.mindsOn !== undefined && lessonPlan.mindsOn !== '') ? escapeHtml(lessonPlan.mindsOn) : 'Not specified'}
          </div>
        </div>
        
        <div class="lesson-part">
          <div class="part-header">
            Action (${actionTime} min)
          </div>
          <div class="part-content">
            ${(lessonPlan.action !== undefined && lessonPlan.action !== '') ? escapeHtml(lessonPlan.action) : 'Not specified'}
          </div>
        </div>
        
        <div class="lesson-part">
          <div class="part-header">
            Consolidation (${consolidationTime} min)
          </div>
          <div class="part-content">
            ${(lessonPlan.consolidation !== undefined && lessonPlan.consolidation !== '') ? escapeHtml(lessonPlan.consolidation) : 'Not specified'}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Three-column differentiation grid for lesson plans
export function createLessonDifferentiationGrid(
  accommodations?: string[],
  modifications?: string[],  
  extensions?: string[]
): string {
  const hasContent = (accommodations && accommodations.length > 0) ||
                    (modifications && modifications.length > 0) ||
                    (extensions && extensions.length > 0);
  
  if (!hasContent) {
return '';
}
  
  const sections: string[] = [];
  
  if (accommodations && accommodations.length > 0) {
    const items = accommodations.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    sections.push(`
      <div class="diff-section">
        <div class="diff-title">Accommodations</div>
        <ul>${items}</ul>
      </div>
    `);
  }
  
  if (modifications && modifications.length > 0) {
    const items = modifications.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    sections.push(`
      <div class="diff-section">
        <div class="diff-title">Modifications</div>
        <ul>${items}</ul>
      </div>
    `);
  }
  
  if (extensions && extensions.length > 0) {
    const items = extensions.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    sections.push(`
      <div class="diff-section">
        <div class="diff-title">Extensions</div>
        <ul>${items}</ul>
      </div>
    `);
  }
  
  return `
    <div class="section page-break">
      <div class="section-title">Differentiation</div>
      <div class="diff-grid">
        ${sections.join('')}
      </div>
    </div>
  `;
}

// Sub-friendly notes component
export function createSubFriendlyNotes(lessonPlan: LessonPlan): string {
  if (lessonPlan.isSubFriendly !== true || !lessonPlan.subNotes || lessonPlan.subNotes.trim() === '') {
    return '';
  }
  
  return `
    <div class="sub-friendly no-break">
      <div class="sub-title">Notes for Substitute Teacher</div>
      <p>${escapeHtml(lessonPlan.subNotes)}</p>
    </div>
  `;
}

// Generated footer component
export function createGeneratedFooter(): string {
  return `
    <div class="generated-note">
      Generated by Teaching Engine 2.0 on ${format(new Date(), 'MMMM d, yyyy')} at ${format(new Date(), 'h:mm a')}
    </div>
  `;
}

// Utility function to safely render optional content
export function renderOptionalContent(content: OptionalString): string {
  return (content !== undefined && content !== null && content !== '') ? escapeHtml(content) : '';
}

// Utility function to check if array has content
export function hasArrayContent(arr: OptionalStringArray): boolean {
  return arr !== undefined && arr !== null && arr.length > 0;
}