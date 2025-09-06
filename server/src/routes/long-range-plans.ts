import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { generateLongRangePlanDraft, generatePlanSuggestions } from '../services/ai/aiDraftService';
import { getUserId } from '../utils/authHelpers';
// REMOVED: LongRangePedagogicalPlanningService import - was a fake service returning mock data
import { validate } from '../validation';

import type { AuthenticatedRequest } from './base/middleware';
const router = Router();

// Plan interfaces
interface LongRangePlan {
  description?: string;
  goals?: string;
  assessmentOverview?: string;
  monthlyPreparationGuides?: Record<string, MonthlyGuide>;
  resourceTimeline?: Record<string, unknown>;
  professionalDevelopmentPlan?: ProfessionalDevelopmentPlan;
}

interface MonthlyGuide {
  key_focuses?: string[];
}

interface ProfessionalDevelopmentPlan {
  recommended_learning?: string[];
}

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

// REMOVED: Unused optimizedDraftSchema for fake pedagogical optimization

// Get all long-range plans for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Parse query parameters for filtering
    const { academicYear, subject, grade, term } = req.query;
    
    // Build where clause with user ID and optional filters
    const whereClause: Record<string, unknown> = { userId };
    
    if (academicYear && typeof academicYear === 'string') {
      whereClause.academicYear = academicYear;
    }
    
    if (subject && typeof subject === 'string') {
      whereClause.subject = subject;
    }
    
    if (grade && typeof grade === 'string') {
      const gradeNum = parseInt(grade);
      if (!isNaN(gradeNum)) {
        whereClause.grade = gradeNum;
      }
    }
    
    if (term && typeof term === 'string') {
      whereClause.term = term;
    }

    // Return authenticated user's plans with counts and applied filters
    const plans = await prisma.longRangePlan.findMany({
      where: whereClause,
      orderBy: { subject: 'asc' },
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
  } catch (error: unknown) {
    logger.error('Error fetching long-range plans:', String(error));
    res.status(500).json({ error: 'Failed to fetch long-range plans' });
    return;
  }
});

// Get a single long-range plan
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
return;
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
    if (!userId) {
return;
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
    if (!userId) {
return;
}

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
    if (!userId) {
return;
}

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
    if (!userId) {
return;
}

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
      subject: subject || expectations[0]?.subject || '',
      grade: grade || expectations[0]?.grade || '',
      academicYear: academicYear || '2024-2025',
    });

    res.json(draft);
    return;
  } catch (_err) {
    logger.error('AI draft generation error:', String(_err));
    res.status(500).json({ error: 'Failed to generate AI draft' });
    return;
  }
});

// Generate AI suggestions for existing plan
router.post('/:id/ai-suggestions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) {
return;
}

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
    logger.error('AI suggestions error:', String(_err));
    res.status(500).json({ error: 'Failed to generate suggestions' });
    return;
  }
});

// REMOVED: All fake pedagogical optimization endpoints that were using mock services

// Get yearly predictions and insights
router.get('/:id/yearly-predictions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const planId = req.params.id;

    // Verify plan ownership and get plan with optimization data
    const plan = await prisma.longRangePlan.findFirst({
      where: { id: planId, userId },
      include: {
        expectations: { include: { expectation: true } },
        unitPlans: { include: { lessonPlans: true } }
      }
    });

    if (!plan) {
      res.status(404).json({ error: 'Long-range plan not found' });
      return;
    }

    // Extract predictions from stored optimization data
    const predictions = {
      monthly_focuses: extractMonthlyFocuses({
        ...plan,
        description: plan.description ?? undefined
      } as LongRangePlan),
      cross_curricular_connections: plan.thematicConnections || [],
      family_engagement_timeline: plan.familyEngagementPlan || [],
      assessment_milestones: plan.summativeMilestones || [],
      resource_recommendations: extractResourceRecommendations({
        ...plan,
        description: plan.description ?? undefined
      } as LongRangePlan),
      professional_development_suggestions: extractProfessionalDevelopment({
        ...plan,
        description: plan.description ?? undefined
      } as LongRangePlan),
      next_year_insights: plan.nextYearRecommendations || []
    };

    res.json({
      plan_id: planId,
      plan_title: plan.title,
      academic_year: plan.academicYear,
      predictions,
      optimization_metadata: {
        last_updated: new Date(),
        data_quality: plan.yearlyEssentialQuestions ? 'high' : 'medium'
      }
    });
    return;
  } catch (error: unknown) {
    logger.error('Yearly predictions error:', String(error));
    res.status(500).json({ error: 'Failed to generate yearly predictions' });
    return;
  }
});

// Get optimization status for all plans
router.get('/optimization-dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const plans = await prisma.longRangePlan.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        academicYear: true,
        updatedAt: true,
        _count: { select: { expectations: true, unitPlans: true } }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ]
    });

    const dashboard = {
      summary: {
        total_plans: plans.length,
        plans_with_descriptions: plans.filter(p => (p as { description?: string }).description).length,
        plans_with_indigenous_perspectives: plans.filter(p => (p as { indigenousPerspectives?: string }).indigenousPerspectives).length,
        needs_improvement: plans.filter(p => !(p as { description?: string }).description).length
      },
      plans: plans.map(plan => ({
        ...plan,
        optimization_status: getOptimizationStatus({
          description: (plan as unknown as { description?: string }).description ?? undefined,
          goals: (plan as unknown as { goals?: string }).goals ?? undefined,
          assessmentOverview: (plan as unknown as { assessmentOverview?: string }).assessmentOverview ?? undefined
        } as LongRangePlan),
        recommendations: getQuickRecommendations({
          description: (plan as unknown as { description?: string }).description ?? undefined
        } as LongRangePlan)
      }))
    };

    res.json(dashboard);
    return;
  } catch (error: unknown) {
    logger.error('Optimization dashboard error:', String(error));
    res.status(500).json({ error: 'Failed to load optimization dashboard' });
    return;
  }
});

// Helper functions
function extractMonthlyFocuses(plan: LongRangePlan): Record<string, string[]> {
  const guides = plan.monthlyPreparationGuides || {};
  const focuses: Record<string, string[]> = {};
  
  Object.entries(guides).forEach(([month, guide]: [string, MonthlyGuide]) => {
    focuses[month] = guide.key_focuses || [];
  });
  
  return focuses;
}

function extractResourceRecommendations(plan: LongRangePlan): string[] {
  const resourceTimeline = plan.resourceTimeline || {};
  const recommendations: string[] = [];
  
  Object.values(resourceTimeline).forEach((monthlyResources: unknown) => {
    if (Array.isArray(monthlyResources)) {
      recommendations.push(...monthlyResources);
    }
  });
  
  return [...new Set(recommendations)]; // Remove duplicates
}

function extractProfessionalDevelopment(plan: LongRangePlan): string[] {
  const profDev = plan.professionalDevelopmentPlan || {};
  return profDev.recommended_learning || [];
}

function getOptimizationStatus(plan: LongRangePlan): string {
  if (plan.description && plan.goals && plan.assessmentOverview) return 'complete';
  if (plan.description || plan.goals) return 'partial';
  return 'incomplete';
}

function getQuickRecommendations(plan: LongRangePlan): string[] {
  const recommendations: string[] = [];
  
  if (!plan.description) {
    recommendations.push('Add plan description');
  }
  if (!plan.goals) {
    recommendations.push('Add learning goals');
  }
  if (!plan.assessmentOverview) {
    recommendations.push('Add assessment overview');
  }
  
  // Skip outdated check for now since updatedAt is not in the interface
  // if (!plan.updatedAt || new Date(plan.updatedAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
  //   recommendations.push('Review and update plan (90+ days old)');
  // }
  
  return recommendations;
}

export { router };
