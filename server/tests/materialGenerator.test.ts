import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMaterialList, zipWeeklyPrintables } from '../src/services/materialGenerator';
import { getTestPrismaClient } from './jest.setup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('material generator', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    prisma = getTestPrismaClient();
  });

  it('extracts materials from notes', async () => {
    const subj = await prisma.subject.create({ data: { name: 'S' } });
    const milestone = await prisma.milestone.create({ data: { title: 'M', subjectId: subj.id } });
    const act = await prisma.activity.create({
      data: { title: 'A', milestoneId: milestone.id, publicNote: 'Materials: glue, paper' },
    });
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        weekStart: new Date('2024-01-01'),
        schedule: { create: { day: 0, activityId: act.id } },
      },
    });

    // Verify the data was created
    const checkPlan = await prisma.lessonPlan.findFirst({
      where: { id: lessonPlan.id },
      include: { schedule: { include: { activity: true } } },
    });
    console.log('Created lesson plan:', checkPlan);

    // Check if the service can see the data
    const servicePrisma = (await import('../src/prisma')).prisma;
    const servicePlan = await servicePrisma.lessonPlan.findFirst({
      where: { weekStart: new Date('2024-01-01') },
      include: { schedule: { include: { activity: true } } },
    });
    console.log('Service sees plan:', servicePlan);

    const list = await generateMaterialList('2024-01-01');
    console.log('Generated material list:', list);
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
