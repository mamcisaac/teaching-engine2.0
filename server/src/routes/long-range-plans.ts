import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';
import { generateLongRangePlanDraft, generatePlanSuggestions } from '../services/aiDraftService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

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
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { academicYear, subject, grade } = req.query;
    
    const where: Prisma.LongRangePlanWhereInput = { userId };
    if (academicYear) where.academicYear = String(academicYear);
    if (subject) where.subject = String(subject);
    if (grade) where.grade = Number(grade);
    
    const plans = await prisma.longRangePlan.findMany({
      where,
      orderBy: [
        { academicYear: 'desc' },
        { subject: 'asc' },
        { grade: 'asc' },
      ],
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
  } catch (err) {
    next(err);
  }
});

// Get a single long-range plan
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
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
    
    if (!plan) {
      return res.status(404).json({ error: 'Long-range plan not found' });
    }
    
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

// Create a new long-range plan
router.post('/', validate(longRangePlanCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    
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
        return res.status(400).json({ 
          error: 'One or more curriculum expectations not found',
          provided: expectationIds,
          found: validExpectations.map(e => e.id)
        });
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
      
      return res.status(201).json(updatedPlan);
    }
    
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

// Update a long-range plan
router.put('/:id', validate(longRangePlanUpdateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { expectationIds, themes, ...updateData } = req.body;
    
    // Verify ownership
    const existing = await prisma.longRangePlan.findFirst({
      where: { id: req.params.id, userId },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Long-range plan not found' });
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
  } catch (err) {
    next(err);
  }
});

// Delete a long-range plan
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify ownership and check for dependencies
    const plan = await prisma.longRangePlan.findFirst({
      where: { id: req.params.id, userId },
      include: {
        _count: { select: { unitPlans: true } },
      },
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Long-range plan not found' });
    }
    
    if (plan._count.unitPlans > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete long-range plan with existing unit plans' 
      });
    }
    
    await prisma.longRangePlan.delete({
      where: { id: req.params.id },
    });
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Generate AI draft for long-range plan
router.post('/ai-draft', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { expectationIds, subject, grade, academicYear, termStructure } = req.body;
    
    if (!expectationIds || !Array.isArray(expectationIds) || expectationIds.length === 0) {
      return res.status(400).json({ error: 'Expectation IDs are required' });
    }
    
    // Fetch the curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { id: { in: expectationIds } },
    });
    
    if (expectations.length === 0) {
      return res.status(400).json({ error: 'No valid expectations found' });
    }
    
    const draft = await generateLongRangePlanDraft({
      expectations: expectations.map(exp => ({
        code: exp.code,
        description: exp.description,
        type: 'specific' as const, // Default to specific since we don't store this
        strand: exp.strand,
        substrand: exp.substrand || undefined,
        subject: exp.subject,
        grade: exp.grade,
      })),
      subject: subject || expectations[0].subject,
      grade: grade || expectations[0].grade,
      academicYear: academicYear || '2024-2025',
      termStructure: termStructure || 'semester',
    });
    
    res.json(draft);
  } catch (err) {
    console.error('AI draft generation error:', err);
    res.status(500).json({ error: 'Failed to generate AI draft' });
  }
});

// Generate AI suggestions for existing plan
router.post('/:id/ai-suggestions', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const plan = await prisma.longRangePlan.findFirst({
      where: { id: req.params.id, userId },
      include: {
        expectations: { include: { expectation: true } },
      },
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Long-range plan not found' });
    }
    
    const existingContent = `
Title: ${plan.title}
Subject: ${plan.subject}
Grade: ${plan.grade}
Goals: ${plan.goals || 'None specified'}
Themes: ${Array.isArray(plan.themes) ? plan.themes.join(', ') : 'None specified'}
Expectations: ${plan.expectations.map(e => `${e.expectation.code}: ${e.expectation.description}`).join('\n')}
    `;
    
    const suggestions = await generatePlanSuggestions('long-range', existingContent);
    
    res.json({ suggestions });
  } catch (err) {
    console.error('AI suggestions error:', err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

export default router;