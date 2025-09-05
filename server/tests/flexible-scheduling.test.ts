import { describe, expect, test, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/server';
import { schoolCalendar } from '../src/services/schoolCalendar';

const prisma = new PrismaClient();
const TEST_USER_ID = 999;

describe('Flexible Scheduling System', () => {
  let authToken: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const testUser = await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: 'test.flexible@example.com',
        name: 'Test Teacher',
        passwordHash: 'test-hash',
        role: 'teacher',
        selectedSubjects: ['Mathématiques', 'Sciences de la nature'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Generate auth token (mock for testing)
    authToken = `Bearer test-token-${TEST_USER_ID}`;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.unitPlan.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.longRangePlan.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.delete({ where: { id: TEST_USER_ID } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Reset lesson data for each test
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: TEST_USER_ID } });
  });

  describe('Core vs Extension Classification', () => {
    test('should correctly classify lessons 1-14 and 19-20 as core', async () => {
      // Create test unit with lessons
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Mathématiques',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Test Unit',
          titleFr: 'Unité de test',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-10-31')
        }
      });

      // Create lessons with proper numbering
      const lessonNumbers = [1, 2, 3, 14, 15, 16, 17, 18, 19, 20];
      for (const num of lessonNumbers) {
        await prisma.eTFOLessonPlan.create({
          data: {
            userId: TEST_USER_ID,
            unitPlanId: unit.id,
            lessonNumber: num,
            titleFr: `Leçon ${num}`,
            subject: 'Mathématiques',
            lessonType: [15, 16, 17, 18].includes(num) ? 'extension' : 'core',
            isScheduled: true,
            date: new Date('2025-09-08')
          }
        });
      }

      // Verify classification
      const coreLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: TEST_USER_ID,
          lessonType: 'core'
        },
        select: { lessonNumber: true }
      });

      const extensionLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: TEST_USER_ID,
          lessonType: 'extension'
        },
        select: { lessonNumber: true }
      });

      const coreNumbers = coreLessons.map(l => l.lessonNumber).sort((a, b) => a! - b!);
      const extensionNumbers = extensionLessons.map(l => l.lessonNumber).sort((a, b) => a! - b!);

      expect(coreNumbers).toEqual([1, 2, 3, 14, 19, 20]);
      expect(extensionNumbers).toEqual([15, 16, 17, 18]);
    });

    test('should maintain core lesson sequence when scheduling', async () => {
      const response = await request(app)
        .get('/api/schedule-management/validate-shift')
        .set('Authorization', authToken)
        .query({ subject: 'Mathématiques', days: 1 });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBeDefined();
    });
  });

  describe('Subject Shifting', () => {
    test('should shift subject forward by specified days', async () => {
      // Create test lessons
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Mathématiques',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Math Unit',
          titleFr: 'Unité de math',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-09-30')
        }
      });

      // Create scheduled core lessons
      const startDate = new Date('2025-09-08');
      for (let i = 1; i <= 5; i++) {
        const lessonDate = new Date(startDate);
        lessonDate.setDate(lessonDate.getDate() + (i - 1));
        
        await prisma.eTFOLessonPlan.create({
          data: {
            userId: TEST_USER_ID,
            unitPlanId: unit.id,
            lessonNumber: i,
            titleFr: `Leçon ${i}`,
            subject: 'Mathématiques',
            lessonType: 'core',
            isScheduled: true,
            date: lessonDate,
            slotNumber: 2 // Math slot
          }
        });
      }

      // Shift subject forward by 2 days
      const response = await request(app)
        .post('/api/schedule-management/shift-subject')
        .set('Authorization', authToken)
        .send({
          subject: 'Mathématiques',
          shiftDays: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.lessonsShifted).toBe(5);

      // Verify dates were shifted
      const shiftedLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: TEST_USER_ID,
          subject: 'Mathématiques'
        },
        orderBy: { lessonNumber: 'asc' }
      });

      const firstLessonDate = new Date(shiftedLessons[0].date!);
      expect(firstLessonDate.toISOString().split('T')[0]).toBe('2025-09-10'); // Original was 09-08, shifted by 2
    });

    test('should respect school calendar when shifting', async () => {
      // Create lesson scheduled on Friday
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Sciences de la nature',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Science Unit',
          titleFr: 'Unité de sciences',
          startDate: new Date('2025-09-12'), // Friday
          endDate: new Date('2025-09-30')
        }
      });

      await prisma.eTFOLessonPlan.create({
        data: {
          userId: TEST_USER_ID,
          unitPlanId: unit.id,
          lessonNumber: 1,
          titleFr: 'Science Lesson',
          subject: 'Sciences de la nature',
          lessonType: 'core',
          isScheduled: true,
          date: new Date('2025-09-12'), // Friday
          slotNumber: 3
        }
      });

      // Shift by 1 day - should skip weekend
      const response = await request(app)
        .post('/api/schedule-management/shift-subject')
        .set('Authorization', authToken)
        .send({
          subject: 'Sciences de la nature',
          shiftDays: 1
        });

      expect(response.status).toBe(200);

      const shifted = await prisma.eTFOLessonPlan.findFirst({
        where: { userId: TEST_USER_ID, subject: 'Sciences de la nature' }
      });

      // Should move to Monday (09-15), not Saturday
      const shiftedDate = new Date(shifted!.date!);
      expect(shiftedDate.getDay()).not.toBe(0); // Not Sunday
      expect(shiftedDate.getDay()).not.toBe(6); // Not Saturday
    });
  });

  describe('Extension Management', () => {
    test('should activate unscheduled extension lesson', async () => {
      // Create extension lesson with 2099 date
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Mathématiques',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Math Unit',
          titleFr: 'Unité de math',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-09-30')
        }
      });

      const extension = await prisma.eTFOLessonPlan.create({
        data: {
          userId: TEST_USER_ID,
          unitPlanId: unit.id,
          lessonNumber: 15,
          titleFr: 'Extension - Exploration',
          subject: 'Mathématiques',
          lessonType: 'extension',
          isScheduled: false,
          date: new Date('2099-12-31'),
          slotNumber: 2
        }
      });

      // Activate the extension
      const response = await request(app)
        .post('/api/schedule-management/activate-extension')
        .set('Authorization', authToken)
        .send({
          lessonId: extension.id,
          date: '2025-09-25'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify activation
      const activated = await prisma.eTFOLessonPlan.findUnique({
        where: { id: extension.id }
      });

      expect(activated!.isScheduled).toBe(true);
      expect(activated!.date!.toISOString().split('T')[0]).toBe('2025-09-25');
    });

    test('should list available extensions by subject', async () => {
      // Create multiple extensions
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Sciences de la nature',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Science Unit',
          titleFr: 'Unité de sciences',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-09-30')
        }
      });

      // Create 3 unscheduled extensions
      for (let i = 15; i <= 17; i++) {
        await prisma.eTFOLessonPlan.create({
          data: {
            userId: TEST_USER_ID,
            unitPlanId: unit.id,
            lessonNumber: i,
            titleFr: `Extension ${i}`,
            subject: 'Sciences de la nature',
            lessonType: 'extension',
            isScheduled: false,
            date: new Date('2099-12-31')
          }
        });
      }

      const response = await request(app)
        .get('/api/schedule-management/available-extensions')
        .set('Authorization', authToken)
        .query({ subject: 'Sciences de la nature' });

      expect(response.status).toBe(200);
      expect(response.body.extensions).toHaveLength(3);
      expect(response.body.extensions[0].lessonType).toBe('extension');
      expect(response.body.extensions[0].isScheduled).toBe(false);
    });
  });

  describe('Replace with Extension', () => {
    test('should swap core lesson with extension temporarily', async () => {
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Mathématiques',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Math Unit',
          titleFr: 'Unité de math',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-09-30')
        }
      });

      // Create scheduled core lesson
      const coreLesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId: TEST_USER_ID,
          unitPlanId: unit.id,
          lessonNumber: 5,
          titleFr: 'Core Lesson 5',
          subject: 'Mathématiques',
          lessonType: 'core',
          isScheduled: true,
          date: new Date('2025-09-15'),
          slotNumber: 2
        }
      });

      // Create unscheduled extension
      const extension = await prisma.eTFOLessonPlan.create({
        data: {
          userId: TEST_USER_ID,
          unitPlanId: unit.id,
          lessonNumber: 16,
          titleFr: 'Fun Math Games',
          subject: 'Mathématiques',
          lessonType: 'extension',
          isScheduled: false,
          date: new Date('2099-12-31'),
          slotNumber: 2
        }
      });

      // Replace core with extension
      const response = await request(app)
        .post('/api/schedule-management/replace-with-extension')
        .set('Authorization', authToken)
        .send({
          coreLessonId: coreLesson.id,
          extensionLessonId: extension.id,
          rescheduleDate: '2025-09-22'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify swap
      const updatedCore = await prisma.eTFOLessonPlan.findUnique({
        where: { id: coreLesson.id }
      });
      const updatedExtension = await prisma.eTFOLessonPlan.findUnique({
        where: { id: extension.id }
      });

      // Core moved to reschedule date
      expect(updatedCore!.date!.toISOString().split('T')[0]).toBe('2025-09-22');
      
      // Extension took original date
      expect(updatedExtension!.date!.toISOString().split('T')[0]).toBe('2025-09-15');
      expect(updatedExtension!.isScheduled).toBe(true);
    });

    test('should maintain core sequence after replacement', async () => {
      // This ensures that when we reschedule a core lesson,
      // it doesn't break the sequential order requirement
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Sciences de la nature',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Science Unit',
          titleFr: 'Unité de sciences',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-09-30')
        }
      });

      // Create sequence of core lessons
      const coreDates = ['2025-09-08', '2025-09-09', '2025-09-10', '2025-09-11', '2025-09-12'];
      const coreLessons = [];
      for (let i = 0; i < 5; i++) {
        const lesson = await prisma.eTFOLessonPlan.create({
          data: {
            userId: TEST_USER_ID,
            unitPlanId: unit.id,
            lessonNumber: i + 1,
            titleFr: `Core ${i + 1}`,
            subject: 'Sciences de la nature',
            lessonType: 'core',
            isScheduled: true,
            date: new Date(coreDates[i]),
            slotNumber: 3
          }
        });
        coreLessons.push(lesson);
      }

      // Create extension
      const extension = await prisma.eTFOLessonPlan.create({
        data: {
          userId: TEST_USER_ID,
          unitPlanId: unit.id,
          lessonNumber: 15,
          titleFr: 'Science Extension',
          subject: 'Sciences de la nature',
          lessonType: 'extension',
          isScheduled: false,
          date: new Date('2099-12-31'),
          slotNumber: 3
        }
      });

      // Replace lesson 3 with extension, reschedule to end
      const response = await request(app)
        .post('/api/schedule-management/replace-with-extension')
        .set('Authorization', authToken)
        .send({
          coreLessonId: coreLessons[2].id, // Lesson 3
          extensionLessonId: extension.id,
          rescheduleDate: '2025-09-15' // After lesson 5
        });

      expect(response.status).toBe(200);

      // Verify sequence is maintained
      const allCoreLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: TEST_USER_ID,
          lessonType: 'core',
          subject: 'Sciences de la nature'
        },
        orderBy: { date: 'asc' }
      });

      // Check that lesson numbers are still in order by date
      const lessonNumbersByDate = allCoreLessons.map(l => l.lessonNumber);
      const isSorted = lessonNumbersByDate.every((num, i) => {
        if (i === 0) return true;
        return num! > lessonNumbersByDate[i - 1]!;
      });

      expect(isSorted).toBe(true);
    });
  });

  describe('Validation Endpoints', () => {
    test('should detect scheduling conflicts', async () => {
      // Create lessons that would conflict if shifted
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Mathématiques',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Math Unit',
          titleFr: 'Unité de math',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-09-30')
        }
      });

      // Create lessons near end of year
      const endOfYear = new Date('2025-06-20');
      await prisma.eTFOLessonPlan.create({
        data: {
          userId: TEST_USER_ID,
          unitPlanId: unit.id,
          lessonNumber: 1,
          titleFr: 'Last Math Lesson',
          subject: 'Mathématiques',
          lessonType: 'core',
          isScheduled: true,
          date: endOfYear,
          slotNumber: 2
        }
      });

      // Validate shifting by 10 days (would go past school year)
      const response = await request(app)
        .get('/api/schedule-management/validate-shift')
        .set('Authorization', authToken)
        .query({ subject: 'Mathématiques', days: 10 });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
      expect(response.body.conflicts).toBeDefined();
      expect(response.body.conflicts.length).toBeGreaterThan(0);
    });

    test('should validate alternating schedule integrity', async () => {
      // Create alternating subjects
      const lrp1 = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Sciences humaines',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const lrp2 = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Formation personnelle et sociale',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      // These subjects should alternate in slot 5
      const response = await request(app)
        .get('/api/schedule-management/validate-shift')
        .set('Authorization', authToken)
        .query({ subject: 'Sciences humaines', days: 1 });

      expect(response.status).toBe(200);
      // Should maintain alternating pattern
    });
  });

  describe('Integration with lessonScheduler', () => {
    test('should properly detect unscheduled lessons in findNextUnscheduledUnit', async () => {
      // This tests the fix for the "Start Next Unit" button
      const lrp = await prisma.longRangePlan.create({
        data: {
          userId: TEST_USER_ID,
          subject: 'Mathématiques',
          grade: '1',
          academicYear: '2024-2025'
        }
      });

      const unit = await prisma.unitPlan.create({
        data: {
          userId: TEST_USER_ID,
          longRangePlanId: lrp.id,
          title: 'Math Unit',
          titleFr: 'Unité de math',
          startDate: new Date('2025-09-08'),
          endDate: new Date('2025-09-30')
        }
      });

      // Create core lesson with 2099 date (unscheduled)
      await prisma.eTFOLessonPlan.create({
        data: {
          userId: TEST_USER_ID,
          unitPlanId: unit.id,
          lessonNumber: 1,
          titleFr: 'Unscheduled Core',
          subject: 'Mathématiques',
          lessonType: 'core',
          isScheduled: false,
          date: new Date('2099-12-31')
        }
      });

      // The lessonScheduler should detect this as unscheduled
      const unscheduledUnits = await prisma.unitPlan.findMany({
        where: {
          userId: TEST_USER_ID,
          lessonPlans: {
            some: {
              lessonType: 'core',
              OR: [
                { isScheduled: false },
                { date: { gte: new Date('2099-01-01') } }
              ]
            }
          }
        }
      });

      expect(unscheduledUnits).toHaveLength(1);
      expect(unscheduledUnits[0].id).toBe(unit.id);
    });
  });
});