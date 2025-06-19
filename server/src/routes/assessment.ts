import { Router } from 'express';
import { prisma } from '../prisma';
import {
  validate,
  assessmentTemplateCreateSchema,
  assessmentTemplateUpdateSchema,
  assessmentResultCreateSchema,
} from '../validation';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/assessments/templates - Get all assessment templates
router.get('/templates', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const templates = await prisma.assessmentTemplate.findMany({
      where: { userId },
      include: {
        results: {
          select: {
            id: true,
            date: true,
            groupScore: true,
          },
          orderBy: { date: 'desc' },
          take: 1,
        },
        _count: {
          select: { results: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const templatesWithStats = templates.map((template) => ({
      ...template,
      outcomeIds: JSON.parse(template.outcomeIds),
      lastResult: template.results[0] || null,
      totalResults: template._count.results,
    }));

    res.json(templatesWithStats);
  } catch (err) {
    next(err);
  }
});

// POST /api/assessments/templates - Create assessment template
router.post(
  '/templates',
  authMiddleware,
  validate(assessmentTemplateCreateSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId!;
      const { title, type, description, outcomeIds, rubricCriteria } = req.body;

      const template = await prisma.assessmentTemplate.create({
        data: {
          title,
          type,
          description,
          outcomeIds: JSON.stringify(outcomeIds),
          rubricCriteria,
          userId,
        },
      });

      res.status(201).json({
        ...template,
        outcomeIds: JSON.parse(template.outcomeIds),
      });
    } catch (err) {
      next(err);
    }
  },
);

// PUT /api/assessments/templates/:id - Update assessment template
router.put(
  '/templates/:id',
  authMiddleware,
  validate(assessmentTemplateUpdateSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const updateData = { ...req.body };

      if (updateData.outcomeIds) {
        updateData.outcomeIds = JSON.stringify(updateData.outcomeIds);
      }

      const template = await prisma.assessmentTemplate.update({
        where: {
          id: parseInt(id),
          userId, // Ensure user owns the template
        },
        data: updateData,
      });

      res.json({
        ...template,
        outcomeIds: JSON.parse(template.outcomeIds),
      });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/assessments/templates/:id - Delete assessment template
router.delete('/templates/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Delete associated results first
    await prisma.assessmentResult.deleteMany({
      where: { templateId: parseInt(id) },
    });

    await prisma.assessmentTemplate.delete({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/results - Get assessment results
router.get('/results', async (req, res, next) => {
  try {
    const { week, templateId } = req.query as {
      week?: string;
      templateId?: string;
    };

    const whereCondition: Record<string, unknown> = {};

    if (week) {
      const weekStart = new Date(week);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      whereCondition.date = {
        gte: weekStart,
        lt: weekEnd,
      };
    }

    if (templateId) {
      whereCondition.templateId = parseInt(templateId);
    }

    const results = await prisma.assessmentResult.findMany({
      where: whereCondition,
      include: {
        template: {
          select: {
            title: true,
            type: true,
            outcomeIds: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const resultsWithParsedOutcomes = results.map((result) => ({
      ...result,
      template: {
        ...result.template,
        outcomeIds: JSON.parse(result.template.outcomeIds),
      },
    }));

    res.json(resultsWithParsedOutcomes);
  } catch (err) {
    next(err);
  }
});

// POST /api/assessments/results - Create assessment result
router.post('/results', validate(assessmentResultCreateSchema), async (req, res, next) => {
  try {
    const { templateId, date, groupScore, notes } = req.body;

    const result = await prisma.assessmentResult.create({
      data: {
        templateId,
        date: new Date(date),
        groupScore,
        notes,
      },
      include: {
        template: {
          select: {
            title: true,
            type: true,
            outcomeIds: true,
          },
        },
      },
    });

    res.status(201).json({
      ...result,
      template: {
        ...result.template,
        outcomeIds: JSON.parse(result.template.outcomeIds),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/by-outcome/:id - Get assessments for a specific outcome
router.get('/by-outcome/:id', async (req, res, next) => {
  try {
    const { id: outcomeId } = req.params;

    // Find templates that include this outcome
    const templates = await prisma.assessmentTemplate.findMany({
      where: {
        outcomeIds: {
          contains: `"${outcomeId}"`,
        },
      },
      include: {
        results: {
          orderBy: { date: 'desc' },
        },
      },
    });

    const assessmentData = {
      outcomeId,
      assessmentCount: templates.length,
      totalResults: templates.reduce((acc, template) => acc + template.results.length, 0),
      averageScore: 0,
      lastAssessmentDate: null as Date | null,
      assessments: templates.map((template) => ({
        id: template.id,
        title: template.title,
        type: template.type,
        resultCount: template.results.length,
        averageScore:
          template.results.length > 0
            ? Math.round(
                template.results.reduce((acc, result) => acc + (result.groupScore || 0), 0) /
                  template.results.length,
              )
            : 0,
        lastResult: template.results[0] || null,
      })),
    };

    // Calculate overall average score and last assessment date
    const allResults = templates.flatMap((template) => template.results);
    if (allResults.length > 0) {
      const validScores = allResults.filter((result) => result.groupScore !== null);
      if (validScores.length > 0) {
        assessmentData.averageScore = Math.round(
          validScores.reduce((acc, result) => acc + (result.groupScore || 0), 0) /
            validScores.length,
        );
      }
      assessmentData.lastAssessmentDate = allResults.sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      )[0].date;
    }

    res.json(assessmentData);
  } catch (err) {
    next(err);
  }
});

export default router;
