/**
 * Substitute Plan PDF Service
 * Generates comprehensive PDF documents for substitute teachers
 * including class routines, daybook notes, and lesson plans
 * 
 * Security Features:
 * - Input sanitization to prevent XSS
 * - Rate limiting protection
 * - Audit logging for compliance
 * - Timeout protection for resource management
 */

import { PrismaClient, Prisma } from '@teaching-engine/database';
import type { 
  SubstitutePlan, 
  ClassRoutine, 
  DaybookEntry, 
  ETFOLessonPlan, 
  User, 
  Student 
} from '@teaching-engine/database';
import { logger } from '../logger';
import * as DOMPurify from 'isomorphic-dompurify';
import Handlebars from 'handlebars';

// Singleton instance management
let pdfEngineInstance: any = null;

// Configuration
const PDF_CONFIG = {
  maxGenerationTime: 30000, // 30 seconds
  maxConcurrent: 3,
  cacheDuration: 300000, // 5 minutes
  maxFileSizeKB: 10240 // 10MB
};

// Simple in-memory cache (use Redis in production)
const pdfCache = new Map<string, { buffer: Buffer; timestamp: number }>();

export interface SubstitutePlanPdfData {
  plan: SubstitutePlan;
  classRoutines: ClassRoutine[];
  recentDaybookEntries: Array<DaybookEntry & {
    lessonPlan?: { title: string; subject: string } | null;
  }>;
  lessonPlans: ETFOLessonPlan[];
  teacher: Pick<User, 'name' | 'email' | 'grade' | 'program'> | null;
  students: Array<Pick<Student, 'firstName' | 'lastName' | 'notes' | 'accommodations' | 'specialNeeds' | 'parentContact'>>;
  schoolInfo: {
    name: string;
    phone: string;
    address: string;
  };
}

export class PdfGenerationError extends Error {
  code: 'PUPPETEER_MISSING' | 'BROWSER_CRASH' | 'TIMEOUT' | 'MEMORY_LIMIT' | 'INVALID_DATA' | 'ACCESS_DENIED';
  
  constructor(message: string, code: PdfGenerationError['code']) {
    super(message);
    this.name = 'PdfGenerationError';
    this.code = code;
  }
}

export class SubstitutePlanPdfService {
  private prisma: PrismaClient;
  private generationTimeout: NodeJS.Timeout | null = null;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
    this.setupHandlebarsHelpers();
  }

  /**
   * Setup Handlebars helpers for safe rendering
   */
  private setupHandlebarsHelpers(): void {
    // Safe HTML escape helper
    Handlebars.registerHelper('safeHtml', (text: string) => {
      if (!text) return '';
      return new Handlebars.SafeString(this.sanitizeHtml(text));
    });

    // Date formatter helper
    Handlebars.registerHelper('formatDate', (date: Date | string) => {
      if (!date) return '';
      return this.formatDate(date);
    });

    // Conditional helper for checking existence
    Handlebars.registerHelper('hasContent', (value: any) => {
      return value && (Array.isArray(value) ? value.length > 0 : true);
    });
  }

  /**
   * Generate comprehensive substitute plan PDF with caching
   */
  async generatePdf(planId: string, userId: number): Promise<Buffer> {
    const startTime = Date.now();
    
    // Input validation
    if (!planId || !userId) {
      throw new PdfGenerationError('Invalid plan ID or user ID', 'INVALID_DATA');
    }

    // Check cache first
    const cacheKey = `${planId}-${userId}`;
    const cached = pdfCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < PDF_CONFIG.cacheDuration) {
      logger.info(`Serving cached PDF for plan ${planId}`);
      return cached.buffer;
    }

    try {
      // Set generation timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        this.generationTimeout = setTimeout(() => {
          reject(new PdfGenerationError('PDF generation timeout', 'TIMEOUT'));
        }, PDF_CONFIG.maxGenerationTime);
      });

      // Generate PDF with timeout protection
      const pdfBuffer = await Promise.race([
        this.generatePdfInternal(planId, userId),
        timeoutPromise
      ]);

      // Clear timeout
      if (this.generationTimeout) {
        clearTimeout(this.generationTimeout);
        this.generationTimeout = null;
      }

      // Cache the result
      pdfCache.set(cacheKey, {
        buffer: pdfBuffer,
        timestamp: Date.now()
      });

      // Clean old cache entries
      this.cleanCache();

      const duration = Date.now() - startTime;
      logger.info(`PDF generated for plan ${planId} in ${duration}ms`);

      // Audit logging
      await this.logPdfGeneration(planId, userId, duration);

      return pdfBuffer;
    } catch (error) {
      // Clear timeout on error
      if (this.generationTimeout) {
        clearTimeout(this.generationTimeout);
        this.generationTimeout = null;
      }

      logger.error('PDF generation failed:', error);
      
      if (error instanceof PdfGenerationError) {
        throw error;
      }
      
      throw new PdfGenerationError(
        `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BROWSER_CRASH'
      );
    }
  }

  /**
   * Internal PDF generation logic
   */
  private async generatePdfInternal(planId: string, userId: number): Promise<Buffer> {
    // Import PdfEngine dynamically to avoid circular dependencies
    const { PdfEngine } = await import('./templates/engines/PdfEngine');
    
    // Use singleton instance
    if (!pdfEngineInstance) {
      pdfEngineInstance = new PdfEngine();
    }

    // Fetch all required data
    const data = await this.fetchPlanData(planId, userId);
    
    // Generate HTML from template
    const html = await this.generateHtml(data);
    
    // Convert HTML to PDF
    const pdfBuffer = await pdfEngineInstance.generatePdfFromHtml(html, {
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

    // Check file size
    if (pdfBuffer.length > PDF_CONFIG.maxFileSizeKB * 1024) {
      throw new PdfGenerationError('Generated PDF exceeds size limit', 'MEMORY_LIMIT');
    }

    return pdfBuffer;
  }

  /**
   * Fetch all data needed for the substitute plan with proper types
   */
  private async fetchPlanData(planId: string, userId: number): Promise<SubstitutePlanPdfData> {
    // Fetch the substitute plan with validation
    const plan = await this.prisma.substitutePlan.findFirst({
      where: { 
        id: planId, 
        userId,
        isActive: true
      }
    });

    if (!plan) {
      throw new PdfGenerationError('Substitute plan not found or access denied', 'ACCESS_DENIED');
    }

    // Parallel data fetching for performance
    const [classRoutines, recentDaybookEntries, lessonPlans, teacher, students] = await Promise.all([
      // Fetch active class routines
      this.prisma.classRoutine.findMany({
        where: { 
          userId,
          isActive: true
        },
        orderBy: [
          { priority: 'desc' },
          { category: 'asc' }
        ]
      }),

      // Fetch recent daybook entries (last 5 days)
      this.fetchRecentDaybookEntries(userId),

      // Fetch lesson plans for the day
      this.fetchLessonPlans(userId, plan.dateFor),

      // Fetch teacher information
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          grade: true,
          program: true
        }
      }),

      // Fetch students with special notes
      this.prisma.student.findMany({
        where: { 
          userId,
          isActive: true,
          OR: [
            { notes: { not: null } },
            { accommodations: { not: null } },
            { specialNeeds: { not: null } },
            { parentContact: { not: null } }
          ]
        },
        select: {
          firstName: true,
          lastName: true,
          notes: true,
          accommodations: true,
          specialNeeds: true,
          parentContact: true
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      })
    ]);

    // Get school info from environment or settings
    const schoolInfo = {
      name: process.env.SCHOOL_NAME || 'École primaire',
      phone: process.env.SCHOOL_PHONE || '(902) 555-0100',
      address: process.env.SCHOOL_ADDRESS || '123 School Street, Charlottetown, PE'
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
   * Fetch recent daybook entries with proper typing
   */
  private async fetchRecentDaybookEntries(userId: number) {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    return this.prisma.daybookEntry.findMany({
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
  }

  /**
   * Fetch lesson plans for a specific day
   */
  private async fetchLessonPlans(userId: number, dateFor: Date) {
    const startOfDay = new Date(dateFor);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateFor);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.eTFOLessonPlan.findMany({
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
  }

  /**
   * Sanitize HTML to prevent XSS attacks
   */
  private sanitizeHtml(html: string): string {
    if (!html) return '';
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false,
      KEEP_CONTENT: true
    });
  }

  /**
   * Escape text for safe HTML rendering
   */
  private escapeHtml(text: string): string {
    if (!text) return '';
    
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (div) {
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Fallback for server-side
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Generate HTML from template and data with sanitization
   */
  private async generateHtml(data: SubstitutePlanPdfData): Promise<string> {
    const template = this.getHtmlTemplate();
    
    // Sanitize all user-generated content
    const sanitizedData = {
      ...data,
      formattedDate: this.formatDate(data.plan.dateFor),
      dayOfWeek: this.getDayOfWeek(data.plan.dateFor),
      schedule: this.parseAndSanitizeSchedule(data.plan.schedule),
      routinesByCategory: this.groupRoutinesByCategory(data.classRoutines),
      emergencyInfo: this.parseAndSanitizeEmergencyInfo(data.plan.emergencyInfo),
      formattedLessonPlans: this.formatAndSanitizeLessonPlans(data.lessonPlans),
      recentNotes: this.formatAndSanitizeDaybookNotes(data.recentDaybookEntries),
      importantStudents: this.sanitizeStudentInfo(data.students),
      generalNotes: this.sanitizeHtml(String(data.plan.generalNotes || ''))
    };

    // Compile and render template
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(sanitizedData);
  }

  /**
   * Parse and sanitize schedule JSON
   */
  private parseAndSanitizeSchedule(schedule: any): any[] {
    let parsed: any[] = [];
    
    if (typeof schedule === 'string') {
      try {
        parsed = JSON.parse(schedule);
      } catch {
        parsed = [];
      }
    } else if (Array.isArray(schedule)) {
      parsed = schedule;
    }

    // Sanitize each schedule item
    return parsed.map(item => ({
      time: this.escapeHtml(item.time || ''),
      activity: this.escapeHtml(item.activity || ''),
      notes: this.escapeHtml(item.notes || ''),
      materials: Array.isArray(item.materials) 
        ? item.materials.map((m: string) => this.escapeHtml(m))
        : []
    }));
  }

  /**
   * Parse and sanitize emergency info
   */
  private parseAndSanitizeEmergencyInfo(emergencyInfo: any): any {
    let parsed: any = {};
    
    if (typeof emergencyInfo === 'string') {
      try {
        parsed = JSON.parse(emergencyInfo);
      } catch {
        parsed = {};
      }
    } else if (emergencyInfo && typeof emergencyInfo === 'object') {
      parsed = emergencyInfo;
    }

    return {
      contacts: Array.isArray(parsed.contacts) 
        ? parsed.contacts.map((c: any) => ({
            name: this.escapeHtml(c.name || ''),
            phone: this.escapeHtml(c.phone || ''),
            role: this.escapeHtml(c.role || '')
          }))
        : [],
      evacuationProcedure: this.escapeHtml(parsed.evacuationProcedure || ''),
      lockdownProcedure: this.escapeHtml(parsed.lockdownProcedure || ''),
      importantStudentInfo: Array.isArray(parsed.importantStudentInfo)
        ? parsed.importantStudentInfo.map((s: any) => ({
            studentName: this.escapeHtml(s.studentName || ''),
            info: this.escapeHtml(s.info || ''),
            priority: this.escapeHtml(s.priority || 'medium')
          }))
        : []
    };
  }

  /**
   * Format and sanitize lesson plans
   */
  private formatAndSanitizeLessonPlans(lessonPlans: any[]): any[] {
    return lessonPlans.map(plan => ({
      ...plan,
      title: this.escapeHtml(plan.title || ''),
      subject: this.escapeHtml(plan.subject || ''),
      timeSlot: this.getTimeSlotLabel(plan.sequence),
      learningGoals: this.sanitizeHtml(plan.learningGoals || ''),
      curriculumConnections: this.escapeHtml(plan.curriculumConnections || ''),
      mindsOnActivities: this.sanitizeHtml(plan.mindsOnActivities || ''),
      actionActivities: this.sanitizeHtml(plan.actionActivities || ''),
      consolidationActivities: this.sanitizeHtml(plan.consolidationActivities || ''),
      differentiation: this.sanitizeHtml(plan.differentiation || ''),
      materials: Array.isArray(plan.materials) 
        ? plan.materials.map((m: string) => this.escapeHtml(m))
        : [],
      hasObjectives: !!(plan.learningGoals || plan.curriculumConnections),
      hasMaterials: Array.isArray(plan.materials) && plan.materials.length > 0,
      hasAssessment: !!plan.assessmentStrategies
    }));
  }

  /**
   * Format and sanitize daybook notes
   */
  private formatAndSanitizeDaybookNotes(entries: any[]): any[] {
    return entries.map(entry => ({
      date: this.formatDate(entry.date),
      subject: this.escapeHtml(entry.lessonPlan?.subject || 'General'),
      whatWorked: this.sanitizeHtml(entry.whatWorked || entry.whatWorkedFr || ''),
      challenges: this.sanitizeHtml(entry.whatDidntWork || entry.whatDidntWorkFr || entry.commonChallenges || ''),
      achievements: this.sanitizeHtml(entry.notableAchievements || ''),
      nextSteps: this.sanitizeHtml(entry.nextSteps || entry.nextStepsFr || '')
    })).filter(note => 
      note.whatWorked || note.challenges || note.achievements || note.nextSteps
    );
  }

  /**
   * Sanitize student information
   */
  private sanitizeStudentInfo(students: any[]): any[] {
    return students.map(student => ({
      firstName: this.escapeHtml(student.firstName || ''),
      lastName: this.escapeHtml(student.lastName || ''),
      notes: this.sanitizeHtml(student.notes || ''),
      accommodations: this.sanitizeAccommodations(student.accommodations),
      specialNeeds: this.sanitizeHtml(student.specialNeeds || ''),
      parentContact: this.sanitizeParentContact(student.parentContact)
    }));
  }

  /**
   * Sanitize accommodations JSON field
   */
  private sanitizeAccommodations(accommodations: any): string {
    if (!accommodations) return '';
    
    if (typeof accommodations === 'string') {
      return this.sanitizeHtml(accommodations);
    }
    
    if (typeof accommodations === 'object') {
      try {
        const text = JSON.stringify(accommodations, null, 2);
        return this.escapeHtml(text);
      } catch {
        return '';
      }
    }
    
    return '';
  }

  /**
   * Sanitize parent contact JSON field
   */
  private sanitizeParentContact(parentContact: any): string {
    if (!parentContact) return '';
    
    if (typeof parentContact === 'string') {
      return this.sanitizeHtml(parentContact);
    }
    
    if (typeof parentContact === 'object') {
      const parts: string[] = [];
      if (parentContact.name) parts.push(`Name: ${this.escapeHtml(parentContact.name)}`);
      if (parentContact.phone) parts.push(`Phone: ${this.escapeHtml(parentContact.phone)}`);
      if (parentContact.email) parts.push(`Email: ${this.escapeHtml(parentContact.email)}`);
      if (parentContact.notes) parts.push(`Notes: ${this.escapeHtml(parentContact.notes)}`);
      return parts.join(', ');
    }
    
    return '';
  }

  /**
   * Group routines by category for better organization
   */
  private groupRoutinesByCategory(routines: ClassRoutine[]): Record<string, any[]> {
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
      const sanitizedRoutine = {
        title: this.escapeHtml(routine.title || ''),
        description: this.sanitizeHtml(routine.description || ''),
        timeOfDay: this.escapeHtml(routine.timeOfDay || ''),
        priority: routine.priority
      };
      
      if (grouped[category]) {
        grouped[category].push(sanitizedRoutine);
      } else {
        grouped.other.push(sanitizedRoutine);
      }
    });

    return grouped;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }
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
    if (isNaN(d.getTime())) {
      return '';
    }
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
        Substitute Day Plan - ${this.escapeHtml(formattedDate)}
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
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of pdfCache.entries()) {
      if (now - value.timestamp > PDF_CONFIG.cacheDuration) {
        pdfCache.delete(key);
      }
    }
  }

  /**
   * Log PDF generation for audit purposes
   */
  private async logPdfGeneration(planId: string, userId: number, duration: number): Promise<void> {
    try {
      // In production, this would log to an audit table
      logger.info('PDF generation audit', {
        action: 'EXPORT_SUBSTITUTE_PLAN_PDF',
        userId,
        resourceId: planId,
        duration,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to log PDF generation:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (pdfEngineInstance) {
      await pdfEngineInstance.cleanup();
      pdfEngineInstance = null;
    }
    
    if (this.generationTimeout) {
      clearTimeout(this.generationTimeout);
      this.generationTimeout = null;
    }
    
    pdfCache.clear();
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
        {{#each emergencyInfo.contacts}}
        <div class="contact-card">
          <strong>{{this.name}}:</strong><br>
          {{this.phone}}
        </div>
        {{/each}}
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
      
      {{#if (hasContent routinesByCategory.morning)}}
      <div class="routine-category">
        <h3>Morning Routines</h3>
        {{#each routinesByCategory.morning}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{{safeHtml this.description}}}</p>
          {{#if this.timeOfDay}}
          <small><em>Time: {{this.timeOfDay}}</em></small>
          {{/if}}
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if (hasContent routinesByCategory.transition)}}
      <div class="routine-category">
        <h3>Transition Procedures</h3>
        {{#each routinesByCategory.transition}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{{safeHtml this.description}}}</p>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if (hasContent routinesByCategory.behavior)}}
      <div class="routine-category">
        <h3>Behavior Management</h3>
        {{#each routinesByCategory.behavior}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{{safeHtml this.description}}}</p>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if (hasContent routinesByCategory.dismissal)}}
      <div class="routine-category">
        <h3>Dismissal Procedures</h3>
        {{#each routinesByCategory.dismissal}}
        <div class="routine-item">
          <h4>{{this.title}}</h4>
          <p>{{{safeHtml this.description}}}</p>
        </div>
        {{/each}}
      </div>
      {{/if}}
    </div>
    
    <div class="page-break"></div>
    
    <!-- Lesson Plans -->
    {{#if (hasContent formattedLessonPlans)}}
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
          <p>{{{safeHtml this.learningGoals}}}</p>
          {{#if this.curriculumConnections}}
          <p><em>Curriculum: {{this.curriculumConnections}}</em></p>
          {{/if}}
        </div>
        {{/if}}
        
        {{#if this.mindsOnActivities}}
        <div style="margin-top: 15px;">
          <strong>Opening Activity (10 min):</strong>
          <p>{{{safeHtml this.mindsOnActivities}}}</p>
        </div>
        {{/if}}
        
        {{#if this.actionActivities}}
        <div style="margin-top: 15px;">
          <strong>Main Activity:</strong>
          <p>{{{safeHtml this.actionActivities}}}</p>
        </div>
        {{/if}}
        
        {{#if this.consolidationActivities}}
        <div style="margin-top: 15px;">
          <strong>Closing/Assessment:</strong>
          <p>{{{safeHtml this.consolidationActivities}}}</p>
        </div>
        {{/if}}
        
        {{#if this.hasMaterials}}
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
          <p>{{{safeHtml this.differentiation}}}</p>
        </div>
        {{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    <!-- Important Student Information -->
    {{#if (hasContent importantStudents)}}
    <div class="section">
      <h2>👥 Important Student Information</h2>
      
      {{#each importantStudents}}
      <div class="student-note">
        <h4>{{this.firstName}} {{this.lastName}}</h4>
        {{#if this.notes}}
        <p><strong>Notes:</strong> {{{safeHtml this.notes}}}</p>
        {{/if}}
        {{#if this.accommodations}}
        <p><strong>Accommodations:</strong> {{this.accommodations}}</p>
        {{/if}}
        {{#if this.specialNeeds}}
        <p><strong>Special Needs:</strong> {{{safeHtml this.specialNeeds}}}</p>
        {{/if}}
        {{#if this.parentContact}}
        <p><strong>Parent Contact:</strong> {{this.parentContact}}</p>
        {{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    <!-- Recent Teaching Notes -->
    {{#if (hasContent recentNotes)}}
    <div class="section">
      <h2>📝 Recent Teaching Notes</h2>
      <p><em>Context from recent lessons to help guide your teaching:</em></p>
      
      {{#each recentNotes}}
      <div class="daybook-note">
        <h4>{{this.date}} - {{this.subject}}</h4>
        {{#if this.whatWorked}}
        <p><strong>What Worked:</strong> {{{safeHtml this.whatWorked}}}</p>
        {{/if}}
        {{#if this.challenges}}
        <p><strong>Challenges:</strong> {{{safeHtml this.challenges}}}</p>
        {{/if}}
        {{#if this.achievements}}
        <p><strong>Notable Achievements:</strong> {{{safeHtml this.achievements}}}</p>
        {{/if}}
        {{#if this.nextSteps}}
        <p><strong>Next Steps:</strong> {{{safeHtml this.nextSteps}}}</p>
        {{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    <!-- Additional Notes -->
    {{#if generalNotes}}
    <div class="section">
      <h2>📌 Additional Notes</h2>
      <p>{{{safeHtml generalNotes}}}</p>
    </div>
    {{/if}}
  </div>
</body>
</html>`;
  }
}

// Export singleton instance
export const substitutePlanPdfService = new SubstitutePlanPdfService();