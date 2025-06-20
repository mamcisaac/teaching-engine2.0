import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import logger from '../logger';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const createContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  studentId: z.number().int().positive()
});

const updateContactSchema = createContactSchema.partial().extend({
  id: z.number().int().positive().optional()
});

// Get all parent contacts for the user's students
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    
    const contacts = await prisma.parentContact.findMany({
      where: {
        student: {
          userId: userId
        }
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true
          }
        }
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { name: 'asc' }
      ]
    });
    
    res.json(contacts);
  } catch (error) {
    logger.error('Failed to fetch parent contacts:', error);
    next(error);
  }
});

// Get parent contacts for a specific student
router.get('/student/:studentId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const studentId = parseInt(req.params.studentId, 10);
    
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }
    
    // Verify student belongs to user
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId: userId }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const contacts = await prisma.parentContact.findMany({
      where: { studentId: studentId },
      orderBy: { name: 'asc' }
    });
    
    res.json(contacts);
  } catch (error) {
    logger.error('Failed to fetch student parent contacts:', error);
    next(error);
  }
});

// Create a new parent contact
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const data = createContactSchema.parse(req.body);
    
    // Verify student belongs to user
    const student = await prisma.student.findFirst({
      where: { id: data.studentId, userId: userId }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if contact already exists for this student
    const existingContact = await prisma.parentContact.findFirst({
      where: { 
        email: data.email,
        studentId: data.studentId
      }
    });
    
    if (existingContact) {
      return res.status(400).json({ error: 'Contact with this email already exists for this student' });
    }
    
    const contact = await prisma.parentContact.create({
      data: {
        name: data.name,
        email: data.email,
        studentId: data.studentId
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true
          }
        }
      }
    });
    
    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid contact data', details: error.errors });
    }
    logger.error('Failed to create parent contact:', error);
    next(error);
  }
});

// Update a parent contact
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const contactId = parseInt(req.params.id, 10);
    const data = updateContactSchema.parse(req.body);
    
    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }
    
    // Verify contact exists and belongs to user's student
    const existingContact = await prisma.parentContact.findFirst({
      where: { 
        id: contactId,
        student: { userId: userId }
      }
    });
    
    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    // If email is being changed, check for duplicates
    if (data.email && data.email !== existingContact.email) {
      const emailConflict = await prisma.parentContact.findFirst({
        where: {
          email: data.email,
          studentId: existingContact.studentId,
          NOT: { id: contactId }
        }
      });
      
      if (emailConflict) {
        return res.status(400).json({ error: 'Contact with this email already exists for this student' });
      }
    }
    
    const contact = await prisma.parentContact.update({
      where: { id: contactId },
      data: {
        name: data.name,
        email: data.email
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true
          }
        }
      }
    });
    
    res.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid contact data', details: error.errors });
    }
    logger.error('Failed to update parent contact:', error);
    next(error);
  }
});

// Delete a parent contact
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const contactId = parseInt(req.params.id, 10);
    
    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }
    
    // Verify contact exists and belongs to user's student
    const existingContact = await prisma.parentContact.findFirst({
      where: { 
        id: contactId,
        student: { userId: userId }
      }
    });
    
    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    await prisma.parentContact.delete({
      where: { id: contactId }
    });
    
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete parent contact:', error);
    next(error);
  }
});

export default router;