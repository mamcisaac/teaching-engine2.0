import cron from 'node-cron';
import { prisma } from '../prisma';
import { sendEmail } from '../services/emailService';

/**
 * Query milestones that are due within the next week and notify the teacher
 * about any milestones that still have incomplete activities.
 *
 * A notification record is created for each milestone found and an email is
 * sent to the configured recipient.
 */
export async function runProgressCheck() {
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 7);
  const milestones = await prisma.milestone.findMany({
    where: {
      targetDate: { not: null, lte: soon },
    },
    include: { activities: true, subject: true },
  });
  for (const m of milestones) {
    const incomplete = m.activities.filter((a) => !a.completedAt).length;
    if (incomplete > 0) {
      const message = `Milestone "${m.title}" is due soon`;
      await prisma.notification.create({ data: { message } });
      await sendEmail('teacher@example.com', 'Milestone Alert', message);
    }
  }
}

/**
 * Schedule the progress check to run every day at 6 AM server time.
 *
 * This sets up a cron job using `node-cron` so the periodic check continues
 * to run without manual intervention.
 */
export function scheduleProgressCheck() {
  cron.schedule('0 6 * * *', runProgressCheck);
}
