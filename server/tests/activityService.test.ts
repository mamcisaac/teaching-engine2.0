import { prisma } from '../src/prisma';
import { reorderActivities } from '../src/services/activityService';

beforeAll(async () => {
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
});

afterAll(async () => {
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.$disconnect();
});

describe('activity service', () => {
  it('reorders activities', async () => {
    const subject = await prisma.subject.create({ data: { name: 'S' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M', subjectId: subject.id },
    });
    const a1 = await prisma.activity.create({ data: { title: 'A1', milestoneId: milestone.id } });
    const a2 = await prisma.activity.create({ data: { title: 'A2', milestoneId: milestone.id } });
    const a3 = await prisma.activity.create({ data: { title: 'A3', milestoneId: milestone.id } });

    const ordered = await reorderActivities(milestone.id, [a3.id, a1.id, a2.id]);
    expect(ordered.map((a) => a.id)).toEqual([a3.id, a1.id, a2.id]);

    const stored = await prisma.activity.findMany({
      where: { milestoneId: milestone.id },
      orderBy: { orderIndex: 'asc' },
    });
    expect(stored.map((a) => a.id)).toEqual([a3.id, a1.id, a2.id]);
  });
});
