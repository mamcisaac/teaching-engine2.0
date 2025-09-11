import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySocialStudiesUnits() {
  try {
    console.log('🔍 VERIFYING SOCIAL STUDIES UNIT PLANS');
    
    const lrp = await prisma.longRangePlan.findFirst({
      where: { id: 'cmebyc98s0007vjr1v0a2ibp5' }
    });
    
    if (!lrp) {
      console.log('❌ LRP not found');
      return;
    }
    
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: lrp.id },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            title: true,
            date: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`\nFound ${units.length} units for ${lrp.subject}`);
    
    const christmasStart = new Date('2025-12-19');
    const christmasEnd = new Date('2026-01-05');
    
    let totalLessons = 0;
    let totalHours = 0;
    let issues = [];
    
    console.log('\n📊 UNIT ANALYSIS:');
    console.log('=' .repeat(80));
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const lessonCount = unit.lessonPlans.length;
      totalLessons += lessonCount;
      totalHours += unit.estimatedHours || 0;
      
      console.log(`\nUnit ${i + 1}: ${unit.title}`);
      console.log(`  Dates: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`  Lessons: ${lessonCount}`);
      console.log(`  Hours: ${unit.estimatedHours}`);
      
      // Check dates
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      
      // Weekend check
      if (startDate.getDay() === 0 || startDate.getDay() === 6) {
        issues.push(`Unit ${i + 1} starts on weekend (${startDate.toDateString()})`);
        console.log(`  ⚠️ STARTS ON WEEKEND`);
      }
      
      if (endDate.getDay() === 0 || endDate.getDay() === 6) {
        issues.push(`Unit ${i + 1} ends on weekend (${endDate.toDateString()})`);
        console.log(`  ⚠️ ENDS ON WEEKEND`);
      }
      
      // Christmas check
      if (startDate < christmasEnd && endDate > christmasStart) {
        issues.push(`Unit ${i + 1} spans Christmas break`);
        console.log(`  ⚠️ SPANS CHRISTMAS BREAK`);
      }
      
      // Lesson date analysis
      if (unit.lessonPlans.length > 0) {
        const firstLesson = new Date(unit.lessonPlans[0].date);
        const lastLesson = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        
        console.log(`  First lesson: ${firstLesson.toDateString()}`);
        console.log(`  Last lesson: ${lastLesson.toDateString()}`);
        
        // Check for lessons during Christmas
        const christmasLessons = unit.lessonPlans.filter(l => {
          const d = new Date(l.date);
          return d >= christmasStart && d <= christmasEnd;
        });
        
        if (christmasLessons.length > 0) {
          issues.push(`Unit ${i + 1} has ${christmasLessons.length} lessons during Christmas break`);
          console.log(`  ⚠️ ${christmasLessons.length} LESSONS DURING CHRISTMAS`);
        }
      }
      
      // Expectations
      const expectations = unit.expectations.map(e => e.expectation.code).join(', ');
      console.log(`  Expectations: ${expectations || 'NONE'}`);
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log('\n📊 SUMMARY:');
    console.log(`  Total Units: ${units.length}`);
    console.log(`  Total Lessons: ${totalLessons} (target: 97)`);
    console.log(`  Total Hours: ${totalHours} (target: 73, tolerance: 72.75 ± 0.25)`);
    
    console.log('\n✅ CHECKS:');
    console.log(`  Units: ${units.length === 7 ? '✅' : '❌'} (${units.length}/7)`);
    console.log(`  Lessons: ${totalLessons === 97 ? '✅' : '❌'} (${totalLessons}/97)`);
    console.log(`  Hours: ${Math.abs(totalHours - 72.75) <= 0.25 ? '✅' : '❌'} (${totalHours}/72.75)`);
    
    if (issues.length > 0) {
      console.log('\n⚠️ ISSUES FOUND:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ NO ISSUES FOUND!');
    }
    
    // Lesson distribution check
    console.log('\n📅 LESSON DISTRIBUTION BY MONTH:');
    const monthlyLessons: Record<string, number> = {};
    
    for (const unit of units) {
      for (const lesson of unit.lessonPlans) {
        const date = new Date(lesson.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyLessons[monthKey] = (monthlyLessons[monthKey] || 0) + 1;
      }
    }
    
    const months = [
      '2025-09', '2025-10', '2025-11', '2025-12',
      '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'
    ];
    
    for (const month of months) {
      const count = monthlyLessons[month] || 0;
      console.log(`  ${month}: ${count} lessons`);
    }
    
    const perfectStatus = units.length === 7 && 
                         totalLessons === 97 && 
                         Math.abs(totalHours - 72.75) <= 0.25 && 
                         issues.length === 0;
    
    if (perfectStatus) {
      console.log('\n🎉 UNIT PLANS ARE PERFECT! 🎉');
    } else {
      console.log('\n⚠️ UNIT PLANS NEED ADJUSTMENT');
      console.log('Missing ' + (97 - totalLessons) + ' lessons');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySocialStudiesUnits();