import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';
import { extractWeeklyPlan } from '../../src/services/weeklyPlanExtractor';
import { extractScenarioTemplates, autoDetectScenario } from '../../src/services/scenarioTemplateExtractor';
import { extractSchoolContacts } from '../../src/services/contactExtractor';
import { extractDayMaterials } from '../../src/services/materialExtractor';

describe('D3 Sub Plan Extractor - Integration Tests', () => {
  const testUserId = 1;
  const testDate = '2024-01-15';
  const testWeekStart = '2024-01-15';

  beforeEach(async () => {
    // Clean up and set up test data
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.classRoutine.deleteMany();
    await prisma.studentGoal.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacherPreferences.deleteMany();

    // Create test subjects
    const mathSubject = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques'
      }
    });

    const langSubject = await prisma.subject.create({
      data: {
        name: 'Language Arts',
        nameEn: 'Language Arts',
        nameFr: 'Arts du langage'
      }
    });

    // Create test milestones
    const mathMilestone = await prisma.milestone.create({
      data: {
        title: 'Number Operations',
        targetDate: new Date('2024-01-31'),
        subjectId: mathSubject.id
      }
    });

    const langMilestone = await prisma.milestone.create({
      data: {
        title: 'Reading Comprehension',
        targetDate: new Date('2024-01-31'),
        subjectId: langSubject.id
      }
    });

    // Create test activities
    const mathActivity = await prisma.activity.create({
      data: {
        title: 'Addition and Subtraction Practice',
        titleEn: 'Addition and Subtraction Practice',
        titleFr: 'Pratique d\'addition et soustraction',
        publicNote: 'Practice basic math operations using worksheets and manipulatives',
        durationMins: 45,
        milestoneId: mathMilestone.id,
        isSubFriendly: true,
        activityType: 'LESSON'
      }
    });

    const langActivity = await prisma.activity.create({
      data: {
        title: 'Silent Reading Time',
        titleEn: 'Silent Reading Time',
        titleFr: 'Lecture silencieuse',
        publicNote: 'Students read independently from books and write comprehension responses',
        durationMins: 30,
        milestoneId: langMilestone.id,
        isSubFriendly: true,
        activityType: 'LESSON'
      }
    });

    // Create lesson plan first  
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        weekStart: new Date(testDate)
      }
    });

    // Create daily plan
    const dailyPlan = await prisma.dailyPlan.create({
      data: {
        date: new Date(testDate),
        lessonPlanId: lessonPlan.id,
        items: {
          create: [
            {
              startMin: 540, // 9:00 AM
              endMin: 585, // 9:45 AM
              activity: { connect: { id: mathActivity.id } }
            },
            {
              startMin: 600, // 10:00 AM  
              endMin: 630, // 10:30 AM
              activity: { connect: { id: langActivity.id } }
            }
          ]
        }
      }
    });

    // Create test student and goals
    const student = await prisma.student.create({
      data: {
        firstName: 'Test',
        lastName: 'Student',
        userId: testUserId
      }
    });

    await prisma.studentGoal.create({
      data: {
        text: 'Improve reading fluency',
        status: 'active',
        studentId: student.id
      }
    });

    // Create class routines
    await prisma.classRoutine.create({
      data: {
        title: 'Morning Circle',
        description: 'Daily morning meeting with calendar and weather',
        category: 'Morning',
        timeOfDay: '08:30',
        priority: 5,
        isActive: true,
        userId: testUserId
      }
    });

    // Create teacher preferences
    await prisma.teacherPreferences.create({
      data: {
        id: testUserId,
        teachingStyles: 'Interactive',
        pacePreference: 'Moderate',
        prepTime: 30,
        subPlanContacts: {
          'Principal': 'Ms. Smith - 555-1234 ext. 100',
          'Office': 'Main Office - 555-1234 ext. 101',
          'Nurse': 'School Nurse - 555-1234 ext. 105'
        },
        subPlanProcedures: 'Check substitute folder for emergency materials'
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.classRoutine.deleteMany();
    await prisma.studentGoal.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacherPreferences.deleteMany();
  });

  describe('Weekly Plan Extraction', () => {
    test('should extract weekly plan data', async () => {
      const weeklyPlan = await extractWeeklyPlan(testWeekStart, 3, { userId: testUserId });

      expect(weeklyPlan).toHaveProperty('startDate', testWeekStart);
      expect(weeklyPlan).toHaveProperty('days');
      expect(weeklyPlan.days).toHaveLength(3);
      expect(weeklyPlan).toHaveProperty('weeklyOverview');
      expect(weeklyPlan).toHaveProperty('continuityNotes');
      expect(weeklyPlan).toHaveProperty('emergencyBackupPlans');

      // Check first day data
      const firstDay = weeklyPlan.days[0];
      expect(firstDay).toHaveProperty('schedule');
      expect(firstDay.schedule.length).toBeGreaterThan(0);
      expect(firstDay).toHaveProperty('goals');
      expect(firstDay).toHaveProperty('routines');
    });

    test('API endpoint /extract/weekly should return weekly plan', async () => {
      const response = await request(app)
        .get('/subplan/extract/weekly')
        .query({
          startDate: testWeekStart,
          days: 3,
          userId: testUserId
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('startDate');
      expect(response.body).toHaveProperty('days');
      expect(response.body.days).toHaveLength(3);
      expect(response.body).toHaveProperty('weeklyOverview');
      expect(response.body.weeklyOverview).toHaveProperty('subjects');
      expect(response.body.weeklyOverview).toHaveProperty('milestones');
    });

    test('should handle invalid date format', async () => {
      const response = await request(app)
        .get('/subplan/extract/weekly')
        .query({
          startDate: 'invalid-date',
          userId: testUserId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('YYYY-MM-DD format');
    });
  });

  describe('Scenario Template Extraction', () => {
    test('should extract scenario templates without conditions', async () => {
      const scenarios = await extractScenarioTemplates();

      expect(scenarios).toHaveProperty('scenarios');
      expect(scenarios).toHaveProperty('triggers');
      expect(scenarios).toHaveProperty('recommendedScenario');
      expect(scenarios.scenarios.length).toBeGreaterThan(0);

      // Check scenario structure
      const scenario = scenarios.scenarios[0];
      expect(scenario).toHaveProperty('id');
      expect(scenario).toHaveProperty('name');
      expect(scenario).toHaveProperty('procedures');
      expect(scenario).toHaveProperty('materials');
      expect(scenario).toHaveProperty('contacts');
      expect(scenario).toHaveProperty('template');
    });

    test('should auto-detect appropriate scenario', async () => {
      const scenario = await autoDetectScenario(testUserId);

      expect(scenario).toHaveProperty('id');
      expect(scenario).toHaveProperty('name');
      expect(scenario).toHaveProperty('procedures');
      expect(scenario.procedures).toBeInstanceOf(Array);
      expect(scenario.procedures.length).toBeGreaterThan(0);
    });

    test('API endpoint /extract/scenarios should return scenarios', async () => {
      const response = await request(app)
        .get('/subplan/extract/scenarios')
        .query({
          weather: 'severe',
          technology: 'down'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('scenarios');
      expect(response.body).toHaveProperty('triggers');
      expect(response.body.triggers).toContain('severe_weather');
      expect(response.body.triggers).toContain('technology_failure');
    });

    test('API endpoint /extract/scenarios/auto should return auto-detected scenario', async () => {
      const response = await request(app)
        .get('/subplan/extract/scenarios/auto')
        .query({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('procedures');
    });

    test('API endpoint /extract/scenarios/:id should return specific scenario', async () => {
      const response = await request(app)
        .get('/subplan/extract/scenarios/technology_failure')
        .query({
          teacherName: 'Ms. Johnson',
          className: 'Grade 3A'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('scenario');
      expect(response.body).toHaveProperty('generatedContent');
      expect(response.body.scenario.id).toBe('technology_failure');
      expect(response.body.generatedContent).toContain('Ms. Johnson');
      expect(response.body.generatedContent).toContain('Grade 3A');
    });
  });

  describe('Contact Extraction', () => {
    test('should extract school contacts', async () => {
      const contacts = await extractSchoolContacts(testUserId);

      expect(contacts).toHaveProperty('emergency');
      expect(contacts).toHaveProperty('administration');
      expect(contacts).toHaveProperty('support');
      expect(contacts).toHaveProperty('custom');

      // Should have default emergency contacts
      expect(contacts.emergency.length).toBeGreaterThan(0);
      
      // Should have custom contacts from teacher preferences
      expect(contacts.custom.length).toBeGreaterThan(0);
      const principalContact = contacts.custom.find(c => c.role === 'Principal');
      expect(principalContact).toBeDefined();
      expect(principalContact?.name).toBe('Ms. Smith');
    });

    test('API endpoint /extract/contacts should return organized contacts', async () => {
      const response = await request(app)
        .get('/subplan/extract/contacts')
        .query({
          userId: testUserId,
          format: 'organized'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('emergency');
      expect(response.body).toHaveProperty('administration');
      expect(response.body).toHaveProperty('custom');
    });

    test('API endpoint /extract/contacts should return formatted contacts', async () => {
      const response = await request(app)
        .get('/subplan/extract/contacts')
        .query({
          userId: testUserId,
          format: 'formatted'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('formattedContacts');
      expect(typeof response.body.formattedContacts).toBe('string');
      expect(response.body.formattedContacts).toContain('EMERGENCY CONTACTS');
    });

    test('API endpoint /extract/contacts should return emergency contact card', async () => {
      const response = await request(app)
        .get('/subplan/extract/contacts')
        .query({
          userId: testUserId,
          format: 'card'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('contactCard');
      expect(response.body.contactCard).toContain('EMERGENCY CONTACTS');
      expect(response.body.contactCard).toContain('911');
    });
  });

  describe('Material Extraction', () => {
    test('should extract day materials', async () => {
      const materials = await extractDayMaterials(testDate, testUserId);

      expect(materials).toHaveProperty('byTimeSlot');
      expect(materials).toHaveProperty('byCategory');
      expect(materials).toHaveProperty('setupInstructions');
      expect(materials).toHaveProperty('summary');

      // Should have materials for the activities
      expect(materials.byTimeSlot.length).toBeGreaterThan(0);
      
      // Should categorize materials
      expect(materials.byCategory).toHaveProperty('supplies');
      expect(materials.byCategory).toHaveProperty('equipment');
      
      // Should have basic materials like pencils and paper
      const allMaterials = [
        ...materials.byCategory.supplies,
        ...materials.byCategory.equipment,
        ...materials.byCategory.physical
      ];
      expect(allMaterials.some(m => m.name.toLowerCase().includes('pencil'))).toBe(true);
    });

    test('API endpoint /extract/materials/day should return day materials', async () => {
      const response = await request(app)
        .get('/subplan/extract/materials/day')
        .query({
          date: testDate,
          userId: testUserId
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('byTimeSlot');
      expect(response.body).toHaveProperty('byCategory');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('totalItems');
      expect(response.body.summary.totalItems).toBeGreaterThan(0);
    });

    test('API endpoint /extract/materials/weekly should return weekly materials', async () => {
      const response = await request(app)
        .get('/subplan/extract/materials/weekly')
        .query({
          startDate: testWeekStart,
          days: 3,
          userId: testUserId
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('materials');
    });
  });

  describe('Comprehensive Extraction', () => {
    test('API endpoint /extract/comprehensive should return all extraction data', async () => {
      const response = await request(app)
        .post('/subplan/extract/comprehensive')
        .send({
          startDate: testDate,
          numDays: 2,
          userId: testUserId,
          includeWeeklyOverview: true,
          includeScenarios: true,
          includeContacts: true,
          includeMaterials: true,
          scenarioConditions: {
            weather: 'normal',
            technology: 'working'
          },
          options: {
            includeGoals: true,
            includeRoutines: true,
            anonymize: false
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metadata');
      expect(response.body).toHaveProperty('weeklyPlan');
      expect(response.body).toHaveProperty('scenarios');
      expect(response.body).toHaveProperty('contacts');
      expect(response.body).toHaveProperty('materials');
      expect(response.body).toHaveProperty('recommendedScenario');
      expect(response.body).toHaveProperty('emergencyContacts');

      // Validate metadata
      expect(response.body.metadata).toHaveProperty('extractedAt');
      expect(response.body.metadata).toHaveProperty('startDate', testDate);
      expect(response.body.metadata).toHaveProperty('numDays', 2);
      expect(response.body.metadata).toHaveProperty('userId', testUserId);

      // Validate weekly plan
      expect(response.body.weeklyPlan).toHaveProperty('days');
      expect(response.body.weeklyPlan.days).toHaveLength(2);

      // Validate scenarios
      expect(response.body.scenarios).toHaveProperty('scenarios');
      expect(response.body.scenarios.scenarios.length).toBeGreaterThan(0);

      // Validate contacts
      expect(response.body.contacts).toHaveProperty('emergency');
      expect(response.body.emergencyContacts).toBeDefined();

      // Validate materials
      expect(response.body.materials).toBeInstanceOf(Array);
      expect(response.body.materials).toHaveLength(2);
    });

    test('should handle single day comprehensive extraction', async () => {
      const response = await request(app)
        .post('/subplan/extract/comprehensive')
        .send({
          startDate: testDate,
          numDays: 1,
          userId: testUserId
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('materials');
      // For single day, materials should be day materials object, not array
      expect(response.body.materials).toHaveProperty('byTimeSlot');
      expect(response.body.materials).toHaveProperty('byCategory');
    });

    test('should validate date format in comprehensive extraction', async () => {
      const response = await request(app)
        .post('/subplan/extract/comprehensive')
        .send({
          startDate: 'invalid-date',
          userId: testUserId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('YYYY-MM-DD format');
    });

    test('should handle selective extraction options', async () => {
      const response = await request(app)
        .post('/subplan/extract/comprehensive')
        .send({
          startDate: testDate,
          numDays: 1,
          userId: testUserId,
          includeWeeklyOverview: false,
          includeScenarios: false,
          includeContacts: true,
          includeMaterials: false
        });

      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('weeklyPlan');
      expect(response.body).not.toHaveProperty('scenarios');
      expect(response.body).toHaveProperty('contacts');
      expect(response.body).not.toHaveProperty('materials');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing data gracefully', async () => {
      // Test with non-existent date
      const futureDate = '2025-12-31';
      
      const response = await request(app)
        .get('/subplan/extract/materials/day')
        .query({
          date: futureDate,
          userId: testUserId
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary.totalItems).toBe(0);
    });

    test('should handle non-existent scenario ID', async () => {
      const response = await request(app)
        .get('/subplan/extract/scenarios/non-existent-scenario');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Scenario not found');
    });
  });
});