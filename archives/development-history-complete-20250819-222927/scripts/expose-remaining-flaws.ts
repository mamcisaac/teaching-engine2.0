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
  
  for (const holiday of HOLIDAYS) {
    if (date >= holiday.start && date <= holiday.end) return false;
  }
  return true;
}

function countSchoolDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    if (isSchoolDay(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

async function exposeRemainingFlaws() {
  console.log('🔍 EXPOSING FLAWS IN MY CLAIMED "PERFECT" UNIT PLANS\\n');
  console.log('═'.repeat(80));
  console.log('Being brutally honest about remaining issues\\n');
  
  const critical: string[] = [];
  const major: string[] = [];
  const hidden: string[] = [];
  
  try {
    // CRITICAL FLAW CHECK 1: Verify my hour precision claims
    console.log('🔢 FLAW CHECK 1: MATHEMATICAL PRECISION CLAIMS\\n');
    
    const allLRPs = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      include: {
        unitPlans: {
          orderBy: { startDate: 'asc' }
        }
      },
      orderBy: { subject: 'asc' }
    });
    
    const expectedHours = {
      'Arts visuels': 146.25,
      'Français (Immersion)': 146.25,
      'Mathématiques': 146.25,
      'Sciences de la nature': 146.25,
      'Sciences humaines': 72.75,
      'Formation personnelle et sociale': 73.5
    };
    
    for (const lrp of allLRPs) {
      const actualTotal = lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      const expected = expectedHours[lrp.subject] || 0;
      const gap = Math.abs(actualTotal - expected);
      
      console.log(`${lrp.subject}: ${actualTotal}h (expected: ${expected}h)`);
      
      if (gap > 0.01) {
        critical.push(`❌ CRITICAL: ${lrp.subject} has ${gap}h gap - NOT mathematically perfect`);
      }
      
      // Check individual unit hours for inconsistencies
      const hours = lrp.unitPlans.map(u => u.estimatedHours || 0);
      const uniqueHours = [...new Set(hours)];
      if (uniqueHours.length > 2 && lrp.unitPlans.length === 10) {
        major.push(`⚠️ MAJOR: ${lrp.subject} has inconsistent unit hours: ${uniqueHours.join(', ')}`);
      }
    }
    
    // CRITICAL FLAW CHECK 2: Alternating schedule implementation reality
    console.log('\\n🗓️ FLAW CHECK 2: ALTERNATING SCHEDULE IMPLEMENTATION\\n');
    
    const ssUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    const healthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Check if alternating periods make pedagogical sense
    for (let i = 0; i < ssUnits.length; i++) {
      const unit = ssUnits[i];
      const schoolDays = countSchoolDays(unit.startDate, unit.endDate);
      const calendarDays = Math.floor((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log(`SS Unit ${i+1}: ${schoolDays} school days across ${calendarDays} calendar days`);
      
      // Critical: If unit spans many weeks but only teaches few days, it\\'s pedagogically broken
      if (calendarDays > 30 && schoolDays < 25) {
        critical.push(`❌ CRITICAL: SS Unit ${i+1} spans ${calendarDays} calendar days but only ${schoolDays} school days - pedagogically broken`);
      }
      
      // Major: Units should have reasonable gaps between them
      if (i < ssUnits.length - 1) {
        const nextUnit = ssUnits[i + 1];
        const gapDays = Math.floor((nextUnit.startDate.getTime() - unit.endDate.getTime()) / (1000 * 60 * 60 * 24));
        if (gapDays > 30) {
          major.push(`⚠️ MAJOR: ${gapDays}-day gap between SS Unit ${i+1} and ${i+2} - too long for continuity`);
        }
      }
    }
    
    for (let i = 0; i < healthUnits.length; i++) {
      const unit = healthUnits[i];
      const schoolDays = countSchoolDays(unit.startDate, unit.endDate);
      const calendarDays = Math.floor((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log(`Health Unit ${i+1}: ${schoolDays} school days across ${calendarDays} calendar days`);
      
      if (calendarDays > 30 && schoolDays < 25) {
        critical.push(`❌ CRITICAL: Health Unit ${i+1} spans ${calendarDays} calendar days but only ${schoolDays} school days - pedagogically broken`);
      }
    }
    
    // CRITICAL FLAW CHECK 3: Implementation feasibility
    console.log('\\n🎯 FLAW CHECK 3: ACTUAL IMPLEMENTATION FEASIBILITY\\n');
    
    // Check if Emily can actually follow this schedule
    const ssStart = ssUnits[0]?.startDate;
    const healthStart = healthUnits[0]?.startDate;
    
    if (ssStart && healthStart) {
      const daysDifference = Math.floor((healthStart.getTime() - ssStart.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`First SS unit starts: ${ssStart.toISOString().split('T')[0]}`);
      console.log(`First Health unit starts: ${healthStart.toISOString().split('T')[0]} (${daysDifference} days later)`);
      
      if (daysDifference > 30) {
        critical.push(`❌ CRITICAL: Health/FPS starts ${daysDifference} days after SS - massive implementation gap`);
      }
      
      // Check if this creates an impossible schedule
      let currentMode = 'none';
      let inconsistencies = 0;
      
      for (const unit of [...ssUnits, ...healthUnits].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())) {
        const isSSUnit = ssUnits.includes(unit);
        const expectedMode = isSSUnit ? 'SS' : 'Health';
        
        if (currentMode !== 'none' && currentMode === expectedMode) {
          inconsistencies++;
        }
        currentMode = expectedMode;
      }
      
      if (inconsistencies > 0) {
        critical.push(`❌ CRITICAL: ${inconsistencies} schedule inconsistencies - units don\\'t alternate properly`);
      }
    }
    
    // CRITICAL FLAW CHECK 4: Hidden missing requirements
    console.log('\\n🔍 FLAW CHECK 4: HIDDEN REQUIREMENTS CHECK\\n');
    
    // Check for lesson plans (the elephant in the room)
    const lessonCount = await prisma.eTFOLessonPlan.count({
      where: { userId: 23 }
    });
    
    console.log(`Lesson plans in database: ${lessonCount}`);
    console.log(`Required lesson plans: 975`);
    
    if (lessonCount === 0) {
      hidden.push(`🐘 HIDDEN FLAW: 0/975 lesson plans exist - Emily CANNOT actually teach`);
    }
    
    // Check if unit dates span correctly across school year
    const allUnits = allLRPs.flatMap(lrp => lrp.unitPlans);
    const firstUnit = allUnits.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];
    const lastUnit = allUnits.sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];
    
    if (firstUnit && lastUnit) {
      const actualStart = firstUnit.startDate;
      const actualEnd = lastUnit.endDate;
      const expectedStart = SCHOOL_START;
      const expectedEnd = new Date('2026-06-20');
      
      const startGap = Math.abs(actualStart.getTime() - expectedStart.getTime()) / (1000 * 60 * 60 * 24);
      const endGap = Math.abs(actualEnd.getTime() - expectedEnd.getTime()) / (1000 * 60 * 60 * 24);
      
      if (startGap > 5) {
        major.push(`⚠️ MAJOR: Units start ${Math.floor(startGap)} days from school year start`);
      }
      if (endGap > 5) {
        major.push(`⚠️ MAJOR: Units end ${Math.floor(endGap)} days from school year end`);
      }
    }
    
    // FINAL BRUTAL ASSESSMENT
    console.log('\\n' + '═'.repeat(80));
    console.log('🎯 BRUTAL HONESTY: FLAWS EXPOSED\\n');
    
    const totalIssues = critical.length + major.length + hidden.length;
    
    if (totalIssues === 0) {
      console.log('🎉 VALIDATION: Unit plans are genuinely perfect');
      console.log('No hidden flaws discovered - implementation ready');
    } else {
      console.log(`❌ BRUTAL TRUTH: ${totalIssues} issues prevent true perfection\\n`);
      
      if (critical.length > 0) {
        console.log('🚨 CRITICAL FLAWS:');
        critical.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
      }
      
      if (major.length > 0) {
        console.log('\\n⚠️ MAJOR ISSUES:');
        major.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
      }
      
      if (hidden.length > 0) {
        console.log('\\n🔍 HIDDEN FLAWS:');
        hidden.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
      }
      
      console.log('\\n💡 REALITY CHECK:');
      console.log('Previous claims of "perfection" were premature.');
      console.log('True perfection requires addressing ALL issues above.');
    }
    
  } catch (error) {
    console.error('❌ Error during flaw analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exposeRemainingFlaws().catch(console.error);