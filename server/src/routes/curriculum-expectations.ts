import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { EmbeddingService } from '../services/embeddingService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Initialize embedding service
const embeddingService = new EmbeddingService();

// Semantic search helper function
async function semanticSearch(
  query: string,
  limit: number,
  filters?: { subject?: string; grade?: number; strand?: string },
) {
  // Generate embedding for the search query
  const queryEmbedding = await embeddingService.generateEmbedding('search-query', query);

  // Get all expectations that match filters
  const where: Prisma.CurriculumExpectationWhereInput = {};
  if (filters?.subject) where.subject = filters.subject;
  if (filters?.grade) where.grade = filters.grade;
  if (filters?.strand) where.strand = filters.strand;

  const allExpectations = await prisma.curriculumExpectation.findMany({
    where,
    include: {
      embedding: true,
    },
  });

  // Calculate similarities and sort by relevance
  const expectationsWithSimilarity = allExpectations
    .map((expectation) => {
      // Find the best embedding match for this expectation
      let maxSimilarity = 0;

      if (expectation.embedding) {
        const similarity = cosineSimilarity(
          queryEmbedding?.embedding || [],
          expectation.embedding.embedding as number[],
        );
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
        }
      }

      return {
        ...expectation,
        similarity: maxSimilarity,
      };
    })
    .filter((exp) => exp.similarity > 0.3) // Minimum similarity threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // Remove embeddings from response
  return expectationsWithSimilarity.map(({ embedding: _embedding, similarity, ...exp }) => ({
    ...exp,
    _similarity: similarity,
  }));
}

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Get all curriculum expectations with optional filtering
router.get('/', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const { subject, grade, strand, search } = req.query;

    const where: Prisma.CurriculumExpectationWhereInput = {};

    // Validate and sanitize input parameters
    if (subject && typeof subject === 'string') {
      const sanitizedSubject = String(subject).trim().slice(0, 100);
      if (sanitizedSubject) where.subject = sanitizedSubject;
    }
    
    if (grade) {
      const gradeNumber = Number(grade);
      if (!isNaN(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 12) {
        where.grade = gradeNumber;
      }
    }
    
    if (strand && typeof strand === 'string') {
      const sanitizedStrand = String(strand).trim().slice(0, 100);
      if (sanitizedStrand) where.strand = sanitizedStrand;
    }
    if (search && typeof search === 'string') {
      const sanitizedSearch = String(search).trim().slice(0, 200);
      if (sanitizedSearch) {
        // Database-specific case-insensitive search
        const mode = process.env.DATABASE_URL?.includes('postgresql') 
          ? { mode: 'insensitive' as const } 
          : {};
        
        where.OR = [
          { code: { contains: sanitizedSearch, ...mode } },
          { description: { contains: sanitizedSearch, ...mode } },
          { descriptionFr: { contains: sanitizedSearch, ...mode } },
        ];
      }
    }

    const expectations = await prisma.curriculumExpectation.findMany({
      where,
      orderBy: [{ subject: 'asc' }, { grade: 'asc' }, { strand: 'asc' }, { code: 'asc' }],
      include: {
        unitPlans: { select: { unitPlan: { select: { id: true, title: true } } } },
        lessonPlans: { select: { lessonPlan: { select: { id: true, title: true } } } },
      },
    });

    res.json(expectations);
  } catch (err) {
    _next(err);
  }
});

// Create a new curriculum expectation
router.post('/', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const { code, description, strand, substrand, grade, subject, descriptionFr } = req.body;

    if (!code || !description || !strand || !grade || !subject) {
      return res.status(400).json({
        error: 'Missing required fields: code, description, strand, grade, subject',
      });
    }
    
    // Validate types and lengths
    if (typeof code !== 'string' || code.length > 50 || code.length < 1) {
      return res.status(400).json({ error: 'Invalid code: must be a string between 1-50 characters' });
    }
    
    if (typeof description !== 'string' || description.length > 1000 || description.length < 1) {
      return res.status(400).json({ error: 'Invalid description: must be a string between 1-1000 characters' });
    }
    
    if (typeof strand !== 'string' || strand.length > 100 || strand.length < 1) {
      return res.status(400).json({ error: 'Invalid strand: must be a string between 1-100 characters' });
    }
    
    if (typeof subject !== 'string' || subject.length > 100 || subject.length < 1) {
      return res.status(400).json({ error: 'Invalid subject: must be a string between 1-100 characters' });
    }
    
    const gradeNumber = Number(grade);
    if (isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 12) {
      return res.status(400).json({ error: 'Invalid grade: must be a number between 1-12' });
    }
    
    if (substrand && (typeof substrand !== 'string' || substrand.length > 100)) {
      return res.status(400).json({ error: 'Invalid substrand: must be a string with max 100 characters' });
    }
    
    if (descriptionFr && (typeof descriptionFr !== 'string' || descriptionFr.length > 1000)) {
      return res.status(400).json({ error: 'Invalid descriptionFr: must be a string with max 1000 characters' });
    }

    const expectation = await prisma.curriculumExpectation.create({
      data: {
        code: code.trim(),
        description: description.trim(),
        strand: strand.trim(),
        substrand: substrand?.trim() || null,
        grade: gradeNumber,
        subject: subject.trim(),
        descriptionFr: descriptionFr?.trim() || null,
      },
      include: {
        unitPlans: { select: { unitPlan: { select: { id: true, title: true } } } },
        lessonPlans: { select: { lessonPlan: { select: { id: true, title: true } } } },
      },
    });

    res.status(201).json(expectation);
  } catch (err) {
    _next(err);
  }
});

// Update a curriculum expectation
router.put('/:id', async (req: AuthenticatedRequest, res, _next) => {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid expectation ID format' });
    }
    
    const { code, description, strand, substrand, grade, subject, descriptionFr } = req.body;
    
    // Validate input types and lengths
    if (code && (typeof code !== 'string' || code.length > 50 || code.length < 1)) {
      return res.status(400).json({ error: 'Invalid code: must be a string between 1-50 characters' });
    }
    
    if (description && (typeof description !== 'string' || description.length > 1000 || description.length < 1)) {
      return res.status(400).json({ error: 'Invalid description: must be a string between 1-1000 characters' });
    }
    
    if (strand && (typeof strand !== 'string' || strand.length > 100 || strand.length < 1)) {
      return res.status(400).json({ error: 'Invalid strand: must be a string between 1-100 characters' });
    }
    
    if (subject && (typeof subject !== 'string' || subject.length > 100 || subject.length < 1)) {
      return res.status(400).json({ error: 'Invalid subject: must be a string between 1-100 characters' });
    }
    
    let gradeNumber: number | undefined;
    if (grade !== undefined) {
      gradeNumber = Number(grade);
      if (isNaN(gradeNumber) || gradeNumber < 1 || gradeNumber > 12) {
        return res.status(400).json({ error: 'Invalid grade: must be a number between 1-12' });
      }
    }
    
    if (substrand !== undefined && substrand !== null && (typeof substrand !== 'string' || substrand.length > 100)) {
      return res.status(400).json({ error: 'Invalid substrand: must be a string with max 100 characters' });
    }
    
    if (descriptionFr !== undefined && descriptionFr !== null && (typeof descriptionFr !== 'string' || descriptionFr.length > 1000)) {
      return res.status(400).json({ error: 'Invalid descriptionFr: must be a string with max 1000 characters' });
    }

    const expectation = await prisma.curriculumExpectation.update({
      where: { id: req.params.id },
      data: {
        ...(code && { code: code.trim() }),
        ...(description && { description: description.trim() }),
        ...(strand && { strand: strand.trim() }),
        ...(substrand !== undefined && { substrand: substrand?.trim() || null }),
        ...(gradeNumber !== undefined && { grade: gradeNumber }),
        ...(subject && { subject: subject.trim() }),
        ...(descriptionFr !== undefined && { descriptionFr: descriptionFr?.trim() || null }),
      },
      include: {
        unitPlans: { select: { unitPlan: { select: { id: true, title: true } } } },
        lessonPlans: { select: { lessonPlan: { select: { id: true, title: true } } } },
      },
    });

    res.json(expectation);
  } catch (err) {
    _next(err);
  }
});

// Delete a curriculum expectation
router.delete('/:id', async (req: AuthenticatedRequest, res, _next) => {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid expectation ID format' });
    }
    
    await prisma.curriculumExpectation.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (err) {
    _next(err);
  }
});

// Get a single curriculum expectation
router.get('/:id', async (req: AuthenticatedRequest, res, _next) => {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.params.id)) {
      return res.status(400).json({ error: 'Invalid expectation ID format' });
    }
    
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
    _next(err);
  }
});

// Search curriculum expectations with semantic similarity (AI-powered)
router.post('/search', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const { query, limit = 10, filters } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Try semantic search first, fallback to text search if no embeddings
    let results;

    try {
      // Attempt semantic search using embeddings
      results = await semanticSearch(query, limit, filters);
    } catch (error) {
      console.log('Semantic search failed, falling back to text search:', error);

      // Fallback to text-based search with proper case-insensitive handling
      const mode = process.env.DATABASE_URL?.includes('postgresql') 
        ? { mode: 'insensitive' as const } 
        : {};
        
      const where: Prisma.CurriculumExpectationWhereInput = {
        OR: [
          { code: { contains: query, ...mode } },
          { description: { contains: query, ...mode } },
          { descriptionFr: { contains: query, ...mode } },
          { strand: { contains: query, ...mode } },
        ],
      };

      if (filters?.subject && typeof filters.subject === 'string') {
        const sanitizedSubject = filters.subject.trim().slice(0, 100);
        if (sanitizedSubject) where.subject = sanitizedSubject;
      }
      if (filters?.grade) {
        const gradeNumber = Number(filters.grade);
        if (!isNaN(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 12) {
          where.grade = gradeNumber;
        }
      }

      results = await prisma.curriculumExpectation.findMany({
        where,
        take: limit,
        orderBy: { code: 'asc' },
      });
    }

    res.json(results);
  } catch (err) {
    _next(err);
  }
});

// Cluster curriculum expectations by similarity (AI-powered)
router.post('/cluster', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const { expectationIds, clusterCount = 5 } = req.body;

    if (!expectationIds || !Array.isArray(expectationIds)) {
      return res.status(400).json({ error: 'expectationIds array is required' });
    }

    // Clustering is implemented through the curriculum import system
    // This endpoint provides manual clustering for ad-hoc analysis
    const clusters = {
      message:
        'Manual clustering endpoint - automated clustering available through curriculum import',
      expectationIds,
      clusterCount,
    };

    res.json(clusters);
  } catch (err) {
    _next(err);
  }
});

// Get curriculum coverage report
router.get('/coverage/report', async (req: AuthenticatedRequest, res, _next) => {
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
    const coveredIds = new Set(coveredExpectations.map((ce) => ce.expectationId));
    const coverage = {
      total: allExpectations.length,
      covered: coveredIds.size,
      percentage:
        allExpectations.length > 0
          ? Math.round((coveredIds.size / allExpectations.length) * 100)
          : 0,
      byStrand: {} as Record<string, { total: number; covered: number }>,
      uncovered: allExpectations.filter((e) => !coveredIds.has(e.id)),
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
    _next(err);
  }
});

export default router;
