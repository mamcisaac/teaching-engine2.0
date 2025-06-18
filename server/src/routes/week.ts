import { Router } from 'express';
import { prisma } from '../prisma';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import archiver from 'archiver';

const router = Router();

// Get directory name in ES module
const __filename_week = fileURLToPath(import.meta.url);
const __dirname_week = path.dirname(__filename_week);

const uploadDir = path.join(__dirname_week, '../uploads');

router.get('/:id/resources.zip', async (req, res, next) => {
  try {
    const week = await prisma.lessonPlan.findUnique({
      where: { id: Number(req.params.id) },
      include: { schedule: { include: { activity: { include: { resources: true } } } } },
    });
    if (!week) return res.status(404).json({ error: 'Not Found' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=week-${week.id}-resources.zip`);

    const archive = archiver('zip');
    archive.on('error', (err) => next(err));
    archive.pipe(res);

    for (const entry of week.schedule) {
      for (const resource of entry.activity.resources) {
        if (resource.url.startsWith('/uploads/')) {
          const filePath = path.join(uploadDir, path.basename(resource.url));
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: resource.filename });
          }
        }
      }
    }
    archive.finalize();
  } catch (err) {
    next(err);
  }
});

export default router;
