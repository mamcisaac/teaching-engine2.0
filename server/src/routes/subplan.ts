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
        include: { 
          items: { 
            include: { 
              activity: { 
                include: { 
                  outcomes: { include: { outcome: true } } 
                } 
              }, 
              slot: true 
            } 
          } 
        },
      });
      
      if (plan) {
        // Extract all unique outcomes from activities
        const uniqueOutcomes = new Map<string, {
          code: string;
          description: string;
          subject: string;
        }>();
        
        for (const item of plan.items) {
          if (item.activity?.outcomes) {
            for (const outcomeRelation of item.activity.outcomes) {
              const outcome = outcomeRelation.outcome;
              uniqueOutcomes.set(outcome.id, {
                code: outcome.code,
                description: outcome.description,
                subject: outcome.subject
              });
            }
          }
        }
        
        data = {
          today: plan.items.map((i) => ({
            time: minToTime(i.startMin),
            activity: i.activity?.title ?? '',
          })),
          upcoming: [],
          procedures: '',
          studentNotes: '',
          emergencyContacts: '',
          curriculumOutcomes: Array.from(uniqueOutcomes.values())
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
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    // Validate date is valid
    const testDate = new Date(date);
    if (isNaN(testDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided' });
    }
    
    const days = Math.min(3, Math.max(1, Number(req.query.days) || 1));
    const pdf = await generateSubPlan(date, days);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

export default router;
