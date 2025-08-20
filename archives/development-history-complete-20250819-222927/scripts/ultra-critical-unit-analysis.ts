import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const SCHOOL_START = new Date('2025-09-03');
const HOLIDAYS = [
  { start: new Date('2025-10-13'), end: new Date('2025-10-13') }, // Thanksgiving
  { start: new Date('2025-11-11'), end: new Date('2025-11-11') }, // Remembrance Day
  { start: new Date('2025-12-22'), end: new Date('2026-01-02') }, // Christmas Break
  { start: new Date('2026-02-16'), end: new Date('2026-02-16') }, // Family Day
  { start: new Date('2026-03-09'), end: new Date('2026-03-13') }, // March Break
  { start: new Date('2026-04-10'), end: new Date('2026-04-13') }, // Easter
  { start: new Date('2026-05-18'), end: new Date('2026-05-18') } // Victoria Day
];

function isSchoolDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  // Check holidays
  for (const holiday of HOLIDAYS) {
    if (date >= holiday.start && date <= holiday.end) return false;
  }
  return true;
}

async function ultraCriticalUnitAnalysis() {
  console.log('🔍 ULTRA-CRITICAL UNIT PLAN ANALYSIS\\n');
  console.log('═'.repeat(80));
  console.log('Finding ACTUAL flaws preventing true perfection\\n');
  
  const critical: string[] = [];
  const major: string[] = [];
  const minor: string[] = [];
  
  // Get all LRPs with units
  const allLRPs = await prisma.longRangePlan.findMany({
    where: { userId: 23 },
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    },
    orderBy: { subject: 'asc' }
  });
  
  console.log('📊 CRITICAL FLAW ANALYSIS:\\n');
  
  // CRITICAL CHECK 1: Alternating Schedule Reality
  const socialLRP = allLRPs.find(lrp => lrp.subject.includes('Sciences humaines'));
  const healthLRP = allLRPs.find(lrp => lrp.subject.includes('Formation personnelle'));
  
  if (socialLRP && healthLRP) {
    console.log('🔍 ALTERNATING SCHEDULE ANALYSIS:');
    
    // Check for overlapping dates
    for (const ssUnit of socialLRP.unitPlans) {
      for (const healthUnit of healthLRP.unitPlans) {
        const ssStart = ssUnit.startDate.getTime();
        const ssEnd = ssUnit.endDate.getTime();
        const hStart = healthUnit.startDate.getTime();
        const hEnd = healthUnit.endDate.getTime();
        
        // Check for overlap
        if ((ssStart <= hEnd && ssEnd >= hStart)) {
          critical.push(`❌ CRITICAL: SS Unit "${ssUnit.title}" overlaps with Health Unit "${healthUnit.title}"`);
        }
      }
    }
    
    // Check total calendar days
    let ssTotalCalendarDays = 0;
    let healthTotalCalendarDays = 0;
    
    for (const unit of socialLRP.unitPlans) {
      const days = Math.floor((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      ssTotalCalendarDays += days;
    }
    
    for (const unit of healthLRP.unitPlans) {
      const days = Math.floor((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      healthTotalCalendarDays += days;
    }
    
    console.log(`  📚 SS total calendar days: ${ssTotalCalendarDays} (spans entire year)`);
    console.log(`  🏥 Health total calendar days: ${healthTotalCalendarDays} (spans entire year)`);
    
    if (ssTotalCalendarDays > 150) {
      critical.push(`❌ CRITICAL: Social Studies spans ${ssTotalCalendarDays} calendar days - should be compact periods`);
    }
    
    if (healthTotalCalendarDays > 150) {
      critical.push(`❌ CRITICAL: Health/FPS spans ${healthTotalCalendarDays} calendar days - should be compact periods`);
    }
  }
  
  // CRITICAL CHECK 2: Mathematical Precision
  console.log('\\n🔍 MATHEMATICAL PRECISION ANALYSIS:');
  
  const expectedHours = {
    'Arts visuels': 146.25,
    'Français (Immersion)': 146.25,
    'Mathématiques': 146.25,
    'Sciences de la nature': 146.25,
    'Sciences humaines': 72.75,
    'Formation personnelle et sociale': 73.5
  };
  
  for (const lrp of allLRPs) {
    const totalHours = lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
    const expected = expectedHours[lrp.subject] || 0;
    const gap = Math.abs(totalHours - expected);
    
    console.log(`  ${lrp.subject}: ${totalHours}h (expected: ${expected}h, gap: ${gap}h)`);
    
    if (gap > 0.1) {
      major.push(`⚠️ MAJOR: ${lrp.subject} has ${gap}h gap from expected hours`);
    }
  }
  
  // CRITICAL CHECK 3: Field Completeness Verification
  console.log('\\n🔍 FIELD COMPLETENESS VERIFICATION:');
  
  const requiredFields = [
    'title', 'description', 'bigIdeas', 'essentialQuestions', 
    'assessmentPlan', 'successCriteria', 'differentiationStrategies',
    'indigenousPerspectives', 'keyVocabulary'
  ];
  
  let totalFieldsChecked = 0;
  let completeFieldsFound = 0;
  let incompleteUnits: string[] = [];
  
  for (const lrp of allLRPs) {
    for (const unit of lrp.unitPlans) {
      let unitIncomplete = false;
      
      for (const field of requiredFields) {
        totalFieldsChecked++;
        const value = unit[field as keyof typeof unit];
        
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)) {
          unitIncomplete = true;
          console.log(`    ❌ ${unit.title}: Missing ${field}`);
        } else {
          completeFieldsFound++;
        }
      }
      
      if (unitIncomplete) {
        incompleteUnits.push(`${unit.title} (${lrp.subject})`);
      }
    }
  }
  
  const completeness = Math.round((completeFieldsFound / totalFieldsChecked) * 100);
  console.log(`\\n  📊 Field Completeness: ${completeFieldsFound}/${totalFieldsChecked} (${completeness}%)`);
  
  if (completeness < 100) {
    critical.push(`❌ CRITICAL: Only ${completeness}% field completeness`);
  }
  
  // CRITICAL CHECK 4: Date Range Efficiency
  console.log('\\n🔍 DATE RANGE EFFICIENCY ANALYSIS:');
  
  const schoolYearStart = new Date('2025-09-03');
  const schoolYearEnd = new Date('2026-06-20');
  
  for (const lrp of allLRPs) {
    const isDaily = !lrp.subject.includes('Sciences humaines') && !lrp.subject.includes('Formation personnelle');
    
    if (lrp.unitPlans.length > 0) {
      const firstUnit = lrp.unitPlans[0];
      const lastUnit = lrp.unitPlans[lrp.unitPlans.length - 1];
      
      const daysBefore = Math.floor((firstUnit.startDate.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysAfter = Math.floor((schoolYearEnd.getTime() - lastUnit.endDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`  ${lrp.subject}: Starts ${daysBefore} days after school year, ends ${daysAfter} days before year end`);
      
      if (isDaily && (daysBefore > 1 || daysAfter > 1)) {
        major.push(`⚠️ MAJOR: ${lrp.subject} has ${daysBefore + daysAfter} wasted days`);
      }
    }
  }
  
  // FINAL CRITICAL ASSESSMENT
  console.log('\\n' + '═'.repeat(80));
  console.log('🎯 ULTRA-CRITICAL ASSESSMENT RESULTS\\n');
  
  if (critical.length > 0) {
    console.log('❌ CRITICAL FLAWS PREVENTING PERFECTION:');
    critical.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
  }
  
  if (major.length > 0) {
    console.log('\\n⚠️ MAJOR ISSUES REQUIRING FIXES:');
    major.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
  }
  
  if (minor.length > 0) {
    console.log('\\n💡 MINOR OPTIMIZATIONS:');
    minor.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
  }
  
  const totalIssues = critical.length + major.length + minor.length;
  
  if (totalIssues === 0) {
    console.log('\\n🎉 TRUE PERFECTION VERIFIED!');
    console.log('All unit plans are genuinely perfect for implementation.');
  } else {
    console.log(`\\n🔧 WORK REQUIRED: ${totalIssues} issues found`);
    console.log(`Critical: ${critical.length}, Major: ${major.length}, Minor: ${minor.length}`);
    console.log('\\n📋 NEXT STEPS:');
    console.log('1. Fix critical alternating schedule overlaps');
    console.log('2. Perfect mathematical precision');
    console.log('3. Complete missing fields');
    console.log('4. Optimize date range efficiency');
  }
  
  await prisma.$disconnect();
}

ultraCriticalUnitAnalysis().catch(console.error);