import { PrismaClient } from '@teaching-engine/database';
import bcrypt from 'bcryptjs';

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
  await prisma.parentMessageOutcome.deleteMany();
  await prisma.parentMessageActivity.deleteMany();
  await prisma.mediaResourceOutcome.deleteMany();
  await prisma.mediaResourceActivity.deleteMany();
  await prisma.assessmentResult.deleteMany();
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
  await prisma.parentMessage.deleteMany();
  await prisma.mediaResource.deleteMany();
  await prisma.assessmentTemplate.deleteMany();
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
  await prisma.milestoneDefinition.deleteMany();
  await prisma.outcome.deleteMany();

  // Create a default user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const defaultUser = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'teacher@example.com',
      name: 'Test Teacher',
      password: hashedPassword,
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

  // Create a comprehensive lesson plan for the current week (if it doesn't exist)
  const existingPlan = await prisma.lessonPlan.findUnique({
    where: { weekStart: mondayThisWeek },
  });

  if (!existingPlan) {
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
              .map(({ day, title }) => ({
                day,
                activity: { connect: { id: activityIds[title] } },
              })),
          ],
        },
      },
    });
  }

  // Create curriculum outcomes
  const outcomes = await Promise.all([
    // French Grade 1 Communication orale
    prisma.outcome.create({
      data: {
        code: '1CO.1',
        description: 'Distinguer les sons dans la chaîne parlée',
        domain: 'Communication orale',
        subject: 'FRA',
        grade: 1,
      },
    }),
    prisma.outcome.create({
      data: {
        code: '1CO.2',
        description: 'Suivre des consignes simples',
        domain: 'Communication orale',
        subject: 'FRA',
        grade: 1,
      },
    }),
    prisma.outcome.create({
      data: {
        code: '1CO.3',
        description: 'Exprimer ses besoins et ses sentiments',
        domain: 'Communication orale',
        subject: 'FRA',
        grade: 1,
      },
    }),
    // French Grade 1 Lecture
    prisma.outcome.create({
      data: {
        code: '1LE.1',
        description: "Reconnaître les lettres de l'alphabet",
        domain: 'Lecture',
        subject: 'FRA',
        grade: 1,
      },
    }),
    prisma.outcome.create({
      data: {
        code: '1LE.2',
        description: 'Associer des sons aux lettres',
        domain: 'Lecture',
        subject: 'FRA',
        grade: 1,
      },
    }),
    // French Grade 1 Écriture
    prisma.outcome.create({
      data: {
        code: '1EC.1',
        description: 'Tracer les lettres en respectant leur forme',
        domain: 'Écriture',
        subject: 'FRA',
        grade: 1,
      },
    }),
    prisma.outcome.create({
      data: {
        code: '1EC.2',
        description: 'Écrire des mots simples',
        domain: 'Écriture',
        subject: 'FRA',
        grade: 1,
      },
    }),
  ]);

  // Create milestone definitions for curriculum tracking
  const currentSchoolYear = new Date().getFullYear();

  await Promise.all([
    // Communication orale outcomes - should be introduced early and practiced regularly
    prisma.milestoneDefinition.create({
      data: {
        outcomeId: outcomes[0].id, // 1CO.1
        dueDate: new Date(currentSchoolYear, 9, 15), // October 15
        minCoverageCount: 3,
        minAssessmentRequired: true,
        description: 'Sound discrimination should be introduced early in oral language',
        priority: 'high',
      },
    }),
    prisma.milestoneDefinition.create({
      data: {
        outcomeId: outcomes[1].id, // 1CO.2
        dueDate: new Date(currentSchoolYear, 8, 30), // September 30
        minCoverageCount: 5,
        minAssessmentRequired: false,
        description: 'Following simple instructions is fundamental',
        priority: 'high',
      },
    }),
    prisma.milestoneDefinition.create({
      data: {
        outcomeId: outcomes[2].id, // 1CO.3
        dueDate: new Date(currentSchoolYear, 10, 1), // November 1
        minCoverageCount: 2,
        minAssessmentRequired: true,
        description: 'Expression of needs and feelings for social-emotional learning',
        priority: 'medium',
      },
    }),

    // Lecture outcomes - reading foundation skills
    prisma.milestoneDefinition.create({
      data: {
        outcomeId: outcomes[3].id, // 1LE.1
        dueDate: new Date(currentSchoolYear, 9, 30), // October 30
        minCoverageCount: 4,
        minAssessmentRequired: true,
        description: 'Letter recognition is critical for reading development',
        priority: 'high',
      },
    }),
    prisma.milestoneDefinition.create({
      data: {
        outcomeId: outcomes[4].id, // 1LE.2
        dueDate: new Date(currentSchoolYear, 10, 31), // November 30
        minCoverageCount: 3,
        minAssessmentRequired: true,
        description: 'Sound-letter association builds phonetic awareness',
        priority: 'high',
      },
    }),

    // Écriture outcomes - writing skills
    prisma.milestoneDefinition.create({
      data: {
        outcomeId: outcomes[5].id, // 1EC.1
        dueDate: new Date(currentSchoolYear, 10, 15), // November 15
        minCoverageCount: 2,
        minAssessmentRequired: false,
        description: 'Letter formation practice throughout the term',
        priority: 'medium',
      },
    }),
    prisma.milestoneDefinition.create({
      data: {
        outcomeId: outcomes[6].id, // 1EC.2
        dueDate: new Date(currentSchoolYear, 11, 31), // December 31
        minCoverageCount: 2,
        minAssessmentRequired: true,
        description: 'Simple word writing by end of first term',
        priority: 'medium',
      },
    }),

    // Domain-level milestone definitions
    prisma.milestoneDefinition.create({
      data: {
        domain: 'Communication orale',
        dueDate: new Date(currentSchoolYear + 1, 1, 31), // February 28
        minCoverageCount: 12,
        minAssessmentRequired: true,
        description: 'Minimum oral language activities expected by mid-year',
        priority: 'medium',
      },
    }),
    prisma.milestoneDefinition.create({
      data: {
        domain: 'Lecture',
        dueDate: new Date(currentSchoolYear + 1, 2, 28), // March 31
        minCoverageCount: 8,
        minAssessmentRequired: true,
        description: 'Reading activities should be well-established by spring',
        priority: 'high',
      },
    }),
  ]);

  console.log(
    '✅ Seed complete: subjects, milestones, activities, outcomes, milestone definitions, and one plan seeded',
  );
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
