import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentTiming() {
  console.log('🔍 Checking current timing for French units...\n');

  const targetUnits = [
    'Nos amis les animaux',
    'Ma communauté', 
    'Le printemps en fleurs',
    'Célébrons nos apprentissages'
  ];

  for (const unitTitle of targetUnits) {
    console.log(`\n📚 Unit: "${unitTitle}"`);
    
    // Find the unit
    const unit = await prisma.unitPlan.findFirst({
      where: {
        title: unitTitle
      },
      include: {
        lessonPlans: {
          take: 3 // Just check first 3 lessons as examples
        }
      }
    });

    if (!unit) {
      console.log(`❌ Unit "${unitTitle}" not found`);
      continue;
    }

    console.log(`✅ Found ${unit.lessonPlans.length} lessons (showing first 3)`);

    // Check each lesson's timing content
    for (const lesson of unit.lessonPlans) {
      console.log(`\n  📖 Lesson: "${lesson.title}"`);
      console.log(`     Duration: ${lesson.duration} minutes`);
      
      // Check mindsOn timing
      const mindsOnTiming = extractTiming(lesson.mindsOn);
      console.log(`     Minds On: ${mindsOnTiming || 'No timing found'}`);
      
      // Check action timing
      const actionTiming = extractTiming(lesson.action);
      console.log(`     Action: ${actionTiming || 'No timing found'}`);
      
      // Check consolidation timing
      const consolidationTiming = extractTiming(lesson.consolidation);
      console.log(`     Consolidation: ${consolidationTiming || 'No timing found'}`);
      
      // Check if timing matches ETFO standard (8/27/10)
      const isCorrectTiming = 
        mindsOnTiming?.includes('8 minute') &&
        actionTiming?.includes('27 minute') &&
        consolidationTiming?.includes('10 minute');
      
      console.log(`     ETFO Compliant: ${isCorrectTiming ? '✅ YES' : '❌ NO'}`);
    }
  }
}

function extractTiming(content: string | null): string | null {
  if (!content) return null;
  
  // Look for timing pattern like "(15 minutes)" or "(8 minutes)"
  const timingMatch = content.match(/\(\d+\s*minutes?\)/i);
  return timingMatch ? timingMatch[0] : null;
}

// Run the check
checkCurrentTiming()
  .catch((error) => {
    console.error('❌ Error checking timing:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });