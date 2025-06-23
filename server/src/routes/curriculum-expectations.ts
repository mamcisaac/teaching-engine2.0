import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Get all curriculum expectations with optional filtering
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { subject, grade, strand, search } = req.query;
    
    const where: Prisma.CurriculumExpectationWhereInput = {};
    
    if (subject) where.subject = String(subject);
    if (grade) where.grade = Number(grade);
    if (strand) where.strand = String(strand);
    if (search) {
      where.OR = [
        { code: { contains: String(search) } },
        { description: { contains: String(search) } },
        { descriptionFr: { contains: String(search) } },
      ];
    }
    
    const expectations = await prisma.curriculumExpectation.findMany({
      where,
      orderBy: [
        { subject: 'asc' },
        { grade: 'asc' },
        { strand: 'asc' },
        { code: 'asc' },
      ],
      include: {
        unitPlans: { select: { unitPlan: { select: { id: true, title: true } } } },
        lessonPlans: { select: { lessonPlan: { select: { id: true, title: true } } } },
      },
    });
    
    res.json(expectations);
  } catch (err) {
    next(err);
  }
});

// Get a single curriculum expectation
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const expectation = await prisma.curriculumExpectation.findUnique({
      where: { id: req.params.id },
      include: {
        unitPlans: {
          include: {
            unitPlan: {
              include: {
                longRangePlan: true,
                _count: { select: { lessonPlans: true } },
              },
            },
          },
        },
        lessonPlans: {
          include: {
            lessonPlan: {
              include: {
                unitPlan: { select: { id: true, title: true } },
                daybookEntry: true,
              },
            },
          },
        },
        embedding: true,
      },
    });
    
    if (!expectation) {
      return res.status(404).json({ error: 'Curriculum expectation not found' });
    }
    
    res.json(expectation);
  } catch (err) {
    next(err);
  }
});

// Search curriculum expectations with semantic similarity (AI-powered)
router.post('/search', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { query, limit = 10, filters } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // TODO: Implement semantic search using embeddings
    // For now, fallback to text search
    const where: Prisma.CurriculumExpectationWhereInput = {
      OR: [
        { code: { contains: query } },
        { description: { contains: query } },
        { descriptionFr: { contains: query } },
        { strand: { contains: query } },
      ],
    };
    
    if (filters?.subject) where.subject = filters.subject;
    if (filters?.grade) where.grade = filters.grade;
    
    const expectations = await prisma.curriculumExpectation.findMany({
      where,
      take: Number(limit),
      include: {
        _count: {
          select: {
            unitPlans: true,
            lessonPlans: true,
          },
        },
      },
    });
    
    res.json(expectations);
  } catch (err) {
    next(err);
  }
});

// Cluster curriculum expectations by similarity (AI-powered)
router.post('/cluster', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { expectationIds, clusterCount = 5 } = req.body;
    
    if (!expectationIds || !Array.isArray(expectationIds)) {
      return res.status(400).json({ error: 'expectationIds array is required' });
    }
    
    // TODO: Implement clustering using embeddings
    // For now, return a placeholder response
    const clusters = {
      message: 'Clustering not yet implemented',
      expectationIds,
      clusterCount,
    };
    
    res.json(clusters);
  } catch (err) {
    next(err);
  }
});

// Get curriculum coverage report
router.get('/coverage/report', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { startDate, endDate, subject, grade } = req.query;
    
    // Get all expectations for the filters
    const expectationsWhere: Prisma.CurriculumExpectationWhereInput = {};
    if (subject) expectationsWhere.subject = String(subject);
    if (grade) expectationsWhere.grade = Number(grade);
    
    const allExpectations = await prisma.curriculumExpectation.findMany({
      where: expectationsWhere,
      select: {
        id: true,
        code: true,
        description: true,
        strand: true,
      },
    });
    
    // Get covered expectations through lesson plans
    const lessonPlansWhere: Prisma.ETFOLessonPlanWhereInput = {
      userId,
    };
    
    if (startDate || endDate) {
      lessonPlansWhere.date = {};
      if (startDate) lessonPlansWhere.date.gte = new Date(String(startDate));
      if (endDate) lessonPlansWhere.date.lte = new Date(String(endDate));
    }
    
    const coveredExpectations = await prisma.eTFOLessonPlanExpectation.findMany({
      where: {
        lessonPlan: lessonPlansWhere,
        expectation: expectationsWhere,
      },
      select: {
        expectationId: true,
        expectation: {
          select: {
            id: true,
            code: true,
            description: true,
            strand: true,
          },
        },
        lessonPlan: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });
    
    // Calculate coverage statistics
    const coveredIds = new Set(coveredExpectations.map(ce => ce.expectationId));
    const coverage = {
      total: allExpectations.length,
      covered: coveredIds.size,
      percentage: allExpectations.length > 0 
        ? Math.round((coveredIds.size / allExpectations.length) * 100) 
        : 0,
      byStrand: {} as Record<string, { total: number; covered: number }>,
      uncovered: allExpectations.filter(e => !coveredIds.has(e.id)),
      details: coveredExpectations,
    };
    
    // Calculate coverage by strand
    for (const exp of allExpectations) {
      if (!coverage.byStrand[exp.strand]) {
        coverage.byStrand[exp.strand] = { total: 0, covered: 0 };
      }
      coverage.byStrand[exp.strand].total++;
      if (coveredIds.has(exp.id)) {
        coverage.byStrand[exp.strand].covered++;
      }
    }
    
    res.json(coverage);
  } catch (err) {
    next(err);
  }
});

export default router;