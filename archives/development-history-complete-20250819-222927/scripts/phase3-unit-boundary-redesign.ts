import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function phase3UnitBoundaryRedesign() {
  try {
    console.log('🔧 PHASE 3: UNIT BOUNDARY REDESIGN');
    console.log('Goals: Eliminate overlaps, achieve 97 lessons, seamless progression');
    console.log('===============================================================================');
    
    // Get current state
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📊 CURRENT STATE ANALYSIS:');
    let totalLessons = 0;
    let totalHours = 0;
    
    units.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${unit.title}`);
      console.log(`  Dates: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`  Lessons: ${unit.lessonPlans.length} | Hours: ${unit.estimatedHours}`);
      
      totalLessons += unit.lessonPlans.length;
      totalHours += unit.estimatedHours || 0;
      
      // Check for overlaps with next unit
      if (index < units.length - 1) {
        const nextUnit = units[index + 1];
        const thisEnd = new Date(unit.endDate);
        const nextStart = new Date(nextUnit.startDate);
        const gap = Math.floor((nextStart.getTime() - thisEnd.getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 0) {
          console.log(`  🚨 OVERLAP with Unit ${index + 2}: ${Math.abs(gap)} days`);
        } else if (gap > 25) {
          console.log(`  ⚠️ LARGE GAP to Unit ${index + 2}: ${gap} days`);
        } else {
          console.log(`  ✅ Good gap to Unit ${index + 2}: ${gap} days`);
        }
      }
    });
    
    console.log(`\nCurrent totals: ${totalLessons}/97 lessons, ${totalHours}/73 hours`);
    console.log(`Need to add: ${97 - totalLessons} lessons, ${73 - totalHours} hours`);
    
    console.log('\n🎯 REDESIGN STRATEGY:');
    console.log('1. Fix overlaps by adjusting unit boundaries');
    console.log('2. Redistribute lessons to reach 97 total');
    console.log('3. Ensure every-other-day feasibility');
    console.log('4. Maintain pedagogical progression');
    
    // Define ideal lesson distribution (target 97 lessons)
    const idealDistribution = [
      { unit: 1, lessons: 14, rationale: 'Foundation unit - adequate time' },
      { unit: 2, lessons: 14, rationale: 'Complex community helpers content' },
      { unit: 3, lessons: 12, rationale: 'Shorter due to Christmas break' },
      { unit: 4, lessons: 14, rationale: 'Geographic concepts need time' },
      { unit: 5, lessons: 14, rationale: 'Cartography skills development' },
      { unit: 6, lessons: 15, rationale: 'Complex citizenship concepts' },
      { unit: 7, lessons: 14, rationale: 'Culminating global connections' }
    ];
    
    const totalIdealLessons = idealDistribution.reduce((sum, item) => sum + item.lessons, 0);
    console.log(`\n📋 IDEAL DISTRIBUTION (${totalIdealLessons} lessons):`);;
    idealDistribution.forEach(item => {
      console.log(`Unit ${item.unit}: ${item.lessons} lessons (${item.rationale})`);
    });
    
    console.log('\n🔧 EXECUTING BOUNDARY REDESIGN...');
    
    // Step 1: Fix Unit 1-2 overlap (3 days)
    console.log('\n1️⃣ FIXING UNIT 1-2 OVERLAP:');
    const unit1 = units[0];
    const unit2 = units[1];
    
    console.log(`Current Unit 1 end: ${new Date(unit1.endDate).toDateString()}`);
    console.log(`Current Unit 2 start: ${new Date(unit2.startDate).toDateString()}`);
    
    // Adjust Unit 1 end date to be 1 day before Unit 2 starts
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
    
    // Step 2: Fix Unit 6-7 overlap (11 days)
    console.log('\n2️⃣ FIXING UNIT 6-7 OVERLAP:');
    const unit6 = units[5];
    const unit7 = units[6];
    
    console.log(`Current Unit 6 end: ${new Date(unit6.endDate).toDateString()}`);
    console.log(`Current Unit 7 start: ${new Date(unit7.startDate).toDateString()}`);
    
    // Calculate midpoint to split the overlap
    const unit6End = new Date(unit6.endDate);
    const unit7Start = new Date(unit7.startDate);
    const overlapDays = Math.floor((unit6End.getTime() - unit7Start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Set new Unit 6 end to be 1 day before Unit 7 should start
    const newUnit6End = new Date(unit7Start);
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
    
    // Step 3: Add missing lessons strategically
    console.log('\n3️⃣ ADDING MISSING LESSONS:');
    const lessonsToAdd = 97 - totalLessons;
    console.log(`Need to add ${lessonsToAdd} lessons total`);
    
    // Distribute additional lessons based on ideal distribution
    const lessonAdditions = [
      { unitIndex: 2, add: 3, rationale: 'Unit 3 too short at 9 lessons' },
      { unitIndex: 5, add: 1, rationale: 'Unit 6 needs more for citizenship complexity' },
      { unitIndex: 6, add: 1, rationale: 'Unit 7 culminating unit needs balance' }
    ];
    
    for (const addition of lessonAdditions) {
      const unit = units[addition.unitIndex];
      console.log(`Adding ${addition.add} lessons to Unit ${addition.unitIndex + 1}: ${addition.rationale}`);
      
      // Get the last lesson date for this unit
      const lastLesson = unit.lessonPlans.length > 0 ? 
        new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date) :
        new Date(unit.startDate);
      
      // Add new lessons
      for (let i = 1; i <= addition.add; i++) {
        const newLessonDate = new Date(lastLesson);
        
        // Find the next available school day for every-other-day pattern
        let daysToAdd = 2; // Every other day
        if (unit.lessonPlans.length === 0) {
          daysToAdd = 1; // First lesson starts immediately
        }
        
        newLessonDate.setDate(newLessonDate.getDate() + (daysToAdd * i));
        
        // Ensure weekday
        while (newLessonDate.getDay() === 0 || newLessonDate.getDay() === 6) {
          newLessonDate.setDate(newLessonDate.getDate() + 1);
        }
        
        // Avoid Christmas break
        if (newLessonDate >= new Date('2025-12-19') && newLessonDate <= new Date('2026-01-05')) {
          newLessonDate.setDate(new Date('2026-01-06').getDate());
          while (newLessonDate.getDay() === 0 || newLessonDate.getDay() === 6) {
            newLessonDate.setDate(newLessonDate.getDate() + 1);
          }
        }
        
        try {
          await prisma.eTFOLessonPlan.create({
            data: {
              userId: 1, // Emily's user ID
              title: `${unit.title} - Leçon ${unit.lessonPlans.length + i}`,
              unitPlanId: unit.id,
              date: newLessonDate,
              duration: 45,
              mindsOn: 'Activation des connaissances antérieures en français',
              action: 'Exploration active du contenu en français immersion',
              consolidation: 'Réflexion et synthèse des apprentissages',
              learningGoals: 'Objectifs d\'apprentissage à définir selon le contenu de l\'unité',
              grade: 1,
              language: 'fr',
              subject: 'Sciences humaines'
            }
          });
          
          console.log(`  ✅ Added lesson ${i} on ${newLessonDate.toDateString()}`);
        } catch (error) {
          console.log(`  ❌ Error adding lesson ${i}:`, error.message);
        }
      }
      
      // Update unit hours
      const newLessonCount = unit.lessonPlans.length + addition.add;
      const newHours = Math.round(newLessonCount * 0.75);
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: { estimatedHours: newHours }
      });
      
      console.log(`  ✅ Updated Unit ${addition.unitIndex + 1} to ${newLessonCount} lessons, ${newHours} hours`);
    }
    
    console.log('\n📊 VERIFYING REDESIGNED BOUNDARIES:');
    
    // Get updated state
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    let newTotalLessons = 0;
    let newTotalHours = 0;
    let overlapsRemain = false;
    
    updatedUnits.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${unit.lessonPlans.length} lessons, ${unit.estimatedHours} hours`);
      
      newTotalLessons += unit.lessonPlans.length;
      newTotalHours += unit.estimatedHours || 0;
      
      // Check overlaps
      if (index < updatedUnits.length - 1) {
        const nextUnit = updatedUnits[index + 1];
        const thisEnd = new Date(unit.endDate);
        const nextStart = new Date(nextUnit.startDate);
        const gap = Math.floor((nextStart.getTime() - thisEnd.getTime()) / (1000 * 60 * 60 * 24));
        
        if (gap < 0) {
          console.log(`  🚨 OVERLAP REMAINS with Unit ${index + 2}: ${Math.abs(gap)} days`);
          overlapsRemain = true;
        } else {
          console.log(`  ✅ Clean boundary to Unit ${index + 2}: ${gap} days`);
        }
      }
    });
    
    console.log(`\nNew totals: ${newTotalLessons}/97 lessons, ${newTotalHours}/73 hours`);
    
    if (newTotalLessons === 97 && !overlapsRemain) {
      console.log('\n🎉 PHASE 3 COMPLETED SUCCESSFULLY!');
      console.log('✅ All overlaps eliminated');
      console.log('✅ Exact lesson count achieved');
      console.log('✅ Seamless unit progression');
      console.log('\n🔄 Ready for Phase 4: Final Date Updates');
    } else {
      console.log('\n⚠️ PHASE 3 PARTIALLY COMPLETED');
      if (newTotalLessons !== 97) {
        console.log(`❌ Lesson count: ${newTotalLessons}/97`);
      }
      if (overlapsRemain) {
        console.log(`❌ Overlaps still exist`);
      }
      console.log('Manual adjustments may be needed');
    }
    
  } catch (error) {
    console.error('❌ Error in Phase 3 unit boundary redesign:', error);
  } finally {
    await prisma.$disconnect();
  }
}

phase3UnitBoundaryRedesign();