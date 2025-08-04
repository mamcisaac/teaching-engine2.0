import type { Request, Response } from 'express';
import { Router } from 'express';

import { logger } from '../logger';
import { prisma } from '../prisma';
import { cache, cacheMiddleware, CacheKeys, CacheTags } from '../services/cache';
import {
  createSearchFilter,
} from '../utils/pagination';
import { getErrorMessage } from '../utils/type-guards';

const router = Router();

// Get curriculum expectations by bulk search (for autocomplete)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = '10' } = req.query as Record<string, string>;
    const limitNumber = Math.min(parseInt(limit, 10), 50); // Cap at 50 for autocomplete

    if (!q || q === '' || q.length < 2) {
      res.json({ results: [] });
      return;
    }

    // Try cache first
    const cacheKey = CacheKeys.curriculumSearch(`${q}:${limitNumber}`);
    const cacheService = cache();

    const results = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const searchFilter = createSearchFilter(q, ['code', 'description', 'strand', 'substrand']);

        const expectations = await prisma.curriculumExpectation.findMany({
          where: searchFilter,
          take: limitNumber,
          orderBy: { code: 'asc' },
          select: {
            id: true,
            code: true,
            description: true,
            subject: true,
            grade: true,
            strand: true,
          },
        });

        return { results: expectations };
      },
      { ttl: 300, tags: CacheTags.curriculum() }, // Cache for 5 minutes
    );

    res.json(results);
    return;
  } catch (error) {
    logger.error('Error searching curriculum expectations:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to search curriculum expectations' });
  }
});

// Get all curriculum expectations with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { grade, subject, strand, search } = req.query as Record<string, string>;
    
    // Build where clause based on query parameters
    const where: any = {};
    
    // Filter by grade if provided
    if (grade != undefined && grade !== '') {
      where.grade = parseInt(grade, 10);
    }
    
    // Filter by subject if provided
    if (subject != undefined && subject !== '' && subject !== 'all') {
      where.subject = subject;
    }
    
    // Filter by strand if provided
    if (strand != undefined && strand !== '') {
      where.strand = strand;
    }
    
    // Add search functionality if search query provided
    if (search != undefined && search !== '') {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionFr: { contains: search, mode: 'insensitive' } },
        { strand: { contains: search, mode: 'insensitive' } },
        { strandFr: { contains: search, mode: 'insensitive' } },
        { substrand: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Fetch expectations with filters
    const expectations = await prisma.curriculumExpectation.findMany({
      where,
      orderBy: [
        { subject: 'asc' },
        { strand: 'asc' }, 
        { code: 'asc' }
      ],
    });

    // Return all matching expectations (no arbitrary limit)
    res.json({
      data: expectations,
      total: expectations.length,
    });
    return;
  } catch (error) {
    logger.error('Error fetching curriculum expectations:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to fetch curriculum expectations' });
  }
});

// Get a single curriculum expectation by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const expectation = await prisma.curriculumExpectation.findUnique({
      where: { id },
      include: {
        longRangePlans: {
          include: {
            longRangePlan: true,
          },
        },
        unitPlans: {
          include: {
            unitPlan: true,
          },
        },
        lessonPlans: {
          include: {
            lessonPlan: true,
          },
        },
        daybookEntries: {
          include: {
            daybookEntry: true,
          },
        },
      },
    });

    if (expectation === null) {
      res.status(404).json({ error: 'Curriculum expectation not found' });
      return;
    }

    res.json(expectation);
    return;
  } catch (_error) {
    logger.error('Error fetching curriculum expectation:', getErrorMessage(_error));
    res.status(500).json({ error: 'Failed to fetch curriculum expectation' });
  }
});

// Get distinct values for filters
router.get(
  '/filters/options',
  cacheMiddleware('curriculum:filters', { ttl: 3600, tags: CacheTags.curriculum() }),
  async (_req: Request, res: Response) => {
    try {
      const [subjects, grades, strands] = await Promise.all([
        prisma.curriculumExpectation.findMany({
          select: { subject: true },
          distinct: ['subject'],
          orderBy: { subject: 'asc' },
        }),
        prisma.curriculumExpectation.findMany({
          select: { grade: true },
          distinct: ['grade'],
          orderBy: { grade: 'asc' },
        }),
        prisma.curriculumExpectation.findMany({
          select: { strand: true },
          distinct: ['strand'],
          orderBy: { strand: 'asc' },
        }),
      ]);

      res.json({
        subjects: subjects.map((s: { subject: string }) => s.subject),
        grades: grades.map((g: { grade: number }) => g.grade),
        strands: strands.map((s: { strand: string }) => s.strand),
      });
      return;
    } catch (_error) {
      logger.error('Error fetching filter options:', getErrorMessage(_error));
      res.status(500).json({ error: 'Failed to fetch filter options' });
      return;
    }
  },
);

export { router };
