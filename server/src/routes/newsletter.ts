import { Router } from 'express';
import { prisma } from '../prisma';
import {
  renderTemplate,
  generatePdf,
  generateDocx,
  NewsletterTemplate,
  generateNewsletterDraft,
} from '../services/newsletterGenerator';
import { sendEmail } from '../services/emailService';
import { validate, newsletterGenerateSchema } from '../validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const newsletters = await prisma.newsletter.findMany();
    res.json(newsletters);
  } catch (err) {
    next(err);
  }
});

router.post('/generate', validate(newsletterGenerateSchema), async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      template = 'weekly',
      includePhotos = false,
      useLLM = false,
    } = req.body as {
      startDate: string;
      endDate: string;
      template?: NewsletterTemplate;
      includePhotos?: boolean;
      useLLM?: boolean;
    };

    const draft = await generateNewsletterDraft(startDate, endDate, includePhotos, useLLM);
    const html = renderTemplate(template, draft);
    const newsletter = await prisma.newsletter.create({
      data: { title: draft.title, content: html },
    });
    res.status(201).json(newsletter);
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
    let html: string;
    try {
      html = renderTemplate(template ?? 'weekly', { title, content });
    } catch (err) {
      if (err instanceof Error && err.message === 'Invalid template') {
        return res.status(400).json({ error: err.message });
      }
      throw err;
    }
    const newsletter = await prisma.newsletter.create({ data: { title, content: html } });
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
    res.setHeader('Content-Disposition', 'attachment; filename="newsletter.docx"');
    res.send(docx);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/send', async (req, res, next) => {
  try {
    const nl = await prisma.newsletter.findUnique({ where: { id: Number(req.params.id) } });
    if (!nl) return res.status(404).json({ error: 'Not Found' });
    const contacts = await prisma.parentContact.findMany();
    const pdf = await generatePdf(nl.content);
    for (const c of contacts) {
      await sendEmail(c.email, nl.title, 'Please see the attached newsletter.', {
        filename: 'newsletter.pdf',
        content: pdf,
      });
    }
    res.json({ sent: contacts.length });
  } catch (err) {
    next(err);
  }
});

export default router;
