import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixETFOTiming() {
  console.log('🔧 Starting ETFO compliance fix for 4 French units...\n');

  const targetUnits = [
    'Nos amis les animaux',
    'Ma communauté', 
    'Le printemps en fleurs',
    'Célébrons nos apprentissages'
  ];

  let totalLessonsFixed = 0;

  for (const unitTitle of targetUnits) {
    console.log(`\n📚 Processing unit: "${unitTitle}"`);
    
    // Find the unit
    const unit = await prisma.unitPlan.findFirst({
      where: {
        title: unitTitle
      },
      include: {
        lessonPlans: true
      }
    });

    if (!unit) {
      console.log(`❌ Unit "${unitTitle}" not found`);
      continue;
    }

    console.log(`✅ Found unit with ${unit.lessonPlans.length} lessons`);

    // Update each lesson in this unit
    for (const lesson of unit.lessonPlans) {
      // Check if lesson needs updating (duration is 60)
      if (lesson.duration === 60) {
        // Update duration and timing
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            duration: 45,
            mindsOn: updateTiming(lesson.mindsOn, '(8 minutes)'),
            action: updateTiming(lesson.action, '(27 minutes)'),
            consolidation: updateTiming(lesson.consolidation, '(10 minutes)')
          }
        });
        
        console.log(`  ✅ Fixed lesson: "${lesson.title}"`);
        totalLessonsFixed++;
      } else {
        console.log(`  ⏭️  Lesson "${lesson.title}" already has correct duration (${lesson.duration})`);
      }
    }
  }

  console.log(`\n🎉 ETFO Compliance Fix Complete!`);
  console.log(`📊 Total lessons fixed: ${totalLessonsFixed}`);
  console.log(`✅ All lessons now have:`);
  console.log(`   - Duration: 45 minutes`);
  console.log(`   - ETFO timing: 8/27/10 minutes`);
}

function updateTiming(content: string | null, newTiming: string): string {
  if (!content) return newTiming;
  
  // Replace existing timing pattern like "(15 minutes)" or "(35 minutes)" with new timing
  const timingPattern = /\(\d+\s*minutes?\)/i;
  
  if (timingPattern.test(content)) {
    // Replace existing timing
    return content.replace(timingPattern, newTiming);
  } else {
    // Add timing at the beginning
    return `${newTiming} ${content}`;
  }
}

// Run the fix
fixETFOTiming()
  .catch((error) => {
    console.error('❌ Error fixing ETFO timing:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });