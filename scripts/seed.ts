import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();

  const subject1 = await prisma.subject.create({
    data: { name: 'Math' },
  });
  const subject2 = await prisma.subject.create({
    data: { name: 'Science' },
  });

  await prisma.milestone.create({
    data: {
      title: 'Milestone 1',
      subjectId: subject1.id,
      activities: {
        create: {
          title: 'Activity 1',
        },
      },
    },
  });

  await prisma.milestone.create({
    data: {
      title: 'Milestone 2',
      subjectId: subject2.id,
      activities: {
        create: {
          title: 'Activity 2',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
