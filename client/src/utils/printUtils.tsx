// import React from 'react';
import { format } from 'date-fns';
import { escapeHtml } from './sanitization';

interface UnitPlan {
  title: string;
  titleFr?: string;
  description?: string;
  bigIdeas?: string;
  essentialQuestions?: string[];
  successCriteria?: string[];
  assessmentPlan?: string;
  keyVocabulary?: string[];
  startDate: Date;
  endDate: Date;
  estimatedHours?: number;
  crossCurricularConnections?: string;
  learningSkills?: string[];
  differentiationStrategies?: {
    forStruggling?: string[];
    forAdvanced?: string[];
    forELL?: string[];
    forIEP?: string[];
  };
  expectations?: Array<{
    expectation: {
      code: string;
      description: string;
    };
  }>;
}

interface LessonPlan {
  title: string;
  date: Date;
  duration: number;
  learningGoals?: string;
  mindsOn?: string;
  action?: string;
  consolidation?: string;
  materials?: string[];
  grouping?: string;
  accommodations?: string[];
  modifications?: string[];
  extensions?: string[];
  assessmentType?: string;
  assessmentNotes?: string;
  isSubFriendly?: boolean;
  subNotes?: string;
  expectations?: Array<{
    expectation: {
      code: string;
      description: string;
    };
  }>;
}

export const generateUnitPlanHTML = (unitPlan: UnitPlan, longRangePlan?: { title: string }): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${unitPlan.title} - Unit Plan</title>
      <style>
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
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        
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
        
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
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
        
        ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        li {
          margin-bottom: 0.25rem;
        }
        
        .metadata {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .generated-note {
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${escapeHtml(unitPlan.title)}</div>
        ${unitPlan.titleFr ? `<div class="subtitle">Français: ${escapeHtml(unitPlan.titleFr)}</div>` : ''}
        ${longRangePlan ? `<div class="subtitle">Long-Range Plan: ${escapeHtml(longRangePlan.title)}</div>` : ''}
        <div class="subtitle">
          ${format(new Date(unitPlan.startDate), 'MMMM d, yyyy')} - 
          ${format(new Date(unitPlan.endDate), 'MMMM d, yyyy')}
          ${unitPlan.estimatedHours ? ` • ${unitPlan.estimatedHours} hours` : ''}
        </div>
      </div>

      <div class="metadata no-break">
        <div class="section-title">Unit Overview</div>
        ${unitPlan.description ? `<p>${escapeHtml(unitPlan.description)}</p>` : ''}
      </div>

      ${unitPlan.bigIdeas ? `
        <div class="section no-break">
          <div class="section-title">Big Ideas</div>
          <div>${escapeHtml(unitPlan.bigIdeas)}</div>
        </div>
      ` : ''}

      ${unitPlan.essentialQuestions?.length ? `
        <div class="section no-break">
          <div class="section-title">Essential Questions</div>
          <ul>
            ${unitPlan.essentialQuestions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${unitPlan.successCriteria?.length ? `
        <div class="section no-break">
          <div class="section-title">Success Criteria</div>
          <ul>
            ${unitPlan.successCriteria.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${unitPlan.assessmentPlan ? `
        <div class="section no-break">
          <div class="section-title">Assessment Plan</div>
          <div>${escapeHtml(unitPlan.assessmentPlan)}</div>
        </div>
      ` : ''}

      ${unitPlan.keyVocabulary?.length ? `
        <div class="section no-break">
          <div class="section-title">Key Vocabulary</div>
          <div class="vocab-grid">
            ${unitPlan.keyVocabulary.map(term => `<div class="vocab-item">${escapeHtml(term)}</div>`).join('')}
          </div>
        </div>
      ` : ''}

      ${unitPlan.expectations?.length ? `
        <div class="section">
          <div class="section-title">Curriculum Expectations</div>
          ${unitPlan.expectations.map(exp => `
            <div class="expectation-item">
              <span class="expectation-code">${escapeHtml(exp.expectation.code)}</span>
              <p style="margin: 0.25rem 0 0 0;">${escapeHtml(exp.expectation.description)}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${unitPlan.differentiationStrategies ? `
        <div class="section page-break">
          <div class="section-title">Differentiation Strategies</div>
          <div class="diff-grid">
            ${unitPlan.differentiationStrategies.forStruggling?.length ? `
              <div class="diff-section">
                <div class="diff-title">For Struggling Learners</div>
                <ul>
                  ${unitPlan.differentiationStrategies.forStruggling.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${unitPlan.differentiationStrategies.forAdvanced?.length ? `
              <div class="diff-section">
                <div class="diff-title">For Advanced Learners</div>
                <ul>
                  ${unitPlan.differentiationStrategies.forAdvanced.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${unitPlan.differentiationStrategies.forELL?.length ? `
              <div class="diff-section">
                <div class="diff-title">For English Language Learners</div>
                <ul>
                  ${unitPlan.differentiationStrategies.forELL.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${unitPlan.differentiationStrategies.forIEP?.length ? `
              <div class="diff-section">
                <div class="diff-title">For Students with IEPs</div>
                <ul>
                  ${unitPlan.differentiationStrategies.forIEP.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      ${unitPlan.crossCurricularConnections ? `
        <div class="section no-break">
          <div class="section-title">Cross-Curricular Connections</div>
          <p>${escapeHtml(unitPlan.crossCurricularConnections)}</p>
        </div>
      ` : ''}

      <div class="generated-note">
        Generated by Teaching Engine 2.0 on ${format(new Date(), 'MMMM d, yyyy')} at ${format(new Date(), 'h:mm a')}
      </div>
    </body>
    </html>
  `;
};

export const generateLessonPlanHTML = (lessonPlan: LessonPlan, unitPlan?: { title: string }): string => {
  const mindsOnTime = Math.round(lessonPlan.duration * 0.15);
  const actionTime = Math.round(lessonPlan.duration * 0.70);
  const consolidationTime = Math.round(lessonPlan.duration * 0.15);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(lessonPlan.title)} - Lesson Plan</title>
      <style>
        @media print {
          @page {
            margin: 0.75in;
            size: letter;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        
        .header {
          border-bottom: 2px solid #059669;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #047857;
          margin-bottom: 0.5rem;
        }
        
        .subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        
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
        
        .diff-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
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
        
        ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        li {
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
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${escapeHtml(lessonPlan.title)}</div>
        ${unitPlan ? `<div class="subtitle">Unit: ${escapeHtml(unitPlan.title)}</div>` : ''}
        <div class="subtitle">${format(new Date(lessonPlan.date), 'EEEE, MMMM d, yyyy')}</div>
      </div>

      <div class="lesson-info no-break">
        <div class="info-item">
          <div class="info-label">Duration</div>
          <div class="info-value">${lessonPlan.duration} minutes</div>
        </div>
        <div class="info-item">
          <div class="info-label">Grouping</div>
          <div class="info-value">${escapeHtml(lessonPlan.grouping || 'Not specified')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Assessment</div>
          <div class="info-value">${escapeHtml(lessonPlan.assessmentType || 'Not specified')}</div>
        </div>
        ${lessonPlan.isSubFriendly ? `
          <div class="info-item">
            <div class="info-label">Sub-Friendly</div>
            <div class="info-value">✓ Yes</div>
          </div>
        ` : ''}
      </div>

      ${lessonPlan.learningGoals ? `
        <div class="section no-break">
          <div class="section-title">Learning Goals</div>
          <div>${escapeHtml(lessonPlan.learningGoals)}</div>
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Three-Part Lesson Structure</div>
        <div class="three-part">
          <div class="lesson-part">
            <div class="part-header">
              Minds On (${mindsOnTime} min)
            </div>
            <div class="part-content">
              ${escapeHtml(lessonPlan.mindsOn) || 'Not specified'}
            </div>
          </div>
          
          <div class="lesson-part">
            <div class="part-header">
              Action (${actionTime} min)
            </div>
            <div class="part-content">
              ${escapeHtml(lessonPlan.action) || 'Not specified'}
            </div>
          </div>
          
          <div class="lesson-part">
            <div class="part-header">
              Consolidation (${consolidationTime} min)
            </div>
            <div class="part-content">
              ${escapeHtml(lessonPlan.consolidation) || 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      ${lessonPlan.materials?.length ? `
        <div class="section no-break">
          <div class="section-title">Materials Needed</div>
          <ul>
            ${lessonPlan.materials.map(material => `<li>${escapeHtml(material)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${(lessonPlan.accommodations?.length || lessonPlan.modifications?.length || lessonPlan.extensions?.length) ? `
        <div class="section page-break">
          <div class="section-title">Differentiation</div>
          <div class="diff-grid">
            ${lessonPlan.accommodations?.length ? `
              <div class="diff-section">
                <div class="diff-title">Accommodations</div>
                <ul>
                  ${lessonPlan.accommodations.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${lessonPlan.modifications?.length ? `
              <div class="diff-section">
                <div class="diff-title">Modifications</div>
                <ul>
                  ${lessonPlan.modifications.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${lessonPlan.extensions?.length ? `
              <div class="diff-section">
                <div class="diff-title">Extensions</div>
                <ul>
                  ${lessonPlan.extensions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      ${lessonPlan.isSubFriendly && lessonPlan.subNotes ? `
        <div class="sub-friendly no-break">
          <div class="sub-title">Notes for Substitute Teacher</div>
          <p>${escapeHtml(lessonPlan.subNotes)}</p>
        </div>
      ` : ''}

      ${lessonPlan.assessmentNotes ? `
        <div class="section no-break">
          <div class="section-title">Assessment Notes</div>
          <p>${escapeHtml(lessonPlan.assessmentNotes)}</p>
        </div>
      ` : ''}

      <div class="generated-note">
        Generated by Teaching Engine 2.0 on ${format(new Date(), 'MMMM d, yyyy')} at ${format(new Date(), 'h:mm a')}
      </div>
    </body>
    </html>
  `;
};

export const printHTML = (html: string, _filename: string = 'document') => {
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

export const downloadHTML = (html: string, filename: string = 'document') => {
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

// ETFO Blank Template Generation Functions

export interface ETFOSchoolInfo {
  schoolName?: string;
  teacherName?: string;
  grade?: string;
  subject?: string;
  academicYear?: string;
}

const getETFOHeaderStyles = () => `
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

export const generateLongRangePlanBlankTemplate = (_schoolInfo: ETFOSchoolInfo = {}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ETFO Long-Range Plan Template</title>
      <style>
        @media print {
          @page {
            margin: 0.5in;
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
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        
        ${getETFOHeaderStyles()}
        
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
      </style>
    </head>
    <body>
      <div class="etfo-header">
        <div class="etfo-logo">ETFO Planning for Student Learning</div>
        <h1 style="margin: 0.5rem 0; font-size: 24px;">Long-Range Plan Template</h1>
        
        <div class="school-info">
          <div class="school-info-item">
            <span class="school-info-label">School:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Teacher:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Grade:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Subject:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Academic Year:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Date Created:</span>
            <div class="school-info-line"></div>
          </div>
        </div>
      </div>

      <div class="units-overview">
        <h2 style="border-bottom: 2px solid #333; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
          Unit Overview (${new Date().getFullYear()}-${new Date().getFullYear() + 1} Academic Year)
        </h2>
        
        ${Array.from({ length: 6 }, (_, i) => `
          <div class="unit-box no-break">
            <div class="unit-header">
              <div>
                <div class="unit-title">Unit ${i + 1}: _________________________________</div>
              </div>
              <div style="text-align: center;">
                <strong>Term:</strong><br>
                <div style="border-bottom: 1px solid #333; height: 20px; margin-top: 5px;"></div>
              </div>
              <div style="text-align: center;">
                <strong>Duration:</strong><br>
                <div style="border-bottom: 1px solid #333; height: 20px; margin-top: 5px;"></div>
              </div>
            </div>
            
            <div class="unit-content">
              <div>
                <div style="font-weight: bold; margin-bottom: 0.5rem;">Big Ideas:</div>
                <div class="fill-lines" style="min-height: 80px;"></div>
              </div>
              
              <div class="expectations-section">
                <div class="expectations-title">Curriculum Expectations:</div>
                <div style="margin-bottom: 0.5rem; font-size: 14px;">Overall:</div>
                <div class="fill-lines" style="min-height: 40px; margin-bottom: 1rem;"></div>
                <div style="margin-bottom: 0.5rem; font-size: 14px;">Specific:</div>
                <div class="fill-lines" style="min-height: 40px;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="page-break">
        <h2 style="border-bottom: 2px solid #333; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
          Assessment Overview & Planning Notes
        </h2>
        
        <div class="planning-grid one-column-grid">
          <div class="planning-section">
            <div class="planning-section-header">Assessment FOR Learning (Diagnostic)</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 100px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Assessment AS Learning (Formative)</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 100px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Assessment OF Learning (Summative)</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 100px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Cross-Curricular Connections & Learning Skills</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        Generated by Teaching Engine 2.0 • ETFO Planning for Student Learning Framework • ${format(new Date(), 'MMMM d, yyyy')}
      </div>
    </body>
    </html>
  `;
};

export const generateUnitPlanBlankTemplate = (_schoolInfo: ETFOSchoolInfo = {}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ETFO Unit Plan Template</title>
      <style>
        @media print {
          @page {
            margin: 0.5in;
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
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        
        ${getETFOHeaderStyles()}
      </style>
    </head>
    <body>
      <div class="etfo-header">
        <div class="etfo-logo">ETFO Planning for Student Learning</div>
        <h1 style="margin: 0.5rem 0; font-size: 24px;">Unit Plan Template</h1>
        
        <div class="school-info">
          <div class="school-info-item">
            <span class="school-info-label">Unit Title:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Grade/Subject:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Start Date:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">End Date:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Teacher:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Duration:</span>
            <div class="school-info-line"></div>
          </div>
        </div>
      </div>

      <!-- Part 1: Framing the Unit -->
      <div class="no-break">
        <h2 style="background: #1e40af; color: white; padding: 0.5rem; margin: 0 0 1rem 0; text-align: center;">
          PART 1: FRAMING THE UNIT
        </h2>
        
        <div class="planning-grid two-column-grid">
          <div class="planning-section">
            <div class="planning-section-header">Big Ideas</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 100px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Essential Questions</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 100px;"></div>
            </div>
          </div>
        </div>
        
        <div class="planning-grid one-column-grid">
          <div class="planning-section">
            <div class="planning-section-header">Overall Curriculum Expectations</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 80px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Specific Curriculum Expectations</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Part 2: Learning Goals and Success Criteria -->
      <div class="page-break">
        <h2 style="background: #059669; color: white; padding: 0.5rem; margin: 0 0 1rem 0; text-align: center;">
          PART 2: LEARNING GOALS & SUCCESS CRITERIA
        </h2>
        
        <div class="planning-grid one-column-grid">
          <div class="planning-section">
            <div class="planning-section-header">Learning Goals (What students will learn)</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 140px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Success Criteria (How students will show their learning)</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 140px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Part 3: Assessment Plan -->
      <div class="page-break">
        <h2 style="background: #dc2626; color: white; padding: 0.5rem; margin: 0 0 1rem 0; text-align: center;">
          PART 3: ASSESSMENT PLAN
        </h2>
        
        <div class="planning-grid three-column-grid">
          <div class="planning-section">
            <div class="planning-section-header">Assessment FOR Learning<br><small>(Diagnostic/Pre-assessment)</small></div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Assessment AS Learning<br><small>(Formative/Ongoing)</small></div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Assessment OF Learning<br><small>(Summative/Final)</small></div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
          </div>
        </div>
        
        <div class="planning-grid two-column-grid">
          <div class="planning-section">
            <div class="planning-section-header">Differentiation Strategies</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 100px;"></div>
            </div>
          </div>
          
          <div class="planning-section">
            <div class="planning-section-header">Cross-Curricular Connections</div>
            <div class="planning-section-content">
              <div class="fill-lines" style="min-height: 100px;"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        Generated by Teaching Engine 2.0 • ETFO Planning for Student Learning Framework • ${format(new Date(), 'MMMM d, yyyy')}
      </div>
    </body>
    </html>
  `;
};

export const generateLessonPlanBlankTemplate = (_schoolInfo: ETFOSchoolInfo = {}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ETFO Lesson Plan Template</title>
      <style>
        @media print {
          @page {
            margin: 0.5in;
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
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        
        ${getETFOHeaderStyles()}
        
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
      </style>
    </head>
    <body>
      <div class="etfo-header">
        <div class="etfo-logo">ETFO Planning for Student Learning</div>
        <h1 style="margin: 0.5rem 0; font-size: 24px;">Lesson Plan Template</h1>
        
        <div class="school-info">
          <div class="school-info-item">
            <span class="school-info-label">Lesson Title:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Unit:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Teacher:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Grade/Subject:</span>
            <div class="school-info-line"></div>
          </div>
        </div>
      </div>

      <div class="lesson-meta no-break">
        <div class="meta-item">
          <div class="meta-label">Date</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Duration</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Grouping</div>
          <div class="meta-value"></div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Assessment Type</div>
          <div class="meta-value"></div>
        </div>
      </div>

      <div class="planning-grid one-column-grid no-break">
        <div class="planning-section">
          <div class="planning-section-header">Learning Goals</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 60px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Success Criteria</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 60px;"></div>
          </div>
        </div>
      </div>

      <div class="three-part-lesson">
        <div class="lesson-part">
          <div class="lesson-part-header">
            <span>MINDS ON (Hook/Activate Prior Knowledge)</span>
            <span style="font-size: 14px;">~15% of lesson time</span>
          </div>
          <div class="lesson-part-content">
            <div class="activity-area">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
            <div class="materials-area">
              <div class="materials-title">Materials Needed:</div>
              <div class="fill-lines" style="min-height: 90px;"></div>
            </div>
          </div>
        </div>
        
        <div class="lesson-part">
          <div class="lesson-part-header">
            <span>ACTION (Main Learning Activities)</span>
            <span style="font-size: 14px;">~70% of lesson time</span>
          </div>
          <div class="lesson-part-content">
            <div class="activity-area">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
            <div class="materials-area">
              <div class="materials-title">Materials Needed:</div>
              <div class="fill-lines" style="min-height: 90px;"></div>
            </div>
          </div>
        </div>
        
        <div class="lesson-part">
          <div class="lesson-part-header">
            <span>CONSOLIDATION (Reflect/Summarize)</span>
            <span style="font-size: 14px;">~15% of lesson time</span>
          </div>
          <div class="lesson-part-content">
            <div class="activity-area">
              <div class="fill-lines" style="min-height: 120px;"></div>
            </div>
            <div class="materials-area">
              <div class="materials-title">Materials Needed:</div>
              <div class="fill-lines" style="min-height: 90px;"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="planning-grid three-column-grid">
        <div class="planning-section">
          <div class="planning-section-header">Accommodations</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Modifications</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Extensions</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
      </div>

      <div class="planning-grid two-column-grid">
        <div class="planning-section">
          <div class="planning-section-header">Assessment Strategy</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Reflection Notes</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
      </div>

      <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        Generated by Teaching Engine 2.0 • ETFO Planning for Student Learning Framework • ${format(new Date(), 'MMMM d, yyyy')}
      </div>
    </body>
    </html>
  `;
};

export const generateDaybookBlankTemplate = (_schoolInfo: ETFOSchoolInfo = {}): string => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ETFO Daybook Template</title>
      <style>
        @media print {
          @page {
            margin: 0.5in;
            size: letter landscape;
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
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.3;
          color: #333;
          max-width: 11in;
          margin: 0 auto;
          padding: 0.5in;
        }
        
        ${getETFOHeaderStyles()}
        
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
      </style>
    </head>
    <body>
      <div class="etfo-header">
        <div class="etfo-logo">ETFO Planning for Student Learning</div>
        <h1 style="margin: 0.5rem 0; font-size: 24px;">Weekly Daybook Template</h1>
        
        <div class="school-info">
          <div class="school-info-item">
            <span class="school-info-label">Week of:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Grade:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Teacher:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Special Events:</span>
            <div class="school-info-line"></div>
          </div>
        </div>
      </div>

      <div class="week-overview no-break">
        <div class="week-header">Weekly Schedule</div>
        <div class="week-grid">
          <div class="time-column">Time</div>
          ${weekDays.map(day => `<div class="day-header">${day}</div>`).join('')}
          
          <div class="time-column">9:00-10:00</div>
          ${weekDays.map(() => '<div class="lesson-cell"></div>').join('')}
          
          <div class="time-column">10:00-11:00</div>
          ${weekDays.map(() => '<div class="lesson-cell"></div>').join('')}
          
          <div class="time-column">11:00-12:00</div>
          ${weekDays.map(() => '<div class="lesson-cell"></div>').join('')}
          
          <div class="time-column">12:00-1:00</div>
          ${weekDays.map(() => '<div class="lesson-cell" style="background: #f3f4f6;">LUNCH</div>').join('')}
          
          <div class="time-column">1:00-2:00</div>
          ${weekDays.map(() => '<div class="lesson-cell"></div>').join('')}
          
          <div class="time-column">2:00-3:00</div>
          ${weekDays.map(() => '<div class="lesson-cell"></div>').join('')}
          
          <div class="time-column">3:00-3:30</div>
          ${weekDays.map(() => '<div class="lesson-cell"></div>').join('')}
        </div>
      </div>

      <div class="planning-grid two-column-grid no-break">
        <div class="planning-section">
          <div class="planning-section-header">Weekly Big Ideas & Learning Goals</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 100px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Assessment Focus This Week</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 100px;"></div>
          </div>
        </div>
      </div>

      <h3 style="border-bottom: 2px solid #333; padding-bottom: 0.5rem; margin: 1.5rem 0 1rem 0;">
        Daily Reflection & Notes
      </h3>
      
      <div class="daily-reflection">
        ${weekDays.map(day => `
          <div class="reflection-card">
            <div class="reflection-header">${day}</div>
            <div class="reflection-content">
              <div class="fill-lines" style="height: 100%;"></div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="planning-grid two-column-grid">
        <div class="planning-section">
          <div class="planning-section-header">Substitute Teacher Notes</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Planning Notes for Next Week</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
      </div>

      <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        Generated by Teaching Engine 2.0 • ETFO Planning for Student Learning Framework • ${format(new Date(), 'MMMM d, yyyy')}
      </div>
    </body>
    </html>
  `;
};

export const generateWeeklyOverviewBlankTemplate = (_schoolInfo: ETFOSchoolInfo = {}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ETFO Weekly Overview Template</title>
      <style>
        @media print {
          @page {
            margin: 0.5in;
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
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.4;
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
        }
        
        ${getETFOHeaderStyles()}
        
        .week-number {
          background: #1e40af;
          color: white;
          padding: 1rem;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }
      </style>
    </head>
    <body>
      <div class="etfo-header">
        <div class="etfo-logo">ETFO Planning for Student Learning</div>
        <h1 style="margin: 0.5rem 0; font-size: 24px;">Weekly Overview Template</h1>
        
        <div class="school-info">
          <div class="school-info-item">
            <span class="school-info-label">Week of:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Grade:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Teacher:</span>
            <div class="school-info-line"></div>
          </div>
          <div class="school-info-item">
            <span class="school-info-label">Week #:</span>
            <div class="school-info-line"></div>
          </div>
        </div>
      </div>

      <div class="planning-grid one-column-grid">
        <div class="planning-section">
          <div class="planning-section-header">Weekly Learning Focus</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Key Curriculum Expectations This Week</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 100px;"></div>
          </div>
        </div>
      </div>

      <div class="planning-grid two-column-grid">
        <div class="planning-section">
          <div class="planning-section-header">Assessment Opportunities</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 120px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Resources & Materials Needed</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 120px;"></div>
          </div>
        </div>
      </div>

      <div class="planning-grid one-column-grid">
        <div class="planning-section">
          <div class="planning-section-header">Special Events, Field Trips, or Announcements</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 80px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Home Learning & Parent Communication</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 100px;"></div>
          </div>
        </div>
        
        <div class="planning-section">
          <div class="planning-section-header">Reflection & Notes for Next Week</div>
          <div class="planning-section-content">
            <div class="fill-lines" style="min-height: 120px;"></div>
          </div>
        </div>
      </div>

      <div style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
        Generated by Teaching Engine 2.0 • ETFO Planning for Student Learning Framework • ${format(new Date(), 'MMMM d, yyyy')}
      </div>
    </body>
    </html>
  `;
};