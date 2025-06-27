import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { generateNewsletterContent } from '../services/newsletterService';

const router = Router();

// Validation schemas
const generateNewsletterSchema = z.object({
  studentIds: z.array(z.number().int().positive()),
  from: z.string().datetime(),
  to: z.string().datetime(),
  tone: z.enum(['friendly', 'formal', 'informative']).default('friendly'),
  focusAreas: z.array(z.string()).optional(),
  includeArtifacts: z.boolean().default(true),
  includeReflections: z.boolean().default(true),
  includeLearningGoals: z.boolean().default(true),
  includeUpcomingEvents: z.boolean().default(true),
});

const saveNewsletterSchema = z.object({
  title: z.string().min(1),
  titleFr: z.string().min(1),
  studentIds: z.array(z.number().int().positive()),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  tone: z.enum(['friendly', 'formal', 'informative']),
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      titleFr: z.string(),
      content: z.string(),
      contentFr: z.string(),
      isEditable: z.boolean().default(true),
      order: z.number().int(),
    }),
  ),
  isDraft: z.boolean().default(true),
});

const regenerateNewsletterSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      titleFr: z.string(),
      content: z.string(),
      contentFr: z.string(),
      isEditable: z.boolean(),
      order: z.number().int(),
    }),
  ),
  studentIds: z.array(z.number().int().positive()),
  from: z.string().datetime(),
  to: z.string().datetime(),
  tone: z.enum(['friendly', 'formal', 'informative']).optional(),
});

// Generate newsletter content with AI
router.post('/generate-newsletter', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = generateNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const {
      studentIds,
      from,
      to,
      tone,
      focusAreas,
      includeArtifacts,
      includeReflections,
      includeLearningGoals,
      includeUpcomingEvents,
    } = validation.data;

    // Verify all students belong to this teacher
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        userId: userId,
      },
      include: {
        artifacts: {
          where: {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
        },
        reflections: {
          where: {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
        },
      },
    });

    if (students.length !== studentIds.length) {
      return res.status(404).json({ error: 'One or more students not found' });
    }

    // Get daybook entries for the period
    const daybookEntries = await prisma.daybookEntry.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      include: {
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Generate newsletter content using AI
    const newsletterContent = await generateNewsletterContent({
      students,
      daybookEntries,
      fromDate: new Date(from),
      toDate: new Date(to),
      tone,
      focusAreas,
      options: {
        includeArtifacts,
        includeReflections,
        includeLearningGoals,
        includeUpcomingEvents,
      },
    });

    res.json(newsletterContent);
  } catch (err) {
    console.error('Error generating newsletter:', err);
    next(err);
  }
});

// Regenerate newsletter with variations
router.post('/regenerate-newsletter', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = regenerateNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { sections, studentIds, from: _from, to: _to, tone: _tone } = validation.data;

    // Verify all students belong to this teacher
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        userId: userId,
      },
    });

    if (students.length !== studentIds.length) {
      return res.status(404).json({ error: 'One or more students not found' });
    }

    // For regeneration, we'll create variations of existing content
    // This is a simplified version - you might want to enhance this
    const regeneratedContent = {
      sections: sections.map((section) => ({
        ...section,
        // Add variation logic here
        content: section.content + ' (Regenerated)',
        contentFr: section.contentFr + ' (Régénéré)',
      })),
    };

    res.json(regeneratedContent);
  } catch (err) {
    console.error('Error regenerating newsletter:', err);
    next(err);
  }
});

// Get all newsletters
router.get('/', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isDraft = req.query.isDraft === 'true';

    const newsletters = await prisma.newsletter.findMany({
      where: {
        userId: userId,
        ...(isDraft !== undefined && { isDraft }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(newsletters);
  } catch (err) {
    next(err);
  }
});

// Get a specific newsletter
router.get('/:id', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id: req.params.id,
        userId: userId,
      },
    });

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    res.json(newsletter);
  } catch (err) {
    next(err);
  }
});

// Save newsletter
router.post('/', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = saveNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const newsletterData = validation.data;

    // Create newsletter
    const newsletter = await prisma.newsletter.create({
      data: {
        userId: userId,
        title: newsletterData.title,
        titleFr: newsletterData.titleFr,
        studentIds: newsletterData.studentIds,
        dateFrom: new Date(newsletterData.dateFrom),
        dateTo: new Date(newsletterData.dateTo),
        tone: newsletterData.tone,
        sections: newsletterData.sections,
        isDraft: newsletterData.isDraft,
      },
    });

    res.status(201).json(newsletter);
  } catch (err) {
    console.error('Error saving newsletter:', err);
    next(err);
  }
});

// Update newsletter
router.put('/:id', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = saveNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const newsletterData = validation.data;

    // Verify ownership
    const existing = await prisma.newsletter.findFirst({
      where: {
        id: req.params.id,
        userId: userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    // Update newsletter
    const newsletter = await prisma.newsletter.update({
      where: { id: req.params.id },
      data: {
        title: newsletterData.title,
        titleFr: newsletterData.titleFr,
        studentIds: newsletterData.studentIds,
        dateFrom: new Date(newsletterData.dateFrom),
        dateTo: new Date(newsletterData.dateTo),
        tone: newsletterData.tone,
        sections: newsletterData.sections,
        isDraft: newsletterData.isDraft,
      },
    });

    res.json(newsletter);
  } catch (err) {
    console.error('Error updating newsletter:', err);
    next(err);
  }
});

// Send newsletter
router.post('/:id/send', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id: req.params.id,
        userId: userId,
      },
    });

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (!newsletter.isDraft) {
      return res.status(400).json({ error: 'Newsletter already sent' });
    }

    // Update newsletter as sent
    await prisma.newsletter.update({
      where: { id: req.params.id },
      data: {
        isDraft: false,
        sentAt: new Date(),
      },
    });

    // TODO: Implement actual email sending logic here
    // For now, we'll just mark it as sent

    res.json({ message: 'Newsletter sent successfully' });
  } catch (err) {
    console.error('Error sending newsletter:', err);
    next(err);
  }
});

// Delete newsletter
router.delete('/:id', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id: req.params.id,
        userId: userId,
      },
    });

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    await prisma.newsletter.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting newsletter:', err);
    next(err);
  }
});

// Get newsletter suggestions
router.get('/suggestions', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get recent students for the user
    const recentStudents = await prisma.student.findMany({
      where: { userId: userId },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        grade: true,
      },
    });

    // Get recent daybook entries for content suggestions
    const recentEntries = await prisma.daybookEntry.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
    });

    // Generate date range suggestions
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const suggestions = {
      students: recentStudents,
      dateRanges: [
        {
          label: 'Last Week',
          from: lastWeek.toISOString(),
          to: today.toISOString(),
        },
        {
          label: 'Last Month',
          from: lastMonth.toISOString(),
          to: today.toISOString(),
        },
      ],
      toneOptions: ['friendly', 'formal', 'informative'],
      focusAreas: [
        'Mathematics',
        'Language Arts',
        'Science',
        'Social Studies',
        'Arts',
        'Physical Education',
        'French',
      ],
      recentTopics: recentEntries
        .flatMap((entry) => entry.expectations.map((exp) => exp.expectation.description))
        .slice(0, 10),
    };

    res.json(suggestions);
  } catch (err) {
    console.error('Error getting newsletter suggestions:', err);
    next(err);
  }
});

export default router;
