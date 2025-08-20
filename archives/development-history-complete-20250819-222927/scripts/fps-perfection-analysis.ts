import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fpsPerfectionAnalysis() {
  console.log('🎯 HEALTH/FPS PERFECTION ANALYSIS - WHAT ACTUALLY NEEDS FIXING');
  console.log('================================================================\n');

  // Get Health/FPS units
  const fpsUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  // Get Social Studies for alternating comparison
  const socialUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  console.log('📊 CURRENT STATE ANALYSIS');
  console.log('==========================\n');

  // ISSUE 1: Lesson Count Analysis
  console.log('🔢 ISSUE 1: LESSON COUNT VERIFICATION');
  console.log('-------------------------------------');
  
  const totalHours = fpsUnits.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
  const currentLessons = Math.round(totalHours * 1.33); // 45-min lessons
  const requiredLessons = 97; // From Emily's rotation schedule
  const lessonGap = requiredLessons - currentLessons;

  console.log(`Current total hours: ${totalHours} hours`);
  console.log(`Current lessons: ${currentLessons} lessons (${totalHours} × 1.33)`);
  console.log(`Required lessons: ${requiredLessons} lessons`);
  console.log(`Gap: ${lessonGap} lessons ${lessonGap > 0 ? 'SHORT' : 'OVER'}`);
  
  if (lessonGap !== 0) {
    const neededHours = Math.ceil(lessonGap / 1.33);
    console.log(`✅ FIX NEEDED: Add ${neededHours} hours (${lessonGap} lessons) total`);
    console.log(`   Recommendation: Add ${Math.ceil(neededHours / fpsUnits.length)} hours per unit`);
  } else {
    console.log('✅ PERFECT: Lesson count matches requirement');
  }

  // ISSUE 2: Date Range and Gap Analysis
  console.log('\n📅 ISSUE 2: DATE RANGE AND SCHEDULING ANALYSIS');
  console.log('-----------------------------------------------');

  let hasDateIssues = false;
  let totalSchoolDays = 0;

  fpsUnits.forEach((unit, i) => {
    if (!unit.startDate || !unit.endDate) {
      console.log(`Unit ${i + 1}: ❌ Missing dates`);
      hasDateIssues = true;
      return;
    }

    // Calculate school days (excluding weekends)
    let schoolDays = 0;
    const current = new Date(unit.startDate);
    while (current <= unit.endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        schoolDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const expectedSchoolDays = Math.ceil((unit.estimatedHours || 0) / 0.75);
    const dayDifference = Math.abs(schoolDays - expectedSchoolDays);
    totalSchoolDays += schoolDays;

    console.log(`Unit ${i + 1}: "${unit.title}"`);
    console.log(`  Period: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
    console.log(`  School days: ${schoolDays} (expected: ${expectedSchoolDays})`);
    
    if (dayDifference > 3) {
      console.log(`  ❌ DATE MISMATCH: ${dayDifference} days off`);
      hasDateIssues = true;
    } else {
      console.log(`  ✅ OK: Within tolerance`);
    }

    // Check gap to next unit
    if (i < fpsUnits.length - 1) {
      const nextStart = fpsUnits[i + 1].startDate;
      const gapDays = Math.ceil((nextStart.getTime() - unit.endDate.getTime()) / (1000 * 60 * 60 * 24)) - 1;
      console.log(`  Gap to next unit: ${gapDays} days`);
      
      if (gapDays > 14) {
        console.log(`  ❌ LARGE GAP: Students will miss ${gapDays} days without Health/FPS`);
        hasDateIssues = true;
      } else if (gapDays < 1) {
        console.log(`  ❌ OVERLAP: Units overlap by ${Math.abs(gapDays)} days`);
        hasDateIssues = true;
      }
    }
    console.log('');
  });

  if (!hasDateIssues) {
    console.log('✅ PERFECT: All date ranges are correct');
  } else {
    console.log('✅ FIX NEEDED: Recalculate date ranges for even distribution');
  }

  // ISSUE 3: Alternating Schedule Compatibility
  console.log('\n🔄 ISSUE 3: ALTERNATING SCHEDULE COMPATIBILITY');
  console.log('-----------------------------------------------');

  console.log('Health/FPS periods:');
  fpsUnits.forEach((unit, i) => {
    const start = unit.startDate?.toISOString().split('T')[0];
    const end = unit.endDate?.toISOString().split('T')[0];
    console.log(`  Unit ${i + 1}: ${start} to ${end}`);
  });

  console.log('\nSocial Studies periods:');
  socialUnits.forEach((unit, i) => {
    const start = unit.startDate?.toISOString().split('T')[0];
    const end = unit.endDate?.toISOString().split('T')[0];
    console.log(`  Unit ${i + 1}: ${start} to ${end}`);
  });

  // Check for overlaps
  let hasOverlaps = false;
  for (const fpsUnit of fpsUnits) {
    for (const socialUnit of socialUnits) {
      if (fpsUnit.startDate && fpsUnit.endDate && socialUnit.startDate && socialUnit.endDate) {
        const fpsStart = fpsUnit.startDate.getTime();
        const fpsEnd = fpsUnit.endDate.getTime();
        const socialStart = socialUnit.startDate.getTime();
        const socialEnd = socialUnit.endDate.getTime();

        // Check for overlap
        if ((fpsStart <= socialEnd && fpsEnd >= socialStart)) {
          console.log(`❌ OVERLAP: "${fpsUnit.title}" overlaps with "${socialUnit.title}"`);
          hasOverlaps = true;
        }
      }
    }
  }

  if (!hasOverlaps) {
    console.log('✅ PERFECT: No overlaps with Social Studies');
  } else {
    console.log('✅ FIX NEEDED: Resolve overlaps to enable true alternating schedule');
  }

  // ISSUE 4: Content Quality Assessment
  console.log('\n📝 ISSUE 4: CONTENT QUALITY VERIFICATION');
  console.log('------------------------------------------');

  let contentIssues = 0;
  fpsUnits.forEach((unit, i) => {
    console.log(`Unit ${i + 1}: "${unit.title}"`);
    
    // Check essential fields
    const checks = [
      { field: 'bigIdeas', value: unit.bigIdeas, min: 150 },
      { field: 'description', value: unit.description, min: 100 },
      { field: 'essentialQuestions', value: unit.essentialQuestions, isArray: true, min: 2 },
      { field: 'keyVocabulary', value: unit.keyVocabulary, isArray: true, min: 5 },
      { field: 'successCriteria', value: unit.successCriteria, isObject: true },
      { field: 'assessmentPlan', value: unit.assessmentPlan, min: 100 }
    ];

    checks.forEach(check => {
      if (!check.value) {
        console.log(`  ❌ ${check.field}: Missing`);
        contentIssues++;
      } else if (check.isArray && (!Array.isArray(check.value) || check.value.length < check.min)) {
        console.log(`  ❌ ${check.field}: Array too small (${Array.isArray(check.value) ? check.value.length : 0} < ${check.min})`);
        contentIssues++;
      } else if (check.isObject && typeof check.value !== 'object') {
        console.log(`  ❌ ${check.field}: Not an object`);
        contentIssues++;
      } else if (check.min && typeof check.value === 'string' && check.value.length < check.min) {
        console.log(`  ❌ ${check.field}: Too short (${check.value.length} < ${check.min} chars)`);
        contentIssues++;
      } else {
        console.log(`  ✅ ${check.field}: OK`);
      }
    });
    console.log('');
  });

  if (contentIssues === 0) {
    console.log('✅ PERFECT: All content meets quality standards');
  } else {
    console.log(`✅ FIX NEEDED: Address ${contentIssues} content issues`);
  }

  // FINAL PERFECTION ROADMAP
  console.log('\n🎯 PERFECTION ROADMAP FOR HEALTH/FPS');
  console.log('====================================\n');

  const fixes = [];

  // Lesson count fix
  if (lessonGap !== 0) {
    const hoursNeeded = Math.ceil(lessonGap / 1.33);
    fixes.push({
      priority: 1,
      issue: 'Lesson Count Gap',
      fix: `Add ${hoursNeeded} hours total (${Math.ceil(hoursNeeded / fpsUnits.length)} hours per unit)`,
      timeRequired: '2-3 hours',
      impact: 'Meets exact rotation schedule requirements'
    });
  }

  // Date range fix
  if (hasDateIssues) {
    fixes.push({
      priority: 2,
      issue: 'Date Range Problems',
      fix: 'Recalculate all unit dates for even distribution across school year',
      timeRequired: '1-2 hours',
      impact: 'Eliminates large gaps, enables proper daily rotation'
    });
  }

  // Alternating schedule fix
  if (hasOverlaps) {
    fixes.push({
      priority: 3,
      issue: 'Social Studies Overlaps',
      fix: 'Coordinate with Social Studies schedule to prevent overlaps',
      timeRequired: '1 hour',
      impact: 'Enables true alternating daily schedule'
    });
  }

  // Content fixes
  if (contentIssues > 0) {
    fixes.push({
      priority: 4,
      issue: 'Content Quality',
      fix: `Address ${contentIssues} content gaps in various units`,
      timeRequired: '2-4 hours',
      impact: 'Ensures professional-quality unit content'
    });
  }

  if (fixes.length === 0) {
    console.log('🎉 AMAZING: Health/FPS unit plans are already PERFECT!');
    console.log('No fixes needed - ready for implementation.');
  } else {
    console.log('📋 FIXES NEEDED FOR PERFECTION:');
    console.log('');
    fixes.forEach((fix, i) => {
      console.log(`${fix.priority}. ${fix.issue}`);
      console.log(`   Fix: ${fix.fix}`);
      console.log(`   Time: ${fix.timeRequired}`);
      console.log(`   Impact: ${fix.impact}`);
      console.log('');
    });

    const totalTime = fixes.reduce((sum, fix) => {
      const hours = parseInt(fix.timeRequired.split('-')[1] || fix.timeRequired.split(' ')[0]);
      return sum + hours;
    }, 0);

    console.log(`⏱️ TOTAL TIME TO PERFECTION: ~${totalTime} hours (1-2 days max)`);
    console.log('🎯 OUTCOME: Health/FPS units ready for daily implementation');
  }

  await prisma.$disconnect();
}

fpsPerfectionAnalysis().catch(console.error);