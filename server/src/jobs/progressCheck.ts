import cron from 'node-cron';
import { prisma } from '../prisma';

/**
 * Query unit plans that are due within the next week and notify the teacher
 * about any plans that need attention.
 *
 * A notification record is created for each unit plan found.
 */
export async function runProgressCheck() {
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 7);
  const unitPlans = await prisma.unitPlan.findMany({
    where: {
      endDate: { lte: soon },
    },
    include: { lessonPlans: true, user: true },
  });
  for (const plan of unitPlans) {
    const incompleteLessons = plan.lessonPlans.filter((l) => l.date > today).length;
    if (incompleteLessons > 0) {
      const message = `Unit Plan "${plan.title}" is ending soon with ${incompleteLessons} upcoming lessons`;
      await prisma.notification.create({ data: { message } });
      // Email notifications were removed - only in-app notifications remain
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
