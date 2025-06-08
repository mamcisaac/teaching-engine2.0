import prisma from '../src/prisma';
import { generateMaterialList } from '../src/services/materialGenerator';

beforeAll(async () => {
  await prisma.materialList.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
});

afterAll(async () => {
  await prisma.materialList.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.$disconnect();
});

test('extracts materials from activity notes', async () => {
  const subject = await prisma.subject.create({ data: { name: 'Sci' } });
  const milestone = await prisma.milestone.create({ data: { title: 'M', subjectId: subject.id } });
  const activity = await prisma.activity.create({ data: { title: 'A', milestoneId: milestone.id, publicNote: 'Lab\nMaterials: beaker, water' } });
  const plan = await prisma.lessonPlan.create({
    data: {
      weekStart: new Date('2024-01-01'),
      schedule: { create: { day: 0, activityId: activity.id } },
    },
  });

  const items = await generateMaterialList(plan.weekStart);
  expect(items).toContain('beaker');
  expect(items).toContain('water');
});
