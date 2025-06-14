import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  const { subject, grade, search } = req.query as {
    subject?: string;
    grade?: string;
    search?: string;
  };
  try {
    const outcomes = await prisma.outcome.findMany({
      where: {
        ...(subject ? { subject } : {}),
        ...(grade ? { grade: Number(grade) } : {}),
        ...(search
          ? {
              OR: [{ code: { contains: search } }, { description: { contains: search } }],
            }
          : {}),
      },
      orderBy: { code: 'asc' },
    });
    res.json(outcomes);
  } catch (err) {
    next(err);
  }
});

// New endpoint for outcome coverage
router.get('/coverage', async (req, res, next) => {
  const { subject, grade, domain } = req.query as {
    subject?: string;
    grade?: string;
    domain?: string;
  };
  
  try {
    // Get all outcomes with their related activities
    const outcomes = await prisma.outcome.findMany({
      where: {
        ...(subject ? { subject } : {}),
        ...(grade ? { grade: Number(grade) } : {}),
        ...(domain ? { domain } : {}),
      },
      include: {
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    // Transform the outcomes into the coverage format
    const coverageData = outcomes.map(outcome => {
      // Get the activities covering this outcome
      const activities = outcome.activities.map(ao => ao.activity);
      
      return {
        outcomeId: outcome.id,
        code: outcome.code,
        description: outcome.description,
        subject: outcome.subject,
        domain: outcome.domain,
        grade: outcome.grade,
        isCovered: activities.length > 0,
        coveredBy: activities.map(activity => ({
          id: activity.id,
          title: activity.title,
        })),
      };
    });

    res.json(coverageData);
  } catch (err) {
    next(err);
  }
});

export default router;
