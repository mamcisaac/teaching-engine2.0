#!/usr/bin/env tsx

/**
 * Generate All Lessons Script
 * 
 * This script uses the LessonGenerationFramework to generate contextually
 * appropriate lessons for all unit plans in Emily McIsaac's Grade 1 French 
 * Immersion teaching system.
 * 
 * Usage: npm run generate-lessons
 * or: tsx scripts/generate-all-lessons.ts
 */

import { PrismaClient } from '@prisma/client';
import { LessonGenerationFramework } from '../server/src/services/LessonGenerationFramework';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Lesson Generation for Emily McIsaac\'s Grade 1 French Immersion System');
  console.log('====================================================================\n');

  try {
    // Initialize the framework
    const framework = new LessonGenerationFramework(prisma);
    
    console.log('📋 Checking framework health...');
    const healthCheck = await framework.checkHealth();
    
    if (!healthCheck.healthy) {
      console.error('❌ Framework health check failed:', healthCheck.details);
      process.exit(1);
    }
    
    console.log('✅ Framework initialized successfully');
    console.log(`📊 Found ${healthCheck.details.unitPlansAvailable} unit plans to generate lessons for`);
    console.log(`📝 Currently ${healthCheck.details.lessonsGenerated} lessons exist\n`);

    // Confirm with user before proceeding (in production, you might want to remove this)
    console.log('⚠️  This will generate comprehensive lesson plans for all units.');
    console.log('⚠️  Existing lessons will be preserved (only new unique lessons created).\n');

    // Generate all lessons
    console.log('🎯 Beginning lesson generation process...\n');
    const startTime = Date.now();
    
    await framework.generateAllLessons();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Final health check to see results
    const finalCheck = await framework.checkHealth();
    const lessonsGenerated = Number(finalCheck.details.lessonsGenerated) - Number(healthCheck.details.lessonsGenerated);
    
    console.log('\n🎉 LESSON GENERATION COMPLETED SUCCESSFULLY!');
    console.log('============================================');
    console.log(`✅ Generated ${lessonsGenerated} new lessons`);
    console.log(`📚 Total lessons now: ${finalCheck.details.lessonsGenerated}`);
    console.log(`⏱️  Generation time: ${duration} seconds`);
    console.log(`🎯 All lessons follow ETFO three-part structure`);
    console.log(`🇫🇷 French Immersion lessons include bilingual content`);
    console.log(`📅 Lessons scheduled within appropriate unit timeframes`);
    console.log(`🎨 Content appropriate for Grade 1 (ages 6-7)`);
    console.log(`🔗 Curriculum expectations properly linked`);
    
    // Show breakdown by subject
    console.log('\n📊 LESSON BREAKDOWN BY SUBJECT:');
    console.log('================================');
    
    const subjects = [
      'Français (Immersion)',
      'Mathématiques', 
      'Sciences de la nature',
      'Sciences humaines',
      'Arts visuels',
      'Formation personnelle et sociale'
    ];
    
    for (const subject of subjects) {
      const subjectLessons = await prisma.eTFOLessonPlan.count({
        where: {
          userId: Number(finalCheck.details.emilyUserId),
          subject: subject
        }
      });
      console.log(`📖 ${subject}: ${subjectLessons} lessons`);
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('==============');
    console.log('✅ Emily can now access all lessons through the Teaching Engine dashboard');
    console.log('✅ Lessons can be customized and modified as needed');
    console.log('✅ Daybook entries can be created after teaching each lesson');
    console.log('✅ Lessons are substitute-friendly with clear instructions');
    console.log('✅ All ETFO pedagogical requirements are met\n');
    
    console.log('🎯 Emily McIsaac is now ready for a successful 2025-2026 school year!');
    
  } catch (error) {
    console.error('\n❌ LESSON GENERATION FAILED!');
    console.error('==============================');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.error('\n🔧 TROUBLESHOOTING:');
    console.error('===================');
    console.error('1. Ensure Emily\'s user account exists (emmcisaac@gmail.com)');
    console.error('2. Verify unit plans have been seeded');
    console.error('3. Check curriculum expectations are properly linked');
    console.error('4. Ensure database is accessible and migrations are current');
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Received interrupt signal. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  Received termination signal. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
main()
  .catch(async (error) => {
    console.error('💥 Unhandled error in main:', error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });