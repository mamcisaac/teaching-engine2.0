import { Router } from 'express';
import { prisma } from '../prisma';
import { generateSubPlanPDF, SubPlanInput } from '../services/subPlanGenerator';
import { generateSubPlan } from '../services/subPlanService';

const router = Router();

function minToTime(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

router.post('/', async (req, res, next) => {
  try {
    let data = req.body as SubPlanInput;
    if (!data.today && req.query.date) {
      const plan = await prisma.dailyPlan.findFirst({
        where: { date: new Date(String(req.query.date)) },
        include: { items: { include: { activity: true, slot: true } } },
      });
      if (plan) {
        data = {
          today: plan.items.map((i) => ({
            time: minToTime(i.startMin),
            activity: i.activity?.title ?? '',
          })),
          upcoming: [],
          procedures: '',
          studentNotes: '',
          emergencyContacts: '',
        };
      }
    }
    const pdf = await generateSubPlanPDF(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const days = Math.min(3, Math.max(1, Number(req.query.days) || 1));
    const pdf = await generateSubPlan(date, days);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

export default router;
