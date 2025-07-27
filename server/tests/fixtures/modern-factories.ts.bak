/**
 * Modern Factory System for Teaching Engine 2.0 Test Data
 * 
 * This file provides a comprehensive factory system for creating test data
 * that aligns with the ETFO-based planning hierarchy and current schema.
 * 
 * Hierarchy: CurriculumExpectation → LongRangePlan → UnitPlan → ETFOLessonPlan → DaybookEntry
 */

import { PrismaClient } from '@teaching-engine/database';
import { randomBytes } from 'crypto';
import { getTestPrismaClient } from '../jest.setup';

// Import fixture data
import usersData from './users.json';
import subjectsData from './subjects.json';
import studentsData from './students.json';
import expectationsData from './curriculum-expectations.json';
import activitiesData from './external-activities.json';
import eventsData from './calendar-events.json';
import routinesData from './class-routines.json';

/**
 * Base factory interface with improved typing
 */
interface BaseFactory<T> {
  create(overrides?: Partial<T>): Promise<T>;
  createMany(count: number, overrides?: Partial<T>): Promise<T[]>;
  build(overrides?: Partial<T>): Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Generate unique test identifiers
 */
function generateTestId(prefix = ''): string {
  return `${prefix}${randomBytes(4).toString('hex')}`;
}

/**
 * Generate realistic dates for testing
 */
function generateTestDates() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Academic year starts in September
  const academicYearStart = new Date(currentYear, 8, 1); // September 1st
  const academicYearEnd = new Date(currentYear + 1, 5, 30); // June 30th
  
  return {
    academicYearStart,
    academicYearEnd,
    currentDate: now,
    oneWeekFromNow: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    oneMonthFromNow: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Enhanced User Factory
 */
export class UserFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('test-user-');
    const defaultUser = usersData[0]; // Use first user as template
    
    return {
      email: `${id}@example.com`,
      password: defaultUser.password, // Pre-hashed password
      name: `Test User ${id.slice(-8)}`,
      role: 'teacher',
      preferredLanguage: 'en',
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const userData = this.build(overrides);
    return await this.prisma.user.create({ data: userData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      const userData = this.build({
        ...overrides,
        email: `test-bulk-${i}-${generateTestId()}@example.com`,
        name: `Test User ${i + 1}`,
      });
      users.push(userData);
    }

    await this.prisma.user.createMany({ data: users });
    
    return await this.prisma.user.findMany({
      where: { email: { in: users.map(u => u.email) } },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Create a user from fixture data
   */
  async createFromFixture(fixtureId: string): Promise<any> {
    const fixture = usersData.find(u => u.id === fixtureId);
    if (!fixture) {
      throw new Error(`User fixture with id '${fixtureId}' not found`);
    }
    
    const { id, ...userData } = fixture;
    return await this.create(userData);
  }
}

/**
 * Subject Factory
 */
export class SubjectFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const defaultSubject = subjectsData[0]; // Use first subject as template
    const id = generateTestId('subject-');
    
    return {
      name: `${defaultSubject.name} ${id.slice(-4)}`,
      nameEn: `${defaultSubject.nameEn} ${id.slice(-4)}`,
      nameFr: `${defaultSubject.nameFr} ${id.slice(-4)}`,
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const subjectData = this.build(overrides);
    return await this.prisma.subject.create({ data: subjectData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const subjects = [];
    for (let i = 0; i < count; i++) {
      subjects.push(await this.create({
        ...overrides,
        name: `Test Subject ${i + 1}`,
      }));
    }
    return subjects;
  }

  async createFromFixture(fixtureId: string, overrides: any = {}): Promise<any> {
    const fixture = subjectsData.find(s => s.id === fixtureId);
    if (!fixture) {
      throw new Error(`Subject fixture with id '${fixtureId}' not found`);
    }
    
    const { id, ...subjectData } = fixture;
    return await this.create({ ...subjectData, ...overrides });
  }
}

/**
 * Student Factory
 */
export class StudentFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('student-');
    const defaultStudent = studentsData[0];
    
    return {
      firstName: `TestFirst${id.slice(-4)}`,
      lastName: `TestLast${id.slice(-4)}`,
      grade: defaultStudent.grade,
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const studentData = this.build(overrides);
    return await this.prisma.student.create({ data: studentData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const students = [];
    for (let i = 0; i < count; i++) {
      students.push(await this.create({
        ...overrides,
        firstName: `Student${i + 1}`,
        lastName: `TestLast${i + 1}`,
      }));
    }
    return students;
  }

  async createFromFixture(fixtureId: string, overrides: any = {}): Promise<any> {
    const fixture = studentsData.find(s => s.id === fixtureId);
    if (!fixture) {
      throw new Error(`Student fixture with id '${fixtureId}' not found`);
    }
    
    const { id, ...studentData } = fixture;
    return await this.create({ ...studentData, ...overrides });
  }
}

/**
 * Curriculum Expectation Factory
 */
export class CurriculumExpectationFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('exp-');
    const defaultExp = expectationsData[0];
    
    return {
      code: `TEST-${id.slice(-6).toUpperCase()}`,
      description: `Test expectation ${id.slice(-4)}`,
      strand: defaultExp.strand,
      substrand: defaultExp.substrand,
      grade: defaultExp.grade,
      subject: defaultExp.subject,
      descriptionFr: `Attente de test ${id.slice(-4)}`,
      strandFr: defaultExp.strandFr,
      substrandFr: defaultExp.substrandFr,
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const expectationData = this.build(overrides);
    return await this.prisma.curriculumExpectation.create({ data: expectationData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const expectations = [];
    for (let i = 0; i < count; i++) {
      expectations.push(await this.create({
        ...overrides,
        code: `TEST-BULK-${i.toString().padStart(3, '0')}`,
        description: `Test expectation ${i + 1}`,
      }));
    }
    return expectations;
  }

  async createFromFixture(fixtureId: string, overrides: any = {}): Promise<any> {
    const fixture = expectationsData.find(e => e.id === fixtureId);
    if (!fixture) {
      throw new Error(`Curriculum expectation fixture with id '${fixtureId}' not found`);
    }
    
    const { id, ...expectationData } = fixture;
    return await this.create({ ...expectationData, ...overrides });
  }
}

/**
 * Long Range Plan Factory
 */
export class LongRangePlanFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('lrp-');
    const dates = generateTestDates();
    
    return {
      title: `Test Long Range Plan ${id.slice(-4)}`,
      academicYear: `${dates.academicYearStart.getFullYear()}-${dates.academicYearEnd.getFullYear()}`,
      term: 'Full Year',
      grade: 3,
      subject: 'Mathematics',
      description: `Comprehensive year-long plan for test purposes ${id.slice(-4)}`,
      goals: 'Students will develop strong foundational skills in mathematics',
      themes: JSON.stringify(['Number Sense', 'Algebra', 'Geometry', 'Data Management']),
      overarchingQuestions: 'How do numbers help us understand our world?',
      assessmentOverview: 'Ongoing formative assessment with summative evaluations each term',
      resourceNeeds: 'Manipulatives, calculators, measurement tools',
      titleFr: `Plan à long terme de test ${id.slice(-4)}`,
      descriptionFr: `Plan complet d'une année à des fins de test ${id.slice(-4)}`,
      goalsFr: 'Les élèves développeront de solides compétences de base en mathématiques',
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const planData = this.build(overrides);
    return await this.prisma.longRangePlan.create({ data: planData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const plans = [];
    for (let i = 0; i < count; i++) {
      plans.push(await this.create({
        ...overrides,
        title: `Test Long Range Plan ${i + 1}`,
      }));
    }
    return plans;
  }
}

/**
 * Unit Plan Factory
 */
export class UnitPlanFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('unit-');
    const dates = generateTestDates();
    
    return {
      title: `Test Unit Plan ${id.slice(-4)}`,
      description: `Test unit description ${id.slice(-4)}`,
      bigIdeas: 'Numbers help us understand quantities and relationships',
      essentialQuestions: JSON.stringify([
        'How do we use numbers in everyday life?',
        'What patterns can we find in numbers?'
      ]),
      startDate: dates.currentDate,
      endDate: dates.oneMonthFromNow,
      estimatedHours: 20,
      titleFr: `Plan d'unité de test ${id.slice(-4)}`,
      descriptionFr: `Description d'unité de test ${id.slice(-4)}`,
      bigIdeasFr: 'Les nombres nous aident à comprendre les quantités et les relations',
      assessmentPlan: 'Formative assessments throughout, summative at end',
      successCriteria: JSON.stringify([
        'Students can count accurately',
        'Students recognize number patterns'
      ]),
      crossCurricularConnections: 'Language Arts (math vocabulary), Science (measurement)',
      learningSkills: JSON.stringify(['Organization', 'Independent Work']),
      keyVocabulary: JSON.stringify(['number', 'count', 'pattern', 'sequence']),
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const unitData = this.build(overrides);
    return await this.prisma.unitPlan.create({ data: unitData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const units = [];
    for (let i = 0; i < count; i++) {
      units.push(await this.create({
        ...overrides,
        title: `Test Unit Plan ${i + 1}`,
      }));
    }
    return units;
  }
}

/**
 * ETFO Lesson Plan Factory
 */
export class ETFOLessonPlanFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('lesson-');
    const dates = generateTestDates();
    
    return {
      title: `Test Lesson ${id.slice(-4)}`,
      date: dates.currentDate,
      duration: 60,
      grade: 3,
      subject: 'Mathematics',
      language: 'en',
      mindsOn: 'Students will review previous learning and discuss what they know about counting',
      action: 'Students will practice counting using manipulatives and complete counting exercises',
      consolidation: 'Students will share their counting strategies and reflect on their learning',
      learningGoals: 'Students will demonstrate accurate counting skills to 100',
      materials: JSON.stringify(['counting bears', 'number charts', 'worksheets']),
      grouping: 'whole class',
      titleFr: `Leçon de test ${id.slice(-4)}`,
      mindsOnFr: 'Les élèves réviseront les apprentissages précédents et discuteront de ce qu\'ils savent sur le comptage',
      actionFr: 'Les élèves pratiqueront le comptage en utilisant des manipulatifs et compléteront des exercices de comptage',
      consolidationFr: 'Les élèves partageront leurs stratégies de comptage et réfléchiront à leur apprentissage',
      learningGoalsFr: 'Les élèves démontreront des compétences de comptage précises jusqu\'à 100',
      accommodations: JSON.stringify(['visual supports', 'extra time']),
      modifications: JSON.stringify(['reduced numbers for some students']),
      extensions: JSON.stringify(['counting by 2s, 5s, 10s']),
      assessmentType: 'formative',
      assessmentNotes: 'Observe student counting accuracy and strategy use',
      isSubFriendly: true,
      subNotes: 'All materials are prepared and in the math bin',
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const lessonData = this.build(overrides);
    return await this.prisma.eTFOLessonPlan.create({ data: lessonData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const lessons = [];
    for (let i = 0; i < count; i++) {
      const lessonDate = new Date();
      lessonDate.setDate(lessonDate.getDate() + i);
      
      lessons.push(await this.create({
        ...overrides,
        title: `Test Lesson ${i + 1}`,
        date: lessonDate,
      }));
    }
    return lessons;
  }
}

/**
 * Daybook Entry Factory
 */
export class DaybookEntryFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('daybook-');
    const dates = generateTestDates();
    
    return {
      date: dates.currentDate,
      whatWorked: 'Students were engaged with the manipulatives and counting activities',
      whatDidntWork: 'Some students needed more scaffolding with larger numbers',
      nextSteps: 'Provide additional practice with tens and ones place value',
      studentEngagement: 'High - students were actively participating',
      studentChallenges: 'A few students struggled with counting beyond 50',
      studentSuccesses: 'Most students demonstrated accurate counting to 100',
      notes: `Reflection notes for test ${id.slice(-4)}`,
      privateNotes: `Private teaching notes ${id.slice(-4)}`,
      whatWorkedFr: 'Les élèves étaient engagés avec les manipulatifs et les activités de comptage',
      whatDidntWorkFr: 'Certains élèves avaient besoin de plus d\'étayage avec les nombres plus grands',
      nextStepsFr: 'Fournir une pratique supplémentaire avec la valeur de position des dizaines et des unités',
      notesFr: `Notes de réflexion pour le test ${id.slice(-4)}`,
      overallRating: 4,
      wouldReuseLesson: true,
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const daybookData = this.build(overrides);
    return await this.prisma.daybookEntry.create({ data: daybookData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const entries = [];
    for (let i = 0; i < count; i++) {
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() + i);
      
      entries.push(await this.create({
        ...overrides,
        date: entryDate,
      }));
    }
    return entries;
  }
}

/**
 * External Activity Factory
 */
export class ExternalActivityFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('ext-');
    const defaultActivity = activitiesData[0];
    
    return {
      externalId: `TEST-${id.slice(-6)}`,
      source: 'TEST',
      url: `https://test.example.com/activity/${id}`,
      title: `Test Activity ${id.slice(-4)}`,
      description: `Test activity description ${id.slice(-4)}`,
      duration: defaultActivity.duration,
      activityType: defaultActivity.activityType,
      gradeMin: defaultActivity.gradeMin,
      gradeMax: defaultActivity.gradeMax,
      subject: defaultActivity.subject,
      language: 'en',
      materials: JSON.stringify(defaultActivity.materials),
      groupSize: defaultActivity.groupSize,
      sourceRating: 4.0,
      sourceReviews: 10,
      curriculumTags: JSON.stringify(['TEST-TAG']),
      learningGoals: JSON.stringify(['Test learning goal']),
      isFree: true,
      license: 'Test License',
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const activityData = this.build(overrides);
    return await this.prisma.externalActivity.create({ data: activityData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const activities = [];
    for (let i = 0; i < count; i++) {
      activities.push(await this.create({
        ...overrides,
        title: `Test Activity ${i + 1}`,
        externalId: `TEST-BULK-${i.toString().padStart(3, '0')}`,
      }));
    }
    return activities;
  }

  async createFromFixture(fixtureId: string, overrides: any = {}): Promise<any> {
    const fixture = activitiesData.find(a => a.id === fixtureId);
    if (!fixture) {
      throw new Error(`External activity fixture with id '${fixtureId}' not found`);
    }
    
    const { id, ...activityData } = fixture;
    return await this.create({
      ...activityData,
      materials: JSON.stringify(activityData.materials),
      technology: activityData.technology ? JSON.stringify(activityData.technology) : null,
      curriculumTags: JSON.stringify(activityData.curriculumTags),
      learningGoals: JSON.stringify(activityData.learningGoals),
      ...overrides,
    });
  }
}

/**
 * Calendar Event Factory
 */
export class CalendarEventFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('event-');
    const dates = generateTestDates();
    const defaultEvent = eventsData[0];
    
    return {
      title: `Test Event ${id.slice(-4)}`,
      description: `Test event description ${id.slice(-4)}`,
      start: dates.currentDate,
      end: dates.oneWeekFromNow,
      allDay: defaultEvent.allDay,
      eventType: defaultEvent.eventType,
      source: 'MANUAL',
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const eventData = this.build(overrides);
    return await this.prisma.calendarEvent.create({ data: eventData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const events = [];
    for (let i = 0; i < count; i++) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + i);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 1);
      
      events.push(await this.create({
        ...overrides,
        title: `Test Event ${i + 1}`,
        start: eventDate,
        end: endDate,
      }));
    }
    return events;
  }

  async createFromFixture(fixtureId: string, overrides: any = {}): Promise<any> {
    const fixture = eventsData.find(e => e.id === fixtureId);
    if (!fixture) {
      throw new Error(`Calendar event fixture with id '${fixtureId}' not found`);
    }
    
    const { id, ...eventData } = fixture;
    return await this.create({
      ...eventData,
      start: new Date(eventData.start),
      end: new Date(eventData.end),
      ...overrides,
    });
  }
}

/**
 * Class Routine Factory
 */
export class ClassRoutineFactory implements BaseFactory<any> {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  build(overrides: any = {}): any {
    const id = generateTestId('routine-');
    const defaultRoutine = routinesData[0];
    
    return {
      title: `Test Routine ${id.slice(-4)}`,
      description: `Test routine description ${id.slice(-4)}`,
      category: defaultRoutine.category,
      timeOfDay: defaultRoutine.timeOfDay,
      priority: defaultRoutine.priority,
      isActive: true,
      ...overrides,
    };
  }

  async create(overrides: any = {}): Promise<any> {
    const routineData = this.build(overrides);
    return await this.prisma.classRoutine.create({ data: routineData });
  }

  async createMany(count: number, overrides: any = {}): Promise<any[]> {
    const routines = [];
    for (let i = 0; i < count; i++) {
      routines.push(await this.create({
        ...overrides,
        title: `Test Routine ${i + 1}`,
        priority: i + 1,
      }));
    }
    return routines;
  }

  async createFromFixture(fixtureId: string, overrides: any = {}): Promise<any> {
    const fixture = routinesData.find(r => r.id === fixtureId);
    if (!fixture) {
      throw new Error(`Class routine fixture with id '${fixtureId}' not found`);
    }
    
    const { id, ...routineData } = fixture;
    return await this.create({ ...routineData, ...overrides });
  }
}

/**
 * Export factory instances for easy use
 */
export const modernFactories = {
  user: new UserFactory(),
  subject: new SubjectFactory(),
  student: new StudentFactory(),
  curriculumExpectation: new CurriculumExpectationFactory(),
  longRangePlan: new LongRangePlanFactory(),
  unitPlan: new UnitPlanFactory(),
  etfoLessonPlan: new ETFOLessonPlanFactory(),
  daybookEntry: new DaybookEntryFactory(),
  externalActivity: new ExternalActivityFactory(),
  calendarEvent: new CalendarEventFactory(),
  classRoutine: new ClassRoutineFactory(),
};

/**
 * Utility functions for common test scenarios
 */
export const testScenarios = {
  /**
   * Create a complete ETFO planning hierarchy
   */
  async createPlanningHierarchy(options: {
    userId?: number;
    grade?: number;
    subject?: string;
    expectationCount?: number;
    unitCount?: number;
    lessonCount?: number;
  } = {}): Promise<any> {
    const {
      userId,
      grade = 3,
      subject = 'Mathematics',
      expectationCount = 3,
      unitCount = 2,
      lessonCount = 5,
    } = options;

    // Create curriculum expectations
    const expectations = await modernFactories.curriculumExpectation.createMany(expectationCount, {
      grade,
      subject,
    });

    // Create long range plan
    const longRangePlan = await modernFactories.longRangePlan.create({
      userId,
      grade,
      subject,
    });

    // Link expectations to long range plan
    for (const expectation of expectations) {
      await getTestPrismaClient().longRangePlanExpectation.create({
        data: {
          longRangePlanId: longRangePlan.id,
          expectationId: expectation.id,
        },
      });
    }

    // Create unit plans
    const unitPlans = await modernFactories.unitPlan.createMany(unitCount, {
      userId,
      longRangePlanId: longRangePlan.id,
    });

    // Link expectations to unit plans
    for (const unit of unitPlans) {
      for (const expectation of expectations.slice(0, Math.ceil(expectations.length / unitCount))) {
        await getTestPrismaClient().unitPlanExpectation.create({
          data: {
            unitPlanId: unit.id,
            expectationId: expectation.id,
          },
        });
      }
    }

    // Create lesson plans
    const lessonPlans = [];
    for (const unit of unitPlans) {
      const lessonsPerUnit = Math.ceil(lessonCount / unitCount);
      const unitLessons = await modernFactories.etfoLessonPlan.createMany(lessonsPerUnit, {
        userId,
        unitPlanId: unit.id,
        grade,
        subject,
      });
      lessonPlans.push(...unitLessons);
    }

    // Create daybook entries for some lessons
    const daybookEntries = [];
    for (let i = 0; i < Math.min(3, lessonPlans.length); i++) {
      const entry = await modernFactories.daybookEntry.create({
        userId,
        lessonPlanId: lessonPlans[i].id,
      });
      daybookEntries.push(entry);
    }

    return {
      expectations,
      longRangePlan,
      unitPlans,
      lessonPlans,
      daybookEntries,
    };
  },

  /**
   * Create a classroom with students and basic setup
   */
  async createClassroom(options: {
    teacherId?: number;
    grade?: number;
    studentCount?: number;
    subjectCount?: number;
  } = {}): Promise<any> {
    const {
      teacherId,
      grade = 3,
      studentCount = 5,
      subjectCount = 3,
    } = options;

    // Create students
    const students = await modernFactories.student.createMany(studentCount, {
      userId: teacherId,
      grade,
    });

    // Create subjects
    const subjects = await modernFactories.subject.createMany(subjectCount, {
      userId: teacherId,
    });

    // Create some class routines
    const routines = [];
    for (const fixtureId of ['morning-routine', 'transition-bathroom', 'behavior-attention']) {
      const routine = await modernFactories.classRoutine.createFromFixture(fixtureId, {
        userId: teacherId,
      });
      routines.push(routine);
    }

    return {
      students,
      subjects,
      routines,
    };
  },

  /**
   * Create activity discovery data
   */
  async createActivityDiscovery(options: {
    userId?: number;
    activityCount?: number;
    collectionCount?: number;
  } = {}): Promise<any> {
    const {
      userId,
      activityCount = 4,
      collectionCount = 2,
    } = options;

    // Create external activities from fixtures
    const activities = [];
    for (const fixtureId of ['tpt-activity-1', 'oer-activity-1', 'khan-activity-1', 'tpt-french-1'].slice(0, activityCount)) {
      const activity = await modernFactories.externalActivity.createFromFixture(fixtureId);
      activities.push(activity);
    }

    // Create activity collections
    const collections = [];
    for (let i = 0; i < collectionCount; i++) {
      const collection = await getTestPrismaClient().activityCollection.create({
        data: {
          userId: userId!,
          name: `Test Collection ${i + 1}`,
          description: `Test collection description ${i + 1}`,
          isPublic: i === 0, // Make first collection public
        },
      });
      collections.push(collection);

      // Add activities to collections
      const activitiesToAdd = activities.slice(0, Math.ceil(activities.length / collectionCount));
      for (const activity of activitiesToAdd) {
        await getTestPrismaClient().activityCollectionItem.create({
          data: {
            collectionId: collection.id,
            activityId: activity.id,
          },
        });
      }
    }

    return {
      activities,
      collections,
    };
  },
};