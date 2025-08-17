const path = require('path');
const { PrismaClient } = require('./packages/database');
const prisma = new PrismaClient();

async function checkMathStatus() {
  console.log('\n📐 Checking Math Units for Emily McIsaac (ID 23)...\n');

  // Find all Math units
  const mathUnits = await prisma.unitPlan.findMany({
    where: {
      userId: 23,
      OR: [
        { title: { contains: 'Math' } },
        { title: { contains: 'mathématiques' } },
        { title: { contains: 'Mathématiques' } }
      ]
    },
    include: {
      lessonPlans: {
        select: {
          id: true,
          title: true,
          mindsOn: true,
          action: true,
          consolidation: true,
          duration: true,
          differentiationStrategies: true,
          indigenousPerspectives: true
        }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  console.log(`Found ${mathUnits.length} Math units\n`);
  
  let totalLessons = 0;
  let issuesSummary = {
    missingDifferentiation: 0,
    missingIndigenous: 0,
    shortIndigenous: 0,
    missingETFOFormat: 0,
    wrongDuration: 0
  };

  mathUnits.forEach((unit, i) => {
    console.log(`${i+1}. ${unit.title}`);
    console.log(`   Dates: ${unit.startDate.toLocaleDateString()} - ${unit.endDate.toLocaleDateString()}`);
    console.log(`   Lessons: ${unit.lessonPlans.length}`);
    
    unit.lessonPlans.forEach(lesson => {
      totalLessons++;
      
      // Check for issues
      if (!lesson.differentiationStrategies || 
          (typeof lesson.differentiationStrategies === 'string' && !lesson.differentiationStrategies.includes('forStruggling'))) {
        issuesSummary.missingDifferentiation++;
      }
      
      if (!lesson.indigenousPerspectives) {
        issuesSummary.missingIndigenous++;
      } else if (lesson.indigenousPerspectives.length < 100) {
        issuesSummary.shortIndigenous++;
      }
      
      if (!lesson.mindsOn || !lesson.mindsOn.includes('(8 minutes)')) {
        issuesSummary.missingETFOFormat++;
      }
      
      if (lesson.duration !== 45) {
        issuesSummary.wrongDuration++;
      }
    });
  });

  console.log('\n📊 MATH LESSONS SUMMARY:');
  console.log('=======================');
  console.log(`Total lessons: ${totalLessons}`);
  console.log(`\n❌ Issues Found:`);
  console.log(`- Missing/incorrect differentiation: ${issuesSummary.missingDifferentiation} lessons`);
  console.log(`- Missing Indigenous perspectives: ${issuesSummary.missingIndigenous} lessons`);
  console.log(`- Short Indigenous perspectives (<100 chars): ${issuesSummary.shortIndigenous} lessons`);
  console.log(`- Missing ETFO time format: ${issuesSummary.missingETFOFormat} lessons`);
  console.log(`- Wrong duration (not 45 minutes): ${issuesSummary.wrongDuration} lessons`);
  
  const totalIssues = Object.values(issuesSummary).reduce((a, b) => a + b, 0);
  const qualityScore = Math.round((1 - (totalIssues / (totalLessons * 5))) * 100);
  
  console.log(`\n🎯 Estimated Quality Score: ${qualityScore}%`);
  console.log(`   Target: 95%+`);
  console.log(`   Gap: ${95 - qualityScore}%`);

  await prisma.$disconnect();
}

checkMathStatus().catch(console.error);