#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyRotationSubjectsComprehensive() {
  try {
    console.log('🔄 COMPREHENSIVE ROTATION SUBJECTS ANALYSIS: Emily McIsaac (User ID 23)');
    console.log('=' + '='.repeat(80));
    
    // Verify Emily exists
    const emily = await prisma.user.findUnique({
      where: { id: 23 },
      select: { id: true, name: true, email: true }
    });
    
    if (!emily) {
      console.log('❌ User with ID 23 not found!');
      return;
    }
    
    console.log(`✅ Found user: ${emily.name} (${emily.email})\n`);

    // Define the 4 rotation subjects
    const rotationSubjects = [
      { name: 'Sciences de la nature', expectedLessons: 48, rotationBlocks: 5 },
      { name: 'Sciences humaines', expectedLessons: 30, rotationBlocks: 2 },
      { name: 'Arts visuels', expectedLessons: 30, rotationBlocks: 2 },
      { name: 'Formation personnelle et sociale', expectedLessons: 30, rotationBlocks: 2 }
    ];

    let overallResults: any = {
      subjects: [],
      totalUnits: 0,
      totalLessons: 0,
      criticalIssues: []
    };

    // Analyze each rotation subject
    for (const subject of rotationSubjects) {
      console.log(`\n📚 ANALYZING: ${subject.name.toUpperCase()}`);
      console.log('─'.repeat(80));
      console.log(`Expected: ${subject.expectedLessons} lessons in ${subject.rotationBlocks} rotation blocks\n`);

      // Find LRP for this subject
      const lrp = await prisma.longRangePlan.findFirst({
        where: {
          userId: 23,
          subject: subject.name
        },
        select: {
          id: true,
          title: true,
          subject: true,
          grade: true,
          description: true,
          overarchingQuestions: true,
          assessmentOverview: true,
          indigenousPerspectives: true
        }
      });

      if (!lrp) {
        console.log(`❌ No Long Range Plan found for ${subject.name}`);
        overallResults.criticalIssues.push(`Missing Long Range Plan for ${subject.name}`);
        overallResults.subjects.push({
          name: subject.name,
          lrpExists: false,
          units: 0,
          lessons: 0,
          expected: subject.expectedLessons,
          status: 'MISSING_LRP'
        });
        continue;
      }

      console.log(`✅ LRP Found: "${lrp.title}"`);
      console.log(`   Grade: ${lrp.grade}`);
      console.log(`   Description: ${lrp.description?.substring(0, 100) || 'Not provided'}...`);

      // Get unit plans for this LRP
      const unitPlans = await prisma.unitPlan.findMany({
        where: { longRangePlanId: lrp.id },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          description: true,
          bigIdeas: true,
          essentialQuestions: true,
          assessmentPlan: true,
          differentiationStrategies: true,
          culminatingTask: true,
          keyVocabulary: true,
          priorKnowledge: true,
          communityConnections: true,
          expectations: {
            include: {
              expectation: {
                select: {
                  code: true,
                  title: true,
                  description: true
                }
              }
            }
          }
        },
        orderBy: { startDate: 'asc' }
      });

      console.log(`\n📖 Unit Plans Found: ${unitPlans.length}`);
      
      if (unitPlans.length === 0) {
        console.log(`❌ No unit plans found for ${subject.name}`);
        overallResults.criticalIssues.push(`${subject.name} has no unit plans`);
        overallResults.subjects.push({
          name: subject.name,
          lrpExists: true,
          units: 0,
          lessons: 0,
          expected: subject.expectedLessons,
          status: 'NO_UNITS'
        });
        continue;
      }

      let subjectTotalLessons = 0;
      let subjectIssues: string[] = [];

      // Analyze each unit
      for (const [index, unit] of unitPlans.entries()) {
        console.log(`\n   ${index + 1}. "${unit.title}"`);
        console.log(`      📅 ${unit.startDate.toLocaleDateString()} → ${unit.endDate.toLocaleDateString()}`);
        console.log(`      📚 Expectations: ${unit.expectations.length}`);

        // Get lesson count for this unit
        const lessonCount = await prisma.eTFOLessonPlan.count({
          where: { unitPlanId: unit.id }
        });

        subjectTotalLessons += lessonCount;
        console.log(`      📝 Lessons: ${lessonCount}`);

        // Critical Analysis
        if (unit.expectations.length === 0) {
          subjectIssues.push(`Unit "${unit.title}" has no curriculum expectations`);
        }

        if (lessonCount === 0) {
          subjectIssues.push(`Unit "${unit.title}" has no lesson plans`);
        }

        if (!unit.description || unit.description.length < 50) {
          subjectIssues.push(`Unit "${unit.title}" has insufficient description`);
        }

        if (!unit.bigIdeas || unit.bigIdeas.length < 50) {
          subjectIssues.push(`Unit "${unit.title}" lacks meaningful Big Ideas`);
        }

        if (!unit.essentialQuestions) {
          subjectIssues.push(`Unit "${unit.title}" lacks Essential Questions`);
        }

        if (!unit.assessmentPlan) {
          subjectIssues.push(`Unit "${unit.title}" lacks Assessment Plan`);
        }

        if (!unit.differentiationStrategies) {
          subjectIssues.push(`Unit "${unit.title}" lacks Differentiation Strategies`);
        }

        if (!unit.culminatingTask) {
          subjectIssues.push(`Unit "${unit.title}" lacks Culminating Task`);
        }

        // Check for Grade 1 appropriateness
        if (lessonCount > 20) {
          subjectIssues.push(`Unit "${unit.title}" has ${lessonCount} lessons - may be too long for Grade 1`);
        }
      }

      // Subject-level analysis
      const lessonStatus = subjectTotalLessons === subject.expectedLessons ? 'PERFECT' : 
                          subjectTotalLessons > subject.expectedLessons ? 'OVER' : 'SHORT';
      
      console.log(`\n   📊 SUBJECT SUMMARY:`);
      console.log(`      Total Lessons: ${subjectTotalLessons} / ${subject.expectedLessons} expected`);
      console.log(`      Status: ${lessonStatus}`);
      console.log(`      Critical Issues: ${subjectIssues.length}`);

      if (lessonStatus !== 'PERFECT') {
        const difference = Math.abs(subjectTotalLessons - subject.expectedLessons);
        subjectIssues.push(`${subject.name} has ${lessonStatus === 'OVER' ? 'excess' : 'insufficient'} lessons: ${difference} ${lessonStatus === 'OVER' ? 'over' : 'short'}`);
      }

      // Add to overall results
      overallResults.subjects.push({
        name: subject.name,
        lrpExists: true,
        units: unitPlans.length,
        lessons: subjectTotalLessons,
        expected: subject.expectedLessons,
        status: lessonStatus,
        issues: subjectIssues
      });

      overallResults.totalUnits += unitPlans.length;
      overallResults.totalLessons += subjectTotalLessons;
      overallResults.criticalIssues.push(...subjectIssues);

      console.log(`\n   🚨 Unit-Level Issues (${subjectIssues.length}):`);
      subjectIssues.forEach((issue, i) => {
        console.log(`      ${i + 1}. ${issue}`);
      });
    }

    // OVERALL ROTATION ANALYSIS
    console.log('\n\n🔄 OVERALL ROTATION SUBJECTS ANALYSIS:');
    console.log('=' + '='.repeat(80));
    
    const totalExpectedLessons = rotationSubjects.reduce((sum, s) => sum + s.expectedLessons, 0);
    
    console.log(`📊 ROTATION SUBJECTS SUMMARY:`);
    console.log(`   Total Units: ${overallResults.totalUnits}`);
    console.log(`   Total Lessons: ${overallResults.totalLessons} / ${totalExpectedLessons} expected`);
    console.log(`   Critical Issues: ${overallResults.criticalIssues.length}`);
    
    console.log(`\n📈 SUBJECT BREAKDOWN:`);
    overallResults.subjects.forEach((subject: any) => {
      const statusEmoji = subject.status === 'PERFECT' ? '✅' : 
                         subject.status === 'OVER' ? '⚠️ ' : '❌';
      console.log(`   ${statusEmoji} ${subject.name}: ${subject.lessons}/${subject.expected} lessons (${subject.units} units)`);
    });

    console.log(`\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:`);
    if (overallResults.criticalIssues.length === 0) {
      console.log(`   ✅ NO CRITICAL ISSUES - All rotation subjects ready for ETFO perfection!`);
    } else {
      overallResults.criticalIssues.forEach((issue: string, i: number) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    }

    // ETFO COMPLIANCE READINESS
    console.log(`\n🎯 ETFO GRADE 1 COMPLIANCE READINESS ASSESSMENT:`);
    console.log('─'.repeat(60));
    
    let readinessScore = 0;
    const maxScore = overallResults.subjects.length * 10;

    overallResults.subjects.forEach((subject: any) => {
      let subjectScore = 0;
      
      if (subject.lrpExists) subjectScore += 2;
      if (subject.units > 0) subjectScore += 2;
      if (subject.lessons > 0) subjectScore += 2;
      if (subject.status === 'PERFECT') subjectScore += 3;
      else if (subject.status !== 'MISSING_LRP' && subject.status !== 'NO_UNITS') subjectScore += 1;
      
      // Bonus for having reasonable unit counts
      if (subject.units >= 2 && subject.units <= 6) subjectScore += 1;
      
      readinessScore += subjectScore;
      
      console.log(`   ${subject.name}: ${subjectScore}/10 readiness points`);
    });

    const readinessPercentage = Math.round((readinessScore / maxScore) * 100);
    console.log(`\n📊 Overall ETFO Readiness: ${readinessScore}/${maxScore} (${readinessPercentage}%)`);
    
    let readinessLevel = '';
    if (readinessPercentage >= 90) readinessLevel = '🟢 EXCELLENT - Ready for advanced ETFO perfection';
    else if (readinessPercentage >= 70) readinessLevel = '🟡 GOOD - Minor adjustments needed before ETFO perfection';
    else if (readinessPercentage >= 50) readinessLevel = '🟠 FAIR - Significant work needed before ETFO perfection';
    else readinessLevel = '🔴 POOR - Major reconstruction required before ETFO perfection';
    
    console.log(`   Status: ${readinessLevel}`);

    // Export results
    const fs = await import('fs');
    await fs.promises.writeFile(
      '/Users/michaelmcisaac/Github/teaching-engine2.0/emily-rotation-subjects-comprehensive-analysis.json',
      JSON.stringify(overallResults, null, 2)
    );

    console.log('\n💾 Comprehensive analysis exported to: emily-rotation-subjects-comprehensive-analysis.json');
    
    return overallResults;

  } catch (error) {
    console.error('❌ Error in comprehensive rotation subjects analysis:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the comprehensive analysis
queryEmilyRotationSubjectsComprehensive()
  .then(data => {
    console.log('\n✅ COMPREHENSIVE ROTATION SUBJECTS ANALYSIS COMPLETED');
    console.log(`📊 Final Results: ${data.totalUnits} total units, ${data.totalLessons} total lessons`);
    console.log(`🚨 ${data.criticalIssues.length} critical issues identified for ETFO perfection work`);
  })
  .catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });