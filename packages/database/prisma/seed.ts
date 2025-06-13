import { PrismaClient } from '@teaching-engine/database';

// Initialize Prisma client
const prisma = new PrismaClient();

// Type for timetable slots creation promises
type TimetableSlotPromise = ReturnType<typeof prisma.timetableSlot.create>;

async function main() {
  console.log('Seeding database...');

  // Clear existing data (delete in child-to-parent order to satisfy FK constraints)
  // Delete from join/child tables first
  await prisma.milestoneOutcome.deleteMany();
  await prisma.activityOutcome.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.materialList.deleteMany();
  await prisma.note.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.dailyPlanItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.weeklySchedule.deleteMany();
  await prisma.lessonPlan.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.parentContact.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.unavailableBlock.deleteMany();
  await prisma.reportDeadline.deleteMany();
  await prisma.yearPlanEntry.deleteMany();
  await prisma.shareLink.deleteMany();
  await prisma.equipmentBooking.deleteMany();
  await prisma.substituteInfo.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.outcome.deleteMany();

  // Create a default user
  const defaultUser = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Test Teacher',
      password: 'password123', // In a real app, this should be hashed
      role: 'TEACHER',
    },
  });

  console.log('Created default user:', defaultUser.email);

  const now = new Date();
  const mondayThisWeek = new Date(now);
  mondayThisWeek.setUTCDate(now.getUTCDate() - now.getUTCDay() + 1); // Ensure Monday
  mondayThisWeek.setUTCHours(0, 0, 0, 0);

  // Create subjects
  const [math, science, health, language, socialStudies] = await Promise.all([
    prisma.subject.create({ data: { name: 'Math' } }),
    prisma.subject.create({ data: { name: 'Science' } }),
    prisma.subject.create({ data: { name: 'Health' } }),
    prisma.subject.create({ data: { name: 'Language Arts' } }),
    prisma.subject.create({ data: { name: 'Social Studies' } }),
  ]);

  // Create timetable slots for the week
  const days = [0, 1, 2, 3, 4]; // Monday to Friday
  const timetableSlots: TimetableSlotPromise[] = [];

  for (const day of days) {
    // Helper function to convert time string to minutes since midnight
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Morning slots
    timetableSlots.push(
      prisma.timetableSlot.create({
        data: {
          day,
          startMin: timeToMinutes('09:00'),
          endMin: timeToMinutes('10:00'),
          subjectId: math.id,
        },
      }),
    );

    timetableSlots.push(
      prisma.timetableSlot.create({
        data: {
          day,
          startMin: timeToMinutes('10:00'),
          endMin: timeToMinutes('11:00'),
          subjectId: language.id,
        },
      }),
    );

    // Afternoon slots
    timetableSlots.push(
      prisma.timetableSlot.create({
        data: {
          day,
          startMin: timeToMinutes('12:30'),
          endMin: timeToMinutes('13:30'),
          subjectId: science.id,
        },
      }),
    );

    if (day % 2 === 0) {
      // Alternate between health and social studies
      timetableSlots.push(
        prisma.timetableSlot.create({
          data: {
            day,
            startMin: timeToMinutes('13:30'),
            endMin: timeToMinutes('14:30'),
            subjectId: health.id,
          },
        }),
      );
    } else {
      timetableSlots.push(
        prisma.timetableSlot.create({
          data: {
            day,
            startMin: timeToMinutes('13:30'),
            endMin: timeToMinutes('14:30'),
            subjectId: socialStudies.id,
          },
        }),
      );
    }
  }

  await Promise.all(timetableSlots);

  // Short milestone titles for E2E tests
  await prisma.milestone.create({
    data: {
      title: 'M1',
      subjectId: math.id,
      activities: { create: { title: 'Activity 1' } },
    },
  });

  await prisma.milestone.create({
    data: {
      title: 'M',
      subjectId: math.id,
      activities: { create: { title: 'Activity M' } },
    },
  });

  await prisma.milestone.create({
    data: {
      title: 'M2',
      subjectId: science.id,
      activities: { create: { title: 'Activity 2' } },
    },
  });

  // Create Math milestones and activities
  const additionMilestone = await prisma.milestone.create({
    data: {
      title: 'Addition and Subtraction',
      subjectId: math.id,
      activities: {
        create: [
          { title: '1 + 1', completedAt: null },
          { title: '2 + 3', completedAt: new Date('2025-02-01') },
          { title: 'Subtraction Basics', completedAt: null },
          { title: 'Number Patterns', completedAt: null },
          { title: 'Math Games', completedAt: null },
        ],
      },
    },
    include: { activities: true },
  });

  const activityIds: Record<string, number> = {};
  additionMilestone.activities.forEach((a) => {
    activityIds[a.title] = a.id;
  });

  // Create Science milestones and activities
  const livingMilestone = await prisma.milestone.create({
    data: {
      title: 'Living Things',
      subjectId: science.id,
      activities: {
        create: [
          { title: 'Plant Parts', completedAt: null },
          { title: 'Animal Habitats', completedAt: null },
          { title: 'Life Cycles', completedAt: null },
          { title: 'Ecosystems', completedAt: null },
          { title: 'Science Experiment', completedAt: null },
        ],
      },
    },
    include: { activities: true },
  });

  livingMilestone.activities.forEach((a) => {
    activityIds[a.title] = a.id;
  });

  // Create Health milestones and activities
  const wellnessMilestone = await prisma.milestone.create({
    data: {
      title: 'Wellness',
      subjectId: health.id,
      activities: {
        create: [
          { title: 'Healthy Bodies', completedAt: null },
          { title: 'Healthy Minds', completedAt: new Date('2025-05-10') },
          { title: 'Nutrition', completedAt: null },
          { title: 'Exercise', completedAt: null },
          { title: 'Mindfulness', completedAt: null },
        ],
      },
    },
    include: { activities: true },
  });

  // Create Language Arts milestones and activities
  await prisma.milestone.create({
    data: {
      title: 'Reading and Writing',
      subjectId: language.id,
      activities: {
        create: [
          { title: 'Reading Short Stories', completedAt: null },
          { title: 'Creative Writing', completedAt: null },
          { title: 'Spelling Practice', completedAt: null },
          { title: 'Reading Comprehension', completedAt: null },
          { title: 'Show and Tell', completedAt: null },
        ],
      },
    },
    include: { activities: true },
  });

  // Create Social Studies milestones and activities
  await prisma.milestone.create({
    data: {
      title: 'Community and Culture',
      subjectId: socialStudies.id,
      activities: {
        create: [
          { title: 'Community Helpers', completedAt: null },
          { title: 'Cultural Celebrations', completedAt: null },
          { title: 'Map Skills', completedAt: null },
          { title: 'Historical Figures', completedAt: null },
          { title: 'Current Events', completedAt: null },
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
    // Hardcoded fallback activities
    const fallbackData = [
      { subject: 'Math', title: 'Math Worksheet', publicNote: 'Practice basic arithmetic' },
      { subject: 'Science', title: 'Science Experiment', publicNote: 'Simple hands-on activity' },
      {
        subject: 'Health',
        title: 'Health Discussion',
        publicNote: 'Class discussion on health topics',
      },
      { subject: 'Language Arts', title: 'Free Reading', publicNote: 'Independent reading time' },
      {
        subject: 'Social Studies',
        title: 'Current Events',
        publicNote: 'Discussion of current events',
      },
    ];

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

  // Create a comprehensive lesson plan for the current week
  await prisma.lessonPlan.create({
    data: {
      weekStart: mondayThisWeek,
      schedule: {
        create: [
          // Only connect activities that exist
          ...[
            { day: 0, title: '1 + 1' },
            { day: 0, title: 'Reading Short Stories' },
            { day: 0, title: 'Plant Parts' },
            { day: 1, title: '2 + 3' },
            { day: 1, title: 'Creative Writing' },
            { day: 1, title: 'Animal Habitats' },
            { day: 2, title: 'Subtraction Basics' },
            { day: 2, title: 'Spelling Practice' },
            { day: 2, title: 'Healthy Bodies' },
            { day: 3, title: 'Number Patterns' },
            { day: 3, title: 'Reading Comprehension' },
            { day: 3, title: 'Community Helpers' },
            { day: 4, title: 'Math Games' },
            { day: 4, title: 'Show and Tell' },
            { day: 4, title: 'Healthy Minds' },
          ]
            .filter(({ title }) => activityIds[title] !== undefined)
            .map(({ day, title }) => ({ day, activity: { connect: { id: activityIds[title] } } })),
        ],
      },
    },
  });

  console.log('✅ Seed complete: subjects, milestones, activities, and one plan seeded');
}

// Use a self-executing async function to handle top-level await
(async () => {
  try {
    await main();
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
