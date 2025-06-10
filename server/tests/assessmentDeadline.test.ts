import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';

beforeAll(async () => {
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  await prisma.weeklySchedule.deleteMany();
  await prisma.dailyPlanItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.unavailableBlock.deleteMany();
  await prisma.reportDeadline.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
});

afterAll(async () => {
  await prisma.reportDeadline.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.dailyPlanItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.unavailableBlock.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.$disconnect();
});

test('rejects assessment scheduled after deadline', async () => {
  const teacher = await prisma.user.create({
    data: { email: `t${Date.now()}@e.com`, password: 'x', name: 'T' },
  });
  const deadline = await prisma.reportDeadline.create({
    data: { teacherId: teacher.id, name: 'Midterm', date: new Date('2025-02-14') },
  });
  const subject = await prisma.subject.create({ data: { name: 'Math', userId: teacher.id } });
  const milestone = await prisma.milestone.create({
    data: { title: 'M', subjectId: subject.id, userId: teacher.id, deadlineId: deadline.id },
  });
  await prisma.activity.create({
    data: { title: 'Quiz', milestoneId: milestone.id, activityType: 'ASSESSMENT' },
  });
  await prisma.timetableSlot.create({
    data: { day: 0, startMin: 540, endMin: 600, subjectId: subject.id },
  });
  const res = await request(app)
    .post('/api/lesson-plans/generate')
    .send({ weekStart: '2025-02-17T00:00:00.000Z' });
  expect(res.status).toBe(400);
});
