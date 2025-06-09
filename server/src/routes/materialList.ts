import { Router } from 'express';
import { prisma } from '../prisma';
import {
  generateMaterialList,
  generateMaterialDetails,
  zipWeeklyPrintables,
} from '../services/materialGenerator';

const router = Router();

router.get('/:weekStart', async (req, res, next) => {
  try {
    const list = await prisma.materialList.findFirst({
      where: { weekStart: new Date(req.params.weekStart) },
    });
    if (!list) return res.status(404).json({ error: 'Not Found' });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { weekStart, items } = req.body as { weekStart: string; items: string[] };
    const list = await prisma.materialList.create({
      data: { weekStart: new Date(weekStart), items: JSON.stringify(items) },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const { weekStart } = req.body as { weekStart: string };
    const items = await generateMaterialList(weekStart);
    const existing = await prisma.materialList.findFirst({
      where: { weekStart: new Date(weekStart) },
    });
    let list;
    if (existing) {
      list = await prisma.materialList.update({
        where: { id: existing.id },
        data: { items: JSON.stringify(items) },
      });
    } else {
      list = await prisma.materialList.create({
        data: { weekStart: new Date(weekStart), items: JSON.stringify(items) },
      });
    }
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/:weekStart/details', async (req, res, next) => {
  try {
    const details = await generateMaterialDetails(req.params.weekStart);
    res.json(details);
  } catch (err) {
    next(err);
  }
});

router.get('/:weekStart/zip', async (req, res, next) => {
  try {
    const zip = await zipWeeklyPrintables(req.params.weekStart);
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename="printables.zip"');
    res.send(zip);
  } catch (err) {
    next(err);
  }
});

export default router;
