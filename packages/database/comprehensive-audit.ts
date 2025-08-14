import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveSystemAudit() {
  console.log('🔍 COMPREHENSIVE SYSTEM AUDIT - FULL HIERARCHY REVIEW');
  console.log('='.repeat(70));
  
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true },
    orderBy: { date: 'asc' }
  });
  
  const units = await prisma.unitPlan.findMany({
    include: { 
      lessonPlans: true,
      expectations: { include: { expectation: true } }
    },
    orderBy: { startDate: 'asc' }
  });
  
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { grade: 1 }
  });
  
  const users = await prisma.user.findMany();
  const criticalIssues: string[] = [];
  
  console.log('\n📊 SYSTEM OVERVIEW');
  console.log('-'.repeat(50));
  console.log('Total Units: ' + units.length);
  console.log('Total Lessons: ' + lessons.length);
  console.log('Total Expectations: ' + expectations.length);
  console.log('Total Users: ' + users.length);
  
  // 1. DATA INTEGRITY ISSUES
  console.log('\n🔴 DATA INTEGRITY PROBLEMS');
  console.log('-'.repeat(50));
  
  // Check for orphaned lessons
  const orphanedLessons = lessons.filter(l => !l.unitPlan);
  if (orphanedLessons.length > 0) {
    console.log(`❌ Orphaned Lessons: ${orphanedLessons.length}`);
    criticalIssues.push(`${orphanedLessons.length} orphaned lessons without units`);
  }
  
  // Check for empty units
  const emptyUnits = units.filter(u => u.lessonPlans.length === 0);
  if (emptyUnits.length > 0) {
    console.log(`❌ Empty Units: ${emptyUnits.length}`);
    emptyUnits.forEach(u => {
      console.log(`   - ${u.title}`);
      criticalIssues.push(`Empty unit: ${u.title}`);
    });
  }
  
  // Check user assignment
  const lessonsWithoutUser = lessons.filter(l => !l.userId);
  if (lessonsWithoutUser.length > 0) {
    console.log(`❌ Lessons without user: ${lessonsWithoutUser.length}`);
    criticalIssues.push(`${lessonsWithoutUser.length} lessons without user assignment`);
  }
  
  // 2. CALENDAR VIOLATIONS
  console.log('\n📅 CALENDAR & SCHEDULING ISSUES');
  console.log('-'.repeat(50));
  
  // Weekend lessons
  const weekendLessons = lessons.filter(l => {
    const day = l.date.getDay();
    return day === 0 || day === 6;
  });
  if (weekendLessons.length > 0) {
    console.log(`❌ Weekend Lessons: ${weekendLessons.length}`);
    weekendLessons.slice(0, 5).forEach(l => {
      console.log(`   - ${l.date.toISOString().substring(0,10)} (${l.date.toLocaleDateString('en', {weekday: 'long'})}): ${l.title}`);
    });
    criticalIssues.push(`${weekendLessons.length} lessons scheduled on weekends`);
  }
  
  // Summer lessons (July/August)
  const summerLessons = lessons.filter(l => {
    const month = l.date.getMonth();
    return month === 6 || month === 7; // July=6, August=7 in JS
  });
  if (summerLessons.length > 0) {
    console.log(`❌ Summer Vacation Lessons: ${summerLessons.length}`);
    criticalIssues.push(`${summerLessons.length} lessons during summer vacation`);
  }
  
  // Check date range
  const dates = lessons.map(l => l.date);
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  console.log(`Date Range: ${minDate.toISOString().substring(0,10)} to ${maxDate.toISOString().substring(0,10)}`);
  
  // Past dates check
  const pastLessons = lessons.filter(l => l.date < new Date('2025-09-01'));
  if (pastLessons.length > 0) {
    console.log(`❌ Lessons before school year: ${pastLessons.length}`);
    criticalIssues.push(`${pastLessons.length} lessons before 2025-09-01`);
  }
  
  // 3. LESSON QUALITY METRICS
  console.log('\n📚 LESSON QUALITY ISSUES');
  console.log('-'.repeat(50));
  
  // Duration issues
  const durations = lessons.map(l => l.duration);
  const tooShort = lessons.filter(l => l.duration < 30);
  const tooLong = lessons.filter(l => l.duration > 60);
  
  if (tooShort.length > 0) {
    console.log(`❌ Lessons < 30 minutes: ${tooShort.length}`);
    criticalIssues.push(`${tooShort.length} lessons too short (<30 min)`);
  }
  
  if (tooLong.length > 0) {
    console.log(`❌ Lessons > 60 minutes: ${tooLong.length}`);
    criticalIssues.push(`${tooLong.length} lessons too long (>60 min) for Grade 1`);
  }
  
  // Check for missing content
  let missingContent = 0;
  lessons.forEach(l => {
    if (!l.mindsOn || l.mindsOn.length < 20 ||
        !l.action || l.action.length < 50 ||
        !l.consolidation || l.consolidation.length < 20) {
      missingContent++;
    }
  });
  
  if (missingContent > 0) {
    console.log(`❌ Lessons with inadequate content: ${missingContent}`);
    criticalIssues.push(`${missingContent} lessons with missing/minimal content`);
  }
  
  // Check materials field type issues
  let materialIssues = 0;
  lessons.forEach(l => {
    if (l.materials && typeof l.materials !== 'string') {
      materialIssues++;
    }
  });
  
  if (materialIssues > 0) {
    console.log(`❌ Materials field type issues: ${materialIssues}`);
    criticalIssues.push(`${materialIssues} lessons with non-string materials`);
  }
  
  // 4. UNIT-EXPECTATION MAPPING
  console.log('\n🎯 CURRICULUM MAPPING ISSUES');
  console.log('-'.repeat(50));
  
  const unitsWithoutExpectations = units.filter(u => u.expectations.length === 0);
  if (unitsWithoutExpectations.length > 0) {
    console.log(`❌ Units without curriculum expectations: ${unitsWithoutExpectations.length}`);
    unitsWithoutExpectations.forEach(u => {
      console.log(`   - ${u.title}`);
    });
    criticalIssues.push(`${unitsWithoutExpectations.length} units not mapped to curriculum`);
  }
  
  // Check expectations coverage
  const mappedExpectationIds = new Set();
  units.forEach(u => {
    u.expectations.forEach(e => {
      mappedExpectationIds.add(e.expectationId);
    });
  });
  
  const unmappedExpectations = expectations.filter(e => !mappedExpectationIds.has(e.id));
  if (unmappedExpectations.length > 0) {
    console.log(`❌ Unmapped expectations: ${unmappedExpectations.length}/${expectations.length}`);
    unmappedExpectations.slice(0, 5).forEach(e => {
      console.log(`   - ${e.code}: ${e.description?.substring(0, 50)}...`);
    });
    criticalIssues.push(`${unmappedExpectations.length} expectations not in any unit`);
  }
  
  // 5. UNIT BALANCE
  console.log('\n⚖️ UNIT BALANCE ISSUES');
  console.log('-'.repeat(50));
  
  const lessonCounts = units.map(u => ({
    title: u.title,
    count: u.lessonPlans.length
  })).sort((a, b) => a.count - b.count);
  
  const underloaded = lessonCounts.filter(u => u.count < 15);
  const overloaded = lessonCounts.filter(u => u.count > 30);
  
  if (underloaded.length > 0) {
    console.log(`❌ Underloaded units (<15 lessons): ${underloaded.length}`);
    underloaded.forEach(u => {
      console.log(`   - ${u.title}: ${u.count} lessons`);
    });
    criticalIssues.push(`${underloaded.length} units with too few lessons`);
  }
  
  if (overloaded.length > 0) {
    console.log(`❌ Overloaded units (>30 lessons): ${overloaded.length}`);
    overloaded.forEach(u => {
      console.log(`   - ${u.title}: ${u.count} lessons`);
    });
    criticalIssues.push(`${overloaded.length} units with too many lessons`);
  }
  
  // 6. FRENCH IMMERSION COMPLIANCE
  console.log('\n🇫🇷 FRENCH IMMERSION ISSUES');
  console.log('-'.repeat(50));
  
  // Check for English-only units
  const englishUnits = units.filter(u => {
    const title = u.title.toLowerCase();
    return !title.includes('français') && 
           !title.includes('mathématique') &&
           title.includes('english');
  });
  
  if (englishUnits.length > 2) { // Should have max 1-2 English units in Grade 1 FI
    console.log(`❌ Too many English units: ${englishUnits.length}`);
    englishUnits.forEach(u => {
      console.log(`   - ${u.title}`);
    });
    criticalIssues.push(`${englishUnits.length} English units (max 2 for Grade 1 FI)`);
  }
  
  // 7. ASSESSMENT BALANCE
  console.log('\n📊 ASSESSMENT DISTRIBUTION');
  console.log('-'.repeat(50));
  
  const assessmentCounts = new Map();
  lessons.forEach(l => {
    const type = l.assessmentType || 'None';
    assessmentCounts.set(type, (assessmentCounts.get(type) || 0) + 1);
  });
  
  const diagnosticCount = assessmentCounts.get('Diagnostique') || 0;
  const formativeCount = assessmentCounts.get('Formative') || 0;
  const summativeCount = assessmentCounts.get('Sommative') || 0;
  
  if (diagnosticCount < 20) {
    console.log(`❌ Too few diagnostic assessments: ${diagnosticCount}`);
    criticalIssues.push(`Only ${diagnosticCount} diagnostic assessments`);
  }
  
  if (summativeCount < 32) { // Should have at least 1 per unit
    console.log(`❌ Too few summative assessments: ${summativeCount}`);
    criticalIssues.push(`Only ${summativeCount} summative assessments (need 1+ per unit)`);
  }
  
  // 8. SUBSTITUTE READINESS
  console.log('\n👩‍🏫 SUBSTITUTE TEACHER READINESS');
  console.log('-'.repeat(50));
  
  const notSubFriendly = lessons.filter(l => !l.isSubFriendly);
  const subFriendlyNoNotes = lessons.filter(l => l.isSubFriendly && (!l.subNotes || l.subNotes.length < 10));
  
  console.log(`Not sub-friendly: ${notSubFriendly.length}`);
  console.log(`Sub-friendly without notes: ${subFriendlyNoNotes.length}`);
  
  if (subFriendlyNoNotes.length > 50) {
    criticalIssues.push(`${subFriendlyNoNotes.length} sub-friendly lessons lack notes`);
  }
  
  // 9. DATABASE RELATIONSHIPS
  console.log('\n🔗 DATABASE RELATIONSHIP ISSUES');
  console.log('-'.repeat(50));
  
  // Check for circular references or broken links
  const unitIds = new Set(units.map(u => u.id));
  const brokenUnitRefs = lessons.filter(l => l.unitPlanId && !unitIds.has(l.unitPlanId));
  
  if (brokenUnitRefs.length > 0) {
    console.log(`❌ Lessons with broken unit references: ${brokenUnitRefs.length}`);
    criticalIssues.push(`${brokenUnitRefs.length} lessons with broken unit references`);
  }
  
  // 10. PERFORMANCE CONCERNS
  console.log('\n⚡ PERFORMANCE CONCERNS');
  console.log('-'.repeat(50));
  
  // Check for overly large text fields
  let oversizedContent = 0;
  lessons.forEach(l => {
    const totalSize = (l.mindsOn?.length || 0) + 
                     (l.action?.length || 0) + 
                     (l.consolidation?.length || 0);
    if (totalSize > 5000) {
      oversizedContent++;
    }
  });
  
  if (oversizedContent > 0) {
    console.log(`⚠️ Lessons with excessive content size: ${oversizedContent}`);
    criticalIssues.push(`${oversizedContent} lessons with oversized content`);
  }
  
  // FINAL SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('🚨 CRITICAL ISSUES SUMMARY');
  console.log('='.repeat(70));
  
  if (criticalIssues.length === 0) {
    console.log('✅ NO CRITICAL ISSUES FOUND - SYSTEM IS PERFECT!');
  } else {
    console.log(`\n❌ TOTAL CRITICAL ISSUES: ${criticalIssues.length}`);
    console.log('\nAll Critical Issues:');
    criticalIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    console.log('\n⚠️ SYSTEM REQUIRES SIGNIFICANT IMPROVEMENTS!');
  }
  
  await prisma.$disconnect();
}

comprehensiveSystemAudit().catch(console.error);