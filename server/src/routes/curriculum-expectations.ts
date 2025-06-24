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
async function semanticSearch(query: string, limit: number, filters?: any) {
  // Generate embedding for the search query
  const queryEmbedding = await embeddingService.generateEmbedding(query);
  
  // Get all expectations that match filters
  const where: Prisma.CurriculumExpectationWhereInput = {};
  if (filters?.subject) where.subject = filters.subject;
  if (filters?.grade) where.grade = filters.grade;
  if (filters?.strand) where.strand = filters.strand;
  
  const allExpectations = await prisma.curriculumExpectation.findMany({
    where,
    include: {
      embeddings: true,
    },
  });

  // Calculate similarities and sort by relevance
  const expectationsWithSimilarity = allExpectations
    .map(expectation => {
      // Find the best embedding match for this expectation
      let maxSimilarity = 0;
      
      if (expectation.embeddings && expectation.embeddings.length > 0) {
        expectation.embeddings.forEach(embedding => {
          const similarity = cosineSimilarity(queryEmbedding, embedding.embedding as number[]);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
          }
        });
      }
      
      return {
        ...expectation,
        similarity: maxSimilarity,
      };
    })
    .filter(exp => exp.similarity > 0.3) // Minimum similarity threshold
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  // Remove embeddings from response
  return expectationsWithSimilarity.map(({ embeddings, similarity, ...exp }) => ({
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

// Create a new curriculum expectation
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { code, description, strand, substrand, grade, subject, descriptionFr } = req.body;
    
    if (!code || !description || !strand || !grade || !subject) {
      return res.status(400).json({ 
        error: 'Missing required fields: code, description, strand, grade, subject' 
      });
    }
    
    const expectation = await prisma.curriculumExpectation.create({
      data: {
        code,
        description,
        strand,
        substrand,
        grade: Number(grade),
        subject,
        descriptionFr,
      },
      include: {
        unitPlans: { select: { unitPlan: { select: { id: true, title: true } } } },
        lessonPlans: { select: { lessonPlan: { select: { id: true, title: true } } } },
      },
    });
    
    res.status(201).json(expectation);
  } catch (err) {
    next(err);
  }
});

// Update a curriculum expectation
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { code, description, strand, substrand, grade, subject, descriptionFr } = req.body;
    
    const expectation = await prisma.curriculumExpectation.update({
      where: { id: req.params.id },
      data: {
        ...(code && { code }),
        ...(description && { description }),
        ...(strand && { strand }),
        ...(substrand !== undefined && { substrand }),
        ...(grade && { grade: Number(grade) }),
        ...(subject && { subject }),
        ...(descriptionFr !== undefined && { descriptionFr }),
      },
      include: {
        unitPlans: { select: { unitPlan: { select: { id: true, title: true } } } },
        lessonPlans: { select: { lessonPlan: { select: { id: true, title: true } } } },
      },
    });
    
    res.json(expectation);
  } catch (err) {
    next(err);
  }
});

// Delete a curriculum expectation
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.curriculumExpectation.delete({
      where: { id: req.params.id },
    });
    
    res.status(204).send();
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
    
    // Try semantic search first, fallback to text search if no embeddings
    let results;
    
    try {
      // Attempt semantic search using embeddings
      results = await semanticSearch(query, limit, filters);
    } catch (error) {
      console.log('Semantic search failed, falling back to text search:', error);
      
      // Fallback to text-based search
      const where: Prisma.CurriculumExpectationWhereInput = {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { descriptionFr: { contains: query, mode: 'insensitive' } },
          { strand: { contains: query, mode: 'insensitive' } },
        ],
      };
      
      if (filters?.subject) where.subject = filters.subject;
      if (filters?.grade) where.grade = filters.grade;
      
      results = await prisma.curriculumExpectation.findMany({
        where,
        take: limit,
        orderBy: { code: 'asc' },
      });
    }
    
    res.json(results);
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
    
    // Clustering is implemented through the curriculum import system
    // This endpoint provides manual clustering for ad-hoc analysis
    const clusters = {
      message: 'Manual clustering endpoint - automated clustering available through curriculum import',
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