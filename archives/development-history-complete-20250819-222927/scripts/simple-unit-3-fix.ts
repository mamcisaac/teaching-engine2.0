import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleUnit3Fix() {
  try {
    console.log('🔧 SIMPLE APPROACH: Fix Unit 3 Christmas break by adjusting end date');
    
    // Get Unit 3
    const unit3 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });
    
    console.log(`📚 Unit 3: ${unit3.title}`);
    console.log(`Current lessons: ${unit3.lessonPlans.length}`);
    
    // Show all lesson dates
    console.log('\n📅 ALL LESSON DATES:');
    unit3.lessonPlans.forEach((lesson, index) => {
      const date = new Date(lesson.date);
      const isAfterChristmas = date >= new Date('2025-12-19');
      console.log(`${index + 1}. ${date.toDateString()}: ${lesson.title} ${isAfterChristmas ? '❌ VIOLATION' : '✅'}`);
    });
    
    // Find lessons that violate Christmas break
    const christmasStart = new Date('2025-12-19');
    const violatingLessons = unit3.lessonPlans.filter(lesson => 
      new Date(lesson.date) >= christmasStart
    );
    
    console.log(`\n🚨 Found ${violatingLessons.length} lessons during Christmas break`);
    
    if (violatingLessons.length > 0) {
      console.log('\n🗑️ Deleting violating lessons one by one...');
      
      for (const lesson of violatingLessons) {
        try {
          // Delete each lesson individually
          await prisma.lessonPlan.delete({
            where: { id: lesson.id }
          });
          console.log(`   ✅ Deleted: ${new Date(lesson.date).toDateString()} - ${lesson.title}`);
        } catch (deleteError) {
          console.log(`   ❌ Failed to delete lesson ${lesson.id}:`, deleteError.message);
        }
      }
    }
    
    // Get updated lesson count
    const updatedUnit3 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });
    
    // Find the actual last lesson date
    const lastLesson = updatedUnit3.lessonPlans.length > 0 ? 
      new Date(updatedUnit3.lessonPlans[updatedUnit3.lessonPlans.length - 1].date) :
      new Date(updatedUnit3.startDate);
    
    // Update unit end date and hours
    await prisma.unitPlan.update({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
      data: {
        endDate: lastLesson,
        estimatedHours: updatedUnit3.lessonPlans.length * 0.75
      }
    });
    
    console.log('\n✅ UNIT 3 CHRISTMAS BREAK FIX COMPLETED!');
    console.log(`New lesson count: ${updatedUnit3.lessonPlans.length}`);
    console.log(`New end date: ${lastLesson.toDateString()}`);
    console.log(`New hours: ${updatedUnit3.lessonPlans.length * 0.75}`);
    
    // Verify no Christmas violations remain
    const finalCheck = updatedUnit3.lessonPlans.filter(lesson => 
      new Date(lesson.date) >= new Date('2025-12-19')
    );
    
    if (finalCheck.length === 0) {
      console.log('\n🎉 SUCCESS: No Christmas break violations remain!');
    } else {
      console.log('\n❌ WARNING: Christmas violations still exist:');
      finalCheck.forEach(lesson => {
        console.log(`   ❌ ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error in simple Unit 3 fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleUnit3Fix();