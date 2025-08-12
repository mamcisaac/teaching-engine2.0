import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingSpecialistLessons() {
  console.log('📚 Adding missing PE and Music lessons...\n');

  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) {
    console.error('❌ Emily not found');
    return;
  }

  // Add 3 PE lessons
  console.log('Adding 3 PE lessons...');
  const peUnit = await prisma.unitPlan.findFirst({
    where: {
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
        date: new Date('2025-11-13T14:00:00'),
        description: 'Fun indoor activities mimicking winter sports'
      },
      {
        title: 'Dance and Movement',
        date: new Date('2025-11-27T14:00:00'),
        description: 'Creative movement and dance activities'
      },
      {
        title: 'Holiday Fitness Fun',
        date: new Date('2025-12-11T14:00:00'),
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

  // Add 2 Music lessons
  console.log('\nAdding 2 Music lessons...');
  const musicUnit = await prisma.unitPlan.findFirst({
    where: {
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
        date: new Date('2025-12-04T11:00:00'),
        description: 'Rehearsing songs for winter concert'
      },
      {
        title: 'Holiday Songs Around the World',
        date: new Date('2025-12-16T11:00:00'),
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

  // Final verification
  console.log('\n📊 VERIFYING FINAL DISTRIBUTION...\n');
  
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
    'Français langue première': 63,
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
    console.log('\n🎉🎉🎉 ABSOLUTE PERFECTION ACHIEVED! 🎉🎉🎉');
    console.log('✨ Your Teaching Engine 2.0 is now PERFECT! ✨');
    console.log('🏆 197 lessons with perfect distribution! 🏆');
  } else {
    console.log(`\n⚠️ Still needs adjustment (${197 - total} lessons)`);
  }
}

addMissingSpecialistLessons()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });