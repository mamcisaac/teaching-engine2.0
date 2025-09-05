/**
 * Substitute Plan Routes
 * Handles substitute teacher information and plan generation
 */

import { PrismaClient } from '@teaching-engine/database';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { SubstitutePlanService } from '../services/substitutePlanService';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const substituteInfoSchema = z.object({
  classroomNumber: z.string().optional().nullable(),
  gradeLevel: z.string().optional().nullable(),
  classSize: z.number().optional().nullable(),
  officePhone: z.string().optional().nullable(),
  principalName: z.string().optional().nullable(),
  vicePrincipalName: z.string().optional().nullable(),
  nearbyTeacher: z.string().optional().nullable(),
  nearbyTeacherRoom: z.string().optional().nullable(),
  emergencyProcedures: z.string().optional().nullable(),
  fireExitRoute: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medicalNeeds: z.string().optional().nullable(),
  behaviorNotes: z.string().optional().nullable(),
  specialNeeds: z.string().optional().nullable(),
  studentHelpers: z.string().optional().nullable(),
  classroomRules: z.string().optional().nullable(),
  rewardSystem: z.string().optional().nullable(),
  consequenceSystem: z.string().optional().nullable(),
  attentionSignal: z.string().optional().nullable(),
  morningRoutine: z.string().optional().nullable(),
  attendanceProcedure: z.string().optional().nullable(),
  bathroomPolicy: z.string().optional().nullable(),
  lunchProcedure: z.string().optional().nullable(),
  dismissalProcedure: z.string().optional().nullable(),
  materialsLocation: z.string().optional().nullable(),
  technologyAccess: z.string().optional().nullable(),
  copiesLocation: z.string().optional().nullable(),
  extraActivities: z.string().optional().nullable(),
  specialSchedule: z.string().optional().nullable(),
  importantInfo: z.string().optional().nullable(),
});

/**
 * GET /api/substitute/info
 * Get substitute information for the current user
 */
router.get('/info', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const info = await prisma.substituteInfo.findUnique({
      where: { userId },
    });

    if (!info) {
      // Return empty object if no info exists yet
      return res.json({});
    }

    return res.json(info);
  } catch (error) {
    logger.error('Failed to fetch substitute info:', String(error));
    return res.status(500).json({ error: 'Failed to fetch substitute information' });
  }
});

/**
 * POST /api/substitute/info
 * Create or update substitute information
 */
router.post('/info', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Validate and sanitize input
    const validation = substituteInfoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: validation.error.flatten() 
      });
    }
    
    const validated = validation.data;

    const info = await prisma.substituteInfo.upsert({
      where: { userId },
      update: validated,
      create: {
        userId,
        ...validated,
      },
    });

    return res.status(200).json(info);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    logger.error('Failed to save substitute info:', String(error));
    return res.status(500).json({ error: 'Failed to save substitute information' });
  }
});

/**
 * GET /api/substitute/plan/:date
 * Generate substitute plan for a specific date
 */
router.get('/plan/:date', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const dateParam = req.params.date;
    if (!dateParam) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Get substitute info
    const substituteInfo = await prisma.substituteInfo.findUnique({
      where: { userId: req.user.id },
    });

    // Get lessons for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true,
          },
        },
        resources: true,
      },
      orderBy: {
        slotNumber: 'asc',
      },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, grade: true },
    });

    // Generate the plan
    const plan = await SubstitutePlanService.generateFromLessons({
      date,
      lessons,
      substituteInfo,
      teacherName: user?.name || 'Teacher',
      grade: user?.grade || '',
    });

    return res.json(plan);
  } catch (error) {
    logger.error('Failed to generate substitute plan:', String(error));
    return res.status(500).json({ error: 'Failed to generate substitute plan' });
  }
});

/**
 * GET /api/substitute/plan/:date/pdf
 * Generate PDF version of substitute plan
 */
router.get('/plan/:date/pdf', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const dateParam = req.params.date;
    if (!dateParam) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Get substitute info
    const substituteInfo = await prisma.substituteInfo.findUnique({
      where: { userId: req.user.id },
    });

    // Get lessons for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true,
          },
        },
        resources: true,
      },
      orderBy: {
        slotNumber: 'asc',
      },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { name: true, grade: true },
    });

    // Generate the plan
    const plan = await SubstitutePlanService.generateFromLessons({
      date,
      lessons,
      substituteInfo,
      teacherName: user?.name || 'Teacher',
      grade: user?.grade || '',
    });

    // Generate HTML
    const html = SubstitutePlanService.exportAsHTML(plan);

    // Set headers for HTML response (client will handle PDF conversion)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="substitute-plan-${date.toISOString().split('T')[0]}.html"`);
    return res.send(html);
  } catch (error) {
    logger.error('Failed to generate substitute plan PDF:', String(error));
    return res.status(500).json({ error: 'Failed to generate substitute plan PDF' });
  }
});

/**
 * POST /api/substitute/emergency-plans
 * Create emergency substitute plan (for testing)
 */
router.post('/emergency-plans', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, subject, grade, activities, specialInstructions, emergencyContacts } = req.body;

    // Create substitute plan record
    const plan = await prisma.substitutePlan.create({
      data: {
        userId: req.user.id,
        title: title || 'Emergency Plan',
        dateFor: new Date(),
        grade,
        subject,
        schedule: { activities: activities || [] },
        classroomRoutines: { specialInstructions: specialInstructions || '' },
        emergencyInfo: { contacts: emergencyContacts || [] },
        lessonPlans: {},
        behaviorPlan: {},
        studentNotes: {},
        materialsList: {},
      },
    });

    return res.status(201).json(plan);
  } catch (error) {
    logger.error('Failed to create emergency plan:', String(error));
    return res.status(500).json({ error: 'Failed to create emergency plan' });
  }
});

/**
 * GET /api/substitute/emergency-plans
 * Get all emergency plans for testing
 */
router.get('/emergency-plans', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const plans = await prisma.substitutePlan.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(plans);
  } catch (error) {
    logger.error('Failed to fetch emergency plans:', String(error));
    return res.status(500).json({ error: 'Failed to fetch emergency plans' });
  }
});

export { router };