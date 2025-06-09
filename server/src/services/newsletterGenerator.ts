import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import PDFDocument from 'pdfkit';
import htmlToDocx from 'html-to-docx';
import { prisma } from '../prisma';
import { getMilestoneProgress } from './progressAnalytics';

export const ALLOWED_TEMPLATES = ['weekly', 'monthly'] as const;
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

export async function generateDocx(html: string): Promise<Buffer> {
  const arrayBuffer = (await htmlToDocx(html)) as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}

export interface NewsletterContent {
  activities: Record<string, string[]>;
  photos: string[];
}

export interface NewsletterDraft {
  title: string;
  content: string;
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

export async function collectUpcomingActivities(weekStart: string): Promise<string[]> {
  const start = new Date(weekStart);
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const schedules = await prisma.weeklySchedule.findMany({
    where: {
      lessonPlan: { weekStart: { gte: start, lt: end } },
    },
    include: { activity: true },
    orderBy: { day: 'asc' },
  });

  return schedules.map((s) => s.activity.title);
}

async function polishWithLLM(text: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return text;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You craft short, upbeat classroom newsletters for parents.',
          },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
      }),
    });
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content?.trim() ?? text;
  } catch (err) {
    return text;
  }
}

export async function generateNewsletterDraft(
  startDate: string,
  endDate: string,
  includePhotos = false,
  useLLM = false,
): Promise<NewsletterDraft> {
  const data = await collectWeeklyContent(startDate);
  const upcoming = await collectUpcomingActivities(startDate);
  const progress = await getMilestoneProgress();
  const completed = progress.filter((m) => m.completionRate === 1).map((m) => m.title);

  let content = '<h2>What we did</h2><ul>';
  for (const [subject, acts] of Object.entries(data.activities)) {
    content += `<li><strong>${subject}:</strong> ${acts.join(', ')}</li>`;
  }
  content += '</ul>';

  if (includePhotos && data.photos.length) {
    content +=
      '<h2>Photos</h2>' + data.photos.map((p) => `<img src="${p}" alt="photo" />`).join('');
  }

  if (completed.length) {
    content +=
      '<h2>Milestones Completed</h2><ul>' +
      completed.map((c) => `<li>${c}</li>`).join('') +
      '</ul>';
  }

  if (upcoming.length) {
    content += '<h2>Coming Up</h2><ul>' + upcoming.map((u) => `<li>${u}</li>`).join('') + '</ul>';
  }

  if (useLLM) {
    const plain =
      `Activities: ${Object.entries(data.activities)
        .map(([s, a]) => `${s}: ${a.join(', ')}`)
        .join('; ')}. ` +
      (completed.length ? `Milestones: ${completed.join(', ')}. ` : '') +
      (upcoming.length ? `Upcoming: ${upcoming.join(', ')}.` : '');
    const polished = await polishWithLLM(plain);
    content += `<p>${polished}</p>`;
  }

  return {
    title: `Newsletter ${startDate} - ${endDate}`,
    content,
  };
}
