/**
 * Substitute Plan PDF Service
 * Generates comprehensive PDF documents for substitute teachers
 * including class routines, daybook notes, and lesson plans
 */

import { PrismaClient } from '@teaching-engine/database';
import { PdfEngine } from './templates/engines/PdfEngine';
import { HandlebarsEngine } from './templates/engines/HandlebarsEngine';
import type { Template } from './templates/providers/TemplateProvider';

const prisma = new PrismaClient();

export interface SubstitutePlanPdfData {
  plan: any;
  classRoutines: any[];
  recentDaybookEntries: any[];
  lessonPlans: any[];
  teacher: any;
  students: any[];
  schoolInfo: {
    name: string;
    phone: string;
    address: string;
  };
}

export class SubstitutePlanPdfService {
  private pdfEngine: PdfEngine;
  private handlebarsEngine: HandlebarsEngine;

  constructor() {
    this.pdfEngine = new PdfEngine();
    this.handlebarsEngine = new HandlebarsEngine();
  }

  /**
   * Generate comprehensive substitute plan PDF
   */
  async generatePdf(planId: string, userId: number): Promise<Buffer> {
    try {
      // Fetch all required data
      const data = await this.fetchPlanData(planId, userId);
      
      // Generate HTML from template
      const html = await this.generateHtml(data);
      
      // Convert HTML to PDF
      const pdfBuffer = await this.pdfEngine.generatePdfFromHtml(html, {
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.5in',
          bottom: '0.75in',
          left: '0.5in',
        },
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(data.plan.dateFor),
        footerTemplate: this.getFooterTemplate(),
      });

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating substitute plan PDF:', error);
      throw new Error(`Failed to generate substitute plan PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await this.pdfEngine.cleanup();
    }
  }

  /**
   * Fetch all data needed for the substitute plan
   */
  private async fetchPlanData(planId: string, userId: number): Promise<SubstitutePlanPdfData> {
    // Fetch the substitute plan with all related data
    const plan = await prisma.substitutePlan.findFirst({
      where: { 
        id: planId, 
        userId 
      }
    });

    if (!plan) {
      throw new Error('Substitute plan not found or access denied');
    }

    // Fetch class routines
    const classRoutines = await prisma.classRoutine.findMany({
      where: { 
        userId,
        isActive: true
      },
      orderBy: [
        { priority: 'desc' },
        { category: 'asc' }
      ]
    });

    // Fetch recent daybook entries (last 5 days)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const recentDaybookEntries = await prisma.daybookEntry.findMany({
      where: {
        userId,
        date: {
          gte: fiveDaysAgo
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 5,
      include: {
        lessonPlan: {
          select: {
            title: true,
            subject: true
          }
        }
      }
    });

    // Fetch today's lesson plans
    const startOfDay = new Date(plan.dateFor);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(plan.dateFor);
    endOfDay.setHours(23, 59, 59, 999);

    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        sequence: 'asc'
      }
    });

    // Fetch teacher information
    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        grade: true,
        program: true
      }
    });

    // Fetch student information (if any special notes)
    const students = await prisma.student.findMany({
      where: { 
        userId,
        OR: [
          { medicalNotes: { not: null } },
          { accommodations: { not: null } },
          { parentNotes: { not: null } }
        ]
      },
      select: {
        firstName: true,
        lastName: true,
        medicalNotes: true,
        accommodations: true,
        parentNotes: true
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Default school info (could be fetched from settings)
    const schoolInfo = {
      name: 'École primaire',
      phone: '(902) 555-0100',
      address: '123 School Street, Charlottetown, PE'
    };

    return {
      plan,
      classRoutines,
      recentDaybookEntries,
      lessonPlans,
      teacher,
      students,
      schoolInfo
    };
  }

  /**
   * Generate HTML from template and data
   */
  private async generateHtml(data: SubstitutePlanPdfData): Promise<string> {
    const template = this.getHtmlTemplate();
    
    // Process the data for template
    const templateData = {
      ...data,
      formattedDate: this.formatDate(data.plan.dateFor),
      dayOfWeek: this.getDayOfWeek(data.plan.dateFor),
      schedule: this.parseSchedule(data.plan.schedule),
      routinesByCategory: this.groupRoutinesByCategory(data.classRoutines),
      emergencyInfo: this.parseEmergencyInfo(data.plan.emergencyInfo),
      formattedLessonPlans: this.formatLessonPlans(data.lessonPlans),
      recentNotes: this.formatDaybookNotes(data.recentDaybookEntries),
      importantStudents: data.students
    };

    // Compile and render template
    const compiledTemplate = this.handlebarsEngine.compile(template);
    return compiledTemplate(templateData);
  }

  /**
   * Group routines by category for better organization
   */
  private groupRoutinesByCategory(routines: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {
      morning: [],
      transition: [],
      dismissal: [],
      behavior: [],
      emergency: [],
      other: []
    };

    routines.forEach(routine => {
      const category = routine.category || 'other';
      if (grouped[category]) {
        grouped[category].push(routine);
      }
    });

    return grouped;
  }

  /**
   * Format lesson plans for display
   */
  private formatLessonPlans(lessonPlans: any[]): any[] {
    return lessonPlans.map(plan => ({
      ...plan,
      timeSlot: this.getTimeSlotLabel(plan.sequence),
      hasObjectives: plan.learningGoals || plan.curriculumConnections,
      hasMaterials: plan.materials && plan.materials.length > 0,
      hasAssessment: plan.assessmentStrategies
    }));
  }

  /**
   * Format daybook notes for context
   */
  private formatDaybookNotes(entries: any[]): any[] {
    return entries.map(entry => ({
      date: this.formatDate(entry.date),
      subject: entry.lessonPlan?.subject || 'General',
      whatWorked: entry.whatWorked || entry.whatWorkedFr,
      challenges: entry.whatDidntWork || entry.whatDidntWorkFr || entry.commonChallenges,
      achievements: entry.notableAchievements,
      nextSteps: entry.nextSteps || entry.nextStepsFr
    })).filter(note => 
      note.whatWorked || note.challenges || note.achievements || note.nextSteps
    );
  }

  /**
   * Parse schedule JSON
   */
  private parseSchedule(schedule: any): any[] {
    if (typeof schedule === 'string') {
      try {
        return JSON.parse(schedule);
      } catch {
        return [];
      }
    }
    return Array.isArray(schedule) ? schedule : [];
  }

  /**
   * Parse emergency info JSON
   */
  private parseEmergencyInfo(emergencyInfo: any): any {
    if (typeof emergencyInfo === 'string') {
      try {
        return JSON.parse(emergencyInfo);
      } catch {
        return {};
      }
    }
    return emergencyInfo || {};
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Get day of week
   */
  private getDayOfWeek(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  /**
   * Get time slot label for lesson sequence
   */
  private getTimeSlotLabel(sequence: number): string {
    const slots = [
      '9:00 AM - 9:45 AM',
      '9:45 AM - 10:30 AM',
      '10:45 AM - 11:30 AM',
      '1:00 PM - 1:45 PM',
      '1:45 PM - 2:30 PM'
    ];
    return slots[sequence - 1] || `Lesson ${sequence}`;
  }

  /**
   * Get header template for PDF
   */
  private getHeaderTemplate(date: Date | string): string {
    const formattedDate = this.formatDate(date);
    return `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
        Substitute Day Plan - ${formattedDate}
      </div>
    `;
  }

  /**
   * Get footer template for PDF
   */
  private getFooterTemplate(): string {
    return `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `;
  }

  /**
   * Get HTML template for substitute plan
   */
  private getHtmlTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Substitute Day Plan - {{formattedDate}}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    
    .header-info div {
      background: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 5px;
    }
    
    .emergency-box {
      background: #fee;
      border: 2px solid #f44336;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .emergency-box h2 {
      color: #d32f2f;
      margin-bottom: 15px;
      font-size: 24px;
    }
    
    .emergency-contacts {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .contact-card {
      background: white;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ffcdd2;
    }
    
    .section {
      background: #f5f5f5;
      border-radius: 10px;
      padding: 25px;
      margin-bottom: 25px;
    }
    
    .section h2 {
      color: #5e35b1;
      margin-bottom: 20px;
      font-size: 24px;
      border-bottom: 2px solid #5e35b1;
      padding-bottom: 10px;
    }
    
    .section h3 {
      color: #7e57c2;
      margin-top: 15px;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .schedule-table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .schedule-table th {
      background: #7e57c2;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    
    .schedule-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .schedule-table tr:last-child td {
      border-bottom: none;
    }
    
    .schedule-table tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    .routine-category {
      margin-bottom: 20px;
    }
    
    .routine-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      border-left: 4px solid #7e57c2;
    }
    
    .routine-item h4 {
      color: #5e35b1;
      margin-bottom: 8px;
    }
    
    .lesson-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .lesson-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .lesson-time {
      background: #7e57c2;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-weight: bold;
    }
    
    .student-note {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    
    .student-note h4 {
      color: #e65100;
      margin-bottom: 8px;
    }
    
    .daybook-note {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    
    .daybook-note h4 {
      color: #2e7d32;
      margin-bottom: 8px;
    }
    
    .materials-list {
      background: white;
      padding: 15px;
      border-radius: 8px;
    }
    
    .materials-list ul {
      list-style-type: none;
      padding-left: 0;
    }
    
    .materials-list li {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .materials-list li:before {
      content: "✓ ";
      color: #4caf50;
      font-weight: bold;
      margin-right: 8px;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    @media print {
      .page-break {
        page-break-after: always;
      }
      
      .section {
        break-inside: avoid;
      }
      
      .lesson-card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <h1>Substitute Day Plan</h1>
      <div class="header-info">
        <div>
          <strong>Date:</strong> {{formattedDate}}
        </div>
        <div>
          <strong>Teacher:</strong> {{teacher.name}}
        </div>
        <div>
          <strong>Grade:</strong> {{teacher.grade}}
        </div>
        <div>
          <strong>Program:</strong> {{teacher.program}}
        </div>
      </div>
    </div>
    
    <!-- Emergency Information -->
    <div class="emergency-box">
      <h2>🚨 Emergency Information</h2>
      <div class="emergency-contacts">
        <div class="contact-card">
          <strong>Main Office:</strong><br>
          {{schoolInfo.phone}}
        </div>
        <div class="contact-card">
          <strong>School Address:</strong><br>
          {{schoolInfo.address}}
        </div>
        {{#if emergencyInfo.contacts}}
          {{#each emergencyInfo.contacts}}
          <div class="contact-card">
            <strong>{{this.name}}:</strong><br>
            {{this.phone}}
          </div>
          {{/each}}
        {{/if}}
      </div>
      {{#if emergencyInfo.evacuationProcedure}}
      <div style="margin-top: 15px;">
        <strong>Evacuation Procedure:</strong>
        <p>{{emergencyInfo.evacuationProcedure}}</p>
      </div>
      {{/if}}
      {{#if emergencyInfo.lockdownProcedure}}
      <div style="margin-top: 15px;">
        <strong>Lockdown Procedure:</strong>
        <p>{{emergencyInfo.lockdownProcedure}}</p>
      </div>
      {{/if}}
    </div>
    
    <!-- Daily Schedule -->
    <div class="section">
      <h2>📅 Daily Schedule</h2>
      <table class="schedule-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Activity</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {{#each schedule}}
          <tr>
            <td><strong>{{this.time}}</strong></td>
            <td>{{this.activity}}</td>
            <td>{{this.notes}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
    
    <!-- Class Routines -->
    <div class="section">
      <h2>📋 Class Routines</h2>
      
      {{#if routinesByCategory.morning}}
      <div class="routine-category">
        <h3>Morning Routines</h3>
        {{#each routinesByCategory.morning}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{this.description}}</p>
          {{#if this.timeOfDay}}
          <small><em>Time: {{this.timeOfDay}}</em></small>
          {{/if}}
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if routinesByCategory.transition}}
      <div class="routine-category">
        <h3>Transition Procedures</h3>
        {{#each routinesByCategory.transition}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{this.description}}</p>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if routinesByCategory.behavior}}
      <div class="routine-category">
        <h3>Behavior Management</h3>
        {{#each routinesByCategory.behavior}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{this.description}}</p>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if routinesByCategory.dismissal}}
      <div class="routine-category">
        <h3>Dismissal Procedures</h3>
        {{#each routinesByCategory.dismissal}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{this.description}}</p>
        </div>
        {{/each}}
      </div>
      {{/if}}
    </div>
    
    <div class="page-break"></div>
    
    <!-- Lesson Plans -->
    <div class="section">
      <h2>📚 Today's Lessons</h2>
      
      {{#each formattedLessonPlans}}
      <div class="lesson-card">
        <div class="lesson-header">
          <h3>{{this.title}}</h3>
          <span class="lesson-time">{{this.timeSlot}}</span>
        </div>
        
        {{#if this.subject}}
        <p><strong>Subject:</strong> {{this.subject}}</p>
        {{/if}}
        
        {{#if this.hasObjectives}}
        <div style="margin-top: 15px;">
          <strong>Learning Goals:</strong>
          <p>{{this.learningGoals}}</p>
          {{#if this.curriculumConnections}}
          <p><em>Curriculum: {{this.curriculumConnections}}</em></p>
          {{/if}}
        </div>
        {{/if}}
        
        {{#if this.mindsOnActivities}}
        <div style="margin-top: 15px;">
          <strong>Opening Activity (10 min):</strong>
          <p>{{this.mindsOnActivities}}</p>
        </div>
        {{/if}}
        
        {{#if this.actionActivities}}
        <div style="margin-top: 15px;">
          <strong>Main Activity:</strong>
          <p>{{this.actionActivities}}</p>
        </div>
        {{/if}}
        
        {{#if this.consolidationActivities}}
        <div style="margin-top: 15px;">
          <strong>Closing/Assessment:</strong>
          <p>{{this.consolidationActivities}}</p>
        </div>
        {{/if}}
        
        {{#if this.materials}}
        <div style="margin-top: 15px;">
          <strong>Materials Needed:</strong>
          <div class="materials-list">
            <ul>
              {{#each this.materials}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
        </div>
        {{/if}}
        
        {{#if this.differentiation}}
        <div style="margin-top: 15px;">
          <strong>Differentiation:</strong>
          <p>{{this.differentiation}}</p>
        </div>
        {{/if}}
      </div>
      {{/each}}
    </div>
    
    <!-- Important Student Information -->
    {{#if importantStudents}}
    <div class="section">
      <h2>👥 Important Student Information</h2>
      
      {{#each importantStudents}}
      <div class="student-note">
        <h4>{{this.firstName}} {{this.lastName}}</h4>
        {{#if this.medicalNotes}}
        <p><strong>Medical:</strong> {{this.medicalNotes}}</p>
        {{/if}}
        {{#if this.accommodations}}
        <p><strong>Accommodations:</strong> {{this.accommodations}}</p>
        {{/if}}
        {{#if this.parentNotes}}
        <p><strong>Parent Notes:</strong> {{this.parentNotes}}</p>
        {{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    <!-- Recent Teaching Notes -->
    {{#if recentNotes}}
    <div class="section">
      <h2>📝 Recent Teaching Notes</h2>
      <p><em>Context from recent lessons to help guide your teaching:</em></p>
      
      {{#each recentNotes}}
      <div class="daybook-note">
        <h4>{{this.date}} - {{this.subject}}</h4>
        {{#if this.whatWorked}}
        <p><strong>What Worked:</strong> {{this.whatWorked}}</p>
        {{/if}}
        {{#if this.challenges}}
        <p><strong>Challenges:</strong> {{this.challenges}}</p>
        {{/if}}
        {{#if this.achievements}}
        <p><strong>Notable Achievements:</strong> {{this.achievements}}</p>
        {{/if}}
        {{#if this.nextSteps}}
        <p><strong>Next Steps:</strong> {{this.nextSteps}}</p>
        {{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    <!-- Additional Notes -->
    {{#if plan.generalNotes}}
    <div class="section">
      <h2>📌 Additional Notes</h2>
      <p>{{plan.generalNotes}}</p>
    </div>
    {{/if}}
  </div>
</body>
</html>`;
  }
}