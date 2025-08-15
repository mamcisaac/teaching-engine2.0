import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOctoberScienceLessons() {
  console.log('🔬 Seeding October Science lessons...');

  // Get Emily's account
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) {
    console.error('❌ Emily not found');
    return;
  }

  // Get the Science unit plan for October (Fall Changes)
  const scienceUnit = await prisma.unitPlan.findFirst({
    where: {
      title: 'Fall Changes',
      longRangePlan: {
        subject: 'Sciences de la nature',
        userId: emily.id
      }
    },
    include: {
      longRangePlan: true
    }
  });

  if (!scienceUnit) {
    console.error('❌ October Science unit plan not found');
    return;
  }

  // October Science lessons - aligned with fall observations
  const octoberScienceLessons = [
    // Week 1 (Oct 1-3)
    {
      date: new Date('2025-10-01T09:00:00'),
      dayNumber: 20,
      title: 'Fall Leaf Investigation',
      description: 'Exploring colors and changes in fall leaves',
      subject: 'Sciences de la nature',
      expectations: ['1.1.1', '1.1.2'],
      materials: ['Fall leaves collection', 'Magnifying glasses', 'Science journals', 'Color charts'],
      activities: {
        mindsOn: 'Nature walk to collect different colored leaves. Sort by color and shape.',
        action: 'Create leaf rubbings and observe details with magnifying glasses. Record observations.',
        consolidation: 'Share findings about why leaves change color in fall.'
      }
    },
    {
      date: new Date('2025-10-03T13:00:00'),
      dayNumber: 22,
      title: 'Weather Patterns in October',
      description: 'Observing and recording fall weather changes',
      subject: 'Sciences de la nature',
      expectations: ['1.1.3', '1.2.1'],
      materials: ['Weather chart', 'Thermometer', 'Wind indicator', 'Rain gauge'],
      activities: {
        mindsOn: 'Discuss how weather feels different from September. What changes do we notice?',
        action: 'Set up weather station and record temperature, wind, precipitation.',
        consolidation: 'Create weather symbols and predict tomorrow\'s weather.'
      }
    },

    // Week 2 (Oct 6-10)
    {
      date: new Date('2025-10-07T09:00:00'),
      dayNumber: 24,
      title: 'Animals Preparing for Winter',
      description: 'How animals adapt to seasonal changes',
      subject: 'Sciences de la nature',
      expectations: ['1.2.2', '1.2.3'],
      materials: ['Animal cards', 'Migration maps', 'Videos of animals', 'Art supplies'],
      activities: {
        mindsOn: 'Mystery box with items animals collect for winter (nuts, seeds, fur).',
        action: 'Research how different animals prepare for winter. Create animal fact cards.',
        consolidation: 'Animal charades showing different winter preparations.'
      }
    },
    {
      date: new Date('2025-10-09T10:30:00'),
      dayNumber: 26,
      title: 'Pumpkin Science',
      description: 'Exploring pumpkins inside and out',
      subject: 'Sciences de la nature',
      expectations: ['1.1.4', '1.3.1'],
      materials: ['Small pumpkins', 'Measuring tools', 'Scale', 'Seeds', 'Observation sheets'],
      activities: {
        mindsOn: 'Estimate pumpkin weight, circumference, and number of seeds.',
        action: 'Cut open pumpkins, count seeds, measure, weigh. Compare estimates to actual.',
        consolidation: 'Plant pumpkin seeds and discuss life cycle.'
      }
    },

    // Week 3 (Oct 14-17) - Short week due to Thanksgiving
    {
      date: new Date('2025-10-15T09:00:00'),
      dayNumber: 29,
      title: 'Tree Changes Through Seasons',
      description: 'Observing how trees change from summer to fall',
      subject: 'Sciences de la nature',
      expectations: ['1.1.5', '1.3.2'],
      materials: ['Tree photos', 'Bark rubbing materials', 'Measuring tape', 'Field guides'],
      activities: {
        mindsOn: 'Compare photos of same tree in summer vs fall. What changed?',
        action: 'Adopt a tree in schoolyard. Measure, draw, make bark rubbing.',
        consolidation: 'Create tree journal to track changes through the year.'
      }
    },
    {
      date: new Date('2025-10-16T13:00:00'),
      dayNumber: 30,
      title: 'Fall Harvest Science',
      description: 'Exploring fruits and vegetables of fall',
      subject: 'Sciences de la nature',
      expectations: ['1.3.3', '1.3.4'],
      materials: ['Various fall produce', 'Cutting tools', 'Microscopes', 'Seed collection'],
      activities: {
        mindsOn: 'Sort fall harvest items by different attributes (color, size, texture).',
        action: 'Dissect fruits/vegetables, examine seeds, observe under microscope.',
        consolidation: 'Create seed museum with labels and information.'
      }
    },

    // Week 4 (Oct 20-24)
    {
      date: new Date('2025-10-21T09:00:00'),
      dayNumber: 33,
      title: 'Day and Night in Fall',
      description: 'Noticing shorter days and longer nights',
      subject: 'Sciences de la nature',
      expectations: ['1.4.1', '1.4.2'],
      materials: ['Flashlights', 'Globe', 'Clock', 'Shadow tracking sheets'],
      activities: {
        mindsOn: 'Why is it darker in the morning now? Discuss observations.',
        action: 'Model Earth\'s tilt and rotation. Track shadows throughout the day.',
        consolidation: 'Create picture timeline of daily activities in light vs dark.'
      }
    }
  ];

  try {
    for (const lesson of octoberScienceLessons) {
      const lessonData = {
        title: lesson.title,
        date: lesson.date,
        subject: lesson.subject,
        materials: lesson.materials,
        mindsOn: lesson.activities.mindsOn,
        action: lesson.activities.action,
        consolidation: lesson.activities.consolidation,
        differentiationStrategies: [
          'Visual supports with picture cards',
          'Hands-on exploration opportunities',
          'Partner work for support',
          'Choice in recording method'
        ],
        accommodations: [
          'Preferential seating near instruction',
          'Extended time for observations',
          'Simplified recording sheets',
          'Verbal responses option'
        ],
        assessmentType: 'Formative',
        assessmentNotes: 'Observation of scientific thinking and recording skills',
        duration: 45,
        unitPlanId: scienceUnit.id,
        userId: emily.id
      };

      await prisma.eTFOLessonPlan.create({ data: lessonData });
      console.log(`✅ Created Science lesson: ${lesson.title}`);
    }

    console.log('✅ October Science lessons seeded successfully!');
  } catch (error) {
    console.error('Error seeding October Science lessons:', error);
  }
}

seedOctoberScienceLessons()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });