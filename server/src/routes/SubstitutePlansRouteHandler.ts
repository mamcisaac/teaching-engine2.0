/**
 * Substitute Plans Route Handler
 * Extends BaseRouteHandler with substitute plan-specific business logic
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { BaseRouteHandler, AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import { BaseService } from '../services/base/BaseService.js';
import { commonValidations } from './base/validation.js';
import { prisma } from '../prisma.js';
import { Prisma } from '@teaching-engine/database';
import { SubstitutePlanService } from '../services/index.js';
import { optimizedQueries, queryPerformance } from './optimizations/queryOptimizations.js';
import { SubstitutePlanCreateData, SubstitutePlanUpdateData } from '../types/routes.js';

// Substitute plan-specific validation schemas
const scheduleItemSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  activity: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
  materials: z.array(z.string().max(100)).max(20).optional(),
  location: z.string().max(100).optional(),
});

const routineSchema = z.object({
  category: z.enum(['morning', 'transition', 'dismissal', 'behavior', 'emergency', 'other']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  timeOfDay: z.string().max(50).optional(),
  priority: z.number().int().min(1).max(10),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().max(100),
  phone: z.string().regex(/^[\d\s\-()+'". ]+$/, 'Invalid phone number format'),
  extension: z.string().max(10).optional(),
});

const emergencyInfoSchema = z.object({
  evacuationProcedure: z.string().min(1).max(2000),
  lockdownProcedure: z.string().min(1).max(2000),
  emergencyContacts: z.array(emergencyContactSchema).min(1).max(10),
  importantStudentInfo: z.array(z.object({
    studentName: z.string().min(1).max(100),
    info: z.string().min(1).max(500),
    priority: z.enum(['low', 'medium', 'high']),
  })).max(30).optional(),
});

const generateSubPlanSchema = z.object({
  dateFor: z.string().datetime(),
  title: z.string().max(255).optional(),
  grade: z.number().int().min(1).max(12).optional(),
  subject: z.string().max(100).optional(),
  sourceUnitPlanId: z.string().cuid().optional(),
  sourceLessonPlanIds: z.array(z.string().cuid()).max(10).optional(),
  includeEmergencyInfo: z.boolean().default(true),
  includeClassroomRoutines: z.boolean().default(true),
  customInstructions: z.string().max(2000).optional(),
});

const substitutePlanCreateSchema = z.object({
  title: commonValidations.title,
  dateFor: z.string().datetime(),
  grade: z.number().int().min(1).max(12).optional(),
  subject: z.string().max(100).optional(),
  schedule: z.array(scheduleItemSchema).min(1).max(20),
  classroomRoutines: z.array(routineSchema).max(50),
  emergencyInfo: emergencyInfoSchema,
  customInstructions: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

const substitutePlanUpdateSchema = substitutePlanCreateSchema.partial().omit({ dateFor: true });

const substitutePlanQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  grade: z.coerce.number().int().min(1).max(12).optional(),
  subject: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  upcoming: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['dateFor', 'title', 'createdAt', 'grade']).default('dateFor'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Substitute plan service wrapper
class SubstitutePlanServiceWrapper extends BaseService {
  private substitutePlanService: SubstitutePlanService;

  constructor() {
    super('SubstitutePlanServiceWrapper');
    this.substitutePlanService = new SubstitutePlanService();
  }

  async findMany(filters: any, userId: number) {
    const {
      startDate,
      endDate,
      grade,
      subject,
      isActive,
      upcoming,
      limit,
      offset,
      sortBy,
      sortOrder,
    } = filters as Record<string, any>;

    const where: Prisma.SubstitutePlanWhereInput = { userId };

    // Date filtering using optimized range function
    const dateWhere = optimizedQueries.createDateRangeWhere('dateFor', startDate, endDate);
    if (Object.keys(dateWhere).length > 0) {
      Object.assign(where, dateWhere);
    }

    if (grade) where.grade = grade;
    if (subject) where.subject = { contains: subject };
    if (isActive !== undefined) where.isActive = isActive;

    // Filter for upcoming plans
    if (upcoming) {
      const now = new Date();
      where.dateFor = { gte: now };
      where.isActive = true;
    }

    // Sorting with validation
    const orderBy = queryPerformance.createOptimizedSort(
      sortBy,
      sortOrder,
      ['dateFor', 'title', 'grade', 'createdAt']
    );

    const result = await queryPerformance.monitorQuery(
      'substitutePlan.findMany',
      () => optimizedQueries.paginatedQuery(
        prisma.substitutePlan,
        where,
        {
          limit,
          offset,
          orderBy,
        }
      )
    );

    const { items: plans, total } = result;

    return {
      plans,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async findById(id: string, userId: number) {
    return queryPerformance.monitorQuery(
      'substitutePlan.findById',
      () => prisma.substitutePlan.findFirst({
        where: { id, userId },
      })
    );
  }

  async create(data: SubstitutePlanCreateData, userId: number) {
    return prisma.substitutePlan.create({
      data: {
        userId,
        title: data.title,
        dateFor: new Date(data.dateFor),
        grade: data.gradeLevel ? parseInt(data.gradeLevel, 10) : null,
        subject: data.subject,
        schedule: data.activities ? [{ time: '9:00', activity: data.activities, notes: data.notes }] : [],
        classroomRoutines: data.classroomManagement ? [{ category: 'other', description: data.classroomManagement }] : [],
        emergencyInfo: data.emergencyContacts ? { contacts: data.emergencyContacts } : {},
        lessonPlans: data.objectives ? { objectives: data.objectives, materials: data.materials } : {},
        behaviorPlan: {},
        studentNotes: {},
        materialsList: data.materials ? { materials: data.materials } : {},
        importantInfo: data.importantNotes ? { notes: data.importantNotes } : null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: SubstitutePlanUpdateData, userId: number) {
    // Verify ownership
    const plan = await prisma.substitutePlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      throw new Error('Substitute plan not found or access denied');
    }

    return prisma.substitutePlan.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: number): Promise<boolean> {
    const plan = await prisma.substitutePlan.findFirst({
      where: { id, userId },
    });

    if (!plan) {
      return false;
    }

    await prisma.substitutePlan.delete({
      where: { id },
    });

    return true;
  }

  async generatePlan(generateData: unknown, userId: number) {
    return SubstitutePlanService.generate(generateData);
  }

  async deactivatePlan(planId: string, userId: number) {
    const plan = await prisma.substitutePlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new Error('Substitute plan not found or access denied');
    }

    return prisma.substitutePlan.update({
      where: { id: planId },
      data: { isActive: false },
    });
  }

  async getStats(userId: number) {
    const [totalPlans, activePlans, upcomingPlans, recentPlans] = await Promise.all([
      prisma.substitutePlan.count({ where: { userId } }),
      prisma.substitutePlan.count({ where: { userId, isActive: true } }),
      prisma.substitutePlan.count({
        where: {
          userId,
          isActive: true,
          dateFor: { gte: new Date() },
        },
      }),
      prisma.substitutePlan.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      }),
    ]);

    return {
      totalPlans,
      activePlans,
      upcomingPlans,
      recentPlans,
    };
  }

  async getUpcomingDates(userId: number, daysAhead: number = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    const plans = await prisma.substitutePlan.findMany({
      where: {
        userId,
        isActive: true,
        dateFor: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        dateFor: true,
        grade: true,
        subject: true,
      },
      orderBy: { dateFor: 'asc' },
    });

    return plans;
  }
}

export class SubstitutePlansRouteHandler extends BaseRouteHandler {
  private substitutePlanService: SubstitutePlanServiceWrapper;

  constructor() {
    super({
      routeName: 'substitute-plans',
      requireAuth: true,
    });
    this.substitutePlanService = new SubstitutePlanServiceWrapper();
  }

  protected getService(): BaseService {
    return this.substitutePlanService;
  }

  protected getValidationSchemas() {
    return {
      create: substitutePlanCreateSchema,
      update: substitutePlanUpdateSchema,
      query: substitutePlanQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: this.substitutePlanService.create.bind(this.substitutePlanService),
      findMany: this.substitutePlanService.findMany.bind(this.substitutePlanService),
      findById: this.substitutePlanService.findById.bind(this.substitutePlanService),
      update: this.substitutePlanService.update.bind(this.substitutePlanService),
      delete: this.substitutePlanService.delete.bind(this.substitutePlanService),
    };
  }

  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const schemas = this.getValidationSchemas();
      const filters = schemas.query.parse(req.query);
      
      const result = await this.substitutePlanService.findMany(filters, userId);
      res.json(result);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error);
      next(_error);
    }
  }

  protected setupCustomRoutes(): void {
    // POST /substitute-plans/generate
    this.router.post(
      '/generate',
      this.requireAuthentication,
      this.asyncHandler(this.handleGenerate.bind(this))
    );

    // POST /substitute-plans/:id/deactivate
    this.router.post(
      '/:id/deactivate',
      this.requireAuthentication,
      this.asyncHandler(this.handleDeactivate.bind(this))
    );

    // GET /substitute-plans/stats
    this.router.get(
      '/stats',
      this.requireAuthentication,
      this.asyncHandler(this.handleStats.bind(this))
    );

    // GET /substitute-plans/upcoming-dates
    this.router.get(
      '/upcoming-dates',
      this.requireAuthentication,
      this.asyncHandler(this.handleUpcomingDates.bind(this))
    );
  }

  private async handleGenerate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const generateData = generateSubPlanSchema.parse(req.body);
      
      const generatedPlan = await this.substitutePlanService.generatePlan(generateData, userId);
      res.status(201).json(generatedPlan);
    } catch (_error) {
      this.logger.error('Error generating substitute plan:', _error);
      next(_error);
    }
  }

  private async handleDeactivate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id: planId } = req.params;
      
      const deactivatedPlan = await this.substitutePlanService.deactivatePlan(planId, userId);
      res.json(deactivatedPlan);
    } catch (_error) {
      this.logger.error('Error deactivating substitute plan:', _error);
      next(_error);
    }
  }

  private async handleStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const stats = await this.substitutePlanService.getStats(userId);
      res.json(stats);
    } catch (_error) {
      this.logger.error('Error getting substitute plan stats:', _error);
      next(_error);
    }
  }

  private async handleUpcomingDates(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const daysAhead = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      
      const upcomingDates = await this.substitutePlanService.getUpcomingDates(userId, daysAhead);
      res.json(upcomingDates);
    } catch (_error) {
      this.logger.error('Error getting upcoming dates:', _error);
      next(_error);
    }
  }
}