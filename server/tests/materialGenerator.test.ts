import { prisma } from '../src/prisma';
import fs from 'fs/promises';
import path from 'path';
import { generateMaterialList, zipWeeklyPrintables } from '../src/services/materialGenerator';

describe('material generator', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.weeklySchedule.deleteMany();
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
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

  it('extracts bullet list materials', async () => {
    const subj = await prisma.subject.create({ data: { name: 'S2' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M2', subjectId: subj.id },
    });
    const act = await prisma.activity.create({
      data: {
        title: 'A2',
        milestoneId: milestone.id,
        publicNote: 'Materials:\n- scissors\n- tape',
      },
    });
    await prisma.lessonPlan.create({
      data: {
        weekStart: new Date('2024-02-01'),
        schedule: { create: { day: 0, activityId: act.id } },
      },
    });
    const list = await generateMaterialList('2024-02-01');
    expect(list).toEqual(expect.arrayContaining(['scissors', 'tape']));
  });

  it('creates zip of weekly printables', async () => {
    const subj = await prisma.subject.create({ data: { name: 'S3' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M3', subjectId: subj.id },
    });
    const act = await prisma.activity.create({
      data: { title: 'A3', milestoneId: milestone.id },
    });
    await prisma.lessonPlan.create({
      data: {
        weekStart: new Date('2024-03-01'),
        schedule: { create: { day: 0, activityId: act.id } },
      },
    });
    const uploads = path.join(__dirname, '../src/uploads');
    await fs.mkdir(uploads, { recursive: true });
    await fs.writeFile(path.join(uploads, 'file.txt'), 'hi');
    await prisma.resource.create({
      data: {
        filename: 'file.txt',
        url: '/uploads/file.txt',
        type: 'text/plain',
        size: 2,
        activityId: act.id,
      },
    });
    const zip = await zipWeeklyPrintables('2024-03-01');
    expect(zip.length).toBeGreaterThan(0);
  });
});
