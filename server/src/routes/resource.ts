import { Router } from 'express';
import { prisma } from '../prisma';
import { saveFile } from '../storage';
import { getResourceSuggestions } from '../services/resourceSuggestions.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const resources = await prisma.resource.findMany();
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!resource) return res.status(404).json({ error: 'Not Found' });
    res.json(resource);
  } catch (err) {
    next(err);
  }
});

router.get('/activity/:activityId', async (req, res, next) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { activityId: Number(req.params.activityId) },
    });
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

router.get('/suggestions', async (req, res, next) => {
  try {
    const activityId = Number(req.query.activityId);
    if (!activityId || isNaN(activityId)) {
      return res.status(400).json({ error: 'Valid activityId is required' });
    }
    const suggestions = await getResourceSuggestions(activityId);
    res.json(suggestions);
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

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.resource.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
