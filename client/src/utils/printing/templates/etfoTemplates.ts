/**
 * ETFO Templates Module
 * 
 * Generates HTML for ETFO (Elementary Teachers' Federation of Ontario) blank templates
 * using reusable components. Replaces the large repetitive template functions.
 */

import { format } from 'date-fns';

import { escapeHtml } from '../../sanitization';
import { 
  createBaseHTMLDocument, 
  createTeachingEngineFooter,
  createGridLayout,
  createInfoCard 
} from '../components/baseTemplate';
import { 
  getETFOStyles, 
  getETFOLessonStyles, 
  getETFODaybookStyles, 
  getETFOWeeklyOverviewStyles 
} from '../styles/printStyles';
import type { ETFOSchoolInfo } from '../types';

/**
 * Creates ETFO header with logo and school info grid
 */
function createETFOHeader(
  title: string, 
  schoolInfoFields: { label: string; value?: string }[] = []
): string {
  const defaultFields = [
    { label: 'School:', value: '' },
    { label: 'Teacher:', value: '' },
    { label: 'Grade:', value: '' },
    { label: 'Subject:', value: '' },
    { label: 'Academic Year:', value: '' },
    { label: 'Date Created:', value: '' }
  ];
  
  const fields = schoolInfoFields.length > 0 ? schoolInfoFields : defaultFields;
  
  const schoolInfoHtml = fields.map(field => `
    <div class="school-info-item">
      <span class="school-info-label">${escapeHtml(field.label)}</span>
      <div class="school-info-line"></div>
    </div>
  `).join('');
  
  return `
    <div class="etfo-header">
      <div class="etfo-logo">ETFO Planning for Student Learning</div>
      <h1 style="margin: 0.5rem 0; font-size: 24px;">${escapeHtml(title)}</h1>
      
      <div class="school-info">
        ${schoolInfoHtml}
      </div>
    </div>
  `;
}

/**
 * Creates a planning section with fillable lines
 */
function createPlanningSection(
  title: string, 
  subtitle?: string, 
  minHeight = 120
): string {
  const subtitleHtml = subtitle ? `<br><small>${escapeHtml(subtitle)}</small>` : '';
  
  return `
    <div class="planning-section">
      <div class="planning-section-header">${escapeHtml(title)}${subtitleHtml}</div>
      <div class="planning-section-content">
        <div class="fill-lines" style="min-height: ${minHeight}px;"></div>
      </div>
    </div>
  `;
}

/**
 * Creates a unit box for long-range plans
 */
function createUnitBox(unitNumber: number): string {
  return `
    <div class="unit-box no-break">
      <div class="unit-header">
        <div>
          <div class="unit-title">Unit ${unitNumber}: _________________________________</div>
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
  `;
}

/**
 * Generates ETFO Long-Range Plan blank template
 */
export function generateLongRangePlanBlankTemplate(_schoolInfo: ETFOSchoolInfo = {}): string {
  const title = 'ETFO Long-Range Plan Template';
  const styles = getETFOStyles();
  
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;
  
  // Generate 6 unit boxes
  const unitBoxes = Array.from({ length: 6 }, (_, i) => createUnitBox(i + 1)).join('\n');
  
  const body = `
    ${createETFOHeader('Long-Range Plan Template')}

    <div class="units-overview">
      <h2 style="border-bottom: 2px solid #333; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
        Unit Overview (${academicYear} Academic Year)
      </h2>
      
      ${unitBoxes}
    </div>

    <div class="page-break">
      <h2 style="border-bottom: 2px solid #333; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
        Assessment Overview & Planning Notes
      </h2>
      
      <div class="planning-grid one-column-grid">
        ${createPlanningSection('Assessment FOR Learning (Diagnostic)', undefined, 100)}
        ${createPlanningSection('Assessment AS Learning (Formative)', undefined, 100)}
        ${createPlanningSection('Assessment OF Learning (Summative)', undefined, 100)}
        ${createPlanningSection('Cross-Curricular Connections & Learning Skills', undefined, 120)}
      </div>
    </div>

    ${createTeachingEngineFooter()}
  `;
  
  return createBaseHTMLDocument(title, styles, body);
}

/**
 * Generates ETFO Unit Plan blank template
 */
export function generateUnitPlanBlankTemplate(_schoolInfo: ETFOSchoolInfo = {}): string {
  const title = 'ETFO Unit Plan Template';
  const styles = getETFOStyles();
  
  const unitInfoFields = [
    { label: 'Unit Title:', value: '' },
    { label: 'Grade/Subject:', value: '' },
    { label: 'Start Date:', value: '' },
    { label: 'End Date:', value: '' },
    { label: 'Teacher:', value: '' },
    { label: 'Duration:', value: '' }
  ];
  
  const body = `
    ${createETFOHeader('Unit Plan Template', unitInfoFields)}

    <!-- Part 1: Framing the Unit -->
    <div class="no-break">
      <h2 style="background: #1e40af; color: white; padding: 0.5rem; margin: 0 0 1rem 0; text-align: center;">
        PART 1: FRAMING THE UNIT
      </h2>
      
      <div class="planning-grid two-column-grid">
        ${createPlanningSection('Big Ideas', undefined, 100)}
        ${createPlanningSection('Essential Questions', undefined, 100)}
      </div>
      
      <div class="planning-grid one-column-grid">
        ${createPlanningSection('Overall Curriculum Expectations', undefined, 80)}
        ${createPlanningSection('Specific Curriculum Expectations', undefined, 120)}
      </div>
    </div>

    <!-- Part 2: Learning Goals and Success Criteria -->
    <div class="page-break">
      <h2 style="background: #059669; color: white; padding: 0.5rem; margin: 0 0 1rem 0; text-align: center;">
        PART 2: LEARNING GOALS & SUCCESS CRITERIA
      </h2>
      
      <div class="planning-grid one-column-grid">
        ${createPlanningSection('Learning Goals (What students will learn)', undefined, 140)}
        ${createPlanningSection('Success Criteria (How students will show their learning)', undefined, 140)}
      </div>
    </div>

    <!-- Part 3: Assessment Plan -->
    <div class="page-break">
      <h2 style="background: #dc2626; color: white; padding: 0.5rem; margin: 0 0 1rem 0; text-align: center;">
        PART 3: ASSESSMENT PLAN
      </h2>
      
      <div class="planning-grid three-column-grid">
        ${createPlanningSection('Assessment FOR Learning', 'Diagnostic/Pre-assessment', 120)}
        ${createPlanningSection('Assessment AS Learning', 'Formative/Ongoing', 120)}
        ${createPlanningSection('Assessment OF Learning', 'Summative/Final', 120)}
      </div>
      
      <div class="planning-grid two-column-grid">
        ${createPlanningSection('Differentiation Strategies', undefined, 100)}
        ${createPlanningSection('Cross-Curricular Connections', undefined, 100)}
      </div>
    </div>

    ${createTeachingEngineFooter()}
  `;
  
  return createBaseHTMLDocument(title, styles, body);
}

/**
 * Generates ETFO Lesson Plan blank template
 */
export function generateLessonPlanBlankTemplate(_schoolInfo: ETFOSchoolInfo = {}): string {
  const title = 'ETFO Lesson Plan Template';
  const styles = getETFOLessonStyles();
  
  const lessonInfoFields = [
    { label: 'Lesson Title:', value: '' },
    { label: 'Unit:', value: '' },
    { label: 'Teacher:', value: '' },
    { label: 'Grade/Subject:', value: '' }
  ];
  
  const body = `
    ${createETFOHeader('Lesson Plan Template', lessonInfoFields)}

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
      ${createPlanningSection('Learning Goals', undefined, 60)}
      ${createPlanningSection('Success Criteria', undefined, 60)}
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
      ${createPlanningSection('Accommodations', undefined, 80)}
      ${createPlanningSection('Modifications', undefined, 80)}
      ${createPlanningSection('Extensions', undefined, 80)}
    </div>

    <div class="planning-grid two-column-grid">
      ${createPlanningSection('Assessment Strategy', undefined, 80)}
      ${createPlanningSection('Reflection Notes', undefined, 80)}
    </div>

    ${createTeachingEngineFooter()}
  `;
  
  return createBaseHTMLDocument(title, styles, body);
}

/**
 * Generates ETFO Daybook blank template
 */
export function generateDaybookBlankTemplate(_schoolInfo: ETFOSchoolInfo = {}): string {
  const title = 'ETFO Daybook Template';
  const styles = getETFODaybookStyles();
  
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const daybookInfoFields = [
    { label: 'Week of:', value: '' },
    { label: 'Grade:', value: '' },
    { label: 'Teacher:', value: '' },
    { label: 'Special Events:', value: '' }
  ];
  
  // Create weekly schedule grid
  const weeklySchedule = `
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
  `;
  
  // Create daily reflection cards
  const dailyReflection = `
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
  `;
  
  const body = `
    ${createETFOHeader('Weekly Daybook Template', daybookInfoFields)}

    ${weeklySchedule}

    <div class="planning-grid two-column-grid no-break">
      ${createPlanningSection('Weekly Big Ideas & Learning Goals', undefined, 100)}
      ${createPlanningSection('Assessment Focus This Week', undefined, 100)}
    </div>

    <h3 style="border-bottom: 2px solid #333; padding-bottom: 0.5rem; margin: 1.5rem 0 1rem 0;">
      Daily Reflection & Notes
    </h3>
    
    ${dailyReflection}

    <div class="planning-grid two-column-grid">
      ${createPlanningSection('Substitute Teacher Notes', undefined, 80)}
      ${createPlanningSection('Planning Notes for Next Week', undefined, 80)}
    </div>

    ${createTeachingEngineFooter()}
  `;
  
  return createBaseHTMLDocument(title, styles, body);
}

/**
 * Generates ETFO Weekly Overview blank template
 */
export function generateWeeklyOverviewBlankTemplate(_schoolInfo: ETFOSchoolInfo = {}): string {
  const title = 'ETFO Weekly Overview Template';
  const styles = getETFOWeeklyOverviewStyles();
  
  const weeklyInfoFields = [
    { label: 'Week of:', value: '' },
    { label: 'Grade:', value: '' },
    { label: 'Teacher:', value: '' },
    { label: 'Week #:', value: '' }
  ];
  
  const body = `
    ${createETFOHeader('Weekly Overview Template', weeklyInfoFields)}

    <div class="planning-grid one-column-grid">
      ${createPlanningSection('Weekly Learning Focus', undefined, 80)}
      ${createPlanningSection('Key Curriculum Expectations This Week', undefined, 100)}
    </div>

    <div class="planning-grid two-column-grid">
      ${createPlanningSection('Assessment Opportunities', undefined, 120)}
      ${createPlanningSection('Resources & Materials Needed', undefined, 120)}
    </div>

    <div class="planning-grid one-column-grid">
      ${createPlanningSection('Special Events, Field Trips, or Announcements', undefined, 80)}
      ${createPlanningSection('Home Learning & Parent Communication', undefined, 100)}
      ${createPlanningSection('Reflection & Notes for Next Week', undefined, 120)}
    </div>

    ${createTeachingEngineFooter()}
  `;
  
  return createBaseHTMLDocument(title, styles, body);
}