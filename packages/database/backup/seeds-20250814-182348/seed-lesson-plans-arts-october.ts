import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOctoberArtsLessons() {
  console.log('🎨 Seeding October Arts lessons...');

  // Get Emily's account
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) {
    console.error('❌ Emily not found');
    return;
  }

  // Get the Arts unit plan for October (Colors and Feelings)
  const artsUnit = await prisma.unitPlan.findFirst({
    where: {
      title: 'Colors and Feelings',
      longRangePlan: {
        subject: 'Arts visuels',
        userId: emily.id
      }
    },
    include: {
      longRangePlan: true
    }
  });

  if (!artsUnit) {
    console.error('❌ October Arts unit plan not found');
    return;
  }

  // October Arts lessons - aligned with fall themes and harvest
  const octoberArtsLessons = [
    // Week 1
    {
      date: new Date('2025-10-02T13:30:00'),
      dayNumber: 21,
      title: 'Fall Leaf Printing',
      description: 'Creating art with autumn leaves using printing techniques',
      subject: 'Arts visuels',
      expectations: ['A1.1', 'A1.2'],
      materials: ['Fresh fall leaves', 'Paint', 'Paper', 'Rollers', 'Aprons'],
      activities: {
        mindsOn: 'Explore texture and patterns in collected leaves. How can we capture their beauty?',
        action: 'Create leaf prints using paint and pressure techniques. Layer colors for effect.',
        consolidation: 'Gallery walk to appreciate different printing techniques and color choices.'
      }
    },

    // Week 2
    {
      date: new Date('2025-10-08T10:00:00'),
      dayNumber: 25,
      title: 'Harvest Collage',
      description: 'Mixed media collage celebrating fall harvest',
      subject: 'Arts visuels',
      expectations: ['A1.3', 'A2.1'],
      materials: ['Magazines', 'Fabric scraps', 'Seeds', 'Glue', 'Construction paper', 'Natural materials'],
      activities: {
        mindsOn: 'Look at examples of collage art. Discuss texture and composition.',
        action: 'Create harvest-themed collage using variety of materials and textures.',
        consolidation: 'Share collages and describe choice of materials and arrangement.'
      }
    },

    // Week 3 (Short week - Thanksgiving)
    {
      date: new Date('2025-10-16T10:00:00'),
      dayNumber: 30,
      title: 'Thanksgiving Gratitude Art',
      description: 'Creating art that expresses gratitude',
      subject: 'Arts visuels',
      expectations: ['A2.2', 'A2.3'],
      materials: ['Watercolors', 'Salt', 'Crayons', 'Paper', 'Brushes'],
      activities: {
        mindsOn: 'Discuss things we are grateful for. How can colors show feelings?',
        action: 'Create watercolor resist paintings showing gratitude. Add salt for texture.',
        consolidation: 'Share gratitude art and explain color and image choices.'
      }
    },

    // Week 4
    {
      date: new Date('2025-10-22T13:30:00'),
      dayNumber: 34,
      title: 'Pumpkin Decorating',
      description: 'Creative pumpkin art without carving',
      subject: 'Arts visuels',
      expectations: ['A3.1', 'A3.2'],
      materials: ['Mini pumpkins', 'Paint', 'Markers', 'Glue', 'Decorative materials', 'Googly eyes'],
      activities: {
        mindsOn: 'Explore different ways to decorate pumpkins. What characters could we create?',
        action: 'Transform pumpkins into characters or designs using various materials.',
        consolidation: 'Pumpkin parade - display and describe our pumpkin creations.'
      }
    },

    // Week 5
    {
      date: new Date('2025-10-29T10:00:00'),
      dayNumber: 39,
      title: 'Halloween Shadow Art',
      description: 'Creating spooky silhouettes and shadow art',
      subject: 'Arts visuels',
      expectations: ['A3.3', 'A4.1'],
      materials: ['Black paper', 'Scissors', 'Flashlights', 'White paper', 'Chalk pastels'],
      activities: {
        mindsOn: 'Explore shadows with flashlights. How do shadows change with distance?',
        action: 'Create Halloween silhouettes and layer for shadow box effect.',
        consolidation: 'Shadow puppet show with our creations.'
      }
    },
    {
      date: new Date('2025-10-30T13:30:00'),
      dayNumber: 40,
      title: 'Costume Design Studio',
      description: 'Designing and creating costume elements',
      subject: 'Arts visuels',
      expectations: ['A4.2', 'A4.3'],
      materials: ['Paper bags', 'Fabric scraps', 'Markers', 'Stickers', 'Pipe cleaners', 'Tape'],
      activities: {
        mindsOn: 'Look at different costume styles. What makes a good costume?',
        action: 'Design and create masks or costume accessories for Halloween.',
        consolidation: 'Costume fashion show - model our creations.'
      }
    }
  ];

  try {
    for (const lesson of octoberArtsLessons) {
      const lessonData = {
        title: lesson.title,
        date: lesson.date,
        subject: lesson.subject,
        materials: lesson.materials,
        mindsOn: lesson.activities.mindsOn,
        action: lesson.activities.action,
        consolidation: lesson.activities.consolidation,
        differentiationStrategies: [
          'Choice in artistic medium',
          'Varied complexity of techniques',
          'Partner support available',
          'Alternative tools for fine motor challenges'
        ],
        accommodations: [
          'Adapted art tools as needed',
          'Step-by-step visual instructions',
          'Extended time for creation',
          'Choice in presentation format'
        ],
        assessmentType: 'Formative',
        assessmentNotes: 'Observation of creative process and artistic choices',
        duration: 45,
        unitPlanId: artsUnit.id,
        userId: emily.id
      };

      await prisma.eTFOLessonPlan.create({ data: lessonData });
      console.log(`✅ Created Arts lesson: ${lesson.title}`);
    }

    console.log('✅ October Arts lessons seeded successfully!');
  } catch (error) {
    console.error('Error seeding October Arts lessons:', error);
  }
}

seedOctoberArtsLessons()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });