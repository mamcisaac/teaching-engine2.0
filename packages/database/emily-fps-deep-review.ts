import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deepReviewEmilyFPS() {
  try {
    console.log('🔍 DEEP CRITICAL REVIEW: Emily McIsaac\'s Formation personnelle et sociale System');
    console.log('================================================================================');

    // Find Emily
    const emily = await prisma.user.findFirst({
      where: { name: { contains: 'Emily McIsaac' } }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get Long Range Plan
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Formation personnelle et sociale'
      }
    });

    console.log('📚 LONG RANGE PLAN ANALYSIS');
    console.log('============================');
    if (lrp) {
      console.log('✅ Title:', lrp.title);
      console.log('✅ Grade:', lrp.grade);
      console.log('✅ Subject:', lrp.subject);
      console.log('✅ Start Date:', lrp.startDate?.toISOString().split('T')[0]);
      console.log('✅ End Date:', lrp.endDate?.toISOString().split('T')[0]);
      console.log('📏 Description Length:', lrp.description?.length || 0, 'chars');
      
      // Check for social-emotional progression themes
      const description = lrp.description?.toLowerCase() || '';
      const hasIdentity = description.includes('identity') || description.includes('identité');
      const hasSafety = description.includes('safety') || description.includes('sécurité');
      const hasWellness = description.includes('wellness') || description.includes('bien-être');
      const hasSocial = description.includes('social') || description.includes('émotions');
      
      console.log('\n🎯 SOCIAL-EMOTIONAL PROGRESSION CHECK:');
      console.log('   Identity/Self-awareness:', hasIdentity ? '✅' : '❌');
      console.log('   Safety education:', hasSafety ? '✅' : '❌');
      console.log('   Wellness concepts:', hasWellness ? '✅' : '❌');
      console.log('   Social-emotional skills:', hasSocial ? '✅' : '❌');
      
      if (lrp.description && lrp.description.length < 200) {
        console.log('⚠️  WARNING: LRP description very short for comprehensive planning');
      }
    } else {
      console.log('❌ NO LONG RANGE PLAN FOUND - CRITICAL ISSUE');
    }

    // Get Units with detailed analysis
    const units = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: { subject: 'Formation personnelle et sociale' }
      },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' },
          select: {
            id: true,
            title: true,
            duration: true,
            mindsOn: true,
            action: true,
            consolidation: true,
            differentiationStrategies: true,
            vocabularyFrench: true,
            indigenousPerspectives: true,
            assessmentNotes: true,
            lessonNumber: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('\n🎯 UNIT ANALYSIS');
    console.log('=================');
    console.log('Total Units Found:', units.length);

    let totalLessons = 0;
    let issuesFound = [];

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      console.log(`\n--- UNIT ${i + 1}: ${unit.title} ---`);
      console.log('📅 Duration:', unit.totalHours, 'hours');
      console.log('📚 Lessons:', unit.lessonPlans.length);
      console.log('📝 Description Length:', unit.description?.length || 0, 'chars');
      console.log('🎯 Learning Goals Length:', unit.learningGoals?.length || 0, 'chars');
      console.log('📊 Assessment Length:', unit.assessment?.length || 0, 'chars');

      totalLessons += unit.lessonPlans.length;

      // Check unit progression appropriateness
      if (i === 0 && !unit.title.toLowerCase().includes('me') && !unit.title.toLowerCase().includes('moi')) {
        issuesFound.push(`Unit 1 should focus on self-identity, but title is: ${unit.title}`);
      }
      if (i === 2 && !unit.title.toLowerCase().includes('safe') && !unit.title.toLowerCase().includes('sûr')) {
        issuesFound.push(`Unit 3 should focus on safety, but title is: ${unit.title}`);
      }

      // Check for age-appropriate content
      const description = unit.description?.toLowerCase() || '';
      if (description.includes('puberty') || description.includes('sexuality')) {
        issuesFound.push(`Unit ${i + 1} may contain inappropriate content for Grade 1: ${unit.title}`);
      }

      // Sample 2 lessons from each unit for detailed review
      const sampleLessons = unit.lessonPlans.slice(0, 2);
      
      for (const lesson of sampleLessons) {
        console.log(`\n  📝 Sample Lesson ${lesson.lessonNumber}: ${lesson.title}`);
        console.log(`     Duration: ${lesson.duration} minutes`);
        
        // ETFO Structure Check
        const hasMindsOnTiming = lesson.mindsOn?.includes('8 min') || lesson.mindsOn?.includes('(8 minutes)');
        const hasActionTiming = lesson.action?.includes('27 min') || lesson.action?.includes('(27 minutes)');
        const hasConsolidationTiming = lesson.consolidation?.includes('10 min') || lesson.consolidation?.includes('(10 minutes)');
        
        console.log(`     Structure Timing: MindsOn ${hasMindsOnTiming ? '✅' : '❌'}, Action ${hasActionTiming ? '✅' : '❌'}, Consolidation ${hasConsolidationTiming ? '✅' : '❌'}`);
        
        // Differentiation Check
        let differentiationValid = false;
        if (lesson.differentiationStrategies) {
          try {
            const diff = typeof lesson.differentiationStrategies === 'string' ? 
              JSON.parse(lesson.differentiationStrategies) : lesson.differentiationStrategies;
            differentiationValid = diff.forStruggling && diff.forAdvanced && diff.multiModal && diff.accommodations;
          } catch (e) {
            differentiationValid = false;
          }
        }
        console.log(`     Differentiation: ${differentiationValid ? '✅ Complete' : '❌ Missing/Incomplete'}`);
        
        // French Vocabulary Check
        let vocabularyValid = false;
        let vocabularyCount = 0;
        if (lesson.vocabularyFrench) {
          try {
            const vocab = typeof lesson.vocabularyFrench === 'string' ? 
              JSON.parse(lesson.vocabularyFrench) : lesson.vocabularyFrench;
            vocabularyCount = Array.isArray(vocab) ? vocab.length : 0;
            vocabularyValid = vocabularyCount >= 2 && vocabularyCount <= 3;
          } catch (e) {
            vocabularyValid = false;
          }
        }
        console.log(`     French Vocabulary: ${vocabularyValid ? `✅ ${vocabularyCount} terms` : `❌ ${vocabularyCount} terms (need 2-3)`}`);
        
        // Indigenous Perspectives Check
        const indigenousLength = lesson.indigenousPerspectives?.length || 0;
        const indigenousValid = indigenousLength >= 100;
        console.log(`     Indigenous Perspectives: ${indigenousValid ? `✅ ${indigenousLength} chars` : `❌ ${indigenousLength} chars (need 100+)`}`);
        
        // Assessment Format Check
        const hasObservableAssessment = lesson.assessmentNotes?.includes('☐') || false;
        console.log(`     Assessment Format: ${hasObservableAssessment ? '✅ Observable checkboxes' : '❌ Missing checkboxes'}`);
        
        // Content Appropriateness Check
        const content = (lesson.mindsOn + ' ' + lesson.action + ' ' + lesson.consolidation).toLowerCase();
        if (content.includes('puberty') || content.includes('sex') || content.includes('inappropriate')) {
          issuesFound.push(`Lesson "${lesson.title}" may contain inappropriate content for Grade 1`);
        }
        
        // Mi'kmaq authenticity check
        if (lesson.indigenousPerspectives) {
          const indigenous = lesson.indigenousPerspectives.toLowerCase();
          if (indigenous.includes('mikmaq') || indigenous.includes("mi'kmaq")) {
            const hasGeneric = indigenous.includes('many cultures') || indigenous.includes('indigenous peoples in general');
            if (hasGeneric) {
              issuesFound.push(`Lesson "${lesson.title}" has generic Indigenous content instead of authentic Mi'kmaq teachings`);
            }
          }
        }
      }
    }

    console.log('\n📊 SYSTEM TOTALS');
    console.log('=================');
    console.log('Total Units:', units.length);
    console.log('Total Lessons:', totalLessons);
    console.log('Expected: 6 units, 96 lessons');

    if (units.length !== 6) {
      issuesFound.push(`Incorrect number of units: ${units.length} (expected 6)`);
    }
    if (totalLessons !== 96) {
      issuesFound.push(`Incorrect total lessons: ${totalLessons} (expected 96)`);
    }

    // Check for proper unit distribution
    const expectedDistribution = [24, 24, 12, 12, 12, 12];
    for (let i = 0; i < Math.min(units.length, expectedDistribution.length); i++) {
      if (units[i].lessonPlans.length !== expectedDistribution[i]) {
        issuesFound.push(`Unit ${i + 1} has ${units[i].lessonPlans.length} lessons (expected ${expectedDistribution[i]})`);
      }
    }

    // Get a comprehensive sample of lessons for final compliance check
    const allLessons = await prisma.lessonPlan.findMany({
      where: {
        unitPlan: {
          userId: emily.id,
          longRangePlan: { subject: 'Formation personnelle et sociale' }
        }
      },
      select: {
        id: true,
        title: true,
        duration: true,
        mindsOn: true,
        action: true,
        consolidation: true,
        differentiationStrategies: true,
        vocabularyFrench: true,
        indigenousPerspectives: true,
        assessmentNotes: true
      }
    });

    console.log('\n🔬 COMPREHENSIVE ETFO COMPLIANCE CHECK');
    console.log('======================================');
    console.log('Analyzing all', allLessons.length, 'lessons...');

    let compliantLessons = 0;
    let durationIssues = 0;
    let structureIssues = 0;
    let differentiationIssues = 0;
    let vocabularyIssues = 0;
    let indigenousIssues = 0;
    let assessmentIssues = 0;

    for (const lesson of allLessons) {
      let isCompliant = true;

      // Duration check
      if (lesson.duration !== 45) {
        durationIssues++;
        isCompliant = false;
      }

      // Structure timing check
      const hasStructureTiming = 
        (lesson.mindsOn?.includes('8 min') || lesson.mindsOn?.includes('(8 minutes)')) &&
        (lesson.action?.includes('27 min') || lesson.action?.includes('(27 minutes)')) &&
        (lesson.consolidation?.includes('10 min') || lesson.consolidation?.includes('(10 minutes)'));
      
      if (!hasStructureTiming) {
        structureIssues++;
        isCompliant = false;
      }

      // Differentiation check
      let hasDifferentiation = false;
      if (lesson.differentiationStrategies) {
        try {
          const diff = typeof lesson.differentiationStrategies === 'string' ? 
            JSON.parse(lesson.differentiationStrategies) : lesson.differentiationStrategies;
          hasDifferentiation = diff.forStruggling && diff.forAdvanced && diff.multiModal && diff.accommodations;
        } catch (e) {
          hasDifferentiation = false;
        }
      }
      if (!hasDifferentiation) {
        differentiationIssues++;
        isCompliant = false;
      }

      // Vocabulary check
      let hasVocabulary = false;
      if (lesson.vocabularyFrench) {
        try {
          const vocab = typeof lesson.vocabularyFrench === 'string' ? 
            JSON.parse(lesson.vocabularyFrench) : lesson.vocabularyFrench;
          const count = Array.isArray(vocab) ? vocab.length : 0;
          hasVocabulary = count >= 2 && count <= 3;
        } catch (e) {
          hasVocabulary = false;
        }
      }
      if (!hasVocabulary) {
        vocabularyIssues++;
        isCompliant = false;
      }

      // Indigenous perspectives check
      if (!lesson.indigenousPerspectives || lesson.indigenousPerspectives.length < 100) {
        indigenousIssues++;
        isCompliant = false;
      }

      // Assessment check
      if (!lesson.assessmentNotes || !lesson.assessmentNotes.includes('☐')) {
        assessmentIssues++;
        isCompliant = false;
      }

      if (isCompliant) {
        compliantLessons++;
      }
    }

    console.log('\n📊 COMPLIANCE RESULTS');
    console.log('======================');
    console.log('Total Lessons Analyzed:', allLessons.length);
    console.log('ETFO Compliant Lessons:', compliantLessons);
    console.log('Non-Compliant Lessons:', allLessons.length - compliantLessons);
    console.log('\nSpecific Issues Found:');
    console.log('❌ Duration Issues (not 45 min):', durationIssues);
    console.log('❌ Structure Timing Issues:', structureIssues);
    console.log('❌ Differentiation Missing/Incomplete:', differentiationIssues);
    console.log('❌ French Vocabulary Issues:', vocabularyIssues);
    console.log('❌ Indigenous Perspectives Issues:', indigenousIssues);
    console.log('❌ Assessment Format Issues:', assessmentIssues);

    const complianceRate = allLessons.length > 0 ? (compliantLessons / allLessons.length * 100).toFixed(1) : '0';
    console.log('\n🏆 OVERALL COMPLIANCE RATE:', complianceRate + '%');

    console.log('\n🚨 CRITICAL ISSUES IDENTIFIED');
    console.log('==============================');
    if (issuesFound.length === 0) {
      console.log('✅ No critical content issues found');
    } else {
      issuesFound.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n📋 FINAL ASSESSMENT');
    console.log('====================');
    if (complianceRate === '100.0') {
      console.log('🎉 EXCELLENT: System is fully ETFO compliant');
    } else if (parseFloat(complianceRate) >= 90) {
      console.log('✅ GOOD: System is mostly compliant with minor issues');
    } else if (parseFloat(complianceRate) >= 70) {
      console.log('⚠️  WARNING: System has significant compliance issues');
    } else {
      console.log('🚨 CRITICAL: System has major compliance failures');
    }

    if (issuesFound.length > 0) {
      console.log('🔧 REMEDIATION REQUIRED for content and pedagogical issues');
    }

  } catch (error) {
    console.error('❌ Error during deep review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deepReviewEmilyFPS().catch(console.error);