import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/*
🎯 DETAILED ANALYSIS: Units 9-16 Current State
════════════════════════════════════════════════════

Comprehensive analysis of Emily's French Units 9-16 lessons
to determine exact perfection requirements for Agents 25-32.
*/

async function analyzeUnits9to16CurrentState() {
  try {
    console.log('🎯 DETAILED ANALYSIS: Units 9-16 Current State\n');
    console.log('════════════════════════════════════════════════════════════\n');

    // Get Emily
    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily' } }
    });

    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }

    // Get French LRP with Units 9-16
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      },
      include: {
        unitPlans: {
          include: {
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
                modifications: true,
                extensions: true,
                differentiationStrategies: true,
                assessmentType: true,
                assessmentNotes: true,
                indigenousPerspectives: true,
                isSubFriendly: true,
                grouping: true
              },
              orderBy: { date: 'asc' }
            }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!frenchLRP) {
      console.log('❌ French LRP not found');
      return;
    }

    // Focus on Units 9-16 (indices 8-15)
    const targetUnits = frenchLRP.unitPlans.slice(8, 16);
    
    console.log(`📚 PHASE 2 PART 2 TARGET: Units 9-16`);
    console.log(`   Found ${targetUnits.length}/8 target units`);
    console.log(`   Expected 184 lessons total (23 per unit)\n`);

    let totalLessons = 0;
    let perfectionNeeded = 0;
    let analysisResults = [];

    for (let i = 0; i < targetUnits.length; i++) {
      const unit = targetUnits[i];
      const unitNumber = i + 9;
      
      console.log(`\n📖 Unit ${unitNumber}: ${unit.title}`);
      console.log('═'.repeat(60));
      console.log(`📅 Date Range: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`📝 Lessons: ${unit.lessonPlans.length}/23 expected`);
      
      totalLessons += unit.lessonPlans.length;
      
      // Analyze lesson quality
      let unitAnalysis = {
        unitNumber,
        title: unit.title,
        lessonCount: unit.lessonPlans.length,
        frenchContent: 0,
        differentiation: 0,
        cultural: 0,
        perfectLessons: 0,
        issues: []
      };

      // Sample first 3 lessons for detailed analysis
      const sampleLessons = unit.lessonPlans.slice(0, 3);
      
      console.log(`\n🔍 DETAILED SAMPLE ANALYSIS (First 3 lessons):`);
      
      sampleLessons.forEach((lesson, lessonIndex) => {
        const lessonNumber = lessonIndex + 1;
        console.log(`\n   📝 Lesson ${lessonNumber}: "${lesson.title}"`);
        
        // French Content Analysis
        const frenchComponents = {
          titleFr: !!lesson.titleFr,
          mindsOnFr: !!lesson.mindsOnFr,
          actionFr: !!lesson.actionFr,
          consolidationFr: !!lesson.consolidationFr,
          learningGoalsFr: !!lesson.learningGoalsFr
        };
        
        const frenchCount = Object.values(frenchComponents).filter(Boolean).length;
        console.log(`      🇫🇷 French Content: ${frenchCount}/5 components`);
        
        Object.entries(frenchComponents).forEach(([key, present]) => {
          const status = present ? '✅' : '❌';
          console.log(`         ${status} ${key}: ${present ? 'Present' : 'Missing'}`);
        });
        
        if (frenchCount === 5) unitAnalysis.frenchContent++;
        
        // ETFO Structure Analysis
        console.log(`\n      📚 ETFO Structure Analysis:`);
        const etfoComponents = {
          mindsOn: !!lesson.mindsOn,
          action: !!lesson.action,
          consolidation: !!lesson.consolidation,
          learningGoals: !!lesson.learningGoals,
          duration: !!lesson.duration,
          materials: lesson.materials && JSON.stringify(lesson.materials) !== '[]',
          accommodations: lesson.accommodations && JSON.stringify(lesson.accommodations) !== '[]'
        };
        
        Object.entries(etfoComponents).forEach(([key, present]) => {
          const status = present ? '✅' : '❌';
          console.log(`         ${status} ${key}: ${present ? 'Present' : 'Missing'}`);
        });
        
        // Differentiation Analysis  
        const hasDifferentiation = lesson.differentiationStrategies && 
          JSON.stringify(lesson.differentiationStrategies) !== '[]' && 
          JSON.stringify(lesson.differentiationStrategies) !== 'null';
        console.log(`      🎯 Differentiation: ${hasDifferentiation ? '✅ Present' : '❌ Missing'}`);
        if (hasDifferentiation) unitAnalysis.differentiation++;
        
        // Cultural Connections
        const hasCultural = !!lesson.indigenousPerspectives;
        console.log(`      🌍 Cultural: ${hasCultural ? '✅ Present' : '❌ Missing'}`);
        if (hasCultural) unitAnalysis.cultural++;
        
        // Assessment
        const hasAssessment = !!lesson.assessmentType;
        console.log(`      📊 Assessment: ${hasAssessment ? '✅ Present' : '❌ Missing'}`);
        
        // Overall Perfection Check
        const isPerfect = frenchCount === 5 && 
                         Object.values(etfoComponents).every(Boolean) &&
                         hasDifferentiation && 
                         hasCultural && 
                         hasAssessment;
        
        console.log(`      🏆 Overall Status: ${isPerfect ? '✅ PERFECT' : '🔧 NEEDS PERFECTION'}`);
        
        if (isPerfect) unitAnalysis.perfectLessons++;
      });
      
      // Full unit assessment (all lessons)
      let fullUnitPerfect = 0;
      let fullUnitFrench = 0;
      let fullUnitDiff = 0;
      let fullUnitCultural = 0;
      
      unit.lessonPlans.forEach(lesson => {
        const frenchCount = [
          !!lesson.titleFr,
          !!lesson.mindsOnFr,
          !!lesson.actionFr,
          !!lesson.consolidationFr,
          !!lesson.learningGoalsFr
        ].filter(Boolean).length;
        
        if (frenchCount === 5) fullUnitFrench++;
        
        const hasDiff = lesson.differentiationStrategies && 
          JSON.stringify(lesson.differentiationStrategies) !== '[]';
        if (hasDiff) fullUnitDiff++;
        
        const hasCultural = !!lesson.indigenousPerspectives;
        if (hasCultural) fullUnitCultural++;
        
        const hasBasics = lesson.materials && lesson.accommodations && lesson.assessmentType && lesson.duration;
        if (frenchCount === 5 && hasDiff && hasCultural && hasBasics) {
          fullUnitPerfect++;
        }
      });
      
      // Unit summary
      console.log(`\n📊 FULL UNIT ${unitNumber} SUMMARY:`);
      console.log(`   🇫🇷 French Content: ${fullUnitFrench}/${unit.lessonPlans.length} (${Math.round((fullUnitFrench/unit.lessonPlans.length)*100)}%)`);
      console.log(`   🎯 Differentiation: ${fullUnitDiff}/${unit.lessonPlans.length} (${Math.round((fullUnitDiff/unit.lessonPlans.length)*100)}%)`);
      console.log(`   🌍 Cultural: ${fullUnitCultural}/${unit.lessonPlans.length} (${Math.round((fullUnitCultural/unit.lessonPlans.length)*100)}%)`);
      console.log(`   🏆 Perfect: ${fullUnitPerfect}/${unit.lessonPlans.length} (${Math.round((fullUnitPerfect/unit.lessonPlans.length)*100)}%)`);
      
      perfectionNeeded += (unit.lessonPlans.length - fullUnitPerfect);
      
      unitAnalysis = {
        ...unitAnalysis,
        frenchContent: fullUnitFrench,
        differentiation: fullUnitDiff,
        cultural: fullUnitCultural,
        perfectLessons: fullUnitPerfect
      };
      
      analysisResults.push(unitAnalysis);
    }

    // Overall Mission Summary
    console.log(`\n\n🎉 PHASE 2 PART 2 MISSION ANALYSIS`);
    console.log(`════════════════════════════════════════════════════════════`);
    console.log(`📚 Target Units: ${targetUnits.length}/8`);
    console.log(`📝 Total Lessons Found: ${totalLessons}/184 expected`);
    console.log(`🔧 Lessons Needing Perfection: ${perfectionNeeded}`);
    console.log(`🏆 Already Perfect Lessons: ${totalLessons - perfectionNeeded}`);
    
    const overallPerfectionRate = Math.round(((totalLessons - perfectionNeeded) / totalLessons) * 100);
    console.log(`📊 Current Perfection Rate: ${overallPerfectionRate}%`);

    // Priority action plan
    console.log(`\n🎯 AGENTS 25-32 ACTION PLAN:`);
    
    if (perfectionNeeded === 0) {
      console.log(`   🏆 ALL LESSONS ALREADY PERFECT! Phase 2 Part 2 complete!`);
    } else {
      console.log(`   🔧 PERFECTION WORK REQUIRED:`);
      console.log(`      • ${perfectionNeeded} lessons need enhancement`);
      console.log(`      • Focus on French content completion`);
      console.log(`      • Add differentiation strategies`);
      console.log(`      • Embed cultural connections`);
      console.log(`      • Ensure ETFO three-part structure compliance`);
    }

    // Unit priority ranking
    console.log(`\n📋 UNIT PRIORITY RANKING (by perfection needs):`);
    const sortedUnits = analysisResults.sort((a, b) => 
      (a.lessonCount - a.perfectLessons) - (b.lessonCount - b.perfectLessons)
    );
    
    sortedUnits.forEach(unit => {
      const needsWork = unit.lessonCount - unit.perfectLessons;
      const priority = needsWork === 0 ? '🏆 COMPLETE' : 
                      needsWork <= 5 ? '🔧 LOW' :
                      needsWork <= 15 ? '⚠️ MEDIUM' : '🚨 HIGH';
      
      console.log(`   Unit ${unit.unitNumber}: ${unit.title}`);
      console.log(`      Priority: ${priority} (${needsWork} lessons need work)`);
    });

    console.log(`\n✅ ANALYSIS COMPLETE - Ready for Phase 2 Part 2 execution!`);

  } catch (error) {
    console.error('❌ Error analyzing Units 9-16 current state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeUnits9to16CurrentState().catch(console.error);