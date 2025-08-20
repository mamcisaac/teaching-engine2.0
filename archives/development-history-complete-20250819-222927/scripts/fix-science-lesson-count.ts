import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixScienceLessonCount() {
  try {
    console.log('🔧 Fixing Science lesson count: 99 → 98...\n');
    
    // Get all Science lessons
    const scienceLRP = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98q0005vjr19wxzdygh' },
      include: {
        unitPlans: {
          include: {
            lessonPlans: {
              orderBy: { date: 'desc' }
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });
    
    if (!scienceLRP) {
      throw new Error('Science LRP not found');
    }
    
    let totalLessons = 0;
    scienceLRP.unitPlans.forEach(unit => {
      totalLessons += unit.lessonPlans.length;
    });
    
    console.log(`Current total: ${totalLessons} lessons`);
    console.log('Target: 98 lessons');
    console.log(`Need to remove: ${totalLessons - 98} lesson(s)\n`);
    
    if (totalLessons === 98) {
      console.log('✅ Already at correct count!');
      return;
    }
    
    // Remove the last lesson from Unit 5 (it has 20, can go to 19)
    const unit5 = scienceLRP.unitPlans[4]; // Unit 5: Plant Connections & Summer
    if (unit5 && unit5.lessonPlans.length > 0) {
      const lastLesson = unit5.lessonPlans[0]; // First in desc order = last chronologically
      
      await prisma.eTFOLessonPlan.delete({
        where: { id: lastLesson.id }
      });
      
      console.log(`✅ Removed lesson: "${lastLesson.title}" from ${unit5.title}`);
      console.log(`   Unit 5 now has ${unit5.lessonPlans.length - 1} lessons (was ${unit5.lessonPlans.length})\n`);
      
      // Update unit hours to reflect new lesson count
      await prisma.unitPlan.update({
        where: { id: unit5.id },
        data: { estimatedHours: 14 } // 19 lessons × 0.75 = 14.25, rounded to 14
      });
      
      console.log('✅ Updated Unit 5 hours to 14 (19 lessons × 0.75)\n');
    }
    
    // Verify final count
    const finalLRP = await prisma.longRangePlan.findUnique({
      where: { id: 'cmebyc98q0005vjr19wxzdygh' },
      include: {
        unitPlans: {
          include: {
            lessonPlans: true
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });
    
    if (finalLRP) {
      let finalTotalLessons = 0;
      let finalTotalHours = 0;
      
      console.log('📊 FINAL VERIFICATION:');
      finalLRP.unitPlans.forEach((unit, i) => {
        const lessonCount = unit.lessonPlans.length;
        finalTotalLessons += lessonCount;
        finalTotalHours += unit.estimatedHours || 0;
        console.log(`${i + 1}. ${unit.title}: ${lessonCount} lessons, ${unit.estimatedHours} hours`);
      });
      
      console.log('\n📊 TOTALS:');
      console.log(`Lessons: ${finalTotalLessons} (target: 98) ${finalTotalLessons === 98 ? '✅' : '❌'}`);
      console.log(`Hours: ${finalTotalHours} (target: ~73.5) ${finalTotalHours >= 73 && finalTotalHours <= 75 ? '✅' : '❌'}`);
      
      if (finalTotalLessons === 98) {
        console.log('\n✅ PERFECT LESSON COUNT ACHIEVED!');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixScienceLessonCount();