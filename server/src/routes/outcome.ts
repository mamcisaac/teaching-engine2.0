import { Router } from 'express';
import { prisma } from '../prisma';
import { getOutcomesCoverage } from '../utils/outcomeCoverage';

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

// Get outcome coverage data
router.get('/coverage', async (req, res, next) => {
  const { subject, grade, milestoneId, domain } = req.query as {
    subject?: string;
    grade?: string;
    milestoneId?: string;
    domain?: string;
  };

  try {
    const coverage = await getOutcomesCoverage({
      ...(subject && { subject }),
      ...(grade && { grade: Number(grade) }),
      ...(milestoneId && { milestoneId: Number(milestoneId) }),
    });

    // Get additional outcome details for the response
    const outcomeIds = coverage.map((cov: { outcomeId: string }) => cov.outcomeId);
    const outcomes = await prisma.outcome.findMany({
      where: { id: { in: outcomeIds } },
      select: {
        id: true,
        code: true,
        description: true,
        subject: true,
        domain: true,
        grade: true,
      },
    });

    // Get activities linked to each outcome for the coveredBy field
    const coverageDataPromises = coverage.map(
      async (cov: { outcomeId: string; status: string; linked: number; completed: number }) => {
        const outcome = outcomes.find((o) => o.id === cov.outcomeId);

        // Get activities that cover this outcome
        const coveredByActivities = await prisma.activity.findMany({
          where: {
            outcomes: {
              some: {
                outcomeId: cov.outcomeId,
              },
            },
          },
          select: {
            id: true,
            title: true,
          },
        });

        return {
          outcomeId: cov.outcomeId,
          code: outcome?.code || '',
          description: outcome?.description || '',
          subject: outcome?.subject || '',
          domain: outcome?.domain || null,
          grade: outcome?.grade || 0,
          isCovered: cov.linked > 0,
          coveredBy: coveredByActivities,
        };
      },
    );

    const coverageData = await Promise.all(coverageDataPromises);

    // Filter by domain if specified
    const filteredData = domain
      ? coverageData.filter((item) => item.domain === domain)
      : coverageData;

    res.json(filteredData);
  } catch (err) {
    next(err);
  }
});

export default router;
