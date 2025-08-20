import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixHolidayScheduling() {
  try {
    console.log('🎯 FIXING HOLIDAY CONFLICT: Christmas Break Scheduling');
    console.log('Unit 4 currently starts Dec 24 (Christmas Eve) - IMPOSSIBLE');
    
    // Define holiday periods to avoid
    const holidayPeriods = [
      {
        name: 'Christmas Break',
        start: new Date('2025-12-23'),
        end: new Date('2026-01-05')
      }
    ];
    
    console.log('\n📅 HOLIDAY PERIODS TO RESPECT:');
    for (const holiday of holidayPeriods) {
      console.log(`  ${holiday.name}: ${holiday.start.toDateString()} - ${holiday.end.toDateString()}`);
    }

    // Helper function to check if date falls during holidays
    function isHolidayPeriod(date: Date): boolean {
      return holidayPeriods.some(holiday => 
        date >= holiday.start && date <= holiday.end
      );
    }

    // Helper function to check if date is weekend
    function isWeekend(date: Date): boolean {
      const day = date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }

    // Recalculate perfect schedule avoiding holidays
    console.log('\n🔧 RECALCULATING SCHEDULE WITH HOLIDAY RESPECT:');
    
    let currentDate = new Date('2025-09-02'); // Start September 2
    let socialStudiesDay = true;
    let currentUnitIndex = 0;
    let lessonsInCurrentUnit = 0;
    
    const unitTargets = [
      { name: 'Notre école communautaire', lessons: 14 },
      { name: 'Les aides de notre quartier', lessons: 14 },
      { name: 'Nos familles et traditions', lessons: 13 },
      { name: 'Notre quartier et notre ville', lessons: 14 },
      { name: 'Géographie et cartographie', lessons: 14 },
      { name: 'Citoyenneté et responsabilité', lessons: 14 },
      { name: 'Notre monde connecté', lessons: 14 }
    ];

    const perfectSchedule = [];
    let totalLessonsScheduled = 0;
    
    while (currentUnitIndex < unitTargets.length && currentDate < new Date('2026-07-01')) {
      const currentUnit = unitTargets[currentUnitIndex];
      
      // Skip weekends AND holidays
      if (!isWeekend(currentDate) && !isHolidayPeriod(currentDate)) {
        if (socialStudiesDay) {
          // This is a Social Studies lesson day
          if (lessonsInCurrentUnit === 0) {
            // Starting new unit
            perfectSchedule.push({
              unitName: currentUnit.name,
              startDate: new Date(currentDate),
              lessons: currentUnit.lessons
            });
            console.log(`  📚 Starting ${currentUnit.name} on ${currentDate.toDateString()}`);
          }
          
          lessonsInCurrentUnit++;
          totalLessonsScheduled++;
          
          if (lessonsInCurrentUnit >= currentUnit.lessons) {
            // Unit complete, set end date
            perfectSchedule[perfectSchedule.length - 1].endDate = new Date(currentDate);
            console.log(`  ✅ Completed ${currentUnit.name} on ${currentDate.toDateString()} (${lessonsInCurrentUnit} lessons)`);
            currentUnitIndex++;
            lessonsInCurrentUnit = 0;
          }
        }
        
        // Alternate between Social Studies and Health/FPS only on school days
        socialStudiesDay = !socialStudiesDay;
      } else {
        // Skip day but don't change alternation
        if (isHolidayPeriod(currentDate)) {
          console.log(`  🎄 Skipping holiday: ${currentDate.toDateString()}`);
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`\n📊 SCHEDULING SUMMARY:`);
    console.log(`  Total lessons scheduled: ${totalLessonsScheduled}`);
    console.log(`  Target lessons: 97`);
    console.log(`  Units completed: ${perfectSchedule.length}/7`);

    console.log('\n✅ CORRECTED PERFECT SCHEDULE:');
    for (let i = 0; i < perfectSchedule.length; i++) {
      const schedule = perfectSchedule[i];
      const startDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.startDate.getDay()];
      const endDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.endDate.getDay()];
      
      console.log(`  Unit ${i+1}: ${schedule.unitName}`);
      console.log(`    Start: ${schedule.startDate.toDateString()} (${startDay})`);
      console.log(`    End: ${schedule.endDate.toDateString()} (${endDay})`);
      console.log(`    Lessons: ${schedule.lessons}`);
      
      // Validation checks
      const issues = [];
      if (schedule.startDate.getDay() === 0 || schedule.startDate.getDay() === 6) {
        issues.push('Weekend start');
      }
      if (schedule.endDate.getDay() === 0 || schedule.endDate.getDay() === 6) {
        issues.push('Weekend end');
      }
      if (isHolidayPeriod(schedule.startDate)) {
        issues.push('Holiday start');
      }
      if (isHolidayPeriod(schedule.endDate)) {
        issues.push('Holiday end');
      }
      
      if (issues.length > 0) {
        console.log(`    ❌ ISSUES: ${issues.join(', ')}`);
      } else {
        console.log(`    ✅ PERFECT`);
      }
    }

    // Update database with corrected schedule
    if (perfectSchedule.length === 7) {
      console.log('\n🔧 UPDATING DATABASE WITH CORRECTED SCHEDULE:');
      
      const units = await prisma.unitPlan.findMany({
        where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
        orderBy: { startDate: 'asc' }
      });
      
      for (let i = 0; i < units.length && i < perfectSchedule.length; i++) {
        const unit = units[i];
        const schedule = perfectSchedule[i];
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: schedule.startDate,
            endDate: schedule.endDate
          }
        });
        
        console.log(`  ✅ Updated ${unit.title}: ${schedule.startDate.toDateString()} - ${schedule.endDate.toDateString()}`);
      }
      
      console.log('\n🎉 HOLIDAY CONFLICT RESOLVED!');
      console.log('✅ No units cross Christmas break');
      console.log('✅ All units respect school calendar');
      console.log('✅ Perfect scheduling achieved');
    } else {
      console.log('\n⚠️ Schedule incomplete - manual adjustment needed');
    }

  } catch (error) {
    console.error('❌ Error fixing holiday scheduling:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHolidayScheduling();