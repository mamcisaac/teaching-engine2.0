import { Router, type Request } from 'express';
import multer from 'multer';
import prisma from '../prisma';
import { storeFile } from '../storage';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const resources = await prisma.resource.findMany();
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

interface FileRequest extends Request {
  file: Express.Multer.File;
}

router.post('/', upload.single('file'), async (req: FileRequest, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file' });
    const url = await storeFile(file);
    const resource = await prisma.resource.create({
      data: {
        filename: file.originalname,
        url,
        type: req.body.type || file.mimetype,
        size: file.size,
        activityId: req.body.activityId ? Number(req.body.activityId) : undefined,
      },
    });
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
});

export default router;
