import { Router } from 'express';
import { prisma } from '../prisma';
import {
  renderTemplate,
  generatePdf,
  generateDocx,
  collectContent,
} from '../services/newsletterGenerator';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const newsletters = await prisma.newsletter.findMany();
    res.json(newsletters);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, content, template } = req.body as {
      title: string;
      content: string;
      template?: string;
    };
    const html = renderTemplate(template ?? 'weekly', { title, content });
    const newsletter = await prisma.newsletter.create({ data: { title, content: html } });
    res.status(201).json(newsletter);
  } catch (err) {
    next(err);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      template = 'weekly',
      includePhotos,
    } = req.body as {
      startDate: string;
      endDate: string;
      template?: string;
      includePhotos?: boolean;
    };
    const data = await collectContent(startDate, endDate);
    const html = renderTemplate(template, {
      title: `Newsletter ${startDate} - ${endDate}`,
      activities: data.activities,
      photos: includePhotos ? data.photos : [],
    });
    const newsletter = await prisma.newsletter.create({
      data: { title: `Newsletter ${startDate} - ${endDate}`, content: html },
    });
    res.status(201).json(newsletter);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const newsletter = await prisma.newsletter.findUnique({ where: { id: Number(req.params.id) } });
    if (!newsletter) return res.status(404).json({ error: 'Not Found' });
    res.json(newsletter);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, content } = req.body as { title: string; content: string };
    const newsletter = await prisma.newsletter.update({
      where: { id: Number(req.params.id) },
      data: { title, content },
    });
    res.json(newsletter);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.newsletter.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/:id/pdf', async (req, res, next) => {
  try {
    const nl = await prisma.newsletter.findUnique({ where: { id: Number(req.params.id) } });
    if (!nl) return res.status(404).json({ error: 'Not Found' });
    const pdf = await generatePdf(nl.content);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/docx', async (req, res, next) => {
  try {
    const nl = await prisma.newsletter.findUnique({ where: { id: Number(req.params.id) } });
    if (!nl) return res.status(404).json({ error: 'Not Found' });
    const docx = await generateDocx(nl.content);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.send(docx);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/html', async (req, res, next) => {
  try {
    const nl = await prisma.newsletter.findUnique({ where: { id: Number(req.params.id) } });
    if (!nl) return res.status(404).json({ error: 'Not Found' });
    res.setHeader('Content-Type', 'text/html');
    res.send(nl.content);
  } catch (err) {
    next(err);
  }
});

export default router;
