import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilySocialStudiesLessons() {
  console.log('🏛️ Querying Social Studies lessons for Emily McIsaac (ID 23)...\n');

  // Find all Social Studies lessons for Emily McIsaac
  const socialStudiesLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlan: {
          subject: 'Sciences humaines'
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

  console.log(`📊 Found ${socialStudiesLessons.length} Social Studies lessons for Emily McIsaac\n`);

  if (socialStudiesLessons.length === 0) {
    console.log('❌ No Social Studies lessons found for Emily McIsaac (ID 23)');
    return;
  }

  // Group by unit
  const lessonsByUnit = socialStudiesLessons.reduce((acc, lesson) => {
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
    unitData.lessons.slice(0, 5).forEach((lesson, index) => {
      console.log(`      ${index + 1}. ${lesson.title}`);
    });
    if (unitData.lessons.length > 5) {
      console.log(`      ... and ${unitData.lessons.length - 5} more lessons`);
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`===========`);
  console.log(`Total Social Studies lessons: ${totalLessons}`);
  console.log(`Expected: 84 lessons (24+24+12+12+12)`);
  console.log(`Match: ${totalLessons === 84 ? '✅ YES' : '❌ NO'}`);

  // Expected units
  const expectedUnits = [
    'My Family and Our Class',
    'Our Rights and Responsibilities', 
    'My Story Through Time',
    'Exploring Our World',
    'Responsible Digital Citizens'
  ];

  console.log('\n🎯 EXPECTED UNITS CHECK:');
  console.log('========================');
  expectedUnits.forEach(expectedUnit => {
    const found = Object.keys(lessonsByUnit).some(actualUnit => 
      actualUnit.toLowerCase().includes(expectedUnit.toLowerCase()) ||
      expectedUnit.toLowerCase().includes(actualUnit.toLowerCase())
    );
    console.log(`${found ? '✅' : '❌'} ${expectedUnit}`);
  });

  // Check ETFO compliance issues
  console.log(`\n🔍 ETFO COMPLIANCE CHECK:`);
  console.log(`========================`);

  // Check duration
  const lessons60min = socialStudiesLessons.filter(lesson => lesson.duration === 60);
  console.log(`Duration (60 → 45 min): ${lessons60min.length} lessons need fixing`);

  // Check timing patterns
  let incorrectTiming = 0;
  let missingDifferentiation = 0;
  let missingIndigenous = 0;
  let missingAssessment = 0;

  socialStudiesLessons.forEach(lesson => {
    // Check timing
    const mindsOnTiming = extractTiming(lesson.mindsOn);
    const actionTiming = extractTiming(lesson.action);
    const consolidationTiming = extractTiming(lesson.consolidation);
    
    const hasCorrectTiming = 
      mindsOnTiming?.includes('8 minute') &&
      actionTiming?.includes('27 minute') &&
      consolidationTiming?.includes('10 minute');
    
    if (!hasCorrectTiming) incorrectTiming++;

    // Check differentiation strategies (should be JSON with 4 specific types)
    if (!lesson.differentiationStrategies || 
        typeof lesson.differentiationStrategies !== 'object' ||
        !hasAllDifferentiationTypes(lesson.differentiationStrategies)) {
      missingDifferentiation++;
    }

    // Check indigenous perspectives (needs 100+ chars about Mi'kmaq)
    if (!lesson.indigenousPerspectives || 
        lesson.indigenousPerspectives.length < 100 ||
        !lesson.indigenousPerspectives.toLowerCase().includes('mi\'kmaq')) {
      missingIndigenous++;
    }

    // Check assessment notes (needs observable assessment with checkboxes)
    if (!lesson.assessmentNotes || 
        !lesson.assessmentNotes.includes('☐') ||
        !lesson.assessmentNotes.toLowerCase().includes('observ')) {
      missingAssessment++;
    }
  });

  console.log(`Structure timing: ${incorrectTiming} lessons need timing fixes`);
  console.log(`Differentiation strategies: ${missingDifferentiation} lessons need proper JSON differentiation`);
  console.log(`Indigenous perspectives: ${missingIndigenous} lessons need Mi'kmaq content (100+ chars)`);
  console.log(`Assessment notes: ${missingAssessment} lessons need observable assessment checkboxes`);

  console.log(`\n⚡ TOTAL FIXES NEEDED: ${lessons60min.length + incorrectTiming + missingDifferentiation + missingIndigenous + missingAssessment} issues across ${totalLessons} lessons`);

  // Sample lesson for reference
  if (socialStudiesLessons.length > 0) {
    console.log(`\n📋 SAMPLE LESSON (for reference):`);
    console.log(`=================================`);
    const sample = socialStudiesLessons[0];
    console.log(`Title: ${sample.title}`);
    console.log(`Unit: ${sample.unitPlan.title}`);
    console.log(`Duration: ${sample.duration} minutes`);
    console.log(`MindsOn timing: ${extractTiming(sample.mindsOn) || 'No timing found'}`);
    console.log(`Action timing: ${extractTiming(sample.action) || 'No timing found'}`);
    console.log(`Consolidation timing: ${extractTiming(sample.consolidation) || 'No timing found'}`);
    console.log(`Differentiation: ${sample.differentiationStrategies ? JSON.stringify(sample.differentiationStrategies).substring(0, 100) + '...' : 'Missing'}`);
    console.log(`Indigenous perspectives: ${sample.indigenousPerspectives ? `"${sample.indigenousPerspectives.substring(0, 100)}..."` : 'Missing'}`);
    console.log(`Assessment notes: ${sample.assessmentNotes ? `"${sample.assessmentNotes.substring(0, 100)}..."` : 'Missing'}`);
  }
}

function extractTiming(content: string | null): string | null {
  if (!content) return null;
  
  // Look for timing pattern like "(15 minutes)" or "(8 minutes)"
  const timingMatch = content.match(/\(\d+\s*minutes?\)/i);
  return timingMatch ? timingMatch[0] : null;
}

function hasAllDifferentiationTypes(strategies: any): boolean {
  if (!strategies || typeof strategies !== 'object') return false;
  
  const requiredTypes = ['forStruggling', 'forIEP', 'forELL', 'forAdvanced'];
  return requiredTypes.every(type => strategies.hasOwnProperty(type));
}

// Run the query
queryEmilySocialStudiesLessons()
  .catch((error) => {
    console.error('❌ Error querying Social Studies lessons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });