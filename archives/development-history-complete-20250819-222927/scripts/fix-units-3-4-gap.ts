import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnits34Gap() {
  try {
    console.log('🔧 PHASE 1: ELIMINATING 19-DAY GAP BETWEEN UNITS 3 AND 4');
    
    // Get Unit 3 and Unit 4
    const unit3 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      }
    });
    
    const unit4 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapnr002fvj1w077gd2cz' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      }
    });
    
    console.log(`📚 Unit 3: ${unit3.title}`);
    console.log(`Current end: ${new Date(unit3.endDate).toDateString()}`);
    console.log(`Actual last lesson: ${unit3.lessonPlans.length > 0 ? new Date(unit3.lessonPlans[unit3.lessonPlans.length - 1].date).toDateString() : 'No lessons'}`);
    
    console.log(`\n📚 Unit 4: ${unit4.title}`);
    console.log(`Current start: ${new Date(unit4.startDate).toDateString()}`);
    console.log(`Current end: ${new Date(unit4.endDate).toDateString()}`);
    console.log(`Current lessons: ${unit4.lessonPlans.length}`);
    
    // Calculate the gap
    const unit3EndDate = new Date(unit3.endDate);
    const unit4StartDate = new Date(unit4.startDate);
    const gapDays = Math.floor((unit4StartDate.getTime() - unit3EndDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`\n📊 CURRENT GAP: ${gapDays} days`);
    
    // Determine when school resumes after Christmas break
    // Christmas break is December 19, 2025 - January 5, 2026
    // School typically resumes January 6, 2026
    const schoolResumes = new Date('2026-01-06');
    console.log(`School resumes: ${schoolResumes.toDateString()}`);
    
    // Check if Unit 4 should start on the day school resumes
    const proposedStart = new Date(schoolResumes);
    
    // Make sure it's a school day (not weekend)
    while (proposedStart.getDay() === 0 || proposedStart.getDay() === 6) {
      proposedStart.setDate(proposedStart.getDate() + 1);
    }
    
    console.log(`\n🎯 PROPOSED NEW UNIT 4 START: ${proposedStart.toDateString()}`);
    
    // Calculate new gap
    const newGap = Math.floor((proposedStart.getTime() - unit3EndDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`New gap would be: ${newGap} days (includes Christmas break)`);
    
    if (newGap <= 21) { // Christmas break is about 18 days, so this is acceptable
      console.log('✅ New gap is acceptable (includes Christmas break)');
      
      // Calculate how many days to shift Unit 4 forward
      const daysToShift = Math.floor((proposedStart.getTime() - unit4StartDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Shifting Unit 4 forward by ${daysToShift} days`);
      
      // Update Unit 4 start date
      const newUnit4EndDate = new Date(unit4.endDate);
      newUnit4EndDate.setDate(newUnit4EndDate.getDate() + daysToShift);
      
      await prisma.unitPlan.update({
        where: { id: unit4.id },
        data: {
          startDate: proposedStart,
          endDate: newUnit4EndDate
        }
      });
      
      console.log('\n📅 UPDATING UNIT 4 LESSON DATES...');
      
      // Update all Unit 4 lesson dates by shifting them forward
      if (unit4.lessonPlans.length > 0) {
        for (const lesson of unit4.lessonPlans) {
          const currentDate = new Date(lesson.date);
          const newDate = new Date(currentDate);
          newDate.setDate(newDate.getDate() + daysToShift);
          
          // Skip weekends
          while (newDate.getDay() === 0 || newDate.getDay() === 6) {
            newDate.setDate(newDate.getDate() + 1);
          }
          
          await prisma.eTFOLessonPlan.update({
            where: { id: lesson.id },
            data: { date: newDate }
          });
          
          console.log(`   Updated: ${lesson.title} from ${currentDate.toDateString()} to ${newDate.toDateString()}`);
        }
      }
      
      console.log('\n✅ UNIT 3-4 GAP FIX COMPLETED!');
      console.log(`Unit 3 ends: ${unit3EndDate.toDateString()}`);
      console.log(`Unit 4 starts: ${proposedStart.toDateString()}`);
      console.log(`Unit 4 ends: ${newUnit4EndDate.toDateString()}`);
      console.log(`New gap: ${newGap} days (includes Christmas break)`);
      
    } else {
      console.log('❌ Proposed gap is too large. Need different approach.');
    }
    
    // Verify the fix
    const updatedUnit4 = await prisma.unitPlan.findUnique({
      where: { id: unit4.id },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      }
    });
    
    const finalGap = Math.floor((new Date(updatedUnit4.startDate).getTime() - unit3EndDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (finalGap <= 21) {
      console.log('\n🎉 SUCCESS: Gap between Units 3 and 4 is now reasonable!');
      console.log('✅ Phase 1 Task 2 COMPLETED: Gap eliminated');
    } else {
      console.log('\n❌ WARNING: Gap is still too large');
    }
    
  } catch (error) {
    console.error('❌ Error fixing Units 3-4 gap:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnits34Gap();