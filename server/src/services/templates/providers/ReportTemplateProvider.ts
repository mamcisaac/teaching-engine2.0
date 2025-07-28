/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Report Template Provider
 * Provides templates for various reports
 */

import { logger } from '../../../logger';

import type { Template, TemplateContext } from './TemplateProvider';
import { TemplateProvider } from './TemplateProvider';

export class ReportTemplateProvider extends TemplateProvider {
  constructor() {
    super('ReportTemplateProvider');
    try {
      this.loadTemplates();
    } catch (error) {
      logger.error('Failed to load report templates:', error as string | undefined);
    }
  }

  /**
   * Get template based on context
   */
  async getTemplate(context: TemplateContext): Promise<Template> {
    const reportType = context.parameters?.type !== null && context.parameters?.type !== undefined ? context.parameters.type : 'progress';
    const format = context.parameters?.format !== null && context.parameters?.format !== undefined ? context.parameters.format : 'pdf';
    
    const templateId = `report-${reportType}-${format}`;
    let template = await this.getTemplateById(templateId);
    
    if (!template) {
      template = await this.getTemplateById(`report-${reportType}`);
    }
    
    if (!template) {
      throw new Error(`No report template found for type: ${reportType}`);
    }

    return template;
  }

  /**
   * List available templates
   */
  async listTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Validate context
   */
  validateContext(context: TemplateContext): boolean {
    return Boolean(context.userId !== null && context.userId !== undefined && context.userId !== 0) && Boolean(context.parameters?.type !== null && context.parameters?.type !== undefined && context.parameters.type !== '');
  }

  /**
   * Load templates
   */
  protected loadTemplates(): void {
    // Progress report template
    this.registerTemplate({
      id: 'report-progress-pdf',
      name: 'Student Progress Report',
      engine: 'pdf',
      format: 'pdf',
      supportedFormats: ['pdf'],
      content: this.getProgressReportTemplate(),
      dataRequirements: [
        { key: 'student', type: 'student', required: true },
        { key: 'assessments', type: 'assessment', required: true },
        { key: 'teacher', type: 'user', required: true },
        { key: 'reportPeriod', type: 'custom', required: true },
      ],
      metadata: {
        version: '1.0',
        tags: ['report', 'progress', 'student', 'assessment'],
      },
    });

    // Term report template
    this.registerTemplate({
      id: 'report-term',
      name: 'Term Report Card',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html', 'pdf'],
      content: this.getTermReportTemplate(),
      dataRequirements: [
        { key: 'student', type: 'student', required: true },
        { key: 'grades', type: 'assessment', required: true },
        { key: 'attendance', type: 'custom', required: true },
        { key: 'comments', type: 'custom', required: true },
      ],
      metadata: {
        version: '1.0',
        tags: ['report', 'term', 'grades', 'official'],
      },
    });

    // Class summary report
    this.registerTemplate({
      id: 'report-class-summary',
      name: 'Class Summary Report',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html', 'pdf'],
      content: this.getClassSummaryTemplate(),
      dataRequirements: [
        { key: 'classStats', type: 'custom', required: true },
        { key: 'students', type: 'student', required: true },
        { key: 'period', type: 'custom', required: true },
      ],
      metadata: {
        version: '1.0',
        tags: ['report', 'class', 'summary', 'analytics'],
      },
    });

    // IEP report template
    this.registerTemplate({
      id: 'report-iep',
      name: 'IEP Progress Report',
      engine: 'pdf',
      format: 'pdf',
      supportedFormats: ['pdf'],
      content: this.getIEPReportTemplate(),
      dataRequirements: [
        { key: 'student', type: 'student', required: true },
        { key: 'iepGoals', type: 'custom', required: true },
        { key: 'progress', type: 'assessment', required: true },
        { key: 'accommodations', type: 'custom', required: true },
      ],
      metadata: {
        version: '1.0',
        tags: ['report', 'iep', 'special-education', 'progress'],
      },
    });
  }

  /**
   * Get progress report template
   */
  private getProgressReportTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Progress Report - {{student.name}}</title>
  <style>
    @page { size: letter; margin: 0.75in; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24pt; }
    .header h2 { margin: 10px 0 0 0; font-size: 16pt; font-weight: normal; }
    .school-info { text-align: center; margin-bottom: 20px; }
    .student-info { background: #f5f5f5; padding: 15px; margin-bottom: 30px; }
    .student-info table { width: 100%; }
    .student-info td { padding: 5px 0; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section h3 { background: #333; color: white; padding: 8px 15px; margin: 0 0 15px 0; }
    .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .grades-table th, .grades-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    .grades-table th { background: #f0f0f0; font-weight: bold; }
    .grade-scale { float: right; margin-top: -40px; font-size: 10pt; }
    .achievement-box { border: 1px solid #333; padding: 10px; margin: 10px 0; }
    .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .skill-category { margin-bottom: 15px; }
    .skill-item { display: flex; justify-content: space-between; padding: 3px 0; }
    .comments { border: 1px solid #ccc; padding: 15px; min-height: 150px; }
    .signature-section { margin-top: 50px; }
    .signature-line { border-bottom: 1px solid #333; width: 250px; display: inline-block; }
    .footer { text-align: center; margin-top: 50px; font-size: 10pt; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{school.name}}</h1>
    <h2>Progress Report</h2>
  </div>

  <div class="school-info">
    <p>{{school.address}}<br>
    Tel: {{school.phone}} | Fax: {{school.fax}}<br>
    Principal: {{school.principal}}</p>
  </div>

  <div class="student-info">
    <table>
      <tr>
        <td><strong>Student Name:</strong></td>
        <td>{{student.name}}</td>
        <td><strong>Grade:</strong></td>
        <td>{{student.grade}}</td>
      </tr>
      <tr>
        <td><strong>Student ID:</strong></td>
        <td>{{student.id}}</td>
        <td><strong>Teacher:</strong></td>
        <td>{{teacher.name}}</td>
      </tr>
      <tr>
        <td><strong>Reporting Period:</strong></td>
        <td>{{reportPeriod.name}}</td>
        <td><strong>Days Absent:</strong></td>
        <td>{{attendance.absent}}</td>
      </tr>
      <tr>
        <td><strong>From:</strong></td>
        <td>{{formatDate reportPeriod.startDate}}</td>
        <td><strong>Days Late:</strong></td>
        <td>{{attendance.late}}</td>
      </tr>
      <tr>
        <td><strong>To:</strong></td>
        <td>{{formatDate reportPeriod.endDate}}</td>
        <td><strong>Total Days:</strong></td>
        <td>{{reportPeriod.totalDays}}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h3>Academic Achievement</h3>
    <div class="grade-scale">
      <strong>Achievement Scale:</strong><br>
      A = 80-100% | B = 70-79%<br>
      C = 60-69% | D = 50-59%<br>
      R = Below 50%
    </div>
    
    <table class="grades-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Current Grade</th>
          <th>Effort</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        {{#each grades}}
        <tr>
          <td><strong>{{this.subject}}</strong></td>
          <td>{{this.grade}}</td>
          <td>{{this.effort}}</td>
          <td>{{this.comment}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h3>Learning Skills & Work Habits</h3>
    <p><strong>E</strong> = Excellent | <strong>G</strong> = Good | <strong>S</strong> = Satisfactory | <strong>N</strong> = Needs Improvement</p>
    
    <div class="skills-grid">
      <div>
        {{#each learningSkills.left}}
        <div class="skill-category">
          <strong>{{this.category}}</strong>
          {{#each this.skills}}
          <div class="skill-item">
            <span>{{this.name}}</span>
            <span><strong>{{this.rating}}</strong></span>
          </div>
          {{/each}}
        </div>
        {{/each}}
      </div>
      <div>
        {{#each learningSkills.right}}
        <div class="skill-category">
          <strong>{{this.category}}</strong>
          {{#each this.skills}}
          <div class="skill-item">
            <span>{{this.name}}</span>
            <span><strong>{{this.rating}}</strong></span>
          </div>
          {{/each}}
        </div>
        {{/each}}
      </div>
    </div>
  </div>

  {{#if achievements}}
  <div class="section">
    <h3>Achievements & Recognition</h3>
    {{#each achievements}}
    <div class="achievement-box">
      <strong>{{this.title}}</strong><br>
      {{this.description}}
    </div>
    {{/each}}
  </div>
  {{/if}}

  <div class="section">
    <h3>Teacher Comments</h3>
    <div class="comments">
      {{teacherComments}}
    </div>
  </div>

  <div class="section">
    <h3>Next Steps</h3>
    <div class="comments">
      <p><strong>Goals for next term:</strong></p>
      <ul>
        {{#each nextSteps.goals}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      
      <p><strong>Areas for improvement:</strong></p>
      <ul>
        {{#each nextSteps.improvements}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      
      <p><strong>Support at home:</strong></p>
      <ul>
        {{#each nextSteps.homeSupport}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
  </div>

  <div class="signature-section">
    <table width="100%">
      <tr>
        <td>
          Teacher: <span class="signature-line"></span><br>
          {{teacher.name}}<br>
          Date: {{formatDate 'now'}}
        </td>
        <td>
          Principal: <span class="signature-line"></span><br>
          {{school.principal}}<br>
          Date: _________________
        </td>
      </tr>
    </table>
    
    <p style="margin-top: 30px;">
      Parent/Guardian Signature: <span class="signature-line" style="width: 400px;"></span><br>
      Date: _________________
    </p>
  </div>

  <div class="footer">
    <p>This report is based on the Ontario Curriculum and reflects your child's achievement of the provincial expectations.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get term report template
   */
  private getTermReportTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Term Report Card - {{student.name}}</title>
  <style>
    @page { size: letter; margin: 0.5in; }
    body { font-family: Arial, sans-serif; font-size: 11pt; }
    .report-card { border: 2px solid #000; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 20pt; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { border: 1px solid #333; padding: 10px; }
    .grades-section { margin-bottom: 20px; }
    .subject-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 10px; padding: 8px; border-bottom: 1px solid #ccc; }
    .subject-header { font-weight: bold; background: #f0f0f0; }
    .strand { margin-left: 20px; font-size: 10pt; color: #666; }
    .learning-skills { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 20px; }
    .skill-box { border: 1px solid #333; padding: 10px; text-align: center; }
    .comments-box { border: 1px solid #333; padding: 15px; min-height: 200px; margin-bottom: 20px; }
    .legend { font-size: 9pt; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <h1>{{school.name}}</h1>
      <h2>Provincial Report Card - Elementary</h2>
      <p>{{term}} - {{schoolYear}}</p>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <strong>Student Information</strong><br>
        Name: {{student.name}}<br>
        Grade: {{student.grade}}<br>
        Student ID: {{student.id}}<br>
        Date of Birth: {{formatDate student.dateOfBirth}}
      </div>
      <div class="info-box">
        <strong>School Information</strong><br>
        Teacher: {{teacher.name}}<br>
        Principal: {{school.principal}}<br>
        School Year: {{schoolYear}}<br>
        Days Absent: {{attendance.absent}} | Late: {{attendance.late}}
      </div>
    </div>

    <div class="grades-section">
      <h3>Achievement of Provincial Curriculum Expectations</h3>
      <div class="subject-row subject-header">
        <div>Subject</div>
        <div>Term 1</div>
        <div>Term 2</div>
        <div>Final</div>
        <div>Comments</div>
      </div>
      
      {{#each subjects}}
      <div class="subject-row">
        <div>
          <strong>{{this.name}}</strong>
          {{#if this.strands}}
          {{#each this.strands}}
          <div class="strand">• {{this.name}}: {{this.grade}}</div>
          {{/each}}
          {{/if}}
        </div>
        <div>{{this.term1}}</div>
        <div>{{this.term2}}</div>
        <div>{{this.final}}</div>
        <div>{{this.comment}}</div>
      </div>
      {{/each}}
    </div>

    <div class="grades-section">
      <h3>Learning Skills and Work Habits</h3>
      <div class="learning-skills">
        {{#each learningSkills}}
        <div class="skill-box">
          <strong>{{this.name}}</strong><br>
          T1: {{this.term1}}<br>
          T2: {{this.term2}}
        </div>
        {{/each}}
      </div>
    </div>

    <div class="comments-box">
      <h3>Teacher Comments - Strengths/Next Steps for Improvement</h3>
      <p>{{comments.strengths}}</p>
      <p>{{comments.nextSteps}}</p>
    </div>

    {{#if comments.iep}}
    <div class="comments-box">
      <h3>IEP - Individual Education Plan</h3>
      <p>☑ Student has an IEP that includes accommodations and/or modifications.</p>
      <p>{{comments.iep}}</p>
    </div>
    {{/if}}

    {{#if comments.ell}}
    <div class="comments-box">
      <h3>ESL/ELD - English as a Second Language/English Literacy Development</h3>
      <p>☑ Student is receiving ESL/ELD support.</p>
      <p>{{comments.ell}}</p>
    </div>
    {{/if}}

    <div class="legend">
      <strong>Achievement Scale:</strong> A = 80-100% (Level 4) | B = 70-79% (Level 3) | C = 60-69% (Level 2) | D = 50-59% (Level 1) | R = Below 50%<br>
      <strong>Learning Skills:</strong> E = Excellent | G = Good | S = Satisfactory | N = Needs Improvement
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get class summary template
   */
  private getClassSummaryTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Class Summary Report - {{className}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: #2c3e50; }
    .chart-container { margin: 30px 0; }
    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .data-table th, .data-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    .data-table th { background: #f0f0f0; }
    .distribution-bar { background: #3498db; height: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Class Summary Report</h1>
    <h2>{{className}} - {{period.name}}</h2>
    <p>{{formatDate period.startDate}} to {{formatDate period.endDate}}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="value">{{classStats.totalStudents}}</div>
      <div>Total Students</div>
    </div>
    <div class="stat-card">
      <div class="value">{{classStats.averageGrade}}%</div>
      <div>Class Average</div>
    </div>
    <div class="stat-card">
      <div class="value">{{classStats.attendanceRate}}%</div>
      <div>Attendance Rate</div>
    </div>
    <div class="stat-card">
      <div class="value">{{classStats.assignmentsCompleted}}</div>
      <div>Assignments Completed</div>
    </div>
  </div>

  <h3>Grade Distribution</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Grade Range</th>
        <th>Number of Students</th>
        <th>Percentage</th>
        <th>Distribution</th>
      </tr>
    </thead>
    <tbody>
      {{#each gradeDistribution}}
      <tr>
        <td>{{this.range}}</td>
        <td>{{this.count}}</td>
        <td>{{this.percentage}}%</td>
        <td>
          <div class="distribution-bar" style="width: {{this.percentage}}%"></div>
        </td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <h3>Subject Performance</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Subject</th>
        <th>Class Average</th>
        <th>Highest</th>
        <th>Lowest</th>
        <th>Meeting Expectations</th>
      </tr>
    </thead>
    <tbody>
      {{#each subjectPerformance}}
      <tr>
        <td>{{this.subject}}</td>
        <td>{{this.average}}%</td>
        <td>{{this.highest}}%</td>
        <td>{{this.lowest}}%</td>
        <td>{{this.meetingExpectations}}%</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <h3>Learning Skills Summary</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th>Learning Skill</th>
        <th>Excellent</th>
        <th>Good</th>
        <th>Satisfactory</th>
        <th>Needs Improvement</th>
      </tr>
    </thead>
    <tbody>
      {{#each learningSkillsSummary}}
      <tr>
        <td>{{this.skill}}</td>
        <td>{{this.excellent}}</td>
        <td>{{this.good}}</td>
        <td>{{this.satisfactory}}</td>
        <td>{{this.needsImprovement}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by {{teacher.name}} on {{formatDate 'now'}}</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get IEP report template
   */
  private getIEPReportTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>IEP Progress Report - {{student.name}}</title>
  <style>
    @page { size: letter; margin: 0.75in; }
    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
    .header { background: #f0f0f0; padding: 20px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18pt; }
    .info-section { margin-bottom: 20px; }
    .info-section table { width: 100%; }
    .info-section td { padding: 5px; }
    .goal-section { border: 1px solid #333; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
    .goal-header { background: #e0e0e0; margin: -15px -15px 10px -15px; padding: 10px 15px; }
    .progress-bar { background: #f0f0f0; height: 30px; position: relative; margin: 10px 0; }
    .progress-fill { background: #4CAF50; height: 100%; }
    .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    .accommodations { background: #f9f9f9; padding: 15px; margin: 20px 0; }
    .signatures { margin-top: 50px; }
    .signature-line { border-bottom: 1px solid #333; width: 200px; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Individual Education Plan (IEP) Progress Report</h1>
    <p>{{school.name}} - {{reportingPeriod}}</p>
  </div>

  <div class="info-section">
    <table>
      <tr>
        <td><strong>Student:</strong> {{student.name}}</td>
        <td><strong>Grade:</strong> {{student.grade}}</td>
        <td><strong>Date of Birth:</strong> {{formatDate student.dateOfBirth}}</td>
      </tr>
      <tr>
        <td><strong>IEP Date:</strong> {{formatDate iep.date}}</td>
        <td><strong>Review Date:</strong> {{formatDate iep.reviewDate}}</td>
        <td><strong>Teacher:</strong> {{teacher.name}}</td>
      </tr>
      <tr>
        <td colspan="3"><strong>Identification:</strong> {{student.identification}}</td>
      </tr>
    </table>
  </div>

  <h2>IEP Goals Progress</h2>
  
  {{#each iepGoals}}
  <div class="goal-section">
    <div class="goal-header">
      <strong>Goal {{@index}}: {{this.area}}</strong>
    </div>
    
    <p><strong>Annual Goal:</strong> {{this.annualGoal}}</p>
    
    <p><strong>Current Performance:</strong> {{this.currentPerformance}}</p>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: {{this.progressPercentage}}%"></div>
      <div class="progress-text">{{this.progressPercentage}}% Complete</div>
    </div>
    
    <p><strong>Progress Summary:</strong> {{this.progressSummary}}</p>
    
    <p><strong>Teaching Strategies Used:</strong></p>
    <ul>
      {{#each this.strategies}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
    
    <p><strong>Next Steps:</strong></p>
    <ul>
      {{#each this.nextSteps}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/each}}

  <div class="accommodations">
    <h2>Accommodations</h2>
    
    <h3>Instructional Accommodations</h3>
    <ul>
      {{#each accommodations.instructional}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
    
    <h3>Environmental Accommodations</h3>
    <ul>
      {{#each accommodations.environmental}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
    
    <h3>Assessment Accommodations</h3>
    <ul>
      {{#each accommodations.assessment}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>

  {{#if modifications}}
  <div class="accommodations">
    <h2>Program Modifications</h2>
    {{#each modifications}}
    <p><strong>{{this.subject}}:</strong> {{this.description}}</p>
    {{/each}}
  </div>
  {{/if}}

  <div class="accommodations">
    <h2>Transition Plan Update</h2>
    <p>{{transitionUpdate}}</p>
  </div>

  <div class="accommodations">
    <h2>Parent/Guardian Communication</h2>
    <p><strong>Communication Methods:</strong> {{communication.methods}}</p>
    <p><strong>Frequency:</strong> {{communication.frequency}}</p>
    <p><strong>Recent Communication:</strong> {{communication.recent}}</p>
  </div>

  <div class="signatures">
    <h3>Signatures</h3>
    <table width="100%">
      <tr>
        <td>
          Teacher: <span class="signature-line"></span><br>
          Date: {{formatDate 'now'}}
        </td>
        <td>
          Special Education Teacher: <span class="signature-line"></span><br>
          Date: _____________
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 30px;">
          Parent/Guardian: <span class="signature-line"></span><br>
          Date: _____________
        </td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 30px; font-size: 10pt; color: #666;">
    <p>This progress report should be read in conjunction with the student's IEP and provincial report card.</p>
  </div>
</body>
</html>
    `;
  }
}