import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyScienceLessons() {
  console.log('🔬 Querying Science lessons for Emily McIsaac (ID 23)...\n');

  // Find all Science lessons for Emily McIsaac
  const scienceLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlan: {
          subject: 'Sciences de la nature'
        }
      }
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

  console.log(`📊 Found ${scienceLessons.length} Science lessons for Emily McIsaac\n`);

  if (scienceLessons.length === 0) {
    console.log('❌ No Science lessons found for Emily McIsaac (ID 23)');
    return;
  }

  // Group by unit
  const lessonsByUnit = scienceLessons.reduce((acc, lesson) => {
    const unitTitle = lesson.unitPlan.title;
    if (!acc[unitTitle]) {
      acc[unitTitle] = {
        lessons: []
      };
    }
    acc[unitTitle].lessons.push(lesson);
    return acc;
  }, {} as Record<string, { lessons: any[] }>);

  console.log('🗂️  LESSONS BY UNIT:');
  console.log('===================');

  let totalLessons = 0;
  for (const [unitTitle, unitData] of Object.entries(lessonsByUnit)) {
    console.log(`\n📚 Unit: "${unitTitle}"`);
    console.log(`   📝 ${unitData.lessons.length} lessons`);
    totalLessons += unitData.lessons.length;
    
    // Show first few lesson titles as sample
    unitData.lessons.slice(0, 3).forEach((lesson, index) => {
      console.log(`      ${index + 1}. ${lesson.title}`);
    });
    if (unitData.lessons.length > 3) {
      console.log(`      ... and ${unitData.lessons.length - 3} more lessons`);
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`===========`);
  console.log(`Total Science lessons: ${totalLessons}`);
  console.log(`Expected: 156 lessons`);
  console.log(`Match: ${totalLessons === 156 ? '✅ YES' : '❌ NO'}`);

  // Check ETFO compliance issues
  console.log(`\n🔍 ETFO COMPLIANCE CHECK:`);
  console.log(`========================`);

  // Check duration
  const lessons60min = scienceLessons.filter(lesson => lesson.duration === 60);
  console.log(`Duration (60 → 45 min): ${lessons60min.length} lessons need fixing`);

  // Check timing patterns
  let incorrectTiming = 0;
  let missingDifferentiation = 0;
  let missingIndigenous = 0;
  let missingAssessment = 0;

  scienceLessons.forEach(lesson => {
    // Check timing
    const mindsOnTiming = extractTiming(lesson.mindsOn);
    const actionTiming = extractTiming(lesson.action);
    const consolidationTiming = extractTiming(lesson.consolidation);
    
    const hasCorrectTiming = 
      mindsOnTiming?.includes('8 minute') &&
      actionTiming?.includes('27 minute') &&
      consolidationTiming?.includes('10 minute');
    
    if (!hasCorrectTiming) incorrectTiming++;

    // Check differentiation strategies
    if (!lesson.differentiationStrategies || 
        typeof lesson.differentiationStrategies !== 'object' ||
        !Object.keys(lesson.differentiationStrategies).includes('forStruggling')) {
      missingDifferentiation++;
    }

    // Check indigenous perspectives
    if (!lesson.indigenousPerspectives || 
        lesson.indigenousPerspectives.length < 100) {
      missingIndigenous++;
    }

    // Check assessment notes
    if (!lesson.assessmentNotes || 
        !lesson.assessmentNotes.includes('☐')) {
      missingAssessment++;
    }
  });

  console.log(`Structure timing: ${incorrectTiming} lessons need timing fixes`);
  console.log(`Differentiation strategies: ${missingDifferentiation} lessons need JSON differentiation`);
  console.log(`Indigenous perspectives: ${missingIndigenous} lessons need Mi'kmaq content`);
  console.log(`Assessment notes: ${missingAssessment} lessons need observable assessment checkboxes`);

  // Sample lesson for reference
  if (scienceLessons.length > 0) {
    console.log(`\n📋 SAMPLE LESSON (for reference):`);
    console.log(`=================================`);
    const sample = scienceLessons[0];
    console.log(`Title: ${sample.title}`);
    console.log(`Unit: ${sample.unitPlan.title}`);
    console.log(`Duration: ${sample.duration} minutes`);
    console.log(`MindsOn timing: ${extractTiming(sample.mindsOn) || 'No timing found'}`);
    console.log(`Action timing: ${extractTiming(sample.action) || 'No timing found'}`);
    console.log(`Consolidation timing: ${extractTiming(sample.consolidation) || 'No timing found'}`);
    console.log(`Differentiation: ${sample.differentiationStrategies ? 'Present' : 'Missing'}`);
    console.log(`Indigenous perspectives: ${sample.indigenousPerspectives ? `"${sample.indigenousPerspectives.substring(0, 50)}..."` : 'Missing'}`);
    console.log(`Assessment notes: ${sample.assessmentNotes ? `"${sample.assessmentNotes.substring(0, 50)}..."` : 'Missing'}`);
  }
}

function extractTiming(content: string | null): string | null {
  if (!content) return null;
  
  // Look for timing pattern like "(15 minutes)" or "(8 minutes)"
  const timingMatch = content.match(/\(\d+\s*minutes?\)/i);
  return timingMatch ? timingMatch[0] : null;
}

// Run the query
queryEmilyScienceLessons()
  .catch((error) => {
    console.error('❌ Error querying Science lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });