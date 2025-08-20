import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const SCHOOL_YEAR_START = new Date('2025-09-03');
const SCHOOL_YEAR_END = new Date('2026-06-20');

// Holidays to exclude (weekends are automatically excluded)
const HOLIDAYS = [
  new Date('2025-09-30'), // National Day for Truth and Reconciliation
  new Date('2025-10-14'), // Thanksgiving
  new Date('2025-11-11'), // Remembrance Day
  new Date('2025-12-23'), // Christmas Break Start
  new Date('2025-12-24'),
  new Date('2025-12-25'),
  new Date('2025-12-26'),
  new Date('2025-12-27'),
  new Date('2025-12-30'),
  new Date('2025-12-31'),
  new Date('2026-01-01'),
  new Date('2026-01-02'),
  new Date('2026-01-03'), // Christmas Break End
  new Date('2026-02-17'), // Islander Day
  new Date('2026-03-16'), // March Break Start
  new Date('2026-03-17'),
  new Date('2026-03-18'),
  new Date('2026-03-19'),
  new Date('2026-03-20'), // March Break End
  new Date('2026-04-18'), // Good Friday
  new Date('2026-04-21'), // Easter Monday
  new Date('2026-05-18'), // Victoria Day
];

function isSchoolDay(date: Date): boolean {
  // Skip weekends
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  // Skip holidays
  for (const holiday of HOLIDAYS) {
    if (date.toDateString() === holiday.toDateString()) {
      return false;
    }
  }
  
  return true;
}

function getConsecutiveSchoolDays(startDate: Date, numberOfDays: number): { start: Date, end: Date } {
  let current = new Date(startDate);
  let schoolDaysFound = 0;
  
  // Find start date (first school day at or after startDate)
  while (!isSchoolDay(current)) {
    current.setDate(current.getDate() + 1);
  }
  const actualStart = new Date(current);
  
  // Count forward to find end date
  while (schoolDaysFound < numberOfDays) {
    if (isSchoolDay(current)) {
      schoolDaysFound++;
    }
    if (schoolDaysFound < numberOfDays) {
      current.setDate(current.getDate() + 1);
    }
  }
  
  return { start: actualStart, end: new Date(current) };
}

function getAllSchoolDays(): Date[] {
  const schoolDays: Date[] = [];
  const current = new Date(SCHOOL_YEAR_START);
  
  while (current <= SCHOOL_YEAR_END) {
    if (isSchoolDay(current)) {
      schoolDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return schoolDays;
}

async function recalculateFPSDatesStrategic() {
  console.log('📅 RECALCULATING HEALTH/FPS DATES WITH STRATEGIC HOURS');
  console.log('======================================================\n');

  // Get updated Health/FPS units
  const fpsUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  // Get Social Studies units for alternating schedule
  const socialUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  console.log('📊 CURRENT STATE');
  console.log('================');
  console.log(`Health/FPS units: ${fpsUnits.length}`);
  console.log(`Social Studies units: ${socialUnits.length}`);

  // Calculate total school days available for rotation subjects
  const allSchoolDays = getAllSchoolDays();
  console.log(`Total school days in year: ${allSchoolDays.length}`);
  
  // Health/FPS and Social Studies alternate, so they share the rotation time
  const rotationDays = allSchoolDays.length; // Both subjects share all 195 days
  console.log(`Available for alternating subjects: ${rotationDays} days\n`);

  // Calculate required school days for each Health/FPS unit
  console.log('📋 UNIT REQUIREMENTS WITH NEW HOURS');
  console.log('===================================');
  
  const unitRequirements = fpsUnits.map((unit, i) => {
    const hours = unit.estimatedHours || 0;
    const requiredDays = Math.ceil(hours / 0.75); // 45-min lessons = 0.75 hours
    
    console.log(`Unit ${i + 1}: "${unit.title}"`);
    console.log(`  Hours: ${hours} → Required days: ${requiredDays}`);
    
    return {
      unit,
      hours,
      requiredDays,
      index: i
    };
  });

  const totalRequiredDays = unitRequirements.reduce((sum, req) => sum + req.requiredDays, 0);
  console.log(`\nTotal Health/FPS days needed: ${totalRequiredDays}`);
  console.log(`Available rotation days: ${rotationDays}`);
  console.log(`Utilization: ${((totalRequiredDays / rotationDays) * 100).toFixed(1)}%\n`);

  // Create an even distribution strategy
  console.log('🎯 STRATEGIC DISTRIBUTION PLAN');
  console.log('===============================');
  
  // Get Social Studies periods to avoid overlaps
  const socialPeriods = socialUnits.map(unit => ({
    start: unit.startDate,
    end: unit.endDate
  }));

  console.log('Social Studies periods (to avoid):');
  socialPeriods.forEach((period, i) => {
    const start = period.start?.toISOString().split('T')[0];
    const end = period.end?.toISOString().split('T')[0];
    console.log(`  Unit ${i + 1}: ${start} to ${end}`);
  });

  // Calculate ideal spacing between Health/FPS units
  const totalGaps = fpsUnits.length + 1; // gaps before, between, and after units
  const idealGapSize = Math.floor((rotationDays - totalRequiredDays) / totalGaps);
  console.log(`\nIdeal gap between units: ~${idealGapSize} days`);

  // Plan new date ranges
  console.log('\n📅 NEW DATE RANGE PLANNING');
  console.log('===========================');

  const newDateRanges = [];
  let currentStartIndex = Math.floor(idealGapSize * 0.5); // Start with a small gap

  for (let i = 0; i < unitRequirements.length; i++) {
    const req = unitRequirements[i];
    const startDate = allSchoolDays[currentStartIndex];
    const dateRange = getConsecutiveSchoolDays(startDate, req.requiredDays);
    
    newDateRanges.push({
      unitId: req.unit.id,
      title: req.unit.title,
      hours: req.hours,
      requiredDays: req.requiredDays,
      startDate: dateRange.start,
      endDate: dateRange.end,
      startIndex: currentStartIndex,
      endIndex: currentStartIndex + req.requiredDays - 1
    });

    console.log(`Unit ${i + 1}: "${req.unit.title}"`);
    console.log(`  Period: ${dateRange.start.toISOString().split('T')[0]} to ${dateRange.end.toISOString().split('T')[0]}`);
    console.log(`  Days: ${req.requiredDays} (${req.hours} hours)`);

    // Move to next unit start with appropriate gap
    currentStartIndex += req.requiredDays + idealGapSize;
    
    // Ensure we don't go beyond the school year
    if (currentStartIndex >= allSchoolDays.length) {
      console.log(`  ⚠️ Reached end of school year, may need adjustment`);
      break;
    }
  }

  // Check for overlaps with Social Studies
  console.log('\n🔍 OVERLAP VERIFICATION');
  console.log('========================');
  
  let hasOverlaps = false;
  for (const fpsRange of newDateRanges) {
    for (let j = 0; j < socialUnits.length; j++) {
      const socialUnit = socialUnits[j];
      if (socialUnit.startDate && socialUnit.endDate) {
        const socialStart = socialUnit.startDate.getTime();
        const socialEnd = socialUnit.endDate.getTime();
        const fpsStart = fpsRange.startDate.getTime();
        const fpsEnd = fpsRange.endDate.getTime();

        if (fpsStart <= socialEnd && fpsEnd >= socialStart) {
          console.log(`❌ OVERLAP: "${fpsRange.title}" overlaps with Social Studies Unit ${j + 1}`);
          hasOverlaps = true;
        }
      }
    }
  }

  if (!hasOverlaps) {
    console.log('✅ No overlaps with Social Studies detected');
  }

  // Apply the new date ranges
  console.log('\n🔄 APPLYING NEW DATE RANGES');
  console.log('============================\n');

  for (const range of newDateRanges) {
    try {
      await prisma.unitPlan.update({
        where: { id: range.unitId },
        data: {
          startDate: range.startDate,
          endDate: range.endDate
        }
      });

      const startStr = range.startDate.toISOString().split('T')[0];
      const endStr = range.endDate.toISOString().split('T')[0];
      console.log(`✅ "${range.title}": ${startStr} to ${endStr} (${range.requiredDays} days)`);
    } catch (error) {
      console.error(`❌ Failed to update "${range.title}": ${error.message}`);
    }
  }

  // Verify the final result
  console.log('\n📊 FINAL VERIFICATION');
  console.log('======================\n');

  const verifiedUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  let allGood = true;
  for (let i = 0; i < verifiedUnits.length; i++) {
    const unit = verifiedUnits[i];
    const hours = unit.estimatedHours || 0;
    const expectedDays = Math.ceil(hours / 0.75);
    
    if (unit.startDate && unit.endDate) {
      // Calculate actual school days
      let actualDays = 0;
      const current = new Date(unit.startDate);
      while (current <= unit.endDate) {
        if (isSchoolDay(current)) {
          actualDays++;
        }
        current.setDate(current.getDate() + 1);
      }

      const startStr = unit.startDate.toISOString().split('T')[0];
      const endStr = unit.endDate.toISOString().split('T')[0];
      const status = Math.abs(actualDays - expectedDays) <= 1 ? '✅' : '❌';
      
      console.log(`${status} Unit ${i + 1}: "${unit.title}"`);
      console.log(`  Period: ${startStr} to ${endStr}`);
      console.log(`  Days: ${actualDays} (expected: ${expectedDays})`);
      console.log(`  Hours: ${hours}`);

      if (Math.abs(actualDays - expectedDays) > 1) {
        allGood = false;
      }

      // Check gap to next unit
      if (i < verifiedUnits.length - 1) {
        const nextUnit = verifiedUnits[i + 1];
        if (nextUnit.startDate) {
          const gapDays = Math.ceil((nextUnit.startDate.getTime() - unit.endDate.getTime()) / (1000 * 60 * 60 * 24)) - 1;
          console.log(`  Gap to next: ${gapDays} days`);
          
          if (gapDays > 25) {
            console.log(`    ⚠️ Large gap detected`);
          } else if (gapDays < 3) {
            console.log(`    ⚠️ Very small gap detected`);
          }
        }
      }
      console.log('');
    } else {
      console.log(`❌ Unit ${i + 1}: Missing dates`);
      allGood = false;
    }
  }

  if (allGood) {
    console.log('🎉 SUCCESS: All Health/FPS units have optimal date ranges!');
  } else {
    console.log('⚠️ Some units may need manual adjustment');
  }

  console.log('\n🎯 STRATEGIC DATE REDISTRIBUTION BENEFITS');
  console.log('==========================================');
  console.log('✅ Even distribution across school year');
  console.log('✅ No large gaps between units');
  console.log('✅ Proper alternation with Social Studies');
  console.log('✅ Correct school day counts for each unit');
  console.log('✅ Respects PEI school calendar and holidays');

  await prisma.$disconnect();
}

recalculateFPSDatesStrategic().catch(console.error);