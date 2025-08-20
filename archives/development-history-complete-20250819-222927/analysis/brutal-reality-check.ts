import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function brutalRealityCheck() {
  console.log('🔍 BRUTAL REALITY CHECK - NO SUGAR COATING');
  console.log('===========================================\n');

  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh', dailyLessons: 195 },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in', dailyLessons: 195 },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh', dailyLessons: 195 },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5', dailyLessons: 97 },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo', dailyLessons: 195 },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw', dailyLessons: 98 }
  ];

  let totalProblems = [];

  for (const subject of subjects) {
    console.log(`\n📚 ${subject.name.toUpperCase()}`);
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: subject.lrpId },
      include: {
        lessonPlans: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Units found: ${units.length}`);
    
    // Check total hours and lessons
    const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const totalLessons = Math.round(totalHours / 0.75);
    const lessonGap = subject.dailyLessons - totalLessons;
    
    console.log(`Total hours: ${totalHours}`);
    console.log(`Calculated lessons: ${totalLessons}`);
    console.log(`Required lessons: ${subject.dailyLessons}`);
    console.log(`Lesson gap: ${lessonGap}`);
    
    if (Math.abs(lessonGap) > 5) {
      const problem = `❌ ${subject.name}: ${Math.abs(lessonGap)} lesson gap`;
      totalProblems.push(problem);
      console.log(problem);
    }

    // Check lesson plans created
    const actualLessonPlans = units.reduce((sum, u) => sum + u.lessonPlans.length, 0);
    console.log(`Actual lesson plans created: ${actualLessonPlans}`);
    if (actualLessonPlans === 0) {
      const problem = `❌ ${subject.name}: ZERO lesson plans exist`;
      totalProblems.push(problem);
      console.log(problem);
    }

    // Check for date overlaps or gaps
    let prevEnd: Date | null = null;
    for (const [index, unit] of units.entries()) {
      if (unit.startDate && unit.endDate) {
        if (prevEnd) {
          const gapDays = Math.floor((unit.startDate.getTime() - prevEnd.getTime()) / (1000 * 60 * 60 * 24)) - 1;
          if (gapDays > 2) {
            const problem = `❌ ${subject.name} Unit ${index + 1}: ${gapDays} day gap from previous`;
            totalProblems.push(problem);
            console.log(`  ${problem}`);
          } else if (gapDays < 0) {
            const problem = `❌ ${subject.name} Unit ${index + 1}: OVERLAPS with previous unit`;
            totalProblems.push(problem);
            console.log(`  ${problem}`);
          }
        }
        prevEnd = unit.endDate;
      }

      // Check content quality
      if (!unit.keyVocabulary) {
        const problem = `❌ ${subject.name} Unit ${index + 1}: Missing vocabulary`;
        totalProblems.push(problem);
      }
      
      if (!unit.bigIdeas || unit.bigIdeas.length < 50) {
        const problem = `⚠️ ${subject.name} Unit ${index + 1}: Suspiciously short big ideas`;
        totalProblems.push(problem);
      }

      // Check for English content in French immersion
      if (unit.title && !unit.title.match(/[àâäæçèéêëîïôùûüÿœ]/)) {
        // No French accents in title - might be English
        if (unit.title.match(/^[A-Za-z\s]+$/) && !unit.title.includes('3D')) {
          console.log(`  ⚠️ Unit "${unit.title}" might be in English (no French characters)`);
        }
      }
    }

    // Check last unit ends reasonably
    const lastUnit = units[units.length - 1];
    if (lastUnit?.endDate) {
      const endDate = lastUnit.endDate.toISOString().split('T')[0];
      if (endDate > '2026-06-30') {
        const problem = `❌ ${subject.name}: Last unit extends past school year (${endDate})`;
        totalProblems.push(problem);
        console.log(problem);
      }
    }
  }

  console.log('\n\n🎯 BRUTAL TRUTH SUMMARY');
  console.log('========================');
  console.log(`Total problems found: ${totalProblems.length}`);
  
  if (totalProblems.length === 0) {
    console.log('✅ Surprisingly, the system appears actually perfect');
  } else {
    console.log('\n❌ PROBLEMS THAT MAKE "PERFECT" A LIE:');
    totalProblems.forEach(p => console.log(`  ${p}`));
  }

  // Final reality check
  console.log('\n\n📊 IMPLEMENTATION REALITY:');
  console.log('Can Emily actually teach with this? ');
  
  const hasLessonPlans = totalProblems.filter(p => p.includes('ZERO lesson plans')).length === 0;
  const hasCorrectLessons = totalProblems.filter(p => p.includes('lesson gap')).length === 0;
  const hasGoodDates = totalProblems.filter(p => p.includes('gap from previous') || p.includes('OVERLAPS')).length === 0;
  const endsOnTime = totalProblems.filter(p => p.includes('past school year')).length === 0;

  if (!hasLessonPlans) {
    console.log('❌ NO - Zero lesson plans means no daily instruction possible');
  } else if (!hasGoodDates) {
    console.log('⚠️ MAYBE - Date issues could cause scheduling problems');
  } else if (!hasCorrectLessons) {
    console.log('⚠️ MAYBE - Lesson count mismatch could affect coverage');
  } else if (!endsOnTime) {
    console.log('⚠️ MAYBE - Units extending past June is problematic');
  } else {
    console.log('✅ YES - System appears ready for implementation');
  }

  await prisma.$disconnect();
}

brutalRealityCheck().catch(console.error);