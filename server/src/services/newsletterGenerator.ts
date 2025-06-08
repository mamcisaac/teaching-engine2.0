import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import PDFDocument from 'pdfkit';
import prisma from '../prisma';

export function renderTemplate(name: string, data: { title: string; content: string }): string {
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

export async function collectContent(): Promise<string> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const activities = await prisma.activity.findMany({
    where: { completedAt: { gte: since } },
    include: { milestone: { include: { subject: true } } },
  });
  return activities
    .map((a) => `- ${a.milestone.subject.name}: ${a.title}`)
    .join('\n');
}
