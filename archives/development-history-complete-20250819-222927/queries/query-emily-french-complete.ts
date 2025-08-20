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
        subject: 'Français (Immersion)'
      }
    });

    console.log('📋 LONG RANGE PLAN:');
    if (lrp) {
      console.log(`✅ Found LRP: "${lrp.title}"`);
      console.log(`   Grade: ${lrp.grade}, Duration: ${lrp.duration}`);
      console.log(`   Overview length: ${lrp.overview?.length || 0} chars`);
      console.log(`   Goals count: ${lrp.yearlyGoals?.split('\n').length || 0}`);
    } else {
      console.log('❌ No Français Long Range Plan found');
    }

    // Get Unit Plans for Français (Immersion)
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`\n📚 UNIT PLANS (${unitPlans.length} total):`);
    if (unitPlans.length === 0) {
      console.log('❌ No Français Unit Plans found');
    } else {
      unitPlans.forEach((unit, index) => {
        console.log(`${index + 1}. "${unit.title}"`);
        console.log(`   Period: ${unit.startDate} to ${unit.endDate}`);
        console.log(`   Duration: ${unit.duration}, Timing: ${unit.timing}`);
        console.log(`   Learning Goals: ${unit.learningGoals?.split('\n').length || 0} items`);
        console.log(`   Success Criteria: ${unit.successCriteria?.split('\n').length || 0} items`);
        console.log(`   Assessment: ${unit.assessment?.length || 0} chars`);
        console.log(`   Differentiation: ${unit.differentiation?.length || 0} chars`);
        console.log('');
      });
    }

    // Get Lesson Plans for Français (Immersion)
    const lessonPlans = await prisma.lessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      },
      orderBy: { lessonDate: 'asc' }
    });

    console.log(`📝 LESSON PLANS (${lessonPlans.length} total):`);
    if (lessonPlans.length === 0) {
      console.log('❌ No Français Lesson Plans found');
    } else {
      console.log('✅ Lesson Plans by Month:');
      
      const lessonsByMonth = lessonPlans.reduce((acc, lesson) => {
        const month = lesson.lessonDate?.toISOString().substring(0, 7) || 'unknown';
        if (!acc[month]) acc[month] = [];
        acc[month].push(lesson);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(lessonsByMonth).forEach(([month, lessons]) => {
        console.log(`   ${month}: ${lessons.length} lessons`);
        
        // Check ETFO compliance for sample lessons
        const sampleLesson = lessons[0];
        if (sampleLesson) {
          const hasMindsOn = sampleLesson.activitiesContent?.includes('Minds On') || sampleLesson.activitiesContent?.includes('minds on');
          const hasAction = sampleLesson.activitiesContent?.includes('Action') || sampleLesson.activitiesContent?.includes('action');
          const hasConsolidation = sampleLesson.activitiesContent?.includes('Consolidation') || sampleLesson.activitiesContent?.includes('consolidation');
          const hasProperTiming = sampleLesson.timing === '45 minutes';
          
          console.log(`      Sample: "${sampleLesson.title}"`);
          console.log(`      ETFO Structure: Minds On(${hasMindsOn}), Action(${hasAction}), Consolidation(${hasConsolidation})`);
          console.log(`      Timing: ${sampleLesson.timing} (45min target: ${hasProperTiming})`);
        }
      });

      // Analysis by key criteria
      console.log('\n🔍 CRITICAL ANALYSIS:');
      
      // Check for oral language emphasis
      const oralLanguageLessons = lessonPlans.filter(lesson => 
        lesson.activitiesContent?.toLowerCase().includes('oral') ||
        lesson.activitiesContent?.toLowerCase().includes('speaking') ||
        lesson.activitiesContent?.toLowerCase().includes('listening') ||
        lesson.activitiesContent?.toLowerCase().includes('conversation') ||
        lesson.activitiesContent?.toLowerCase().includes('discussion')
      );
      console.log(`   Oral Language Focus: ${oralLanguageLessons.length}/${lessonPlans.length} lessons (${Math.round(oralLanguageLessons.length/lessonPlans.length*100)}%)`);

      // Check for reading readiness
      const readingLessons = lessonPlans.filter(lesson => 
        lesson.activitiesContent?.toLowerCase().includes('reading') ||
        lesson.activitiesContent?.toLowerCase().includes('phonics') ||
        lesson.activitiesContent?.toLowerCase().includes('letters') ||
        lesson.activitiesContent?.toLowerCase().includes('sounds') ||
        lesson.activitiesContent?.toLowerCase().includes('decode')
      );
      console.log(`   Reading Readiness: ${readingLessons.length}/${lessonPlans.length} lessons (${Math.round(readingLessons.length/lessonPlans.length*100)}%)`);

      // Check for early writing
      const writingLessons = lessonPlans.filter(lesson => 
        lesson.activitiesContent?.toLowerCase().includes('writing') ||
        lesson.activitiesContent?.toLowerCase().includes('journal') ||
        lesson.activitiesContent?.toLowerCase().includes('letters') ||
        lesson.activitiesContent?.toLowerCase().includes('drawing')
      );
      console.log(`   Early Writing: ${writingLessons.length}/${lessonPlans.length} lessons (${Math.round(writingLessons.length/lessonPlans.length*100)}%)`);

      // Check for ETFO structure compliance
      const etfoCompliantLessons = lessonPlans.filter(lesson => {
        const content = lesson.activitiesContent?.toLowerCase() || '';
        return content.includes('minds on') && content.includes('action') && content.includes('consolidation');
      });
      console.log(`   ETFO Structure Compliance: ${etfoCompliantLessons.length}/${lessonPlans.length} lessons (${Math.round(etfoCompliantLessons.length/lessonPlans.length*100)}%)`);

      // Check for differentiation
      const differentiatedLessons = lessonPlans.filter(lesson => 
        lesson.differentiationStrategies?.length > 0 ||
        lesson.activitiesContent?.toLowerCase().includes('differentiation') ||
        lesson.activitiesContent?.toLowerCase().includes('support') ||
        lesson.activitiesContent?.toLowerCase().includes('challenge')
      );
      console.log(`   Differentiation Present: ${differentiatedLessons.length}/${lessonPlans.length} lessons (${Math.round(differentiatedLessons.length/lessonPlans.length*100)}%)`);

      // Check for assessment
      const assessmentLessons = lessonPlans.filter(lesson => 
        lesson.assessmentStrategies?.length > 0 ||
        lesson.activitiesContent?.toLowerCase().includes('assessment') ||
        lesson.activitiesContent?.toLowerCase().includes('observation') ||
        lesson.activitiesContent?.toLowerCase().includes('evaluation')
      );
      console.log(`   Assessment Strategies: ${assessmentLessons.length}/${lessonPlans.length} lessons (${Math.round(assessmentLessons.length/lessonPlans.length*100)}%)`);
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