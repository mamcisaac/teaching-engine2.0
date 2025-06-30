/**
 * Reusable Test Data Utilities
 * 
 * This file provides utility functions for test data management, cleanup,
 * validation, and common test patterns across the application.
 */

import { PrismaClient } from '@teaching-engine/database';
import { getTestPrismaClient } from '../jest.setup';
import { modernFactories } from './modern-factories';
import { builders } from './test-data-builders';
import { integrationSeeder, seedingUtils } from './integration-seeder';

/**
 * Test Data Manager - Centralized test data lifecycle management
 */
export class TestDataManager {
  private createdEntities: Map<string, any[]> = new Map();
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  /**
   * Track created entities for automatic cleanup
   */
  private track(entityType: string, entity: any): any {
    if (!this.createdEntities.has(entityType)) {
      this.createdEntities.set(entityType, []);
    }
    this.createdEntities.get(entityType)!.push(entity);
    return entity;
  }

  /**
   * Create and track a user
   */
  async createUser(overrides: any = {}): Promise<any> {
    const user = await modernFactories.user.create(overrides);
    return this.track('user', user);
  }

  /**
   * Create and track a student
   */
  async createStudent(overrides: any = {}): Promise<any> {
    const student = await modernFactories.student.create(overrides);
    return this.track('student', student);
  }

  /**
   * Create and track a curriculum expectation
   */
  async createExpectation(overrides: any = {}): Promise<any> {
    const expectation = await modernFactories.curriculumExpectation.create(overrides);
    return this.track('expectation', expectation);
  }

  /**
   * Create and track a lesson plan
   */
  async createLessonPlan(overrides: any = {}): Promise<any> {
    const lessonPlan = await modernFactories.etfoLessonPlan.create(overrides);
    return this.track('lessonPlan', lessonPlan);
  }

  /**
   * Create a complete classroom scenario
   */
  async createClassroom(options: {
    teacherName?: string;
    grade?: number;
    studentCount?: number;
    language?: 'en' | 'fr';
  } = {}): Promise<any> {
    const {
      teacherName = 'Test Teacher',
      grade = 3,
      studentCount = 5,
      language = 'en',
    } = options;

    const teacher = await this.createUser({
      name: teacherName,
      role: 'teacher',
      preferredLanguage: language,
      email: `${teacherName.toLowerCase().replace(' ', '.')}@test.com`,
    });

    const students = [];
    for (let i = 0; i < studentCount; i++) {
      const student = await this.createStudent({
        firstName: `Student${i + 1}`,
        lastName: 'TestLast',
        grade,
        userId: teacher.id,
      });
      students.push(student);
    }

    const subjects = [];
    for (const subjectId of ['math', 'english', 'science']) {
      const subject = await modernFactories.subject.createFromFixture(subjectId, {
        userId: teacher.id,
      });
      subjects.push(this.track('subject', subject));
    }

    return {
      teacher,
      students,
      subjects,
    };
  }

  /**
   * Create a complete planning hierarchy
   */
  async createPlanningHierarchy(teacherId: number, grade: number = 3): Promise<any> {
    // Create expectations
    const expectations = [];
    for (let i = 0; i < 3; i++) {
      const expectation = await this.createExpectation({
        code: `TEST-PLAN-${i + 1}`,
        subject: 'Mathematics',
        grade,
        description: `Test planning expectation ${i + 1}`,
      });
      expectations.push(expectation);
    }

    // Create long range plan
    const longRangePlan = await builders.longRangePlan()
      .withTitle('Test Planning Hierarchy')
      .forAcademicYear('2024-2025')
      .fullYear()
      .forGrade(grade)
      .forSubject('Mathematics')
      .forTeacher(teacherId)
      .create();
    this.track('longRangePlan', longRangePlan);

    // Link expectations
    for (const expectation of expectations) {
      await this.prisma.longRangePlanExpectation.create({
        data: {
          longRangePlanId: longRangePlan.id,
          expectationId: expectation.id,
        },
      });
    }

    // Create unit plan
    const unitPlan = await builders.unitPlan()
      .withTitle('Test Unit')
      .forLongRangePlan(longRangePlan.id)
      .forTeacher(teacherId)
      .withDuration(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      .create();
    this.track('unitPlan', unitPlan);

    // Create lesson plan
    const lessonPlan = await this.createLessonPlan({
      title: 'Test Lesson',
      unitPlanId: unitPlan.id,
      userId: teacherId,
      grade,
      subject: 'Mathematics',
    });

    return {
      expectations,
      longRangePlan,
      unitPlan,
      lessonPlan,
    };
  }

  /**
   * Get all created entities of a specific type
   */
  getCreatedEntities(entityType: string): any[] {
    return this.createdEntities.get(entityType) || [];
  }

  /**
   * Get all created entities
   */
  getAllCreatedEntities(): Map<string, any[]> {
    return this.createdEntities;
  }

  /**
   * Clean up all tracked entities
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up tracked test data...');
    
    // Delete in dependency order
    const deleteOrder = [
      'daybookEntry',
      'lessonPlan', 
      'unitPlan',
      'longRangePlan',
      'expectation',
      'student',
      'subject',
      'user',
    ];

    for (const entityType of deleteOrder) {
      const entities = this.createdEntities.get(entityType) || [];
      if (entities.length > 0) {
        console.log(`Deleting ${entities.length} ${entityType} entities...`);
        
        try {
          switch (entityType) {
            case 'user':
              await this.prisma.user.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
            case 'student':
              await this.prisma.student.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
            case 'subject':
              await this.prisma.subject.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
            case 'expectation':
              await this.prisma.curriculumExpectation.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
            case 'longRangePlan':
              await this.prisma.longRangePlan.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
            case 'unitPlan':
              await this.prisma.unitPlan.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
            case 'lessonPlan':
              await this.prisma.eTFOLessonPlan.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
            case 'daybookEntry':
              await this.prisma.daybookEntry.deleteMany({
                where: { id: { in: entities.map(e => e.id) } }
              });
              break;
          }
        } catch (error) {
          console.warn(`Warning: Could not delete ${entityType} entities:`, error);
        }
      }
    }

    this.createdEntities.clear();
    console.log('✅ Cleanup completed');
  }
}

/**
 * Test Data Validators - Validate test data consistency
 */
export class TestDataValidator {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  /**
   * Validate ETFO planning hierarchy integrity
   */
  async validatePlanningHierarchy(longRangePlanId: string): Promise<any> {
    const issues = [];

    // Check long range plan exists
    const longRangePlan = await this.prisma.longRangePlan.findUnique({
      where: { id: longRangePlanId },
      include: {
        expectations: true,
        unitPlans: {
          include: {
            expectations: true,
            lessonPlans: {
              include: {
                expectations: true,
                daybookEntry: true,
              },
            },
          },
        },
      },
    });

    if (!longRangePlan) {
      issues.push('Long range plan not found');
      return { valid: false, issues };
    }

    // Validate expectations are linked
    if (longRangePlan.expectations.length === 0) {
      issues.push('Long range plan has no linked curriculum expectations');
    }

    // Validate unit plans
    if (longRangePlan.unitPlans.length === 0) {
      issues.push('Long range plan has no unit plans');
    } else {
      for (const unit of longRangePlan.unitPlans) {
        if (unit.expectations.length === 0) {
          issues.push(`Unit plan "${unit.title}" has no linked expectations`);
        }

        if (unit.startDate >= unit.endDate) {
          issues.push(`Unit plan "${unit.title}" has invalid date range`);
        }

        // Validate lesson plans
        if (unit.lessonPlans.length === 0) {
          issues.push(`Unit plan "${unit.title}" has no lesson plans`);
        } else {
          for (const lesson of unit.lessonPlans) {
            if (!lesson.mindsOn || !lesson.action || !lesson.consolidation) {
              issues.push(`Lesson plan "${lesson.title}" is missing required three-part structure`);
            }

            if (lesson.expectations.length === 0) {
              issues.push(`Lesson plan "${lesson.title}" has no linked expectations`);
            }
          }
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      summary: {
        expectationCount: longRangePlan.expectations.length,
        unitCount: longRangePlan.unitPlans.length,
        lessonCount: longRangePlan.unitPlans.reduce((sum, unit) => sum + unit.lessonPlans.length, 0),
        daybookCount: longRangePlan.unitPlans.reduce((sum, unit) => 
          sum + unit.lessonPlans.filter(lesson => lesson.daybookEntry).length, 0
        ),
      },
    };
  }

  /**
   * Validate user data consistency
   */
  async validateUserData(userId: number): Promise<any> {
    const issues = [];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        students: true,
        subjects: true,
        longRangePlans: true,
        unitPlans: true,
        etfoLessonPlans: true,
        daybookEntries: true,
      },
    });

    if (!user) {
      issues.push('User not found');
      return { valid: false, issues };
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      issues.push('Invalid email format');
    }

    // Validate role
    if (!['teacher', 'admin'].includes(user.role)) {
      issues.push('Invalid user role');
    }

    // Validate language preference
    if (!['en', 'fr'].includes(user.preferredLanguage)) {
      issues.push('Invalid language preference');
    }

    // Check for orphaned data
    const orphanedLessons = user.etfoLessonPlans.filter(lesson => 
      !user.unitPlans.some(unit => unit.id === lesson.unitPlanId)
    );
    if (orphanedLessons.length > 0) {
      issues.push(`${orphanedLessons.length} lesson plans are not linked to valid unit plans`);
    }

    return {
      valid: issues.length === 0,
      issues,
      summary: {
        studentCount: user.students.length,
        subjectCount: user.subjects.length,
        planCount: user.longRangePlans.length,
        unitCount: user.unitPlans.length,
        lessonCount: user.etfoLessonPlans.length,
        daybookCount: user.daybookEntries.length,
      },
    };
  }
}

/**
 * Test Data Comparators - Compare and assert test data
 */
export class TestDataComparator {
  /**
   * Compare two lesson plans for equality (ignoring timestamps)
   */
  static compareLessonPlans(lesson1: any, lesson2: any): boolean {
    const fieldsToCompare = [
      'title', 'duration', 'grade', 'subject', 'language',
      'mindsOn', 'action', 'consolidation', 'learningGoals',
      'grouping', 'assessmentType', 'isSubFriendly'
    ];

    return fieldsToCompare.every(field => lesson1[field] === lesson2[field]);
  }

  /**
   * Compare curriculum expectations
   */
  static compareExpectations(exp1: any, exp2: any): boolean {
    return exp1.code === exp2.code &&
           exp1.description === exp2.description &&
           exp1.grade === exp2.grade &&
           exp1.subject === exp2.subject;
  }

  /**
   * Assert planning hierarchy completeness
   */
  static assertPlanningHierarchyComplete(hierarchy: any): void {
    if (!hierarchy.longRangePlan) {
      throw new Error('Planning hierarchy missing long range plan');
    }
    if (!hierarchy.unitPlans || hierarchy.unitPlans.length === 0) {
      throw new Error('Planning hierarchy missing unit plans');
    }
    if (!hierarchy.lessonPlans || hierarchy.lessonPlans.length === 0) {
      throw new Error('Planning hierarchy missing lesson plans');
    }
    if (!hierarchy.expectations || hierarchy.expectations.length === 0) {
      throw new Error('Planning hierarchy missing curriculum expectations');
    }
  }
}

/**
 * Test Data Generators - Generate specific test data patterns
 */
export class TestDataGenerator {
  constructor(private prisma: PrismaClient = getTestPrismaClient()) {}

  /**
   * Generate realistic student names
   */
  static generateStudentNames(count: number, language: 'en' | 'fr' = 'en'): Array<[string, string]> {
    const englishNames = [
      ['Emma', 'Johnson'], ['Liam', 'Chen'], ['Sophia', 'Williams'],
      ['Noah', 'Brown'], ['Olivia', 'Davis'], ['William', 'Miller'],
      ['Ava', 'Wilson'], ['James', 'Moore'], ['Isabella', 'Anderson'],
      ['Alexander', 'Taylor'], ['Mia', 'Thomas'], ['Benjamin', 'Jackson'],
    ];

    const frenchNames = [
      ['Gabriel', 'Dubois'], ['Camille', 'Martin'], ['Léo', 'Rousseau'],
      ['Chloé', 'Leroy'], ['Nathan', 'Moreau'], ['Amélie', 'Simon'],
      ['Louis', 'Bernard'], ['Emma', 'Petit'], ['Hugo', 'Durand'],
      ['Inès', 'Roux'], ['Arthur', 'Fontaine'], ['Manon', 'Chevalier'],
    ];

    const names = language === 'fr' ? frenchNames : englishNames;
    const result = [];

    for (let i = 0; i < count; i++) {
      const [firstName, lastName] = names[i % names.length];
      if (i >= names.length) {
        result.push([`${firstName}${Math.floor(i / names.length) + 1}`, lastName]);
      } else {
        result.push([firstName, lastName]);
      }
    }

    return result;
  }

  /**
   * Generate realistic lesson content based on subject and grade
   */
  static generateLessonContent(subject: string, grade: number, lessonNumber: number): any {
    const mathContent = {
      mindsOn: `Students will review counting strategies from previous lesson and discuss what they know about numbers to ${grade * 100}`,
      action: `Students will practice counting using manipulatives and number charts, working in pairs to complete counting exercises`,
      consolidation: `Students will share their counting strategies with the class and reflect on what they learned about number patterns`,
      learningGoals: `Students will demonstrate accurate counting skills and recognize number patterns to ${grade * 100}`,
      materials: ['counting manipulatives', 'number charts', 'worksheets', 'chart paper'],
    };

    const englishContent = {
      mindsOn: `Students will activate prior knowledge about reading strategies and preview today's text`,
      action: `Students will read assigned text using guided reading strategies, making connections and asking questions`,
      consolidation: `Students will discuss main ideas and share their connections with the class`,
      learningGoals: `Students will demonstrate comprehension of grade ${grade} level text using appropriate reading strategies`,
      materials: ['reading texts', 'graphic organizers', 'sticky notes', 'reading journals'],
    };

    const defaultContent = {
      mindsOn: `Students will connect to prior learning and set intentions for lesson ${lessonNumber}`,
      action: `Students will engage in hands-on learning activities related to ${subject.toLowerCase()}`,
      consolidation: `Students will reflect on their learning and share insights with peers`,
      learningGoals: `Students will demonstrate understanding of key ${subject.toLowerCase()} concepts`,
      materials: ['materials list', 'handouts', 'supplies'],
    };

    switch (subject.toLowerCase()) {
      case 'mathematics':
        return mathContent;
      case 'english language arts':
        return englishContent;
      default:
        return defaultContent;
    }
  }

  /**
   * Generate assessment rubric data
   */
  static generateAssessmentRubric(subject: string): any {
    return {
      criteria: [
        {
          name: 'Understanding',
          levels: ['Limited', 'Some', 'Good', 'Excellent'],
          descriptions: [
            'Shows limited understanding of concepts',
            'Shows some understanding with support',
            'Shows good understanding independently',
            'Shows excellent understanding and can extend learning'
          ]
        },
        {
          name: 'Application',
          levels: ['Limited', 'Some', 'Good', 'Excellent'],
          descriptions: [
            'Limited application of skills',
            'Some application with guidance',
            'Good application in familiar contexts',
            'Excellent application in new contexts'
          ]
        }
      ],
      subject,
      gradeRange: [1, 6],
    };
  }
}

/**
 * Export convenience instances and utilities
 */
export const testDataManager = new TestDataManager();
export const testDataValidator = new TestDataValidator();
export const testDataGenerator = new TestDataGenerator();

/**
 * Quick access utilities for common test patterns
 */
export const testUtils = {
  /**
   * Create a test teacher with basic setup
   */
  async createTestTeacher(name = 'Test Teacher', language: 'en' | 'fr' = 'en'): Promise<any> {
    return await testDataManager.createUser({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@test.edu`,
      role: 'teacher',
      preferredLanguage: language,
    });
  },

  /**
   * Create test students for a teacher
   */
  async createTestStudents(teacherId: number, count = 5, grade = 3): Promise<any[]> {
    const students = [];
    const names = TestDataGenerator.generateStudentNames(count);
    
    for (const [firstName, lastName] of names) {
      const student = await testDataManager.createStudent({
        firstName,
        lastName,
        grade,
        userId: teacherId,
      });
      students.push(student);
    }
    
    return students;
  },

  /**
   * Verify test database is clean
   */
  async verifyCleanDatabase(): Promise<boolean> {
    const prisma = getTestPrismaClient();
    
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.student.count(),
      prisma.longRangePlan.count(),
      prisma.unitPlan.count(),
      prisma.eTFOLessonPlan.count(),
    ]);
    
    return counts.every(count => count === 0);
  },

  /**
   * Create minimal test data for quick tests
   */
  async quickTestSetup(): Promise<any> {
    const teacher = await this.createTestTeacher();
    const students = await this.createTestStudents(teacher.id, 2);
    const subject = await modernFactories.subject.createFromFixture('math', {
      userId: teacher.id,
    });
    
    return { teacher, students, subject };
  },

  /**
   * Clean up test data manager
   */
  async cleanup(): Promise<void> {
    await testDataManager.cleanup();
  },
};