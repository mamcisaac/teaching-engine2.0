import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { generateNewsletterContent, type NewsletterSection, type NewsletterTone } from '../services/newsletterService';

const router = Router();

// Validation schemas
const generateNewsletterSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  tone: z.enum(['friendly', 'formal', 'informative']).default('friendly'),
  focusAreas: z.array(z.string()).optional(),
  includeUpcomingEvents: z.boolean().default(true),
  templateType: z.enum(['weekly', 'monthly', 'special']).default('weekly'),
});

const saveNewsletterSchema = z.object({
  title: z.string().min(1),
  titleFr: z.string().min(1),
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
  tone: z.enum(['friendly', 'formal', 'informative']).optional(),
  templateType: z.enum(['weekly', 'monthly', 'special']).optional(),
});

// Generate newsletter content (now generates templates, not student-specific content)
router.post('/generate', async (req: Request, res) => {
  try {
    const validation = generateNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const {
      from,
      to,
      tone,
      focusAreas,
      includeUpcomingEvents,
      templateType,
    } = validation.data;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate newsletter template content
    const newsletterContent = await generateNewsletterContent({
      userId,
      dateFrom: new Date(from),
      dateTo: new Date(to),
      tone,
      focusAreas,
      includeUpcomingEvents,
      templateType,
    });

    res.json(newsletterContent);
  } catch (error) {
    console.error('Newsletter generation error:', error);
    res.status(500).json({ error: 'Failed to generate newsletter' });
  }
});

// Get all newsletters for the current user
router.get('/', async (req: Request, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletters = await prisma.newsletter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(newsletters);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    res.status(500).json({ error: 'Failed to fetch newsletters' });
  }
});

// Get a specific newsletter
router.get('/:id', async (req: Request, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    res.json(newsletter);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({ error: 'Failed to fetch newsletter' });
  }
});

// Regenerate specific sections of a newsletter
router.post('/:id/regenerate', async (req: Request, res) => {
  try {
    const validation = regenerateNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
    });

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    const { sections, tone, templateType } = validation.data;

    // Regenerate content for editable sections
    const regeneratedContent = await generateNewsletterContent({
      userId,
      dateFrom: newsletter.dateFrom,
      dateTo: newsletter.dateTo,
      tone: (tone as NewsletterTone) || (newsletter.tone as NewsletterTone),
      focusAreas: [],
      includeUpcomingEvents: true,
      templateType: templateType || 'weekly',
      existingSections: sections.filter((s) => !s.isEditable) as NewsletterSection[],
    });

    res.json(regeneratedContent);
  } catch (error) {
    console.error('Newsletter regeneration error:', error);
    res.status(500).json({ error: 'Failed to regenerate newsletter' });
  }
});

// Save or update a newsletter
router.post('/', async (req: Request, res) => {
  try {
    const validation = saveNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletterData = validation.data;

    const newsletter = await prisma.newsletter.create({
      data: {
        userId,
        title: newsletterData.title,
        titleFr: newsletterData.titleFr,
        dateFrom: new Date(newsletterData.dateFrom),
        dateTo: new Date(newsletterData.dateTo),
        tone: newsletterData.tone,
        sections: newsletterData.sections,
        isDraft: newsletterData.isDraft,
      },
    });

    res.json(newsletter);
  } catch (error) {
    console.error('Error saving newsletter:', error);
    res.status(500).json({ error: 'Failed to save newsletter' });
  }
});

// Update an existing newsletter
router.put('/:id', async (req: Request, res) => {
  try {
    const validation = saveNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletterData = validation.data;

    const newsletter = await prisma.newsletter.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: newsletterData.title,
        titleFr: newsletterData.titleFr,
        dateFrom: new Date(newsletterData.dateFrom),
        dateTo: new Date(newsletterData.dateTo),
        tone: newsletterData.tone,
        sections: newsletterData.sections,
        isDraft: newsletterData.isDraft,
      },
    });

    res.json(newsletter);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    res.status(500).json({ error: 'Failed to update newsletter' });
  }
});

// Delete a newsletter
router.delete('/:id', async (req: Request, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.newsletter.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    res.status(500).json({ error: 'Failed to delete newsletter' });
  }
});

// Mark newsletter as sent
router.post('/:id/send', async (req: Request, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const newsletter = await prisma.newsletter.update({
      where: {
        id: req.params.id,
      },
      data: {
        isDraft: false,
        sentAt: new Date(),
      },
    });

    res.json(newsletter);
  } catch (error) {
    console.error('Error marking newsletter as sent:', error);
    res.status(500).json({ error: 'Failed to mark newsletter as sent' });
  }
});

export default router;