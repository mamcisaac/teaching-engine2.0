import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { prisma } from '../prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads with auth-aware storage
const createUploadStorage = () =>
  multer({
    storage: multer.diskStorage({
      destination: async (req: AuthRequest, file, cb) => {
        const userId = req.userId || 'default';
        const userUploadDir = path.join(__dirname, '../uploads', userId.toString());
        await fs.mkdir(userUploadDir, { recursive: true });
        cb(null, userUploadDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Accept images, PDFs, videos, and audio files
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`));
      }
    },
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  });

// Get all media resources for a user
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const resources = await prisma.mediaResource.findMany({
      where: { userId },
      include: {
        linkedOutcomes: {
          include: { outcome: true },
        },
        linkedActivities: {
          include: { activity: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(resources);
  } catch (err) {
    next(err);
  }
});

// Get a specific media resource
router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const resource = await prisma.mediaResource.findUnique({
      where: { id },
      include: {
        linkedOutcomes: {
          include: { outcome: true },
        },
        linkedActivities: {
          include: { activity: true },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (err) {
    next(err);
  }
});

// Upload a new media resource
router.post(
  '/upload',
  authMiddleware,
  createUploadStorage().single('file'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { title, tags, linkedOutcomeIds, linkedActivityIds } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }

      // Determine file type based on MIME type
      let fileType = 'unknown';
      if (req.file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (req.file.mimetype === 'application/pdf') {
        fileType = 'pdf';
      } else if (req.file.mimetype.startsWith('video/')) {
        fileType = 'video';
      } else if (req.file.mimetype.startsWith('audio/')) {
        fileType = 'audio';
      }

      // Parse tags (JSON array)
      let parsedTags = '[]';
      if (tags) {
        try {
          parsedTags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
        } catch (e) {
          parsedTags = '[]';
        }
      }

      // Create the media resource
      const resource = await prisma.mediaResource.create({
        data: {
          userId: req.userId!,
          title,
          filePath: req.file.path,
          fileType,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          tags: parsedTags,
        },
      });

      // Link to outcomes if provided
      if (linkedOutcomeIds) {
        const outcomeIds = Array.isArray(linkedOutcomeIds) ? linkedOutcomeIds : [linkedOutcomeIds];
        await Promise.all(
          outcomeIds.map((outcomeId: string) =>
            prisma.mediaResourceOutcome.create({
              data: {
                mediaResourceId: resource.id,
                outcomeId,
              },
            }),
          ),
        );
      }

      // Link to activities if provided
      if (linkedActivityIds) {
        const activityIds = Array.isArray(linkedActivityIds)
          ? linkedActivityIds
          : [linkedActivityIds];
        await Promise.all(
          activityIds.map((activityId: string) =>
            prisma.mediaResourceActivity.create({
              data: {
                mediaResourceId: resource.id,
                activityId: parseInt(activityId),
              },
            }),
          ),
        );
      }

      // Fetch the complete resource with relations
      const completeResource = await prisma.mediaResource.findUnique({
        where: { id: resource.id },
        include: {
          linkedOutcomes: {
            include: { outcome: true },
          },
          linkedActivities: {
            include: { activity: true },
          },
        },
      });

      res.status(201).json(completeResource);
    } catch (err) {
      next(err);
    }
  },
);

// Update media resource metadata
router.put('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, tags, linkedOutcomeIds, linkedActivityIds } = req.body;

    // Update basic metadata
    const updateData: {
      title?: string;
      tags?: string;
    } = {};
    if (title) updateData.title = title;
    if (tags) {
      updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    }

    await prisma.mediaResource.update({
      where: { id },
      data: updateData,
    });

    // Update outcome links if provided
    if (linkedOutcomeIds !== undefined) {
      // Remove existing links
      await prisma.mediaResourceOutcome.deleteMany({
        where: { mediaResourceId: id },
      });

      // Add new links
      if (linkedOutcomeIds.length > 0) {
        await Promise.all(
          linkedOutcomeIds.map((outcomeId: string) =>
            prisma.mediaResourceOutcome.create({
              data: {
                mediaResourceId: id,
                outcomeId,
              },
            }),
          ),
        );
      }
    }

    // Update activity links if provided
    if (linkedActivityIds !== undefined) {
      // Remove existing links
      await prisma.mediaResourceActivity.deleteMany({
        where: { mediaResourceId: id },
      });

      // Add new links
      if (linkedActivityIds.length > 0) {
        await Promise.all(
          linkedActivityIds.map((activityId: string) =>
            prisma.mediaResourceActivity.create({
              data: {
                mediaResourceId: id,
                activityId: parseInt(activityId),
              },
            }),
          ),
        );
      }
    }

    // Fetch updated resource with relations
    const updatedResource = await prisma.mediaResource.findUnique({
      where: { id },
      include: {
        linkedOutcomes: {
          include: { outcome: true },
        },
        linkedActivities: {
          include: { activity: true },
        },
      },
    });

    res.json(updatedResource);
  } catch (err) {
    next(err);
  }
});

// Delete a media resource
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    // Get the resource to delete the file
    const resource = await prisma.mediaResource.findUnique({
      where: { id },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Delete the file from disk
    try {
      await fs.unlink(resource.filePath);
    } catch (fileErr) {
      console.warn('Could not delete file:', fileErr);
    }

    // Delete database records (relations will be deleted automatically due to cascading)
    await prisma.mediaResource.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Serve uploaded files
router.get('/file/:userId/:filename', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { userId, filename } = req.params;
    const authenticatedUserId = req.userId!;

    // Ensure users can only access their own files
    if (parseInt(userId) !== authenticatedUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.join(__dirname, '../uploads', userId, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
      res.sendFile(path.resolve(filePath));
    } catch (err) {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
