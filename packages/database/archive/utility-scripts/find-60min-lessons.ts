import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function find60MinuteLessons() {
  console.log('🔍 Searching for lessons with 60-minute duration...\n');

  // Find all lessons with 60-minute duration
  const lessons60 = await prisma.eTFOLessonPlan.findMany({
    where: {
      duration: 60
    },
    include: {
      unitPlan: {
        select: {
          title: true,
          longRangePlan: {
            select: {
              subject: true
            }
          }
        }
      }
    },
    orderBy: [
      { unitPlan: { title: 'asc' } },
      { title: 'asc' }
    ]
  });

  if (lessons60.length === 0) {
    console.log('✅ No lessons found with 60-minute duration. All lessons appear to be correctly set to 45 minutes.');
    return;
  }

  console.log(`📊 Found ${lessons60.length} lessons with 60-minute duration:\n`);

  // Group by unit
  const lessonsByUnit = lessons60.reduce((acc, lesson) => {
    const unitTitle = lesson.unitPlan.title;
    if (!acc[unitTitle]) {
      acc[unitTitle] = {
        subject: lesson.unitPlan.longRangePlan?.subject,
        lessons: []
      };
    }
    acc[unitTitle].lessons.push(lesson);
    return acc;
  }, {} as Record<string, { subject?: string; lessons: any[] }>);

  // Display results by unit
  for (const [unitTitle, unitData] of Object.entries(lessonsByUnit)) {
    console.log(`📚 Unit: "${unitTitle}" (${unitData.subject})`);
    console.log(`   ${unitData.lessons.length} lessons with 60-minute duration:`);
    
    unitData.lessons.forEach((lesson, index) => {
      console.log(`   ${index + 1}. ${lesson.title}`);
    });
    console.log('');
  }

  // Check if any are French lessons
  const frenchLessons = lessons60.filter(lesson => 
    lesson.unitPlan.longRangePlan?.subject?.toLowerCase().includes('fran')
  );

  if (frenchLessons.length > 0) {
    console.log(`🇫🇷 French lessons with 60-minute duration: ${frenchLessons.length}`);
  } else {
    console.log('✅ No French lessons found with 60-minute duration.');
  }
}

// Also check for any incorrect timing patterns
async function findIncorrectTimingPatterns() {
  console.log('\n🔍 Searching for lessons with incorrect timing patterns...\n');

  // Find lessons that don't have proper ETFO timing
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    include: {
      unitPlan: {
        select: {
          title: true,
          longRangePlan: {
            select: {
              subject: true
            }
          }
        }
      }
    },
    take: 20 // Limit for quick check
  });

  const incorrectTimingLessons = allLessons.filter(lesson => {
    const mindsOnTiming = extractTiming(lesson.mindsOn);
    const actionTiming = extractTiming(lesson.action);
    const consolidationTiming = extractTiming(lesson.consolidation);
    
    const isCorrectTiming = 
      mindsOnTiming?.includes('8 minute') &&
      actionTiming?.includes('27 minute') &&
      consolidationTiming?.includes('10 minute');
    
    return !isCorrectTiming;
  });

  if (incorrectTimingLessons.length === 0) {
    console.log('✅ All checked lessons have correct ETFO timing (8/27/10 minutes).');
  } else {
    console.log(`❌ Found ${incorrectTimingLessons.length} lessons with incorrect timing:`);
    incorrectTimingLessons.forEach(lesson => {
      console.log(`   - ${lesson.title} (Unit: ${lesson.unitPlan.title})`);
    });
  }
}

function extractTiming(content: string | null): string | null {
  if (!content) return null;
  
  // Look for timing pattern like "(15 minutes)" or "(8 minutes)"
  const timingMatch = content.match(/\(\d+\s*minutes?\)/i);
  return timingMatch ? timingMatch[0] : null;
}

// Run both checks
find60MinuteLessons()
  .then(() => findIncorrectTimingPatterns())
  .catch((error) => {
    console.error('❌ Error searching for lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });