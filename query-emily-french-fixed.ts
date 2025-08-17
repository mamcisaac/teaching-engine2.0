#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyFrenchComplete() {
  console.log('🔍 Querying Emily McIsaac\'s COMPLETE Français (Immersion) System...\n');
  
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

    // Get Long Range Plan for Français (Immersion)
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français langue première'
      }
    });

    console.log('📋 LONG RANGE PLAN:');
    if (lrp) {
      console.log(`✅ Found LRP: "${lrp.title}"`);
      console.log(`   Grade: ${lrp.grade}, Academic Year: ${lrp.academicYear}`);
      console.log(`   Description length: ${lrp.description?.length || 0} chars`);
      console.log(`   Goals length: ${lrp.goals?.length || 0} chars`);
      console.log(`   Assessment Overview: ${lrp.assessmentOverview?.length || 0} chars`);
      console.log(`   Professional Goals: ${lrp.professionalGoals?.length || 0} chars`);
    } else {
      console.log('❌ No Français Long Range Plan found');
    }

    // Get Unit Plans for Français (Immersion) through LongRangePlan relationship
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français langue première'
        }
      },
      include: {
        longRangePlan: true,
        lessonPlans: true
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`\n📚 UNIT PLANS (${unitPlans.length} total):`);
    if (unitPlans.length === 0) {
      console.log('❌ No Français Unit Plans found');
    } else {
      unitPlans.forEach((unit, index) => {
        console.log(`${index + 1}. "${unit.title}"`);
        console.log(`   Period: ${unit.startDate.toDateString()} to ${unit.endDate.toDateString()}`);
        console.log(`   Estimated Hours: ${unit.estimatedHours || 'Not specified'}`);
        console.log(`   Description: ${unit.description?.length || 0} chars`);
        console.log(`   Big Ideas: ${unit.bigIdeas?.length || 0} chars`);
        console.log(`   Assessment Plan: ${unit.assessmentPlan?.length || 0} chars`);
        console.log(`   Differentiation: ${unit.differentiationStrategies ? JSON.stringify(unit.differentiationStrategies).length : 0} chars`);
        console.log(`   Indigenous Perspectives: ${unit.indigenousPerspectives?.length || 0} chars`);
        console.log(`   Lesson Plans: ${unit.lessonPlans.length} lessons`);
        console.log('');
      });
    }

    // Get Lesson Plans for Français (Immersion)
    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Français langue première'
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    console.log(`📝 LESSON PLANS (${lessonPlans.length} total):`);
    if (lessonPlans.length === 0) {
      console.log('❌ No Français Lesson Plans found');
    } else {
      console.log('✅ Lesson Plans by Month:');
      
      const lessonsByMonth = lessonPlans.reduce((acc, lesson) => {
        const month = lesson.date.toISOString().substring(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(lesson);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(lessonsByMonth).forEach(([month, lessons]) => {
        console.log(`   ${month}: ${lessons.length} lessons`);
        
        // Check ETFO compliance for sample lessons
        const sampleLesson = lessons[0];
        if (sampleLesson) {
          const hasMindsOn = !!sampleLesson.mindsOn;
          const hasAction = !!sampleLesson.action;
          const hasConsolidation = !!sampleLesson.consolidation;
          const hasProperTiming = sampleLesson.duration === 45;
          
          console.log(`      Sample: "${sampleLesson.title}"`);
          console.log(`      ETFO Structure: Minds On(${hasMindsOn}), Action(${hasAction}), Consolidation(${hasConsolidation})`);
          console.log(`      Duration: ${sampleLesson.duration} min (45min target: ${hasProperTiming})`);
          console.log(`      Learning Goals: ${!!sampleLesson.learningGoals}`);
          console.log(`      Assessment: ${!!sampleLesson.assessmentType}`);
        }
      });

      // Analysis by key criteria
      console.log('\n🔍 CRITICAL ANALYSIS:');
      
      // Check for oral language emphasis
      const oralLanguageLessons = lessonPlans.filter(lesson => {
        const mindsOn = lesson.mindsOn?.toLowerCase() || '';
        const action = lesson.action?.toLowerCase() || '';
        const consolidation = lesson.consolidation?.toLowerCase() || '';
        const allContent = `${mindsOn} ${action} ${consolidation}`;
        
        return allContent.includes('oral') ||
               allContent.includes('speaking') ||
               allContent.includes('listening') ||
               allContent.includes('conversation') ||
               allContent.includes('discussion') ||
               allContent.includes('parler') ||
               allContent.includes('écouter') ||
               allContent.includes('discuter');
      });
      console.log(`   Oral Language Focus: ${oralLanguageLessons.length}/${lessonPlans.length} lessons (${Math.round(oralLanguageLessons.length/lessonPlans.length*100)}%)`);

      // Check for reading readiness
      const readingLessons = lessonPlans.filter(lesson => {
        const mindsOn = lesson.mindsOn?.toLowerCase() || '';
        const action = lesson.action?.toLowerCase() || '';
        const consolidation = lesson.consolidation?.toLowerCase() || '';
        const allContent = `${mindsOn} ${action} ${consolidation}`;
        
        return allContent.includes('reading') ||
               allContent.includes('phonics') ||
               allContent.includes('letters') ||
               allContent.includes('sounds') ||
               allContent.includes('decode') ||
               allContent.includes('lecture') ||
               allContent.includes('lire') ||
               allContent.includes('lettres') ||
               allContent.includes('sons');
      });
      console.log(`   Reading Readiness: ${readingLessons.length}/${lessonPlans.length} lessons (${Math.round(readingLessons.length/lessonPlans.length*100)}%)`);

      // Check for early writing
      const writingLessons = lessonPlans.filter(lesson => {
        const mindsOn = lesson.mindsOn?.toLowerCase() || '';
        const action = lesson.action?.toLowerCase() || '';
        const consolidation = lesson.consolidation?.toLowerCase() || '';
        const allContent = `${mindsOn} ${action} ${consolidation}`;
        
        return allContent.includes('writing') ||
               allContent.includes('journal') ||
               allContent.includes('letters') ||
               allContent.includes('drawing') ||
               allContent.includes('écriture') ||
               allContent.includes('écrire') ||
               allContent.includes('dessiner');
      });
      console.log(`   Early Writing: ${writingLessons.length}/${lessonPlans.length} lessons (${Math.round(writingLessons.length/lessonPlans.length*100)}%)`);

      // Check for ETFO structure compliance
      const etfoCompliantLessons = lessonPlans.filter(lesson => {
        return !!lesson.mindsOn && !!lesson.action && !!lesson.consolidation;
      });
      console.log(`   ETFO Structure Compliance: ${etfoCompliantLessons.length}/${lessonPlans.length} lessons (${Math.round(etfoCompliantLessons.length/lessonPlans.length*100)}%)`);

      // Check for proper timing (45 minutes)
      const properTimingLessons = lessonPlans.filter(lesson => lesson.duration === 45);
      console.log(`   Proper Timing (45min): ${properTimingLessons.length}/${lessonPlans.length} lessons (${Math.round(properTimingLessons.length/lessonPlans.length*100)}%)`);

      // Check for differentiation
      const differentiatedLessons = lessonPlans.filter(lesson => 
        lesson.differentiationStrategies ||
        lesson.accommodations ||
        lesson.modifications ||
        lesson.extensions
      );
      console.log(`   Differentiation Present: ${differentiatedLessons.length}/${lessonPlans.length} lessons (${Math.round(differentiatedLessons.length/lessonPlans.length*100)}%)`);

      // Check for assessment
      const assessmentLessons = lessonPlans.filter(lesson => 
        lesson.assessmentType || lesson.assessmentNotes || lesson.formativeCheckpoints
      );
      console.log(`   Assessment Strategies: ${assessmentLessons.length}/${lessonPlans.length} lessons (${Math.round(assessmentLessons.length/lessonPlans.length*100)}%)`);

      // Check for Indigenous perspectives
      const indigenousLessons = lessonPlans.filter(lesson => 
        lesson.indigenousPerspectives && lesson.indigenousPerspectives.length > 0
      );
      console.log(`   Indigenous Perspectives: ${indigenousLessons.length}/${lessonPlans.length} lessons (${Math.round(indigenousLessons.length/lessonPlans.length*100)}%)`);

      // Check for authentic French content
      const frenchContentLessons = lessonPlans.filter(lesson => {
        return lesson.titleFr || lesson.mindsOnFr || lesson.actionFr || lesson.consolidationFr || lesson.learningGoalsFr;
      });
      console.log(`   French Language Content: ${frenchContentLessons.length}/${lessonPlans.length} lessons (${Math.round(frenchContentLessons.length/lessonPlans.length*100)}%)`);

      // Detailed structure analysis
      console.log('\n🔍 DETAILED STRUCTURE ANALYSIS:');
      
      const missingMindsOn = lessonPlans.filter(lesson => !lesson.mindsOn || lesson.mindsOn.trim().length === 0).length;
      const missingAction = lessonPlans.filter(lesson => !lesson.action || lesson.action.trim().length === 0).length;
      const missingConsolidation = lessonPlans.filter(lesson => !lesson.consolidation || lesson.consolidation.trim().length === 0).length;
      const missingLearningGoals = lessonPlans.filter(lesson => !lesson.learningGoals || lesson.learningGoals.trim().length === 0).length;
      
      console.log(`   Missing Minds On: ${missingMindsOn}/${lessonPlans.length} lessons`);
      console.log(`   Missing Action: ${missingAction}/${lessonPlans.length} lessons`);
      console.log(`   Missing Consolidation: ${missingConsolidation}/${lessonPlans.length} lessons`);
      console.log(`   Missing Learning Goals: ${missingLearningGoals}/${lessonPlans.length} lessons`);

      // Check for proper 8/27/10 minute breakdown
      const timing8_27_10 = lessonPlans.filter(lesson => {
        const mindsOnLength = lesson.mindsOn?.length || 0;
        const actionLength = lesson.action?.length || 0;
        const consolidationLength = lesson.consolidation?.length || 0;
        
        // Rough estimate: assume 100 chars = ~1 minute of content
        const mindsOnTime = Math.round(mindsOnLength / 100);
        const actionTime = Math.round(actionLength / 100);
        const consolidationTime = Math.round(consolidationLength / 100);
        
        // Check if it's approximately 8/27/10 distribution
        const total = mindsOnTime + actionTime + consolidationTime;
        if (total === 0) return false;
        
        const mindsOnPercent = (mindsOnTime / total) * 100;
        const actionPercent = (actionTime / total) * 100;
        const consolidationPercent = (consolidationTime / total) * 100;
        
        return mindsOnPercent >= 15 && mindsOnPercent <= 25 && // ~8/45 = 18%
               actionPercent >= 55 && actionPercent <= 65 &&   // ~27/45 = 60%
               consolidationPercent >= 15 && consolidationPercent <= 25; // ~10/45 = 22%
      });
      console.log(`   Proper 8/27/10 Timing Distribution: ${timing8_27_10.length}/${lessonPlans.length} lessons (${Math.round(timing8_27_10.length/lessonPlans.length*100)}%)`);
    }

    console.log('\n✅ Emily\'s Français (Immersion) system query complete!');

  } catch (error) {
    console.error('❌ Error querying Emily\'s French curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

queryEmilyFrenchComplete()
  .then(() => console.log('🎉 Query completed successfully!'))
  .catch((error) => {
    console.error('💥 Query failed:', error);
    process.exit(1);
  });