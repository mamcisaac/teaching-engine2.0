/**
 * Example test file demonstrating factory usage
 * 
 * This file shows various ways to use the test factories
 * for different testing scenarios.
 */

import { PrismaClient } from '@prisma/client';
import { 
  createFactories, 
  TeachingScenarios,
  cleanupTestData,
  quick 
} from '../index';

describe('Factory Usage Examples', () => {
  let prisma: PrismaClient;
  let factories: ReturnType<typeof createFactories>;
  let scenarios: TeachingScenarios;

  beforeAll(() => {
    prisma = new PrismaClient();
    factories = createFactories(prisma);
    scenarios = new TeachingScenarios(prisma);
  });

  afterAll(async () => {
    await cleanupTestData(prisma);
    await prisma.$disconnect();
  });

  describe('Basic Factory Usage', () => {
    it('should create a simple teacher', async () => {
      const teacher = await factories.user.create({
        name: 'Ms. Johnson',
        email: 'mjohnson@school.ca'
      });

      expect(teacher.name).toBe('Ms. Johnson');
      expect(teacher.email).toBe('mjohnson@school.ca');
      expect(teacher.role).toBe('teacher');
    });

    it('should create a lesson plan with realistic data', async () => {
      const teacher = await factories.user.create();
      const unit = await factories.unitPlan.create({ userId: teacher.id });
      
      const lesson = await factories.lessonPlan.create({
        userId: teacher.id,
        unitPlanId: unit.id,
        title: 'Introduction to Multiplication',
        grade: 3,
        subject: 'Mathematics'
      });

      expect(lesson.title).toBe('Introduction to Multiplication');
      expect(lesson.mindsOn).toBeTruthy();
      expect(lesson.action).toBeTruthy();
      expect(lesson.consolidation).toBeTruthy();
      expect(lesson.duration).toBeGreaterThan(0);
    });

    it('should create curriculum expectations for a grade', async () => {
      const curriculum = await factories.curriculum.createGradeCurriculum(4);

      expect(curriculum.grade).toBe(4);
      expect(curriculum.subjects).toHaveProperty('Mathematics');
      expect(curriculum.subjects).toHaveProperty('Language');
      expect(curriculum.subjects).toHaveProperty('Science');
      
      // Should have multiple expectations per subject
      Object.values(curriculum.subjects).forEach(expectations => {
        expect(expectations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Scenario-Based Testing', () => {
    it('should set up a new teacher with complete materials', async () => {
      const setup = await scenarios.newTeacherSetup({
        grade: 2,
        subjects: ['Mathematics', 'Language'],
        language: 'en'
      });

      expect(setup.teacher).toBeDefined();
      expect(setup.expectations).toBeDefined();
      expect(setup.longRangePlan).toBeDefined();
      expect(setup.unitPlan).toBeDefined();
      expect(setup.lessons.length).toBe(5); // One week
      expect(setup.substitutePlan).toBeDefined();
    });

    it('should create a substitute teacher day', async () => {
      const subDay = await scenarios.substituteTeacherDay({
        date: new Date('2024-03-15'),
        grade: 5
      });

      expect(subDay.regularTeacher).toBeDefined();
      expect(subDay.supplyTeacher).toBeDefined();
      expect(subDay.subPlan).toBeDefined();
      expect(subDay.lessons.length).toBeGreaterThan(0);
      expect(subDay.routines).toBeDefined();
      expect(subDay.backupActivities).toBeDefined();
      
      // All lessons should be sub-friendly
      subDay.lessons.forEach(lesson => {
        expect(lesson.isSubFriendly).toBe(true);
        expect(lesson.subNotes).toBeTruthy();
      });
    });

    it('should prepare for parent-teacher conferences', async () => {
      const conference = await scenarios.parentTeacherConference({
        numberOfStudents: 25
      });

      expect(conference.teacher).toBeDefined();
      expect(conference.recentLessons.length).toBe(10);
      expect(conference.assessmentData.length).toBe(25);
      expect(conference.conferenceSchedule.length).toBe(25);
      expect(conference.communicationLogs.length).toBeGreaterThan(0);
    });
  });

  describe('Bilingual Content Generation', () => {
    it('should create French immersion content', async () => {
      const frenchFactories = createFactories(prisma, { locale: 'fr' });
      
      const immersion = await frenchFactories.bilingual.generateFrenchImmersionLesson({
        grade: 3,
        subject: 'mathematics',
        immersionLevel: 'middle'
      });

      expect(immersion.teachingLanguage).toBe('fr');
      expect(immersion.frenchPercentage).toBe(75);
      expect(immersion.title).toBeTruthy();
      expect(immersion.objectives).toBeDefined();
      expect(immersion.vocabulary).toBeDefined();
      expect(immersion.languageSupports).toContain('French-only instruction');
    });

    it('should create bilingual curriculum expectations', async () => {
      const expectation = await factories.curriculum.create({
        grade: 4,
        subject: 'Science',
        description: 'investigate the characteristics of living things',
        descriptionFr: 'examiner les caractéristiques des êtres vivants'
      });

      expect(expectation.description).toContain('investigate');
      expect(expectation.descriptionFr).toContain('examiner');
      expect(expectation.strand).toBeTruthy();
      expect(expectation.strandFr).toBeTruthy();
    });
  });

  describe('Performance and Bulk Data', () => {
    it('should create multiple lessons efficiently', async () => {
      const teacher = await factories.user.create();
      const startTime = Date.now();
      
      const lessons = await factories.lessonPlan.createMany(20, {
        userId: teacher.id
      });
      
      const duration = Date.now() - startTime;
      
      expect(lessons.length).toBe(20);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      
      // Each lesson should have unique data
      const titles = new Set(lessons.map(l => l.title));
      expect(titles.size).toBe(20);
    });

    it('should create a week of interconnected data', async () => {
      const teacher = await factories.user.create();
      const unit = await factories.unitPlan.create({ userId: teacher.id });
      
      const weekLessons = await factories.lessonPlan.createWeekOfLessons({
        userId: teacher.id,
        unitPlanId: unit.id,
        grade: 4,
        subject: 'Language',
        startDate: new Date('2024-03-11') // Monday
      });

      expect(weekLessons.length).toBe(5);
      
      // Verify dates are weekdays
      weekLessons.forEach(lesson => {
        const dayOfWeek = lesson.date.getDay();
        expect(dayOfWeek).toBeGreaterThan(0); // Not Sunday
        expect(dayOfWeek).toBeLessThan(6); // Not Saturday
      });
      
      // Verify sequential dates
      for (let i = 1; i < weekLessons.length; i++) {
        const prevDate = weekLessons[i - 1].date.getTime();
        const currDate = weekLessons[i].date.getTime();
        const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBeGreaterThanOrEqual(1);
        expect(daysDiff).toBeLessThanOrEqual(3); // Account for weekends
      });
    });
  });

  describe('Quick Helpers', () => {
    it('should use quick helpers for rapid setup', async () => {
      // Quick teacher setup
      const teacherSetup = await quick.teacher(prisma, {
        grade: 6,
        subjects: ['Mathematics', 'Science']
      });

      expect(teacherSetup.teacher).toBeDefined();
      expect(teacherSetup.grade).toBe(6);
      expect(teacherSetup.subjects).toContain('Mathematics');
      expect(teacherSetup.subjects).toContain('Science');

      // Quick week of lessons
      const weekLessons = await quick.weekOfLessons(prisma, teacherSetup.teacher.id);
      expect(weekLessons.length).toBe(5);

      // Quick curriculum
      const curriculum = await quick.curriculum(prisma, 3);
      expect(curriculum.grade).toBe(3);

      // Quick substitute plan
      const subPlan = await quick.substitutePlan(prisma, teacherSetup.teacher.id);
      expect(subPlan.emergencyProcedures).toBeTruthy();
      expect(subPlan.lessonPlans).toBeDefined();
    });
  });

  describe('Deterministic Data Generation', () => {
    it('should generate reproducible data with seed', async () => {
      const factories1 = createFactories(prisma, { seed: 12345 });
      const factories2 = createFactories(prisma, { seed: 12345 });

      const user1 = await factories1.user.create();
      const user2 = await factories2.user.create();

      // Names should be identical (except for unique constraints like email)
      expect(user1.name).toBe(user2.name);
      expect(user1.preferredLanguage).toBe(user2.preferredLanguage);
    });
  });

  describe('Complex Relationships', () => {
    it('should create a complete teaching ecosystem', async () => {
      // Create a full school year for a teacher
      const yearPlan = await scenarios.fullSchoolYearPlan({
        grade: 4,
        subjects: ['Mathematics', 'Language', 'Science', 'Social Studies']
      });

      expect(yearPlan.teacher).toBeDefined();
      expect(yearPlan.longRangePlans.length).toBe(4); // One per subject
      expect(yearPlan.unitPlans.length).toBeGreaterThan(0);
      expect(yearPlan.lessonPlans.length).toBeGreaterThan(0);
      expect(yearPlan.daybookEntries.length).toBe(5); // First week
      
      // Verify relationships
      yearPlan.unitPlans.forEach(unit => {
        const matchingLRP = yearPlan.longRangePlans.find(
          lrp => lrp.id === unit.longRangePlanId
        );
        expect(matchingLRP).toBeDefined();
      });
    });

    it('should create cross-curricular project', async () => {
      const project = await scenarios.crossCurricularProject({
        theme: 'Climate Change',
        subjects: ['Science', 'Language', 'Social Studies', 'Art']
      });

      expect(project.theme).toBe('Climate Change');
      expect(project.units.length).toBe(4); // One per subject
      expect(project.expectations.length).toBe(4);
      expect(project.lessons.length).toBeGreaterThan(0);
      expect(project.culminatingTask).toBeDefined();
      
      // All units should reference the theme
      project.units.forEach(unit => {
        expect(unit.title).toContain('Climate Change');
        expect(unit.crossCurricularConnections).toBeTruthy();
      });
    });
  });
});