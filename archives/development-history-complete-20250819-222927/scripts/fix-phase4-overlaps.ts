import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPhase4Overlaps() {
  try {
    console.log('🔧 FIXING PHASE 4 OVERLAPS');
    console.log('Goal: Eliminate overlaps while maintaining optimization');
    console.log('===============================================================================');
    
    // Get current units
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n🚨 CURRENT OVERLAPS IDENTIFIED:');
    
    // Check overlaps
    for (let i = 0; i < units.length - 1; i++) {
      const currentUnit = units[i];
      const nextUnit = units[i + 1];
      
      const currentEnd = new Date(currentUnit.endDate);
      const nextStart = new Date(nextUnit.startDate);
      const gap = Math.floor((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24));
      
      if (gap < 0) {
        console.log(`Unit ${i + 1} overlaps with Unit ${i + 2} by ${Math.abs(gap)} days`);
        console.log(`  Unit ${i + 1} ends: ${currentEnd.toDateString()}`);
        console.log(`  Unit ${i + 2} starts: ${nextStart.toDateString()}`);
      }
    }
    
    console.log('\n🔧 FIXING OVERLAPS...');
    
    // Fix Unit 1-2 overlap (6 days)
    const unit1 = units[0];
    const unit2 = units[1];
    
    console.log('\n1️⃣ FIXING UNIT 1-2 OVERLAP:');
    console.log(`Current: Unit 1 ends ${new Date(unit1.endDate).toDateString()}, Unit 2 starts ${new Date(unit2.startDate).toDateString()}`);
    
    // Set Unit 1 end to be 1 day before Unit 2 starts
    const newUnit1End = new Date(unit2.startDate);
    newUnit1End.setDate(newUnit1End.getDate() - 1);
    
    // Ensure it's a weekday
    while (newUnit1End.getDay() === 0 || newUnit1End.getDay() === 6) {
      newUnit1End.setDate(newUnit1End.getDate() - 1);
    }
    
    await prisma.unitPlan.update({
      where: { id: unit1.id },
      data: { endDate: newUnit1End }
    });
    
    console.log(`✅ Updated Unit 1 end to: ${newUnit1End.toDateString()}`);
    
    // Fix Unit 6-7 overlap (14 days)
    const unit6 = units[5];
    const unit7 = units[6];
    
    console.log('\n2️⃣ FIXING UNIT 6-7 OVERLAP:');
    console.log(`Current: Unit 6 ends ${new Date(unit6.endDate).toDateString()}, Unit 7 starts ${new Date(unit7.startDate).toDateString()}`);
    
    // Set Unit 6 end to be 1 day before Unit 7 starts
    const newUnit6End = new Date(unit7.startDate);
    newUnit6End.setDate(newUnit6End.getDate() - 1);
    
    // Ensure it's a weekday
    while (newUnit6End.getDay() === 0 || newUnit6End.getDay() === 6) {
      newUnit6End.setDate(newUnit6End.getDate() - 1);
    }
    
    await prisma.unitPlan.update({
      where: { id: unit6.id },
      data: { endDate: newUnit6End }
    });
    
    console.log(`✅ Updated Unit 6 end to: ${newUnit6End.toDateString()}`);
    
    // Fix start buffer (need 5+ days)
    console.log('\n3️⃣ FIXING START BUFFER:');
    
    const schoolYearStart = new Date('2025-09-02');
    const currentFirstUnitStart = new Date(unit1.startDate);
    const currentStartBuffer = Math.floor((currentFirstUnitStart.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`Current start buffer: ${currentStartBuffer} days (need 5+)`);
    
    if (currentStartBuffer < 5) {
      // Calculate new start date with 5-day buffer
      const newUnit1Start = new Date(schoolYearStart);
      let daysAdded = 0;
      
      // Add 5 school days
      while (daysAdded < 5) {
        newUnit1Start.setDate(newUnit1Start.getDate() + 1);
        if (newUnit1Start.getDay() !== 0 && newUnit1Start.getDay() !== 6) {
          daysAdded++;
        }
      }
      
      await prisma.unitPlan.update({
        where: { id: unit1.id },
        data: { startDate: newUnit1Start }
      });
      
      console.log(`✅ Updated Unit 1 start to: ${newUnit1Start.toDateString()}`);
      
      const newStartBuffer = Math.floor((newUnit1Start.getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`New start buffer: ${newStartBuffer} days`);
    }
    
    console.log('\n📊 VERIFYING FIXES:');
    
    // Get updated units
    const fixedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    let totalLessons = 0;
    let totalHours = 0;
    let hasOverlaps = false;
    
    console.log('\nUnit progression:');
    fixedUnits.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`  Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
      
      // Check for overlaps
      if (index < fixedUnits.length - 1) {
        const nextUnit = fixedUnits[index + 1];
        const gap = Math.floor((new Date(nextUnit.startDate).getTime() - new Date(unit.endDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 0) {
          console.log(`  🚨 OVERLAP with Unit ${index + 2}: ${Math.abs(gap)} days`);
          hasOverlaps = true;
        } else {
          console.log(`  ✅ Gap to Unit ${index + 2}: ${gap} days`);
        }
      }
    });
    
    // Check buffers
    const finalStartBuffer = Math.floor((new Date(fixedUnits[0].startDate).getTime() - schoolYearStart.getTime()) / (1000 * 60 * 60 * 24));
    const schoolYearEnd = new Date('2026-06-26');
    const finalEndBuffer = Math.floor((schoolYearEnd.getTime() - new Date(fixedUnits[fixedUnits.length - 1].endDate).getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`\nFinal totals: ${totalLessons}/97 lessons, ${totalHours}/73 hours`);
    console.log(`Start buffer: ${finalStartBuffer} days ${finalStartBuffer >= 5 ? '✅' : '❌'}`);
    console.log(`End buffer: ${finalEndBuffer} days ${finalEndBuffer >= 10 ? '✅' : '❌'}`);
    
    if (!hasOverlaps && totalLessons === 97 && finalStartBuffer >= 5 && finalEndBuffer >= 10) {
      console.log('\n🎉 PHASE 4 FIXES COMPLETED SUCCESSFULLY!');
      console.log('✅ All overlaps eliminated');
      console.log('✅ Perfect lesson count maintained');
      console.log('✅ Adequate buffers restored');
      console.log('✅ Seamless unit progression achieved');
      console.log('\n🔄 Ready for Phase 5: Assessment buffers and flexibility');
    } else {
      console.log('\n⚠️ REMAINING ISSUES:');
      if (hasOverlaps) console.log('❌ Overlaps still exist');
      if (totalLessons !== 97) console.log(`❌ Lesson count: ${totalLessons}/97`);
      if (finalStartBuffer < 5) console.log(`❌ Start buffer: ${finalStartBuffer} days`);
      if (finalEndBuffer < 10) console.log(`❌ End buffer: ${finalEndBuffer} days`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Phase 4 overlaps:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPhase4Overlaps();