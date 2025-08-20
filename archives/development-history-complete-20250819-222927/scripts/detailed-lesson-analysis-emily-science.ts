import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detailedLessonAnalysisEmilyScience() {
  console.log('🔬 DETAILED LESSON ANALYSIS: Emily McIsaac Science System');
  console.log('========================================================\n');

  // Get Long Range Plan details
  const lrp = await prisma.longRangePlan.findFirst({
    where: {
      userId: 23,
      subject: 'Sciences de la nature'
    }
  });

  console.log('📅 LONG RANGE PLAN DETAILED ANALYSIS:');
  console.log('====================================');
  console.log(`Title: ${lrp?.title}`);
  console.log(`Start Date: ${lrp?.startDate || 'MISSING'}`);
  console.log(`End Date: ${lrp?.endDate || 'MISSING'}`);
  console.log(`Overview Length: ${lrp?.overview?.length || 0} chars`);
  console.log(`Overview Content: ${lrp?.overview ? '"' + lrp.overview.substring(0, 200) + '..."' : 'MISSING'}`);

  // Get sample Unit Plans  
  const unitPlans = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: lrp?.id
    },
    orderBy: { title: 'asc' },
    take: 2
  });

  console.log('\n📚 SAMPLE UNIT PLANS DETAILED ANALYSIS:');
  console.log('======================================');
  
  for (const unit of unitPlans) {
    console.log(`\n🎯 UNIT: "${unit.title}"`);
    console.log(`   Start Week: ${unit.startWeek || 'MISSING'}`);
    console.log(`   End Week: ${unit.endWeek || 'MISSING'}`);
    console.log(`   Duration: ${unit.duration || 'MISSING'} weeks`);
    console.log(`   Overview: ${unit.overview?.length || 0} chars`);
    console.log(`   Learning Objectives: ${unit.learningObjectives?.length || 0} chars`);
    console.log(`   Assessment Methods: ${unit.assessmentMethods?.length || 0} chars`);
    console.log(`   Materials: ${unit.materialsNeeded?.length || 0} chars`);
    
    if (unit.overview) {
      console.log(`   Overview Sample: "${unit.overview.substring(0, 150)}..."`);
    }
    if (unit.learningObjectives) {
      console.log(`   Objectives Sample: "${unit.learningObjectives.substring(0, 150)}..."`);
    }
  }

  // Get detailed sample lessons from different units
  console.log('\n📝 SAMPLE LESSONS DETAILED ANALYSIS:');
  console.log('===================================');

  // Get one lesson from each unit type for analysis
  const sampleLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlanId: lrp?.id
      }
    },
    include: {
      unitPlan: {
        select: {
          title: true
        }
      }
    },
    take: 6  // 6 lessons for detailed analysis
  });

  for (let i = 0; i < sampleLessons.length; i++) {
    const lesson = sampleLessons[i];
    console.log(`\n🔍 LESSON ${i + 1}: "${lesson.title}"`);
    console.log(`   Unit: ${lesson.unitPlan.title}`);
    console.log(`   Duration: ${lesson.duration} minutes`);
    console.log('   ─────────────────────────────────────────');

    // Analyze Minds On section
    console.log(`\n   🧠 MINDS ON ANALYSIS:`);
    console.log(`   Length: ${lesson.mindsOn?.length || 0} chars`);
    const mindsOnTiming = extractTiming(lesson.mindsOn);
    console.log(`   Timing: ${mindsOnTiming || 'MISSING TIMING'}`);
    if (lesson.mindsOn) {
      console.log(`   Content: "${lesson.mindsOn.substring(0, 200)}..."`);
    } else {
      console.log(`   Content: MISSING`);
    }

    // Analyze Action section  
    console.log(`\n   🎯 ACTION ANALYSIS:`);
    console.log(`   Length: ${lesson.action?.length || 0} chars`);
    const actionTiming = extractTiming(lesson.action);
    console.log(`   Timing: ${actionTiming || 'MISSING TIMING'}`);
    if (lesson.action) {
      console.log(`   Content: "${lesson.action.substring(0, 200)}..."`);
    } else {
      console.log(`   Content: MISSING`);
    }

    // Analyze Consolidation section
    console.log(`\n   🎯 CONSOLIDATION ANALYSIS:`);
    console.log(`   Length: ${lesson.consolidation?.length || 0} chars`);
    const consolidationTiming = extractTiming(lesson.consolidation);
    console.log(`   Timing: ${consolidationTiming || 'MISSING TIMING'}`);
    if (lesson.consolidation) {
      console.log(`   Content: "${lesson.consolidation.substring(0, 200)}..."`);
    } else {
      console.log(`   Content: MISSING`);
    }

    // Analyze other critical fields
    console.log(`\n   📊 OTHER CRITICAL ELEMENTS:`);
    console.log(`   Learning Objectives: ${lesson.learningObjectives?.length || 0} chars`);
    console.log(`   Vocabulary Focus: ${lesson.vocabularyFocus?.length || 0} chars`);
    console.log(`   Materials Needed: ${lesson.materialsNeeded?.length || 0} chars`);
    console.log(`   Assessment Notes: ${lesson.assessmentNotes?.length || 0} chars`);
    console.log(`   Differentiation: ${lesson.differentiationStrategies ? 'Present' : 'MISSING'}`);
    console.log(`   Indigenous Perspectives: ${lesson.indigenousPerspectives?.length || 0} chars`);
    
    // Check for critical science elements
    console.log(`\n   🔬 SCIENCE-SPECIFIC ANALYSIS:`);
    const hasExperiment = lesson.action?.includes('experiment') || lesson.action?.includes('investigation');
    const hasObservation = lesson.action?.includes('observe') || lesson.action?.includes('record');
    const hasHypothesis = lesson.action?.includes('predict') || lesson.action?.includes('hypothesis');
    const hasJournal = lesson.action?.includes('journal') || lesson.consolidation?.includes('journal');
    const hasSafety = lesson.materialsNeeded?.includes('safety') || lesson.action?.includes('safety');
    const hasFrenchVocab = lesson.vocabularyFocus && lesson.vocabularyFocus.length > 0;
    
    console.log(`   Has Experiment/Investigation: ${hasExperiment ? '✅' : '❌'}`);
    console.log(`   Has Observation/Recording: ${hasObservation ? '✅' : '❌'}`);
    console.log(`   Has Prediction/Hypothesis: ${hasHypothesis ? '✅' : '❌'}`);
    console.log(`   Has Science Journal: ${hasJournal ? '✅' : '❌'}`);
    console.log(`   Has Safety Protocols: ${hasSafety ? '✅' : '❌'}`);
    console.log(`   Has French Vocabulary: ${hasFrenchVocab ? '✅' : '❌'}`);

    // Assessment analysis
    console.log(`\n   📈 ASSESSMENT ANALYSIS:`);
    const hasObservableAssessment = lesson.assessmentNotes?.includes('☐');
    const hasSpecificSkills = lesson.assessmentNotes?.includes('skill') || lesson.assessmentNotes?.includes('observe');
    console.log(`   Has Observable Checkboxes: ${hasObservableAssessment ? '✅' : '❌'}`);
    console.log(`   Has Specific Skills: ${hasSpecificSkills ? '✅' : '❌'}`);
    
    if (lesson.assessmentNotes) {
      console.log(`   Assessment Sample: "${lesson.assessmentNotes.substring(0, 150)}..."`);
    }

    // Mi'kmaq perspectives analysis
    console.log(`\n   🪶 MI'KMAQ PERSPECTIVES ANALYSIS:`);
    if (lesson.indigenousPerspectives) {
      console.log(`   Length: ${lesson.indigenousPerspectives.length} chars`);
      console.log(`   Content: "${lesson.indigenousPerspectives.substring(0, 150)}..."`);
      
      // Check for authenticity markers
      const hasTraditionalKnowledge = lesson.indigenousPerspectives.includes('traditional') || 
                                      lesson.indigenousPerspectives.includes("Mi'kmaq");
      const hasSeasonalConnection = lesson.indigenousPerspectives.includes('seasonal') ||
                                   lesson.indigenousPerspectives.includes('nature');
      console.log(`   Has Traditional Knowledge: ${hasTraditionalKnowledge ? '✅' : '❌'}`);
      console.log(`   Has Seasonal Connection: ${hasSeasonalConnection ? '✅' : '❌'}`);
    } else {
      console.log(`   MISSING MI'KMAQ PERSPECTIVES`);
    }

    console.log(`\n   ═══════════════════════════════════════════`);
  }

  // Overall system analysis
  console.log('\n🚨 CRITICAL SYSTEM-WIDE ISSUES:');
  console.log('===============================');
  
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlanId: lrp?.id
      }
    }
  });

  // Count major structural issues
  let missingTimingStructure = 0;
  let missingObservableAssessment = 0;
  let missingScientificInquiry = 0;
  let missingSafetyProtocols = 0;
  let missingJournalIntegration = 0;
  let missingFrenchVocabulary = 0;

  allLessons.forEach(lesson => {
    // Check ETFO timing structure
    const mindsOnTiming = extractTiming(lesson.mindsOn);
    const actionTiming = extractTiming(lesson.action);
    const consolidationTiming = extractTiming(lesson.consolidation);
    
    if (!mindsOnTiming?.includes('8') || !actionTiming?.includes('27') || !consolidationTiming?.includes('10')) {
      missingTimingStructure++;
    }

    // Check observable assessment
    if (!lesson.assessmentNotes?.includes('☐')) {
      missingObservableAssessment++;
    }

    // Check scientific inquiry
    const hasInquiry = lesson.action?.includes('investigation') || lesson.action?.includes('experiment');
    if (!hasInquiry) {
      missingScientificInquiry++;
    }

    // Check safety protocols
    const hasSafety = lesson.materialsNeeded?.includes('safety') || lesson.action?.includes('safety');
    if (!hasSafety && (lesson.action?.includes('experiment') || lesson.materialsNeeded?.includes('experiment'))) {
      missingSafetyProtocols++;
    }

    // Check journal integration
    const hasJournal = lesson.action?.includes('journal') || lesson.consolidation?.includes('journal');
    if (!hasJournal) {
      missingJournalIntegration++;
    }

    // Check French vocabulary
    if (!lesson.vocabularyFocus || lesson.vocabularyFocus.length === 0) {
      missingFrenchVocabulary++;
    }
  });

  console.log(`❌ Missing ETFO Structure: ${missingTimingStructure}/${allLessons.length} lessons`);
  console.log(`❌ Missing Observable Assessment: ${missingObservableAssessment}/${allLessons.length} lessons`);
  console.log(`❌ Missing Scientific Inquiry: ${missingScientificInquiry}/${allLessons.length} lessons`);
  console.log(`❌ Missing Safety Protocols: ${missingSafetyProtocols}/${allLessons.length} lessons`);
  console.log(`❌ Missing Journal Integration: ${missingJournalIntegration}/${allLessons.length} lessons`);
  console.log(`❌ Missing French Vocabulary: ${missingFrenchVocabulary}/${allLessons.length} lessons`);

  const perfectionScore = Math.max(0, 100 - ((missingTimingStructure + missingObservableAssessment + missingScientificInquiry + missingSafetyProtocols + missingJournalIntegration + missingFrenchVocabulary) / (allLessons.length * 6) * 100));
  
  console.log(`\n📊 FINAL PERFECTION SCORE: ${perfectionScore.toFixed(1)}%`);
  console.log(`\n🚨 SYSTEM STATUS: ${perfectionScore > 90 ? 'EXCELLENT' : perfectionScore > 75 ? 'GOOD' : perfectionScore > 50 ? 'NEEDS IMPROVEMENT' : 'CRITICAL FAILURES'}`);
}

function extractTiming(content: string | null): string | null {
  if (!content) return null;
  
  // Look for timing pattern like "(8 minutes)" or "(27 minutes)"
  const timingMatch = content.match(/\(\d+\s*minutes?\)/i);
  return timingMatch ? timingMatch[0] : null;
}

// Run the detailed analysis
detailedLessonAnalysisEmilyScience()
  .catch((error) => {
    console.error('❌ Error in detailed analysis:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });