import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: 'password123',
      name: 'Teacher',
    },
  });

  const subject = await prisma.subject.create({
    data: { name: 'Math', userId: user.id },
  });

  await prisma.milestone.create({
    data: {
      title: 'M1',
      subjectId: subject.id,
      userId: user.id,
      activities: {
        create: [
          { title: 'A1', userId: user.id },
          { title: 'A2', userId: user.id },
          { title: 'A3', userId: user.id },
        ],
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
