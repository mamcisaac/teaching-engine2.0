import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function criticalReviewEmilyScienceComplete() {
  console.log('🔬 CRITICAL REVIEW: Emily McIsaac (ID 23) - COMPLETE Sciences de la nature System');
  console.log('==================================================================================\n');

  // 1. Get Long Range Plan
  console.log('📅 1. LONG RANGE PLAN ANALYSIS:');
  console.log('==============================');
  
  const lrp = await prisma.longRangePlan.findFirst({
    where: {
      userId: 23,
      subject: 'Sciences de la nature'
    }
  });

  if (!lrp) {
    console.log('❌ CRITICAL ERROR: No Long Range Plan found for Sciences de la nature');
    return;
  }

  console.log(`✅ Found LRP: "${lrp.title}"`);
  console.log(`   Duration: ${lrp.startDate} to ${lrp.endDate}`);
  console.log(`   Overview length: ${lrp.overview?.length || 0} characters`);

  // 2. Get Unit Plans
  console.log('\n📚 2. UNIT PLANS ANALYSIS:');
  console.log('=========================');
  
  const unitPlans = await prisma.unitPlan.findMany({
    where: {
      longRangePlanId: lrp.id
    },
    orderBy: { title: 'asc' }
  });

  console.log(`✅ Found ${unitPlans.length} Unit Plans`);
  
  unitPlans.forEach((unit, index) => {
    console.log(`   ${index + 1}. "${unit.title}"`);
    console.log(`      Duration: ${unit.startWeek}-${unit.endWeek} weeks`);
    console.log(`      Overview: ${unit.overview?.length || 0} chars`);
    console.log(`      Objectives: ${unit.learningObjectives?.length || 0} chars`);
  });

  // 3. Get All Lessons with detailed analysis
  console.log('\n📝 3. LESSONS DETAILED ANALYSIS:');
  console.log('===============================');
  
  const lessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      unitPlan: {
        longRangePlanId: lrp.id
      }
    },
    include: {
      unitPlan: {
        select: {
          title: true
        }
      }
    },
    orderBy: [
      { unitPlan: { title: 'asc' } },
      { title: 'asc' }
    ]
  });

  console.log(`✅ Found ${lessons.length} total lessons\n`);

  // Group by unit for analysis
  const lessonsByUnit = lessons.reduce((acc, lesson) => {
    const unitTitle = lesson.unitPlan.title;
    if (!acc[unitTitle]) {
      acc[unitTitle] = [];
    }
    acc[unitTitle].push(lesson);
    return acc;
  }, {} as Record<string, any[]>);

  // CRITICAL ISSUE TRACKING
  let totalIssues = 0;
  const issuesByCategory = {
    structure: 0,
    timing: 0,
    assessment: 0,
    differentiation: 0,
    indigenous: 0,
    safety: 0,
    inquiry: 0,
    vocabulary: 0,
    experiments: 0,
    journals: 0
  };

  console.log('🔍 4. CRITICAL ISSUES ANALYSIS BY UNIT:');
  console.log('======================================');

  for (const [unitTitle, unitLessons] of Object.entries(lessonsByUnit)) {
    console.log(`\n📚 UNIT: "${unitTitle}" (${unitLessons.length} lessons)`);
    console.log('─'.repeat(50));
    
    let unitIssues = 0;

    unitLessons.forEach((lesson, index) => {
      const lessonIssues = [];

      // Check ETFO Structure (8/27/10 minutes)
      const mindsOnTiming = extractTiming(lesson.mindsOn);
      const actionTiming = extractTiming(lesson.action);
      const consolidationTiming = extractTiming(lesson.consolidation);
      
      if (!mindsOnTiming?.includes('8 minute')) {
        lessonIssues.push('Missing 8-minute Minds On timing');
        issuesByCategory.timing++;
      }
      if (!actionTiming?.includes('27 minute')) {
        lessonIssues.push('Missing 27-minute Action timing');
        issuesByCategory.timing++;
      }
      if (!consolidationTiming?.includes('10 minute')) {
        lessonIssues.push('Missing 10-minute Consolidation timing');
        issuesByCategory.timing++;
      }

      // Check Duration
      if (lesson.duration !== 45) {
        lessonIssues.push(`Incorrect duration: ${lesson.duration} min (should be 45)`);
        issuesByCategory.structure++;
      }

      // Check Assessment Notes (Observable skills)
      if (!lesson.assessmentNotes || !lesson.assessmentNotes.includes('☐')) {
        lessonIssues.push('Missing observable assessment checkboxes');
        issuesByCategory.assessment++;
      }

      // Check for scientific inquiry indicators
      const hasInquiry = (
        lesson.mindsOn?.includes('investigation') ||
        lesson.mindsOn?.includes('experiment') ||
        lesson.action?.includes('investigation') ||
        lesson.action?.includes('experiment') ||
        lesson.action?.includes('observe') ||
        lesson.action?.includes('predict')
      );
      
      if (!hasInquiry) {
        lessonIssues.push('Missing hands-on investigation/experiment');
        issuesByCategory.inquiry++;
      }

      // Check for science journal integration
      const hasJournal = (
        lesson.action?.includes('journal') ||
        lesson.consolidation?.includes('journal') ||
        lesson.action?.includes('record') ||
        lesson.consolidation?.includes('record')
      );
      
      if (!hasJournal) {
        lessonIssues.push('Missing science journal integration');
        issuesByCategory.journals++;
      }

      // Check for safety protocols
      const hasSafety = (
        lesson.materialsNeeded?.includes('safety') ||
        lesson.action?.includes('safety') ||
        lesson.mindsOn?.includes('safety')
      );
      
      if (!hasSafety && (
        lesson.materialsNeeded?.includes('experiment') ||
        lesson.action?.includes('experiment') ||
        lesson.action?.includes('investigation')
      )) {
        lessonIssues.push('Missing safety protocols for experiments');
        issuesByCategory.safety++;
      }

      // Check for French scientific vocabulary
      const hasFrenchVocab = (
        lesson.vocabularyFocus?.length > 0 ||
        lesson.action?.includes('vocabulaire') ||
        lesson.consolidation?.includes('vocabulaire')
      );
      
      if (!hasFrenchVocab) {
        lessonIssues.push('Missing French scientific vocabulary');
        issuesByCategory.vocabulary++;
      }

      // Check differentiation quality
      if (lesson.differentiationStrategies) {
        const diff = typeof lesson.differentiationStrategies === 'string' 
          ? JSON.parse(lesson.differentiationStrategies)
          : lesson.differentiationStrategies;
        
        if (!diff.forStruggling || !diff.forAdvanced || !diff.forELL) {
          lessonIssues.push('Incomplete differentiation strategies');
          issuesByCategory.differentiation++;
        }
      } else {
        lessonIssues.push('Missing differentiation strategies');
        issuesByCategory.differentiation++;
      }

      // Check Mi'kmaq authenticity
      if (!lesson.indigenousPerspectives || lesson.indigenousPerspectives.length < 50) {
        lessonIssues.push('Missing/insufficient Mi\'kmaq science knowledge');
        issuesByCategory.indigenous++;
      }

      if (lessonIssues.length > 0) {
        console.log(`   ❌ Lesson ${index + 1}: "${lesson.title}"`);
        lessonIssues.forEach(issue => {
          console.log(`      • ${issue}`);
        });
        unitIssues += lessonIssues.length;
        totalIssues += lessonIssues.length;
      }
    });

    if (unitIssues === 0) {
      console.log('   ✅ All lessons in this unit are perfect');
    } else {
      console.log(`   📊 Unit has ${unitIssues} total issues across ${unitLessons.length} lessons`);
    }
  }

  // FINAL SUMMARY
  console.log('\n🔥 5. CRITICAL REVIEW SUMMARY:');
  console.log('=============================');
  console.log(`Total Lessons Reviewed: ${lessons.length}`);
  console.log(`Total Critical Issues Found: ${totalIssues}`);
  console.log(`System Perfection Score: ${Math.max(0, 100 - (totalIssues / lessons.length * 10)).toFixed(1)}%`);
  
  console.log('\n📊 Issues by Category:');
  console.log('─────────────────────');
  Object.entries(issuesByCategory).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`   ${category.charAt(0).toUpperCase() + category.slice(1)}: ${count} issues`);
    }
  });

  console.log('\n🚨 CRITICAL PEDAGOGICAL FAILURES:');
  console.log('================================');
  
  if (issuesByCategory.timing > 100) {
    console.log('❌ MAJOR: ETFO timing structure violated in majority of lessons');
  }
  if (issuesByCategory.assessment > 100) {
    console.log('❌ MAJOR: Observable assessment missing in majority of lessons');
  }
  if (issuesByCategory.inquiry > 50) {
    console.log('❌ MAJOR: Insufficient hands-on scientific inquiry');
  }
  if (issuesByCategory.safety > 10) {
    console.log('❌ MAJOR: Safety protocols missing for experimental activities');
  }
  if (issuesByCategory.journals > 100) {
    console.log('❌ MAJOR: Science journal integration critically absent');
  }

  console.log('\n🎯 IMMEDIATE REMEDIATION REQUIRED:');
  console.log('=================================');
  console.log('1. Fix ETFO timing structure in all lessons (8/27/10 minutes)');
  console.log('2. Add observable assessment checkboxes to all lessons');
  console.log('3. Integrate science journals into all activities');
  console.log('4. Add hands-on investigations to theoretical lessons');
  console.log('5. Include safety protocols for all experimental activities');
  console.log('6. Enhance French scientific vocabulary in all lessons');
  console.log('7. Verify Mi\'kmaq science knowledge authenticity');
}

function extractTiming(content: string | null): string | null {
  if (!content) return null;
  
  // Look for timing pattern like "(8 minutes)" or "(27 minutes)"
  const timingMatch = content.match(/\(\d+\s*minutes?\)/i);
  return timingMatch ? timingMatch[0] : null;
}

// Run the critical review
criticalReviewEmilyScienceComplete()
  .catch((error) => {
    console.error('❌ Error in critical review:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });