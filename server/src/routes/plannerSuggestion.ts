import { Router } from 'express';
import { generateSuggestions } from '../services/planningEngine';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filtersParam = typeof req.query.filters === 'string' ? req.query.filters : undefined;
    const filters = filtersParam ? JSON.parse(filtersParam) : {};
    const suggestions = await generateSuggestions({ filters });
    res.json(suggestions);
  } catch (err) {
    next(err);
  }
});

export default router;
