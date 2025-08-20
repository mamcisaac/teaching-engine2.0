import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryFrenchLessonsUnits1to8() {
  try {
    console.log('🔍 Querying French lessons for Emily\'s Units 1-8...\n');

    // First, get Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Emily'
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily not found in database');
      return;
    }

    console.log(`✅ Found Emily (ID: ${emily.id})\n`);

    // Get French units 1-8 with their lessons
    const frenchUnits = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: {
            contains: 'Français'
          }
        },
        title: {
          contains: 'Unit'
        }
      },
      include: {
        longRangePlan: {
          select: {
            title: true,
            subject: true,
            grade: true
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
            action: true,
            consolidation: true,
            mindsOnFr: true,
            actionFr: true,
            consolidationFr: true,
            learningGoals: true,
            learningGoalsFr: true,
            materials: true,
            accommodations: true,
            assessmentType: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    console.log(`📊 Found ${frenchUnits.length} French units\n`);

    // Filter for Units 1-8 specifically
    const units1to8 = frenchUnits.filter(unit => {
      const titleLower = unit.title.toLowerCase();
      return titleLower.includes('unit 1') || titleLower.includes('unit 2') || 
             titleLower.includes('unit 3') || titleLower.includes('unit 4') ||
             titleLower.includes('unit 5') || titleLower.includes('unit 6') ||
             titleLower.includes('unit 7') || titleLower.includes('unit 8') ||
             titleLower.includes('unité 1') || titleLower.includes('unité 2') ||
             titleLower.includes('unité 3') || titleLower.includes('unité 4') ||
             titleLower.includes('unité 5') || titleLower.includes('unité 6') ||
             titleLower.includes('unité 7') || titleLower.includes('unité 8');
    });

    console.log(`🎯 Focus: Units 1-8 (${units1to8.length} units found)\n`);

    let totalLessons = 0;
    let lessonsWithFullETFO = 0;
    let lessonsWithFrench = 0;
    let lessonsNeedingWork = 0;

    for (const unit of units1to8) {
      console.log(`\n📚 ${unit.title}`);
      console.log(`   📖 Long Range Plan: ${unit.longRangePlan.title}`);
      console.log(`   🗓️ Period: ${unit.startDate.toDateString()} - ${unit.endDate.toDateString()}`);
      console.log(`   📝 Lessons: ${unit.lessonPlans.length}`);
      
      totalLessons += unit.lessonPlans.length;

      if (unit.lessonPlans.length > 0) {
        console.log(`   \n   📋 Lesson Analysis:`);
        
        for (let i = 0; i < Math.min(3, unit.lessonPlans.length); i++) {
          const lesson = unit.lessonPlans[i];
          
          console.log(`   \n   Lesson ${i + 1}: ${lesson.title || lesson.titleFr || 'No title'}`);
          
          // Check ETFO structure
          const hasMindsOn = !!(lesson.mindsOn || lesson.mindsOnFr);
          const hasAction = !!(lesson.action || lesson.actionFr);
          const hasConsolidation = !!(lesson.consolidation || lesson.consolidationFr);
          const hasLearningGoals = !!(lesson.learningGoals || lesson.learningGoalsFr);
          const hasMaterials = lesson.materials && JSON.stringify(lesson.materials) !== '[]';
          const hasAccommodations = lesson.accommodations && JSON.stringify(lesson.accommodations) !== '[]';
          
          const etfoScore = [hasMindsOn, hasAction, hasConsolidation, hasLearningGoals, hasMaterials, hasAccommodations].filter(Boolean).length;
          
          if (etfoScore >= 5) lessonsWithFullETFO++;
          if (lesson.titleFr || lesson.mindsOnFr || lesson.actionFr || lesson.consolidationFr || lesson.learningGoalsFr) lessonsWithFrench++;
          if (etfoScore < 4) lessonsNeedingWork++;
          
          console.log(`     - ETFO Structure: ${etfoScore}/6 components`);
          console.log(`     - Has French content: ${lesson.titleFr || lesson.mindsOnFr || lesson.actionFr ? '✅' : '❌'}`);
          console.log(`     - Duration: ${lesson.duration} minutes`);
          console.log(`     - Assessment: ${lesson.assessmentType || 'Not specified'}`);
          console.log(`     - Materials: ${hasMaterials ? '✅' : '❌'}`);
          console.log(`     - Accommodations: ${hasAccommodations ? '✅' : '❌'}`);
        }
        
        if (unit.lessonPlans.length > 3) {
          console.log(`     ... and ${unit.lessonPlans.length - 3} more lessons`);
        }
      }
      
      console.log(`   ─────────────────────────────────────────────────────`);
    }

    // Summary report
    console.log(`\n\n🎯 FRENCH LESSONS UNITS 1-8 ANALYSIS SUMMARY`);
    console.log(`════════════════════════════════════════════════════════`);
    console.log(`📊 Total Units 1-8: ${units1to8.length}`);
    console.log(`📝 Total Lessons: ${totalLessons}`);
    console.log(`✅ Lessons with Full ETFO Structure (5+ components): ${lessonsWithFullETFO}`);
    console.log(`🇫🇷 Lessons with French Content: ${lessonsWithFrench}`);
    console.log(`⚠️ Lessons Needing Major Work (< 4 components): ${lessonsNeedingWork}`);
    
    const completionRate = totalLessons > 0 ? Math.round((lessonsWithFullETFO / totalLessons) * 100) : 0;
    console.log(`📈 ETFO Compliance Rate: ${completionRate}%`);
    
    console.log(`\n🎯 MISSION SCOPE FOR AGENTS 17-24:`);
    console.log(`- Perfect ${totalLessons} lessons across ${units1to8.length} units`);
    console.log(`- Apply ETFO 3-part structure to all lessons`);
    console.log(`- Ensure Grade 1 developmental appropriateness`);
    console.log(`- Maintain French immersion focus`);
    console.log(`- Embed assessment and differentiation`);
    
    if (totalLessons !== 184) {
      console.log(`\n⚠️ IMPORTANT: Expected 184 lessons (23 per unit × 8 units) but found ${totalLessons}`);
      console.log(`This discrepancy needs to be addressed in the perfection process.`);
    }

  } catch (error) {
    console.error('❌ Error querying French lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryFrenchLessonsUnits1to8().catch(console.error);