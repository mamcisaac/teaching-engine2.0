import { Router } from 'express';

const router = Router();

// Stub routes for lesson generation
router.post('/generate', async (_req, res) => {
  res.json({
    success: true,
    message: 'Lesson generation endpoint',
    data: null
  });
});

router.get('/status/:id', async (_req, res) => {
  res.json({
    success: true,
    status: 'completed',
    data: null
  });
});

export { router };