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
  const { subject, grade, milestoneId } = req.query as {
    subject?: string;
    grade?: string;
    milestoneId?: string;
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

    // Combine coverage data with outcome details
    const coverageData = coverage.map(
      (cov: { outcomeId: string; status: string; linked: number; completed: number }) => {
        const outcome = outcomes.find((o) => o.id === cov.outcomeId);
        return {
          outcomeId: cov.outcomeId,
          status: cov.status,
          linked: cov.linked,
          completed: cov.completed,
          ...outcome,
        };
      },
    );

    res.json(coverageData);
  } catch (err) {
    next(err);
  }
});

export default router;
