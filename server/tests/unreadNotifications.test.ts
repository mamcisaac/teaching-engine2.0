import { prisma } from '../src/prisma';
import { sendUnreadNotifications } from '../src/jobs/unreadNotificationEmail';
import * as email from '../src/services/emailService';

jest.spyOn(email, 'sendEmail').mockResolvedValue(Promise.resolve());

beforeAll(async () => {
  await prisma.notification.deleteMany();
});

afterAll(async () => {
  await prisma.notification.deleteMany();
  await prisma.$disconnect();
});

test('emails unread notifications older than 48h', async () => {
  const old = await prisma.notification.create({
    data: { message: 'Old note', createdAt: new Date(Date.now() - 3 * 86400000) },
  });
  await sendUnreadNotifications();
  expect(email.sendEmail).toHaveBeenCalled();
  await prisma.notification.delete({ where: { id: old.id } });
});
