import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function hierarchyAnalysis() {
  console.log('📊 COMPLETE PLANNING HIERARCHY ANALYSIS');
  console.log('='.repeat(70));
  
  const lrps = await prisma.longRangePlan.findMany({
    include: {
      unitPlans: {
        include: {
          lessonPlans: true,
          expectations: true
        }
      }
    }
  });
  
  // Get all units and filter for orphans
  const allUnitsForOrphans = await prisma.unitPlan.findMany({
    include: { lessonPlans: true }
  });
  const orphanUnits = allUnitsForOrphans.filter(u => !u.longRangePlanId);
  
  // Get all lessons and filter for orphans
  const allLessonsForOrphans = await prisma.eTFOLessonPlan.findMany();
  const orphanLessons = allLessonsForOrphans.filter(l => !l.unitPlanId);
  
  const allUnits = await prisma.unitPlan.findMany({
    include: { 
      lessonPlans: true,
      expectations: { include: { expectation: true } }
    },
    orderBy: { startDate: 'asc' }
  });
  
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true }
  });
  
  const issues: string[] = [];
  
  console.log('\n🏗️ HIERARCHY STRUCTURE');
  console.log(`Long Range Plans: ${lrps.length}`);
  console.log(`Total Units: ${allUnits.length}`);
  console.log(`Total Lessons: ${allLessons.length}`);
  console.log(`Orphan Units (no LRP): ${orphanUnits.length}`);
  console.log(`Orphan Lessons (no Unit): ${orphanLessons.length}`);
  
  if (orphanUnits.length > 0) {
    issues.push(`${orphanUnits.length} units not connected to long range plans`);
    console.log('\n⚠️  Orphan Units:');
    orphanUnits.forEach(u => {
      console.log(`  - ${u.title} (${u.lessonPlans.length} lessons)`);
    });
  }
  
  if (orphanLessons.length > 0) {
    issues.push(`${orphanLessons.length} lessons not connected to units`);
  }
  
  // Check LRP completeness
  console.log('\n📋 LONG RANGE PLAN ANALYSIS');
  
  if (lrps.length === 0) {
    console.log('❌ NO LONG RANGE PLANS FOUND!');
    issues.push('No long range plans exist in the system');
  } else {
    lrps.forEach(lrp => {
      console.log(`\nLRP: ${lrp.title || 'Untitled'}`);
      console.log(`  Academic Year: ${lrp.academicYear}`);
      console.log(`  Subject: ${lrp.subject}`);
      console.log(`  Grade: ${lrp.grade}`);
      console.log(`  Units: ${lrp.unitPlans.length}`);
      console.log(`  Total Lessons: ${lrp.unitPlans.reduce((sum, u) => sum + u.lessonPlans.length, 0)}`);
      
      // Check for missing fields
      const missingFields = [];
      if (!lrp.title) missingFields.push('title');
      if (!lrp.thematicOverview) missingFields.push('thematic overview');
      if (!lrp.keyResources) missingFields.push('key resources');
      if (!lrp.assessmentStrategy) missingFields.push('assessment strategy');
      if (!lrp.crossCurricularConnections) missingFields.push('cross-curricular connections');
      if (!lrp.indigenousPerspectives) missingFields.push('indigenous perspectives');
      if (!lrp.differentiationStrategies) missingFields.push('differentiation strategies');
      
      if (missingFields.length > 0) {
        console.log(`  ⚠️  Missing: ${missingFields.join(', ')}`);
        issues.push(`LRP "${lrp.title || 'Untitled'}" missing ${missingFields.length} fields`);
      }
      
      if (lrp.unitPlans.length === 0) {
        console.log('  ❌ No units attached!');
        issues.push(`LRP "${lrp.title || 'Untitled'}" has no units`);
      }
    });
  }
  
  // Check unit progression and continuity
  console.log('\n📅 UNIT PROGRESSION & CONTINUITY');
  
  let overlaps = 0;
  let gaps = 0;
  let dateSequenceErrors = 0;
  
  for (let i = 1; i < allUnits.length; i++) {
    const prevUnit = allUnits[i-1];
    const currUnit = allUnits[i];
    
    // Check for overlapping dates
    if (prevUnit.endDate > currUnit.startDate) {
      overlaps++;
      console.log(`  ⚠️  Overlap: "${prevUnit.title}" ends after "${currUnit.title}" starts`);
    }
    
    // Check for large gaps
    const gapDays = Math.round((currUnit.startDate.getTime() - prevUnit.endDate.getTime()) / (1000 * 60 * 60 * 24));
    if (gapDays > 14) {
      gaps++;
      console.log(`  ⚠️  Gap (${gapDays} days): between "${prevUnit.title}" and "${currUnit.title}"`);
    }
    
    // Check if unit dates make sense
    if (currUnit.startDate >= currUnit.endDate) {
      dateSequenceErrors++;
      console.log(`  ❌ Invalid dates: "${currUnit.title}" starts after it ends`);
    }
  }
  
  if (overlaps > 0) issues.push(`${overlaps} units have overlapping dates`);
  if (gaps > 0) issues.push(`${gaps} large gaps between units`);
  if (dateSequenceErrors > 0) issues.push(`${dateSequenceErrors} units with invalid date sequences`);
  
  // Check unit content completeness
  console.log('\n📝 UNIT CONTENT COMPLETENESS');
  
  let incompleteUnits = 0;
  let unitsWithoutExpectations = 0;
  let unitsWithoutAssessment = 0;
  
  allUnits.forEach(unit => {
    const problems = [];
    
    if (!unit.description) problems.push('description');
    if (!unit.bigIdeas) problems.push('big ideas');
    if (!unit.essentialQuestions) problems.push('essential questions');
    if (!unit.assessmentPlan) problems.push('assessment plan');
    if (!unit.successCriteria) problems.push('success criteria');
    
    if (problems.length > 0) {
      incompleteUnits++;
      if (incompleteUnits <= 3) {
        console.log(`  "${unit.title}" missing: ${problems.join(', ')}`);
      }
    }
    
    if (unit.expectations.length === 0) {
      unitsWithoutExpectations++;
    }
    
    if (!unit.assessmentPlan) {
      unitsWithoutAssessment++;
    }
  });
  
  if (incompleteUnits > 0) {
    console.log(`\n⚠️  ${incompleteUnits} units have incomplete content`);
    issues.push(`${incompleteUnits} units missing essential fields`);
  }
  
  if (unitsWithoutExpectations > 0) {
    console.log(`❌ ${unitsWithoutExpectations} units not linked to curriculum expectations`);
    issues.push(`${unitsWithoutExpectations} units without curriculum mapping`);
  }
  
  // Check lesson distribution across units
  console.log('\n📊 LESSON DISTRIBUTION ACROSS UNITS');
  
  const lessonsByUnit = new Map();
  allUnits.forEach(unit => {
    lessonsByUnit.set(unit.title, unit.lessonPlans.length);
  });
  
  const lessonCounts = Array.from(lessonsByUnit.values());
  const avgLessonsPerUnit = lessonCounts.reduce((a, b) => a + b, 0) / lessonCounts.length;
  const stdDev = Math.sqrt(
    lessonCounts.reduce((sum, count) => sum + Math.pow(count - avgLessonsPerUnit, 2), 0) / lessonCounts.length
  );
  
  console.log(`Average lessons per unit: ${avgLessonsPerUnit.toFixed(1)}`);
  console.log(`Standard deviation: ${stdDev.toFixed(1)}`);
  
  if (stdDev > 10) {
    console.log('⚠️  High variation in lesson counts across units');
    issues.push(`High variation in unit sizes (std dev: ${stdDev.toFixed(1)})`);
  }
  
  // Check lesson date alignment with unit dates
  console.log('\n📆 LESSON-UNIT DATE ALIGNMENT');
  
  let misalignedLessons = 0;
  allLessons.forEach(lesson => {
    if (lesson.unitPlan) {
      if (lesson.date < lesson.unitPlan.startDate || lesson.date > lesson.unitPlan.endDate) {
        misalignedLessons++;
      }
    }
  });
  
  if (misalignedLessons > 0) {
    console.log(`❌ ${misalignedLessons} lessons scheduled outside their unit dates`);
    issues.push(`${misalignedLessons} lessons outside unit date ranges`);
  }
  
  // Check for curriculum coverage
  console.log('\n🎯 CURRICULUM COVERAGE ANALYSIS');
  
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { grade: 1 }
  });
  
  const coveredExpectationIds = new Set();
  allUnits.forEach(unit => {
    unit.expectations.forEach(exp => {
      coveredExpectationIds.add(exp.expectationId);
    });
  });
  
  const uncoveredExpectations = expectations.filter(e => !coveredExpectationIds.has(e.id));
  const coveragePercent = ((expectations.length - uncoveredExpectations.length) / expectations.length * 100).toFixed(1);
  
  console.log(`Total expectations: ${expectations.length}`);
  console.log(`Covered expectations: ${coveredExpectationIds.size}`);
  console.log(`Coverage: ${coveragePercent}%`);
  
  if (parseFloat(coveragePercent) < 100) {
    console.log(`\n❌ ${uncoveredExpectations.length} expectations not covered:`);
    uncoveredExpectations.slice(0, 5).forEach(exp => {
      console.log(`  - ${exp.code}: ${exp.description?.substring(0, 50)}...`);
    });
    issues.push(`Only ${coveragePercent}% curriculum coverage`);
  }
  
  // Check for balanced assessment across the hierarchy
  console.log('\n📊 ASSESSMENT STRATEGY ALIGNMENT');
  
  const assessmentTypesInLessons = new Map();
  allLessons.forEach(lesson => {
    const type = lesson.assessmentType || 'None';
    assessmentTypesInLessons.set(type, (assessmentTypesInLessons.get(type) || 0) + 1);
  });
  
  const unitsWithoutAssessmentPlan = allUnits.filter(u => !u.assessmentPlan).length;
  const lrpsWithoutAssessmentStrategy = lrps.filter(l => !l.assessmentStrategy).length;
  
  console.log('Assessment gaps:');
  console.log(`  LRPs without strategy: ${lrpsWithoutAssessmentStrategy}`);
  console.log(`  Units without plan: ${unitsWithoutAssessmentPlan}`);
  console.log(`  Lesson assessment types: ${assessmentTypesInLessons.size}`);
  
  if (lrpsWithoutAssessmentStrategy > 0) {
    issues.push(`${lrpsWithoutAssessmentStrategy} LRPs lack assessment strategy`);
  }
  if (unitsWithoutAssessmentPlan > 0) {
    issues.push(`${unitsWithoutAssessmentPlan} units lack assessment plans`);
  }
  
  // FINAL HIERARCHY SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('🚨 HIERARCHY ISSUES SUMMARY');
  console.log('='.repeat(70));
  
  if (issues.length === 0) {
    console.log('\n✅ PERFECT HIERARCHY! No issues found.');
  } else {
    console.log(`\n❌ Total Issues: ${issues.length}`);
    console.log('\nAll Hierarchy Issues:');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    // Calculate hierarchy health score
    const maxScore = 100;
    const deduction = Math.min(issues.length * 5, 100);
    const healthScore = maxScore - deduction;
    
    console.log(`\n📊 Hierarchy Health Score: ${healthScore}/100`);
    
    if (healthScore >= 90) {
      console.log('✅ Excellent hierarchy structure');
    } else if (healthScore >= 70) {
      console.log('⚠️  Good but needs improvement');
    } else if (healthScore >= 50) {
      console.log('🟠 Significant hierarchy problems');
    } else {
      console.log('🔴 Critical hierarchy failures');
    }
  }
  
  await prisma.$disconnect();
}

hierarchyAnalysis().catch(console.error);