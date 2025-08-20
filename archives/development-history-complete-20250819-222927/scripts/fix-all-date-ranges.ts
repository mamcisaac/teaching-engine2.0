import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const holidays = [
  // Weekends are handled separately
  new Date('2025-10-13'), // Thanksgiving
  new Date('2025-11-11'), // Remembrance Day
  // Christmas Break
  ...dateRange(new Date('2025-12-22'), new Date('2026-01-02')),
  // March Break
  ...dateRange(new Date('2026-03-09'), new Date('2026-03-13')),
  // Easter
  ...dateRange(new Date('2026-04-10'), new Date('2026-04-13')),
  new Date('2026-05-18'), // Victoria Day
];

function dateRange(start: Date, end: Date): Date[] {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function isSchoolDay(date: Date): boolean {
  // Not a weekend
  if (date.getDay() === 0 || date.getDay() === 6) return false;
  
  // Not a holiday
  for (const holiday of holidays) {
    if (date.toDateString() === holiday.toDateString()) return false;
  }
  
  return true;
}

function getConsecutiveSchoolDays(startDate: Date, numberOfDays: number): { start: Date, end: Date } {
  const start = new Date(startDate);
  const end = new Date(startDate);
  
  let daysFound = 1; // Start date counts as day 1
  
  while (daysFound < numberOfDays) {
    end.setDate(end.getDate() + 1);
    if (isSchoolDay(end)) {
      daysFound++;
    }
  }
  
  return { start, end };
}

async function fixAllDateRanges() {
  console.log('🔧 FIXING ALL UNIT DATE RANGES TO DAILY INTEGRATION MODEL');
  console.log('=========================================================\n');

  const subjects = [
    { 
      name: 'French Language Arts', 
      lrpId: 'cmebyc98h0001vjr1cvh4knsh',
      startDate: new Date('2025-09-03'),
      daily: true
    },
    { 
      name: 'Mathematics', 
      lrpId: 'cmebyc98k0003vjr1svziz0in',
      startDate: new Date('2025-09-03'),
      daily: true
    },
    { 
      name: 'Science', 
      lrpId: 'cmebyc98q0005vjr19wxzdygh',
      startDate: new Date('2025-09-03'),
      daily: true
    },
    { 
      name: 'Arts', 
      lrpId: 'cmebyc98v0009vjr16o3e7awo',
      startDate: new Date('2025-09-03'),
      daily: true
    },
    { 
      name: 'Social Studies', 
      lrpId: 'cmebyc98s0007vjr1v0a2ibp5',
      startDate: new Date('2025-09-03'),
      daily: false // Alternating with Health/FPS
    },
    { 
      name: 'Health/FPS', 
      lrpId: 'cmebyc98x000bvjr1finmuibw',
      startDate: new Date('2025-09-03'),
      daily: false // Alternating with Social Studies
    }
  ];

  let totalFixed = 0;

  for (const subject of subjects) {
    console.log(`📚 ${subject.name.toUpperCase()}`);
    
    // Get all units for this subject
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: subject.lrpId },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Found ${units.length} units to fix\n`);
    
    let currentStartDate = new Date(subject.startDate);
    
    for (const [index, unit] of units.entries()) {
      // Calculate required consecutive days based on hours
      const requiredDays = Math.ceil((unit.estimatedHours || 15) / 0.75);
      
      // Skip weekends to find next valid start date
      while (!isSchoolDay(currentStartDate)) {
        currentStartDate.setDate(currentStartDate.getDate() + 1);
      }
      
      // Get consecutive school days for this unit
      const dates = getConsecutiveSchoolDays(currentStartDate, requiredDays);
      
      // Update the unit with new dates
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          startDate: dates.start,
          endDate: dates.end
        }
      });
      
      console.log(`Unit ${index + 1}: "${unit.title}"`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      console.log(`  Required days: ${requiredDays}`);
      console.log(`  Old dates: ${unit.startDate?.toISOString().split('T')[0]} to ${unit.endDate?.toISOString().split('T')[0]}`);
      console.log(`  New dates: ${dates.start.toISOString().split('T')[0]} to ${dates.end.toISOString().split('T')[0]}`);
      console.log(`  ✅ FIXED\n`);
      
      totalFixed++;
      
      // Set next unit's start date to day after this unit ends
      currentStartDate = new Date(dates.end);
      currentStartDate.setDate(currentStartDate.getDate() + 1);
      
      // For alternating subjects (Social Studies/Health), add extra spacing
      if (!subject.daily) {
        // These subjects only teach every other day, so space units more
        currentStartDate.setDate(currentStartDate.getDate() + 7); // Add a week between units
      }
    }
    
    console.log('---\n');
  }

  console.log(`🎉 SUCCESSFULLY FIXED ${totalFixed} UNITS!`);
  console.log('All units now have consecutive daily model date ranges.\n');
  
  await prisma.$disconnect();
}

fixAllDateRanges().catch(console.error);