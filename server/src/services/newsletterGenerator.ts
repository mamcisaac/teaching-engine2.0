import path from 'path';
import { promises as fs } from 'fs';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { Document, Packer, Paragraph } from 'docx';
import prisma from '../prisma';

type TemplateName = 'weekly' | 'monthly' | 'custom';

export interface GenerateOptions {
  template: TemplateName;
  startDate?: Date;
  endDate?: Date;
  content?: string;
}

export async function collectContent(start?: Date, end?: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      completedAt: {
        gte: start,
        lte: end,
      },
    },
    include: { milestone: { include: { subject: true } } },
  });

  const subjects: Record<string, { name: string; activities: { title: string }[] }> = {};
  for (const a of activities) {
    const subj = a.milestone.subject;
    if (!subjects[subj.id]) {
      subjects[subj.id] = { name: subj.name, activities: [] };
    }
    subjects[subj.id].activities.push({ title: a.title });
  }

  return { subjects: Object.values(subjects) };
}

export async function generateNewsletter(options: GenerateOptions) {
  const data = await collectContent(options.startDate, options.endDate);

  let html = options.content || '';
  if (options.template !== 'custom') {
    const templatePath = path.join(
      __dirname,
      '../templates/newsletters',
      `${options.template}.hbs`,
    );
    const template = await fs.readFile(templatePath, 'utf8');
    const compiled = handlebars.compile(template);
    html = compiled(data);
  }

  const newsletter = await prisma.newsletter.create({
    data: { title: options.template, html },
  });

  return newsletter;
}

export async function toPdf(html: string) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const buffer = await page.pdf();
  await browser.close();
  return buffer;
}

export async function toDocx(html: string) {
  const doc = new Document({
    sections: [{ children: [new Paragraph(html)] }],
  });
  return Packer.toBuffer(doc);
}
