import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const holidays = [
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

function countSchoolDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (isSchoolDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

async function verifySchoolDays() {
  console.log('🎓 SCHOOL DAYS VERIFICATION FOR DAILY INTEGRATION MODEL');
  console.log('=========================================================\n');

  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5' },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo' },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw' }
  ];

  let totalPerfect = 0;
  let totalUnits = 0;

  for (const subject of subjects) {
    console.log(`📚 ${subject.name.toUpperCase()}`);
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: subject.lrpId },
      select: {
        title: true,
        estimatedHours: true,
        startDate: true,
        endDate: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`Total units: ${units.length}\n`);
    totalUnits += units.length;
    
    let subjectPerfect = 0;
    
    for (const [index, unit] of units.entries()) {
      console.log(`Unit ${index + 1}: "${unit.title}"`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      
      if (unit.startDate && unit.endDate) {
        const start = unit.startDate.toISOString().split('T')[0];
        const end = unit.endDate.toISOString().split('T')[0];
        
        // Count actual SCHOOL days (not calendar days)
        const schoolDays = countSchoolDays(unit.startDate, unit.endDate);
        
        // Calculate expected days based on hours
        const expectedDays = Math.ceil((unit.estimatedHours || 0) / 0.75);
        
        console.log(`  Dates: ${start} to ${end}`);
        console.log(`  School days: ${schoolDays}`);
        console.log(`  Expected days (hours/0.75): ${expectedDays}`);
        
        // Check if date range matches expected (within 1 day tolerance)
        if (Math.abs(schoolDays - expectedDays) <= 1) {
          console.log(`  ✅ PERFECT: Date range matches daily model`);
          subjectPerfect++;
          totalPerfect++;
        } else {
          console.log(`  ❌ MISMATCH: ${schoolDays} school days vs ${expectedDays} expected`);
        }
      } else {
        console.log(`  ❌ NO DATES SET`);
      }
      
      console.log('');
    }
    
    console.log(`Subject Score: ${subjectPerfect}/${units.length} units perfect`);
    console.log('---\n');
  }

  console.log(`🎯 FINAL SCORE: ${totalPerfect}/${totalUnits} units perfect`);
  
  if (totalPerfect === totalUnits) {
    console.log('🎉 ALL DATE RANGES ARE PERFECT FOR DAILY INTEGRATION MODEL!');
  } else {
    console.log(`⚠️ ${totalUnits - totalPerfect} units still need adjustment`);
  }

  await prisma.$disconnect();
}

verifySchoolDays().catch(console.error);