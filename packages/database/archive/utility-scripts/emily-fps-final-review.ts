import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalReviewEmilyFPS() {
  try {
    console.log('🔍 FINAL CRITICAL REVIEW: Emily McIsaac\'s Formation personnelle et sociale System');
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

    console.log('📚 LONG RANGE PLAN CRITICAL ANALYSIS');
    console.log('====================================');
    if (lrp) {
      console.log('✅ Title:', lrp.title);
      console.log('✅ Grade:', lrp.grade);
      console.log('✅ Subject:', lrp.subject);
      console.log('📅 Start Date:', lrp.startDate?.toISOString().split('T')[0] || 'MISSING');
      console.log('📅 End Date:', lrp.endDate?.toISOString().split('T')[0] || 'MISSING');
      console.log('📏 Description Length:', lrp.description?.length || 0, 'chars');
      
      if (!lrp.startDate || !lrp.endDate) {
        console.log('🚨 CRITICAL: LRP missing essential start/end dates');
      }
      
      if (!lrp.description || lrp.description.length < 200) {
        console.log('🚨 CRITICAL: LRP description inadequate for comprehensive planning');
      }
      
      // Check for social-emotional progression coverage
      const desc = lrp.description?.toLowerCase() || '';
      const socialEmotionalElements = {
        'Self-Identity': desc.includes('identity') || desc.includes('self') || desc.includes('identité'),
        'Social Skills': desc.includes('social') || desc.includes('relationships') || desc.includes('relations'),
        'Safety Education': desc.includes('safety') || desc.includes('safe') || desc.includes('sécurité'),
        'Health/Wellness': desc.includes('health') || desc.includes('wellness') || desc.includes('santé'),
        'Emotional Development': desc.includes('emotion') || desc.includes('feeling') || desc.includes('sentiment')
      };
      
      console.log('\n🎯 SOCIAL-EMOTIONAL PROGRESSION COVERAGE:');
      Object.entries(socialEmotionalElements).forEach(([element, present]) => {
        console.log(`   ${element}: ${present ? '✅' : '❌'}`);
      });
      
    } else {
      console.log('❌ NO LONG RANGE PLAN FOUND - CRITICAL SYSTEM FAILURE');
      return;
    }

    // Get Units with full lesson analysis
    const units = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: { subject: 'Formation personnelle et sociale' }
      },
      include: {
        lessonPlans: {
          select: {
            id: true,
            title: true,
            duration: true,
            mindsOn: true,
            action: true,
            consolidation: true,
            differentiationStrategies: true,
            indigenousPerspectives: true,
            assessmentNotes: true,
            materials: true,
            learningGoals: true
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('\n🎯 UNIT PROGRESSION ANALYSIS');
    console.log('=============================');
    console.log('Total Units Found:', units.length);

    if (units.length !== 6) {
      console.log('🚨 CRITICAL: Expected 6 units, found', units.length);
    }

    const expectedProgression = [
      { name: 'Me, Myself, and I', lessons: 24, focus: 'self-identity' },
      { name: 'Healthy Me', lessons: 24, focus: 'health habits' },
      { name: 'Safe and Sound', lessons: 12, focus: 'safety education' },
      { name: 'Friends and Feelings', lessons: 12, focus: 'social-emotional' },
      { name: 'Growing and Learning', lessons: 12, focus: 'development' },
      { name: 'Our Wonderful World', lessons: 12, focus: 'community' }
    ];

    let totalLessons = 0;
    let progressionIssues = [];
    let contentIssues = [];

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const expected = expectedProgression[i];
      
      console.log(`\n--- UNIT ${i + 1}: ${unit.title} ---`);
      console.log('📚 Lessons:', unit.lessonPlans.length);
      console.log('⏱️  Total Hours:', unit.totalHours);
      console.log('📝 Description Length:', unit.description?.length || 0, 'chars');
      console.log('🎯 Learning Goals Length:', unit.learningGoals?.length || 0, 'chars');
      console.log('📊 Assessment Length:', unit.assessment?.length || 0, 'chars');

      totalLessons += unit.lessonPlans.length;

      // Check unit progression appropriateness
      if (expected && unit.title !== expected.name) {
        console.log(`⚠️  Title differs from expected: "${expected.name}"`);
      }
      
      if (expected && unit.lessonPlans.length !== expected.lessons) {
        progressionIssues.push(`Unit ${i + 1} has ${unit.lessonPlans.length} lessons (expected ${expected.lessons})`);
      }

      // Check for age-inappropriate content
      const unitContent = (unit.description || '').toLowerCase();
      if (unitContent.includes('puberty') || unitContent.includes('sexuality') || unitContent.includes('reproduction')) {
        contentIssues.push(`Unit ${i + 1} "${unit.title}" contains potentially inappropriate content for Grade 1`);
      }

      // Sample lesson analysis from each unit
      const sampleLessons = unit.lessonPlans.slice(0, 2);
      for (const lesson of sampleLessons) {
        const lessonContent = ((lesson.mindsOn || '') + ' ' + (lesson.action || '') + ' ' + (lesson.consolidation || '')).toLowerCase();
        if (lessonContent.includes('puberty') || lessonContent.includes('sex') || lessonContent.includes('body parts') && lessonContent.includes('private')) {
          contentIssues.push(`Lesson "${lesson.title}" in Unit ${i + 1} may contain inappropriate content`);
        }
      }
    }

    console.log('\n📊 SYSTEM STRUCTURE ANALYSIS');
    console.log('=============================');
    console.log('Total Units:', units.length, '(Expected: 6)');
    console.log('Total Lessons:', totalLessons, '(Expected: 96)');
    
    if (totalLessons !== 96) {
      progressionIssues.push(`Total lessons: ${totalLessons} (expected 96)`);
    }

    // Comprehensive ETFO compliance check
    console.log('\n🔬 COMPREHENSIVE ETFO COMPLIANCE ANALYSIS');
    console.log('==========================================');

    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Formation personnelle et sociale'
      },
      select: {
        id: true,
        title: true,
        duration: true,
        mindsOn: true,
        action: true,
        consolidation: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        assessmentNotes: true,
        materials: true
      }
    });

    console.log('Total Lessons for Analysis:', allLessons.length);

    let complianceResults = {
      total: allLessons.length,
      compliant: 0,
      durationIssues: 0,
      structureIssues: 0,
      differentiationIssues: 0,
      indigenousIssues: 0,
      assessmentIssues: 0,
      vocabularyIssues: allLessons.length, // Assume all missing since field doesn't exist
    };

    let sampleLessonIssues = [];

    // Analyze first 5 lessons in detail
    for (let i = 0; i < Math.min(5, allLessons.length); i++) {
      const lesson = allLessons[i];
      let lessonIssues = [];
      
      console.log(`\n📝 SAMPLE LESSON ${i + 1}: ${lesson.title}`);
      
      // Duration check
      if (lesson.duration !== 45) {
        complianceResults.durationIssues++;
        lessonIssues.push(`Duration: ${lesson.duration}min (should be 45min)`);
      } else {
        console.log('✅ Duration: 45 minutes');
      }

      // Structure timing check
      const hasMindsOnTiming = lesson.mindsOn?.includes('(8 min') || lesson.mindsOn?.includes('8 minutes');
      const hasActionTiming = lesson.action?.includes('(27 min') || lesson.action?.includes('27 minutes');
      const hasConsolidationTiming = lesson.consolidation?.includes('(10 min') || lesson.consolidation?.includes('10 minutes');
      
      if (!hasMindsOnTiming || !hasActionTiming || !hasConsolidationTiming) {
        complianceResults.structureIssues++;
        lessonIssues.push('Missing ETFO structure timing (8/27/10 minutes)');
      } else {
        console.log('✅ ETFO Structure: Proper timing included');
      }

      // Differentiation check
      let hasDifferentiation = false;
      if (lesson.differentiationStrategies) {
        try {
          const diff = typeof lesson.differentiationStrategies === 'object' ? 
            lesson.differentiationStrategies : JSON.parse(lesson.differentiationStrategies as string);
          hasDifferentiation = diff && 
            typeof diff === 'object' && 
            ('forStruggling' in diff || 'support' in diff) &&
            ('forAdvanced' in diff || 'extension' in diff) &&
            ('multiModal' in diff) &&
            ('accommodations' in diff);
        } catch (e) {
          hasDifferentiation = false;
        }
      }
      
      if (!hasDifferentiation) {
        complianceResults.differentiationIssues++;
        lessonIssues.push('Missing proper differentiation strategies');
      } else {
        console.log('✅ Differentiation: Complete strategies present');
      }

      // Indigenous perspectives check
      const indigenousLength = lesson.indigenousPerspectives?.length || 0;
      if (indigenousLength < 100) {
        complianceResults.indigenousIssues++;
        lessonIssues.push(`Indigenous perspectives: ${indigenousLength} chars (need 100+)`);
      } else {
        console.log(`✅ Indigenous Perspectives: ${indigenousLength} chars`);
        
        // Check authenticity for Mi'kmaq content
        const indigenous = lesson.indigenousPerspectives?.toLowerCase() || '';
        if (indigenous.includes('many cultures') || indigenous.includes('indigenous peoples in general')) {
          lessonIssues.push('Indigenous content appears generic rather than specific to Mi\'kmaq traditions');
        }
      }

      // Assessment format check
      const hasObservableAssessment = lesson.assessmentNotes?.includes('☐') || false;
      if (!hasObservableAssessment) {
        complianceResults.assessmentIssues++;
        lessonIssues.push('Assessment not in observable checkbox format');
      } else {
        console.log('✅ Assessment: Observable checkbox format');
      }

      // Age-appropriateness check
      const content = ((lesson.mindsOn || '') + ' ' + (lesson.action || '') + ' ' + (lesson.consolidation || '')).toLowerCase();
      if (content.includes('puberty') || content.includes('reproduction') || content.includes('sexual')) {
        lessonIssues.push('Contains potentially inappropriate content for Grade 1');
      }

      if (lessonIssues.length === 0) {
        complianceResults.compliant++;
        console.log('✅ LESSON FULLY COMPLIANT');
      } else {
        console.log('❌ Issues found:', lessonIssues.join('; '));
        sampleLessonIssues.push(...lessonIssues.map(issue => `Lesson "${lesson.title}": ${issue}`));
      }
    }

    // Quick check remaining lessons for major issues
    for (let i = 5; i < allLessons.length; i++) {
      const lesson = allLessons[i];
      let isCompliant = true;

      if (lesson.duration !== 45) {
        complianceResults.durationIssues++;
        isCompliant = false;
      }

      const hasStructureTiming = 
        (lesson.mindsOn?.includes('(8 min') || lesson.mindsOn?.includes('8 minutes')) &&
        (lesson.action?.includes('(27 min') || lesson.action?.includes('27 minutes')) &&
        (lesson.consolidation?.includes('(10 min') || lesson.consolidation?.includes('10 minutes'));
      
      if (!hasStructureTiming) {
        complianceResults.structureIssues++;
        isCompliant = false;
      }

      if (!lesson.differentiationStrategies) {
        complianceResults.differentiationIssues++;
        isCompliant = false;
      }

      if (!lesson.indigenousPerspectives || lesson.indigenousPerspectives.length < 100) {
        complianceResults.indigenousIssues++;
        isCompliant = false;
      }

      if (!lesson.assessmentNotes || !lesson.assessmentNotes.includes('☐')) {
        complianceResults.assessmentIssues++;
        isCompliant = false;
      }

      if (isCompliant) {
        complianceResults.compliant++;
      }
    }

    console.log('\n📊 FINAL COMPLIANCE RESULTS');
    console.log('============================');
    console.log('Total Lessons Analyzed:', complianceResults.total);
    console.log('Fully Compliant Lessons:', complianceResults.compliant);
    console.log('Non-Compliant Lessons:', complianceResults.total - complianceResults.compliant);
    console.log('\nSpecific ETFO Compliance Issues:');
    console.log('❌ Duration Issues (not 45 min):', complianceResults.durationIssues);
    console.log('❌ Structure Timing Issues:', complianceResults.structureIssues);
    console.log('❌ Differentiation Issues:', complianceResults.differentiationIssues);
    console.log('❌ Indigenous Perspectives Issues:', complianceResults.indigenousIssues);
    console.log('❌ Assessment Format Issues:', complianceResults.assessmentIssues);
    console.log('❌ French Vocabulary Issues:', complianceResults.vocabularyIssues, '(field missing from schema)');

    const complianceRate = complianceResults.total > 0 ? 
      (complianceResults.compliant / complianceResults.total * 100).toFixed(1) : '0';
    
    console.log('\n🏆 OVERALL COMPLIANCE RATE:', complianceRate + '%');

    console.log('\n🚨 CRITICAL ISSUES SUMMARY');
    console.log('===========================');
    
    let allIssues = [...progressionIssues, ...contentIssues, ...sampleLessonIssues];
    
    if (allIssues.length === 0) {
      console.log('✅ No critical issues identified in sample analysis');
    } else {
      allIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n📋 FINAL CRITICAL ASSESSMENT');
    console.log('=============================');
    
    if (complianceRate === '100.0' && allIssues.length === 0) {
      console.log('🎉 EXCELLENT: Emily\'s FPS system meets all requirements');
    } else if (parseFloat(complianceRate) >= 90 && allIssues.length <= 3) {
      console.log('✅ GOOD: System is mostly compliant with minor issues');
    } else if (parseFloat(complianceRate) >= 70) {
      console.log('⚠️  WARNING: System has significant compliance issues requiring attention');
    } else {
      console.log('🚨 CRITICAL FAILURE: System has major compliance issues requiring immediate remediation');
    }

    console.log('\n🔧 REMEDIATION REQUIREMENTS:');
    if (complianceResults.durationIssues > 0) {
      console.log(`- Fix ${complianceResults.durationIssues} lessons with incorrect duration`);
    }
    if (complianceResults.structureIssues > 0) {
      console.log(`- Add ETFO timing to ${complianceResults.structureIssues} lessons`);
    }
    if (complianceResults.differentiationIssues > 0) {
      console.log(`- Add differentiation strategies to ${complianceResults.differentiationIssues} lessons`);
    }
    if (complianceResults.vocabularyIssues > 0) {
      console.log(`- Add French vocabulary (vocabularyFr field) to all ${complianceResults.vocabularyIssues} lessons`);
    }
    if (complianceResults.indigenousIssues > 0) {
      console.log(`- Enhance Indigenous perspectives in ${complianceResults.indigenousIssues} lessons`);
    }
    if (complianceResults.assessmentIssues > 0) {
      console.log(`- Convert ${complianceResults.assessmentIssues} assessments to observable format`);
    }
    if (allIssues.length > 0) {
      console.log(`- Address ${allIssues.length} content and pedagogical issues`);
    }

  } catch (error) {
    console.error('❌ Error during final review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalReviewEmilyFPS().catch(console.error);