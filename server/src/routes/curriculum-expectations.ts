import type { Request, Response } from 'express';
import { Router } from 'express';

import { logger } from '../logger';
import type { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { cache, cacheMiddleware, CacheKeys, CacheTags } from '../services/cache';
import {
  getPaginationParams,
  createPaginatedResponse,
  setPaginationHeaders,
  validatePagination,
  createSearchFilter,
  combineFilters,
  fetchPaginatedData,
} from '../utils/pagination';

import { asyncHandler } from './base/middleware';

const router = Router();

// Get curriculum expectations by bulk search (for autocomplete)
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
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
    logger.error('Error searching curriculum expectations:', error);
    res.status(500).json({ error: 'Failed to search curriculum expectations' });
  }
}));

// Get all curriculum expectations with optional filtering
router.get('/', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  try {
    const pagination = getPaginationParams(req);
    const { subject, grade, strand } = req.query as Record<string, string>;
    const gradeNumber = grade && grade !== '' ? parseInt(grade, 10) : undefined;

    // Build filters
    const baseFilter: Prisma.CurriculumExpectationWhereInput = {};
    if (subject && subject !== '') {
baseFilter.subject = subject;
}
    if (gradeNumber) {
baseFilter.grade = gradeNumber;
}
    if (strand && strand !== '') {
baseFilter.strand = strand;
}

    // Build search filter for multiple fields
    const searchFilter = createSearchFilter(pagination.search, [
      'description',
      'code',
      'strand',
      'substrand',
    ]);

    // Combine filters
    const where = combineFilters(baseFilter, searchFilter);

    // Build order by clause
    const orderBy: Prisma.CurriculumExpectationOrderByWithRelationInput = {};
    const sortBy = pagination.sortBy as keyof Prisma.CurriculumExpectationOrderByWithRelationInput;
    if (
      sortBy &&
      sortBy in
        { code: true, description: true, strand: true, substrand: true, grade: true, subject: true }
    ) {
      orderBy[sortBy] = pagination.sortOrder || 'asc';
    } else {
      orderBy.code = 'asc'; // Default sort by expectation code
    }

    // Fetch paginated data
    const { data: expectations, total } = await fetchPaginatedData(
      () => prisma.curriculumExpectation.count({ where }),
      () =>
        prisma.curriculumExpectation.findMany({
          where,
          orderBy,
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
      pagination,
    );

    // Create paginated response
    const response = createPaginatedResponse(
      expectations,
      {
        page: pagination.page,
        limit: pagination.limit,
        total,
      },
      `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`,
    );

    // Set pagination headers
    setPaginationHeaders(res, response.pagination);

    res.json(response);
    return;
  } catch (error) {
    logger.error('Error fetching curriculum expectations:', error);
    res.status(500).json({ error: 'Failed to fetch curriculum expectations' });
  }
}));

// Get a single curriculum expectation by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
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
    logger.error('Error fetching curriculum expectation:', _error);
    res.status(500).json({ error: 'Failed to fetch curriculum expectation' });
  }
}));

// Get distinct values for filters
router.get(
  '/filters/options',
  asyncHandler(cacheMiddleware('curriculum:filters', { ttl: 3600, tags: CacheTags.curriculum() })),
  asyncHandler(async (_req: Request, res: Response) => {
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
      logger.error('Error fetching filter options:', _error);
      res.status(500).json({ error: 'Failed to fetch filter options' });
      return;
    }
  }),
);

export { router };
