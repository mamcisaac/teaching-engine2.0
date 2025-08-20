#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyFrenchUnits9to12() {
  console.log('🔍 Querying Emily McIsaac\'s Français (Immersion) Units 9-12 for Perfection...\n');
  
  try {
    // Find Emily's user ID (should be 23)
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);

    // Get ALL Unit Plans for Français (Immersion) to identify Units 9-12
    const allUnitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      },
      include: {
        longRangePlan: {
          select: {
            id: true,
            title: true,
            subject: true,
            grade: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            title: true,
            date: true,
            duration: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    console.log(`📚 ALL FRENCH UNITS (${allUnitPlans.length} total):`);
    
    allUnitPlans.forEach((unit, index) => {
      const unitNumber = index + 1;
      console.log(`\n${unitNumber}. "${unit.title}"`);
      console.log(`   ID: ${unit.id}`);
      console.log(`   Period: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`   Lessons: ${unit.lessonPlans.length}`);
      console.log(`   Description length: ${unit.description?.length || 0} chars`);
    });

    // Identify Units 9-12 (should be units with indices 8-11 in chronological order)
    const units9to12 = allUnitPlans.slice(8, 12); // Units 9-12 (0-indexed)

    console.log(`\n🎯 TARGET UNITS 9-12 FOR PERFECTION:`);
    
    if (units9to12.length === 0) {
      console.log('❌ Units 9-12 not found! Expected 4 units starting from index 8.');
      return;
    }

    units9to12.forEach((unit, index) => {
      const unitNumber = index + 9; // Units 9, 10, 11, 12
      console.log(`\n📋 UNIT ${unitNumber}: "${unit.title}"`);
      console.log(`   ID: ${unit.id}`);
      console.log(`   Period: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
      console.log(`   Lessons: ${unit.lessonPlans.length}`);
      
      // Current State Assessment
      console.log(`\n   📊 CURRENT STATE:`);
      console.log(`   Description: ${unit.description?.length || 0} chars`);
      console.log(`   Big Ideas: ${unit.bigIdeas?.length || 0} chars`);
      
      const essentialQuestions = Array.isArray(unit.essentialQuestions) ? unit.essentialQuestions : [];
      console.log(`   Essential Questions: ${essentialQuestions.length} questions`);
      
      const keyVocabulary = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : [];
      console.log(`   Key Vocabulary: ${keyVocabulary.length} terms`);
      
      const diffStrategies = Array.isArray(unit.differentiationStrategies) ? unit.differentiationStrategies : [];
      console.log(`   Differentiation Strategies: ${diffStrategies.length} strategies`);
      
      console.log(`   Culminating Task: ${unit.culminatingTask?.length || 0} chars`);
      console.log(`   Assessment Plan: ${unit.assessmentPlan?.length || 0} chars`);
      console.log(`   Parent Communication: ${unit.parentCommunication?.length || 0} chars`);
      console.log(`   Community Connections: ${unit.communityConnections?.length || 0} chars`);
      console.log(`   Indigenous Perspectives: ${unit.indigenousPerspectives?.length || 0} chars`);
      console.log(`   Curriculum Expectations: ${unit.expectations.length} expectations`);

      // ETFO Compliance Check
      let complianceScore = 0;
      const checks = [
        { name: 'Big Ideas', current: unit.bigIdeas?.length || 0, required: 100, weight: 10 },
        { name: 'Essential Questions', current: essentialQuestions.length, required: 2, weight: 10 },
        { name: 'Key Vocabulary', current: keyVocabulary.length, required: 15, weight: 10 },
        { name: 'Differentiation', current: diffStrategies.length, required: 4, weight: 10 },
        { name: 'Culminating Task', current: unit.culminatingTask?.length || 0, required: 150, weight: 15 },
        { name: 'Assessment Plan', current: unit.assessmentPlan?.length || 0, required: 200, weight: 15 },
        { name: 'Parent Communication', current: unit.parentCommunication?.length || 0, required: 100, weight: 10 },
        { name: 'Community Connections', current: unit.communityConnections?.length || 0, required: 100, weight: 10 },
        { name: 'Indigenous Perspectives', current: unit.indigenousPerspectives?.length || 0, required: 100, weight: 10 }
      ];

      console.log(`\n   🎯 ETFO COMPLIANCE CHECK:`);
      checks.forEach(check => {
        const meets = check.name === 'Essential Questions' || check.name === 'Key Vocabulary' || check.name === 'Differentiation' 
          ? check.current >= check.required 
          : check.current >= check.required;
        if (meets) complianceScore += check.weight;
        console.log(`   ${meets ? '✅' : '❌'} ${check.name}: ${check.current} (Required: ${check.required})`);
      });

      console.log(`\n   📈 ETFO Compliance Score: ${complianceScore}%`);
      console.log(`   🚀 Needs Perfection: ${complianceScore < 100 ? 'YES' : 'NO'}`);
    });

    // Return data for perfection scripts
    return {
      emily,
      units9to12,
      allUnitCount: allUnitPlans.length
    };

  } catch (error) {
    console.error('❌ Error querying Emily\'s French Units 9-12:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in perfection scripts
export { queryEmilyFrenchUnits9to12 };

// Run if called directly
if (require.main === module) {
  queryEmilyFrenchUnits9to12()
    .then((result) => {
      console.log('\n🎉 Query completed successfully!');
      if (result) {
        console.log(`\n📋 Found ${result.units9to12.length} units ready for ETFO perfection.`);
        console.log('🚀 Ready to create perfection scripts for Units 9-12.');
      }
    })
    .catch((error) => {
      console.error('💥 Query failed:', error);
      process.exit(1);
    });
}