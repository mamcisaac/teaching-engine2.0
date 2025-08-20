import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeFrenchUnits1to8Lessons() {
  try {
    console.log('🔍 ANALYZING FRENCH UNITS 1-8 LESSONS FOR ETFO COMPLIANCE\n');
    console.log('══════════════════════════════════════════════════════════\n');

    // Get Emily's user ID
    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily' } }
    });

    if (!emily) {
      console.log('❌ Emily not found in database');
      return;
    }

    // Define the specific 8 French units we need to perfect
    const targetUnits = [
      'Bienvenue à l\'école!',
      'Ma famille et moi', 
      'Les couleurs d\'automne',
      'Les fêtes d\'automne',
      'L\'automne finit',
      'L\'hiver commence',
      'Les fêtes d\'hiver',
      'Vacances et famille'
    ];

    console.log('🎯 TARGET UNITS FOR PERFECTION:\n');
    targetUnits.forEach((unit, index) => {
      console.log(`   Unit ${index + 1}: ${unit}`);
    });
    console.log('\n══════════════════════════════════════════════════════════\n');

    // Get the specific units with their lessons
    const units = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        title: {
          in: targetUnits
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
            modifications: true,
            extensions: true,
            assessmentType: true,
            assessmentNotes: true,
            grouping: true,
            differentiationStrategies: true,
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

    console.log(`📊 Found ${units.length} matching units\n`);

    let totalLessons = 0;
    let etfoCompliantLessons = 0;
    let lessonsNeedingMajorWork = 0;
    let analysisResults = [];

    for (const unit of units) {
      console.log(`\n📚 ANALYZING: ${unit.title}`);
      console.log(`═══════════════════════════════════════════════════════`);
      console.log(`🗓️ Period: ${unit.startDate.toDateString()} - ${unit.endDate.toDateString()}`);
      console.log(`📝 Total Lessons: ${unit.lessonPlans.length}\n`);
      
      totalLessons += unit.lessonPlans.length;
      
      let unitEtfoCompliant = 0;
      let unitNeedsMajorWork = 0;
      let lessonDetails = [];

      for (let i = 0; i < unit.lessonPlans.length; i++) {
        const lesson = unit.lessonPlans[i];
        
        // ETFO Three-Part Structure Analysis
        const hasMindsOn = !!(lesson.mindsOn || lesson.mindsOnFr);
        const hasAction = !!(lesson.action || lesson.actionFr);
        const hasConsolidation = !!(lesson.consolidation || lesson.consolidationFr);
        
        // Additional ETFO Requirements
        const hasLearningGoals = !!(lesson.learningGoals || lesson.learningGoalsFr);
        const hasMaterials = lesson.materials && JSON.stringify(lesson.materials) !== '[]' && JSON.stringify(lesson.materials) !== 'null';
        const hasAccommodations = lesson.accommodations && JSON.stringify(lesson.accommodations) !== '[]' && JSON.stringify(lesson.accommodations) !== 'null';
        const hasAssessment = !!(lesson.assessmentType || lesson.assessmentNotes);
        const hasFrenchContent = !!(lesson.titleFr || lesson.mindsOnFr || lesson.actionFr || lesson.consolidationFr || lesson.learningGoalsFr);
        const hasDifferentiation = lesson.differentiationStrategies && JSON.stringify(lesson.differentiationStrategies) !== '[]' && JSON.stringify(lesson.differentiationStrategies) !== 'null';
        
        // ETFO Scoring
        const coreStructure = [hasMindsOn, hasAction, hasConsolidation].filter(Boolean).length;
        const additionalComponents = [hasLearningGoals, hasMaterials, hasAccommodations, hasAssessment, hasDifferentiation].filter(Boolean).length;
        const totalScore = coreStructure + additionalComponents;
        
        // Determine compliance level
        const isFullyCompliant = coreStructure === 3 && totalScore >= 7;
        const needsMajorWork = coreStructure < 2 || totalScore < 4;
        
        if (isFullyCompliant) {
          unitEtfoCompliant++;
          etfoCompliantLessons++;
        }
        
        if (needsMajorWork) {
          unitNeedsMajorWork++;
          lessonsNeedingMajorWork++;
        }
        
        lessonDetails.push({
          number: i + 1,
          title: lesson.title || lesson.titleFr || 'No title',
          coreStructure,
          totalScore,
          isFullyCompliant,
          needsMajorWork,
          hasFrenchContent,
          duration: lesson.duration,
          issues: {
            noMindsOn: !hasMindsOn,
            noAction: !hasAction,
            noConsolidation: !hasConsolidation,
            noLearningGoals: !hasLearningGoals,
            noMaterials: !hasMaterials,
            noAccommodations: !hasAccommodations,
            noAssessment: !hasAssessment,
            noDifferentiation: !hasDifferentiation,
            noFrenchContent: !hasFrenchContent
          }
        });

        // Show detailed analysis for first 3 lessons and last lesson
        if (i < 3 || i === unit.lessonPlans.length - 1) {
          console.log(`Lesson ${i + 1}: ${lesson.title || lesson.titleFr || 'No title'}`);
          console.log(`  📊 ETFO Score: ${totalScore}/8 (Core: ${coreStructure}/3, Additional: ${additionalComponents}/5)`);
          console.log(`  🎯 Status: ${isFullyCompliant ? '✅ FULLY COMPLIANT' : needsMajorWork ? '❌ MAJOR WORK NEEDED' : '⚠️ NEEDS IMPROVEMENT'}`);
          console.log(`  🇫🇷 French Content: ${hasFrenchContent ? '✅' : '❌'}`);
          console.log(`  ⏱️ Duration: ${lesson.duration || 'Not set'} minutes`);
          
          // Show specific missing components
          const missing = [];
          if (!hasMindsOn) missing.push('Minds On');
          if (!hasAction) missing.push('Action');
          if (!hasConsolidation) missing.push('Consolidation');
          if (!hasLearningGoals) missing.push('Learning Goals');
          if (!hasMaterials) missing.push('Materials');
          if (!hasAccommodations) missing.push('Accommodations');
          if (!hasAssessment) missing.push('Assessment');
          if (!hasDifferentiation) missing.push('Differentiation');
          
          if (missing.length > 0) {
            console.log(`  ⚠️ Missing: ${missing.join(', ')}`);
          }
          console.log('');
        }
      }
      
      if (unit.lessonPlans.length > 4) {
        console.log(`... [Lessons 4-${unit.lessonPlans.length - 1} analyzed but not shown in detail]\n`);
      }
      
      // Unit summary
      const unitComplianceRate = unit.lessonPlans.length > 0 ? Math.round((unitEtfoCompliant / unit.lessonPlans.length) * 100) : 0;
      console.log(`📈 Unit Compliance: ${unitEtfoCompliant}/${unit.lessonPlans.length} (${unitComplianceRate}%)`);
      console.log(`⚠️ Major Work Needed: ${unitNeedsMajorWork}/${unit.lessonPlans.length}`);
      
      analysisResults.push({
        unitName: unit.title,
        totalLessons: unit.lessonPlans.length,
        compliantLessons: unitEtfoCompliant,
        majorWorkNeeded: unitNeedsMajorWork,
        complianceRate: unitComplianceRate,
        lessonDetails
      });
    }

    // OVERALL ANALYSIS SUMMARY
    console.log(`\n\n🎯 OVERALL ANALYSIS SUMMARY - PHASE 2 PART 1`);
    console.log(`══════════════════════════════════════════════════════════`);
    console.log(`📊 Total Units Analyzed: ${units.length}/8`);
    console.log(`📝 Total Lessons: ${totalLessons}/184`);
    console.log(`✅ Fully ETFO Compliant: ${etfoCompliantLessons}`);
    console.log(`⚠️ Need Improvement: ${totalLessons - etfoCompliantLessons - lessonsNeedingMajorWork}`);
    console.log(`❌ Need Major Work: ${lessonsNeedingMajorWork}`);
    
    const overallCompliance = totalLessons > 0 ? Math.round((etfoCompliantLessons / totalLessons) * 100) : 0;
    console.log(`📈 Overall ETFO Compliance: ${overallCompliance}%`);
    
    console.log(`\n🎯 PERFECTION REQUIREMENTS:`);
    console.log(`- ${totalLessons - etfoCompliantLessons} lessons need ETFO structure improvements`);
    console.log(`- All ${totalLessons} lessons need Grade 1 developmental review`);
    console.log(`- French immersion language goals must be embedded throughout`);
    console.log(`- Assessment and differentiation strategies need enhancement`);
    
    if (totalLessons !== 184) {
      console.log(`\n⚠️ CRITICAL: Expected 184 lessons but found ${totalLessons}`);
      console.log(`Missing units: ${8 - units.length}`);
      console.log(`Expected units: ${targetUnits.join(', ')}`);
      console.log(`Found units: ${units.map(u => u.title).join(', ')}`);
    }

    // Individual unit priorities
    console.log(`\n📋 UNIT-BY-UNIT PRIORITIES:`);
    for (const result of analysisResults) {
      const priority = result.complianceRate < 50 ? 'HIGH' : result.complianceRate < 80 ? 'MEDIUM' : 'LOW';
      console.log(`${result.unitName}: ${result.complianceRate}% compliant - ${priority} PRIORITY`);
    }

  } catch (error) {
    console.error('❌ Error analyzing French lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeFrenchUnits1to8Lessons().catch(console.error);