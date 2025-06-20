import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import logger from '../logger';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  contentFr: z.string(),
  contentEn: z.string(),
  variables: z.array(z.string()).optional().default([]),
});

const updateTemplateSchema = createTemplateSchema.partial();

// Get all templates for the user
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    
    const templates = await prisma.emailTemplate.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    
    res.json(templates);
  } catch (error) {
    logger.error('Failed to fetch email templates:', error);
    next(error);
  }
});

// Get a specific template
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const templateId = parseInt(req.params.id, 10);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    
    if (!template || template.userId !== userId) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    logger.error('Failed to fetch email template:', error);
    next(error);
  }
});

// Create a new template
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const data = createTemplateSchema.parse(req.body);
    
    // Check if template name already exists (name is globally unique)
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: data.name },
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Template with this name already exists' });
    }
    
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        contentFr: data.contentFr,
        contentEn: data.contentEn,
        variables: JSON.stringify(data.variables),
        userId,
      },
    });
    
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid template data', details: error.errors });
    }
    logger.error('Failed to create email template:', error);
    next(error);
  }
});

// Update a template
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const templateId = parseInt(req.params.id, 10);
    const data = updateTemplateSchema.parse(req.body);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    // Check if template exists and belongs to user
    const existing = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // If renaming, check for name conflicts (name is globally unique)
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.emailTemplate.findFirst({
        where: { name: data.name, NOT: { id: templateId } },
      });
      
      if (nameConflict) {
        return res.status(400).json({ error: 'Template with this name already exists' });
      }
    }
    
    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        ...data,
        variables: data.variables ? JSON.stringify(data.variables) : undefined,
      },
    });
    
    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid template data', details: error.errors });
    }
    logger.error('Failed to update email template:', error);
    next(error);
  }
});

// Delete a template
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const templateId = parseInt(req.params.id, 10);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    // Check if template exists and belongs to user
    const existing = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    await prisma.emailTemplate.delete({
      where: { id: templateId },
    });
    
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete email template:', error);
    next(error);
  }
});

// Clone a template
router.post('/:id/clone', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const templateId = parseInt(req.params.id, 10);
    const { name } = z.object({ name: z.string().min(1).max(100) }).parse(req.body);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    // Get original template
    const original = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    
    if (!original || original.userId !== userId) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Check if new name already exists (name is globally unique)
    const nameExists = await prisma.emailTemplate.findFirst({
      where: { name },
    });
    
    if (nameExists) {
      return res.status(400).json({ error: 'Template with this name already exists' });
    }
    
    // Create clone
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject: original.subject,
        contentFr: original.contentFr,
        contentEn: original.contentEn,
        variables: original.variables,
        userId,
      },
    });
    
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid clone data', details: error.errors });
    }
    logger.error('Failed to clone email template:', error);
    next(error);
  }
});

export default router;