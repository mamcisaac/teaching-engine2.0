#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualEmilyFrenchReview() {
  console.log('🔍 MANUAL REVIEW: Emily McIsaac\'s 372 French Lessons for Grade 1\n');
  console.log('==================================================================\n');
  
  try {
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get all French lessons (multiple possible subject names)
    const frenchSubjects = [
      'Français (Immersion)',
      'Français (Immersion)', 
      'French Immersion',
      'Français'
    ];

    console.log('🔍 Searching for French lessons with subjects:', frenchSubjects.join(', '));

    const allFrenchLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: {
          in: frenchSubjects
        }
      },
      orderBy: { date: 'asc' },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      }
    });

    console.log(`\n📊 TOTAL FRENCH LESSONS FOUND: ${allFrenchLessons.length}`);

    if (allFrenchLessons.length === 0) {
      console.log('❌ No French lessons found. Checking all subjects...\n');
      
      const allLessons = await prisma.eTFOLessonPlan.findMany({
        where: { userId: emily.id },
        select: { subject: true }
      });
      
      const subjectCounts = allLessons.reduce((acc, lesson) => {
        acc[lesson.subject || 'NULL'] = (acc[lesson.subject || 'NULL'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('All subjects found:');
      Object.entries(subjectCounts).forEach(([subject, count]) => {
        console.log(`   ${subject}: ${count} lessons`);
      });
      return;
    }

    // Group by subject to see distribution
    const lessonsBySubject = allFrenchLessons.reduce((acc, lesson) => {
      const subject = lesson.subject || 'Unknown';
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(lesson);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('\n📋 LESSONS BY SUBJECT:');
    Object.entries(lessonsBySubject).forEach(([subject, lessons]) => {
      console.log(`   ${subject}: ${lessons.length} lessons`);
    });

    // Group by month for timeline analysis
    const lessonsByMonth = allFrenchLessons.reduce((acc, lesson) => {
      const month = lesson.date.toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(lesson);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('\n📅 LESSONS BY MONTH:');
    Object.entries(lessonsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, lessons]) => {
        console.log(`   ${month}: ${lessons.length} lessons`);
      });

    // Analyze auto-generated patterns
    console.log('\n🤖 AUTO-GENERATED LESSON ANALYSIS:');
    
    const lectureGuideePattern = allFrenchLessons.filter(lesson => 
      lesson.title?.includes('Lecture guidée') || lesson.title?.includes('lecture guidée')
    );
    
    const atelierEcriturePattern = allFrenchLessons.filter(lesson => 
      lesson.title?.includes('Atelier d\'écriture') || lesson.title?.includes('atelier d\'écriture')
    );

    const weekPattern = allFrenchLessons.filter(lesson => 
      lesson.title?.includes('Semaine') || lesson.title?.includes('semaine') ||
      lesson.title?.includes('Week') || lesson.title?.includes('week')
    );

    console.log(`   Lecture guidée patterns: ${lectureGuideePattern.length}`);
    console.log(`   Atelier d'écriture patterns: ${atelierEcriturePattern.length}`);
    console.log(`   Week/Semaine patterns: ${weekPattern.length}`);

    // Check for identical duplicates
    const titleCounts = allFrenchLessons.reduce((acc, lesson) => {
      const title = lesson.title;
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicates = Object.entries(titleCounts).filter(([title, count]) => count > 1);
    console.log(`\n🔄 DUPLICATE TITLES: ${duplicates.length} titles repeated`);
    
    if (duplicates.length > 0) {
      console.log('   Top duplicates:');
      duplicates
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([title, count]) => {
          console.log(`      "${title}": ${count} times`);
        });
    }

    // Sample 10 recent lessons for detailed analysis
    console.log('\n📝 DETAILED SAMPLE ANALYSIS (Recent 10 Lessons):');
    console.log('==================================================');
    
    const recentLessons = allFrenchLessons.slice(-10);

    for (let i = 0; i < recentLessons.length; i++) {
      const lesson = recentLessons[i];
      console.log(`\n${i + 1}. "${lesson.title}"`);
      console.log(`   Date: ${lesson.date.toDateString()}`);
      console.log(`   Duration: ${lesson.duration} minutes`);
      console.log(`   Subject: ${lesson.subject}`);
      
      // Check ETFO structure
      const hasMindsOn = lesson.mindsOn && lesson.mindsOn.length > 10;
      const hasAction = lesson.action && lesson.action.length > 10;
      const hasConsolidation = lesson.consolidation && lesson.consolidation.length > 10;
      
      console.log(`   ETFO Structure: Minds On(${hasMindsOn}), Action(${hasAction}), Consolidation(${hasConsolidation})`);
      
      if (hasMindsOn && hasAction && hasConsolidation) {
        // Check timing distribution
        const mindsOnLength = lesson.mindsOn?.length || 0;
        const actionLength = lesson.action?.length || 0;
        const consolidationLength = lesson.consolidation?.length || 0;
        const totalLength = mindsOnLength + actionLength + consolidationLength;
        
        if (totalLength > 0) {
          const mindsOnPercent = Math.round((mindsOnLength / totalLength) * 100);
          const actionPercent = Math.round((actionLength / totalLength) * 100);
          const consolidationPercent = Math.round((consolidationLength / totalLength) * 100);
          
          console.log(`   Content Distribution: ${mindsOnPercent}% / ${actionPercent}% / ${consolidationPercent}%`);
          
          const properTiming = mindsOnPercent >= 15 && mindsOnPercent <= 25 && 
                             actionPercent >= 55 && actionPercent <= 65 && 
                             consolidationPercent >= 15 && consolidationPercent <= 25;
          console.log(`   Proper 8/27/10 timing: ${properTiming ? '✅' : '❌'}`);
        }
      }

      // Check for French language content
      const hasFrenchContent = lesson.titleFr || lesson.mindsOnFr || lesson.actionFr || lesson.consolidationFr;
      console.log(`   French Content: ${hasFrenchContent ? '✅' : '❌'}`);

      // Check learning goals
      const hasLearningGoals = lesson.learningGoals && lesson.learningGoals.length > 10;
      console.log(`   Learning Goals: ${hasLearningGoals ? '✅' : '❌'}`);
      
      if (hasLearningGoals) {
        console.log(`      Goals: "${lesson.learningGoals?.substring(0, 100)}..."`);
      }

      // Check materials
      const hasMaterials = lesson.materials && Object.keys(lesson.materials as any).length > 0;
      console.log(`   Materials Listed: ${hasMaterials ? '✅' : '❌'}`);

      // Check differentiation
      const hasDifferentiation = lesson.differentiationStrategies && 
                                Object.keys(lesson.differentiationStrategies as any).length > 0;
      console.log(`   Differentiation: ${hasDifferentiation ? '✅' : '❌'}`);

      // Check assessment
      const hasAssessment = lesson.assessmentType || lesson.assessmentNotes;
      console.log(`   Assessment: ${hasAssessment ? '✅' : '❌'}`);

      // Content quality check - look for generic vs specific content
      const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`;
      const isGeneric = content.includes('Students will') && content.includes('Teacher will') && 
                       content.length < 500;
      console.log(`   Content Quality: ${isGeneric ? '❌ Generic' : '✅ Specific'}`);

      console.log('   ' + '-'.repeat(60));
    }

    // Overall quality metrics
    console.log('\n📊 OVERALL QUALITY METRICS:');
    console.log('============================');

    const etfoCompliant = allFrenchLessons.filter(lesson => 
      lesson.mindsOn && lesson.action && lesson.consolidation &&
      lesson.mindsOn.length > 10 && lesson.action.length > 10 && lesson.consolidation.length > 10
    );

    const withLearningGoals = allFrenchLessons.filter(lesson => 
      lesson.learningGoals && lesson.learningGoals.length > 10
    );

    const withFrenchContent = allFrenchLessons.filter(lesson => 
      lesson.titleFr || lesson.mindsOnFr || lesson.actionFr || lesson.consolidationFr
    );

    const withMaterials = allFrenchLessons.filter(lesson => 
      lesson.materials && Object.keys(lesson.materials as any).length > 0
    );

    const withDifferentiation = allFrenchLessons.filter(lesson => 
      lesson.differentiationStrategies && Object.keys(lesson.differentiationStrategies as any).length > 0
    );

    const withAssessment = allFrenchLessons.filter(lesson => 
      lesson.assessmentType || lesson.assessmentNotes
    );

    const proper45MinTiming = allFrenchLessons.filter(lesson => lesson.duration === 45);

    console.log(`   ETFO Structure Complete: ${etfoCompliant.length}/${allFrenchLessons.length} (${Math.round(etfoCompliant.length/allFrenchLessons.length*100)}%)`);
    console.log(`   Learning Goals Present: ${withLearningGoals.length}/${allFrenchLessons.length} (${Math.round(withLearningGoals.length/allFrenchLessons.length*100)}%)`);
    console.log(`   French Content Present: ${withFrenchContent.length}/${allFrenchLessons.length} (${Math.round(withFrenchContent.length/allFrenchLessons.length*100)}%)`);
    console.log(`   Materials Listed: ${withMaterials.length}/${allFrenchLessons.length} (${Math.round(withMaterials.length/allFrenchLessons.length*100)}%)`);
    console.log(`   Differentiation Strategies: ${withDifferentiation.length}/${allFrenchLessons.length} (${Math.round(withDifferentiation.length/allFrenchLessons.length*100)}%)`);
    console.log(`   Assessment Present: ${withAssessment.length}/${allFrenchLessons.length} (${Math.round(withAssessment.length/allFrenchLessons.length*100)}%)`);
    console.log(`   Proper 45min Duration: ${proper45MinTiming.length}/${allFrenchLessons.length} (${Math.round(proper45MinTiming.length/allFrenchLessons.length*100)}%)`);

    // Final verdict
    console.log('\n🚨 CRITICAL ISSUES SUMMARY:');
    console.log('=============================');

    const qualityLessons = etfoCompliant.filter(lesson => 
      lesson.learningGoals && lesson.learningGoals.length > 10 &&
      (lesson.materials && Object.keys(lesson.materials as any).length > 0) &&
      lesson.duration === 45
    );

    console.log(`   Quality Lessons: ${qualityLessons.length}/${allFrenchLessons.length} (${Math.round(qualityLessons.length/allFrenchLessons.length*100)}%)`);
    console.log(`   Duplicate Titles: ${duplicates.length} patterns`);
    console.log(`   Auto-Generated Patterns: ${lectureGuideePattern.length + atelierEcriturePattern.length} lessons`);

    if (qualityLessons.length / allFrenchLessons.length < 0.7) {
      console.log('\n❌ SYSTEM STATUS: NEEDS EMERGENCY FIXES');
      console.log('   Estimated time to fix: 40-60 hours');
      console.log('   Priority: Critical - Immediate intervention required');
    } else if (qualityLessons.length / allFrenchLessons.length < 0.9) {
      console.log('\n⚠️  SYSTEM STATUS: NEEDS SIGNIFICANT IMPROVEMENT');
      console.log('   Estimated time to fix: 20-30 hours');
      console.log('   Priority: High - Fixes needed within 2 weeks');
    } else {
      console.log('\n✅ SYSTEM STATUS: GOOD QUALITY');
      console.log('   Minor improvements needed');
    }

    console.log('\n✅ Manual review complete!');

  } catch (error) {
    console.error('❌ Error in manual review:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

manualEmilyFrenchReview()
  .then(() => console.log('🎉 Manual review completed successfully!'))
  .catch((error) => {
    console.error('💥 Manual review failed:', error);
    process.exit(1);
  });