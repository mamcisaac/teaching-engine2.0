import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTimingArchitecture() {
  try {
    console.log('🔧 CRITICAL FIX: REDESIGNING TIMING ARCHITECTURE FOR EVERY-OTHER-DAY REALITY');
    console.log('Problem: Units have impossible lesson densities for every-other-day pattern');
    console.log('Solution: Extend unit durations to provide adequate every-other-day slots');
    console.log('===============================================================================');
    
    // Get current units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📊 CURRENT TIMING ANALYSIS:');
    units.forEach((unit, index) => {
      const unitNum = index + 1;
      const currentDays = Math.floor((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const currentSchoolDays = Math.round(currentDays * (5/7));
      const everyOtherDaySlots = Math.floor(currentSchoolDays / 2);
      const neededSchoolDays = unit.lessonPlans.length * 2; // Every other day
      const neededCalendarDays = Math.ceil(neededSchoolDays * (7/5));
      
      console.log(`\nUnit ${unitNum}: ${unit.title}`);
      console.log(`  Lessons: ${unit.lessonPlans.length}`);
      console.log(`  Current: ${currentDays} calendar days (${currentSchoolDays} school days, ${everyOtherDaySlots} slots)`);
      console.log(`  Needed: ${neededCalendarDays} calendar days (${neededSchoolDays} school days) for every-other-day`);
      console.log(`  Status: ${unit.lessonPlans.length <= everyOtherDaySlots + 1 ? '✅ FEASIBLE' : '❌ IMPOSSIBLE'}`);
    });
    
    console.log('\n🎯 TIMING REDESIGN STRATEGY:');
    console.log('1. Extend Unit 1 from 31 to 40+ calendar days');
    console.log('2. Extend Unit 3 from 27 to 34+ calendar days'); 
    console.log('3. Extend Unit 6 from 24 to 42+ calendar days');
    console.log('4. Adjust subsequent units to maintain progression');
    console.log('5. Ensure all lessons fall within new boundaries');
    
    console.log('\n🔧 EXECUTING UNIT BOUNDARY REDESIGN...');
    
    // Define new unit boundaries that provide adequate every-other-day slots
    const newUnitBoundaries = [
      {
        unitId: units[0].id, // Unit 1
        lessons: 14,
        newStartDate: new Date('2025-09-08'), // Keep current start
        newDuration: 42, // 42 calendar days = ~30 school days = 15 every-other-day slots
        rationale: 'Extended to provide 15 every-other-day slots for 14 lessons'
      },
      {
        unitId: units[1].id, // Unit 2  
        lessons: 14,
        newDuration: 42, // Keep current feasible duration
        rationale: 'Current duration works, maintain timing'
      },
      {
        unitId: units[2].id, // Unit 3
        lessons: 12,
        newDuration: 35, // 35 calendar days = ~25 school days = 12+ every-other-day slots
        rationale: 'Extended to provide 12+ every-other-day slots'
      },
      {
        unitId: units[3].id, // Unit 4
        lessons: 14,
        newDuration: 42, // Keep current feasible duration  
        rationale: 'Current duration works, maintain timing'
      },
      {
        unitId: units[4].id, // Unit 5
        lessons: 14,
        newDuration: 42, // Keep current feasible duration
        rationale: 'Current duration works, maintain timing'
      },
      {
        unitId: units[5].id, // Unit 6
        lessons: 15,
        newDuration: 45, // 45 calendar days = ~32 school days = 16 every-other-day slots  
        rationale: 'Extended significantly to provide 16 every-other-day slots for 15 lessons'
      },
      {
        unitId: units[6].id, // Unit 7
        lessons: 14,
        newDuration: 40, // Keep reasonable duration
        rationale: 'Maintain timing, adjust to fit at end'
      }
    ];
    
    console.log('\n📅 CALCULATING NEW UNIT DATES:');
    
    let currentStartDate = new Date('2025-09-08'); // School starts with buffer
    
    for (let i = 0; i < newUnitBoundaries.length; i++) {
      const boundary = newUnitBoundaries[i];
      const unit = units[i];
      const unitNum = i + 1;
      
      // Calculate new end date
      const newEndDate = new Date(currentStartDate);
      newEndDate.setDate(newEndDate.getDate() + boundary.newDuration - 1);
      
      // Ensure end date is a weekday
      while (newEndDate.getDay() === 0 || newEndDate.getDay() === 6) {
        newEndDate.setDate(newEndDate.getDate() - 1);
      }
      
      console.log(`\nUnit ${unitNum}: ${unit.title}`);
      console.log(`  New dates: ${currentStartDate.toDateString()} - ${newEndDate.toDateString()}`);
      console.log(`  Duration: ${boundary.newDuration} calendar days`);
      console.log(`  Rationale: ${boundary.rationale}`);
      
      // Update unit in database
      await prisma.unitPlan.update({
        where: { id: boundary.unitId },
        data: {
          startDate: currentStartDate,
          endDate: newEndDate
        }
      });
      
      console.log(`  ✅ Updated unit boundary in database`);
      
      // Calculate next unit start (with 2-day buffer for assessment)
      currentStartDate = new Date(newEndDate);
      currentStartDate.setDate(currentStartDate.getDate() + 3); // 2-day gap + 1
      
      // Ensure start date is a weekday
      while (currentStartDate.getDay() === 0 || currentStartDate.getDay() === 6) {
        currentStartDate.setDate(currentStartDate.getDate() + 1);
      }
      
      // Special handling for Christmas break
      if (unitNum === 3) {
        // After Unit 3, skip Christmas break
        currentStartDate = new Date('2026-01-06'); // First school day after break
        while (currentStartDate.getDay() === 0 || currentStartDate.getDay() === 6) {
          currentStartDate.setDate(currentStartDate.getDate() + 1);
        }
        console.log(`  🎄 Post-Christmas adjustment: Next unit starts ${currentStartDate.toDateString()}`);
      }
    }
    
    console.log('\n🔧 ADJUSTING LESSON DATES TO FIT NEW BOUNDARIES...');
    
    // Get updated units with new boundaries
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    for (const unit of updatedUnits) {
      const unitIndex = updatedUnits.indexOf(unit);
      const unitNum = unitIndex + 1;
      
      console.log(`\nAdjusting Unit ${unitNum} lesson dates:`);
      
      if (unit.lessonPlans.length === 0) {
        console.log(`  ⚠️ No lessons to adjust`);
        continue;
      }
      
      // Generate new lesson dates within unit boundaries using every-other-day pattern
      const unitStart = new Date(unit.startDate);
      const unitEnd = new Date(unit.endDate);
      const newLessonDates = [];
      
      let currentLessonDate = new Date(unitStart);
      // Start lessons a few days into the unit for preparation
      currentLessonDate.setDate(currentLessonDate.getDate() + 2);
      
      // Ensure first lesson is a weekday
      while (currentLessonDate.getDay() === 0 || currentLessonDate.getDay() === 6) {
        currentLessonDate.setDate(currentLessonDate.getDate() + 1);
      }
      
      for (let i = 0; i < unit.lessonPlans.length; i++) {
        // Add current date to lesson dates
        newLessonDates.push(new Date(currentLessonDate));
        
        // Move to next every-other-day slot
        currentLessonDate.setDate(currentLessonDate.getDate() + 2);
        
        // Skip weekends
        while (currentLessonDate.getDay() === 0 || currentLessonDate.getDay() === 6) {
          currentLessonDate.setDate(currentLessonDate.getDate() + 1);
        }
        
        // Skip Christmas break for Unit 3
        if (unitNum === 3) {
          if (currentLessonDate >= new Date('2025-12-19') && currentLessonDate <= new Date('2026-01-05')) {
            // Stop lessons before Christmas break for Unit 3
            break;
          }
        }
        
        // Ensure lesson falls within unit boundary
        if (currentLessonDate > unitEnd) {
          console.log(`  ⚠️ Lesson ${i + 1} would exceed unit boundary, stopping at ${i} lessons`);
          break;
        }
      }
      
      // Update lesson dates in database
      for (let i = 0; i < Math.min(unit.lessonPlans.length, newLessonDates.length); i++) {
        const lesson = unit.lessonPlans[i];
        const newDate = newLessonDates[i];
        
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { date: newDate }
        });
        
        console.log(`  ✅ Lesson ${i + 1}: ${newDate.toDateString()}`);
      }
      
      console.log(`  Updated ${Math.min(unit.lessonPlans.length, newLessonDates.length)} lesson dates`);
    }
    
    console.log('\n📊 VERIFYING TIMING ARCHITECTURE FIX:');
    
    // Final verification
    const finalUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    let totalLessons = 0;
    let allFeasible = true;
    let allWithinBoundaries = true;
    
    finalUnits.forEach((unit, index) => {
      const unitNum = index + 1;
      const unitDays = Math.floor((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const schoolDays = Math.round(unitDays * (5/7));
      const everyOtherDaySlots = Math.floor(schoolDays / 2);
      
      totalLessons += unit.lessonPlans.length;
      
      console.log(`\nUnit ${unitNum}: ${unit.title}`);
      console.log(`  Duration: ${unitDays} calendar days (${schoolDays} school days)`);
      console.log(`  Every-other-day slots: ${everyOtherDaySlots}`);
      console.log(`  Actual lessons: ${unit.lessonPlans.length}`);
      console.log(`  Feasible: ${unit.lessonPlans.length <= everyOtherDaySlots + 1 ? '✅' : '❌'}`);
      
      if (unit.lessonPlans.length > everyOtherDaySlots + 1) {
        allFeasible = false;
      }
      
      // Check if all lessons fall within unit boundaries
      const lessonsOutside = unit.lessonPlans.filter(l => 
        new Date(l.date) < new Date(unit.startDate) || new Date(l.date) > new Date(unit.endDate)
      ).length;
      
      if (lessonsOutside > 0) {
        console.log(`  ❌ ${lessonsOutside} lessons outside boundaries`);
        allWithinBoundaries = false;
      } else {
        console.log(`  ✅ All lessons within boundaries`);
      }
      
      // Check gap to next unit
      if (index < finalUnits.length - 1) {
        const nextUnit = finalUnits[index + 1];
        const gap = Math.floor((new Date(nextUnit.startDate).getTime() - new Date(unit.endDate).getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  Gap to next unit: ${gap} days ${gap >= 1 ? '✅' : '❌'}`);
      }
    });
    
    console.log(`\nFinal totals: ${totalLessons}/97 lessons`);
    
    if (allFeasible && allWithinBoundaries && totalLessons === 97) {
      console.log('\n🎉 TIMING ARCHITECTURE FIX SUCCESSFUL!');
      console.log('✅ All units have feasible every-other-day timing');
      console.log('✅ All lessons fall within unit boundaries'); 
      console.log('✅ Perfect lesson count maintained');
      console.log('✅ Units are now implementable in Emily\'s classroom');
    } else {
      console.log('\n⚠️ TIMING ARCHITECTURE FIX ISSUES:');
      if (!allFeasible) console.log('❌ Some units still have impossible densities');
      if (!allWithinBoundaries) console.log('❌ Some lessons still outside boundaries');
      if (totalLessons !== 97) console.log(`❌ Lesson count: ${totalLessons}/97`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing timing architecture:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTimingArchitecture();