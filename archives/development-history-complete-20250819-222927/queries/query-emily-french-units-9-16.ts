import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/*
🎯 PHASE 2 PART 2: Query Emily's French Units 9-16
════════════════════════════════════════════════════

Query Emily's French immersion Units 9-16 to understand current state 
before perfecting the final 184 lessons for Agents 25-32 coordination.
*/

async function queryEmilyFrenchUnits9to16() {
  try {
    console.log('🎯 PHASE 2 PART 2: Querying Emily\'s French Units 9-16\n');
    console.log('══════════════════════════════════════════════════════════\n');

    // Get Emily
    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily' } }
    });

    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }

    console.log(`📋 Found Emily: ${emily.name} (ID: ${emily.id})\n`);

    // Get all French units to understand full structure
    const allFrenchUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français langue première'
        }
      },
      include: {
        longRangePlan: {
          select: {
            title: true,
            subject: true,
            academicYear: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true,
            titleFr: true,
            date: true,
            duration: true,
            mindsOn: true,
            mindsOnFr: true,
            action: true,
            actionFr: true,
            consolidation: true,
            consolidationFr: true,
            learningGoals: true,
            learningGoalsFr: true,
            materials: true,
            accommodations: true,
            differentiationStrategies: true,
            assessmentType: true,
            indigenousPerspectives: true
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`🇫🇷 FRENCH UNITS OVERVIEW:`);
    console.log(`   Total French units found: ${allFrenchUnits.length}`);
    console.log(`   Units 1-8 (completed): First 8 units`);
    console.log(`   Units 9-16 (target): Next 8 units\n`);

    // Display all units with their index
    console.log('📚 ALL FRENCH UNITS BY ORDER:\n');
    allFrenchUnits.forEach((unit, index) => {
      const unitNumber = index + 1;
      const lessonCount = unit.lessonPlans.length;
      const status = unitNumber <= 8 ? '✅ COMPLETED' : '🎯 TARGET';
      
      console.log(`Unit ${unitNumber.toString().padStart(2)}: ${unit.title}`);
      console.log(`        📝 Lessons: ${lessonCount}`);
      console.log(`        📅 Start: ${unit.startDate.toISOString().split('T')[0]}`);
      console.log(`        📅 End: ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`        🎯 Status: ${status}\n`);
    });

    // Focus on Units 9-16 (the target units for Phase 2 Part 2)
    const targetUnits = allFrenchUnits.slice(8, 16);
    
    console.log('🎯 PHASE 2 PART 2 TARGET: Units 9-16');
    console.log('═'.repeat(60));
    
    if (targetUnits.length === 0) {
      console.log('❌ No Units 9-16 found! Need to investigate.');
      return;
    }

    let totalTargetLessons = 0;
    let lessonsWithFrenchContent = 0;
    let lessonsWithDifferentiation = 0;
    let lessonsWithCultural = 0;
    let perfectLessons = 0;

    for (let i = 0; i < targetUnits.length; i++) {
      const unit = targetUnits[i];
      const unitNumber = i + 9; // Units 9-16
      
      console.log(`\n📚 Unit ${unitNumber}: ${unit.title}`);
      console.log('─'.repeat(50));
      console.log(`📝 Total Lessons: ${unit.lessonPlans.length}`);
      console.log(`📅 Date Range: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      
      totalTargetLessons += unit.lessonPlans.length;
      
      // Analyze lessons
      let unitFrenchCount = 0;
      let unitDiffCount = 0;
      let unitCulturalCount = 0;
      let unitPerfectCount = 0;

      unit.lessonPlans.forEach((lesson, lessonIndex) => {
        // Check French content
        const frenchComponents = [
          !!lesson.titleFr,
          !!lesson.mindsOnFr,
          !!lesson.actionFr,
          !!lesson.consolidationFr,
          !!lesson.learningGoalsFr
        ].filter(Boolean).length;
        
        if (frenchComponents === 5) {
          unitFrenchCount++;
          lessonsWithFrenchContent++;
        }
        
        // Check differentiation
        const hasDifferentiation = lesson.differentiationStrategies && 
          JSON.stringify(lesson.differentiationStrategies) !== '[]' && 
          JSON.stringify(lesson.differentiationStrategies) !== 'null';
        if (hasDifferentiation) {
          unitDiffCount++;
          lessonsWithDifferentiation++;
        }
        
        // Check cultural connections
        const hasCultural = !!lesson.indigenousPerspectives;
        if (hasCultural) {
          unitCulturalCount++;
          lessonsWithCultural++;
        }
        
        // Check overall perfection
        const hasBasicComponents = lesson.materials && lesson.accommodations && lesson.assessmentType && lesson.duration;
        if (frenchComponents === 5 && hasDifferentiation && hasCultural && hasBasicComponents) {
          unitPerfectCount++;
          perfectLessons++;
        }
        
        // Sample first lesson details
        if (lessonIndex === 0) {
          console.log(`\n   📋 Sample Lesson 1: "${lesson.title}"`);
          console.log(`      🇫🇷 French Title: "${lesson.titleFr || 'Missing'}"`);
          console.log(`      📝 French Content: ${frenchComponents}/5 components`);
          console.log(`      🎯 Differentiation: ${hasDifferentiation ? 'Present' : 'Missing'}`);
          console.log(`      🌍 Cultural: ${hasCultural ? 'Present' : 'Missing'}`);
          console.log(`      ⏱️ Duration: ${lesson.duration} minutes`);
        }
      });
      
      // Unit summary
      const frenchRate = unit.lessonPlans.length > 0 ? Math.round((unitFrenchCount / unit.lessonPlans.length) * 100) : 0;
      const diffRate = unit.lessonPlans.length > 0 ? Math.round((unitDiffCount / unit.lessonPlans.length) * 100) : 0;
      const culturalRate = unit.lessonPlans.length > 0 ? Math.round((unitCulturalCount / unit.lessonPlans.length) * 100) : 0;
      const perfectRate = unit.lessonPlans.length > 0 ? Math.round((unitPerfectCount / unit.lessonPlans.length) * 100) : 0;
      
      console.log(`\n   📊 UNIT ${unitNumber} ANALYSIS:`);
      console.log(`      🇫🇷 French Content: ${unitFrenchCount}/${unit.lessonPlans.length} (${frenchRate}%)`);
      console.log(`      🎯 Differentiation: ${unitDiffCount}/${unit.lessonPlans.length} (${diffRate}%)`);
      console.log(`      🌍 Cultural Connections: ${unitCulturalCount}/${unit.lessonPlans.length} (${culturalRate}%)`);
      console.log(`      🏆 Perfect Lessons: ${unitPerfectCount}/${unit.lessonPlans.length} (${perfectRate}%)`);
      
      if (perfectRate === 100) {
        console.log(`      ✅ STATUS: ALREADY PERFECT!`);
      } else if (perfectRate >= 50) {
        console.log(`      🔧 STATUS: NEEDS ENHANCEMENT`);
      } else {
        console.log(`      ⚠️ STATUS: MAJOR PERFECTION NEEDED`);
      }
    }

    // Overall Phase 2 Part 2 Summary
    console.log(`\n\n🎉 PHASE 2 PART 2 CURRENT STATE`);
    console.log(`══════════════════════════════════════════════════════════`);
    console.log(`📚 Units 9-16 Found: ${targetUnits.length}/8`);
    console.log(`📝 Total Target Lessons: ${totalTargetLessons}/184 expected`);
    console.log(`🇫🇷 French Content: ${lessonsWithFrenchContent}/${totalTargetLessons} (${Math.round((lessonsWithFrenchContent/totalTargetLessons)*100)}%)`);
    console.log(`🎯 Differentiation: ${lessonsWithDifferentiation}/${totalTargetLessons} (${Math.round((lessonsWithDifferentiation/totalTargetLessons)*100)}%)`);
    console.log(`🌍 Cultural Connections: ${lessonsWithCultural}/${totalTargetLessons} (${Math.round((lessonsWithCultural/totalTargetLessons)*100)}%)`);
    console.log(`🏆 Perfect Lessons: ${perfectLessons}/${totalTargetLessons} (${Math.round((perfectLessons/totalTargetLessons)*100)}%)`);

    // Mission readiness assessment
    const perfectionNeeded = totalTargetLessons - perfectLessons;
    console.log(`\n🎯 AGENTS 25-32 MISSION SCOPE:`);
    console.log(`   📝 Lessons requiring perfection: ${perfectionNeeded}/${totalTargetLessons}`);
    
    if (perfectionNeeded === 0) {
      console.log(`   🏆 All lessons already perfect! Phase 2 Part 2 complete!`);
    } else if (targetUnits.length === 8 && totalTargetLessons === 184) {
      console.log(`   ✅ All 8 units and 184 lessons found - ready for perfection work`);
      console.log(`   🔧 Perfection needed on ${perfectionNeeded} lessons`);
    } else {
      console.log(`   ⚠️ Missing units or lessons - investigate before proceeding`);
    }

  } catch (error) {
    console.error('❌ Error querying Emily\'s French Units 9-16:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyFrenchUnits9to16().catch(console.error);