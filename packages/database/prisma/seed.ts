import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.weeklySchedule.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();

  const now = new Date();
  const mondayThisWeek = new Date(now);
  mondayThisWeek.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1); // Ensure Monday
  mondayThisWeek.setUTCHours(0, 0, 0, 0);

  const [math, science, health] = await Promise.all([
    prisma.subject.create({ data: { name: 'Math' } }),
    prisma.subject.create({ data: { name: 'Science' } }),
    prisma.subject.create({ data: { name: 'Health' } }),
  ]);

  await prisma.milestone.create({
    data: {
      title: 'Addition and Subtraction',
      subjectId: math.id,
      activities: {
        create: [
          { title: '1 + 1', completedAt: null },
          { title: '2 + 3', completedAt: new Date('2025-02-01') },
        ],
      },
    },
  });

  await prisma.milestone.create({
    data: {
      title: 'Living Things',
      subjectId: science.id,
      activities: {
        create: [
          { title: 'Plant Parts', completedAt: null },
          { title: 'Animal Habitats', completedAt: null },
        ],
      },
    },
  });

  await prisma.milestone.create({
    data: {
      title: 'Wellness',
      subjectId: health.id,
      activities: {
        create: [
          { title: 'Healthy Bodies', completedAt: null },
          { title: 'Healthy Minds', completedAt: new Date('2025-05-10') },
        ],
      },
    },
  });

  // Optional: seed one completed lesson plan
  await prisma.lessonPlan.create({
    data: {
      weekStart: mondayThisWeek,
      schedule: {
        create: [
          {
            dayOfWeek: 0,
            activity: { connect: { title: '1 + 1' } },
          },
          {
            dayOfWeek: 1,
            activity: { connect: { title: 'Plant Parts' } },
          },
        ],
      },
    },
  });

  console.log('✅ Seed complete: subjects, milestones, activities, and one plan seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
