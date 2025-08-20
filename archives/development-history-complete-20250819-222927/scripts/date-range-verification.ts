import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDateRanges() {
  console.log('🗓️ DATE RANGE VERIFICATION FOR DAILY INTEGRATION MODEL');
  console.log('=========================================================\n');

  const subjects = [
    { name: 'French Language Arts', lrpId: 'cmebyc98h0001vjr1cvh4knsh' },
    { name: 'Mathematics', lrpId: 'cmebyc98k0003vjr1svziz0in' },
    { name: 'Science', lrpId: 'cmebyc98q0005vjr19wxzdygh' },
    { name: 'Social Studies', lrpId: 'cmebyc98s0007vjr1v0a2ibp5' },
    { name: 'Arts', lrpId: 'cmebyc98v0009vjr16o3e7awo' },
    { name: 'Health/FPS', lrpId: 'cmebyc98x000bvjr1finmuibw' }
  ];

  let totalProblems = 0;

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
    
    let prevEndDate: Date | null = null;
    
    for (const [index, unit] of units.entries()) {
      console.log(`Unit ${index + 1}: "${unit.title}"`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      
      if (unit.startDate && unit.endDate) {
        const start = unit.startDate.toISOString().split('T')[0];
        const end = unit.endDate.toISOString().split('T')[0];
        
        // Calculate actual days between dates
        const daysBetween = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Calculate expected days based on hours
        const expectedDays = Math.ceil((unit.estimatedHours || 0) / 0.75);
        
        console.log(`  Dates: ${start} to ${end}`);
        console.log(`  Actual days: ${daysBetween}`);
        console.log(`  Expected days (hours/0.75): ${expectedDays}`);
        
        // Check for gaps between units
        if (prevEndDate) {
          const gapDays = Math.ceil((unit.startDate.getTime() - prevEndDate.getTime()) / (1000 * 60 * 60 * 24)) - 1;
          if (gapDays > 2) {
            console.log(`  ⚠️ GAP: ${gapDays} days gap from previous unit`);
            totalProblems++;
          }
        }
        
        // Check if date range matches expected
        if (Math.abs(daysBetween - expectedDays) > 3) {
          console.log(`  ❌ MISMATCH: ${daysBetween} actual vs ${expectedDays} expected`);
          totalProblems++;
        } else {
          console.log(`  ✅ Date range appropriate`);
        }
        
        prevEndDate = unit.endDate;
      } else {
        console.log(`  ❌ NO DATES SET`);
        totalProblems++;
      }
      
      console.log('');
    }
    
    console.log('---\n');
  }

  console.log(`🎯 TOTAL PROBLEMS FOUND: ${totalProblems}`);
  
  if (totalProblems === 0) {
    console.log('✅ ALL DATE RANGES COMPATIBLE WITH DAILY INTEGRATION MODEL');
  } else {
    console.log('❌ DATE RANGES STILL INCOMPATIBLE WITH DAILY INTEGRATION MODEL');
  }

  await prisma.$disconnect();
}

verifyDateRanges().catch(console.error);