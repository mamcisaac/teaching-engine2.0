import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';

const router = Router();

// Simple text search helper function for curriculum expectations
async function textSearch(
  query: string,
  limit: number,
  filters?: { subject?: string; grade?: number; strand?: string },
) {
  const where: Prisma.CurriculumExpectationWhereInput = {
    AND: []
  };

  // Add text search
  if (query) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    where.AND!.push({
      OR: [
        { description: { contains: query, mode: 'insensitive' as const } },
        { code: { contains: query, mode: 'insensitive' as const } },
        { strand: { contains: query, mode: 'insensitive' as const } },
        { substrand: { contains: query, mode: 'insensitive' as const } },
        ...searchTerms.map(term => ({
          description: { contains: term, mode: 'insensitive' as const }
        }))
      ]
    });
  }

  // Add filters
  if (filters?.subject) where.AND!.push({ subject: filters.subject });
  if (filters?.grade) where.AND!.push({ grade: filters.grade });
  if (filters?.strand) where.AND!.push({ strand: filters.strand });

  const expectations = await prisma.curriculumExpectation.findMany({
    where,
    take: limit,
    orderBy: { code: 'asc' }
  });

  return expectations;
}

// Get all curriculum expectations with optional filtering
router.get('/', async (req: Request, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      subject,
      grade,
      strand,
      search,
      sortBy = 'code',
      sortOrder = 'asc',
    } = req.query as Record<string, string>;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const gradeNumber = grade ? parseInt(grade, 10) : undefined;

    // Handle search queries
    if (search) {
      const results = await textSearch(search, limitNumber, {
        subject,
        grade: gradeNumber,
        strand,
      });

      res.json({
        expectations: results,
        total: results.length,
        page: pageNumber,
        limit: limitNumber,
        hasMore: results.length === limitNumber,
      });
      return;
    }

    // Build where clause for regular filtering
    const where: Prisma.CurriculumExpectationWhereInput = {};
    if (subject) where.subject = subject;
    if (gradeNumber) where.grade = gradeNumber;
    if (strand) where.strand = strand;

    // Build order by clause
    const orderBy: Prisma.CurriculumExpectationOrderByWithRelationInput = {};
    if (sortBy === 'code') orderBy.code = sortOrder as 'asc' | 'desc';
    else if (sortBy === 'description') orderBy.description = sortOrder as 'asc' | 'desc';
    else if (sortBy === 'subject') orderBy.subject = sortOrder as 'asc' | 'desc';
    else if (sortBy === 'grade') orderBy.grade = sortOrder as 'asc' | 'desc';
    else if (sortBy === 'strand') orderBy.strand = sortOrder as 'asc' | 'desc';

    // Get expectations with pagination
    const [expectations, total] = await Promise.all([
      prisma.curriculumExpectation.findMany({
        where,
        orderBy,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),
      prisma.curriculumExpectation.count({ where }),
    ]);

    res.json({
      expectations,
      total,
      page: pageNumber,
      limit: limitNumber,
      hasMore: (pageNumber - 1) * limitNumber + expectations.length < total,
    });
  } catch (error) {
    console.error('Error fetching curriculum expectations:', error);
    res.status(500).json({ error: 'Failed to fetch curriculum expectations' });
  }
});

// Get a single curriculum expectation by ID
router.get('/:id', async (req: Request, res) => {
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

    if (!expectation) {
      return res.status(404).json({ error: 'Curriculum expectation not found' });
    }

    res.json(expectation);
  } catch (error) {
    console.error('Error fetching curriculum expectation:', error);
    res.status(500).json({ error: 'Failed to fetch curriculum expectation' });
  }
});

// Get distinct values for filters
router.get('/filters/options', async (req: Request, res) => {
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
      subjects: subjects.map(s => s.subject),
      grades: grades.map(g => g.grade),
      strands: strands.map(s => s.strand),
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

export default router;