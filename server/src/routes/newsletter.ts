import { Router } from 'express';
import prisma from '../prisma';
import { generateNewsletter, toPdf, toDocx } from '../services/newsletterGenerator';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { template, startDate, endDate, content } = req.body;
    const newsletter = await generateNewsletter({
      template,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      content,
    });
    res.status(201).json({ id: newsletter.id });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: Number(req.params.id) } });
    if (!newsletter) return res.status(404).json({ error: 'Not Found' });
    const pdf = await toPdf(newsletter.html);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/docx', async (req, res, next) => {
  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: Number(req.params.id) } });
    if (!newsletter) return res.status(404).json({ error: 'Not Found' });
    const doc = await toDocx(newsletter.html);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.send(doc);
  } catch (err) {
    next(err);
  }
});

export default router;
