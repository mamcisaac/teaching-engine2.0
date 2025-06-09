import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import PDFDocument from 'pdfkit';
import { prisma } from '../prisma';

const ALLOWED_TEMPLATES = ['weekly', 'monthly'] as const;
export type NewsletterTemplate = (typeof ALLOWED_TEMPLATES)[number];

export function renderTemplate(name: string, data: { title: string; content: string }): string {
  if (!ALLOWED_TEMPLATES.includes(name as NewsletterTemplate)) {
    throw new Error('Invalid template');
  }
  const file = path.join(__dirname, `../templates/newsletters/${name}.hbs`);
  const tmpl = fs.readFileSync(file, 'utf-8');
  return Handlebars.compile(tmpl)(data);
}

export function generatePdf(text: string): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.text(text);
    doc.end();
  });
}

export async function generateDocx(text: string): Promise<Buffer> {
  return Buffer.from(text);
}

export interface NewsletterContent {
  activities: Record<string, string[]>;
  photos: string[];
}

/**
 * Collect data for a weekly newsletter based on completed activities.
 */
export async function collectWeeklyContent(weekStart: string): Promise<NewsletterContent> {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const acts = await prisma.activity.findMany({
    where: { completedAt: { gte: start, lt: end } },
    include: {
      milestone: { include: { subject: true } },
      resources: true,
    },
  });

  const bySubject: Record<string, string[]> = {};
  const photos: string[] = [];
  for (const a of acts) {
    const subject = a.milestone.subject.name;
    (bySubject[subject] ??= []).push(a.title);
    a.resources.forEach((r) => photos.push(r.url));
  }

  return { activities: bySubject, photos };
}
