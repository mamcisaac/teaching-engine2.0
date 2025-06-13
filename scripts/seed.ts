import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: 'password123',
      role: 'TEACHER',
      name: 'Teacher',
    },
  });

  const subject = await prisma.subject.create({
    data: { name: 'Math', userId: teacher.id },
  });

  const milestone = await prisma.milestone.create({
    data: {
      title: 'M1',
      subjectId: subject.id,
      // ensure planner tests have at least one future-dated milestone
      targetDate: new Date('2025-09-01'),
    },
  });

  await prisma.activity.createMany({
    data: ['A1', 'A2', 'A3'].map((title, i) => ({
      title,
      milestoneId: milestone.id,
      durationMins: 30,
      orderIndex: i,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
