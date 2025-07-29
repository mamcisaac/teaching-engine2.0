/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Real Template Orchestrator Tests
 * Testing actual Handlebars engine integration and template rendering
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { TemplateOrchestrator } from '../TemplateOrchestrator';
import { HandlebarsEngine } from '../engines/HandlebarsEngine';
import { LessonTemplateProvider } from '../providers/LessonTemplateProvider';
import { NewsletterTemplateProvider } from '../providers/NewsletterTemplateProvider';
import { ReportTemplateProvider } from '../providers/ReportTemplateProvider';
import { prisma } from '../../../prisma';
import { logger } from '../../../logger';

// Real template content for testing
const REAL_LESSON_TEMPLATE = `
<div class="lesson-plan">
  <header>
    <h1>{{lesson.title}}</h1>
    <div class="meta">
      <span>Grade: {{lesson.grade}}</span>
      <span>Subject: {{lesson.subject}}</span>
      <span>Duration: {{lesson.duration}} minutes</span>
      <span>Date: {{formatDate lesson.date}}</span>
    </div>
  </header>

  <section class="objectives">
    <h2>Learning Objectives</h2>
    <ul>
      {{#each lesson.objectives}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </section>

  <section class="activities">
    <h2>Activities</h2>
    {{#each lesson.activities}}
    <div class="activity">
      <h3>{{inc @index}}. {{this.name}} ({{this.duration}} min)</h3>
      <p>{{this.description}}</p>
      {{#if this.materials}}
      <h4>Materials:</h4>
      <ul>
        {{#each this.materials}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      {{/if}}
    </div>
    {{/each}}
  </section>

  <section class="assessment">
    <h2>Assessment</h2>
    <p>{{default lesson.assessment "Informal observation and questioning"}}</p>
  </section>
</div>`;

const REAL_NEWSLETTER_TEMPLATE = `
<div class="newsletter">
  <header>
    <h1>{{classroom}} Newsletter</h1>
    <p>{{formatDate dateRange.start}} - {{formatDate dateRange.end}}</p>
  </header>

  {{#each sections}}
  <section class="newsletter-section">
    <h2>{{this.title}}</h2>
    <div class="content">
      {{#each this.items}}
      <div class="newsletter-item">
        <h3>{{this.title}}</h3>
        <p>{{this.content}}</p>
        {{#if this.date}}
        <span class="date">{{formatDate this.date "short"}}</span>
        {{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/each}}

  <footer>
    <p>Thank you for your continued support!</p>
    <p>Contact: {{teacher.email}} | Phone: {{default teacher.phone "School Office"}}</p>
  </footer>
</div>`;

const REAL_REPORT_TEMPLATE = `
<div class="progress-report">
  <header>
    <h1>Progress Report</h1>
    <div class="student-info">
      <h2>{{student.firstName}} {{student.lastName}}</h2>
      <p>Grade: {{student.grade}} | Student ID: {{student.id}}</p>
      <p>Report Period: {{formatDate reportPeriod.start}} - {{formatDate reportPeriod.end}}</p>
    </div>
  </header>

  <section class="subjects">
    {{#each subjects}}
    <div class="subject-report">
      <h3>{{this.name}}</h3>
      <div class="grade-info">
        <span class="grade">Grade: {{this.grade}}</span>
        <span class="percentage">{{formatPercent this.percentage}}</span>
      </div>
      
      <div class="expectations">
        <h4>Curriculum Expectations</h4>
        {{#each this.expectations}}
        <div class="expectation">
          <span class="code">{{this.code}}</span>
          <span class="description">{{this.description}}</span>
          <span class="level">{{this.achievementLevel}}</span>
        </div>
        {{/each}}
      </div>

      {{#if this.comments}}
      <div class="comments">
        <h4>Comments</h4>
        <p>{{this.comments}}</p>
      </div>
      {{/if}}
    </div>
    {{/each}}
  </section>

  <section class="skills">
    <h3>Learning Skills and Work Habits</h3>
    {{#each learningSkills}}
    <div class="skill">
      <span class="skill-name">{{this.name}}</span>
      <span class="skill-level">{{this.level}}</span>
    </div>
    {{/each}}
  </section>

  <footer>
    <div class="signatures">
      <div>Teacher: {{teacher.name}}</div>
      <div>Date: {{formatDate 'now'}}</div>
    </div>
  </footer>
</div>`;

describe('TemplateOrchestrator - Real Implementation Tests', () => {
  let orchestrator: TemplateOrchestrator;
  let handlebarsEngine: HandlebarsEngine;
  let testUserId: number;
  let testUser: any;

  beforeAll(async () => {
    try {
      // Create test user
      testUser = await prisma.user.create({
        data: {
          email: `test-template-${Date.now()}@example.com`,
          name: 'Template Test User',
          role: 'TEACHER',
          hashedPassword: 'test-hash',
        },
      });
      testUserId = testUser.id;
    } catch (error) {
      logger.error('Failed to create test user in TemplateOrchestrator test', error);
      // For unit tests, we don't need real database, so mock the user ID
      testUserId = 999;
      testUser = { id: 999, email: 'test@example.com', name: 'Template Test User' };
    }
  });

  beforeEach(async () => {
    orchestrator = TemplateOrchestrator.getInstance();
    handlebarsEngine = new HandlebarsEngine();

    // Register real engine and providers
    orchestrator.registerEngine('handlebars', handlebarsEngine);
    orchestrator.registerProvider('lesson', new LessonTemplateProvider());
    orchestrator.registerProvider('newsletter', new NewsletterTemplateProvider());
    orchestrator.registerProvider('report', new ReportTemplateProvider());

    // Register real templates
    orchestrator.registerPartial('lesson-standard', REAL_LESSON_TEMPLATE);
    orchestrator.registerPartial('newsletter-weekly-standard', REAL_NEWSLETTER_TEMPLATE);
    orchestrator.registerPartial('report-progress-pdf', REAL_REPORT_TEMPLATE);

    await orchestrator.initialize();
  });

  afterEach(async () => {
    if (orchestrator) {
      await orchestrator.cleanup();
      orchestrator.clearCache();
    }
  });

  afterAll(async () => {
    try {
      if (testUserId && testUserId !== 999) {
        await prisma.user.delete({
          where: { id: testUserId },
        });
      }
    } catch (error) {
      logger.error('Failed to delete test user', error);
    }
  });

  describe('Real Handlebars Engine Tests', () => {
    test('should compile and render real Handlebars templates', async () => {
      const template = {
        id: 'test-simple',
        name: 'Simple Test',
        content: '<h1>Hello {{name}}!</h1><p>Today is {{formatDate date}}.</p>',
        format: 'html',
        engine: 'handlebars',
        variables: ['name', 'date'],
      };

      const context = {
        data: {
          name: 'Teaching Engine',
          date: new Date('2024-03-15'),
        },
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(template, context);

      expect(result.content).toContain('<h1>Hello Teaching Engine!</h1>');
      expect(result.content).toContain('March 15, 2024');
      expect(result.format).toBe('html');
      expect(result.metadata?.engine).toBe('handlebars');
      expect(result.metadata?.renderTime).toBeGreaterThan(0);

      logger.info('Simple template rendering test completed', {
        renderTime: result.metadata?.renderTime,
        contentLength: result.content.length,
      });
    });

    test('should handle complex data structures with loops and conditionals', async () => {
      const complexTemplate = {
        id: 'test-complex',
        name: 'Complex Test',
        content: `
          <div class="student-list">
            <h2>Class: {{className}} ({{length students}} students)</h2>
            {{#each students}}
            <div class="student">
              <h3>{{this.firstName}} {{this.lastName}}</h3>
              <p>Grade: {{this.grade}}</p>
              {{#if this.specialNeeds}}
              <p class="special-needs">Special Needs: {{join this.specialNeeds ", "}}</p>
              {{/if}}
              {{#if (gt this.attendance 90)}}
              <span class="good-attendance">Excellent Attendance</span>
              {{else}}
              <span class="poor-attendance">Needs Improvement</span>
              {{/if}}
            </div>
            {{/each}}
          </div>
        `,
        format: 'html',
        engine: 'handlebars',
        variables: ['className', 'students'],
      };

      const context = {
        data: {
          className: 'Grade 3A',
          students: [
            {
              firstName: 'Alice',
              lastName: 'Johnson',
              grade: 3,
              attendance: 95,
              specialNeeds: ['Visual impairment', 'Extra time'],
            },
            {
              firstName: 'Bob',
              lastName: 'Smith',
              grade: 3,
              attendance: 87,
              specialNeeds: null,
            },
            {
              firstName: 'Carol',
              lastName: 'Davis',
              grade: 3,
              attendance: 92,
              specialNeeds: ['ADHD'],
            },
          ],
        },
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(complexTemplate, context);

      expect(result.content).toContain('Grade 3A (3 students)');
      expect(result.content).toContain('Alice Johnson');
      expect(result.content).toContain('Bob Smith');
      expect(result.content).toContain('Carol Davis');
      expect(result.content).toContain('Visual impairment, Extra time');
      expect(result.content).toContain('Excellent Attendance');
      expect(result.content).toContain('Needs Improvement');

      logger.info('Complex template rendering test completed', {
        studentCount: context.data.students.length,
        contentLength: result.content.length,
      });
    });

    test('should validate template syntax correctly', async () => {
      const validTemplate = {
        id: 'valid',
        name: 'Valid Template',
        content: '<h1>{{title}}</h1>{{#each items}}<p>{{this}}</p>{{/each}}',
        format: 'html',
        engine: 'handlebars',
        variables: ['title', 'items'],
      };

      const invalidTemplate = {
        id: 'invalid',
        name: 'Invalid Template',
        content: '<h1>{{title}}</h1>{{#each items}}<p>{{this}}</p>{{/missing}}',
        format: 'html',
        engine: 'handlebars',
        variables: ['title', 'items'],
      };

      const validResult = await handlebarsEngine.validate(validTemplate);
      const invalidResult = await handlebarsEngine.validate(invalidTemplate);

      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);

      logger.info('Template validation test completed', {
        validTemplate: validResult,
        invalidTemplate: invalidResult,
      });
    });
  });

  describe('Real Template Helper Tests', () => {
    test('should use built-in date formatting helpers', async () => {
      const dateTemplate = {
        id: 'date-test',
        name: 'Date Test',
        content: `
          <div>
            <p>Default: {{formatDate testDate}}</p>
            <p>Short: {{formatDate testDate "short"}}</p>
            <p>Long: {{formatDate testDate "long"}}</p>
            <p>Time: {{formatTime testDate}}</p>
            <p>Now: {{formatDate "now" "short"}}</p>
          </div>
        `,
        format: 'html',
        engine: 'handlebars',
        variables: ['testDate'],
      };

      const context = {
        data: {
          testDate: new Date('2024-03-15T14:30:00'),
        },
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(dateTemplate, context);

      expect(result.content).toContain('March 15, 2024');
      expect(result.content).toContain('3/15/2024');
      expect(result.content).toContain('Friday, March 15, 2024');
      expect(result.content).toMatch(/\d{1,2}:\d{2}\s*[AP]M/);

      logger.info('Date helper test completed', {
        contentLength: result.content.length,
      });
    });

    test('should use built-in math and string helpers', async () => {
      const helpersTemplate = {
        id: 'helpers-test',
        name: 'Helpers Test',
        content: `
          <div>
            <p>Add: {{add 5 3}}</p>
            <p>Multiply: {{multiply 4 7}}</p>
            <p>Percentage: {{formatPercent 0.875}}</p>
            <p>Number: {{formatNumber 123.456 2}}</p>
            <p>Uppercase: {{uppercase "hello world"}}</p>
            <p>Capitalize: {{capitalize "hello world"}}</p>
            <p>Truncate: {{truncate "This is a very long string that should be truncated" 20}}</p>
            <p>Pluralize: {{pluralize 1 "item"}} vs {{pluralize 5 "item"}}</p>
          </div>
        `,
        format: 'html',
        engine: 'handlebars',
        variables: [],
      };

      const context = {
        data: {},
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(helpersTemplate, context);

      expect(result.content).toContain('Add: 8');
      expect(result.content).toContain('Multiply: 28');
      expect(result.content).toContain('Percentage: 88%');
      expect(result.content).toContain('Number: 123.46');
      expect(result.content).toContain('Uppercase: HELLO WORLD');
      expect(result.content).toContain('Capitalize: Hello world');
      expect(result.content).toContain('Truncate: This is a very long...');
      expect(result.content).toContain('1 item vs 5 items');

      logger.info('Helpers test completed');
    });

    test('should register and use custom helpers', async () => {
      const customTemplate = {
        id: 'custom-helpers',
        name: 'Custom Helpers Test',
        content: `
          <div>
            <p>Grade Level: {{gradeOrdinal grade}}</p>
            <p>Full Name: {{fullName firstName lastName}}</p>
            <p>Progress: {{progressBar percentage}}</p>
          </div>
        `,
        format: 'html',
        engine: 'handlebars',
        variables: ['grade', 'firstName', 'lastName', 'percentage'],
      };

      // Register custom helpers
      handlebarsEngine.registerHelper('gradeOrdinal', (grade: number) => {
        const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];
        return ordinals[grade] || `${grade}th`;
      });

      handlebarsEngine.registerHelper('fullName', (first: string, last: string) => {
        return `${first} ${last}`;
      });

      handlebarsEngine.registerHelper('progressBar', (percentage: number) => {
        const width = Math.round(percentage);
        return `<div class="progress-bar" style="width: ${width}%"></div>`;
      });

      const context = {
        data: {
          grade: 3,
          firstName: 'John',
          lastName: 'Doe',
          percentage: 75,
        },
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(customTemplate, context);

      expect(result.content).toContain('Grade Level: 3rd');
      expect(result.content).toContain('Full Name: John Doe');
      expect(result.content).toContain('width: 75%');

      logger.info('Custom helpers test completed');
    });
  });

  describe('Real Lesson Plan Rendering', () => {
    test('should render complete lesson plan with real data', async () => {
      const lessonData = {
        title: 'Introduction to Fractions',
        grade: 3,
        subject: 'Mathematics',
        duration: 60,
        date: new Date('2024-03-20'),
        objectives: [
          'Students will understand fractions as parts of a whole',
          'Students will identify unit fractions',
          'Students will represent fractions using visual models',
        ],
        activities: [
          {
            name: 'Warm-up Discussion',
            duration: 10,
            description: 'Review previous learning about whole numbers and introduce the concept of parts',
            materials: ['Whiteboard', 'Markers'],
          },
          {
            name: 'Fraction Pizza Activity',
            duration: 25,
            description: 'Use pizza models to demonstrate how fractions represent parts of a whole',
            materials: ['Paper pizza circles', 'Scissors', 'Colored pencils'],
          },
          {
            name: 'Practice Worksheets',
            duration: 20,
            description: 'Students complete guided practice identifying and coloring fractions',
            materials: ['Fraction worksheets', 'Crayons'],
          },
          {
            name: 'Wrap-up and Assessment',
            duration: 5,
            description: 'Quick exit ticket to assess understanding',
            materials: ['Exit tickets'],
          },
        ],
        assessment: 'Exit tickets will be used to assess student understanding of basic fraction concepts',
      };

      const template = {
        id: 'lesson-standard',
        name: 'Standard Lesson Plan',
        content: REAL_LESSON_TEMPLATE,
        format: 'html',
        engine: 'handlebars',
        variables: ['lesson'],
      };

      const context = {
        data: { lesson: lessonData },
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(template, context);

      // Verify lesson plan structure
      expect(result.content).toContain('Introduction to Fractions');
      expect(result.content).toContain('Grade: 3');
      expect(result.content).toContain('Subject: Mathematics');
      expect(result.content).toContain('Duration: 60 minutes');
      expect(result.content).toContain('March 20, 2024');

      // Verify objectives
      expect(result.content).toContain('Students will understand fractions as parts of a whole');
      expect(result.content).toContain('Students will identify unit fractions');

      // Verify activities
      expect(result.content).toContain('1. Warm-up Discussion (10 min)');
      expect(result.content).toContain('2. Fraction Pizza Activity (25 min)');
      expect(result.content).toContain('3. Practice Worksheets (20 min)');
      expect(result.content).toContain('4. Wrap-up and Assessment (5 min)');

      // Verify materials
      expect(result.content).toContain('Paper pizza circles');
      expect(result.content).toContain('Colored pencils');

      // Verify assessment
      expect(result.content).toContain('Exit tickets will be used to assess');

      logger.info('Lesson plan rendering test completed', {
        lessonTitle: lessonData.title,
        activitiesCount: lessonData.activities.length,
        contentLength: result.content.length,
      });
    });
  });

  describe('Real Newsletter Rendering', () => {
    test('should render classroom newsletter with real data', async () => {
      const newsletterData = {
        classroom: 'Grade 4B',
        dateRange: {
          start: new Date('2024-03-18'),
          end: new Date('2024-03-22'),
        },
        sections: [
          {
            title: 'This Week\'s Highlights',
            items: [
              {
                title: 'Science Fair Success',
                content: 'Our students did an amazing job presenting their science fair projects on Tuesday.',
                date: new Date('2024-03-19'),
              },
              {
                title: 'Math Assessment',
                content: 'Students completed their unit assessment on multiplication and did very well overall.',
                date: new Date('2024-03-20'),
              },
            ],
          },
          {
            title: 'Upcoming Events',
            items: [
              {
                title: 'Parent-Teacher Conferences',
                content: 'Conferences will be held next week. Please check your email for appointment times.',
              },
              {
                title: 'Field Trip',
                content: 'We will be visiting the local history museum on April 2nd. Permission forms are due Monday.',
              },
            ],
          },
        ],
        teacher: {
          email: 'teacher@school.com',
          phone: '555-123-4567',
        },
      };

      const template = {
        id: 'newsletter-weekly-standard',
        name: 'Weekly Newsletter',
        content: REAL_NEWSLETTER_TEMPLATE,
        format: 'html',
        engine: 'handlebars',
        variables: ['classroom', 'dateRange', 'sections', 'teacher'],
      };

      const context = {
        data: newsletterData,
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(template, context);

      // Verify newsletter structure
      expect(result.content).toContain('Grade 4B Newsletter');
      expect(result.content).toContain('3/18/2024 - 3/22/2024');

      // Verify sections
      expect(result.content).toContain('This Week\'s Highlights');
      expect(result.content).toContain('Upcoming Events');

      // Verify content
      expect(result.content).toContain('Science Fair Success');
      expect(result.content).toContain('Math Assessment');
      expect(result.content).toContain('Parent-Teacher Conferences');
      expect(result.content).toContain('Field Trip');

      // Verify dates
      expect(result.content).toContain('3/19/2024');
      expect(result.content).toContain('3/20/2024');

      // Verify contact info
      expect(result.content).toContain('teacher@school.com');
      expect(result.content).toContain('555-123-4567');

      logger.info('Newsletter rendering test completed', {
        classroom: newsletterData.classroom,
        sectionsCount: newsletterData.sections.length,
        contentLength: result.content.length,
      });
    });
  });

  describe('Real Progress Report Rendering', () => {
    test('should render student progress report with real data', async () => {
      const reportData = {
        student: {
          id: 12345,
          firstName: 'Emma',
          lastName: 'Wilson',
          grade: 4,
        },
        reportPeriod: {
          start: new Date('2024-01-15'),
          end: new Date('2024-03-15'),
        },
        subjects: [
          {
            name: 'Mathematics',
            grade: 'B+',
            percentage: 87,
            expectations: [
              {
                code: 'NS4.1',
                description: 'Demonstrate understanding of place value',
                achievementLevel: 'Level 3',
              },
              {
                code: 'NS4.2',
                description: 'Add and subtract multi-digit numbers',
                achievementLevel: 'Level 4',
              },
            ],
            comments: 'Emma shows strong problem-solving skills and is eager to tackle challenging problems.',
          },
          {
            name: 'Language Arts',
            grade: 'A',
            percentage: 92,
            expectations: [
              {
                code: 'R4.1',
                description: 'Read and comprehend grade-level texts',
                achievementLevel: 'Level 4',
              },
              {
                code: 'W4.1',
                description: 'Write clearly and coherently',
                achievementLevel: 'Level 4',
              },
            ],
            comments: 'Emma is an excellent reader and writer who consistently produces high-quality work.',
          },
        ],
        learningSkills: [
          { name: 'Responsibility', level: 'G' },
          { name: 'Organization', level: 'G' },
          { name: 'Independent Work', level: 'S' },
          { name: 'Collaboration', level: 'G' },
          { name: 'Initiative', level: 'S' },
          { name: 'Self-Regulation', level: 'G' },
        ],
        teacher: {
          name: 'Ms. Johnson',
        },
      };

      const template = {
        id: 'report-progress-pdf',
        name: 'Progress Report',
        content: REAL_REPORT_TEMPLATE,
        format: 'html',
        engine: 'handlebars',
        variables: ['student', 'reportPeriod', 'subjects', 'learningSkills', 'teacher'],
      };

      const context = {
        data: reportData,
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(template, context);

      // Verify report structure
      expect(result.content).toContain('Progress Report');
      expect(result.content).toContain('Emma Wilson');
      expect(result.content).toContain('Grade: 4');
      expect(result.content).toContain('Student ID: 12345');

      // Verify report period
      expect(result.content).toContain('January 15, 2024 - March 15, 2024');

      // Verify subjects
      expect(result.content).toContain('Mathematics');
      expect(result.content).toContain('Language Arts');
      expect(result.content).toContain('Grade: B+');
      expect(result.content).toContain('Grade: A');
      expect(result.content).toContain('87%');
      expect(result.content).toContain('92%');

      // Verify expectations
      expect(result.content).toContain('NS4.1');
      expect(result.content).toContain('Demonstrate understanding of place value');
      expect(result.content).toContain('Level 3');
      expect(result.content).toContain('Level 4');

      // Verify comments
      expect(result.content).toContain('strong problem-solving skills');
      expect(result.content).toContain('excellent reader and writer');

      // Verify learning skills
      expect(result.content).toContain('Responsibility');
      expect(result.content).toContain('Organization');
      expect(result.content).toContain('Independent Work');

      // Verify teacher signature
      expect(result.content).toContain('Teacher: Ms. Johnson');

      logger.info('Progress report rendering test completed', {
        studentName: `${reportData.student.firstName} ${reportData.student.lastName}`,
        subjectsCount: reportData.subjects.length,
        learningSkillsCount: reportData.learningSkills.length,
        contentLength: result.content.length,
      });
    });
  });

  describe('Real Performance and Optimization Tests', () => {
    test('should handle template compilation caching', async () => {
      const template = {
        id: 'cache-test',
        name: 'Cache Test',
        content: '<h1>{{title}}</h1><p>Rendered at: {{formatDate "now"}}</p>',
        format: 'html',
        engine: 'handlebars',
        variables: ['title'],
      };

      const context1 = {
        data: { title: 'First Render' },
        helpers: {},
        partials: {},
      };

      const context2 = {
        data: { title: 'Second Render' },
        helpers: {},
        partials: {},
      };

      // First render (should compile)
      const start1 = Date.now();
      const result1 = await handlebarsEngine.render(template, context1);
      const time1 = Date.now() - start1;

      // Second render (should use cached compilation)
      const start2 = Date.now();
      const result2 = await handlebarsEngine.render(template, context2);
      const time2 = Date.now() - start2;

      expect(result1.content).toContain('First Render');
      expect(result2.content).toContain('Second Render');

      // Second render should be faster (cached compilation)
      expect(time2).toBeLessThanOrEqual(time1);

      logger.info('Template caching test completed', {
        firstRenderTime: time1,
        secondRenderTime: time2,
        improvement: `${Math.round(((time1 - time2) / time1) * 100)}%`,
      });
    });

    test('should render large documents efficiently', async () => {
      // Generate large lesson plan data
      const largeActivities = Array.from({ length: 20 }, (_, index) => ({
        name: `Activity ${index + 1}`,
        duration: 15,
        description: `This is a detailed description for activity ${index + 1}. It contains multiple sentences with lots of information about what students will be doing during this activity. The description is intentionally long to test rendering performance with larger amounts of content.`,
        materials: [
          'Whiteboard',
          'Markers',
          'Handouts',
          'Manipulatives',
          'Technology',
          'Assessment tools',
        ],
      }));

      const largeLessonData = {
        title: 'Comprehensive Mathematics Unit Review',
        grade: 5,
        subject: 'Mathematics',
        duration: 300, // 5 hours
        date: new Date('2024-03-25'),
        objectives: Array.from({ length: 10 }, (_, i) => `Learning objective ${i + 1} that describes what students will know and be able to do by the end of this comprehensive lesson.`),
        activities: largeActivities,
        assessment: 'This is a comprehensive assessment strategy that includes multiple forms of evaluation including formative assessments, summative assessments, peer assessments, and self-assessments to ensure all students demonstrate mastery of the learning objectives.',
      };

      const template = {
        id: 'large-lesson',
        name: 'Large Lesson Plan',
        content: REAL_LESSON_TEMPLATE,
        format: 'html',
        engine: 'handlebars',
        variables: ['lesson'],
      };

      const context = {
        data: { lesson: largeLessonData },
        helpers: {},
        partials: {},
      };

      const startTime = Date.now();
      const result = await handlebarsEngine.render(template, context);
      const renderTime = Date.now() - startTime;

      expect(result.content).toContain('Comprehensive Mathematics Unit Review');
      expect(result.content).toContain('Activity 1');
      expect(result.content).toContain('Activity 20');
      expect(result.content.length).toBeGreaterThan(10000); // Should be substantial content

      // Should render within reasonable time even for large content
      expect(renderTime).toBeLessThan(1000); // 1 second

      logger.info('Large document rendering test completed', {
        activitiesCount: largeActivities.length,
        objectivesCount: largeLessonData.objectives.length,
        contentLength: result.content.length,
        renderTime,
        charactersPerMs: Math.round(result.content.length / renderTime),
      });
    });
  });

  describe('Real Error Handling Tests', () => {
    test('should handle template rendering errors gracefully', async () => {
      const errorTemplate = {
        id: 'error-test',
        name: 'Error Test',
        content: '{{#each items}}{{this.nonExistentProperty.subProperty}}{{/each}}',
        format: 'html',
        engine: 'handlebars',
        variables: ['items'],
      };

      const context = {
        data: {
          items: [{ name: 'Item 1' }, { name: 'Item 2' }],
        },
        helpers: {},
        partials: {},
      };

      await expect(handlebarsEngine.render(errorTemplate, context)).rejects.toThrow();

      logger.info('Error handling test completed');
    });

    test('should handle missing data gracefully with default values', async () => {
      const resilientTemplate = {
        id: 'resilient-test',
        name: 'Resilient Test',
        content: `
          <div>
            <h1>{{default title "Untitled"}}</h1>
            <p>Items: {{length items}}</p>
            {{#each items}}
            <div>{{default this.name "Unknown"}}</div>
            {{/each}}
            {{#unless items}}
            <p>No items available</p>
            {{/unless}}
          </div>
        `,
        format: 'html',
        engine: 'handlebars',
        variables: ['title', 'items'],
      };

      const context = {
        data: {
          // Intentionally missing title and items
        },
        helpers: {},
        partials: {},
      };

      const result = await handlebarsEngine.render(resilientTemplate, context);

      expect(result.content).toContain('Untitled');
      expect(result.content).toContain('Items: 0');
      expect(result.content).toContain('No items available');

      logger.info('Resilient template test completed', {
        contentLength: result.content.length,
      });
    });
  });
});