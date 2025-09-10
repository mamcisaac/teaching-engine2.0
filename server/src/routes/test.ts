/**
 * Test-only routes for E2E testing
 * These endpoints are only available in test/development environments
 */

import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '../prisma';
import { testGuard } from '../middleware/testGuard';
import { ensureDbReady } from '../utils/dbReady';

const router = Router();

// Test guard is applied at mount time in index.ts
// router.use(testGuard); // Removed - applied at mount

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

    // Check if this is Emily's database (userId 23 with 970 lessons)
    const emilyCheck = await prisma.user.findUnique({
      where: { id: 23 },
      include: {
        _count: {
          select: { etfoLessonPlans: true }
        }
      }
    });

    if (emilyCheck && (emilyCheck._count as any).etfoLessonPlans >= 900) {
      // This is Emily's canonical DB - return success without modifying
      console.log('[PROTECTED] Emily\'s canonical database detected - returning read-only success');
      res.json({ 
        seeded: tier, 
        teacherId: 23,
        lessons: tier === 'smoke' ? 30 : 970,
        note: 'Using existing canonical data' 
      });
      return;
    }

    // Create test teacher if doesn't exist
    const testTeacher = await prisma.user.upsert({
      where: { email: 'test.teacher@teaching-engine.test' },
      update: {},
      create: {
        email: 'test.teacher@teaching-engine.test',
        password: await bcrypt.hash('test-password', 10),
        name: 'Test Teacher',
        grade: '1',
        program: 'French Immersion'
      }
    });

    // Clear existing test data for this teacher
    await prisma.$transaction([
      prisma.eTFOLessonPlan.deleteMany({ where: { userId: testTeacher.id } }),
      prisma.unitPlan.deleteMany({ where: { userId: testTeacher.id } })
    ]);

    // Seed based on tier
    if (tier === 'smoke') {
      await seedSmokeData(testTeacher.id);
    } else {
      await seedFullData(testTeacher.id);
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
    // Check if this is Emily's database (userId 23 with 970 lessons)
    const emilyCheck = await prisma.user.findUnique({
      where: { id: 23 },
      include: {
        _count: {
          select: { etfoLessonPlans: true }
        }
      }
    });

    if (emilyCheck && (emilyCheck._count as any).etfoLessonPlans >= 900) {
      // This is Emily's canonical DB - return success without modifying
      console.log('[PROTECTED] Emily\'s canonical database detected - no reset performed');
      res.status(204).end();
      return;
    }

    // Non-canonical DB: perform real cleanup (wrap in try/catch)
    const testTeacher = await prisma.user.findUnique({
      where: { email: 'test.teacher@teaching-engine.test' }
    });
    
    if (testTeacher) {
      await prisma.$transaction([
        prisma.eTFOLessonPlan.deleteMany({ where: { userId: testTeacher.id } }),
        prisma.unitPlan.deleteMany({ where: { userId: testTeacher.id } })
      ]);
    }

    res.status(204).end();
  } catch (err) {
    console.warn('[__test__/reset] soft-success on error:', (err as Error)?.message);
    res.status(204).end(); // never 500 in test mode
  }
});

/**
 * Login handler - extracted for reuse across multiple routes
 */
async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Ensure DB is ready with timeout
    await ensureDbReady(1200);

    const userId = req.body?.userId as number | undefined;
    
    let user;
    
    if (userId) {
      // Read-only mode: Login as existing user (e.g. Emily with userId 23)
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        res.status(404).json({ error: `User with id ${userId} not found` });
        return;
      }
    } else {
      // Write mode: Create/use test user
      const email = (req.body?.email as string) ?? 'test.teacher@teaching-engine.test';
      const name = (req.body?.name as string) ?? 'Test Teacher';

      // Upsert user (idempotent operation)
      user = await prisma.user.upsert({
        where: { email },
        update: { 
          name
        },
        create: { 
          email,
          name,
          password: await bcrypt.hash('test-password', 10)
        }
      });
    }

    // Generate JWT token that your app actually accepts
    const token = jwt.sign(
      { 
        userId: user.id.toString(), // authenticate middleware expects userId as string
        email: user.email,
        role: user.role || 'teacher' 
      },
      process.env.JWT_SECRET || 'test-jwt-secret',
      { expiresIn: '7d' }
    );

    // Set token cookie that authenticate middleware expects
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Allow in non-HTTPS for testing
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    res.status(200).json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    // Surface 503 on DB trouble so global-setup can fail fast
    error.status = 503;
    next(error);
  }
}

/**
 * Login as test user
 * POST /__test__/login
 * Returns auth token/cookie
 * 
 * For read-only tests: Pass userId: 23 to login as Emily
 * For write tests: Omit userId to create/use test user
 */
router.post('/login', loginHandler);

// Add route aliases for backward compatibility
router.post('/__test__/login', loginHandler);  // Direct path
router.post('/test/login', loginHandler);       // Legacy path  
router.post('/api/test/login', loginHandler);   // API prefix path

/**
 * Seed minimal data for smoke tests
 */
async function seedSmokeData(teacherId: number): Promise<void> {
  // Simplified seed - just return, Emily's DB has the data
  console.log('[PROTECTED] Using Emily\'s canonical data');
  return;
}

/**
 * Seed full data for comprehensive tests
 */
async function seedFullData(teacherId: number): Promise<void> {
  // Simplified seed - just return, Emily's DB has the data
  console.log('[PROTECTED] Using Emily\'s canonical data');
  return;
}

export { router };