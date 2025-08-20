import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCurrentSocialStudiesUnits() {
  try {
    console.log('🔍 EXAMINING CURRENT SOCIAL STUDIES UNITS - CRITICAL TIMING ISSUES');
    
    // Get the Social Studies LRP
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: { expectation: true }
        }
      }
    });
    
    console.log(`📋 LRP: ${lrp.title}`);
    console.log(`Expected: 97 lessons, 72.75 hours, 7 units`);
    
    // Get all units with lesson data
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      include: {
        expectations: { include: { expectation: true } },
        lessonPlans: {
          select: { id: true, date: true, title: true },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n🚨 CURRENT UNIT TIMING ANALYSIS:');
    console.log('=' .repeat(80));
    
    let totalLessons = 0;
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitNum = i + 1;
      
      console.log(`\nUNIT ${unitNum}: ${unit.title}`);
      console.log(`Planned: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
      
      if (unit.lessonPlans.length > 0) {
        const firstLesson = new Date(unit.lessonPlans[0].date);
        const lastLesson = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        console.log(`Actual lessons: ${firstLesson.toDateString()} - ${lastLesson.toDateString()}`);
        
        // Check Christmas break violation for Unit 3 specifically
        if (unitNum === 3) {
          const christmasStart = new Date('2025-12-19');
          const christmasEnd = new Date('2026-01-05');
          
          const christmasLessons = unit.lessonPlans.filter(l => {
            const date = new Date(l.date);
            return date >= christmasStart && date <= christmasEnd;
          });
          
          if (christmasLessons.length > 0) {
            console.log(`🚨 CHRISTMAS VIOLATION: ${christmasLessons.length} lessons during break!`);
            christmasLessons.forEach(lesson => {
              console.log(`   ❌ ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
            });
          }
        }
        
        // Check weekend starts (especially Unit 6)
        const startDay = new Date(unit.startDate).getDay();
        if (startDay === 0 || startDay === 6) {
          console.log(`🚨 WEEKEND START: ${new Date(unit.startDate).toDateString()} (${startDay === 0 ? 'Sunday' : 'Saturday'})`);
        }
        
        // Check gaps between units
        if (i > 0) {
          const prevUnit = units[i - 1];
          const prevEnd = new Date(prevUnit.endDate);
          const thisStart = new Date(unit.startDate);
          const daysBetween = Math.floor((thisStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysBetween > 5) {
            console.log(`🚨 LARGE GAP: ${daysBetween} days between Unit ${i} and Unit ${unitNum}`);
          }
        }
      }
      
      // Show curriculum expectations
      const unitExpectations = unit.expectations.map(e => e.expectation.code);
      console.log(`Expectations: [${unitExpectations.join(', ')}]`);
      
      totalLessons += unit.lessonPlans.length;
    }
    
    console.log(`\n📊 TOTALS: ${totalLessons}/97 lessons (${totalLessons === 97 ? '✅' : '❌'})`);
    
    // Check buffer time
    console.log('\n📅 BUFFER TIME ANALYSIS:');
    const schoolYearStart = new Date('2025-09-02');
    const schoolYearEnd = new Date('2026-06-26');
    const firstUnitStart = new Date(units[0].startDate);
    const lastUnitEnd = new Date(units[units.length - 1].endDate);
    
    const startBuffer = Math.floor((firstUnitStart.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const endBuffer = Math.floor((schoolYearEnd.getTime() - lastUnitEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`Start buffer: ${startBuffer} days (need 5+ days)`);
    console.log(`End buffer: ${endBuffer} days (need 10+ days)`);
    
    console.log('\n🎯 PHASE 1 PRIORITY FIXES NEEDED:');
    console.log('1. Unit 3: Must end by December 18, 2025 (before Christmas break)');
    console.log('2. Units 3-4: Eliminate 19-day gap');
    console.log('3. Unit 6: Fix weekend start date');
    console.log('4. Overall: Add proper buffer time at start and end');
    
  } catch (error) {
    console.error('❌ Error examining units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCurrentSocialStudiesUnits();