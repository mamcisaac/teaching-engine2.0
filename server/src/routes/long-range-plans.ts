import type { Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { generateLongRangePlanDraft, generatePlanSuggestions } from '../services/ai/aiDraftService';
import { getUserId } from '../utils/authHelpers';
import { LongRangePedagogicalPlanningService } from '../services/LongRangePedagogicalPlanningService';
import { validate } from '../validation';

import type { AuthenticatedRequest } from './base/middleware';
const router = Router();

// Initialize pedagogical optimization service
const pedagogicalService = new LongRangePedagogicalPlanningService(prisma);

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

// Enhanced schemas for pedagogical optimization
const optimizedDraftSchema = z.object({
  subject: z.string().min(1),
  grade: z.number().int().min(1).max(12),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/),
  expectationIds: z.array(z.string()).min(1),
  themes: z.array(z.string()).optional(),
  teacherExperienceLevel: z.enum(['beginning', 'experienced', 'expert']).optional(),
  frenchImmersionCertified: z.boolean().optional(),
  studentProfile: z.object({
    totalStudents: z.number().int().min(1).max(50).optional(),
    englishLanguageLearners: z.number().int().min(0).optional(),
    specialEducation: z.number().int().min(0).optional(),
    giftedStudents: z.number().int().min(0).optional(),
    culturalBackgrounds: z.array(z.string()).optional(),
  }).optional(),
  availableResources: z.array(z.string()).optional(),
});

// Get all long-range plans for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    // Parse query parameters for filtering
    const { academicYear, subject, grade, term } = req.query;
    
    // Build where clause with user ID and optional filters
    const whereClause: any = { userId };
    
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
  } catch (error) {
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
      subject: subject || expectations[0].subject,
      grade: grade || expectations[0].grade,
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

// PEDAGOGICAL OPTIMIZATION ENDPOINTS

// Generate pedagogically optimized AI draft
router.post('/ai-optimized-draft', validate(optimizedDraftSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const requestData = req.body;

    // Use enhanced AI service with pedagogical optimization
    const optimizedDraft = await generateLongRangePlanDraft({
      ...requestData,
      title: `${requestData.subject} - Grade ${requestData.grade} Optimized Plan`,
      userId,
      usePedagogicalOptimization: true
    });

    // Include optimization metadata in response
    res.json({
      ...optimizedDraft,
      optimization_info: {
        is_optimized: optimizedDraft.isOptimized,
        score: optimizedDraft.optimizationScore,
        certification: optimizedDraft.pedagogicalCertification,
        frameworks_applied: [
          'Understanding by Design (UbD)',
          'ETFO Best Practices', 
          'WHERETO Engagement Framework',
          'Multi-Tiered Differentiation',
          'Data-Driven Instruction',
          'Cross-Curricular Integration',
          'Cultural Responsiveness'
        ]
      }
    });
    return;
  } catch (error) {
    logger.error('Optimized AI draft generation error:', String(error));
    res.status(500).json({ error: 'Failed to generate optimized AI draft' });
    return;
  }
});

// Optimize existing long range plan
router.post('/:id/optimize', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const planId = req.params.id;

    // Verify plan ownership
    const existingPlan = await prisma.longRangePlan.findFirst({
      where: { id: planId, userId }
    });

    if (!existingPlan) {
      res.status(404).json({ error: 'Long-range plan not found' });
      return;
    }

    // Generate optimized plan
    const optimizedPlan = await pedagogicalService.optimizeExistingPlan(planId, userId);

    // Update database with optimization data
    const updatedPlan = await prisma.longRangePlan.update({
      where: { id: planId },
      data: {
        optimizationScore: optimizedPlan.plan_metadata.optimization_score,
        pedagogicalCertification: optimizedPlan.plan_metadata.pedagogical_certification,
        lastOptimized: new Date(),
        qualityVerificationData: optimizedPlan.quality_verification,
        researchComplianceScore: optimizedPlan.quality_verification.pedagogical_soundness.ubd_implementation,
        implementationFeasibility: optimizedPlan.quality_verification.implementation_feasibility.resource_requirements_met ? 1.0 : 0.7,
        
        // Store all optimization data  
        yearlyEssentialQuestions: optimizedPlan.desired_results.yearly_transfer_goals.essential_questions,
        endOfYearPerformanceTasks: optimizedPlan.desired_results.year_end_performance_tasks,
        learningProgressions: optimizedPlan.desired_results.learning_progressions,
        diagnosticAssessments: optimizedPlan.assessment_evidence.diagnostic_assessments,
        formativeStrategies: optimizedPlan.assessment_evidence.formative_strategies,
        summativeMilestones: optimizedPlan.assessment_evidence.summative_milestones,
        yearlyEngagementPlan: optimizedPlan.learning_plan.yearly_engagement_framework,
        thematicConnections: optimizedPlan.integration_framework.thematic_connections,
        differentationFramework: optimizedPlan.yearly_differentiation,
        familyEngagementPlan: optimizedPlan.yearly_differentiation.cultural_responsiveness.family_engagement_plan,
        monthlyPreparationGuides: optimizedPlan.implementation_package.monthly_preparation_guides,
        studentSuccessPredictions: optimizedPlan.optimization_insights.predictive_analytics.student_success_predictions,
        nextYearRecommendations: optimizedPlan.optimization_insights.next_year_preparation
      }
    });

    res.json({
      message: 'Plan successfully optimized',
      optimization_results: {
        score: optimizedPlan.plan_metadata.optimization_score,
        certification: optimizedPlan.plan_metadata.pedagogical_certification,
        improvement_areas: Object.keys(optimizedPlan.quality_verification.curriculum_compliance)
      },
      updated_plan: updatedPlan
    });
    return;
  } catch (error) {
    logger.error('Plan optimization error:', String(error));
    res.status(500).json({ error: 'Failed to optimize plan' });
    return;
  }
});

// Assess pedagogical quality of existing plan
router.get('/:id/quality-assessment', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const planId = req.params.id;

    // Verify plan ownership
    const plan = await prisma.longRangePlan.findFirst({
      where: { id: planId, userId }
    });

    if (!plan) {
      res.status(404).json({ error: 'Long-range plan not found' });
      return;
    }

    // Run quality assessment
    const qualityAssessment = await pedagogicalService.assessPlanQuality(planId, userId);

    res.json({
      plan_id: planId,
      quality_assessment: qualityAssessment,
      current_optimization_data: {
        score: plan.optimizationScore,
        certification: plan.pedagogicalCertification,
        last_optimized: plan.lastOptimized,
        research_compliance: plan.researchComplianceScore
      },
      recommendations: {
        should_optimize: qualityAssessment.current_score < 85,
        potential_improvement: qualityAssessment.optimization_potential - qualityAssessment.current_score,
        priority_areas: qualityAssessment.improvement_priorities
      }
    });
    return;
  } catch (error) {
    logger.error('Quality assessment error:', String(error));
    res.status(500).json({ error: 'Failed to assess plan quality' });
    return;
  }
});

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
      student_success_predictions: plan.studentSuccessPredictions || [],
      monthly_focuses: extractMonthlyFocuses(plan),
      intervention_opportunities: plan.interventionTriggers || [],
      cross_curricular_connections: plan.thematicConnections || [],
      family_engagement_timeline: plan.familyEngagementPlan || [],
      assessment_milestones: plan.summativeMilestones || [],
      resource_recommendations: extractResourceRecommendations(plan),
      professional_development_suggestions: extractProfessionalDevelopment(plan),
      next_year_insights: plan.nextYearRecommendations || []
    };

    res.json({
      plan_id: planId,
      plan_title: plan.title,
      academic_year: plan.academicYear,
      predictions,
      optimization_metadata: {
        last_updated: plan.lastOptimized,
        confidence_score: plan.optimizationScore,
        data_quality: plan.qualityVerificationData ? 'high' : 'medium'
      }
    });
    return;
  } catch (error) {
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
        optimizationScore: true,
        pedagogicalCertification: true,
        lastOptimized: true,
        researchComplianceScore: true,
        _count: { select: { expectations: true, unitPlans: true } }
      },
      orderBy: [
        { optimizationScore: 'desc' },
        { lastOptimized: 'desc' }
      ]
    });

    const dashboard = {
      summary: {
        total_plans: plans.length,
        optimized_plans: plans.filter(p => p.optimizationScore && p.optimizationScore >= 85).length,
        average_score: plans.filter(p => p.optimizationScore).reduce((sum, p) => sum + (p.optimizationScore || 0), 0) / plans.filter(p => p.optimizationScore).length || 0,
        needs_optimization: plans.filter(p => !p.optimizationScore || p.optimizationScore < 85).length
      },
      certification_breakdown: {
        exemplary: plans.filter(p => p.pedagogicalCertification === 'exemplary').length,
        proficient: plans.filter(p => p.pedagogicalCertification === 'proficient').length,
        acceptable: plans.filter(p => p.pedagogicalCertification === 'acceptable').length,
        needs_improvement: plans.filter(p => p.pedagogicalCertification === 'needs_improvement').length,
        unoptimized: plans.filter(p => !p.pedagogicalCertification).length
      },
      plans: plans.map(plan => ({
        ...plan,
        optimization_status: getOptimizationStatus(plan),
        recommendations: getQuickRecommendations(plan)
      }))
    };

    res.json(dashboard);
    return;
  } catch (error) {
    logger.error('Optimization dashboard error:', String(error));
    res.status(500).json({ error: 'Failed to load optimization dashboard' });
    return;
  }
});

// Helper functions
function extractMonthlyFocuses(plan: any): Record<string, string[]> {
  const guides = plan.monthlyPreparationGuides || {};
  const focuses: Record<string, string[]> = {};
  
  Object.entries(guides).forEach(([month, guide]: [string, any]) => {
    focuses[month] = guide.key_focuses || [];
  });
  
  return focuses;
}

function extractResourceRecommendations(plan: any): string[] {
  const resourceTimeline = plan.resourceTimeline || {};
  const recommendations: string[] = [];
  
  Object.values(resourceTimeline).forEach((monthlyResources: any) => {
    if (Array.isArray(monthlyResources)) {
      recommendations.push(...monthlyResources);
    }
  });
  
  return [...new Set(recommendations)]; // Remove duplicates
}

function extractProfessionalDevelopment(plan: any): string[] {
  const profDev = plan.professionalDevelopmentPlan || {};
  return profDev.recommended_learning || [];
}

function getOptimizationStatus(plan: any): string {
  if (!plan.optimizationScore) return 'unoptimized';
  if (plan.optimizationScore >= 95) return 'exemplary';
  if (plan.optimizationScore >= 85) return 'optimized';
  if (plan.optimizationScore >= 75) return 'needs_improvement';
  return 'requires_optimization';
}

function getQuickRecommendations(plan: any): string[] {
  const recommendations: string[] = [];
  
  if (!plan.optimizationScore) {
    recommendations.push('Run pedagogical optimization');
  } else if (plan.optimizationScore < 85) {
    recommendations.push('Enhance UbD implementation');
    recommendations.push('Add differentiation strategies');
  }
  
  if (!plan.lastOptimized || new Date(plan.lastOptimized) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
    recommendations.push('Refresh optimization (90+ days old)');
  }
  
  return recommendations;
}

export { router };
