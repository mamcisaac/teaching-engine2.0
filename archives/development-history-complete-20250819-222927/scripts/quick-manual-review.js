const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function manualReview() {
  try {
    console.log('🎯 MANUAL PEDAGOGICAL REVIEW OF ARTS VISUELS UNITS\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98v0009vjr16o3e7awo' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    // TIMING ANALYSIS
    console.log('📅 TIMING DISTRIBUTION REVIEW:');
    console.log('==============================\n');
    
    let totalLessons = 0;
    const lessonCounts = [];
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    units.forEach((unit, i) => {
      const lessons = Math.round(((unit.estimatedHours || 0) * 60) / 45);
      lessonCounts.push(lessons);
      totalLessons += lessons;
      
      console.log(`${months[i] || i+1}: ${unit.title}`);
      console.log(`   ${lessons} lessons (${unit.estimatedHours}h) - ${unit.description?.substring(0, 60)}...`);
    });
    
    const minLessons = Math.min(...lessonCounts);
    const maxLessons = Math.max(...lessonCounts);
    const variance = ((maxLessons - minLessons) / minLessons * 100);
    
    console.log(`\nTIMING SUMMARY:`);
    console.log(`• Total lessons: ${totalLessons} (Target: 195)`);
    console.log(`• Range: ${minLessons} - ${maxLessons} lessons`);
    console.log(`• Variance: ${variance.toFixed(1)}%`);
    console.log(`• Perfect for Emily? ${totalLessons === 195 ? '✅ YES' : '❌ NO'}`);
    console.log(`• Manageable variance? ${variance <= 30 ? '✅ YES' : '❌ TOO HIGH'}\n`);

    // CURRICULUM PROGRESSION REVIEW
    console.log('🎨 CURRICULUM EXPECTATIONS PROGRESSION:');
    console.log('======================================\n');
    
    units.forEach((unit, i) => {
      const codes = unit.expectations.map(e => e.expectation.code);
      const primaryCodes = codes.slice(0, 2);
      const supportingCodes = codes.slice(2);
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`   PRIMARY: [${primaryCodes.join(', ')}] | SUPPORTING: [${supportingCodes.join(', ')}]`);
      console.log(`   Complete coverage: ${codes.length === 4 ? '✅' : '❌'} | All 4 expectations: ${['AV1', 'AV2', 'AV3', 'AV4'].every(c => codes.includes(c)) ? '✅' : '❌'}\n`);
    });

    // FLEXIBILITY REVIEW
    console.log('🔄 FLEXIBILITY BUILT INTO TIMINGS:');
    console.log('==================================\n');
    
    units.slice(0, 3).forEach((unit, i) => {
      const hasFlexibility = unit.fieldTripsAndGuestSpeakers?.includes('FLEXIBILITY') || 
                            unit.fieldTripsAndGuestSpeakers?.includes('REAL');
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`   Unit-specific flexibility: ${hasFlexibility ? '✅ YES' : '❌ GENERIC'}`);
      if (hasFlexibility) {
        const flexSnippet = unit.fieldTripsAndGuestSpeakers.substring(0, 100) + '...';
        console.log(`   Sample: "${flexSnippet}"`);
      }
      console.log();
    });

    // ASSESSMENT ALIGNMENT
    console.log('📊 ASSESSMENT ALIGNMENT:');
    console.log('========================\n');
    
    units.slice(0, 3).forEach((unit, i) => {
      const hasAlignedAssessment = unit.assessmentPlan?.includes(unit.title.toUpperCase()) ||
                                   unit.assessmentPlan?.includes('PRIMARY ASSESSMENT');
      
      console.log(`${months[i]}: ${unit.title}`);
      console.log(`   Assessment aligned to expectations: ${hasAlignedAssessment ? '✅ YES' : '❌ GENERIC'}`);
      console.log();
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualReview();