#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detailedIssuesAnalysis() {
  console.log('🔍 DETAILED ISSUES ANALYSIS: Emily\'s Français (Immersion) System...\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    // Get Long Range Plan Details
    const lrp = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily!.id,
        subject: 'Français (Immersion)'
      }
    });

    console.log('=' .repeat(80));
    console.log('📋 LONG RANGE PLAN DETAILED ANALYSIS');
    console.log('=' .repeat(80));
    
    console.log(`Title: "${lrp!.title}"`);
    console.log(`Description (${lrp!.description?.length || 0} chars):`);
    console.log(`"${lrp!.description || 'MISSING'}"`);
    console.log(`\nGoals (${lrp!.goals?.length || 0} chars):`);
    console.log(`"${lrp!.goals || 'MISSING'}"`);
    console.log(`\nAssessment Overview (${lrp!.assessmentOverview?.length || 0} chars):`);
    console.log(`"${lrp!.assessmentOverview || 'MISSING'}"`);

    // Check for key elements in LRP
    const lrpContent = `${lrp!.description || ''} ${lrp!.goals || ''} ${lrp!.assessmentOverview || ''}`.toLowerCase();
    console.log('\n🔍 LRP CONTENT ANALYSIS:');
    console.log(`   Contains "oral": ${lrpContent.includes('oral')}`);
    console.log(`   Contains "speaking": ${lrpContent.includes('speaking')}`);
    console.log(`   Contains "listening": ${lrpContent.includes('listening')}`);
    console.log(`   Contains "parler": ${lrpContent.includes('parler')}`);
    console.log(`   Contains "écouter": ${lrpContent.includes('écouter')}`);
    console.log(`   Contains "francophone": ${lrpContent.includes('francophone')}`);
    console.log(`   Contains "culture": ${lrpContent.includes('culture')}`);
    console.log(`   Contains "indigenous": ${lrpContent.includes('indigenous')}`);

    // Get Unit Plans with detailed content
    const unitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily!.id,
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log('\n' + '=' .repeat(80));
    console.log('📚 UNIT PLANS DETAILED ANALYSIS');
    console.log('=' .repeat(80));

    for (let i = 0; i < unitPlans.length; i++) {
      const unit = unitPlans[i];
      console.log(`\n${i + 1}. UNIT: "${unit.title}"`);
      console.log(`   Period: ${unit.startDate.toDateString()} to ${unit.endDate.toDateString()}`);
      console.log(`   Duration: ${Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))} weeks`);
      
      console.log(`\n   DESCRIPTION (${unit.description?.length || 0} chars):`);
      console.log(`   "${unit.description || 'MISSING'}"`);
      
      console.log(`\n   BIG IDEAS (${unit.bigIdeas?.length || 0} chars):`);
      console.log(`   "${unit.bigIdeas || 'MISSING'}"`);
      
      console.log(`\n   ASSESSMENT PLAN (${unit.assessmentPlan?.length || 0} chars):`);
      console.log(`   "${unit.assessmentPlan || 'MISSING'}"`);
      
      console.log(`\n   DIFFERENTIATION STRATEGIES:`);
      if (unit.differentiationStrategies) {
        console.log(`   ${JSON.stringify(unit.differentiationStrategies, null, 2)}`);
      } else {
        console.log(`   MISSING`);
      }
      
      console.log(`\n   INDIGENOUS PERSPECTIVES (${unit.indigenousPerspectives?.length || 0} chars):`);
      console.log(`   "${unit.indigenousPerspectives || 'MISSING'}"`);

      // Analyze unit content for French immersion elements
      const unitContent = `${unit.description || ''} ${unit.bigIdeas || ''}`.toLowerCase();
      console.log(`\n   🔍 UNIT CONTENT ANALYSIS:`);
      console.log(`      Contains "français": ${unitContent.includes('français')}`);
      console.log(`      Contains "francophone": ${unitContent.includes('francophone')}`);
      console.log(`      Contains "culture": ${unitContent.includes('culture')}`);
      console.log(`      Contains "tradition": ${unitContent.includes('tradition')}`);
      console.log(`      Contains "oral": ${unitContent.includes('oral')}`);
      console.log(`      Contains "parler": ${unitContent.includes('parler')}`);
      console.log(`      Contains "écouter": ${unitContent.includes('écouter')}`);
      
      console.log('\n   ' + '-'.repeat(60));
    }

    // Get sample lessons for detailed ETFO analysis
    const sampleLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily!.id,
        subject: 'Français (Immersion)'
      },
      take: 5,
      orderBy: { date: 'asc' }
    });

    console.log('\n' + '=' .repeat(80));
    console.log('📝 SAMPLE LESSONS DETAILED ANALYSIS');
    console.log('=' .repeat(80));

    for (let i = 0; i < sampleLessons.length; i++) {
      const lesson = sampleLessons[i];
      console.log(`\n${i + 1}. LESSON: "${lesson.title}"`);
      console.log(`   Date: ${lesson.date.toDateString()}, Duration: ${lesson.duration} minutes`);
      
      console.log(`\n   LEARNING GOALS:`);
      console.log(`   "${lesson.learningGoals || 'MISSING'}"`);
      
      console.log(`\n   MINDS ON (${lesson.mindsOn?.length || 0} chars):`);
      console.log(`   "${lesson.mindsOn || 'MISSING'}"`);
      
      console.log(`\n   ACTION (${lesson.action?.length || 0} chars):`);
      console.log(`   "${lesson.action || 'MISSING'}"`);
      
      console.log(`\n   CONSOLIDATION (${lesson.consolidation?.length || 0} chars):`);
      console.log(`   "${lesson.consolidation || 'MISSING'}"`);

      // Check for oral language content
      const lessonContent = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
      console.log(`\n   🔍 ORAL LANGUAGE ANALYSIS:`);
      console.log(`      Contains "oral": ${lessonContent.includes('oral')}`);
      console.log(`      Contains "speaking": ${lessonContent.includes('speaking')}`);
      console.log(`      Contains "listening": ${lessonContent.includes('listening')}`);
      console.log(`      Contains "conversation": ${lessonContent.includes('conversation')}`);
      console.log(`      Contains "discussion": ${lessonContent.includes('discussion')}`);
      console.log(`      Contains "parler": ${lessonContent.includes('parler')}`);
      console.log(`      Contains "écouter": ${lessonContent.includes('écouter')}`);
      console.log(`      Contains "discuter": ${lessonContent.includes('discuter')}`);

      // Check timing distribution (rough estimate)
      const mindsOnLength = lesson.mindsOn?.length || 0;
      const actionLength = lesson.action?.length || 0;
      const consolidationLength = lesson.consolidation?.length || 0;
      const totalLength = mindsOnLength + actionLength + consolidationLength;
      
      if (totalLength > 0) {
        const mindsOnPercent = Math.round((mindsOnLength / totalLength) * 100);
        const actionPercent = Math.round((actionLength / totalLength) * 100);
        const consolidationPercent = Math.round((consolidationLength / totalLength) * 100);
        
        console.log(`\n   📊 TIMING DISTRIBUTION (by content length):`);
        console.log(`      Minds On: ${mindsOnPercent}% (target: ~18%)`);
        console.log(`      Action: ${actionPercent}% (target: ~60%)`);
        console.log(`      Consolidation: ${consolidationPercent}% (target: ~22%)`);
        
        const has8_27_10 = mindsOnPercent >= 15 && mindsOnPercent <= 25 && 
                          actionPercent >= 55 && actionPercent <= 65 && 
                          consolidationPercent >= 15 && consolidationPercent <= 25;
        console.log(`      Follows 8/27/10 pattern: ${has8_27_10 ? '✅' : '❌'}`);
      }

      console.log(`\n   FRENCH CONTENT:`);
      console.log(`      Title Fr: "${lesson.titleFr || 'MISSING'}"`);
      console.log(`      Minds On Fr: "${lesson.mindsOnFr || 'MISSING'}"`);
      console.log(`      Action Fr: "${lesson.actionFr || 'MISSING'}"`);
      console.log(`      Consolidation Fr: "${lesson.consolidationFr || 'MISSING'}"`);

      console.log(`\n   DIFFERENTIATION:`);
      console.log(`      Strategies: ${lesson.differentiationStrategies ? JSON.stringify(lesson.differentiationStrategies) : 'MISSING'}`);
      console.log(`      Accommodations: ${lesson.accommodations ? JSON.stringify(lesson.accommodations) : 'MISSING'}`);
      console.log(`      Modifications: ${lesson.modifications ? JSON.stringify(lesson.modifications) : 'MISSING'}`);
      console.log(`      Extensions: ${lesson.extensions ? JSON.stringify(lesson.extensions) : 'MISSING'}`);

      console.log(`\n   ASSESSMENT:`);
      console.log(`      Type: "${lesson.assessmentType || 'MISSING'}"`);
      console.log(`      Notes: "${lesson.assessmentNotes || 'MISSING'}"`);
      console.log(`      Formative Checkpoints: ${lesson.formativeCheckpoints ? JSON.stringify(lesson.formativeCheckpoints) : 'MISSING'}`);

      console.log(`\n   INDIGENOUS PERSPECTIVES:`);
      console.log(`   "${lesson.indigenousPerspectives || 'MISSING'}"`);
      
      console.log('\n   ' + '-'.repeat(60));
    }

    // Analyze oral language distribution across months
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily!.id,
        subject: 'Français (Immersion)'
      },
      orderBy: { date: 'asc' }
    });

    console.log('\n' + '=' .repeat(80));
    console.log('📊 ORAL LANGUAGE DISTRIBUTION BY MONTH');
    console.log('=' .repeat(80));

    const lessonsByMonth = allLessons.reduce((acc, lesson) => {
      const month = lesson.date.toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(lesson);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(lessonsByMonth).forEach(([month, lessons]) => {
      const oralLessons = lessons.filter(lesson => {
        const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
        return content.includes('oral') || content.includes('speaking') || content.includes('listening') ||
               content.includes('conversation') || content.includes('discussion') || content.includes('parler') ||
               content.includes('écouter') || content.includes('discuter');
      });
      
      const percentage = Math.round((oralLessons.length / lessons.length) * 100);
      console.log(`   ${month}: ${oralLessons.length}/${lessons.length} lessons (${percentage}%) oral focus`);
    });

    console.log('\n✅ Detailed issues analysis complete!');

  } catch (error) {
    console.error('❌ Error in detailed analysis:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

detailedIssuesAnalysis()
  .then(() => console.log('🎉 Detailed analysis completed successfully!'))
  .catch((error) => {
    console.error('💥 Detailed analysis failed:', error);
    process.exit(1);
  });