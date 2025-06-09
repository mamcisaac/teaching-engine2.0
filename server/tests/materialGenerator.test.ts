import { prisma } from '../src/prisma';
import { generateMaterialList } from '../src/services/materialGenerator';

describe('material generator', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.$disconnect();
  });

  it('extracts materials from notes', async () => {
    const subj = await prisma.subject.create({ data: { name: 'S' } });
    const milestone = await prisma.milestone.create({ data: { title: 'M', subjectId: subj.id } });
    const act = await prisma.activity.create({
      data: { title: 'A', milestoneId: milestone.id, publicNote: 'Materials: glue, paper' },
    });
    await prisma.lessonPlan.create({
      data: {
        weekStart: new Date('2024-01-01'),
        schedule: { create: { day: 0, activityId: act.id } },
      },
    });
    const list = await generateMaterialList('2024-01-01');
    expect(list).toContain('glue');
    expect(list).toContain('paper');
  });
});
