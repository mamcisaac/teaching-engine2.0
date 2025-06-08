import cron from 'node-cron';
import { prisma } from '../prisma';
import { sendEmail } from '../services/emailService';

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

export function scheduleProgressCheck() {
  cron.schedule('0 6 * * *', runProgressCheck);
}
