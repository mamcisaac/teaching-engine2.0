import express, { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../middleware/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateRequest = (req: AuthenticatedRequest, res: Response, next: any): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// GET /api/notes - Get all notes (with optional filters)
router.get('/',
  authenticate,
  [
    query('studentId').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('subject').optional().isString(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { studentId, startDate, endDate, subject } = req.query;
      const teacherId = req.user?.id;

      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const where: any = { teacherId };
      
      if (studentId) where.studentId = studentId;
      if (subject) where.subject = subject;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const notes = await prisma.note.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }
);

// GET /api/notes/:id - Get a specific note
router.get('/:id',
  authenticate,
  [param('id').isString()],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const teacherId = req.user?.id;

      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const note = await prisma.note.findFirst({
        where: {
          id,
          teacherId,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!note) {
        res.status(404).json({ error: 'Note not found' });
        return;
      }

      res.json(note);
    } catch (error) {
      console.error('Error fetching note:', error);
      res.status(500).json({ error: 'Failed to fetch note' });
    }
  }
);

// POST /api/notes - Create a new note
router.post('/',
  authenticate,
  [
    body('studentId').isString(),
    body('content').isString().trim().notEmpty(),
    body('lessonPlanId').optional().isString(),
    body('lessonTitle').optional().isString(),
    body('subject').optional().isString(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { studentId, content, lessonPlanId, lessonTitle, subject } = req.body;

      // Verify student exists and belongs to this teacher
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          userId: teacherId,
        },
      });

      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const note = await prisma.note.create({
        data: {
          studentId,
          teacherId,
          content,
          lessonPlanId,
          lessonTitle,
          subject,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  }
);

// PUT /api/notes/:id - Update a note
router.put('/:id',
  authenticate,
  [
    param('id').isString(),
    body('content').optional().isString().trim().notEmpty(),
    body('lessonPlanId').optional().isString(),
    body('lessonTitle').optional().isString(),
    body('subject').optional().isString(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const teacherId = req.user?.id;

      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify note exists and belongs to this teacher
      const existingNote = await prisma.note.findFirst({
        where: {
          id,
          teacherId,
        },
      });

      if (!existingNote) {
        res.status(404).json({ error: 'Note not found' });
        return;
      }

      const { content, lessonPlanId, lessonTitle, subject } = req.body;

      const updatedNote = await prisma.note.update({
        where: { id },
        data: {
          ...(content !== undefined && { content }),
          ...(lessonPlanId !== undefined && { lessonPlanId }),
          ...(lessonTitle !== undefined && { lessonTitle }),
          ...(subject !== undefined && { subject }),
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(updatedNote);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note' });
    }
  }
);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id',
  authenticate,
  [param('id').isString()],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const teacherId = req.user?.id;

      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify note exists and belongs to this teacher
      const existingNote = await prisma.note.findFirst({
        where: {
          id,
          teacherId,
        },
      });

      if (!existingNote) {
        res.status(404).json({ error: 'Note not found' });
        return;
      }

      await prisma.note.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  }
);

export default router;