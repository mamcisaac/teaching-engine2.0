import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

interface DaybookEntryForAnalytics {
  date: Date | string;
  rating?: number | null;
  overallRating?: number | null;
  studentEngagement?: string | null;
  whatWorked?: string | null;
  whatDidntWork?: string | null;
  studentChallenges?: string | null;
  nextSteps?: string | null;
  wouldReuseLesson?: boolean | null;
  lessonPlan?: {
    unitPlan?: {
      longRangePlan?: {
        subject?: string;
      } | null;
    } | null;
  } | null;
}

// Analytics helper functions
function calculateTrends(entries: DaybookEntryForAnalytics[]): {
  ratingTrend: string;
  engagementTrend: string;
} {
  if (entries.length < 2) {
    return { ratingTrend: 'insufficient_data', engagementTrend: 'insufficient_data' };
  }

  // Sort entries by date to analyze trends over time
  const sortedEntries = entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Calculate rating trend
  const ratingsWithValues = sortedEntries.filter((e) => e.rating !== null);
  let ratingTrend = 'stable';

  if (ratingsWithValues.length >= 3) {
    const firstHalf = ratingsWithValues.slice(0, Math.ceil(ratingsWithValues.length / 2));
    const secondHalf = ratingsWithValues.slice(Math.floor(ratingsWithValues.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, e) => sum + (e.rating ?? e.overallRating ?? 0), 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, e) => sum + (e.rating ?? e.overallRating ?? 0), 0) /
      secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 0.3) ratingTrend = 'improving';
    else if (diff < -0.3) ratingTrend = 'declining';
  }

  // Calculate engagement trend by analyzing studentEngagement text
  const engagementEntries = sortedEntries.filter((e) => e.studentEngagement);
  let engagementTrend = 'stable';

  if (engagementEntries.length >= 2) {
    const recentEntries = engagementEntries.slice(-3); // Last 3 entries
    const positiveWords = ['engaged', 'active', 'interested', 'excited', 'participated', 'focused'];
    const negativeWords = ['disengaged', 'distracted', 'bored', 'struggled', 'off-task'];

    let positiveCount = 0;
    let negativeCount = 0;

    recentEntries.forEach((entry) => {
      const text = entry.studentEngagement.toLowerCase();
      positiveWords.forEach((word) => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach((word) => {
        if (text.includes(word)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount) engagementTrend = 'improving';
    else if (negativeCount > positiveCount) engagementTrend = 'declining';
  }

  return { ratingTrend, engagementTrend };
}

function extractCommonThemes(entries: DaybookEntryForAnalytics[]): {
  successes: string[];
  challenges: string[];
  improvements: string[];
} {
  const successWords = new Map<string, number>();
  const challengeWords = new Map<string, number>();
  const improvementWords = new Map<string, number>();

  entries.forEach((entry) => {
    // Extract themes from whatWorked
    if (entry.whatWorked) {
      const words = extractKeywords(entry.whatWorked);
      words.forEach((word) => {
        successWords.set(word, (successWords.get(word) || 0) + 1);
      });
    }

    // Extract themes from whatDidntWork and studentChallenges
    if (entry.whatDidntWork || entry.studentChallenges) {
      const text = `${entry.whatDidntWork || ''} ${entry.studentChallenges || ''}`;
      const words = extractKeywords(text);
      words.forEach((word) => {
        challengeWords.set(word, (challengeWords.get(word) || 0) + 1);
      });
    }

    // Extract themes from nextSteps
    if (entry.nextSteps) {
      const words = extractKeywords(entry.nextSteps);
      words.forEach((word) => {
        improvementWords.set(word, (improvementWords.get(word) || 0) + 1);
      });
    }
  });

  // Get top themes (minimum 2 occurrences)
  const getTopThemes = (wordMap: Map<string, number>) => {
    return Array.from(wordMap.entries())
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => `${word} (${count} mentions)`);
  };

  return {
    successes: getTopThemes(successWords),
    challenges: getTopThemes(challengeWords),
    improvements: getTopThemes(improvementWords),
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words and extract meaningful terms
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'was',
    'were',
    'is',
    'are',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'this',
    'that',
    'these',
    'those',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))
    .slice(0, 10); // Limit to prevent noise
}

function generateRecommendations(entries: DaybookEntryForAnalytics[]): string[] {
  const recommendations: string[] = [];

  if (entries.length === 0) {
    return ['Start documenting your daily teaching experiences to build insights over time.'];
  }

  // Analyze rating patterns
  const ratedEntries = entries.filter((e) => e.rating !== null);
  if (ratedEntries.length > 0) {
    const avgRating = ratedEntries.reduce((sum, e) => sum + e.rating, 0) / ratedEntries.length;
    const lowRatedEntries = ratedEntries.filter((e) => e.rating < 3);

    if (avgRating < 3.5) {
      recommendations.push(
        'Consider reviewing lessons with lower ratings to identify improvement patterns.',
      );
    }

    if (lowRatedEntries.length > ratedEntries.length * 0.3) {
      recommendations.push(
        'Focus on documenting what worked well in higher-rated lessons for replication.',
      );
    }
  }

  // Check reflection completeness
  const reflectiveEntries = entries.filter(
    (e) =>
      e.whatWorked || e.whatDidntWork || e.studentEngagement || e.studentChallenges || e.nextSteps,
  );

  if (reflectiveEntries.length < entries.length * 0.5) {
    recommendations.push(
      'Increase reflection depth by completing more reflection fields for better insights.',
    );
  }

  // Analyze reuse patterns
  const reusedEntries = entries.filter((e) => e.wouldReuseLesson === true);
  if (reusedEntries.length > 0) {
    recommendations.push(
      'Document successful strategies from reusable lessons for your teaching resource bank.',
    );
  }

  // Time-based recommendations
  const recentEntries = entries.filter((e) => {
    const entryDate = new Date(e.date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return entryDate >= oneWeekAgo;
  });

  if (recentEntries.length === 0) {
    recommendations.push(
      'Regular reflection helps identify patterns - try to document lessons weekly.',
    );
  }

  return recommendations.length > 0
    ? recommendations
    : [
        'Continue documenting your teaching experiences to build a comprehensive reflection database.',
        'Focus on noting both successes and challenges to maximize learning opportunities.',
      ];
}

// Validation schemas
const daybookEntryCreateSchema = z.object({
  date: z.string().datetime(),
  lessonPlanId: z.string().optional(),
  whatWorked: z.string().optional(),
  whatWorkedFr: z.string().optional(),
  whatDidntWork: z.string().optional(),
  whatDidntWorkFr: z.string().optional(),
  nextSteps: z.string().optional(),
  nextStepsFr: z.string().optional(),
  studentEngagement: z.string().optional(),
  studentChallenges: z.string().optional(),
  studentSuccesses: z.string().optional(),
  notes: z.string().optional(),
  notesFr: z.string().optional(),
  privateNotes: z.string().optional(),
  overallRating: z.number().int().min(1).max(5).optional(),
  wouldReuseLesson: z.boolean().optional(),
  expectationCoverage: z
    .array(
      z.object({
        expectationId: z.string(),
        coverage: z.enum(['introduced', 'developing', 'consolidated']),
      }),
    )
    .optional(),
});

const daybookEntryUpdateSchema = daybookEntryCreateSchema.partial();

// Get all daybook entries for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate, hasLessonPlan, rating } = req.query;

    const where: Prisma.DaybookEntryWhereInput = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    if (hasLessonPlan !== undefined) {
      where.lessonPlanId = hasLessonPlan === 'true' ? { not: null } : null;
    }

    if (rating) {
      where.overallRating = Number(rating);
    }

    const entries = await prisma.daybookEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        lessonPlan: {
          select: {
            id: true,
            title: true,
            unitPlan: {
              select: {
                id: true,
                title: true,
                longRangePlan: {
                  select: {
                    subject: true,
                    grade: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { expectations: true },
        },
      },
    });

    res.json(entries);
  } catch (err) {
    _next(err);
  }
});

// Get a single daybook entry
router.get('/:id', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const entry = await prisma.daybookEntry.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        lessonPlan: {
          include: {
            unitPlan: {
              include: {
                longRangePlan: true,
              },
            },
            expectations: {
              include: { expectation: true },
            },
            resources: true,
          },
        },
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Daybook entry not found' });
    }

    res.json(entry);
  } catch (err) {
    _next(err);
  }
});

// Create a new daybook entry
router.post(
  '/',
  validate(daybookEntryCreateSchema),
  async (req: AuthenticatedRequest, res, _next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { expectationCoverage, ...entryData } = req.body;

      // If linking to a lesson plan, verify ownership and no existing entry
      if (entryData.lessonPlanId) {
        const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
          where: {
            id: entryData.lessonPlanId,
            userId,
          },
          include: {
            daybookEntry: true,
          },
        });

        if (!lessonPlan) {
          return res.status(404).json({ error: 'Lesson plan not found' });
        }

        if (lessonPlan.daybookEntry) {
          return res.status(400).json({
            error: 'Lesson plan already has a daybook entry',
          });
        }
      }

      const entry = await prisma.daybookEntry.create({
        data: {
          ...entryData,
          userId,
          date: new Date(entryData.date),
        },
        include: {
          lessonPlan: {
            select: {
              id: true,
              title: true,
              unitPlan: {
                select: {
                  id: true,
                  title: true,
                  longRangePlan: {
                    select: {
                      subject: true,
                      grade: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: { expectations: true },
          },
        },
      });

      // Add expectation coverage if provided
      if (expectationCoverage && expectationCoverage.length > 0) {
        await prisma.daybookEntryExpectation.createMany({
          data: expectationCoverage.map((ec: { expectationId: string; coverage: string }) => ({
            daybookEntryId: entry.id,
            expectationId: ec.expectationId,
            coverage: ec.coverage,
          })),
        });

        // Refetch with expectations
        const updatedEntry = await prisma.daybookEntry.findUnique({
          where: { id: entry.id },
          include: {
            lessonPlan: {
              select: {
                id: true,
                title: true,
                unitPlan: {
                  select: {
                    id: true,
                    title: true,
                    longRangePlan: {
                      select: {
                        subject: true,
                        grade: true,
                      },
                    },
                  },
                },
              },
            },
            expectations: {
              include: { expectation: true },
            },
          },
        });

        return res.status(201).json(updatedEntry);
      }

      res.status(201).json(entry);
    } catch (err) {
      _next(err);
    }
  },
);

// Update a daybook entry
router.put(
  '/:id',
  validate(daybookEntryUpdateSchema),
  async (req: AuthenticatedRequest, res, _next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { expectationCoverage, ...updateData } = req.body;

      // Verify ownership
      const existing = await prisma.daybookEntry.findFirst({
        where: { id: req.params.id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Daybook entry not found' });
      }

      // Prepare update data
      const data: Prisma.DaybookEntryUpdateInput = { ...updateData };
      if (updateData.date) data.date = new Date(updateData.date);

      // Update the entry
      const entry = await prisma.daybookEntry.update({
        where: { id: req.params.id },
        data,
      });

      // Update expectation coverage if provided
      if (expectationCoverage !== undefined) {
        // Remove existing coverage
        await prisma.daybookEntryExpectation.deleteMany({
          where: { daybookEntryId: entry.id },
        });

        // Add new coverage
        if (expectationCoverage.length > 0) {
          await prisma.daybookEntryExpectation.createMany({
            data: expectationCoverage.map((ec: { expectationId: string; coverage: string }) => ({
              daybookEntryId: entry.id,
              expectationId: ec.expectationId,
              coverage: ec.coverage,
            })),
          });
        }
      }

      // Refetch with updated relationships
      const updatedEntry = await prisma.daybookEntry.findUnique({
        where: { id: entry.id },
        include: {
          lessonPlan: {
            include: {
              unitPlan: {
                include: {
                  longRangePlan: true,
                },
              },
            },
          },
          expectations: {
            include: { expectation: true },
          },
        },
      });

      res.json(updatedEntry);
    } catch (err) {
      _next(err);
    }
  },
);

// Delete a daybook entry
router.delete('/:id', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify ownership
    const entry = await prisma.daybookEntry.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Daybook entry not found' });
    }

    await prisma.daybookEntry.delete({
      where: { id: req.params.id },
    });

    res.status(204).end();
  } catch (err) {
    _next(err);
  }
});

// Get daybook insights and patterns
router.get('/insights/summary', async (req: AuthenticatedRequest, res, _next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate, subject } = req.query;

    const where: Prisma.DaybookEntryWhereInput = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    if (subject) {
      where.lessonPlan = {
        unitPlan: {
          longRangePlan: {
            subject: String(subject),
          },
        },
      };
    }

    // Get all entries for the period
    const entries = await prisma.daybookEntry.findMany({
      where,
      select: {
        id: true,
        date: true,
        overallRating: true,
        wouldReuseLesson: true,
        whatWorked: true,
        whatDidntWork: true,
        studentEngagement: true,
        studentChallenges: true,
        lessonPlan: {
          select: {
            unitPlan: {
              select: {
                longRangePlan: {
                  select: { subject: true },
                },
              },
            },
          },
        },
      },
    });

    // Calculate insights
    const totalEntries = entries.length;
    const entriesWithRating = entries.filter((e) => e.overallRating !== null);
    const avgRating =
      entriesWithRating.length > 0
        ? entriesWithRating.reduce((sum, e) => sum + (e.overallRating ?? 0), 0) /
          entriesWithRating.length
        : null;

    const reuseStats = entries.filter((e) => e.wouldReuseLesson !== null);
    const reusePercentage =
      reuseStats.length > 0
        ? Math.round(
            (reuseStats.filter((e) => e.wouldReuseLesson).length / reuseStats.length) * 100,
          )
        : null;

    // Common themes (would need NLP for real implementation)
    const insights = {
      period: {
        start: startDate || 'all time',
        end: endDate || 'present',
      },
      summary: {
        totalEntries,
        averageRating: avgRating ? Number(avgRating.toFixed(2)) : null,
        reusePercentage,
        entriesWithReflections: entries.filter(
          (e) => e.whatWorked || e.whatDidntWork || e.studentEngagement || e.studentChallenges,
        ).length,
      },
      trends: calculateTrends(entries),
      commonThemes: extractCommonThemes(entries),
      recommendations: generateRecommendations(entries),
    };

    res.json(insights);
  } catch (err) {
    _next(err);
  }
});

export default router;
