import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { validate } from '../validation';

const router = Router();

const blockSchema = z.object({
  date: z.string().datetime(),
  startMin: z.number().int().min(0).max(1440),
  endMin: z.number().int().min(1).max(1440),
  reason: z.string().min(1),
  blockType: z.enum(['TEACHER_ABSENCE', 'STUDENT_PULL_OUT']),
  teacherId: z.number().int().optional(),
  affectedStudentIds: z.number().array().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const blocks = await prisma.unavailableBlock.findMany({
      where: {
        ...(from && { date: { gte: new Date(from) } }),
        ...(to && { date: { lte: new Date(to) } }),
      },
      orderBy: { date: 'asc' },
    });
    res.json(
      blocks.map((b) => ({
        ...b,
        affectedStudentIds: b.affectedStudentIds
          ? (JSON.parse(b.affectedStudentIds) as number[])
          : undefined,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(blockSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof blockSchema>;
    const block = await prisma.unavailableBlock.create({
      data: {
        date: new Date(data.date),
        startMin: data.startMin,
        endMin: data.endMin,
        reason: data.reason,
        blockType: data.blockType,
        teacherId: data.teacherId,
        affectedStudentIds: data.affectedStudentIds
          ? JSON.stringify(data.affectedStudentIds)
          : undefined,
      },
    });
    res.status(201).json({
      ...block,
      affectedStudentIds: data.affectedStudentIds,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
