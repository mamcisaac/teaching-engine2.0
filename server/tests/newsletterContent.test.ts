import prisma from '../src/prisma';
import { collectContent } from '../src/services/newsletterGenerator';

beforeAll(async () => {
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

test('collects recent activity summaries', async () => {
  const subj = await prisma.subject.create({ data: { name: 'Math' } });
  const ms = await prisma.milestone.create({ data: { title: 'Unit', subjectId: subj.id } });
  await prisma.activity.create({ data: { title: 'Worksheet', milestoneId: ms.id, completedAt: new Date() } });
  const text = await collectContent();
  expect(text).toContain('Math: Worksheet');
});
