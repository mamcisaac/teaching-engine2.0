#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyArtsETFOCompliance() {
  console.log('🔍 Verifying Arts visuels ETFO compliance updates...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    // Find all Arts visuels lesson plans for Emily
    const artsLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        subject: 'Arts visuels'
      },
      include: {
        unitPlan: true
      }
    });
    
    console.log(`📊 Verifying ${artsLessons.length} Arts visuels lessons\n`);
    
    let complianceIssues = 0;
    let sampleChecked = 0;
    
    // Check a sample of lessons for compliance
    const sampleSize = Math.min(10, artsLessons.length);
    const sampleLessons = artsLessons.slice(0, sampleSize);
    
    for (const lesson of sampleLessons) {
      sampleChecked++;
      console.log(`\n🎨 Checking Lesson ${sampleChecked}: "${lesson.title}"`);
      console.log(`   Unit: ${lesson.unitPlan?.titleFr || lesson.unitPlan?.title || 'Unknown'}`);
      
      // Check duration
      if (lesson.duration !== 45) {
        console.log(`   ❌ Duration: ${lesson.duration} minutes (should be 45)`);
        complianceIssues++;
      } else {
        console.log(`   ✅ Duration: ${lesson.duration} minutes`);
      }
      
      // Check structure timing
      const hasMindsOnTiming = lesson.mindsOn?.includes('(8 minutes)');
      const hasActionTiming = lesson.action?.includes('(27 minutes)');
      const hasConsolidationTiming = lesson.consolidation?.includes('(10 minutes)');
      
      if (!hasMindsOnTiming) {
        console.log(`   ❌ Minds On timing missing`);
        complianceIssues++;
      } else {
        console.log(`   ✅ Minds On timing: Present`);
      }
      
      if (!hasActionTiming) {
        console.log(`   ❌ Action timing missing`);
        complianceIssues++;
      } else {
        console.log(`   ✅ Action timing: Present`);
      }
      
      if (!hasConsolidationTiming) {
        console.log(`   ❌ Consolidation timing missing`);
        complianceIssues++;
      } else {
        console.log(`   ✅ Consolidation timing: Present`);
      }
      
      // Check differentiation strategies
      const diff = lesson.differentiationStrategies;
      if (!diff || typeof diff !== 'object') {
        console.log(`   ❌ Differentiation strategies: Missing or invalid format`);
        complianceIssues++;
      } else {
        const diffObj = diff as any;
        const hasAllTypes = diffObj.forStruggling && diffObj.forIEP && diffObj.forELL && diffObj.forAdvanced;
        if (!hasAllTypes) {
          console.log(`   ❌ Differentiation strategies: Missing required types`);
          complianceIssues++;
        } else {
          console.log(`   ✅ Differentiation strategies: All 4 types present`);
        }
      }
      
      // Check indigenous perspectives
      if (!lesson.indigenousPerspectives || lesson.indigenousPerspectives.length < 100) {
        console.log(`   ❌ Indigenous perspectives: Missing or too short (${lesson.indigenousPerspectives?.length || 0} chars)`);
        complianceIssues++;
      } else {
        console.log(`   ✅ Indigenous perspectives: ${lesson.indigenousPerspectives.length} chars`);
      }
      
      // Check assessment notes
      if (!lesson.assessmentNotes || !lesson.assessmentNotes.includes('☐')) {
        console.log(`   ❌ Assessment notes: Missing checkboxes`);
        complianceIssues++;
      } else {
        console.log(`   ✅ Assessment notes: Contains checkboxes`);
      }
    }
    
    // Summary
    console.log(`\n📋 VERIFICATION SUMMARY`);
    console.log(`   📊 Total lessons: ${artsLessons.length}`);
    console.log(`   🔍 Sample verified: ${sampleChecked} lessons`);
    console.log(`   ${complianceIssues === 0 ? '✅' : '❌'} Compliance issues found: ${complianceIssues}`);
    
    if (complianceIssues === 0) {
      console.log(`\n🎉 All verified lessons are ETFO-compliant!`);
    } else {
      console.log(`\n⚠️  Found ${complianceIssues} compliance issues in sample verification.`);
    }
    
    // Count by unit
    console.log(`\n📚 Lessons by unit:`);
    const unitCounts = {};
    for (const lesson of artsLessons) {
      const unitTitle = lesson.unitPlan?.titleFr || lesson.unitPlan?.title || 'Unknown Unit';
      unitCounts[unitTitle] = (unitCounts[unitTitle] || 0) + 1;
    }
    
    for (const [unit, count] of Object.entries(unitCounts)) {
      console.log(`   🎨 ${unit}: ${count} lessons`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying Arts visuels lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyArtsETFOCompliance()
  .then(() => console.log('\n✅ Verification complete!'))
  .catch((error) => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });