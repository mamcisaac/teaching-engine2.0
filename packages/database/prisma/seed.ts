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

  // Seed a sample outcome for tests
  await prisma.outcome.create({
    data: {
      subject: 'MTH',
      grade: 1,
      code: '1MA.1',
      description: 'Demonstrate simple addition',
    },
  });

  const additionMilestone = await prisma.milestone.create({
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
    include: { activities: true },
  });

  const activityIds: Record<string, number> = {};
  additionMilestone.activities.forEach((a) => {
    activityIds[a.title] = a.id;
  });

  const livingMilestone = await prisma.milestone.create({
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
    include: { activities: true },
  });

  livingMilestone.activities.forEach((a) => {
    activityIds[a.title] = a.id;
  });

  const wellnessMilestone = await prisma.milestone.create({
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
    include: { activities: true },
  });

  wellnessMilestone.activities.forEach((a) => {
    activityIds[a.title] = a.id;
  });

  const existingFallbacks = await prisma.activity.count({ where: { isFallback: true } });
  if (existingFallbacks === 0) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const file = await fs.readFile(path.join(__dirname, 'seed', 'fallbackActivities.json'), 'utf8');
    const fallbackData: { subject: string; title: string; publicNote?: string }[] =
      JSON.parse(file);
    for (const fb of fallbackData) {
      const subject = await prisma.subject.findFirst({ where: { name: fb.subject } });
      if (!subject) continue;
      let milestone = await prisma.milestone.findFirst({
        where: { subjectId: subject.id, title: 'Fallback Activities' },
      });
      if (!milestone) {
        milestone = await prisma.milestone.create({
          data: { title: 'Fallback Activities', subjectId: subject.id },
        });
      }
      await prisma.activity.create({
        data: {
          title: fb.title,
          publicNote: fb.publicNote,
          milestoneId: milestone.id,
          isSubFriendly: true,
          isFallback: true,
        },
      });
    }
  }

  // Optional: seed one completed lesson plan
  await prisma.lessonPlan.create({
    data: {
      weekStart: mondayThisWeek,
      schedule: {
        create: [
          {
            day: 0,
            activity: { connect: { id: activityIds['1 + 1'] } },
          },
          {
            day: 1,
            activity: { connect: { id: activityIds['Plant Parts'] } },
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
