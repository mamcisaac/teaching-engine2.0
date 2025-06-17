import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to ensure these endpoints are only available in test/development mode
const testOnlyMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test endpoints are only available in test mode' });
  }
  next();
};

// Apply test-only middleware to all routes
router.use(testOnlyMiddleware);

/**
 * Create a test user
 * POST /api/test/users
 */
router.post('/users', async (req, res) => {
  try {
    const { email, password, name, role = 'teacher' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || `Test ${role}`,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id.toString() }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '24h',
    });

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error('Failed to create test user:', error);
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

/**
 * Delete a test user and all their data
 * DELETE /api/test/users/:email
 */
router.delete('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user and cascade delete all related data
    await prisma.user.delete({
      where: { id: user.id },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete test user:', error);
    res.status(500).json({ error: 'Failed to delete test user' });
  }
});

/**
 * Clean up all test data
 * POST /api/test/cleanup
 */
router.post('/cleanup', async (req, res) => {
  try {
    // Delete all users with email containing 'e2e-'
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'e2e-',
        },
      },
    });

    res.status(200).json({
      message: 'Test data cleaned up',
      deletedUsers: deletedUsers.count,
    });
  } catch (error) {
    console.error('Failed to clean up test data:', error);
    res.status(500).json({ error: 'Failed to clean up test data' });
  }
});

/**
 * Reset database to a clean state (dangerous!)
 * POST /api/test/reset
 */
router.post('/reset', async (req, res) => {
  try {
    // Only allow in test environment with explicit confirmation
    if (req.body.confirm !== 'RESET_TEST_DATABASE') {
      return res.status(400).json({
        error: 'Confirmation required. Send { confirm: "RESET_TEST_DATABASE" }',
      });
    }

    // Delete all data in reverse order of dependencies
    await prisma.$transaction([
      // Activities and related data
      prisma.activityOutcome.deleteMany(),
      prisma.activity.deleteMany(),

      // Milestones
      prisma.milestone.deleteMany(),

      // Subjects
      prisma.subject.deleteMany(),

      // Other entities
      prisma.note.deleteMany(),
      prisma.calendarEvent.deleteMany(),
      prisma.holiday.deleteMany(),
      prisma.timetableSlot.deleteMany(),
      prisma.unavailableBlock.deleteMany(),
      prisma.notification.deleteMany(),

      // Finally, users
      prisma.user.deleteMany(),
    ]);

    res.status(200).json({ message: 'Test database reset successfully' });
  } catch (error) {
    console.error('Failed to reset test database:', error);
    res.status(500).json({ error: 'Failed to reset test database' });
  }
});

/**
 * Seed test data
 * POST /api/test/seed
 */
router.post('/seed', async (req, res) => {
  try {
    // Create a default test user if not exists
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: await bcrypt.hash('test123', 10),
        name: 'Test User',
        role: 'teacher',
      },
    });

    // Create some test subjects
    const mathSubject = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        userId: testUser.id,
      },
    });

    const scienceSubject = await prisma.subject.create({
      data: {
        name: 'Science',
        userId: testUser.id,
      },
    });

    // Create test milestones
    const milestone1 = await prisma.milestone.create({
      data: {
        title: 'Unit 1: Introduction',
        subjectId: mathSubject.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: testUser.id,
      },
    });

    const milestone2 = await prisma.milestone.create({
      data: {
        title: 'Lab Experiments',
        subjectId: scienceSubject.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        userId: testUser.id,
      },
    });

    // Create test activities
    await prisma.activity.createMany({
      data: [
        {
          title: 'Introduction to Numbers',
          milestoneId: milestone1.id,
          orderIndex: 0,
          activityType: 'LESSON',
          durationMins: 45,
          userId: testUser.id,
        },
        {
          title: 'Number Practice',
          milestoneId: milestone1.id,
          orderIndex: 1,
          activityType: 'LESSON',
          durationMins: 30,
          userId: testUser.id,
        },
        {
          title: 'Safety Rules',
          milestoneId: milestone2.id,
          orderIndex: 0,
          activityType: 'LESSON',
          durationMins: 60,
          userId: testUser.id,
        },
        {
          title: 'First Experiment',
          milestoneId: milestone2.id,
          orderIndex: 1,
          activityType: 'ASSESSMENT',
          durationMins: 90,
          userId: testUser.id,
        },
      ],
    });

    res.status(200).json({
      message: 'Test data seeded successfully',
      data: {
        user: testUser.id,
        subjects: [mathSubject.id, scienceSubject.id],
        milestones: [milestone1.id, milestone2.id],
      },
    });
  } catch (error) {
    console.error('Failed to seed test data:', error);
    res.status(500).json({ error: 'Failed to seed test data' });
  }
});

export default router;
