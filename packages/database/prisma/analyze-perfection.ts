import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzePerfection() {
  const bySubject = await prisma.eTFOLessonPlan.groupBy({
    by: ['subject'],
    _count: true,
    orderBy: {
      _count: {
        subject: 'desc'
      }
    }
  });

  console.log('CURRENT DISTRIBUTION:');
  console.log('=====================');
  let total = 0;
  bySubject.forEach(s => {
    console.log(`${s.subject}: ${s._count} lessons`);
    total += s._count;
  });
  console.log(`\nTOTAL: ${total} lessons\n`);

  console.log('TARGET DISTRIBUTION (from ABSOLUTE_PERFECTION):');
  console.log('================================================');
  console.log('Français langue première: 63 lessons (32%)');
  console.log('Mathématiques: 58 lessons (29%)');
  console.log('Sciences de la nature: 30 lessons (15%)');
  console.log('Arts visuels: 22 lessons (11%)');
  console.log('Éducation physique: 12 lessons (6%)');
  console.log('Music: 12 lessons (6%)');
  console.log('TOTAL: 197 lessons\n');

  console.log('REQUIRED ADJUSTMENTS:');
  console.log('=====================');
  const current: Record<string, number> = {
    'Français langue première': 0,
    'Mathématiques': 0,
    'Sciences de la nature': 0,
    'Arts visuels': 0,
    'Éducation physique': 0,
    'Music': 0,
    'Arts': 0
  };
  
  bySubject.forEach(s => {
    if (s.subject) current[s.subject] = s._count;
  });

  const target = {
    'Français langue première': 63,
    'Mathématiques': 58,
    'Sciences de la nature': 30,
    'Arts visuels': 22,
    'Éducation physique': 12,
    'Music': 12
  };

  Object.entries(target).forEach(([subject, targetCount]) => {
    const diff = current[subject] - targetCount;
    if (diff !== 0) {
      console.log(`${subject}: ${diff > 0 ? 'Remove' : 'Add'} ${Math.abs(diff)} lessons`);
    } else {
      console.log(`${subject}: ✅ Perfect`);
    }
  });

  if (current['Arts'] > 0) {
    console.log(`\n⚠️ Arts: Remove all ${current['Arts']} lessons (duplicate category)`);
  }

  // Month-by-month distribution
  console.log('\nMONTH-BY-MONTH DISTRIBUTION:');
  console.log('=============================');
  
  const months = [
    { name: 'September', start: '2025-09-01', end: '2025-10-01' },
    { name: 'October', start: '2025-10-01', end: '2025-11-01' },
    { name: 'November', start: '2025-11-01', end: '2025-12-01' },
    { name: 'December', start: '2025-12-01', end: '2026-01-01' }
  ];

  for (const month of months) {
    const count = await prisma.eTFOLessonPlan.count({
      where: {
        date: {
          gte: new Date(month.start),
          lt: new Date(month.end)
        }
      }
    });
    console.log(`${month.name}: ${count} lessons`);
  }
}

analyzePerfection()
  .then(() => prisma.$disconnect())
  .catch(console.error);