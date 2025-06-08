import prisma from '../src/prisma';
import { checkAlerts } from '../src/services/progressAnalytics';

beforeAll(async () => {
  await prisma.notification.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();

  const subject = await prisma.subject.create({ data: { name: 'Math' } });
  await prisma.milestone.create({
    data: {
      title: 'M1',
      subjectId: subject.id,
      targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      activities: { create: { title: 'A1' } },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('creates notification when milestone due soon', async () => {
  await checkAlerts();
  const notifications = await prisma.notification.findMany();
  expect(notifications.length).toBeGreaterThan(0);
});
