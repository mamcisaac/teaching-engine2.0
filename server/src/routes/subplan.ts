import { Router } from 'express';
import { generateSubPlanPDF, SubPlanInput } from '../services/subPlanGenerator';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const pdf = await generateSubPlanPDF(req.body as SubPlanInput);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

export default router;
