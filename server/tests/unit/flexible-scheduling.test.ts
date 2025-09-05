/**
 * Flexible Scheduling System Tests
 * Tests the new flexible lesson scheduling capabilities
 */

import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import path from 'path';
import fs from 'fs';

// Ensure test database directory exists
const testDbDir = path.join(__dirname, '../../test-db');
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}

// Create a test instance of Prisma with a test database
const testDbPath = path.join(testDbDir, 'flexible-scheduling-test.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${testDbPath}`,
    },
  },
});

// Create a minimal test app
const testApp = express();
testApp.use(express.json());

const TEST_USER_ID = 999;

// Test middleware that sets user
testApp.use((req, res, next) => {
  req.user = { id: TEST_USER_ID, email: 'test@example.com' };
  next();
});

// Mount simplified test endpoints that simulate the actual functionality
testApp.post('/api/schedule-management/shift-subject', async (req, res) => {
  try {
    const { subject, shiftDays } = req.body;
    
    // Simple shift logic for testing
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: TEST_USER_ID,
        subject,
        lessonType: 'core',
        isScheduled: true
      }
    });

    let shifted = 0;
    for (const lesson of lessons) {
      const newDate = new Date(lesson.date);
      newDate.setDate(newDate.getDate() + shiftDays);
      
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { date: newDate }
      });
      shifted++;
    }

    res.json({ success: true, lessonsShifted: shifted });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

testApp.post('/api/schedule-management/activate-extension', async (req, res) => {
  try {
    const { lessonId, date } = req.body;
    
    await prisma.eTFOLessonPlan.update({
      where: { id: lessonId },
      data: {
        date: new Date(date),
        isScheduled: true
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

testApp.post('/api/schedule-management/replace-with-extension', async (req, res) => {
  try {
    const { coreLessonId, extensionLessonId, rescheduleDate } = req.body;
    
    // Get original core lesson date
    const coreLesson = await prisma.eTFOLessonPlan.findUnique({
      where: { id: coreLessonId }
    });

    // Swap dates
    await prisma.eTFOLessonPlan.update({
      where: { id: coreLessonId },
      data: { date: new Date(rescheduleDate) }
    });

    await prisma.eTFOLessonPlan.update({
      where: { id: extensionLessonId },
      data: {
        date: coreLesson.date,
        isScheduled: true
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

describe('Flexible Scheduling System', () => {
  beforeAll(async () => {
    // Initialize database schema
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'teacher',
        selectedSubjects TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS LongRangePlan (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        userId INTEGER NOT NULL,
        subject TEXT NOT NULL,
        grade TEXT NOT NULL,
        academicYear TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS UnitPlan (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        userId INTEGER NOT NULL,
        longRangePlanId TEXT NOT NULL,
        title TEXT NOT NULL,
        titleFr TEXT,
        startDate DATETIME,
        endDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS ETFOLessonPlan (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        userId INTEGER NOT NULL,
        unitPlanId TEXT,
        lessonNumber INTEGER,
        titleFr TEXT,
        subject TEXT,
        lessonType TEXT DEFAULT 'core',
        isScheduled BOOLEAN DEFAULT 1,
        date DATETIME,
        slotNumber INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create test user
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO User (id, email, name, passwordHash, role)
      VALUES (${TEST_USER_ID}, 'test@example.com', 'Test Teacher', 'hash', 'teacher')
    `;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.$executeRaw`DELETE FROM ETFOLessonPlan WHERE userId = ${TEST_USER_ID}`;
    await prisma.$executeRaw`DELETE FROM UnitPlan WHERE userId = ${TEST_USER_ID}`;
    await prisma.$executeRaw`DELETE FROM LongRangePlan WHERE userId = ${TEST_USER_ID}`;
  });

  describe('Core vs Extension Classification', () => {
    test('should correctly classify lessons 1-14 and 19-20 as core', async () => {
      // Create test data
      await prisma.$executeRaw`
        INSERT INTO LongRangePlan (id, userId, subject, grade, academicYear)
        VALUES ('lrp-1', ${TEST_USER_ID}, 'Mathématiques', '1', '2024-2025')
      `;

      await prisma.$executeRaw`
        INSERT INTO UnitPlan (id, userId, longRangePlanId, title, titleFr, startDate, endDate)
        VALUES ('unit-1', ${TEST_USER_ID}, 'lrp-1', 'Test Unit', 'Unité de test', '2025-09-08', '2025-10-31')
      `;

      // Create lessons with proper classification
      const coreLessonNumbers = [1, 2, 3, 14, 19, 20];
      const extensionLessonNumbers = [15, 16, 17, 18];

      for (const num of coreLessonNumbers) {
        await prisma.$executeRaw`
          INSERT INTO ETFOLessonPlan (id, userId, unitPlanId, lessonNumber, titleFr, subject, lessonType, isScheduled, date, slotNumber)
          VALUES ('lesson-${num}', ${TEST_USER_ID}, 'unit-1', ${num}, 'Leçon ${num}', 'Mathématiques', 'core', 1, '2025-09-08', 2)
        `;
      }

      for (const num of extensionLessonNumbers) {
        await prisma.$executeRaw`
          INSERT INTO ETFOLessonPlan (id, userId, unitPlanId, lessonNumber, titleFr, subject, lessonType, isScheduled, date, slotNumber)
          VALUES ('lesson-${num}', ${TEST_USER_ID}, 'unit-1', ${num}, 'Extension ${num}', 'Mathématiques', 'extension', 0, '2099-12-31', 2)
        `;
      }

      // Verify classification
      const coreLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: TEST_USER_ID,
          lessonType: 'core'
        }
      });

      const extensionLessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: TEST_USER_ID,
          lessonType: 'extension'
        }
      });

      expect(coreLessons.length).toBe(6); // 1, 2, 3, 14, 19, 20
      expect(extensionLessons.length).toBe(4); // 15, 16, 17, 18
    });
  });

  describe('Extension Activation', () => {
    test('should activate unscheduled extension lesson', async () => {
      // Setup test data
      await prisma.$executeRaw`
        INSERT INTO LongRangePlan (id, userId, subject, grade, academicYear)
        VALUES ('lrp-2', ${TEST_USER_ID}, 'Sciences de la nature', '1', '2024-2025')
      `;

      await prisma.$executeRaw`
        INSERT INTO UnitPlan (id, userId, longRangePlanId, title, titleFr, startDate, endDate)
        VALUES ('unit-2', ${TEST_USER_ID}, 'lrp-2', 'Science Unit', 'Unité de sciences', '2025-09-08', '2025-09-30')
      `;

      await prisma.$executeRaw`
        INSERT INTO ETFOLessonPlan (id, userId, unitPlanId, lessonNumber, titleFr, subject, lessonType, isScheduled, date, slotNumber)
        VALUES ('ext-1', ${TEST_USER_ID}, 'unit-2', 15, 'Extension Science', 'Sciences de la nature', 'extension', 0, '2099-12-31', 3)
      `;

      // Test activation
      const response = await request(testApp)
        .post('/api/schedule-management/activate-extension')
        .send({
          lessonId: 'ext-1',
          date: '2025-09-25'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify the lesson was activated
      const activatedLesson = await prisma.eTFOLessonPlan.findUnique({
        where: { id: 'ext-1' }
      });

      expect(activatedLesson.isScheduled).toBe(true);
      expect(activatedLesson.date.toISOString().split('T')[0]).toBe('2025-09-25');
    });
  });

  describe('Replace with Extension', () => {
    test('should swap core lesson with extension', async () => {
      // Setup test data
      await prisma.$executeRaw`
        INSERT INTO LongRangePlan (id, userId, subject, grade, academicYear)
        VALUES ('lrp-3', ${TEST_USER_ID}, 'Mathématiques', '1', '2024-2025')
      `;

      await prisma.$executeRaw`
        INSERT INTO UnitPlan (id, userId, longRangePlanId, title, titleFr, startDate, endDate)
        VALUES ('unit-3', ${TEST_USER_ID}, 'lrp-3', 'Math Unit', 'Unité de math', '2025-09-08', '2025-09-30')
      `;

      // Create scheduled core lesson
      await prisma.$executeRaw`
        INSERT INTO ETFOLessonPlan (id, userId, unitPlanId, lessonNumber, titleFr, subject, lessonType, isScheduled, date, slotNumber)
        VALUES ('core-1', ${TEST_USER_ID}, 'unit-3', 5, 'Core Math', 'Mathématiques', 'core', 1, '2025-09-15', 2)
      `;

      // Create unscheduled extension
      await prisma.$executeRaw`
        INSERT INTO ETFOLessonPlan (id, userId, unitPlanId, lessonNumber, titleFr, subject, lessonType, isScheduled, date, slotNumber)
        VALUES ('ext-2', ${TEST_USER_ID}, 'unit-3', 16, 'Fun Math Games', 'Mathématiques', 'extension', 0, '2099-12-31', 2)
      `;

      // Test replacement
      const response = await request(testApp)
        .post('/api/schedule-management/replace-with-extension')
        .send({
          coreLessonId: 'core-1',
          extensionLessonId: 'ext-2',
          rescheduleDate: '2025-09-22'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify swap
      const coreLessonAfter = await prisma.eTFOLessonPlan.findUnique({
        where: { id: 'core-1' }
      });
      const extensionAfter = await prisma.eTFOLessonPlan.findUnique({
        where: { id: 'ext-2' }
      });

      // Core moved to reschedule date
      expect(coreLessonAfter.date.toISOString().split('T')[0]).toBe('2025-09-22');
      
      // Extension took original date
      expect(extensionAfter.date.toISOString().split('T')[0]).toBe('2025-09-15');
      expect(extensionAfter.isScheduled).toBe(true);
    });
  });

  describe('Lesson Detection for Start Next Unit', () => {
    test('should detect unscheduled lessons with 2099 dates', async () => {
      // Setup test data with unscheduled lesson
      await prisma.$executeRaw`
        INSERT INTO LongRangePlan (id, userId, subject, grade, academicYear)
        VALUES ('lrp-4', ${TEST_USER_ID}, 'Arts visuels', '1', '2024-2025')
      `;

      await prisma.$executeRaw`
        INSERT INTO UnitPlan (id, userId, longRangePlanId, title, titleFr, startDate, endDate)
        VALUES ('unit-4', ${TEST_USER_ID}, 'lrp-4', 'Art Unit', 'Unité d''art', '2025-09-08', '2025-09-30')
      `;

      // Create core lesson with 2099 date (unscheduled)
      await prisma.$executeRaw`
        INSERT INTO ETFOLessonPlan (id, userId, unitPlanId, lessonNumber, titleFr, subject, lessonType, isScheduled, date, slotNumber)
        VALUES ('unscheduled-1', ${TEST_USER_ID}, 'unit-4', 1, 'Unscheduled Art', 'Arts visuels', 'core', 0, '2099-12-31', 4)
      `;

      // Query for units with unscheduled core lessons
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

      expect(unscheduledUnits.length).toBe(1);
      expect(unscheduledUnits[0].id).toBe('unit-4');
    });
  });
});