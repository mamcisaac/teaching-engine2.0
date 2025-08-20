import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnit3ChristmasBreak() {
  try {
    console.log('🔧 PHASE 1: FIXING UNIT 3 CHRISTMAS BREAK VIOLATION');
    console.log('Current: Unit 3 lessons extend to January 15, 2026');
    console.log('Target: Unit 3 must end by December 18, 2025');
    
    // Get Unit 3 with its current lessons
    const unit3 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' }, // Unit 3: Nos familles et traditions
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });
    
    if (!unit3) {
      console.error('❌ Unit 3 not found!');
      return;
    }
    
    console.log(`\n📚 Unit 3: ${unit3.title}`);
    console.log(`Current lessons: ${unit3.lessonPlans.length}`);
    console.log(`Current end date: ${new Date(unit3.endDate).toDateString()}`);
    
    // Calculate last school day before Christmas break (December 18, 2025)
    const lastSchoolDay = new Date('2025-12-18');
    console.log(`\n🎯 Target: End by ${lastSchoolDay.toDateString()}`);
    
    // Filter lessons to only include those before Christmas break
    const validLessons = unit3.lessonPlans.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate <= lastSchoolDay;
    });
    
    const invalidLessons = unit3.lessonPlans.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate > lastSchoolDay;
    });
    
    console.log(`\n📊 LESSON ANALYSIS:`);
    console.log(`Valid lessons (before Christmas): ${validLessons.length}`);
    console.log(`Invalid lessons (during/after Christmas): ${invalidLessons.length}`);
    
    if (invalidLessons.length > 0) {
      console.log('\n🚨 LESSONS TO DELETE (Christmas break violations):');
      invalidLessons.forEach(lesson => {
        console.log(`   ❌ ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
      });
      
      // Delete the invalid lessons
      console.log('\n🗑️ Deleting Christmas break violation lessons...');
      const lessonIdsToDelete = invalidLessons.map(lesson => lesson.id);
      
      if (lessonIdsToDelete.length > 0) {
        await prisma.lessonPlan.deleteMany({
          where: {
            id: {
              in: lessonIdsToDelete
            }
          }
        });
        
        invalidLessons.forEach(lesson => {
          console.log(`   ✅ Deleted: ${lesson.title}`);
        });
      }
    }
    
    // Calculate the actual last lesson date from valid lessons
    const actualLastLesson = validLessons.length > 0 ? 
      new Date(validLessons[validLessons.length - 1].date) : 
      new Date(unit3.startDate);
    
    // Update Unit 3 end date to reflect actual last lesson
    console.log(`\n📅 Updating Unit 3 end date to: ${actualLastLesson.toDateString()}`);
    
    const updatedUnit3 = await prisma.unitPlan.update({
      where: { id: unit3.id },
      data: {
        endDate: actualLastLesson,
        estimatedHours: validLessons.length * 0.75 // 45 minutes = 0.75 hours
      }
    });
    
    console.log('\n✅ UNIT 3 CHRISTMAS BREAK FIX COMPLETED!');
    console.log(`Updated end date: ${new Date(updatedUnit3.endDate).toDateString()}`);
    console.log(`Updated lesson count: ${validLessons.length}`);
    console.log(`Updated hours: ${updatedUnit3.estimatedHours}`);
    
    // Check if we need to redistribute deleted lessons
    if (invalidLessons.length > 0) {
      console.log(`\n⚠️ LESSON REDISTRIBUTION NEEDED:`);
      console.log(`${invalidLessons.length} lessons were deleted and need to be redistributed to other units`);
      console.log('This will be handled in Phase 3: Redesign all unit boundaries');
    }
    
    // Verify no Christmas break violations remain
    const verifyUnit3 = await prisma.unitPlan.findUnique({
      where: { id: unit3.id },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });
    
    const christmasStart = new Date('2025-12-19');
    const remainingChristmasViolations = verifyUnit3.lessonPlans.filter(l => 
      new Date(l.date) >= christmasStart
    );
    
    if (remainingChristmasViolations.length === 0) {
      console.log('\n🎉 VERIFICATION PASSED: No Christmas break violations remain!');
    } else {
      console.log('\n❌ VERIFICATION FAILED: Christmas violations still exist!');
      remainingChristmasViolations.forEach(lesson => {
        console.log(`   ❌ ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing Unit 3 Christmas break:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnit3ChristmasBreak();