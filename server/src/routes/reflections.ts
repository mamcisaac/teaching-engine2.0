import { Router, Request } from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { z } from 'zod';

// Extend Request interface to match the auth middleware in index.ts
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

const createReflectionSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  content: z.string().min(1).max(1000),
  outcomeIds: z.array(z.string()).default([]),
  themeId: z.number().optional(),
  assessmentId: z.number().optional(),
});

const updateReflectionSchema = z.object({
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  content: z.string().min(1).max(1000).optional(),
  outcomeIds: z.array(z.string()).optional(),
  themeId: z.number().nullable().optional(),
  assessmentId: z.number().nullable().optional(),
});

// Auth middleware is applied at the app level

// GET /api/reflections
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const { outcomeId, themeId, term, startDate, endDate } = req.query;

    const where: {
      userId: number;
      outcomes?: { some: { outcomeId: string } };
      themeId?: number;
      date?: { gte?: Date; lte?: Date };
    } = { userId };

    if (outcomeId) {
      where.outcomes = {
        some: { outcomeId: outcomeId as string },
      };
    }

    if (themeId) {
      where.themeId = parseInt(themeId as string);
    }

    if (startDate || endDate || term) {
      where.date = {};

      if (term) {
        // Handle term-based filtering (e.g., "2024-T1", "2024-T2", etc.)
        const [year, termNum] = (term as string).split('-T');
        const yearNum = parseInt(year);

        switch (termNum) {
          case '1': // Sept-Nov
            where.date.gte = new Date(yearNum, 8, 1); // September 1
            where.date.lte = new Date(yearNum, 11, 0); // November 30
            break;
          case '2': // Dec-Feb
            where.date.gte = new Date(yearNum, 11, 1); // December 1
            where.date.lte = new Date(yearNum + 1, 2, 0); // February 28/29
            break;
          case '3': // Mar-Jun
            where.date.gte = new Date(yearNum + 1, 2, 1); // March 1
            where.date.lte = new Date(yearNum + 1, 5, 30); // June 30
            break;
        }
      } else {
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }
    }

    const reflections = await prisma.reflectionJournalEntry.findMany({
      where,
      include: {
        outcomes: {
          include: { outcome: true },
        },
        theme: true,
        assessment: {
          include: { template: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(reflections);
  } catch (error) {
    console.error('Error fetching reflections:', error);
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
});

// POST /api/reflections
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const validatedData = createReflectionSchema.parse(req.body);

    const { outcomeIds, ...reflectionData } = validatedData;

    // Create the reflection entry first
    const reflection = await prisma.reflectionJournalEntry.create({
      data: {
        date: reflectionData.date,
        content: reflectionData.content,
        themeId: reflectionData.themeId || null,
        assessmentId: reflectionData.assessmentId || null,
        userId,
      },
    });

    // Then create the outcome relationships
    if (outcomeIds.length > 0) {
      await prisma.reflectionOutcome.createMany({
        data: outcomeIds.map((outcomeId) => ({
          reflectionId: reflection.id,
          outcomeId,
        })),
      });
    }

    // Fetch the complete reflection with relationships
    const completeReflection = await prisma.reflectionJournalEntry.findUnique({
      where: { id: reflection.id },
      include: {
        outcomes: {
          include: { outcome: true },
        },
        theme: true,
        assessment: {
          include: { template: true },
        },
      },
    });

    res.status(201).json(completeReflection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error creating reflection:', error);
    res.status(500).json({ error: 'Failed to create reflection' });
  }
});

// PATCH /api/reflections/:id
router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const reflectionId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.reflectionJournalEntry.findFirst({
      where: { id: reflectionId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    const validatedData = updateReflectionSchema.parse(req.body);
    const { outcomeIds, ...updateData } = validatedData;

    // Handle outcome updates separately if provided
    if (outcomeIds !== undefined) {
      // Delete existing outcome connections
      await prisma.reflectionOutcome.deleteMany({
        where: { reflectionId },
      });

      // Create new outcome connections
      if (outcomeIds.length > 0) {
        await prisma.reflectionOutcome.createMany({
          data: outcomeIds.map((outcomeId) => ({
            reflectionId,
            outcomeId,
          })),
        });
      }
    }

    const reflection = await prisma.reflectionJournalEntry.update({
      where: { id: reflectionId },
      data: updateData,
      include: {
        outcomes: {
          include: { outcome: true },
        },
        theme: true,
        assessment: {
          include: { template: true },
        },
      },
    });

    res.json(reflection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error updating reflection:', error);
    res.status(500).json({ error: 'Failed to update reflection' });
  }
});

// DELETE /api/reflections/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const reflectionId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.reflectionJournalEntry.findFirst({
      where: { id: reflectionId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    // Delete related outcomes first
    await prisma.reflectionOutcome.deleteMany({
      where: { reflectionId },
    });

    // Delete the reflection
    await prisma.reflectionJournalEntry.delete({
      where: { id: reflectionId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reflection:', error);
    res.status(500).json({ error: 'Failed to delete reflection' });
  }
});

// GET /api/reflections/by-outcome/:outcomeId
router.get('/by-outcome/:outcomeId', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.user!.userId);
    const outcomeId = req.params.outcomeId;

    const reflections = await prisma.reflectionJournalEntry.findMany({
      where: {
        userId,
        outcomes: {
          some: { outcomeId },
        },
      },
      include: {
        outcomes: {
          include: { outcome: true },
        },
        theme: true,
        assessment: {
          include: { template: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(reflections);
  } catch (error) {
    console.error('Error fetching reflections by outcome:', error);
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
});

export default router;
