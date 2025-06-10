import cron from 'node-cron';
import { prisma } from '../prisma';

export interface TermMidpoint {
  term: string;
  date: Date;
}

export const TERM_MIDPOINTS: TermMidpoint[] = [
  { term: 'Term 1', date: new Date('2025-10-15') },
  { term: 'Term 2', date: new Date('2025-02-14') },
  { term: 'Term 3', date: new Date('2025-05-05') },
];

export async function checkNewsletterTriggers(midpoints: TermMidpoint[] = TERM_MIDPOINTS) {
  const todayStr = new Date().toISOString().slice(0, 10);
  for (const mp of midpoints) {
    if (mp.date.toISOString().slice(0, 10) === todayStr) {
      await prisma.notification.create({
        data: {
          message: `Time to send a newsletter for ${mp.term}!`,
          type: 'NEWSLETTER_SUGGESTION',
          dueDate: new Date(mp.date.getTime() + 2 * 86400000),
        },
      });
    }
  }
}

export function scheduleNewsletterTriggers() {
  cron.schedule('0 7 * * *', () => checkNewsletterTriggers());
}
