#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/michaelmcisaac/Github/teaching-engine2.0/packages/database/prisma/dev.db'
    }
  }
});

async function reviewJanuaryWritingUnit() {
  console.log('📝 CRITICAL REVIEW: January Writing Practice Unit');
  console.log('==============================================');

  const unitPlanId = 'cmectx0ow0009vj4p5fj84kve';
  
  try {
    // Query the unit plan with all lessons
    const unitPlan = await prisma.unitPlan.findUnique({
      where: {
        id: unitPlanId
      },
      include: {
        lessonPlans: {
          orderBy: {
            date: 'asc'
          }
        }
      }
    });

    if (!unitPlan) {
      throw new Error(`Unit plan with ID ${unitPlanId} not found`);
    }

    console.log(`📋 Unit: ${unitPlan.title || unitPlan.titleFr}`);
    console.log(`📚 Lessons found: ${unitPlan.lessonPlans.length}`);
    console.log('');

    // Review each lesson against perfection criteria
    const lessonScores = [];
    let totalScore = 0;

    for (const lesson of unitPlan.lessonPlans) {
      console.log(`\n📖 REVIEWING: ${lesson.title} (${lesson.date.toDateString()})`);
      
      let lessonScore = 100; // Start with perfect score, deduct for issues
      const issues = [];

      // 1. Duration Check (exactly 45 minutes)
      if (lesson.duration !== 45) {
        lessonScore -= 10;
        issues.push(`Duration is ${lesson.duration} minutes, must be exactly 45`);
      }

      // 2. Vocabulary Load Check (examine materials for vocabulary cards)
      const materials = lesson.materials || [];
      const materialsText = JSON.stringify(materials).toLowerCase();
      const vocabularyMatches = materialsText.match(/vocabulary cards?[^"]*"/g) || [];
      
      if (vocabularyMatches.length > 0) {
        const vocabString = vocabularyMatches[0];
        const vocabWords = vocabString.split(':')[1]?.split(',').length || 0;
        if (vocabWords > 3) {
          lessonScore -= 15;
          issues.push(`Vocabulary overload: ${vocabWords} words, maximum 3 allowed`);
        }
      }

      // 3. Observable Assessment Check (checkbox criteria)
      const assessmentNotes = lesson.assessmentNotes || '';
      if (!assessmentNotes.includes('☐') || !assessmentNotes.includes('Circle proficiency level')) {
        lessonScore -= 15;
        issues.push('Missing observable assessment with checkbox rubrics');
      }

      // 4. Differentiation Check (specific strategies)
      const modifications = lesson.modifications;
      if (!modifications || 
          !modifications.forStruggling || 
          !modifications.forIEP || 
          !modifications.forELL || 
          !modifications.forAdvanced) {
        lessonScore -= 15;
        issues.push('Missing specific differentiation strategies');
      }

      // 5. Indigenous Perspectives Check (authentic connections)
      const indigenous = lesson.indigenousPerspectives || '';
      if (indigenous.length < 100 || !indigenous.includes('Mi\'kmaq')) {
        lessonScore -= 10;
        issues.push('Missing authentic Indigenous perspectives');
      }

      // 6. ETFO Structure Check (timing breakdown)
      const mindsOn = lesson.mindsOn || '';
      const action = lesson.action || '';
      const consolidation = lesson.consolidation || '';

      const mindsOnMatch = mindsOn.match(/\*\*Minds On \((\d+) minutes?\)\*\*/);
      const actionMatch = action.match(/\*\*Action \((\d+) minutes?\)\*\*/);
      const consolidationMatch = consolidation.match(/\*\*Consolidation \((\d+) minutes?\)\*\*/);

      const mindsOnMin = mindsOnMatch ? parseInt(mindsOnMatch[1]) : 0;
      const actionMin = actionMatch ? parseInt(actionMatch[1]) : 0;
      const consolidationMin = consolidationMatch ? parseInt(consolidationMatch[1]) : 0;

      if (mindsOnMin < 7 || mindsOnMin > 8 || 
          actionMin < 27 || actionMin > 28 || 
          consolidationMin !== 10) {
        lessonScore -= 10;
        issues.push(`ETFO timing incorrect: ${mindsOnMin}+${actionMin}+${consolidationMin} ≠ 7-8+27-28+10`);
      }

      // 7. Writing Focus Check (appropriate for writing unit)
      const allContent = (lesson.title + lesson.mindsOn + lesson.action + lesson.consolidation).toLowerCase();
      if (!allContent.includes('writ') && !allContent.includes('écrire') && !allContent.includes('letter') && !allContent.includes('lettre')) {
        lessonScore -= 10;
        issues.push('Missing clear writing focus for writing practice unit');
      }

      // Display results for this lesson
      if (issues.length === 0) {
        console.log('✅ PERFECT (100%)');
      } else {
        console.log(`⚠️  SCORE: ${lessonScore}%`);
        issues.forEach(issue => console.log(`   • ${issue}`));
      }

      lessonScores.push({
        title: lesson.title,
        date: lesson.date.toDateString(),
        score: lessonScore,
        issues: issues
      });

      totalScore += lessonScore;
    }

    // Calculate overall unit score
    const overallScore = Math.round(totalScore / unitPlan.lessonPlans.length);

    console.log('\n🏆 JANUARY WRITING PRACTICE UNIT RESULTS');
    console.log('==========================================');
    console.log(`Overall Score: ${overallScore}%`);
    console.log(`Lessons Reviewed: ${unitPlan.lessonPlans.length}`);
    console.log(`Meets 95%+ Standard: ${overallScore >= 95 ? 'YES ✅' : 'NO ❌'}`);

    console.log('\n📊 LESSON BREAKDOWN:');
    lessonScores.forEach((lesson, index) => {
      const status = lesson.score >= 95 ? '✅' : '❌';
      console.log(`${index + 1}. ${lesson.title} - ${lesson.score}% ${status}`);
    });

    if (overallScore < 95) {
      console.log('\n🔧 IMPROVEMENTS NEEDED FOR PERFECTION:');
      const allIssues = lessonScores.flatMap(lesson => lesson.issues);
      const uniqueIssues = [...new Set(allIssues)];
      uniqueIssues.forEach(issue => console.log(`• ${issue}`));
    }

    console.log('\n📈 COMPARISON TO OTHER UNITS:');
    console.log('• December: 100% (Perfect)');
    console.log(`• January: ${overallScore}% ${overallScore >= 95 ? '(Perfect)' : '(Needs Work)'}`);
    
  } catch (error) {
    console.error('❌ Error during review:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reviewJanuaryWritingUnit().catch(console.error);