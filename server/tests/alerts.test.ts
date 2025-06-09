import { prisma } from '../src/prisma';
import { runProgressCheck } from '../src/jobs/progressCheck';

beforeAll(async () => {
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  await prisma.weeklySchedule.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
});

afterAll(async () => {
  await prisma.weeklySchedule.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.$disconnect();
});

describe('progress alerts', () => {
  it('creates notification when milestone due soon', async () => {
    const subj = await prisma.subject.create({ data: { name: 'N' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M', subjectId: subj.id, targetDate: new Date() },
    });
    await prisma.activity.create({ data: { title: 'A', milestoneId: milestone.id } });

    await runProgressCheck();
    const notes = await prisma.notification.findMany();
    expect(notes.length).toBe(1);
    expect(notes[0].message).toContain('Milestone');
  });
});
