import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import PDFDocument from 'pdfkit';
import { prisma } from '../prisma';

export function renderTemplate(name: string, data: Record<string, unknown>): string {
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

export async function collectContent(
  startDate: string,
  endDate: string,
): Promise<NewsletterContent> {
  const start = new Date(startDate);
  const end = new Date(endDate);

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

/**
 * Collect data for a weekly newsletter based on completed activities.
 */
export async function collectWeeklyContent(weekStart: string): Promise<NewsletterContent> {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return collectContent(start.toISOString(), end.toISOString());
}
