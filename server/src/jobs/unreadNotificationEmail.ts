import cron from 'node-cron';
import { prisma } from '../prisma';
import { sendEmail } from '../services/emailService';

export async function sendUnreadNotifications() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const notes = await prisma.notification.findMany({
    where: { read: false, createdAt: { lte: cutoff } },
  });
  for (const n of notes) {
    await sendEmail('teacher@example.com', 'Unread Notification', n.message);
  }
}

export function scheduleUnreadNotificationEmails() {
  cron.schedule('0 7 * * *', sendUnreadNotifications);
}
