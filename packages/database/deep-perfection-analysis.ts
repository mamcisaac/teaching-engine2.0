import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepPerfectionAnalysis() {
  console.log('🔬 DEEP PERFECTION ANALYSIS - CRITICAL ISSUES IDENTIFICATION');
  console.log('='.repeat(70));
  
  const lessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true },
    orderBy: { date: 'asc' }
  });
  
  const units = await prisma.unitPlan.findMany({
    orderBy: { startDate: 'asc' }
  });
  
  const issues: string[] = [];
  
  // 1. PEI SCHOOL CALENDAR ALIGNMENT
  console.log('\n📅 PEI SCHOOL CALENDAR 2025-2026 VIOLATIONS');
  console.log('-'.repeat(50));
  
  // PEI holidays and breaks
  const peiHolidays = [
    // December break
    ...getDatesInRange('2025-12-20', '2026-01-04'),
    // March break  
    ...getDatesInRange('2026-03-09', '2026-03-13'),
    // Easter Monday
    '2026-04-13',
    // PEI Professional Days (typical)
    '2025-10-10', // October PD
    '2025-11-07', // November PD
    '2026-02-27', // February PD
    '2026-05-01', // May PD
  ];
  
  const lessonsOnHolidays = lessons.filter(lesson => {
    const dateStr = lesson.date.toISOString().substring(0, 10);
    return peiHolidays.includes(dateStr);
  });
  
  if (lessonsOnHolidays.length > 0) {
    console.log(`❌ ${lessonsOnHolidays.length} lessons scheduled on holidays/breaks!`);
    lessonsOnHolidays.slice(0, 5).forEach(lesson => {
      const date = lesson.date.toISOString().substring(0, 10);
      console.log(`   - ${date}: "${lesson.title}"`);
      issues.push(`Lesson on holiday: ${date}`);
    });
  }
  
  // 2. DAILY TEACHING LOAD ANALYSIS
  console.log('\n⏰ DAILY TEACHING LOAD ISSUES');
  console.log('-'.repeat(50));
  
  const lessonsByDate = new Map();
  lessons.forEach(lesson => {
    const dateStr = lesson.date.toISOString().substring(0, 10);
    if (!lessonsByDate.has(dateStr)) {
      lessonsByDate.set(dateStr, []);
    }
    lessonsByDate.get(dateStr).push(lesson);
  });
  
  let overloadedDays = 0;
  let totalMinutesExcessive = 0;
  
  lessonsByDate.forEach((dayLessons, date) => {
    const totalMinutes = dayLessons.reduce((sum, l) => sum + l.duration, 0);
    
    // Grade 1 should have max 300 minutes instructional time
    if (totalMinutes > 300) {
      overloadedDays++;
      totalMinutesExcessive += totalMinutes;
      if (overloadedDays <= 3) {
        console.log(`❌ ${date}: ${totalMinutes} minutes (${dayLessons.length} lessons)`);
        issues.push(`Overloaded day: ${date} with ${totalMinutes} minutes`);
      }
    }
  });
  
  if (overloadedDays > 0) {
    console.log(`\n❌ Total overloaded days: ${overloadedDays}`);
  }
  
  // 3. FRENCH IMMERSION LANGUAGE BALANCE
  console.log('\n🇫🇷 FRENCH IMMERSION LANGUAGE ISSUES');
  console.log('-'.repeat(50));
  
  let frenchLessons = 0;
  let englishLessons = 0;
  let mixedLessons = 0;
  
  lessons.forEach(lesson => {
    const content = (lesson.mindsOn + ' ' + lesson.action + ' ' + lesson.consolidation).toLowerCase();
    const hasFrench = /[àâäæçéèêëïîôùûüÿœ]/.test(content) || content.includes('français');
    const hasEnglish = content.includes('english') || content.includes('the ') || content.includes(' is ');
    
    if (hasFrench && !hasEnglish) frenchLessons++;
    else if (hasEnglish && !hasFrench) englishLessons++;
    else mixedLessons++;
  });
  
  const frenchPercentage = (frenchLessons / lessons.length * 100).toFixed(1);
  const englishPercentage = (englishLessons / lessons.length * 100).toFixed(1);
  
  console.log(`French lessons: ${frenchLessons} (${frenchPercentage}%)`);
  console.log(`English lessons: ${englishLessons} (${englishPercentage}%)`);
  console.log(`Mixed/Unclear: ${mixedLessons}`);
  
  // PEI French Immersion should be 80%+ French in Grade 1
  if (parseFloat(frenchPercentage) < 80) {
    console.log(`\n❌ CRITICAL: Only ${frenchPercentage}% French content (should be 80%+)`);
    issues.push(`Insufficient French content: ${frenchPercentage}%`);
  }
  
  // 4. CURRICULUM EXPECTATION COVERAGE
  console.log('\n📚 CURRICULUM EXPECTATION GAPS');
  console.log('-'.repeat(50));
  
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { grade: 1 }
  });
  
  const expectationCoverage = new Map();
  expectations.forEach(exp => {
    expectationCoverage.set(exp.code, 0);
  });
  
  // Check which expectations are addressed in lessons
  lessons.forEach(lesson => {
    const content = (lesson.learningGoals + ' ' + lesson.action).toLowerCase();
    expectations.forEach(exp => {
      if (content.includes(exp.code.toLowerCase()) || 
          (exp.description && content.includes(exp.description.toLowerCase().substring(0, 20)))) {
        expectationCoverage.set(exp.code, expectationCoverage.get(exp.code) + 1);
      }
    });
  });
  
  const uncoveredExpectations = Array.from(expectationCoverage.entries())
    .filter(([code, count]) => count === 0);
  
  if (uncoveredExpectations.length > 0) {
    console.log(`❌ ${uncoveredExpectations.length} curriculum expectations never addressed!`);
    uncoveredExpectations.slice(0, 5).forEach(([code]) => {
      console.log(`   - ${code}`);
      issues.push(`Uncovered expectation: ${code}`);
    });
  }
  
  // 5. UNIT TIMING AND SEQUENCE ISSUES
  console.log('\n⏳ UNIT TIMING & SEQUENCE PROBLEMS');
  console.log('-'.repeat(50));
  
  units.forEach(unit => {
    const unitLessons = lessons.filter(l => l.unitPlan.title === unit.title);
    
    if (unitLessons.length === 0) {
      console.log(`❌ Unit "${unit.title}" has NO lessons!`);
      issues.push(`Empty unit: ${unit.title}`);
      return;
    }
    
    const unitStart = new Date(Math.min(...unitLessons.map(l => l.date.getTime())));
    const unitEnd = new Date(Math.max(...unitLessons.map(l => l.date.getTime())));
    
    // Check if unit dates match planned dates
    if (unitStart < unit.startDate) {
      console.log(`❌ Unit "${unit.title}" starts before planned date`);
      issues.push(`Unit timing mismatch: ${unit.title}`);
    }
    
    if (unitEnd > unit.endDate) {
      console.log(`❌ Unit "${unit.title}" extends beyond planned end date`);
      issues.push(`Unit overrun: ${unit.title}`);
    }
  });
  
  // 6. ASSESSMENT CONSISTENCY ISSUES
  console.log('\n📊 ASSESSMENT INCONSISTENCIES');
  console.log('-'.repeat(50));
  
  const assessmentTypes = new Set();
  lessons.forEach(l => assessmentTypes.add(l.assessmentType));
  
  const similarAssessments = [
    ['Formative', 'formative'],
    ['Diagnostic', 'Diagnostique'],
    ['Summative', 'Sommative'],
  ];
  
  similarAssessments.forEach(([type1, type2]) => {
    if (assessmentTypes.has(type1) && assessmentTypes.has(type2)) {
      console.log(`❌ Duplicate assessment types: "${type1}" and "${type2}"`);
      issues.push(`Duplicate assessment type: ${type1}/${type2}`);
    }
  });
  
  // 7. SUBSTITUTE TEACHER READINESS
  console.log('\n👩‍🏫 SUBSTITUTE TEACHER ISSUES');
  console.log('-'.repeat(50));
  
  const notSubFriendly = lessons.filter(l => !l.isSubFriendly);
  const subFriendlyWithoutNotes = lessons.filter(l => l.isSubFriendly && (!l.subNotes || l.subNotes.length < 20));
  
  if (notSubFriendly.length > 100) {
    console.log(`❌ ${notSubFriendly.length} lessons not substitute-friendly (too many!)`);
    issues.push(`Too many non-sub-friendly lessons: ${notSubFriendly.length}`);
  }
  
  if (subFriendlyWithoutNotes.length > 0) {
    console.log(`❌ ${subFriendlyWithoutNotes.length} "sub-friendly" lessons lack adequate notes`);
    issues.push(`Sub-friendly lessons without notes: ${subFriendlyWithoutNotes.length}`);
  }
  
  // FINAL SUMMARY
  console.log('\n' + '='.repeat(70));
  console.log('🚨 CRITICAL ISSUES SUMMARY');
  console.log('='.repeat(70));
  
  if (issues.length === 0) {
    console.log('✅ NO CRITICAL ISSUES FOUND - SYSTEM IS PERFECT!');
  } else {
    console.log(`\n❌ TOTAL CRITICAL ISSUES: ${issues.length}`);
    console.log('\nTop Issues:');
    issues.slice(0, 10).forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);
    });
    
    console.log('\n⚠️  SYSTEM IS NOT PERFECT - REQUIRES IMMEDIATE ATTENTION!');
  }
  
  await prisma.$disconnect();
}

function getDatesInRange(start: string, end: string): string[] {
  const dates = [];
  const current = new Date(start);
  const endDate = new Date(end);
  
  while (current <= endDate) {
    dates.push(current.toISOString().substring(0, 10));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

deepPerfectionAnalysis().catch(console.error);