#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SafetyUpdate {
  allergy_warning: string;
  handwashing_protocol: string;
  soil_safety: string;
  french_vocabulary: string;
  science_journal_prompt: string;
  assessment_criteria: string;
}

const safetyContent: SafetyUpdate = {
  allergy_warning: "⚠️ ALLERGY CHECK: Verify student allergies before plant/soil activities",
  handwashing_protocol: "✅ HANDWASHING: Mandatory after handling plants and soil",
  soil_safety: "✅ SOIL SAFETY: No ingestion, use tools not hands when possible",
  french_vocabulary: "grandir (grow), la plante (plant), la terre (soil)",
  science_journal_prompt: "Draw and label plant growth stages",
  assessment_criteria: "☐ Follows plant handling safety ☐ Washes hands properly"
};

async function updateGrowingChangingLessons() {
  console.log('🌱 Updating Growing and Changing unit lessons with safety protocols...\n');
  
  try {
    // Get Emily's user account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily\'s user account not found.');
    }
    
    console.log(`✅ Found Emily's account (ID: ${emily.id})`);
    
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
    
    console.log(`📚 Found ${lessons.length} lessons to update\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Update each lesson with safety protocols
    for (const lesson of lessons) {
      try {
        console.log(`🔧 Updating lesson ${updatedCount + 1}/24: ${lesson.title || lesson.titleFr || 'Untitled'}`);
        
        // Prepare the updated content with safety protocols
        const updatedAction = addSafetyToAction(lesson.action || '');
        const updatedActionFr = addSafetyToAction(lesson.actionFr || '');
        const updatedAssessmentNotes = addSafetyToAssessment(lesson.assessmentNotes || '');
        
        // Update the lesson
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            action: updatedAction,
            actionFr: updatedActionFr,
            assessmentNotes: updatedAssessmentNotes,
            updatedAt: new Date()
          }
        });
        
        updatedCount++;
        console.log(`  ✅ Updated successfully`);
        
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error updating lesson: ${error}`);
      }
    }
    
    console.log(`\n🎉 Update Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} lessons`);
    console.log(`❌ Failed to update: ${errorCount} lessons`);
    console.log(`📊 Total lessons: ${lessons.length}`);
    
    if (updatedCount === 24) {
      console.log('\n🏆 MISSION ACCOMPLISHED! All 24 Growing and Changing lessons now include:');
      console.log('  ⚠️ Allergy warnings');
      console.log('  ✅ Handwashing protocols');
      console.log('  ✅ Soil safety guidelines');
      console.log('  🇫🇷 French vocabulary');
      console.log('  📝 Science journal prompts');
      console.log('  📋 Assessment criteria');
    }
    
    return { emily, growthUnit, lessons, updatedCount, errorCount };
    
  } catch (error) {
    console.error('❌ Error updating lessons:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function addSafetyToAction(originalAction: string): string {
  const safetyIntro = `
🛡️ SAFETY PROTOCOLS (À OBSERVER EN TOUT TEMPS):

${safetyContent.allergy_warning}
${safetyContent.handwashing_protocol}
${safetyContent.soil_safety}

🇫🇷 VOCABULAIRE: ${safetyContent.french_vocabulary}

📝 JOURNAL SCIENTIFIQUE: ${safetyContent.science_journal_prompt}

---

`;
  
  return safetyIntro + originalAction;
}

function addSafetyToAssessment(originalAssessment: string): string {
  const safetyAssessment = `
SAFETY ASSESSMENT CRITERIA:
${safetyContent.assessment_criteria}

ORIGINAL ASSESSMENT:
`;
  
  return safetyAssessment + originalAssessment;
}

// Run the update
updateGrowingChangingLessons()
  .then(() => console.log('\n🌟 Safety update completed successfully!'))
  .catch((error) => {
    console.error('💥 Safety update failed:', error);
    process.exit(1);
  });