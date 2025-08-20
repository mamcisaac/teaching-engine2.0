#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUnits9to12Completion() {
  console.log('🔍 FINAL VERIFICATION: Emily\'s French Units 9-12 ETFO Compliance...\n');
  
  try {
    // Unit IDs for Units 9-12
    const unitIds = [
      { id: 'cmeh61upp000hvjjpf5lq0lo6', number: 9, title: 'Nouvelle année' },
      { id: 'cmeh61upq000jvjjp1w8j21mj', number: 10, title: 'L\'hiver magique' },
      { id: 'cmeh61upr000lvjjpcjwh05pz', number: 11, title: 'L\'amitié' },
      { id: 'cmeh61upr000nvjjpn8ny2q04', number: 12, title: 'Les animaux d\'hiver' }
    ];

    const verificationResults = [];

    for (const unit of unitIds) {
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`📋 UNIT ${unit.number}: "${unit.title}"`);
      console.log(`═══════════════════════════════════════════════════════════`);

      // Get updated unit data
      const unitData = await prisma.unitPlan.findUnique({
        where: { id: unit.id },
        include: {
          expectations: {
            include: {
              expectation: true
            }
          }
        }
      });

      if (!unitData) {
        console.log(`❌ Unit ${unit.number} not found!`);
        continue;
      }

      // ETFO Compliance Check
      const checks = [
        {
          name: 'Big Ideas',
          field: 'bigIdeas',
          current: unitData.bigIdeas?.length || 0,
          required: 100,
          type: 'length'
        },
        {
          name: 'Essential Questions',
          field: 'essentialQuestions',
          current: Array.isArray(unitData.essentialQuestions) ? unitData.essentialQuestions.length : 0,
          required: 2,
          type: 'count'
        },
        {
          name: 'Key Vocabulary',
          field: 'keyVocabulary',
          current: Array.isArray(unitData.keyVocabulary) ? unitData.keyVocabulary.length : 0,
          required: 15,
          type: 'count'
        },
        {
          name: 'Differentiation Strategies',
          field: 'differentiationStrategies',
          current: Array.isArray(unitData.differentiationStrategies) ? unitData.differentiationStrategies.length : 0,
          required: 4,
          type: 'count'
        },
        {
          name: 'Culminating Task',
          field: 'culminatingTask',
          current: unitData.culminatingTask?.length || 0,
          required: 150,
          type: 'length'
        },
        {
          name: 'Assessment Plan',
          field: 'assessmentPlan',
          current: unitData.assessmentPlan?.length || 0,
          required: 200,
          type: 'length'
        },
        {
          name: 'Parent Communication',
          field: 'parentCommunicationPlan',
          current: unitData.parentCommunicationPlan?.length || 0,
          required: 100,
          type: 'length'
        },
        {
          name: 'Community Connections',
          field: 'communityConnections',
          current: unitData.communityConnections?.length || 0,
          required: 100,
          type: 'length'
        },
        {
          name: 'Indigenous Perspectives',
          field: 'indigenousPerspectives',
          current: unitData.indigenousPerspectives?.length || 0,
          required: 100,
          type: 'length'
        }
      ];

      let complianceScore = 0;
      let totalChecks = checks.length;

      console.log(`📊 ETFO COMPLIANCE VERIFICATION:`);
      checks.forEach(check => {
        const meets = check.current >= check.required;
        if (meets) complianceScore++;
        
        console.log(`${meets ? '✅' : '❌'} ${check.name}: ${check.current} (Required: ${check.required})`);
        
        if (meets && check.name === 'Key Vocabulary' && check.current >= 15) {
          console.log(`   🎯 Vocabulary: ${unitData.keyVocabulary?.slice(0, 6).join(', ')}...`);
        }
        
        if (meets && check.name === 'Essential Questions') {
          console.log(`   🎯 Questions: ${unitData.essentialQuestions?.slice(0, 2).join(', ')}`);
        }
      });

      const finalScore = Math.round((complianceScore / totalChecks) * 100);
      console.log(`\n📈 FINAL ETFO COMPLIANCE: ${finalScore}% ${finalScore === 100 ? '✅' : '❌'}`);

      // Additional Quality Metrics
      console.log(`\n📚 UNIT QUALITY METRICS:`);
      console.log(`• Curriculum Expectations: ${unitData.expectations.length}`);
      console.log(`• Date Range: ${unitData.startDate.toISOString().split('T')[0]} to ${unitData.endDate.toISOString().split('T')[0]}`);
      console.log(`• Estimated Duration: ${Math.round((unitData.endDate.getTime() - unitData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days`);

      verificationResults.push({
        unit: unit.number,
        title: unit.title,
        score: finalScore,
        compliant: finalScore === 100,
        vocabularyCount: Array.isArray(unitData.keyVocabulary) ? unitData.keyVocabulary.length : 0,
        expectationsCount: unitData.expectations.length
      });

      console.log(`${finalScore === 100 ? '🎉' : '⚠️'} Unit ${unit.number} ${finalScore === 100 ? 'PERFECT' : 'NEEDS WORK'}\n`);
    }

    // Overall Summary
    console.log(`🏆 OVERALL VERIFICATION SUMMARY`);
    console.log(`═══════════════════════════════════════════════════════════`);
    
    const perfectUnits = verificationResults.filter(r => r.compliant).length;
    const totalUnits = verificationResults.length;
    const overallSuccess = perfectUnits === totalUnits;
    
    console.log(`✅ Perfect Units: ${perfectUnits}/${totalUnits}`);
    console.log(`📊 Overall Success Rate: ${Math.round((perfectUnits / totalUnits) * 100)}%`);
    
    const totalVocabulary = verificationResults.reduce((sum, r) => sum + r.vocabularyCount, 0);
    const totalExpectations = verificationResults.reduce((sum, r) => sum + r.expectationsCount, 0);
    
    console.log(`📚 Total Vocabulary Terms: ${totalVocabulary} (Target: 72)`);
    console.log(`🎯 Total Curriculum Expectations: ${totalExpectations}`);

    console.log(`\n📋 UNIT-BY-UNIT RESULTS:`);
    verificationResults.forEach(result => {
      const status = result.compliant ? '🏆 PERFECT' : '⚠️ INCOMPLETE';
      console.log(`${status} Unit ${result.unit}: "${result.title}" (${result.score}%)`);
      console.log(`   📚 Vocabulary: ${result.vocabularyCount} terms, Expectations: ${result.expectationsCount}`);
    });

    if (overallSuccess) {
      console.log(`\n🎊 MISSION ACCOMPLISHED!`);
      console.log(`🚀 All 4 French Units (9-12) achieved 100% ETFO Grade 1 compliance`);
      console.log(`✨ Emily's winter-to-spring progression is pedagogically perfect`);
      console.log(`🌟 Ready for confident classroom implementation`);
    } else {
      console.log(`\n⚠️ MISSION INCOMPLETE`);
      console.log(`🔧 ${totalUnits - perfectUnits} units need additional work`);
      console.log(`📝 Review individual unit issues and re-run perfection scripts`);
    }

    return {
      success: overallSuccess,
      perfectUnits,
      totalUnits,
      totalVocabulary,
      results: verificationResults
    };

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
export { verifyUnits9to12Completion };

// Run if called directly
if (require.main === module) {
  verifyUnits9to12Completion()
    .then((summary) => {
      console.log('\n🎉 VERIFICATION COMPLETE!');
      process.exit(summary.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 VERIFICATION FAILED:', error);
      process.exit(1);
    });
}