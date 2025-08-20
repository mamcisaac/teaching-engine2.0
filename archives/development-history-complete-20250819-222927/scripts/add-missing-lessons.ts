import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingLessons() {
  try {
    console.log('🔧 ADDING MISSING LESSONS TO REACH 97 TOTAL');
    console.log('===============================================================================');
    
    // First, let's find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } },
          { name: { contains: 'McIsaac' } }
        ]
      }
    });
    
    if (emily) {
      console.log(`Found Emily: ${emily.name} (ID: ${emily.id})`);
    } else {
      console.log('Emily not found, using user ID 1');
    }
    
    const userId = emily ? emily.id : 1;
    
    // Get current lesson counts
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: { orderBy: { date: 'asc' } }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n📊 CURRENT LESSON COUNTS:');
    let totalLessons = 0;
    units.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${unit.lessonPlans.length} lessons`);
      totalLessons += unit.lessonPlans.length;
    });
    
    console.log(`Total: ${totalLessons}/97 lessons (need ${97 - totalLessons} more)`);
    
    // Strategy: Add lessons to units that need them most
    const lessonAdditions = [
      { unitIndex: 2, add: 3, reason: 'Unit 3 too short (9 lessons)' }, // Unit 3
      { unitIndex: 5, add: 1, reason: 'Unit 6 citizenship complexity' }, // Unit 6  
      { unitIndex: 6, add: 1, reason: 'Unit 7 culminating balance' }     // Unit 7
    ];
    
    console.log('\n🎯 LESSON ADDITION PLAN:');
    lessonAdditions.forEach(plan => {
      const unit = units[plan.unitIndex];
      console.log(`Unit ${plan.unitIndex + 1} (${unit.title}): +${plan.add} lessons (${plan.reason})`);
    });
    
    console.log('\n🔧 ADDING LESSONS...');
    
    for (const addition of lessonAdditions) {
      const unit = units[addition.unitIndex];
      const unitNum = addition.unitIndex + 1;
      
      console.log(`\n📝 Adding ${addition.add} lessons to Unit ${unitNum}:`);
      
      // Find the date range for this unit
      const unitStart = new Date(unit.startDate);
      const unitEnd = new Date(unit.endDate);
      
      // Get existing lesson dates to avoid conflicts
      const existingDates = unit.lessonPlans.map(l => new Date(l.date).getTime());
      
      // Generate new lesson dates within the unit timeframe
      for (let i = 1; i <= addition.add; i++) {
        let attempts = 0;
        let lessonDate = null;
        
        // Try to find a good date within the unit timeframe
        while (attempts < 50 && !lessonDate) {
          const testDate = new Date(unitStart);
          const rangeInDays = Math.floor((unitEnd.getTime() - unitStart.getTime()) / (1000 * 60 * 60 * 24));
          const randomDays = Math.floor(Math.random() * rangeInDays);
          testDate.setDate(testDate.getDate() + randomDays);
          
          // Ensure it's a weekday
          if (testDate.getDay() !== 0 && testDate.getDay() !== 6) {
            // Ensure it's not during Christmas break
            if (!(testDate >= new Date('2025-12-19') && testDate <= new Date('2026-01-05'))) {
              // Ensure it's not a duplicate
              if (!existingDates.includes(testDate.getTime())) {
                lessonDate = testDate;
              }
            }
          }
          attempts++;
        }
        
        // If we couldn't find a date within unit timeframe, use end of unit
        if (!lessonDate) {
          lessonDate = new Date(unitEnd);
          lessonDate.setDate(lessonDate.getDate() + i);
          while (lessonDate.getDay() === 0 || lessonDate.getDay() === 6) {
            lessonDate.setDate(lessonDate.getDate() + 1);
          }
        }
        
        // Create the lesson
        try {
          const newLesson = await prisma.eTFOLessonPlan.create({
            data: {
              userId: userId,
              title: `${unit.title} - Leçon supplémentaire ${i}`,
              unitPlanId: unit.id,
              date: lessonDate,
              duration: 45,
              mindsOn: 'Activation des connaissances antérieures et connexions aux apprentissages précédents.',
              action: 'Exploration approfondie des concepts clés à travers des activités engageantes en français immersion.',
              consolidation: 'Réflexion, synthèse et application des nouveaux apprentissages dans des contextes authentiques.',
              learningGoals: 'Développer une compréhension approfondie des concepts de l\'unité tout en renforçant les compétences linguistiques françaises.',
              grade: 1,
              language: 'fr',
              subject: 'Sciences humaines',
              isSubFriendly: true
            }
          });
          
          console.log(`  ✅ Added lesson ${i} on ${lessonDate.toDateString()}: ${newLesson.title}`);
          existingDates.push(lessonDate.getTime()); // Avoid future conflicts
          
        } catch (error) {
          console.log(`  ❌ Error adding lesson ${i}:`, error.message);
        }
      }
      
      // Update unit estimated hours
      const newLessonCount = unit.lessonPlans.length + addition.add;
      const newHours = Math.round(newLessonCount * 0.75);
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: { estimatedHours: newHours }
      });
      
      console.log(`  📊 Updated Unit ${unitNum}: ${newLessonCount} lessons, ${newHours} hours`);
    }
    
    console.log('\n📊 FINAL VERIFICATION:');
    
    // Get updated counts
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        lessonPlans: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    let finalTotalLessons = 0;
    let finalTotalHours = 0;
    
    updatedUnits.forEach((unit, index) => {
      console.log(`Unit ${index + 1}: ${unit.lessonPlans.length} lessons, ${unit.estimatedHours} hours`);
      finalTotalLessons += unit.lessonPlans.length;
      finalTotalHours += unit.estimatedHours || 0;
    });
    
    console.log(`\nFinal totals: ${finalTotalLessons}/97 lessons, ${finalTotalHours}/73 hours`);
    
    if (finalTotalLessons === 97) {
      console.log('\n🎉 SUCCESS: EXACT LESSON COUNT ACHIEVED!');
      console.log('✅ 97 lessons distributed across 7 units');
      console.log('✅ Ready for Phase 4: Final verification and polishing');
    } else {
      console.log(`\n⚠️ LESSON COUNT: ${finalTotalLessons}/97`);
      if (finalTotalLessons < 97) {
        console.log(`Still need ${97 - finalTotalLessons} more lessons`);
      } else {
        console.log(`Have ${finalTotalLessons - 97} extra lessons to remove`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error adding missing lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingLessons();