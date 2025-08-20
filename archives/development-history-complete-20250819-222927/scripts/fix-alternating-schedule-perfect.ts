import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const HOLIDAYS = [
  '2025-10-13', // Thanksgiving
  '2025-11-11', // Remembrance Day
  '2025-12-22', '2025-12-23', '2025-12-24', '2025-12-25', '2025-12-26',
  '2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', // Christmas Break
  '2026-02-16', // Family Day
  '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', // March Break
  '2026-04-10', '2026-04-13', // Easter
  '2026-05-18' // Victoria Day
];

function isSchoolDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  const dateStr = date.toISOString().split('T')[0];
  return !HOLIDAYS.includes(dateStr);
}

async function fixAlternatingSchedulePerfect() {
  console.log('🔧 FIXING ALTERNATING SCHEDULE TO TRUE PERFECTION\n');
  console.log('═'.repeat(80));
  console.log('Implementing PROPER alternating schedule for Social Studies and Health/FPS\n');
  
  // Get all school days in order
  const schoolDays: { date: Date; dayNumber: number; isSocialStudiesDay: boolean }[] = [];
  let dayNumber = 1;
  const currentDate = new Date('2025-09-03');
  const endDate = new Date('2026-06-20');
  
  while (currentDate <= endDate) {
    if (isSchoolDay(currentDate)) {
      schoolDays.push({
        date: new Date(currentDate),
        dayNumber: dayNumber,
        isSocialStudiesDay: dayNumber % 2 === 1 // Odd days = SS, Even days = Health
      });
      dayNumber++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`📅 Total school days: ${schoolDays.length}`);
  const ssDays = schoolDays.filter(d => d.isSocialStudiesDay);
  const healthDays = schoolDays.filter(d => !d.isSocialStudiesDay);
  console.log(`📚 Social Studies days: ${ssDays.length} (should be ~97)`);
  console.log(`🏥 Health/FPS days: ${healthDays.length} (should be ~98)\n`);
  
  // Get Social Studies units
  const ssUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        subject: { contains: 'Sciences humaines' },
        userId: 23
      }
    },
    orderBy: { startDate: 'asc' }
  });
  
  // Get Health/FPS units
  const healthUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        subject: { contains: 'Formation personnelle' },
        userId: 23
      }
    },
    orderBy: { startDate: 'asc' }
  });
  
  console.log('═══ FIXING SOCIAL STUDIES UNITS ═══\n');
  
  // Distribute SS days across units
  const ssDaysPerUnit = Math.floor(ssDays.length / ssUnits.length);
  const ssRemainder = ssDays.length % ssUnits.length;
  
  let ssIndex = 0;
  for (let i = 0; i < ssUnits.length; i++) {
    const unit = ssUnits[i];
    const daysForUnit = ssDaysPerUnit + (i < ssRemainder ? 1 : 0);
    
    const startDay = ssDays[ssIndex];
    const endDay = ssDays[ssIndex + daysForUnit - 1];
    
    // Calculate estimated hours based on actual teaching days
    const estimatedHours = Math.round(daysForUnit * 0.75 * 10) / 10; // Round to 1 decimal
    
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        startDate: startDay.date,
        endDate: endDay.date,
        estimatedHours: estimatedHours,
        // Fix vocabulary if it exists but isn't an array
        keyVocabulary: Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : []
      }
    });
    
    console.log(`✅ SS Unit ${i+1}: ${startDay.date.toISOString().split('T')[0]} to ${endDay.date.toISOString().split('T')[0]} (${daysForUnit} teaching days, ${estimatedHours}h)`);
    
    ssIndex += daysForUnit;
  }
  
  console.log('\n═══ FIXING HEALTH/FPS UNITS ═══\n');
  
  // Distribute Health days across units
  const healthDaysPerUnit = Math.floor(healthDays.length / healthUnits.length);
  const healthRemainder = healthDays.length % healthUnits.length;
  
  let healthIndex = 0;
  for (let i = 0; i < healthUnits.length; i++) {
    const unit = healthUnits[i];
    const daysForUnit = healthDaysPerUnit + (i < healthRemainder ? 1 : 0);
    
    const startDay = healthDays[healthIndex];
    const endDay = healthDays[healthIndex + daysForUnit - 1];
    
    // Calculate estimated hours based on actual teaching days
    const estimatedHours = Math.round(daysForUnit * 0.75 * 10) / 10; // Round to 1 decimal
    
    // Fix vocabulary format - ensure it's an array
    let vocabulary = unit.keyVocabulary;
    if (!Array.isArray(vocabulary)) {
      vocabulary = vocabulary ? [] : []; // Convert to empty array if not already an array
    }
    
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: {
        startDate: startDay.date,
        endDate: endDay.date,
        estimatedHours: estimatedHours,
        keyVocabulary: vocabulary
      }
    });
    
    console.log(`✅ Health Unit ${i+1}: ${startDay.date.toISOString().split('T')[0]} to ${endDay.date.toISOString().split('T')[0]} (${daysForUnit} teaching days, ${estimatedHours}h)`);
    
    healthIndex += daysForUnit;
  }
  
  // Fix daily subjects that incorrectly span Christmas break
  console.log('\n═══ FIXING CHRISTMAS BREAK SPANNING ═══\n');
  
  const dailySubjects = [
    'Français (Immersion)',
    'Mathématiques', 
    'Sciences de la nature',
    'Arts visuels'
  ];
  
  for (const subjectName of dailySubjects) {
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: subjectName },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Find units that span Christmas and fix them
    for (const unit of units) {
      const christmas = new Date('2025-12-25');
      if (unit.startDate < christmas && unit.endDate > christmas) {
        console.log(`🎄 Fixing Christmas span: ${unit.title}`);
        
        // Adjust to end before Christmas break
        const newEndDate = new Date('2025-12-19'); // Last day before break
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: { endDate: newEndDate }
        });
        
        console.log(`   ✅ Adjusted to end ${newEndDate.toISOString().split('T')[0]}`);
      }
    }
  }
  
  // Final verification
  console.log('\n═══ FINAL VERIFICATION ═══\n');
  
  // Verify Social Studies totals
  const updatedSSUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        subject: { contains: 'Sciences humaines' },
        userId: 23
      }
    }
  });
  
  const ssTotalHours = updatedSSUnits.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
  const ssActualDays = updatedSSUnits.reduce((sum, u) => {
    let days = 0;
    const current = new Date(u.startDate);
    let dayNum = 1;
    const schoolStart = new Date('2025-09-03');
    
    // Calculate which day of school this starts on
    const tempDate = new Date(schoolStart);
    while (tempDate < u.startDate) {
      if (isSchoolDay(tempDate)) dayNum++;
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    // Count SS days within this unit's range
    while (current <= u.endDate) {
      if (isSchoolDay(current) && dayNum % 2 === 1) { // SS days are odd
        days++;
      }
      if (isSchoolDay(current)) dayNum++;
      current.setDate(current.getDate() + 1);
    }
    
    return sum + days;
  }, 0);
  
  // Verify Health/FPS totals
  const updatedHealthUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        subject: { contains: 'Formation personnelle' },
        userId: 23
      }
    }
  });
  
  const healthTotalHours = updatedHealthUnits.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
  const healthActualDays = updatedHealthUnits.reduce((sum, u) => {
    let days = 0;
    const current = new Date(u.startDate);
    let dayNum = 1;
    const schoolStart = new Date('2025-09-03');
    
    // Calculate which day of school this starts on
    const tempDate = new Date(schoolStart);
    while (tempDate < u.startDate) {
      if (isSchoolDay(tempDate)) dayNum++;
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    // Count Health days within this unit's range
    while (current <= u.endDate) {
      if (isSchoolDay(current) && dayNum % 2 === 0) { // Health days are even
        days++;
      }
      if (isSchoolDay(current)) dayNum++;
      current.setDate(current.getDate() + 1);
    }
    
    return sum + days;
  }, 0);
  
  console.log(`📚 Social Studies: ${updatedSSUnits.length} units, ${ssActualDays} teaching days, ${ssTotalHours} hours`);
  console.log(`🏥 Health/FPS: ${updatedHealthUnits.length} units, ${healthActualDays} teaching days, ${healthTotalHours} hours`);
  
  const ssStatus = Math.abs(ssActualDays - 97) <= 2 ? '✅' : '❌';
  const healthStatus = Math.abs(healthActualDays - 98) <= 2 ? '✅' : '❌';
  
  console.log(`\n${ssStatus} Social Studies expected: ~97 days, actual: ${ssActualDays}`);
  console.log(`${healthStatus} Health/FPS expected: ~98 days, actual: ${healthActualDays}`);
  
  if (ssStatus === '✅' && healthStatus === '✅') {
    console.log('\n🎉 ALTERNATING SCHEDULE PERFECTED!');
    console.log('Social Studies and Health/FPS now properly alternate daily.');
  } else {
    console.log('\n⚠️ Still need adjustment - days not matching expected totals.');
  }
  
  await prisma.$disconnect();
}

fixAlternatingSchedulePerfect().catch(console.error);