import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const templateCreateSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^<>]*$/, 'Title cannot contain HTML tags'),
  titleFr: z
    .string()
    .max(255)
    .regex(/^[^<>]*$/, 'French title cannot contain HTML tags')
    .optional(),
  description: z.string().max(2000).optional(),
  descriptionFr: z.string().max(2000).optional(),
  type: z.enum(['UNIT_PLAN', 'LESSON_PLAN']),
  category: z.enum(['BY_SUBJECT', 'BY_GRADE', 'BY_THEME', 'BY_SEASON', 'BY_SKILL', 'CUSTOM']),
  subject: z.string().max(100).optional(),
  gradeMin: z.number().int().min(1).max(12).optional(),
  gradeMax: z.number().int().min(1).max(12).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  isPublic: z.boolean().optional(),
  estimatedWeeks: z.number().int().positive().max(52).optional(),
  estimatedMinutes: z.number().int().positive().max(480).optional(),
  content: z.object({
    // Unit Plan fields
    overview: z.string().optional(),
    learningGoals: z.array(z.string()).optional(),
    bigIdeas: z.string().optional(),
    essentialQuestions: z.array(z.string()).optional(),
    assessments: z.array(z.record(z.unknown())).optional(),
    activities: z.array(z.record(z.unknown())).optional(),
    successCriteria: z.array(z.string()).optional(),
    keyVocabulary: z.array(z.string()).optional(),
    crossCurricularConnections: z.string().optional(),
    differentiationStrategies: z
      .object({
        forStruggling: z.array(z.string()).optional(),
        forAdvanced: z.array(z.string()).optional(),
        forELL: z.array(z.string()).optional(),
        forIEP: z.array(z.string()).optional(),
      })
      .optional(),
    // Lesson Plan fields
    objectives: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    mindsOn: z.string().optional(),
    action: z.string().optional(),
    consolidation: z.string().optional(),
    grouping: z.string().optional(),
    accommodations: z.array(z.string()).optional(),
    modifications: z.array(z.string()).optional(),
    extensions: z.array(z.string()).optional(),
    assessmentType: z.string().optional(),
    assessmentNotes: z.string().optional(),
  }),
  unitStructure: z
    .object({
      phases: z
        .array(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            estimatedDays: z.number().optional(),
            learningGoals: z.array(z.string()).optional(),
          }),
        )
        .optional(),
      resources: z
        .array(
          z.object({
            title: z.string(),
            type: z.string(),
            url: z.string().optional(),
            notes: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  lessonStructure: z
    .object({
      duration: z.number().optional(),
      sections: z
        .array(
          z.object({
            name: z.string(),
            description: z.string(),
            timeAllocation: z.number().optional(),
            activities: z.array(z.string()).optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

const templateUpdateSchema = templateCreateSchema.partial();

const templateSearchSchema = z.object({
  type: z.enum(['UNIT_PLAN', 'LESSON_PLAN']).optional(),
  category: z
    .enum(['BY_SUBJECT', 'BY_GRADE', 'BY_THEME', 'BY_SEASON', 'BY_SKILL', 'CUSTOM'])
    .optional(),
  subject: z.string().optional(),
  gradeMin: z.number().int().min(1).max(12).optional(),
  gradeMax: z.number().int().min(1).max(12).optional(),
  isSystem: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  createdByUserId: z.number().int().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['title', 'usageCount', 'averageRating', 'createdAt', 'lastUsedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

// Get all templates with filtering and search
router.get('/', async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const queryValidation = templateSearchSchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res
        .status(400)
        .json({ error: 'Invalid query parameters', details: queryValidation.error });
    }

    const {
      type,
      category,
      subject,
      gradeMin,
      gradeMax,
      isSystem,
      isPublic,
      createdByUserId,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = queryValidation.data;

    const where: Prisma.PlanTemplateWhereInput = {
      OR: [
        { isSystem: true }, // System templates visible to all
        { isPublic: true }, // Public templates visible to all
        { createdByUserId: userId }, // User's own templates
      ],
    };

    // Apply filters
    if (type) where.type = type;
    if (category) where.category = category;
    if (subject) where.subject = subject;
    if (gradeMin !== undefined || gradeMax !== undefined) {
      where.AND = [];
      if (gradeMin !== undefined) {
        where.AND.push({
          OR: [{ gradeMin: { lte: gradeMin } }, { gradeMin: null }],
        });
      }
      if (gradeMax !== undefined) {
        where.AND.push({
          OR: [{ gradeMax: { gte: gradeMax } }, { gradeMax: null }],
        });
      }
    }
    if (isSystem !== undefined) where.isSystem = isSystem;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (createdByUserId !== undefined) where.createdByUserId = createdByUserId;

    // Text search with database-specific case handling
    if (search) {
      const mode = process.env.DATABASE_URL?.includes('postgresql')
        ? { mode: 'insensitive' as const }
        : {};

      where.OR = [
        { title: { contains: search, ...mode } },
        { description: { contains: search, ...mode } },
        { titleFr: { contains: search, ...mode } },
        { descriptionFr: { contains: search, ...mode } },
      ];
    }

    // Tag filtering - Using JSON array contains for tags
    if (tags && tags.length > 0) {
      where.tags = {
        path: [],
        array_contains: tags,
      } as Prisma.JsonFilter; // Type assertion for JSON array operations
    }

    // Sorting
    const orderBy: Prisma.PlanTemplateOrderByWithRelationInput = {};
    if (sortBy === 'title') orderBy.title = sortOrder;
    else if (sortBy === 'usageCount') orderBy.usageCount = sortOrder;
    else if (sortBy === 'averageRating') orderBy.averageRating = sortOrder;
    else if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;
    else if (sortBy === 'lastUsedAt') orderBy.lastUsedAt = sortOrder;

    const templates = await prisma.planTemplate.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            variations: true,
          },
        },
      },
    });

    const total = await prisma.planTemplate.count({ where });

    res.json({
      templates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    _next(err);
  }
});

// Get a single template
router.get('/:id', async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = await prisma.planTemplate.findFirst({
      where: {
        id: req.params.id,
        OR: [{ isSystem: true }, { isPublic: true }, { createdByUserId: userId }],
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        ratings: {
          select: {
            id: true,
            userId: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        variations: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (err) {
    _next(err);
  }
});

// Create a new template
router.post('/', validate(templateCreateSchema), async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      tags = [],
      keywords = [],
      isPublic = false,
      content,
      unitStructure,
      lessonStructure,
      ...templateData
    } = req.body;

    // Validate grade range
    if (
      templateData.gradeMin &&
      templateData.gradeMax &&
      templateData.gradeMin > templateData.gradeMax
    ) {
      return res.status(400).json({ error: 'Minimum grade cannot be greater than maximum grade' });
    }

    const template = await prisma.planTemplate.create({
      data: {
        ...templateData,
        createdByUserId: userId,
        tags,
        keywords,
        isPublic,
        content,
        unitStructure: unitStructure || null,
        lessonStructure: lessonStructure || null,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            variations: true,
          },
        },
      },
    });

    res.status(201).json(template);
  } catch (err) {
    _next(err);
  }
});

// Update a template
router.put('/:id', validate(templateUpdateSchema), async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ownership (only creator can edit)
    const existing = await prisma.planTemplate.findFirst({
      where: {
        id: req.params.id,
        createdByUserId: userId,
        isSystem: false, // System templates cannot be edited
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Template not found or not editable' });
    }

    const { gradeMin, gradeMax, ...updateData } = req.body;

    // Validate grade range if provided
    if (gradeMin && gradeMax && gradeMin > gradeMax) {
      return res.status(400).json({ error: 'Minimum grade cannot be greater than maximum grade' });
    }

    const template = await prisma.planTemplate.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        gradeMin,
        gradeMax,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        variations: true,
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    res.json(template);
  } catch (err) {
    _next(err);
  }
});

// Delete a template
router.delete('/:id', async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ownership
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: req.params.id,
        createdByUserId: userId,
        isSystem: false, // System templates cannot be deleted
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found or not deletable' });
    }

    await prisma.planTemplate.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (err) {
    _next(err);
  }
});

// Duplicate a template
router.post('/:id/duplicate', async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, isPublic = false } = req.body;

    const original = await prisma.planTemplate.findFirst({
      where: {
        id: req.params.id,
        OR: [{ isSystem: true }, { isPublic: true }, { createdByUserId: userId }],
      },
    });

    if (!original) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const duplicated = await prisma.planTemplate.create({
      data: {
        title: title || `${original.title} (Copy)`,
        titleFr: original.titleFr ? `${original.titleFr} (Copie)` : null,
        description: original.description,
        descriptionFr: original.descriptionFr,
        type: original.type,
        category: original.category,
        subject: original.subject,
        gradeMin: original.gradeMin,
        gradeMax: original.gradeMax,
        tags: original.tags,
        keywords: original.keywords,
        createdByUserId: userId,
        isSystem: false,
        isPublic,
        content: original.content,
        estimatedWeeks: original.estimatedWeeks,
        unitStructure: original.unitStructure,
        estimatedMinutes: original.estimatedMinutes,
        lessonStructure: original.lessonStructure,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            ratings: true,
            variations: true,
          },
        },
      },
    });

    res.status(201).json(duplicated);
  } catch (err) {
    _next(err);
  }
});

// Apply template to create a new plan
router.post('/:id/apply', async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { customizations = {} } = req.body;

    const template = await prisma.planTemplate.findFirst({
      where: {
        id: req.params.id,
        OR: [{ isSystem: true }, { isPublic: true }, { createdByUserId: userId }],
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Update usage tracking
    await prisma.planTemplate.update({
      where: { id: template.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    // Merge template content with user customizations
    const appliedContent = {
      ...(template.content as Record<string, unknown>),
      ...(customizations || {}),
    };

    res.json({
      template: {
        id: template.id,
        title: template.title,
        type: template.type,
        content: appliedContent,
        unitStructure: template.unitStructure,
        lessonStructure: template.lessonStructure,
        estimatedWeeks: template.estimatedWeeks,
        estimatedMinutes: template.estimatedMinutes,
      },
      appliedContent,
    });
  } catch (err) {
    _next(err);
  }
});

// Rate a template
router.post('/:id/rate', async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if template exists and is accessible
    const template = await prisma.planTemplate.findFirst({
      where: {
        id: req.params.id,
        OR: [{ isSystem: true }, { isPublic: true }, { createdByUserId: userId }],
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Upsert rating
    const templateRating = await prisma.templateRating.upsert({
      where: {
        templateId_userId: {
          templateId: req.params.id,
          userId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        templateId: req.params.id,
        userId,
        rating,
        comment,
      },
    });

    // Recalculate average rating
    const ratings = await prisma.templateRating.findMany({
      where: { templateId: req.params.id },
      select: { rating: true },
    });

    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    await prisma.planTemplate.update({
      where: { id: req.params.id },
      data: { averageRating },
    });

    res.json(templateRating);
  } catch (err) {
    _next(err);
  }
});

// Get categories and subjects for filtering
router.get('/metadata/options', async (req: Request, res, _next) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [subjects, grades, categories, tags] = await Promise.all([
      prisma.planTemplate.findMany({
        where: {
          OR: [{ isSystem: true }, { isPublic: true }, { createdByUserId: userId }],
          subject: { not: null },
        },
        select: { subject: true },
        distinct: ['subject'],
      }),
      prisma.planTemplate.findMany({
        where: {
          AND: [
            {
              OR: [{ isSystem: true }, { isPublic: true }, { createdByUserId: userId }],
            },
            {
              OR: [{ gradeMin: { not: null } }, { gradeMax: { not: null } }],
            },
          ],
        },
        select: { gradeMin: true, gradeMax: true },
      }),
      prisma.planTemplate.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.planTemplate.findMany({
        where: {
          OR: [{ isSystem: true }, { isPublic: true }, { createdByUserId: userId }],
        },
        select: { tags: true },
      }),
    ]);

    const uniqueSubjects = subjects
      .map((t) => t.subject)
      .filter((s) => s !== null)
      .sort();

    const gradeRange = grades.reduce(
      (range, template) => {
        if (template.gradeMin) range.min = Math.min(range.min, template.gradeMin);
        if (template.gradeMax) range.max = Math.max(range.max, template.gradeMax);
        return range;
      },
      { min: 12, max: 1 },
    );

    const allTags = tags
      .flatMap((t) => (Array.isArray(t.tags) ? t.tags : []))
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .sort();

    res.json({
      subjects: uniqueSubjects,
      grades: Array.from(
        { length: gradeRange.max - gradeRange.min + 1 },
        (_, i) => gradeRange.min + i,
      ),
      categories: categories.map((c) => c.category),
      tags: allTags,
    });
  } catch (err) {
    _next(err);
  }
});

export default router;
