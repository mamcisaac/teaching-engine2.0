import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function achievePerfection() {
  console.log('🎯 ACHIEVING PERFECT LESSON DISTRIBUTION...\n');

  // Step 1: Fix duplicate Arts category
  console.log('Step 1: Converting "Arts" to "Arts visuels"...');
  const artsUpdate = await prisma.eTFOLessonPlan.updateMany({
    where: { subject: 'Arts' },
    data: { subject: 'Arts visuels' }
  });
  console.log(`✅ Converted ${artsUpdate.count} lessons from "Arts" to "Arts visuels"\n`);

  // Step 2: Remove excess Science lessons
  console.log('Step 2: Removing 7 excess Science lessons from September...');
  const scienceLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      subject: 'Sciences de la nature',
      date: {
        gte: new Date('2025-09-01'),
        lt: new Date('2025-10-01')
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: 7
  });

  const scienceIdsToRemove = scienceLessons.map(l => l.id);
  await prisma.eTFOLessonPlan.deleteMany({
    where: {
      id: { in: scienceIdsToRemove }
    }
  });
  console.log(`✅ Removed ${scienceIdsToRemove.length} Science lessons\n`);

  // Step 3: Add one more Arts visuels lesson
  console.log('Step 3: Adding 1 more Arts visuels lesson...');
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (emily) {
    const artsUnit = await prisma.unitPlan.findFirst({
      where: {
        title: 'Winter Celebrations Through Art',
        longRangePlan: {
          subject: 'Arts visuels',
          userId: emily.id
        }
      }
    });

    if (artsUnit) {
      await prisma.eTFOLessonPlan.create({
        data: {
          title: 'Winter Wonderland Collage',
          date: new Date('2025-12-17T13:30:00'),
          duration: 45,
          subject: 'Arts visuels',
          mindsOn: 'Explore winter textures and colors. What makes winter art special?',
          action: 'Create mixed media winter collage using various materials and techniques.',
          consolidation: 'Gallery walk to appreciate winter art creations.',
          materials: ['Paper', 'Cotton', 'Glitter', 'Paint', 'Scissors', 'Glue'],
          accommodations: ['Visual supports', 'Partner work', 'Extended time'],
          differentiationStrategies: ['Choice of materials', 'Varied complexity'],
          assessmentType: 'Formative',
          assessmentNotes: 'Observation of creative choices and technique',
          unitPlanId: artsUnit.id,
          userId: emily.id
        }
      });
      console.log('✅ Added Winter Wonderland Collage lesson\n');
    }
  }

  // Step 4: Add 3 PE lessons
  console.log('Step 4: Adding 3 PE lessons...');
  if (emily) {
    const peUnit = await prisma.unitPlan.findFirst({
      where: {
        title: 'Winter Activities and Games',
        longRangePlan: {
          subject: 'Éducation physique',
          userId: emily.id
        }
      }
    });

    if (peUnit) {
      const peLessons = [
        {
          title: 'Indoor Winter Olympics',
          date: new Date('2025-11-12T14:00:00'),
          description: 'Fun indoor activities mimicking winter sports'
        },
        {
          title: 'Dance and Movement',
          date: new Date('2025-11-26T14:00:00'),
          description: 'Creative movement and dance activities'
        },
        {
          title: 'Holiday Fitness Fun',
          date: new Date('2025-12-10T14:00:00'),
          description: 'Festive physical activities and games'
        }
      ];

      for (const lesson of peLessons) {
        await prisma.eTFOLessonPlan.create({
          data: {
            title: lesson.title,
            date: lesson.date,
            duration: 30,
            subject: 'Éducation physique',
            mindsOn: 'Warm-up stretches and movement preparation',
            action: lesson.description,
            consolidation: 'Cool down and reflection on activities',
            materials: ['Gym equipment', 'Music', 'Cones', 'Bean bags'],
            accommodations: ['Modified activities', 'Partner support'],
            differentiationStrategies: ['Varied difficulty levels', 'Choice of activities'],
            assessmentType: 'Formative',
            assessmentNotes: 'Participation and effort observation',
            unitPlanId: peUnit.id,
            userId: emily.id
          }
        });
        console.log(`✅ Added PE lesson: ${lesson.title}`);
      }
    }
  }

  // Step 5: Add 2 Music lessons
  console.log('\nStep 5: Adding 2 Music lessons...');
  if (emily) {
    const musicUnit = await prisma.unitPlan.findFirst({
      where: {
        title: 'Holiday Songs and Celebrations',
        longRangePlan: {
          subject: 'Music',
          userId: emily.id
        }
      }
    });

    if (musicUnit) {
      const musicLessons = [
        {
          title: 'Winter Concert Practice',
          date: new Date('2025-12-05T11:00:00'),
          description: 'Rehearsing songs for winter concert'
        },
        {
          title: 'Holiday Songs Around the World',
          date: new Date('2025-12-12T11:00:00'),
          description: 'Learning holiday songs from different cultures'
        }
      ];

      for (const lesson of musicLessons) {
        await prisma.eTFOLessonPlan.create({
          data: {
            title: lesson.title,
            date: lesson.date,
            duration: 30,
            subject: 'Music',
            mindsOn: 'Vocal warm-ups and rhythm exercises',
            action: lesson.description,
            consolidation: 'Performance practice and sharing',
            materials: ['Song sheets', 'Instruments', 'Audio player'],
            accommodations: ['Visual cues', 'Simplified parts'],
            differentiationStrategies: ['Different roles', 'Varied complexity'],
            assessmentType: 'Formative',
            assessmentNotes: 'Participation and musical development',
            unitPlanId: musicUnit.id,
            userId: emily.id
          }
        });
        console.log(`✅ Added Music lesson: ${lesson.title}`);
      }
    }
  }

  // Final verification
  console.log('\n📊 VERIFYING PERFECT DISTRIBUTION...\n');
  
  const finalCount = await prisma.eTFOLessonPlan.groupBy({
    by: ['subject'],
    _count: true,
    orderBy: {
      _count: {
        subject: 'desc'
      }
    }
  });

  const target = {
    'Français (Immersion)': 63,
    'Mathématiques': 58,
    'Sciences de la nature': 30,
    'Arts visuels': 22,
    'Éducation physique': 12,
    'Music': 12
  };

  let total = 0;
  let perfect = true;

  console.log('FINAL DISTRIBUTION:');
  console.log('===================');
  finalCount.forEach(s => {
    const count = s._count;
    total += count;
    const targetCount = target[s.subject as keyof typeof target];
    const status = targetCount === count ? '✅' : '❌';
    console.log(`${s.subject}: ${count} lessons (target: ${targetCount}) ${status}`);
    if (targetCount !== count) perfect = false;
  });

  console.log(`\nTOTAL: ${total} lessons (target: 197)`);
  
  if (total === 197 && perfect) {
    console.log('\n🎉 PERFECTION ACHIEVED! 🎉');
    console.log('✨ Your Teaching Engine 2.0 is now PERFECT! ✨');
  } else {
    console.log('\n⚠️ Still needs adjustment');
  }
}

achievePerfection()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });