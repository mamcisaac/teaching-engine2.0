#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMathProgress() {
  console.log('🔍 Checking Math system progress by Agents 33-40...\n');
  
  try {
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily not found');
      return;
    }

    // Get Math Long Range Plan
    const mathLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: { contains: 'Math' }
      }
    });

    if (!mathLRP) {
      console.log('❌ No Math Long Range Plan found');
      return;
    }

    console.log(`✅ Found Math LRP: "${mathLRP.title}"`);
    console.log(`Last Updated: ${mathLRP.updatedAt?.toISOString()}\n`);

    // Get all Math Unit Plans
    const mathUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: mathLRP.id,
        userId: emily.id
      },
      orderBy: { startDate: 'asc' },
      include: {
        lessonPlans: {
          orderBy: { date: 'asc' }
        }
      }
    });

    console.log(`📚 Found ${mathUnits.length} Math Unit Plans:\n`);
    
    let totalLessons = 0;
    let recentlyUpdatedUnits = 0;
    let recentlyUpdatedLessons = 0;
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    mathUnits.forEach((unit, index) => {
      const unitRecent = unit.updatedAt && unit.updatedAt > tenMinutesAgo;
      const lessonCount = unit.lessonPlans.length;
      totalLessons += lessonCount;
      
      if (unitRecent) recentlyUpdatedUnits++;
      
      const recentLessonsCount = unit.lessonPlans.filter(
        lesson => lesson.updatedAt && lesson.updatedAt > tenMinutesAgo
      ).length;
      recentlyUpdatedLessons += recentLessonsCount;
      
      console.log(`${index + 1}. "${unit.title}"`);
      console.log(`   Period: ${unit.startDate?.toISOString().split('T')[0]} to ${unit.endDate?.toISOString().split('T')[0]}`);
      console.log(`   Lessons: ${lessonCount}`);
      console.log(`   Updated: ${unit.updatedAt?.toISOString()}`);
      console.log(`   Recently Updated: ${unitRecent ? '✅' : '❌'}`);
      console.log(`   Recent Lessons: ${recentLessonsCount}/${lessonCount}`);
      console.log('');
    });

    console.log('📊 SUMMARY:');
    console.log(`Total Math Units: ${mathUnits.length}`);
    console.log(`Total Math Lessons: ${totalLessons}`);
    console.log(`Recently Updated Units: ${recentlyUpdatedUnits}/${mathUnits.length}`);
    console.log(`Recently Updated Lessons: ${recentlyUpdatedLessons}/${totalLessons}`);

    const completion = recentlyUpdatedUnits === mathUnits.length && recentlyUpdatedLessons === totalLessons;
    
    if (completion) {
      console.log('\n🎯 AGENTS 33-40 STATUS: ✅ WORK COMPLETED');
      console.log('Math system appears to have been perfected!');
    } else {
      console.log('\n⏳ AGENTS 33-40 STATUS: ⏳ WORK IN PROGRESS');
      console.log('Math system perfection still in progress...');
    }

  } catch (error) {
    console.error('❌ Error checking Math progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMathProgress()
  .then(() => console.log('\n✅ Math progress check completed'))
  .catch(error => {
    console.error('❌ Math progress check failed:', error);
    process.exit(1);
  });