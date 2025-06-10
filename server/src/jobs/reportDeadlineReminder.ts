import cron from 'node-cron';
import { prisma } from '../prisma';

export async function sendReportDeadlineReminders() {
  const today = new Date();
  const deadlines = await prisma.reportDeadline.findMany();
  for (const dl of deadlines) {
    const reminderDate = new Date(dl.date);
    reminderDate.setDate(reminderDate.getDate() - dl.remindDaysBefore);
    if (today.toISOString().slice(0, 10) === reminderDate.toISOString().slice(0, 10)) {
      await prisma.notification.create({
        data: {
          type: 'ASSESSMENT_REMINDER',
          message: `Schedule and grade assessments for "${dl.name}" due ${dl.date.toISOString().slice(0, 10)}.`,
        },
      });
    }
  }
}

export function scheduleReportDeadlineReminders() {
  cron.schedule('0 2 * * *', sendReportDeadlineReminders);
}
