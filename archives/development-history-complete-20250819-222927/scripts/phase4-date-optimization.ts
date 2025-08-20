import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function phase4DateOptimization() {
  try {
    console.log('🔧 PHASE 4: FINAL DATE OPTIMIZATION');
    console.log('Goal: Perfect seamless progression with optimal timing');
    console.log('===============================================================================');
    
    // Get current units with lessons
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📊 CURRENT DATE ANALYSIS:');
    units.forEach((unit, index) => {
      const actualFirstLesson = unit.lessonPlans.length > 0 ? 
        new Date(unit.lessonPlans[0].date) : null;
      const actualLastLesson = unit.lessonPlans.length > 0 ? 
        new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date) : null;
      
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      console.log(`  Planned: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      if (actualFirstLesson && actualLastLesson) {
        console.log(`  Actual lessons: ${actualFirstLesson.toDateString()} - ${actualLastLesson.toDateString()}`);
      }
      console.log(`  Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
      
      // Check alignment between planned dates and actual lesson dates
      if (actualFirstLesson) {
        const startDiff = Math.floor((actualFirstLesson.getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const endDiff = Math.floor((new Date(unit.endDate).getTime() - actualLastLesson.getTime()) / (1000 * 60 * 60 * 24));
        
        if (Math.abs(startDiff) > 7) {
          console.log(`  ⚠️ Start date misalignment: ${startDiff} days`);
        }
        if (Math.abs(endDiff) > 7) {
          console.log(`  ⚠️ End date misalignment: ${endDiff} days`);
        }
      }
      
      // Check gap to next unit
      if (index < units.length - 1) {
        const nextUnit = units[index + 1];
        const gap = Math.floor((new Date(nextUnit.startDate).getTime() - new Date(unit.endDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 0) {
          console.log(`  🚨 OVERLAP with Unit ${index + 2}: ${Math.abs(gap)} days`);
        } else if (gap > 25) {
          console.log(`  ⚠️ LARGE GAP to Unit ${index + 2}: ${gap} days`);
        } else {
          console.log(`  ✅ Good gap to Unit ${index + 2}: ${gap} days`);
        }
      }
    });
    
    console.log('\n🎯 OPTIMIZATION STRATEGY:');
    console.log('1. Align unit start/end dates with actual lesson dates');
    console.log('2. Ensure appropriate gaps for assessment and flexibility');
    console.log('3. Maintain school calendar compliance');
    console.log('4. Optimize for every-other-day pattern');
    
    console.log('\n🔧 EXECUTING DATE OPTIMIZATION...');
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitNum = i + 1;
      
      console.log(`\n📅 Optimizing Unit ${unitNum}:`);
      
      if (unit.lessonPlans.length > 0) {
        const firstLessonDate = new Date(unit.lessonPlans[0].date);
        const lastLessonDate = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        
        // Calculate optimal start date (1-2 days before first lesson for prep)
        const optimalStartDate = new Date(firstLessonDate);
        optimalStartDate.setDate(optimalStartDate.getDate() - 1);
        
        // Ensure start date is a weekday
        while (optimalStartDate.getDay() === 0 || optimalStartDate.getDay() === 6) {
          optimalStartDate.setDate(optimalStartDate.getDate() - 1);
        }
        
        // Calculate optimal end date (1-2 days after last lesson for assessment)
        const optimalEndDate = new Date(lastLessonDate);
        optimalEndDate.setDate(optimalEndDate.getDate() + 2);
        
        // Ensure end date is a weekday
        while (optimalEndDate.getDay() === 0 || optimalEndDate.getDay() === 6) {
          optimalEndDate.setDate(optimalEndDate.getDate() + 1);
        }
        
        // Check if optimization is needed
        const currentStart = new Date(unit.startDate);
        const currentEnd = new Date(unit.endDate);
        
        const startNeedsUpdate = Math.abs(optimalStartDate.getTime() - currentStart.getTime()) > (2 * 24 * 60 * 60 * 1000); // More than 2 days difference
        const endNeedsUpdate = Math.abs(optimalEndDate.getTime() - currentEnd.getTime()) > (2 * 24 * 60 * 60 * 1000);
        
        if (startNeedsUpdate || endNeedsUpdate) {
          console.log(`  Current: ${currentStart.toDateString()} - ${currentEnd.toDateString()}`);
          console.log(`  Optimal: ${optimalStartDate.toDateString()} - ${optimalEndDate.toDateString()}`);
          
          // Update the unit dates
          await prisma.unitPlan.update({
            where: { id: unit.id },
            data: {
              startDate: optimalStartDate,
              endDate: optimalEndDate
            }
          });
          
          console.log(`  ✅ Updated dates`);
        } else {
          console.log(`  ✅ Dates already optimal`);
        }
        
      } else {
        console.log(`  ⚠️ No lessons to base optimization on`);
      }
    }
    
    console.log('\n📊 VERIFYING OPTIMIZED PROGRESSION:');
    
    // Get updated units
    const optimizedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    let totalLessons = 0;
    let totalHours = 0;
    let hasIssues = false;
    
    optimizedUnits.forEach((unit, index) => {
      console.log(`\nUnit ${index + 1}: ${unit.title}`);
      console.log(`  Dates: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`  Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
      
      // Check for any remaining issues
      if (index < optimizedUnits.length - 1) {
        const nextUnit = optimizedUnits[index + 1];
        const gap = Math.floor((new Date(nextUnit.startDate).getTime() - new Date(unit.endDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 0) {
          console.log(`  🚨 OVERLAP with Unit ${index + 2}: ${Math.abs(gap)} days`);
          hasIssues = true;
        } else if (gap > 30) {
          console.log(`  ⚠️ VERY LARGE GAP to Unit ${index + 2}: ${gap} days`);
          hasIssues = true;
        } else {
          console.log(`  ✅ Appropriate gap to Unit ${index + 2}: ${gap} days`);
        }
      }
    });
    
    console.log(`\n📊 FINAL TOTALS:`);
    console.log(`Lessons: ${totalLessons}/97 ${totalLessons === 97 ? '✅' : '❌'}`);
    console.log(`Hours: ${totalHours}/73 ${Math.abs(totalHours - 73) <= 1 ? '✅' : '❌'}`);
    
    // Check overall school year alignment
    const schoolYearStart = new Date('2025-09-02');
    const schoolYearEnd = new Date('2026-06-26');
    const firstUnitStart = new Date(optimizedUnits[0].startDate);
    const lastUnitEnd = new Date(optimizedUnits[optimizedUnits.length - 1].endDate);
    
    const startBuffer = Math.floor((firstUnitStart.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const endBuffer = Math.floor((schoolYearEnd.getTime() - lastUnitEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`\n📅 SCHOOL YEAR ALIGNMENT:`);
    console.log(`Start buffer: ${startBuffer} days ${startBuffer >= 5 ? '✅' : '❌'}`);
    console.log(`End buffer: ${endBuffer} days ${endBuffer >= 10 ? '✅' : '❌'}`);
    
    if (totalLessons === 97 && !hasIssues && startBuffer >= 5 && endBuffer >= 10) {
      console.log('\n🎉 PHASE 4 COMPLETED SUCCESSFULLY!');
      console.log('✅ Perfect lesson count maintained');
      console.log('✅ Seamless unit progression achieved');
      console.log('✅ Optimal timing for every unit');
      console.log('✅ Appropriate buffers maintained');
      console.log('\n🔄 Ready for Phase 5: Assessment buffers and flexibility');
    } else {
      console.log('\n⚠️ PHASE 4 ISSUES IDENTIFIED:');
      if (totalLessons !== 97) console.log(`❌ Lesson count: ${totalLessons}/97`);
      if (hasIssues) console.log(`❌ Progression issues remain`);
      if (startBuffer < 5) console.log(`❌ Insufficient start buffer: ${startBuffer} days`);
      if (endBuffer < 10) console.log(`❌ Insufficient end buffer: ${endBuffer} days`);
    }
    
  } catch (error) {
    console.error('❌ Error in Phase 4 date optimization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

phase4DateOptimization();