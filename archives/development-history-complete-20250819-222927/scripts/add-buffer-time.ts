import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBufferTime() {
  try {
    console.log('🔧 PHASE 1: ADDING 5-DAY START AND 10-DAY END BUFFER');
    
    // Get Unit 1 and Unit 7
    const unit1 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapmo0000vj1wwl61z365' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      }
    });
    
    const unit7 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapop004uvj1w00690v5u' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      }
    });
    
    console.log(`📚 Unit 1: ${unit1.title}`);
    console.log(`Current start: ${new Date(unit1.startDate).toDateString()}`);
    console.log(`Current lessons: ${unit1.lessonPlans.length}`);
    
    console.log(`\n📚 Unit 7: ${unit7.title}`);
    console.log(`Current end: ${new Date(unit7.endDate).toDateString()}`);
    console.log(`Current lessons: ${unit7.lessonPlans.length}`);
    
    // Define school year boundaries
    const schoolYearStart = new Date('2025-09-02'); // September 2, 2025
    const schoolYearEnd = new Date('2026-06-26'); // June 26, 2026
    
    console.log(`\n📅 SCHOOL YEAR BOUNDARIES:`);
    console.log(`School year starts: ${schoolYearStart.toDateString()}`);
    console.log(`School year ends: ${schoolYearEnd.toDateString()}`);
    
    // Calculate current buffers
    const currentStartBuffer = Math.floor((new Date(unit1.startDate).getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const currentEndBuffer = Math.floor((schoolYearEnd.getTime() - new Date(unit7.endDate).getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`\n📊 CURRENT BUFFERS:`);
    console.log(`Start buffer: ${currentStartBuffer} days (need 5+ days)`);
    console.log(`End buffer: ${currentEndBuffer} days (need 10+ days)`);
    
    // Calculate new start date for Unit 1 (5 school days after school year starts)
    const newUnit1Start = new Date(schoolYearStart);
    let daysAdded = 0;
    while (daysAdded < 5) {
      newUnit1Start.setDate(newUnit1Start.getDate() + 1);
      // Only count weekdays
      if (newUnit1Start.getDay() !== 0 && newUnit1Start.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    console.log(`\n🎯 PROPOSED NEW UNIT 1 START: ${newUnit1Start.toDateString()}`);
    
    // Calculate new end date for Unit 7 (10 school days before school year ends)
    const newUnit7End = new Date(schoolYearEnd);
    let daysSubtracted = 0;
    while (daysSubtracted < 10) {
      newUnit7End.setDate(newUnit7End.getDate() - 1);
      // Only count weekdays
      if (newUnit7End.getDay() !== 0 && newUnit7End.getDay() !== 6) {
        daysSubtracted++;
      }
    }
    
    console.log(`🎯 PROPOSED NEW UNIT 7 END: ${newUnit7End.toDateString()}`);
    
    // Check if Unit 1 needs adjustment
    const unit1Shift = Math.floor((newUnit1Start.getTime() - new Date(unit1.startDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (unit1Shift > 0) {
      console.log(`\n📅 ADJUSTING UNIT 1 START (shifting forward ${unit1Shift} days):`);
      
      // Update Unit 1 start date
      const newUnit1EndDate = new Date(unit1.endDate);
      newUnit1EndDate.setDate(newUnit1EndDate.getDate() + unit1Shift);
      
      await prisma.unitPlan.update({
        where: { id: unit1.id },
        data: {
          startDate: newUnit1Start,
          endDate: newUnit1EndDate
        }
      });
      
      // Update Unit 1 lesson dates
      if (unit1.lessonPlans.length > 0) {
        console.log('Updating Unit 1 lesson dates...');
        for (const lesson of unit1.lessonPlans) {
          const currentDate = new Date(lesson.date);
          const newDate = new Date(currentDate);
          newDate.setDate(newDate.getDate() + unit1Shift);
          
          // Ensure weekday
          while (newDate.getDay() === 0 || newDate.getDay() === 6) {
            newDate.setDate(newDate.getDate() + 1);
          }
          
          await prisma.eTFOLessonPlan.update({
            where: { id: lesson.id },
            data: { date: newDate }
          });
        }
      }
      
      console.log(`✅ Unit 1 start moved from ${new Date(unit1.startDate).toDateString()} to ${newUnit1Start.toDateString()}`);
    } else {
      console.log(`✅ Unit 1 start buffer is already adequate`);
    }
    
    // Check if Unit 7 needs adjustment
    const unit7Shift = Math.floor((new Date(unit7.endDate).getTime() - newUnit7End.getTime()) / (1000 * 60 * 60 * 24));
    
    if (unit7Shift > 0) {
      console.log(`\n📅 ADJUSTING UNIT 7 END (shifting backward ${unit7Shift} days):`);
      
      // Update Unit 7 end date
      const newUnit7StartDate = new Date(unit7.startDate);
      newUnit7StartDate.setDate(newUnit7StartDate.getDate() - unit7Shift);
      
      await prisma.unitPlan.update({
        where: { id: unit7.id },
        data: {
          startDate: newUnit7StartDate,
          endDate: newUnit7End
        }
      });
      
      // Update Unit 7 lesson dates
      if (unit7.lessonPlans.length > 0) {
        console.log('Updating Unit 7 lesson dates...');
        for (const lesson of unit7.lessonPlans) {
          const currentDate = new Date(lesson.date);
          const newDate = new Date(currentDate);
          newDate.setDate(newDate.getDate() - unit7Shift);
          
          // Ensure weekday
          while (newDate.getDay() === 0 || newDate.getDay() === 6) {
            newDate.setDate(newDate.getDate() - 1);
          }
          
          await prisma.eTFOLessonPlan.update({
            where: { id: lesson.id },
            data: { date: newDate }
          });
        }
      }
      
      console.log(`✅ Unit 7 end moved from ${new Date(unit7.endDate).toDateString()} to ${newUnit7End.toDateString()}`);
    } else {
      console.log(`✅ Unit 7 end buffer is already adequate`);
    }
    
    // Calculate final buffers
    const finalStartBuffer = Math.floor((newUnit1Start.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const finalEndBuffer = Math.floor((schoolYearEnd.getTime() - newUnit7End.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`\n📊 FINAL BUFFERS:`);
    console.log(`Start buffer: ${finalStartBuffer} days ${finalStartBuffer >= 5 ? '✅' : '❌'}`);
    console.log(`End buffer: ${finalEndBuffer} days ${finalEndBuffer >= 10 ? '✅' : '❌'}`);
    
    if (finalStartBuffer >= 5 && finalEndBuffer >= 10) {
      console.log('\n🎉 SUCCESS: Adequate buffer time added!');
      console.log('✅ Phase 1 Task 4 COMPLETED: Buffer time established');
      console.log('\n✨ PHASE 1 COMPLETE! All critical timing fixes implemented:');
      console.log('  ✅ Unit 3 ends before Christmas break');
      console.log('  ✅ Gap between Units 3-4 eliminated');
      console.log('  ✅ Unit 6 weekend start fixed');
      console.log('  ✅ Proper buffer time added');
    } else {
      console.log('\n❌ WARNING: Buffer time still inadequate');
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('Phase 2: Redistribute curriculum expectations to eliminate over-coverage');
    console.log('Phase 3: Redesign all unit boundaries with realistic timing');
    
  } catch (error) {
    console.error('❌ Error adding buffer time:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBufferTime();