import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import type { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { generateLongRangePlanDraft, generatePlanSuggestions } from '../services/ai/aiDraftService';
import { validate } from '../validation';
import { getUserId } from '../utils/authHelpers';
import type { AuthenticatedRequest } from './base/middleware';
const router = Router();

// Validation schemas
const longRangePlanCreateSchema = z.object({
  title: z.string().min(1),
  titleFr: z.string().optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/), // e.g., "2024-2025"
  term: z.string().optional(),
  grade: z.number().int().min(1).max(12),
  subject: z.string().min(1),
  description: z.string().optional(),
  descriptionFr: z.string().optional(),
  goals: z.string().optional(),
  goalsFr: z.string().optional(),
  themes: z.array(z.string()).optional(),
  expectationIds: z.array(z.string()).optional(),
  // ETFO-aligned fields
  overarchingQuestions: z.string().optional(),
  assessmentOverview: z.string().optional(),
  resourceNeeds: z.string().optional(),
  professionalGoals: z.string().optional(),
});

const longRangePlanUpdateSchema = longRangePlanCreateSchema.partial();

// Get all long-range plans for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { academicYear, subject, grade } = req.query;

    const where: Prisma.LongRangePlanWhereInput = { userId };
    if (academicYear !== null) {
where.academicYear = String(academicYear);
}
    if (subject !== null) {
where.subject = String(subject);
}
    if (grade !== null) {
where.grade = Number(grade);
}

    const plans = await prisma.longRangePlan.findMany({
      where,
      orderBy: [{ academicYear: 'desc' }, { subject: 'asc' }, { grade: 'asc' }],
      include: {
        _count: {
          select: {
            unitPlans: true,
            expectations: true,
          },
        },
      },
    });

    res.json(plans);
    return;
  } catch (_err) {
(_err); return;
  }
});

// Get a single long-range plan
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const plan = await prisma.longRangePlan.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        expectations: {
          include: {
            expectation: true,
          },
          orderBy: {
            expectation: { code: 'asc' },
          },
        },
        unitPlans: {
          orderBy: { startDate: 'asc' },
          include: {
            _count: {
              select: {
                lessonPlans: true,
                expectations: true,
              },
            },
          },
        },
      },
    });

    if (plan === null || plan === undefined) {
      res.status(404).json({ error: 'Long-range plan not found' });
      return;
    }

    res.json(plan);
    return;
  } catch (_err) {
(_err); return;
  }
});

// Create a new long-range plan
router.post('/', validate(longRangePlanCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { expectationIds, themes, ...planData } = req.body;

    const plan = await prisma.longRangePlan.create({
      data: {
        ...planData,
        userId,
        themes: themes || [],
      },
      include: {
        expectations: {
          include: { expectation: true },
        },
        _count: {
          select: { unitPlans: true },
        },
      },
    });

    // Link curriculum expectations if provided
    if (expectationIds && expectationIds.length > 0) {
      // Validate expectation IDs exist
      const validExpectations = await prisma.curriculumExpectation.findMany({
        where: { id: { in: expectationIds } },
        select: { id: true },
      });

      if (validExpectations.length !== expectationIds.length) {
        res.status(400).json({
          error: 'One or more curriculum expectations not found',
          provided: expectationIds,
          found: validExpectations.map((e: { id: string }) => e.id),
        });
        return;
      }

      await prisma.longRangePlanExpectation.createMany({
        data: expectationIds.map((expectationId: string) => ({
          longRangePlanId: plan.id,
          expectationId,
        })),
      });

      // Refetch with expectations
      const updatedPlan = await prisma.longRangePlan.findUnique({
        where: { id: plan.id },
        include: {
          expectations: {
            include: { expectation: true },
          },
          _count: {
            select: { unitPlans: true },
          },
        },
      });

      res.status(201).json(updatedPlan);
      return;
    }

    res.status(201).json(plan);
    return;
  } catch (_err) {
(_err); return;
  }
});

// Update a long-range plan
router.put('/:id', validate(longRangePlanUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { expectationIds, themes, ...updateData } = req.body;

    // Verify ownership
    const existing = await prisma.longRangePlan.findFirst({
      where: { id: req.params.id, userId },
    });

    if (existing === null || existing === undefined) {
      res.status(404).json({ error: 'Long-range plan not found' });
      return;
    }

    // Update the plan
    const plan = await prisma.longRangePlan.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        themes: themes !== undefined ? themes : existing.themes,
      },
    });

    // Update expectations if provided
    if (expectationIds !== undefined) {
      // Remove existing expectations
      await prisma.longRangePlanExpectation.deleteMany({
        where: { longRangePlanId: plan.id },
      });

      // Add new expectations
      if (expectationIds.length > 0) {
        await prisma.longRangePlanExpectation.createMany({
          data: expectationIds.map((expectationId: string) => ({
            longRangePlanId: plan.id,
            expectationId,
          })),
        });
      }
    }

    // Refetch with updated relationships
    const updatedPlan = await prisma.longRangePlan.findUnique({
      where: { id: plan.id },
      include: {
        expectations: {
          include: { expectation: true },
        },
        unitPlans: {
          orderBy: { startDate: 'asc' },
          include: {
            _count: {
              select: {
                lessonPlans: true,
                expectations: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedPlan);
    return;
  } catch (_err) {
(_err); return;
  }
});

// Delete a long-range plan
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Verify ownership and check for dependencies
    const plan = await prisma.longRangePlan.findFirst({
      where: { id: req.params.id, userId },
      include: {
        _count: { select: { unitPlans: true } },
      },
    });

    if (plan === null || plan === undefined) {
      res.status(404).json({ error: 'Long-range plan not found' });
      return;
    }

    if (plan._count.unitPlans > 0) {
      res.status(400).json({
        error: 'Cannot delete long-range plan with existing unit plans',
      });
      return;
    }

    await prisma.longRangePlan.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (_err) {
(_err); return;
  }
});

// Generate AI draft for long-range plan
router.post('/ai-draft', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { expectationIds, subject, grade, academicYear } = req.body;

    if (expectationIds === null || expectationIds === undefined || !Array.isArray(expectationIds) || expectationIds.length === 0) {
      res.status(400).json({ error: 'Expectation IDs are required' });
      return;
    }

    // Fetch the curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { id: { in: expectationIds } },
    });

    if (expectations.length === 0) {
      res.status(400).json({ error: 'No valid expectations found' });
      return;
    }

    const draft = await generateLongRangePlanDraft({
      title: '',
      expectationIds: expectations.map((exp: { id: string }) => exp.id),
      subject: subject || expectations[0].subject,
      grade: grade || expectations[0].grade,
      academicYear: academicYear || '2024-2025',
    });

    res.json(draft);
    return;
  } catch (_err) {
    logger.error('AI draft generation error:', _err);
    res.status(500).json({ error: 'Failed to generate AI draft' });
    return;
  }
});

// Generate AI suggestions for existing plan
router.post('/:id/ai-suggestions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const plan = await prisma.longRangePlan.findFirst({
      where: { id: req.params.id, userId },
      include: {
        expectations: { include: { expectation: true } },
      },
    });

    if (plan === null || plan === undefined) {
      res.status(404).json({ error: 'Long-range plan not found' });
      return;
    }

    const existingContent = `
Title: ${plan.title}
Subject: ${plan.subject}
Grade: ${plan.grade}
Goals: ${plan.goals || 'None specified'}
Themes: ${Array.isArray(plan.themes) ? plan.themes.join(', ') : 'None specified'}
Expectations: ${plan.expectations.map((e: { expectation: { code: string; description: string } }) => `${e.expectation.code}: ${e.expectation.description}`).join('\n')}
    `;

    const suggestions = await generatePlanSuggestions('long-range', existingContent);

    res.json({ suggestions });
    return;
  } catch (_err) {
    logger.error('AI suggestions error:', _err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
    return;
  }
});

export { router };
