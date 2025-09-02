import express, { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import rateLimit from 'express-rate-limit';
import { prisma } from '../prisma';
import type { AuthenticatedRequest } from '../middleware/auth';
import { authenticate } from '../middleware/auth';
import { logger } from '../logger';

const router = express.Router();

// Rate limiting configurations
const createNoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each user to 50 note creations per windowMs
  message: 'Too many notes created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.user?.id?.toString() || 'anonymous',
});

const bulkNoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each user to 10 bulk operations per windowMs
  message: 'Too many bulk operations, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.user?.id?.toString() || 'anonymous',
});

const readNoteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each user to 100 read requests per minute
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.user?.id?.toString() || 'anonymous',
});

// Validation middleware
const validateRequest = (req: AuthenticatedRequest, res: Response, next: any): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Sanitize HTML content to prevent XSS
const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

// Create audit log entry
const createAuditLog = async (action: string, noteId: string, userId: number, oldData?: any, newData?: any) => {
  try {
    // Check if AuditLog model exists before trying to use it
    // For now, we'll just log to console since AuditLog model doesn't exist yet
    logger.info('Audit log', { action, entityType: 'Note', entityId: noteId, userId, oldData, newData });
  } catch (error) {
    logger.error('Failed to create audit log', { error, action, noteId, userId });
  }
};

// GET /api/notes - Get all notes (with optional filters and pagination)
router.get('/',
  authenticate,
  readNoteLimiter,
  [
    query('studentId').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('subject').optional().isString(),
    query('search').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { studentId, startDate, endDate, subject, search } = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      const teacherId = req.user?.id;

      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const where: any = { 
        teacherId,
        deletedAt: null // Exclude soft-deleted notes
      };
      
      if (studentId) where.studentId = studentId;
      if (subject) where.subject = subject;
      if (search) {
        where.OR = [
          { content: { contains: search as string } },
          { lessonTitle: { contains: search as string } },
        ];
      }
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      // Get total count for pagination
      const totalCount = await prisma.note.count({ where });

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
        skip,
        take: limit,
      });

      res.json({
        notes,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }
);

// GET /api/notes/:id - Get a specific note
router.get('/:id',
  authenticate,
  readNoteLimiter,
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
          deletedAt: null, // Exclude soft-deleted notes
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
  createNoteLimiter,
  [
    body('studentId').isString().notEmpty(),
    body('content')
      .isString()
      .trim()
      .notEmpty()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Note content must be between 1 and 5000 characters'),
    body('lessonPlanId').optional().isString(),
    body('lessonTitle').optional().isString().isLength({ max: 200 }),
    body('subject').optional().isString().isLength({ max: 100 }),
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

      // Debug logging
      console.log('Note creation attempt:', {
        teacherId,
        studentId,
        requestingUser: req.user
      });

      // Verify student exists and belongs to this teacher
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          userId: teacherId,
        },
      });

      if (!student) {
        // Let's see what students this teacher actually has
        const teacherStudents = await prisma.student.findMany({
          where: { userId: teacherId },
          select: { id: true, firstName: true, lastName: true }
        });
        
        console.log('Student verification failed:', {
          requestedStudentId: studentId,
          teacherId,
          teacherHasStudents: teacherStudents.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` }))
        });
        
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      // Sanitize content to prevent XSS
      const sanitizedContent = sanitizeContent(content);
      const sanitizedLessonTitle = lessonTitle ? sanitizeContent(lessonTitle) : undefined;
      const sanitizedSubject = subject ? sanitizeContent(subject) : undefined;

      const note = await prisma.note.create({
        data: {
          studentId,
          teacherId,
          content: sanitizedContent,
          lessonPlanId,
          lessonTitle: sanitizedLessonTitle,
          subject: sanitizedSubject,
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

      // Create audit log for note creation
      await createAuditLog('CREATE', note.id, teacherId, null, note);

      res.status(201).json(note);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  }
);

// POST /api/notes/bulk - Create notes for multiple students
router.post('/bulk',
  authenticate,
  bulkNoteLimiter,
  [
    body('studentIds').isArray().notEmpty(),
    body('studentIds.*').isString(),
    body('content')
      .isString()
      .trim()
      .notEmpty()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Note content must be between 1 and 5000 characters'),
    body('lessonPlanId').optional().isString(),
    body('lessonTitle').optional().isString().isLength({ max: 200 }),
    body('subject').optional().isString().isLength({ max: 100 }),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teacherId = req.user?.id;
      
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { studentIds, content, lessonPlanId, lessonTitle, subject } = req.body;

      // Verify all students exist and belong to this teacher
      const students = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          userId: teacherId,
        },
      });

      if (students.length !== studentIds.length) {
        res.status(400).json({ error: 'Some students not found or not authorized' });
        return;
      }

      // Create notes for all students with proper transaction
      const createdNotes = await prisma.$transaction(async (tx) => {
        const notePromises = studentIds.map((studentId: string) => 
          tx.note.create({
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
          })
        );
        
        return Promise.all(notePromises);
      });

      res.status(201).json({
        message: `Created ${createdNotes.length} notes`,
        notes: createdNotes,
      });
    } catch (error) {
      console.error('Error creating bulk notes:', error);
      res.status(500).json({ error: 'Failed to create notes' });
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

      // Verify note exists and belongs to this teacher and isn't already deleted
      const existingNote = await prisma.note.findFirst({
        where: {
          id,
          teacherId,
          deletedAt: null, // Only find non-deleted notes
        },
      });

      if (!existingNote) {
        res.status(404).json({ error: 'Note not found' });
        return;
      }

      // Soft delete: update deletedAt and deletedBy
      try {
        await prisma.note.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            deletedBy: teacherId,
          },
        });
      } catch (updateError: any) {
        console.error('Failed to update note for soft delete:', updateError);
        res.status(500).json({ error: 'Failed to update note for deletion', details: updateError.message });
        return;
      }

      // Create audit log for soft delete
      await createAuditLog('DELETE', id, teacherId, existingNote, { deletedAt: new Date() });

      res.status(204).send();
    } catch (error: any) {
      console.error('Error in delete note handler:', error);
      res.status(500).json({ error: 'Failed to delete note', details: error.message });
    }
  }
);

// GET /api/notes/export - Export notes to CSV
router.get('/export',
  authenticate,
  [
    query('format').optional().isIn(['csv', 'json']).withMessage('Format must be csv or json'),
    query('studentId').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teacherId = req.user?.id;
      const format = req.query.format || 'csv';
      
      if (!teacherId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const where: any = { 
        teacherId,
        deletedAt: null
      };
      
      if (req.query.studentId) where.studentId = req.query.studentId;
      if (req.query.startDate || req.query.endDate) {
        where.createdAt = {};
        if (req.query.startDate) where.createdAt.gte = new Date(req.query.startDate as string);
        if (req.query.endDate) where.createdAt.lte = new Date(req.query.endDate as string);
      }

      const notes = await prisma.note.findMany({
        where,
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'json') {
        res.json(notes);
      } else {
        // Generate CSV
        const csv = [
          'Date,Student,Subject,Lesson,Content',
          ...notes.map(note => {
            const date = new Date(note.createdAt).toLocaleDateString();
            const student = `${note.student.firstName} ${note.student.lastName}`;
            const subject = note.subject || '';
            const lesson = note.lessonTitle || '';
            const content = `"${note.content.replace(/"/g, '""')}"`;
            return `${date},${student},${subject},${lesson},${content}`;
          })
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="anecdotal-notes-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
      }
    } catch (error) {
      console.error('Error exporting notes:', error);
      res.status(500).json({ error: 'Failed to export notes' });
    }
  }
);

export default router;