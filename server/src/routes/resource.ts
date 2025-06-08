import { Router } from 'express';
import prisma from '../prisma';
import { saveFile } from '../storage';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const resources = await prisma.resource.findMany();
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { filename, data, type, size, activityId } = req.body as {
      filename: string;
      data: string;
      type: string;
      size: number;
      activityId?: number;
    };
    if (!filename || !data) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    const buffer = Buffer.from(data, 'base64');
    const url = await saveFile(filename, buffer);
    const resource = await prisma.resource.create({
      data: { filename, url, type, size, activityId },
    });
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
});

export default router;
