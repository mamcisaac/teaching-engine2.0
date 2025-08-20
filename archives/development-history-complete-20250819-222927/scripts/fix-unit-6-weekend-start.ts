import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnit6WeekendStart() {
  try {
    console.log('🔧 PHASE 1: FIXING UNIT 6 WEEKEND START DATE');
    
    // Get Unit 6
    const unit6 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapoe0041vj1wp65vf801' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      }
    });
    
    console.log(`📚 Unit 6: ${unit6.title}`);
    console.log(`Current start: ${new Date(unit6.startDate).toDateString()}`);
    console.log(`Current end: ${new Date(unit6.endDate).toDateString()}`);
    console.log(`Current lessons: ${unit6.lessonPlans.length}`);
    
    // Check if start date is weekend
    const startDate = new Date(unit6.startDate);
    const startDay = startDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    console.log(`\n📅 START DATE ANALYSIS:`);
    console.log(`Day of week: ${startDay} (${startDay === 0 ? 'Sunday' : startDay === 6 ? 'Saturday' : 'Weekday'})`);
    
    if (startDay === 0 || startDay === 6) {
      console.log('🚨 WEEKEND START DETECTED - FIXING...');
      
      // Find the next Monday
      const newStartDate = new Date(startDate);
      
      if (startDay === 0) { // Sunday
        newStartDate.setDate(newStartDate.getDate() + 1); // Move to Monday
      } else if (startDay === 6) { // Saturday
        newStartDate.setDate(newStartDate.getDate() + 2); // Move to Monday
      }
      
      console.log(`🎯 NEW START DATE: ${newStartDate.toDateString()}`);
      
      // Calculate how many days we're shifting
      const daysShifted = Math.floor((newStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Shifting Unit 6 forward by ${daysShifted} days`);
      
      // Calculate new end date
      const newEndDate = new Date(unit6.endDate);
      newEndDate.setDate(newEndDate.getDate() + daysShifted);
      
      // Update Unit 6 dates
      await prisma.unitPlan.update({
        where: { id: unit6.id },
        data: {
          startDate: newStartDate,
          endDate: newEndDate
        }
      });
      
      console.log('\n📅 UPDATING UNIT 6 LESSON DATES...');
      
      // Update all Unit 6 lesson dates
      if (unit6.lessonPlans.length > 0) {
        for (const lesson of unit6.lessonPlans) {
          const currentLessonDate = new Date(lesson.date);
          const newLessonDate = new Date(currentLessonDate);
          newLessonDate.setDate(newLessonDate.getDate() + daysShifted);
          
          // Ensure the new date is a weekday
          while (newLessonDate.getDay() === 0 || newLessonDate.getDay() === 6) {
            newLessonDate.setDate(newLessonDate.getDate() + 1);
          }
          
          await prisma.eTFOLessonPlan.update({
            where: { id: lesson.id },
            data: { date: newLessonDate }
          });
          
          console.log(`   Updated: ${lesson.title} from ${currentLessonDate.toDateString()} to ${newLessonDate.toDateString()}`);
        }
      }
      
      console.log('\n✅ UNIT 6 WEEKEND START FIX COMPLETED!');
      console.log(`Old start: ${startDate.toDateString()} (${startDay === 0 ? 'Sunday' : 'Saturday'})`);
      console.log(`New start: ${newStartDate.toDateString()} (Monday)`);
      console.log(`New end: ${newEndDate.toDateString()}`);
      
    } else {
      console.log('✅ Unit 6 already starts on a weekday - no fix needed');
    }
    
    // Verify the fix
    const updatedUnit6 = await prisma.unitPlan.findUnique({
      where: { id: unit6.id }
    });
    
    const finalStartDay = new Date(updatedUnit6.startDate).getDay();
    
    if (finalStartDay !== 0 && finalStartDay !== 6) {
      console.log('\n🎉 SUCCESS: Unit 6 now starts on a weekday!');
      console.log('✅ Phase 1 Task 3 COMPLETED: Weekend start fixed');
    } else {
      console.log('\n❌ WARNING: Unit 6 still starts on weekend');
      console.log(`Start day: ${finalStartDay} (${finalStartDay === 0 ? 'Sunday' : 'Saturday'})`);
    }
    
    // Check impact on other units
    console.log('\n⚠️ CASCADING EFFECTS CHECK:');
    console.log('This change may affect the timing of Unit 7.');
    console.log('Unit boundaries will be fully optimized in Phase 3.');
    
  } catch (error) {
    console.error('❌ Error fixing Unit 6 weekend start:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnit6WeekendStart();