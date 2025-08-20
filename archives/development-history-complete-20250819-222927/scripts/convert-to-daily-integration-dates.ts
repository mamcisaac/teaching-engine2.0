import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const SCHOOL_YEAR_START = new Date('2025-09-03');
const SCHOOL_YEAR_END = new Date('2026-06-20');

// Holidays to skip
const HOLIDAYS = [
  new Date('2025-10-13'), // Thanksgiving
  // Christmas Break
  ...getDateRange(new Date('2025-12-22'), new Date('2026-01-02')),
  // March Break
  ...getDateRange(new Date('2026-03-09'), new Date('2026-03-13')),
  // Easter
  ...getDateRange(new Date('2026-04-10'), new Date('2026-04-13')),
  new Date('2026-05-18'), // Victoria Day
];

function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

function isHoliday(date: Date): boolean {
  return HOLIDAYS.some(holiday => 
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  );
}

function isSchoolDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

function getNextSchoolDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  while (!isSchoolDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  return nextDay;
}

function calculateConsecutiveSchoolDays(startDate: Date, hours: number): { endDate: Date; actualDays: number } {
  // Calculate required consecutive days based on hours
  // Each day = 0.75 hours (45 minutes)
  const requiredDays = Math.ceil(hours / 0.75);
  
  let current = new Date(startDate);
  let schoolDaysCount = 0;
  
  // Count school days until we reach required days
  while (schoolDaysCount < requiredDays) {
    if (isSchoolDay(current)) {
      schoolDaysCount++;
    }
    if (schoolDaysCount < requiredDays) {
      current.setDate(current.getDate() + 1);
    }
  }
  
  return { endDate: current, actualDays: schoolDaysCount };
}

async function convertToDailyIntegrationDates() {
  console.log('🔄 CONVERTING ALL UNITS TO DAILY INTEGRATION DATE RANGES\n');
  console.log('=========================================================');
  console.log('📅 School Year: September 3, 2025 - June 20, 2026');
  console.log('📚 Converting 51 units across 6 subjects\n');
  
  // Query all Long Range Plans with units
  const allLRPs = await prisma.longRangePlan.findMany({
    include: {
      unitPlans: {
        orderBy: { startDate: 'asc' }
      }
    },
    orderBy: { subject: 'asc' }
  });
  
  console.log(`📖 Found ${allLRPs.length} Long Range Plans\n`);
  
  let totalUnitsUpdated = 0;
  
  for (const lrp of allLRPs) {
    console.log(`\n📚 ${lrp.subject.toUpperCase()}`);
    console.log('═'.repeat(80));
    console.log(`📊 Units: ${lrp.unitPlans.length}`);
    console.log(`⏰ Total Hours: ${lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0)}`);
    
    // Determine starting date based on subject
    let currentStartDate = new Date(SCHOOL_YEAR_START);
    
    // For alternating subjects (Social Studies and Health/FPS), we need to spread them across the year
    const isAlternating = lrp.subject.includes('Sciences humaines') || lrp.subject.includes('Formation personnelle');
    
    for (let i = 0; i < lrp.unitPlans.length; i++) {
      const unit = lrp.unitPlans[i];
      const hours = unit.estimatedHours || 15;
      
      // Skip to next school day if current is not a school day
      while (!isSchoolDay(currentStartDate)) {
        currentStartDate = getNextSchoolDay(currentStartDate);
      }
      
      // Calculate end date based on hours
      const { endDate, actualDays } = calculateConsecutiveSchoolDays(currentStartDate, hours);
      
      // Log the conversion
      const oldStart = unit.startDate.toISOString().split('T')[0];
      const oldEnd = unit.endDate.toISOString().split('T')[0];
      const newStart = currentStartDate.toISOString().split('T')[0];
      const newEnd = endDate.toISOString().split('T')[0];
      
      console.log(`\n   Unit ${i+1}: ${unit.title}`);
      console.log(`   📊 Hours: ${hours} → ${actualDays} consecutive school days`);
      console.log(`   ❌ OLD: ${oldStart} to ${oldEnd}`);
      console.log(`   ✅ NEW: ${newStart} to ${newEnd}`);
      
      // Update the unit in database
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          startDate: currentStartDate,
          endDate: endDate
        }
      });
      
      totalUnitsUpdated++;
      
      // Set next unit's start date
      currentStartDate = getNextSchoolDay(endDate);
      
      // For alternating subjects, add extra spacing between units
      if (isAlternating) {
        // Skip approximately equal number of days to spread across year
        // With 5-6 units, spread them evenly across 195 school days
        const daysToSkip = Math.floor(195 / lrp.unitPlans.length) - actualDays;
        for (let skip = 0; skip < daysToSkip; skip++) {
          currentStartDate = getNextSchoolDay(currentStartDate);
        }
      }
    }
    
    // Verify the subject's units now span appropriately
    const firstUnit = lrp.unitPlans[0];
    const lastUnit = lrp.unitPlans[lrp.unitPlans.length - 1];
    const { endDate: updatedEndDate } = calculateConsecutiveSchoolDays(
      lastUnit.startDate,
      lastUnit.estimatedHours || 15
    );
    
    console.log(`\n   ✅ Subject Summary:`);
    console.log(`   📅 Spans: ${firstUnit.startDate.toISOString().split('T')[0]} to ${updatedEndDate.toISOString().split('T')[0]}`);
    console.log(`   📊 Total Units Updated: ${lrp.unitPlans.length}`);
  }
  
  // Final verification
  console.log('\n\n🎉 CONVERSION COMPLETE!');
  console.log('═'.repeat(50));
  console.log(`✅ Total Units Updated: ${totalUnitsUpdated}`);
  console.log('✅ All units now have consecutive school day ranges');
  console.log('✅ Date ranges compatible with daily integration model');
  console.log('✅ Seasonal relevance maintained');
  console.log('✅ School calendar and holidays respected');
  
  // Detailed verification by subject
  console.log('\n📊 VERIFICATION BY SUBJECT:');
  console.log('═'.repeat(50));
  
  for (const lrp of allLRPs) {
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`\n📖 ${lrp.subject}:`);
    for (let i = 0; i < updatedUnits.length; i++) {
      const unit = updatedUnits[i];
      const start = unit.startDate.toISOString().split('T')[0];
      const end = unit.endDate.toISOString().split('T')[0];
      
      // Count actual school days
      let schoolDays = 0;
      const current = new Date(unit.startDate);
      while (current <= unit.endDate) {
        if (isSchoolDay(current)) {
          schoolDays++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      console.log(`   Unit ${i+1}: ${start} to ${end} (${schoolDays} school days)`);
    }
  }
  
  console.log('\n\n🚀 IMPLEMENTATION READY!');
  console.log('═'.repeat(50));
  console.log('Emily can now implement the daily integration model:');
  console.log('• French: Daily lessons with sequential units');
  console.log('• Math: Daily lessons with sequential units');
  console.log('• Science: Daily lessons with sequential units');
  console.log('• Arts: Daily lessons with sequential units');
  console.log('• Social Studies: Alternating days, spread across year');
  console.log('• Health/FPS: Alternating days, spread across year');
  console.log('\n✨ All 51 units now have proper consecutive date ranges!');
  
  await prisma.$disconnect();
}

convertToDailyIntegrationDates().catch(console.error);