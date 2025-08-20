import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnit3ETFOLessons() {
  try {
    console.log('🔧 PHASE 1: FIXING UNIT 3 CHRISTMAS BREAK - Using ETFOLessonPlan model');
    
    // Get Unit 3 with its ETFO lesson plans
    const unit3 = await prisma.unitPlan.findUnique({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });
    
    console.log(`📚 Unit 3: ${unit3.title}`);
    console.log(`Current ETFO lessons: ${unit3.lessonPlans.length}`);
    
    // Show all lesson dates
    console.log('\n📅 ALL ETFO LESSON DATES:');
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
    
    console.log(`\n🚨 Found ${violatingLessons.length} ETFO lessons during Christmas break`);
    
    if (violatingLessons.length > 0) {
      console.log('\n🗑️ Deleting violating ETFO lessons one by one...');
      
      for (const lesson of violatingLessons) {
        try {
          // Delete each ETFO lesson individually
          await prisma.eTFOLessonPlan.delete({
            where: { id: lesson.id }
          });
          console.log(`   ✅ Deleted: ${new Date(lesson.date).toDateString()} - ${lesson.title}`);
        } catch (deleteError) {
          console.log(`   ❌ Failed to delete ETFO lesson ${lesson.id}:`, deleteError.message);
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
    
    console.log(`\n📊 Updated lesson count: ${updatedUnit3.lessonPlans.length}`);
    
    // Find the actual last lesson date
    const lastLesson = updatedUnit3.lessonPlans.length > 0 ? 
      new Date(updatedUnit3.lessonPlans[updatedUnit3.lessonPlans.length - 1].date) :
      new Date(updatedUnit3.startDate);
    
    // Update unit end date and hours
    const newHours = updatedUnit3.lessonPlans.length * 0.75; // 45 minutes = 0.75 hours
    
    await prisma.unitPlan.update({
      where: { id: 'cmehvapnf001mvj1wfpkvqswp' },
      data: {
        endDate: lastLesson,
        estimatedHours: Math.round(newHours)
      }
    });
    
    console.log('\n✅ UNIT 3 CHRISTMAS BREAK FIX COMPLETED!');
    console.log(`New lesson count: ${updatedUnit3.lessonPlans.length}`);
    console.log(`New end date: ${lastLesson.toDateString()}`);
    console.log(`New hours: ${Math.round(newHours)}`);
    
    // Verify no Christmas violations remain
    const finalCheck = updatedUnit3.lessonPlans.filter(lesson => 
      new Date(lesson.date) >= new Date('2025-12-19')
    );
    
    if (finalCheck.length === 0) {
      console.log('\n🎉 SUCCESS: No Christmas break violations remain!');
      console.log('✅ Phase 1 Task 1 COMPLETED: Unit 3 now ends before Christmas break');
    } else {
      console.log('\n❌ WARNING: Christmas violations still exist:');
      finalCheck.forEach(lesson => {
        console.log(`   ❌ ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
      });
    }
    
    // Show impact on total lesson count
    const totalDeleted = violatingLessons.length;
    if (totalDeleted > 0) {
      console.log(`\n⚠️ REDISTRIBUTION NEEDED:`);
      console.log(`${totalDeleted} lessons were deleted and need to be redistributed to maintain 97 total`);
      console.log('This will be handled in Phase 3: Redesign all unit boundaries');
    }
    
  } catch (error) {
    console.error('❌ Error in ETFO Unit 3 fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnit3ETFOLessons();