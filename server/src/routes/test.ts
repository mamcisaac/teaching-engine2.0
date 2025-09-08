/**
 * Test-only routes for E2E testing
 * These endpoints are only available in test/development environments
 */

import type { Request, Response } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../prisma';
import { testGuard } from '../middleware/testGuard';

const router = Router();

// All test routes require test guard
router.use(testGuard);

/**
 * Seed test data
 * POST /__test__/seed/:tier
 * Tiers: 'smoke' (30 lessons) or 'full' (975 lessons)
 */
router.post('/seed/:tier', async (req: Request, res: Response): Promise<void> => {
  try {
    const tier = req.params.tier as 'smoke' | 'full';
    
    if (tier !== 'smoke' && tier !== 'full') {
      res.status(400).json({ error: 'Invalid tier. Use "smoke" or "full"' });
      return;
    }

    // Create test teacher if doesn't exist
    const testTeacher = await prisma.user.upsert({
      where: { email: 'test.teacher@teaching-engine.test' },
      update: {},
      create: {
        id: 'test-teacher',
        email: 'test.teacher@teaching-engine.test',
        password: await bcrypt.hash('test-password', 10),
        firstName: 'Test',
        lastName: 'Teacher',
        teacherProfile: {
          create: {
            yearsOfExperience: 5,
            grades: ['1'],
            subjects: ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature'],
            preferences: {
              language: 'en',
              theme: 'light',
              notifications: true
            }
          }
        }
      }
    });

    // Clear existing test data
    await prisma.$transaction([
      prisma.eTFOLessonPlan.deleteMany({}),
      prisma.unitPlan.deleteMany({}),
      prisma.longRangePlan.deleteMany({})
    ]);

    // Seed based on tier
    if (tier === 'smoke') {
      await seedSmokeData(String(testTeacher.id));
    } else {
      await seedFullData(String(testTeacher.id));
    }

    res.json({ 
      seeded: tier, 
      teacherId: testTeacher.id,
      lessons: tier === 'smoke' ? 30 : 975 
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

/**
 * Reset test data
 * POST /__test__/reset
 */
router.post('/reset', async (_req: Request, res: Response): Promise<void> => {
  try {
    const testTeacherId = 'test-teacher';
    
    await prisma.$transaction([
      prisma.eTFOLessonPlan.deleteMany({}),
      prisma.unitPlan.deleteMany({}),
      prisma.longRangePlan.deleteMany({})
    ]);

    res.json({ reset: true });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

/**
 * Login as test user
 * POST /__test__/login
 * Returns auth token/cookie
 */
router.post('/login', async (_req: Request, res: Response): Promise<void> => {
  try {
    const testTeacher = await prisma.user.findUnique({
      where: { email: 'test.teacher@teaching-engine.test' }
    });

    if (!testTeacher) {
      res.status(404).json({ error: 'Test teacher not found. Run seed first.' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: testTeacher.id, 
        email: testTeacher.email 
      },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: false, // Allow in non-HTTPS for testing
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({ 
      token, 
      userId: testTeacher.id,
      email: testTeacher.email 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * Seed minimal data for smoke tests
 */
async function seedSmokeData(teacherId: string): Promise<void> {
  // Create 1 long range plan
  const lrp = await prisma.longRangePlan.create({
    data: {
      // teacherId,
      subject: 'Français (Immersion)',
      grade: '1',
      schoolYear: '2025-2026',
      term: 'Fall'
    }
  });

  // Create 3 unit plans
  const units = await Promise.all([
    prisma.unitPlan.create({
      data: {
        teacherId,
        longRangePlanId: lrp.id,
        title: 'Communication orale',
        titleEn: 'Oral Communication',
        startDate: new Date('2025-09-08'),
        endDate: new Date('2025-09-26'),
        totalHours: 15,
        sequence: 1
      }
    }),
    prisma.unitPlan.create({
      data: {
        teacherId,
        longRangePlanId: lrp.id,
        title: 'Lecture guidée',
        titleEn: 'Guided Reading',
        startDate: new Date('2025-09-29'),
        endDate: new Date('2025-10-17'),
        totalHours: 15,
        sequence: 2
      }
    }),
    prisma.unitPlan.create({
      data: {
        teacherId,
        longRangePlanId: lrp.id,
        title: 'Écriture créative',
        titleEn: 'Creative Writing',
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-11-07'),
        totalHours: 15,
        sequence: 3
      }
    })
  ]);

  // Create 10 lessons per unit (30 total)
  const lessonPromises = [];
  let lessonNumber = 1;
  
  for (const unit of units) {
    for (let i = 0; i < 10; i++) {
      const date = new Date('2025-09-08');
      date.setDate(date.getDate() + Math.floor((lessonNumber - 1) / 5) * 7 + ((lessonNumber - 1) % 5));
      
      lessonPromises.push(
        prisma.eTFOLessonPlan.create({
          data: {
            teacherId,
            unitPlanId: unit.id,
            title: `Lesson ${lessonNumber}`,
            titleFr: `Leçon ${lessonNumber}`,
            date: date.toISOString(),
            duration: 45,
            lessonNumber,
            slotNumber: ((lessonNumber - 1) % 5) + 1,
            objectives: ['Test objective'],
            activities: ['Test activity'],
            assessmentMethods: ['Observation']
          }
        })
      );
      lessonNumber++;
    }
  }

  await Promise.all(lessonPromises);
}

/**
 * Seed full data for comprehensive tests
 */
async function seedFullData(teacherId: string): Promise<void> {
  // Create 6 long range plans (one per subject)
  const subjects = [
    'Français (Immersion)',
    'Mathématiques',
    'Sciences de la nature',
    'Sciences humaines',
    'Arts visuels',
    'Formation personnelle et sociale'
  ];

  const lrps = await Promise.all(
    subjects.map(subject =>
      prisma.longRangePlan.create({
        data: {
          // teacherId,
          subject,
          grade: '1',
          schoolYear: '2025-2026',
          term: 'Full Year'
        }
      })
    )
  );

  // Create ~8 units per LRP (50 total)
  const unitsPerLRP = [8, 8, 9, 9, 8, 8];
  const allUnits = [];
  
  for (let lrpIndex = 0; lrpIndex < lrps.length; lrpIndex++) {
    const lrp = lrps[lrpIndex];
    const unitCount = unitsPerLRP[lrpIndex];
    
    for (let unitNum = 1; unitNum <= unitCount; unitNum++) {
      const startDate = new Date('2025-09-01');
      startDate.setDate(startDate.getDate() + (unitNum - 1) * 21); // 3 weeks per unit
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 20);
      
      const unit = await prisma.unitPlan.create({
        data: {
          // teacherId,
          longRangePlanId: lrp.id,
          title: `Unit ${unitNum} - ${lrp.subject}`,
          titleEn: `Unit ${unitNum} - ${lrp.subject}`,
          startDate,
          endDate,
          totalHours: 15,
          sequence: unitNum
        }
      });
      
      allUnits.push(unit);
    }
  }

  // Create lessons to total 975
  const lessonsPerUnit = Math.floor(975 / allUnits.length);
  let globalLessonNumber = 1;
  
  for (const unit of allUnits) {
    for (let lessonNum = 1; lessonNum <= lessonsPerUnit; lessonNum++) {
      if (globalLessonNumber > 975) break;
      
      const date = new Date('2025-09-08');
      const dayOffset = Math.floor((globalLessonNumber - 1) / 5);
      const slotNumber = ((globalLessonNumber - 1) % 5) + 1;
      date.setDate(date.getDate() + dayOffset);
      
      // Skip weekends
      if (date.getDay() === 0) date.setDate(date.getDate() + 1);
      if (date.getDay() === 6) date.setDate(date.getDate() + 2);
      
      await prisma.eTFOLessonPlan.create({
        data: {
          // teacherId,
          unitPlanId: unit.id,
          title: `Lesson ${globalLessonNumber}`,
          titleFr: `Leçon ${globalLessonNumber}`,
          date: date.toISOString(),
          duration: 45,
          lessonNumber: globalLessonNumber,
          slotNumber,
          objectives: ['Learning objective'],
          activities: ['Class activity'],
          assessmentMethods: ['Formative assessment']
        }
      });
      
      globalLessonNumber++;
    }
  }
}

export { router };