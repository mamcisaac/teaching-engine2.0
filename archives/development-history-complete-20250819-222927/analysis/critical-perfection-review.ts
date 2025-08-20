import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalPerfectionReview() {
  console.log('🔍 CRITICAL PERFECTION REVIEW\n');
  console.log('═'.repeat(80));
  console.log('Analyzing Emily\'s Grade 1 French Immersion System for TRUE perfection\n');
  
  const issues: string[] = [];
  const critical: string[] = [];
  
  // Get all unit plans
  const allUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        userId: 23
      }
    },
    include: {
      longRangePlan: true
    },
    orderBy: [
      { longRangePlan: { subject: 'asc' } },
      { startDate: 'asc' }
    ]
  });
  
  console.log(`📚 Analyzing ${allUnits.length} units across all subjects\n`);
  
  // Group by subject
  const unitsBySubject = allUnits.reduce((acc, unit) => {
    const subject = unit.longRangePlan.subject;
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(unit);
    return acc;
  }, {} as Record<string, typeof allUnits>);
  
  // CRITICAL CHECK 1: Alternating Schedule
  console.log('═══ CHECK 1: ALTERNATING SCHEDULE ═══\n');
  
  const socialStudiesUnits = unitsBySubject['Sciences humaines'] || [];
  const healthUnits = unitsBySubject['Formation personnelle et sociale'] || [];
  
  // Count actual school days for alternating subjects
  function countSchoolDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Not weekend
        // Check if it's a holiday
        const dateStr = current.toISOString().split('T')[0];
        const isHoliday = [
          '2025-10-13', '2025-11-11', 
          '2025-12-22', '2025-12-23', '2025-12-24', '2025-12-25', '2025-12-26',
          '2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02',
          '2026-02-16', '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13',
          '2026-04-10', '2026-04-13', '2026-05-18'
        ].includes(dateStr);
        
        if (!isHoliday) count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
  
  // Check Social Studies
  let ssTotalDays = 0;
  socialStudiesUnits.forEach((unit, i) => {
    const days = countSchoolDays(unit.startDate, unit.endDate);
    ssTotalDays += days;
    console.log(`SS Unit ${i+1}: ${days} school days (${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]})`);
  });
  
  if (Math.abs(ssTotalDays - 97) > 5) {
    critical.push(`❌ CRITICAL: Social Studies has ${ssTotalDays} days but should have ~97 (alternating)`);
  }
  
  // Check Health/FPS
  let healthTotalDays = 0;
  healthUnits.forEach((unit, i) => {
    const days = countSchoolDays(unit.startDate, unit.endDate);
    healthTotalDays += days;
    console.log(`Health Unit ${i+1}: ${days} school days (${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]})`);
  });
  
  if (Math.abs(healthTotalDays - 98) > 5) {
    critical.push(`❌ CRITICAL: Health/FPS has ${healthTotalDays} days but should have ~98 (alternating)`);
  }
  
  if (healthUnits.length !== 6) {
    critical.push(`❌ CRITICAL: Health/FPS has ${healthUnits.length} units but needs 6`);
  }
  
  // CRITICAL CHECK 2: Daily Subjects Sequential Flow
  console.log('\n═══ CHECK 2: DAILY SUBJECTS SEQUENTIAL FLOW ═══\n');
  
  const dailySubjects = ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature', 'Arts visuels'];
  
  for (const subject of dailySubjects) {
    const units = unitsBySubject[subject] || [];
    let totalDays = 0;
    
    for (let i = 0; i < units.length - 1; i++) {
      const current = units[i];
      const next = units[i + 1];
      
      // Check for gaps
      const currentEnd = current.endDate;
      const nextStart = next.startDate;
      const daysBetween = Math.floor((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetween > 4) { // Allow for weekend
        issues.push(`⚠️ ${subject}: ${daysBetween}-day gap between Unit ${i+1} and Unit ${i+2}`);
      }
      
      totalDays += countSchoolDays(current.startDate, current.endDate);
    }
    
    // Add last unit
    if (units.length > 0) {
      totalDays += countSchoolDays(units[units.length - 1].startDate, units[units.length - 1].endDate);
    }
    
    console.log(`${subject}: ${totalDays} total school days (expected: 195)`);
    
    if (Math.abs(totalDays - 195) > 2) {
      critical.push(`❌ ${subject} has ${totalDays} days but should have 195`);
    }
  }
  
  // CRITICAL CHECK 3: Content Quality
  console.log('\n═══ CHECK 3: CONTENT QUALITY ═══\n');
  
  let contentIssues = 0;
  
  for (const unit of allUnits) {
    // Check big ideas length
    if (!unit.bigIdeas || unit.bigIdeas.length < 75) {
      contentIssues++;
      issues.push(`Content: ${unit.title} has short/missing big ideas (${unit.bigIdeas?.length || 0} chars)`);
    }
    
    // Check essential questions format
    if (!Array.isArray(unit.essentialQuestions)) {
      contentIssues++;
      issues.push(`Format: ${unit.title} essential questions not an array`);
    }
    
    // Check success criteria format
    if (!unit.successCriteria || typeof unit.successCriteria !== 'object') {
      contentIssues++;
      issues.push(`Format: ${unit.title} success criteria not an object`);
    } else {
      const criteria = unit.successCriteria as any;
      if (!criteria.beginning || !criteria.developing || !criteria.proficient || !criteria.extending) {
        contentIssues++;
        issues.push(`Format: ${unit.title} missing success criteria levels`);
      }
    }
    
    // Check vocabulary format
    if (unit.keyVocabulary && !Array.isArray(unit.keyVocabulary)) {
      contentIssues++;
      issues.push(`Format: ${unit.title} vocabulary not an array`);
    }
  }
  
  console.log(`Content Quality Issues Found: ${contentIssues}`);
  
  // CRITICAL CHECK 4: Mathematical Precision
  console.log('\n═══ CHECK 4: MATHEMATICAL PRECISION ═══\n');
  
  const expectedHours = {
    'Français (Immersion)': 146.25,
    'Mathématiques': 146.25,
    'Sciences de la nature': 146.25,
    'Arts visuels': 146.25,
    'Sciences humaines': 72.75,
    'Formation personnelle et sociale': 73.5
  };
  
  for (const [subject, units] of Object.entries(unitsBySubject)) {
    const totalHours = units.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const expected = expectedHours[subject] || 0;
    
    console.log(`${subject}: ${totalHours} hours (expected: ${expected})`);
    
    if (Math.abs(totalHours - expected) > 2) {
      issues.push(`Hours: ${subject} has ${totalHours} hours but should have ${expected}`);
    }
  }
  
  // CRITICAL CHECK 5: Date Range Validity
  console.log('\n═══ CHECK 5: DATE RANGE VALIDITY ═══\n');
  
  const schoolStart = new Date('2025-09-03');
  const schoolEnd = new Date('2026-06-20');
  
  for (const unit of allUnits) {
    if (unit.startDate < schoolStart) {
      critical.push(`❌ ${unit.title} starts before school year: ${unit.startDate.toISOString().split('T')[0]}`);
    }
    if (unit.endDate > schoolEnd) {
      critical.push(`❌ ${unit.title} ends after school year: ${unit.endDate.toISOString().split('T')[0]}`);
    }
    
    // Check if dates span holidays incorrectly
    const christmas = new Date('2025-12-25');
    if (unit.startDate < christmas && unit.endDate > christmas) {
      const daysDiff = Math.floor((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        issues.push(`Holiday: ${unit.title} incorrectly spans Christmas break`);
      }
    }
  }
  
  // FINAL REPORT
  console.log('\n' + '═'.repeat(80));
  console.log('📊 CRITICAL REVIEW SUMMARY\n');
  
  if (critical.length === 0 && issues.length === 0) {
    console.log('✅ PERFECT! No issues found.');
    console.log('The system is truly perfect and ready for implementation.');
  } else {
    if (critical.length > 0) {
      console.log('❌ CRITICAL ISSUES THAT MUST BE FIXED:\n');
      critical.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️ MINOR ISSUES TO ADDRESS:\n');
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('The alternating schedule implementation is incorrect.');
    console.log('Social Studies and Health/FPS should only count days they actually teach.');
    console.log('They should NOT have date ranges spanning 189 days.');
  }
  
  await prisma.$disconnect();
}

criticalPerfectionReview().catch(console.error);