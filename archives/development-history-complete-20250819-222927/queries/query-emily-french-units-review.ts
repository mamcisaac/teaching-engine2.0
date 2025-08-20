#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyFrenchUnitsForReview() {
  console.log('🔍 Querying Emily McIsaac\'s Français (Immersion) Units for Critical Review...\n');
  
  try {
    // Find Emily's user ID (should be 23)
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get Long Range Plan for Français (Immersion)
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        academicYear: true,
        description: true
      }
    });

    console.log('📋 LONG RANGE PLAN:');
    if (lrp) {
      console.log(`✅ Found LRP: "${lrp.title}"`);
      console.log(`   Grade: ${lrp.grade}, Academic Year: ${lrp.academicYear}`);
      console.log(`   Description length: ${lrp.description?.length || 0} chars`);
    } else {
      console.log('❌ No Français Long Range Plan found');
    }

    // Get Unit Plans for Français (Immersion) with detailed info
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true,
            date: true,
            duration: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`\n📚 FRENCH UNIT PLANS (${unitPlans.length} total):`);
    if (unitPlans.length === 0) {
      console.log('❌ No Français Unit Plans found');
      return;
    }

    let totalLessons = 0;
    
    unitPlans.forEach((unit, index) => {
      console.log(`\n${index + 1}. "${unit.title}"`);
      console.log(`   Period: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`   Lessons: ${unit.lessonPlans.length}`);
      totalLessons += unit.lessonPlans.length;
      
      // Big Ideas Assessment
      const bigIdeasLength = unit.bigIdeas?.length || 0;
      const hasMeaningfulBigIdeas = bigIdeasLength > 100;
      console.log(`   Big Ideas: ${bigIdeasLength} chars (Meaningful: ${hasMeaningfulBigIdeas})`);
      
      // Essential Questions Assessment  
      const essentialQuestions = Array.isArray(unit.essentialQuestions) ? unit.essentialQuestions : [];
      const hasGoodQuestions = essentialQuestions.length >= 2;
      console.log(`   Essential Questions: ${essentialQuestions.length} (Adequate: ${hasGoodQuestions})`);
      
      // Assessment Plan
      const assessmentLength = unit.assessmentPlan?.length || 0;
      const hasComprehensiveAssessment = assessmentLength > 200;
      console.log(`   Assessment Plan: ${assessmentLength} chars (Comprehensive: ${hasComprehensiveAssessment})`);
      
      // Culminating Task
      const culminatingLength = unit.culminatingTask?.length || 0;
      const hasMeaningfulCulminating = culminatingLength > 150;
      console.log(`   Culminating Task: ${culminatingLength} chars (Meaningful: ${hasMeaningfulCulminating})`);
      
      // Differentiation Strategies
      const diffStrategies = Array.isArray(unit.differentiationStrategies) ? unit.differentiationStrategies : [];
      const hasAdequateDiff = diffStrategies.length >= 3;
      console.log(`   Differentiation Strategies: ${diffStrategies.length} (Adequate: ${hasAdequateDiff})`);
      
      // Curriculum Expectations
      console.log(`   Curriculum Expectations: ${unit.expectations.length}`);
      
      // Initial Quality Score (basic calculation)
      let qualityScore = 0;
      if (hasMeaningfulBigIdeas) qualityScore += 20;
      if (hasGoodQuestions) qualityScore += 20;
      if (hasComprehensiveAssessment) qualityScore += 20;
      if (hasMeaningfulCulminating) qualityScore += 20;
      if (hasAdequateDiff) qualityScore += 20;
      
      console.log(`   Initial Quality Score: ${qualityScore}%`);
    });

    console.log(`\n📊 FRENCH CURRICULUM SUMMARY:`);
    console.log(`   Total French Units: ${unitPlans.length}`);
    console.log(`   Total French Lessons: ${totalLessons}`);
    console.log(`   Required French Lessons: 372 (2 per day × 186 days)`);
    console.log(`   Lesson Gap: ${372 - totalLessons} lessons needed`);
    console.log(`   Gap Percentage: ${Math.round((372 - totalLessons) / 372 * 100)}% missing`);

    // Return data for critical review
    return {
      emily,
      lrp,
      unitPlans,
      totalLessons,
      lessonGap: 372 - totalLessons
    };

  } catch (error) {
    console.error('❌ Error querying Emily\'s French curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { queryEmilyFrenchUnitsForReview };

// Run if called directly
if (require.main === module) {
  queryEmilyFrenchUnitsForReview()
    .then((result) => {
      console.log('\n🎉 Query completed successfully!');
      if (result) {
        console.log('\n📋 Data ready for critical review analysis.');
      }
    })
    .catch((error) => {
      console.error('💥 Query failed:', error);
      process.exit(1);
    });
}