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
  outcomes: Array<{
    code: string;
    description: string;
    subject: string;
  }>;
}

export async function collectPublicNotes(startDate: string, endDate: string): Promise<string[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);

  const notes = await prisma.note.findMany({
    where: {
      public: true,
      OR: [
        { createdAt: { gte: start, lt: end } },
        { dailyPlan: { date: { gte: start, lt: end } } },
        { activity: { completedAt: { gte: start, lt: end } } },
      ],
    },
  });
  return notes.map((n) => n.content);
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
      outcomes: { include: { outcome: true } }
    },
  });

  const bySubject: Record<string, string[]> = {};
  const photos: string[] = [];
  
  // Map to store unique outcomes
  const uniqueOutcomes = new Map<string, {
    code: string;
    description: string;
    subject: string;
  }>();
  
  for (const a of acts) {
    const subject = a.milestone.subject.name;
    (bySubject[subject] ??= []).push(a.title);
    a.resources.forEach((r) => photos.push(r.url));
    
    // Extract outcomes
    if (a.outcomes) {
      for (const outcomeRelation of a.outcomes) {
        const outcome = outcomeRelation.outcome;
        uniqueOutcomes.set(outcome.id, {
          code: outcome.code,
          description: outcome.description,
          subject: outcome.subject
        });
      }
    }
  }

  return { 
    activities: bySubject, 
    photos,
    outcomes: Array.from(uniqueOutcomes.values())
  };
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
  const notes = await collectPublicNotes(startDate, endDate);
  const progress = await getMilestoneProgress();
  const completed = progress.filter((m) => m.completionRate === 1).map((m) => m.title);
  const summary = progress
    .map((m) => `${m.title}: ${Math.round(m.completionRate * 100)}%`)
    .join(', ');

  const highlights = Object.values(data.activities).flat().slice(0, 3);

  let content = '';
  if (highlights.length) {
    content +=
      '<h2>Weekly Highlights</h2><ul>' + highlights.map((h) => `<li>${h}</li>`).join('') + '</ul>';
  }
  content += '<h2>What we did</h2><ul>';
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

  if (summary) {
    content += `<p><strong>Progress:</strong> ${summary}</p>`;
  }

  // Add curriculum outcomes section
  if (data.outcomes.length > 0) {
    content += '<h2>Curriculum Outcomes Covered</h2>';
    
    // Group outcomes by subject
    const bySubject: Record<string, Array<{code: string, description: string}>> = {};
    data.outcomes.forEach(outcome => {
      if (!bySubject[outcome.subject]) {
        bySubject[outcome.subject] = [];
      }
      bySubject[outcome.subject].push({
        code: outcome.code,
        description: outcome.description
      });
    });
    
    // Add outcomes by subject
    Object.entries(bySubject).forEach(([subject, outcomes]) => {
      content += `<h3>${subject}</h3><ul>`;
      outcomes.forEach(outcome => {
        content += `<li><strong>${outcome.code}</strong>: ${outcome.description}</li>`;
      });
      content += '</ul>';
    });
  }

  if (upcoming.length) {
    content +=
      '<h2>Learning Goals</h2><ul>' + upcoming.map((u) => `<li>${u}</li>`).join('') + '</ul>';
  }

  if (notes.length) {
    content +=
      '<h2>Notes from the Classroom</h2><ul>' +
      notes.map((n) => `<li>${n}</li>`).join('') +
      '</ul>';
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

export interface TermNewsletterInput {
  completedActivities: string[];
  classMilestones: string[];
  teacherTone: string;
  term: string;
  includeUpcomingTopics: boolean;
}

export async function generateTermNewsletterDraft(
  input: TermNewsletterInput,
): Promise<NewsletterDraft> {
  const { completedActivities, classMilestones, teacherTone, term, includeUpcomingTopics } = input;

  const prompt =
    `Write a short classroom newsletter in a ${teacherTone} tone.\n` +
    `Term: ${term}.\nCompleted: ${completedActivities.join(', ')}.\n` +
    `Milestones: ${classMilestones.join(', ')}.` +
    (includeUpcomingTopics ? '\nInclude a section about upcoming topics.' : '');

  const content = await polishWithLLM(prompt);
  return { title: `${term} Update`, content: content || prompt };
}
