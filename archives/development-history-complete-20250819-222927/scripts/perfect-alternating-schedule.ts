import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const SCHOOL_START = new Date('2025-09-03');
const SCHOOL_END = new Date('2026-06-20');

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

async function perfectAlternatingSchedule() {
  console.log('🔧 PERFECTING ALTERNATING SCHEDULE - TRUE COMPACT PERIODS\\n');
  console.log('═'.repeat(80));
  
  try {
    // STEP 1: Generate all school days with alternating pattern
    console.log('📅 STEP 1: GENERATING TRUE ALTERNATING PATTERN\\n');
    
    const allSchoolDays: { date: Date; dayNumber: number; isSocialStudies: boolean }[] = [];
    let dayNumber = 1;
    const currentDate = new Date(SCHOOL_START);
    
    while (currentDate <= SCHOOL_END) {
      if (isSchoolDay(currentDate)) {
        allSchoolDays.push({
          date: new Date(currentDate),
          dayNumber: dayNumber,
          isSocialStudies: dayNumber % 2 === 1 // Odd days = SS, Even days = Health
        });
        dayNumber++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const socialStudiesDays = allSchoolDays.filter(d => d.isSocialStudies);
    const healthDays = allSchoolDays.filter(d => !d.isSocialStudies);
    
    console.log(`📊 Total school days: ${allSchoolDays.length}`);
    console.log(`📚 Social Studies days: ${socialStudiesDays.length}`);
    console.log(`🏥 Health/FPS days: ${healthDays.length}\\n`);
    
    // STEP 2: Get units and rewrite Social Studies with compact periods
    console.log('📚 STEP 2: REWRITING SOCIAL STUDIES - COMPACT PERIODS\\n');
    
    const socialStudiesUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Distribute SS days across 5 units: 20, 20, 19, 19, 20 = 98 total
    const ssDaysPerUnit = [20, 20, 19, 19, 19]; // Actually 97 total to match reality
    let ssCurrentIndex = 0;
    
    for (let i = 0; i < socialStudiesUnits.length; i++) {
      const unit = socialStudiesUnits[i];
      const daysForThisUnit = ssDaysPerUnit[i];
      
      // Get the SS days for this unit (actual teaching days)
      const unitTeachingDays = socialStudiesDays.slice(ssCurrentIndex, ssCurrentIndex + daysForThisUnit);
      
      if (unitTeachingDays.length > 0) {
        // Find compact date range that encompasses these teaching days
        const firstTeachingDay = unitTeachingDays[0].date;
        const lastTeachingDay = unitTeachingDays[unitTeachingDays.length - 1].date;
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: firstTeachingDay,
            endDate: lastTeachingDay
          }
        });
        
        console.log(`✅ SS Unit ${i+1}: ${firstTeachingDay.toISOString().split('T')[0]} to ${lastTeachingDay.toISOString().split('T')[0]} (${daysForThisUnit} teaching days)`);
        
        ssCurrentIndex += daysForThisUnit;
      }
    }
    
    // STEP 3: Rewrite Health/FPS with compact periods
    console.log('\\n🏥 STEP 3: REWRITING HEALTH/FPS - COMPACT PERIODS\\n');
    
    const healthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Distribute Health days across 5 units: 20, 19, 19, 19, 19 = 96 total (adjust to match reality)
    const healthDaysPerUnit = [19, 19, 19, 20, 20]; // 97 total to match reality
    let healthCurrentIndex = 0;
    
    for (let i = 0; i < healthUnits.length; i++) {
      const unit = healthUnits[i];
      const daysForThisUnit = healthDaysPerUnit[i];
      
      // Get the Health days for this unit (actual teaching days)
      const unitTeachingDays = healthDays.slice(healthCurrentIndex, healthCurrentIndex + daysForThisUnit);
      
      if (unitTeachingDays.length > 0) {
        // Find compact date range that encompasses these teaching days
        const firstTeachingDay = unitTeachingDays[0].date;
        const lastTeachingDay = unitTeachingDays[unitTeachingDays.length - 1].date;
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: firstTeachingDay,
            endDate: lastTeachingDay
          }
        });
        
        console.log(`✅ Health Unit ${i+1}: ${firstTeachingDay.toISOString().split('T')[0]} to ${lastTeachingDay.toISOString().split('T')[0]} (${daysForThisUnit} teaching days)`);
        
        healthCurrentIndex += daysForThisUnit;
      }
    }
    
    // STEP 4: Verification - Check for overlaps
    console.log('\\n🔍 STEP 4: VERIFYING NO OVERLAPS\\n');
    
    // Check SS unit overlaps
    const updatedSSUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    let ssOverlaps = 0;
    for (let i = 0; i < updatedSSUnits.length - 1; i++) {
      const current = updatedSSUnits[i];
      const next = updatedSSUnits[i + 1];
      
      if (current.endDate >= next.startDate) {
        ssOverlaps++;
        console.log(`❌ SS Overlap: Unit ${i+1} ends ${current.endDate.toISOString().split('T')[0]}, Unit ${i+2} starts ${next.startDate.toISOString().split('T')[0]}`);
      }
    }
    
    // Check Health unit overlaps
    const updatedHealthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    let healthOverlaps = 0;
    for (let i = 0; i < updatedHealthUnits.length - 1; i++) {
      const current = updatedHealthUnits[i];
      const next = updatedHealthUnits[i + 1];
      
      if (current.endDate >= next.startDate) {
        healthOverlaps++;
        console.log(`❌ Health Overlap: Unit ${i+1} ends ${current.endDate.toISOString().split('T')[0]}, Unit ${i+2} starts ${next.startDate.toISOString().split('T')[0]}`);
      }
    }
    
    // Check cross-subject overlaps
    let crossOverlaps = 0;
    for (const ssUnit of updatedSSUnits) {
      for (const healthUnit of updatedHealthUnits) {
        if (ssUnit.startDate <= healthUnit.endDate && ssUnit.endDate >= healthUnit.startDate) {
          crossOverlaps++;
        }
      }
    }
    
    console.log(`📊 SS unit overlaps: ${ssOverlaps}`);
    console.log(`📊 Health unit overlaps: ${healthOverlaps}`);
    console.log(`📊 Cross-subject overlaps: ${crossOverlaps}`);
    
    if (ssOverlaps === 0 && healthOverlaps === 0 && crossOverlaps === 0) {
      console.log('\\n🎉 ALTERNATING SCHEDULE PERFECTED!');
      console.log('✅ Zero overlaps between all units');
      console.log('✅ Compact periods implemented');
      console.log('✅ True alternating pattern achieved');
    } else {
      console.log(`\\n⚠️ ${ssOverlaps + healthOverlaps + crossOverlaps} overlaps still exist`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

perfectAlternatingSchedule().catch(console.error);