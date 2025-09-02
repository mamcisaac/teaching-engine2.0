/**
 * Substitute Plan PDF Service
 * Generates PDF documents for substitute teachers with all necessary information
 */

import { PrismaClient, Prisma } from '@teaching-engine/database';
import * as puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import * as Handlebars from 'handlebars';
import { logger } from '../logger';
import { prisma } from '../utils/prisma';

// Register Handlebars helpers
Handlebars.registerHelper('formatDate', (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

Handlebars.registerHelper('formatTime', (time: string) => {
  return time;
});

Handlebars.registerHelper('json', (context: any) => {
  // Escape HTML entities in JSON output to prevent XSS
  const json = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(
    json.replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
  );
});

// Shared browser instance for better performance
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

export class SubstitutePlanPdfService {
  private prisma: PrismaClient;
  private template: HandlebarsTemplateDelegate;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || prisma;
    this.template = this.compileTemplate();
  }

  /**
   * Get or create a shared browser instance
   */
  private async getBrowser(): Promise<Browser> {
    // If browser is already launching, wait for it
    if (browserLaunchPromise) {
      return browserLaunchPromise;
    }

    // If browser exists and is connected, return it
    if (browserInstance && browserInstance.isConnected()) {
      return browserInstance;
    }

    // Launch new browser
    browserLaunchPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      browserInstance = await browserLaunchPromise;
      return browserInstance;
    } finally {
      browserLaunchPromise = null;
    }
  }

  /**
   * Close the shared browser instance
   */
  static async closeBrowser(): Promise<void> {
    if (browserInstance) {
      try {
        await browserInstance.close();
      } catch (error) {
        logger.warn('Error closing browser:', error instanceof Error ? error.message : String(error));
      }
      browserInstance = null;
    }
  }

  async generatePdf(planId: string, userId: number): Promise<Buffer> {
    try {
      // Fetch plan with validation
      const plan = await this.prisma.substitutePlan.findFirst({
        where: { 
          id: planId, 
          userId,
          isActive: true
        }
      });

      if (!plan) {
        throw new Error('Substitute plan not found or access denied');
      }

      // Fetch all related data in parallel
      const [teacher, routines, students, recentNotes] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { 
            name: true, 
            email: true,
            grade: true, 
            program: true 
          }
        }),
        this.prisma.classRoutine.findMany({
          where: { userId, isActive: true },
          orderBy: { priority: 'desc' }
        }),
        this.prisma.student.findMany({
          where: { 
            userId,
            isActive: true,
            OR: [
              { notes: { not: null } },
              { accommodations: { not: Prisma.JsonNull } },
              { specialNeeds: { not: null } }
            ]
          },
          select: {
            firstName: true,
            lastName: true,
            notes: true,
            accommodations: true,
            specialNeeds: true
          },
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        }),
        this.prisma.daybookEntry.findMany({
          where: {
            userId,
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          orderBy: { date: 'desc' },
          take: 5,
          select: {
            date: true,
            whatWorked: true,
            whatDidntWork: true,
            nextSteps: true
          }
        })
      ]);

      // Parse JSON fields if they exist
      const schedule = this.parseJson(plan.schedule);
      const emergencyInfo = this.parseJson(plan.emergencyInfo);

      // Group routines by category
      const groupedRoutines = this.groupRoutinesByCategory(routines);

      // Generate HTML from template
      const html = this.template({
        plan,
        teacher,
        schedule,
        emergencyInfo,
        routines: groupedRoutines,
        students,
        recentNotes,
        generatedAt: new Date()
      });

      // Convert HTML to PDF using Puppeteer
      const pdfBuffer = await this.htmlToPdf(html);

      // Log the PDF generation
      await this.logPdfGeneration(planId, userId, pdfBuffer.length);

      return pdfBuffer;
    } catch (error) {
      logger.error('Error generating substitute plan PDF:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async generateHtmlPreview(planId: string, userId: number): Promise<string> {
    try {
      // Fetch plan with validation
      const plan = await this.prisma.substitutePlan.findFirst({
        where: { 
          id: planId, 
          userId,
          isActive: true
        }
      });

      if (!plan) {
        throw new Error('Substitute plan not found or access denied');
      }

      // Fetch all related data in parallel
      const [teacher, routines, students, recentNotes] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { 
            name: true, 
            email: true,
            grade: true, 
            program: true 
          }
        }),
        this.prisma.classRoutine.findMany({
          where: { userId, isActive: true },
          orderBy: { priority: 'desc' }
        }),
        this.prisma.student.findMany({
          where: { 
            userId,
            isActive: true,
            OR: [
              { notes: { not: null } },
              { accommodations: { not: Prisma.JsonNull } },
              { specialNeeds: { not: null } }
            ]
          },
          select: {
            firstName: true,
            lastName: true,
            notes: true,
            accommodations: true,
            specialNeeds: true
          },
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        }),
        this.prisma.daybookEntry.findMany({
          where: {
            userId,
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          orderBy: { date: 'desc' },
          take: 5,
          select: {
            date: true,
            whatWorked: true,
            whatDidntWork: true,
            nextSteps: true
          }
        })
      ]);

      // Parse JSON fields if they exist
      const schedule = this.parseJson(plan.schedule);
      const emergencyInfo = this.parseJson(plan.emergencyInfo);

      // Group routines by category
      const groupedRoutines = this.groupRoutinesByCategory(routines);

      // Generate HTML from template
      const html = this.template({
        plan,
        teacher,
        schedule,
        emergencyInfo,
        routines: groupedRoutines,
        students,
        recentNotes,
        generatedAt: new Date()
      });

      return html;
    } catch (error) {
      logger.error('Error generating HTML preview:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private parseJson(data: any): any {
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }

  private groupRoutinesByCategory(routines: any[]): any {
    const grouped: any = {
      morning: [],
      transition: [],
      behavior: [],
      dismissal: [],
      other: []
    };

    routines.forEach(routine => {
      const category = routine.category || 'other';
      if (grouped[category]) {
        grouped[category].push(routine);
      } else {
        grouped.other.push(routine);
      }
    });

    return grouped;
  }

  private async logPdfGeneration(planId: string, userId: number, size: number): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'SUBSTITUTE_PLAN_PDF_GENERATED',
          userId,
          resourceType: 'SubstitutePlan',
          resourceId: planId,
          metadata: JSON.stringify({
            size,
            timestamp: new Date().toISOString()
          })
        }
      });
    } catch (error) {
      // Just log, don't fail PDF generation if audit fails
      logger.warn('Failed to log PDF generation:', error instanceof Error ? error.message : String(error));
    }
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    let page = null;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      
      // Set a reasonable timeout
      page.setDefaultTimeout(30000);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'letter',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      logger.error('Error generating PDF:', error instanceof Error ? error.message : String(error));
      throw new Error('PDF generation failed');
    } finally {
      // Close the page, but keep the browser instance alive
      if (page) {
        try {
          await page.close();
        } catch (error) {
          logger.warn('Error closing page:', error instanceof Error ? error.message : String(error));
        }
      }
    }
  }

  private compileTemplate(): HandlebarsTemplateDelegate {
    return Handlebars.compile(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
    }
    h3 {
      color: #7f8c8d;
      margin-top: 20px;
    }
    .header-info {
      background: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .header-info p {
      margin: 5px 0;
    }
    .emergency-section {
      background: #ffe5e5;
      border: 2px solid #ff6b6b;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .emergency-section h2 {
      color: #c0392b;
      margin-top: 0;
      border: none;
    }
    .schedule-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .schedule-table th,
    .schedule-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .schedule-table th {
      background: #3498db;
      color: white;
    }
    .schedule-table tr:nth-child(even) {
      background: #f2f2f2;
    }
    .routine-category {
      background: #f8f9fa;
      padding: 10px;
      margin: 10px 0;
      border-left: 4px solid #3498db;
    }
    .routine-item {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border-radius: 3px;
    }
    .student-card {
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      margin: 10px 0;
    }
    .student-name {
      font-weight: bold;
      color: #2c3e50;
    }
    .student-note {
      margin: 5px 0;
      padding-left: 20px;
    }
    .daybook-entry {
      background: #f0f8ff;
      border-left: 3px solid #4a90e2;
      padding: 10px;
      margin: 10px 0;
    }
    .daybook-date {
      font-weight: bold;
      color: #34495e;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #7f8c8d;
      font-size: 0.9em;
    }
    @media print {
      body {
        padding: 0;
      }
      .emergency-section {
        break-inside: avoid;
      }
      .student-card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>Substitute Day Plan</h1>
  
  <div class="header-info">
    <p><strong>Date:</strong> {{formatDate plan.dateFor}}</p>
    <p><strong>Teacher:</strong> {{teacher.name}}</p>
    <p><strong>Grade:</strong> {{teacher.grade}}</p>
    <p><strong>Program:</strong> {{teacher.program}}</p>
  </div>

  <div class="emergency-section">
    <h2>Emergency Information</h2>
    <p><strong>Main Office:</strong> (902) 555-0100</p>
    <p><strong>School Nurse:</strong> Extension 205</p>
    {{#if emergencyInfo}}
      {{#if emergencyInfo.evacuationProcedure}}
      <p><strong>Evacuation Procedure:</strong> {{emergencyInfo.evacuationProcedure}}</p>
      {{/if}}
      {{#if emergencyInfo.lockdownProcedure}}
      <p><strong>Lockdown Procedure:</strong> {{emergencyInfo.lockdownProcedure}}</p>
      {{/if}}
    {{/if}}
  </div>

  {{#if schedule}}
  <h2>Daily Schedule</h2>
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
        <td>{{this.time}}</td>
        <td>{{this.activity}}</td>
        <td>{{this.notes}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{/if}}

  <h2>Class Routines</h2>
  
  {{#if routines.morning.length}}
  <div class="routine-category">
    <h3>Morning Routines</h3>
    {{#each routines.morning}}
    <div class="routine-item">
      <strong>{{this.title}}</strong>
      {{#if this.timeOfDay}}<em> ({{this.timeOfDay}})</em>{{/if}}
      <p>{{this.description}}</p>
    </div>
    {{/each}}
  </div>
  {{/if}}

  {{#if routines.transition.length}}
  <div class="routine-category">
    <h3>Transition Procedures</h3>
    {{#each routines.transition}}
    <div class="routine-item">
      <strong>{{this.title}}</strong>
      <p>{{this.description}}</p>
    </div>
    {{/each}}
  </div>
  {{/if}}

  {{#if routines.behavior.length}}
  <div class="routine-category">
    <h3>Behavior Management</h3>
    {{#each routines.behavior}}
    <div class="routine-item">
      <strong>{{this.title}}</strong>
      <p>{{this.description}}</p>
    </div>
    {{/each}}
  </div>
  {{/if}}

  {{#if routines.dismissal.length}}
  <div class="routine-category">
    <h3>Dismissal Procedures</h3>
    {{#each routines.dismissal}}
    <div class="routine-item">
      <strong>{{this.title}}</strong>
      {{#if this.timeOfDay}}<em> ({{this.timeOfDay}})</em>{{/if}}
      <p>{{this.description}}</p>
    </div>
    {{/each}}
  </div>
  {{/if}}

  {{#if students.length}}
  <h2>Important Student Information</h2>
  {{#each students}}
  <div class="student-card">
    <div class="student-name">{{this.firstName}} {{this.lastName}}</div>
    {{#if this.notes}}
    <div class="student-note"><strong>Notes:</strong> {{this.notes}}</div>
    {{/if}}
    {{#if this.specialNeeds}}
    <div class="student-note"><strong>Special Needs:</strong> {{this.specialNeeds}}</div>
    {{/if}}
    {{#if this.accommodations}}
    <div class="student-note"><strong>Accommodations:</strong> {{json this.accommodations}}</div>
    {{/if}}
  </div>
  {{/each}}
  {{/if}}

  {{#if recentNotes.length}}
  <h2>Recent Teaching Context</h2>
  {{#each recentNotes}}
  <div class="daybook-entry">
    <div class="daybook-date">{{formatDate this.date}}</div>
    {{#if this.whatWorked}}
    <p><strong>What Worked:</strong> {{this.whatWorked}}</p>
    {{/if}}
    {{#if this.whatDidntWork}}
    <p><strong>Challenges:</strong> {{this.whatDidntWork}}</p>
    {{/if}}
    {{#if this.nextSteps}}
    <p><strong>Next Steps:</strong> {{this.nextSteps}}</p>
    {{/if}}
  </div>
  {{/each}}
  {{/if}}

  {{#if plan.generalNotes}}
  <h2>Additional Notes</h2>
  <p>{{plan.generalNotes}}</p>
  {{/if}}

  <div class="footer">
    <p>Generated on {{formatDate generatedAt}}</p>
  </div>
</body>
</html>`);
  }
}

// Export for route handler
export function createSubstitutePlanPdfService(prismaClient?: PrismaClient): SubstitutePlanPdfService {
  return new SubstitutePlanPdfService(prismaClient);
}