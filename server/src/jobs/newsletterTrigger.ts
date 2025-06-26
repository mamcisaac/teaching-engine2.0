import cron from 'node-cron';

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
  // DISABLED: Notification model has been archived
  // TODO: Implement using ParentMessage for newsletter notifications
  const todayStr = new Date().toISOString().slice(0, 10);
  for (const mp of midpoints) {
    if (mp.date.toISOString().slice(0, 10) === todayStr) {
      console.warn(`Newsletter trigger for ${mp.term} - Notification model archived`);
    }
  }
}

export function scheduleNewsletterTriggers() {
  cron.schedule('0 7 * * *', () => checkNewsletterTriggers());
}
