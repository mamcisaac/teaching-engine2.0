#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyGrowingChangingSafety() {
  console.log('🔍 Verifying Growing and Changing unit safety updates...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Get the Growing and Changing unit plan
    const growthUnit = await prisma.unitPlan.findFirst({
      where: {
        userId: emily.id,
        titleFr: 'Grandir et changer'
      }
    });
    
    if (!growthUnit) {
      throw new Error('Growing and Changing unit plan not found.');
    }
    
    console.log(`✅ Found unit plan: ${growthUnit.titleFr} (ID: ${growthUnit.id})\n`);
    
    // Get all lesson plans for this unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: growthUnit.id
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    console.log(`📚 Verifying safety content in ${lessons.length} lessons\n`);
    
    let verifiedCount = 0;
    let missingCount = 0;
    
    const safetyKeywords = [
      '⚠️ ALLERGY CHECK',
      '✅ HANDWASHING',
      '✅ SOIL SAFETY',
      'grandir (grow)',
      'Draw and label plant growth stages',
      '☐ Follows plant handling safety'
    ];
    
    // Verify each lesson has safety content
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const lessonNum = i + 1;
      
      console.log(`🔍 Lesson ${lessonNum}/24: ${lesson.title || lesson.titleFr || 'Untitled'}`);
      
      let hasAllSafety = true;
      const missingKeywords: string[] = [];
      
      const content = (lesson.action || '') + (lesson.actionFr || '') + (lesson.assessmentNotes || '');
      
      for (const keyword of safetyKeywords) {
        if (!content.includes(keyword)) {
          hasAllSafety = false;
          missingKeywords.push(keyword);
        }
      }
      
      if (hasAllSafety) {
        verifiedCount++;
        console.log(`  ✅ All safety protocols present`);
      } else {
        missingCount++;
        console.log(`  ❌ Missing: ${missingKeywords.join(', ')}`);
      }
      
      // Show sample content for first lesson
      if (i === 0) {
        console.log(`\n📋 SAMPLE CONTENT - Lesson 1 (${lesson.title}):`)
        console.log('='.repeat(80));
        console.log(lesson.action?.substring(0, 500) + '...');
        console.log('='.repeat(80));
        console.log(`Assessment Notes: ${lesson.assessmentNotes?.substring(0, 200) + '...'}`);
        console.log('='.repeat(80) + '\n');
      }
    }
    
    console.log(`\n🎯 VERIFICATION SUMMARY:`);
    console.log(`✅ Lessons with complete safety protocols: ${verifiedCount}`);
    console.log(`❌ Lessons missing safety content: ${missingCount}`);
    console.log(`📊 Total lessons verified: ${lessons.length}`);
    
    if (verifiedCount === 24) {
      console.log('\n🏆 PERFECT! All 24 Growing and Changing lessons have complete safety protocols!');
      console.log('\n📋 Each lesson now includes:');
      console.log('  ⚠️ Allergy warning: "Verify student allergies before plant/soil activities"');
      console.log('  ✅ Handwashing protocol: "Mandatory after handling plants and soil"');
      console.log('  ✅ Soil safety: "No ingestion, use tools not hands when possible"');
      console.log('  🇫🇷 French vocabulary: "grandir (grow), la plante (plant), la terre (soil)"');
      console.log('  📝 Science journal prompt: "Draw and label plant growth stages"');
      console.log('  📋 Assessment criteria: "Follows plant handling safety ☐ Washes hands properly"');
      console.log('\n🌱 Emily McIsaac can now safely conduct all plant/soil activities in Science Unit 5!');
    } else {
      console.log(`\n⚠️ ${missingCount} lessons still need safety protocol updates.`);
    }
    
    return { lessons, verifiedCount, missingCount };
    
  } catch (error) {
    console.error('❌ Error verifying safety updates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyGrowingChangingSafety()
  .then(() => console.log('\n🔍 Verification completed!'))
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });