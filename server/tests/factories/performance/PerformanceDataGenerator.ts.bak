/**
 * PerformanceDataGenerator - Creates large-scale test data for performance testing
 * 
 * Generates realistic data volumes for:
 * - Load testing
 * - Stress testing
 * - Database optimization
 * - Query performance analysis
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { UserFactory } from '../domain/UserFactory';
import { CurriculumFactory } from '../domain/CurriculumFactory';
import { LessonPlanFactory } from '../domain/LessonPlanFactory';
import { UnitPlanFactory } from '../domain/UnitPlanFactory';
import { LongRangePlanFactory } from '../domain/LongRangePlanFactory';
import { DaybookFactory } from '../domain/DaybookFactory';

interface PerformanceMetrics {
  startTime: Date;
  endTime: Date;
  totalRecords: number;
  recordsPerSecond: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export class PerformanceDataGenerator {
  private prisma: PrismaClient;
  private batchSize = 100;
  private metrics: PerformanceMetrics[] = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generate school board scale data
   * Simulates a small school board with multiple schools
   */
  async generateSchoolBoardData(options?: {
    numberOfSchools?: number;
    teachersPerSchool?: number;
    yearsOfData?: number;
  }) {
    const schools = options?.numberOfSchools || 10;
    const teachersPerSchool = options?.teachersPerSchool || 30;
    const yearsOfData = options?.yearsOfData || 3;

    console.log(`Generating data for ${schools} schools...`);
    const startTime = new Date();

    for (let schoolIdx = 0; schoolIdx < schools; schoolIdx++) {
      console.log(`Generating School ${schoolIdx + 1}/${schools}`);
      
      await this.generateSchoolData({
        schoolName: `School ${schoolIdx + 1}`,
        numberOfTeachers: teachersPerSchool,
        yearsOfData,
      });
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`School board data generation completed in ${duration / 1000}s`);
    return this.getMetricsSummary();
  }

  /**
   * Generate single school data
   */
  async generateSchoolData(options: {
    schoolName: string;
    numberOfTeachers: number;
    yearsOfData: number;
  }) {
    const startTime = new Date();
    const teachers: any[] = [];
    
    // Create teachers in batches
    for (let i = 0; i < options.numberOfTeachers; i += this.batchSize) {
      const batchSize = Math.min(this.batchSize, options.numberOfTeachers - i);
      const batch = await this.createTeacherBatch(batchSize, options.schoolName);
      teachers.push(...batch);
      
      // Progress update
      if (i % 100 === 0) {
        console.log(`  Created ${i + batchSize}/${options.numberOfTeachers} teachers`);
      }
    }

    // Generate curriculum data
    const curriculum = await this.generateCurriculumData();

    // Generate planning data for each teacher
    for (let teacherIdx = 0; teacherIdx < teachers.length; teacherIdx++) {
      const teacher = teachers[teacherIdx];
      
      // Generate data for each year
      for (let year = 0; year < options.yearsOfData; year++) {
        await this.generateTeacherYearData(teacher, year, curriculum);
      }

      // Progress update
      if (teacherIdx % 10 === 0) {
        console.log(`  Generated data for ${teacherIdx + 1}/${teachers.length} teachers`);
      }
    }

    const endTime = new Date();
    this.recordMetrics(startTime, endTime, options.numberOfTeachers);
  }

  /**
   * Create a batch of teachers
   */
  private async createTeacherBatch(count: number, schoolName: string): Promise<any[]> {
    const teachers = [];
    
    for (let i = 0; i < count; i++) {
      const teacher = await this.prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: '$2a$10$dummyhash', // Pre-hashed for performance
          name: faker.person.fullName(),
          role: 'teacher',
          preferredLanguage: faker.helpers.arrayElement(['en', 'fr']),
        },
      });
      
      teachers.push({
        ...teacher,
        school: schoolName,
        grade: faker.number.int({ min: 1, max: 8 }),
        subjects: this.generateSubjectList(),
      });
    }

    return teachers;
  }

  /**
   * Generate curriculum data (shared across school)
   */
  private async generateCurriculumData() {
    console.log('  Generating curriculum data...');
    const expectations = [];
    const subjects = ['Mathematics', 'Language', 'Science', 'Social Studies'];
    
    for (const subject of subjects) {
      for (let grade = 1; grade <= 8; grade++) {
        const gradeExpectations = await this.createCurriculumExpectationBatch({
          subject,
          grade,
          count: 50, // 50 expectations per grade per subject
        });
        expectations.push(...gradeExpectations);
      }
    }

    console.log(`  Created ${expectations.length} curriculum expectations`);
    return expectations;
  }

  /**
   * Create batch of curriculum expectations
   */
  private async createCurriculumExpectationBatch(options: {
    subject: string;
    grade: number;
    count: number;
  }) {
    const expectations = [];
    const strands = this.getSubjectStrands(options.subject);

    for (let i = 0; i < options.count; i++) {
      const strand = faker.helpers.arrayElement(strands);
      const expectation = await this.prisma.curriculumExpectation.create({
        data: {
          code: `${options.grade}.${strand.code}.${i + 1}`,
          description: `${faker.helpers.arrayElement([
            'demonstrate understanding of',
            'investigate and describe',
            'apply knowledge of',
            'analyze and evaluate',
          ])} ${strand.topic}`,
          strand: strand.name,
          grade: options.grade,
          subject: options.subject,
        },
      });
      expectations.push(expectation);
    }

    return expectations;
  }

  /**
   * Generate a teacher's year of data
   */
  private async generateTeacherYearData(teacher: any, yearOffset: number, curriculum: any[]) {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear - yearOffset - 1}-${currentYear - yearOffset}`;
    
    // Create long-range plans
    const longRangePlans = await this.createLongRangePlanBatch({
      userId: teacher.id,
      academicYear,
      grade: teacher.grade,
      subjects: teacher.subjects,
    });

    // Create unit plans (3-5 per subject)
    for (const lrp of longRangePlans) {
      const unitCount = faker.number.int({ min: 3, max: 5 });
      const units = await this.createUnitPlanBatch({
        userId: teacher.id,
        longRangePlanId: lrp.id,
        count: unitCount,
        yearOffset,
      });

      // Create lessons for each unit (15-25 per unit)
      for (const unit of units) {
        const lessonCount = faker.number.int({ min: 15, max: 25 });
        await this.createLessonPlanBatch({
          userId: teacher.id,
          unitPlanId: unit.id,
          count: lessonCount,
          startDate: unit.startDate,
        });
      }
    }

    // Create daybook entries (180 school days)
    await this.createDaybookBatch({
      userId: teacher.id,
      yearOffset,
      count: 180,
    });
  }

  /**
   * Create batch of long-range plans
   */
  private async createLongRangePlanBatch(options: {
    userId: number;
    academicYear: string;
    grade: number;
    subjects: string[];
  }) {
    const plans = [];

    for (const subject of options.subjects) {
      const plan = await this.prisma.longRangePlan.create({
        data: {
          userId: options.userId,
          title: `Grade ${options.grade} ${subject} - ${options.academicYear}`,
          academicYear: options.academicYear,
          term: 'Full Year',
          grade: options.grade,
          subject,
          goals: faker.lorem.paragraphs(2),
          themes: [faker.lorem.words(3), faker.lorem.words(3), faker.lorem.words(3)],
        },
      });
      plans.push(plan);
    }

    return plans;
  }

  /**
   * Create batch of unit plans
   */
  private async createUnitPlanBatch(options: {
    userId: number;
    longRangePlanId: string;
    count: number;
    yearOffset: number;
  }) {
    const units = [];
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() - options.yearOffset);
    baseDate.setMonth(8); // September

    for (let i = 0; i < options.count; i++) {
      const startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() + (i * 35)); // ~5 weeks per unit
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 28); // 4 weeks duration

      const unit = await this.prisma.unitPlan.create({
        data: {
          userId: options.userId,
          title: faker.lorem.words(4),
          longRangePlanId: options.longRangePlanId,
          description: faker.lorem.paragraph(),
          bigIdeas: faker.lorem.sentences(3),
          essentialQuestions: [
            faker.lorem.sentence().replace('.', '?'),
            faker.lorem.sentence().replace('.', '?'),
          ],
          startDate,
          endDate,
          estimatedHours: faker.number.int({ min: 20, max: 40 }),
        },
      });
      units.push(unit);
    }

    return units;
  }

  /**
   * Create batch of lesson plans
   */
  private async createLessonPlanBatch(options: {
    userId: number;
    unitPlanId: string;
    count: number;
    startDate: Date;
  }) {
    const lessons = [];
    const currentDate = new Date(options.startDate);

    for (let i = 0; i < options.count; i++) {
      // Skip weekends
      while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const lesson = await this.prisma.eTFOLessonPlan.create({
        data: {
          userId: options.userId,
          title: faker.lorem.words(5),
          unitPlanId: options.unitPlanId,
          date: new Date(currentDate),
          duration: faker.helpers.arrayElement([30, 40, 50, 60]),
          mindsOn: faker.lorem.sentence(),
          action: faker.lorem.paragraph(),
          consolidation: faker.lorem.sentence(),
          learningGoals: faker.lorem.sentence(),
          materials: [faker.commerce.productName(), faker.commerce.productName()],
          grouping: faker.helpers.arrayElement(['whole class', 'small group', 'pairs', 'individual']),
          isSubFriendly: faker.datatype.boolean({ probability: 0.7 }),
        },
      });
      
      lessons.push(lesson);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return lessons;
  }

  /**
   * Create batch of daybook entries
   */
  private async createDaybookBatch(options: {
    userId: number;
    yearOffset: number;
    count: number;
  }) {
    const entries = [];
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() - options.yearOffset);
    baseDate.setMonth(8); // September
    
    const currentDate = new Date(baseDate);

    for (let i = 0; i < options.count; i++) {
      // Skip weekends
      while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const entry = await this.prisma.daybookEntry.create({
        data: {
          userId: options.userId,
          date: new Date(currentDate),
          quickNotes: faker.lorem.sentence(),
          observations: faker.lorem.sentences(2),
          whatWorkedWell: faker.lorem.words(5),
          whatToImprove: faker.lorem.words(5),
          teacherMood: faker.helpers.arrayElement(['great', 'good', 'okay', 'tired', 'stressed']),
          classEnergy: faker.helpers.arrayElement(['high', 'engaged', 'typical', 'low', 'challenging']),
        },
      });
      
      entries.push(entry);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
  }

  /**
   * Generate stress test data
   * Creates maximum load for testing system limits
   */
  async generateStressTestData(options?: {
    targetRecords?: number;
    concurrentUsers?: number;
  }) {
    const targetRecords = options?.targetRecords || 1000000;
    const concurrentUsers = options?.concurrentUsers || 100;

    console.log(`Starting stress test: ${targetRecords} records, ${concurrentUsers} concurrent users`);
    
    const promises = [];
    const recordsPerUser = Math.floor(targetRecords / concurrentUsers);

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.generateUserLoadData(recordsPerUser));
    }

    const startTime = new Date();
    await Promise.all(promises);
    const endTime = new Date();

    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`Stress test completed in ${duration}s`);
    console.log(`Records per second: ${targetRecords / duration}`);

    return this.getMetricsSummary();
  }

  /**
   * Generate load for a single user
   */
  private async generateUserLoadData(recordCount: number) {
    const user = await this.prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: '$2a$10$dummyhash',
        name: faker.person.fullName(),
        role: 'teacher',
      },
    });

    // Create records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < recordCount; i += batchSize) {
      const currentBatch = Math.min(batchSize, recordCount - i);
      
      // Create mixed record types
      await Promise.all([
        this.createQuickLessonBatch(user.id, Math.floor(currentBatch / 3)),
        this.createQuickDaybookBatch(user.id, Math.floor(currentBatch / 3)),
        this.createQuickUnitBatch(user.id, Math.floor(currentBatch / 3)),
      ]);
    }
  }

  /**
   * Quick creation methods for stress testing
   */
  private async createQuickLessonBatch(userId: number, count: number) {
    const data = Array.from({ length: count }, () => ({
      userId,
      title: faker.lorem.words(3),
      unitPlanId: faker.string.uuid(),
      date: faker.date.recent(),
      duration: 60,
    }));

    await this.prisma.eTFOLessonPlan.createMany({ data });
  }

  private async createQuickDaybookBatch(userId: number, count: number) {
    const data = Array.from({ length: count }, () => ({
      userId,
      date: faker.date.recent(),
      quickNotes: faker.lorem.sentence(),
      teacherMood: 'good',
      classEnergy: 'typical',
    }));

    await this.prisma.daybookEntry.createMany({ data });
  }

  private async createQuickUnitBatch(userId: number, count: number) {
    const data = Array.from({ length: count }, () => ({
      userId,
      title: faker.lorem.words(3),
      longRangePlanId: faker.string.uuid(),
      startDate: faker.date.recent(),
      endDate: faker.date.soon(),
    }));

    await this.prisma.unitPlan.createMany({ data });
  }

  /**
   * Generate query performance test data
   * Creates specific data patterns for testing query optimization
   */
  async generateQueryPerformanceData() {
    console.log('Generating query performance test data...');

    // Create hierarchical data with known patterns
    const teacher = await this.prisma.user.create({
      data: {
        email: 'perf.test@school.ca',
        password: '$2a$10$dummyhash',
        name: 'Performance Test Teacher',
        role: 'teacher',
      },
    });

    // Create deep nesting scenario
    const lrp = await this.prisma.longRangePlan.create({
      data: {
        userId: teacher.id,
        title: 'Performance Test Plan',
        academicYear: '2024-2025',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    // Create 50 units
    console.log('Creating units...');
    for (let i = 0; i < 50; i++) {
      const unit = await this.prisma.unitPlan.create({
        data: {
          userId: teacher.id,
          title: `Unit ${i + 1}`,
          longRangePlanId: lrp.id,
          startDate: new Date(2024, 0, 1 + i * 7),
          endDate: new Date(2024, 0, 7 + i * 7),
        },
      });

      // Create 100 lessons per unit
      const lessonData = Array.from({ length: 100 }, (_, j) => ({
        userId: teacher.id,
        title: `Lesson ${i + 1}-${j + 1}`,
        unitPlanId: unit.id,
        date: new Date(2024, 0, 1 + i * 7 + Math.floor(j / 20)),
        duration: 60,
      }));

      await this.prisma.eTFOLessonPlan.createMany({ data: lessonData });
    }

    // Create search test data
    console.log('Creating search test data...');
    const searchTerms = ['problem solving', 'fractions', 'geometry', 'measurement', 'patterns'];
    
    for (const term of searchTerms) {
      // Create 1000 lessons with each search term
      const searchData = Array.from({ length: 1000 }, (_, i) => ({
        userId: teacher.id,
        title: `${term} Lesson ${i + 1}`,
        unitPlanId: faker.string.uuid(),
        date: faker.date.recent(),
        duration: 60,
        action: `This lesson focuses on ${term} through hands-on activities`,
      }));

      await this.prisma.eTFOLessonPlan.createMany({ data: searchData });
    }

    console.log('Query performance test data generation complete');
    return {
      teacherId: teacher.id,
      searchTerms,
      totalLessons: 5000 + 5000, // 50 units * 100 lessons + 5 terms * 1000 lessons
    };
  }

  /**
   * Helper methods
   */
  private generateSubjectList(): string[] {
    const core = ['Mathematics', 'Language'];
    const additional = faker.helpers.arrayElements(
      ['Science', 'Social Studies', 'French', 'Art', 'Music', 'Physical Education'],
      faker.number.int({ min: 2, max: 4 })
    );
    return [...core, ...additional];
  }

  private getSubjectStrands(subject: string) {
    const strands: Record<string, any[]> = {
      Mathematics: [
        { code: 'NS', name: 'Number Sense', topic: 'number operations and relationships' },
        { code: 'M', name: 'Measurement', topic: 'measuring and comparing quantities' },
        { code: 'G', name: 'Geometry', topic: 'geometric shapes and spatial relationships' },
        { code: 'PA', name: 'Patterning', topic: 'patterns and algebraic thinking' },
        { code: 'DM', name: 'Data', topic: 'data collection and analysis' },
      ],
      Language: [
        { code: 'OC', name: 'Oral Communication', topic: 'listening and speaking skills' },
        { code: 'R', name: 'Reading', topic: 'reading comprehension and strategies' },
        { code: 'W', name: 'Writing', topic: 'writing forms and techniques' },
        { code: 'ML', name: 'Media Literacy', topic: 'media analysis and creation' },
      ],
      Science: [
        { code: 'LS', name: 'Life Systems', topic: 'living things and environments' },
        { code: 'ME', name: 'Matter and Energy', topic: 'properties and changes in matter' },
        { code: 'SM', name: 'Structures', topic: 'structures and mechanisms' },
        { code: 'ES', name: 'Earth and Space', topic: 'Earth and space systems' },
      ],
    };

    return strands[subject] || strands.Mathematics;
  }

  private recordMetrics(startTime: Date, endTime: Date, recordCount: number) {
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    
    this.metrics.push({
      startTime,
      endTime,
      totalRecords: recordCount,
      recordsPerSecond: recordCount / duration,
      memoryUsage: process.memoryUsage(),
    });
  }

  private getMetricsSummary() {
    const totalRecords = this.metrics.reduce((sum, m) => sum + m.totalRecords, 0);
    const totalDuration = this.metrics.reduce((sum, m) => 
      sum + (m.endTime.getTime() - m.startTime.getTime()), 0
    ) / 1000;

    const avgRecordsPerSecond = totalRecords / totalDuration;
    const peakMemory = Math.max(...this.metrics.map(m => m.memoryUsage.heapUsed));

    return {
      totalRecords,
      totalDuration,
      avgRecordsPerSecond,
      peakMemoryMB: Math.round(peakMemory / 1024 / 1024),
      batches: this.metrics.length,
    };
  }

  /**
   * Clean up performance test data
   */
  async cleanup() {
    console.log('Cleaning up performance test data...');
    
    // Delete in correct order to respect foreign keys
    await this.prisma.daybookEntry.deleteMany({});
    await this.prisma.eTFOLessonPlan.deleteMany({});
    await this.prisma.unitPlan.deleteMany({});
    await this.prisma.longRangePlan.deleteMany({});
    await this.prisma.curriculumExpectation.deleteMany({});
    await this.prisma.user.deleteMany({ where: { email: { contains: '@school.ca' } } });
    
    console.log('Cleanup complete');
  }
}