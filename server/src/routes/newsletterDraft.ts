import { Router } from 'express';
import { generateTermNewsletterDraft } from '../services/newsletterGenerator';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const draft = await generateTermNewsletterDraft(req.body);
    res.json(draft);
  } catch (err) {
    next(err);
  }
});

export default router;
