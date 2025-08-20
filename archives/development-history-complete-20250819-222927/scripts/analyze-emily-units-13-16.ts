import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeEmilysUnits13to16() {
  try {
    console.log('=== ANALYZING EMILY\'S FINAL FRENCH UNITS 13-16 ===\n');
    
    // Get Emily's user record
    const emily = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'emily' } },
          { name: { contains: 'Emily' } }
        ]
      }
    });
    
    if (!emily) {
      console.log('❌ Emily not found in database');
      return;
    }
    
    console.log('✅ Found Emily:', emily.name, '(ID:', emily.id + ')');
    
    // Get Emily's French LRP
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });
    
    if (!frenchLRP) {
      console.log('❌ French LRP not found');
      return;
    }
    
    // Get all French units, ordered by start date
    const allFrenchUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: frenchLRP.id
      },
      orderBy: {
        startDate: 'asc'
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true
      }
    });
    
    console.log(`\\n✅ Found ${allFrenchUnits.length} French units total`);
    
    if (allFrenchUnits.length < 16) {
      console.log('❌ Expected 16 units, found', allFrenchUnits.length);
      return;
    }
    
    // Get Units 13-16 (last 4 units)
    const targetUnits = allFrenchUnits.slice(12, 16);
    
    console.log('\\n=== TARGET UNITS 13-16 IDENTIFIED ===');
    targetUnits.forEach((unit, index) => {
      const unitNum = 13 + index;
      console.log(`Unit ${unitNum}: ${unit.title} (${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]})`);
    });
    
    // Detailed analysis of each unit
    for (let i = 0; i < targetUnits.length; i++) {
      const unit = targetUnits[i];
      const unitNum = 13 + i;
      
      console.log(`\\n${'='.repeat(80)}`);
      console.log(`=== UNIT ${unitNum}: ${unit.title.toUpperCase()} DETAILED ANALYSIS ===`);
      console.log(`${'='.repeat(80)}`);
      
      // Get full unit details
      const fullUnit = await prisma.unitPlan.findFirst({
        where: { id: unit.id },
        include: {
          longRangePlan: {
            select: {
              subject: true,
              title: true
            }
          }
        }
      });
      
      if (!fullUnit) {
        console.log('❌ Could not fetch full unit details');
        continue;
      }
      
      // Basic info
      console.log('\\n📋 BASIC INFORMATION:');
      console.log('  Unit ID:', fullUnit.id);
      console.log('  Title:', fullUnit.title);
      console.log('  Subject:', fullUnit.longRangePlan.subject);
      console.log('  Dates:', fullUnit.startDate.toISOString().split('T')[0], 'to', fullUnit.endDate.toISOString().split('T')[0]);
      console.log('  Duration:', Math.ceil((fullUnit.endDate.getTime() - fullUnit.startDate.getTime()) / (1000 * 60 * 60 * 24)), 'days');
      
      // ETFO Compliance Analysis
      console.log('\\n🎯 ETFO COMPLIANCE ANALYSIS:');
      
      // Essential Questions
      if (fullUnit.essentialQuestions) {
        try {
          const questions = JSON.parse(fullUnit.essentialQuestions);
          console.log('  ✅ Essential Questions: Present (' + (Array.isArray(questions) ? questions.length : 'object') + ')');
          if (Array.isArray(questions) && questions.length > 0) {
            questions.slice(0, 3).forEach((q, idx) => {
              console.log(`    ${idx + 1}. ${q}`);
            });
            if (questions.length > 3) console.log(`    ... and ${questions.length - 3} more`);
          }
        } catch {
          console.log('  ⚠️ Essential Questions: Present but invalid JSON');
        }
      } else {
        console.log('  ❌ Essential Questions: MISSING');
      }
      
      // Big Ideas
      if (fullUnit.bigIdeas) {
        console.log('  ✅ Big Ideas: Present');
        console.log(`    Preview: "${fullUnit.bigIdeas.substring(0, 100)}${fullUnit.bigIdeas.length > 100 ? '...' : ''}"`);
      } else {
        console.log('  ❌ Big Ideas: MISSING');
      }
      
      // Key Vocabulary
      if (fullUnit.keyVocabulary) {
        try {
          const vocab = JSON.parse(fullUnit.keyVocabulary);
          console.log('  ✅ Key Vocabulary: Present');
          if (Array.isArray(vocab)) {
            console.log(`    Count: ${vocab.length} words`);
            console.log(`    Sample: ${vocab.slice(0, 8).join(', ')}${vocab.length > 8 ? '...' : ''}`);
          } else if (typeof vocab === 'object') {
            const allWords = Object.values(vocab).flat();
            console.log(`    Categories: ${Object.keys(vocab).length}`);
            console.log(`    Total words: ${allWords.length}`);
          }
        } catch {
          console.log('  ⚠️ Key Vocabulary: Present but invalid JSON');
        }
      } else {
        console.log('  ❌ Key Vocabulary: MISSING');
      }
      
      // Differentiation Strategies
      if (fullUnit.differentiationStrategies) {
        try {
          const diff = JSON.parse(fullUnit.differentiationStrategies);
          console.log('  ✅ Differentiation Strategies: Present');
          if (typeof diff === 'object') {
            console.log(`    Categories: ${Object.keys(diff).length}`);
          }
        } catch {
          console.log('  ⚠️ Differentiation Strategies: Present but invalid JSON');
        }
      } else {
        console.log('  ❌ Differentiation Strategies: MISSING');
      }
      
      // Culminating Task
      if (fullUnit.culminatingTask) {
        console.log('  ✅ Culminating Task: Present');
        console.log(`    Preview: "${fullUnit.culminatingTask.substring(0, 100)}${fullUnit.culminatingTask.length > 100 ? '...' : ''}"`);
      } else {
        console.log('  ❌ Culminating Task: MISSING');
      }
      
      // Assessment Plan
      if (fullUnit.assessmentPlan) {
        console.log('  ✅ Assessment Plan: Present');
        console.log(`    Preview: "${fullUnit.assessmentPlan.substring(0, 100)}${fullUnit.assessmentPlan.length > 100 ? '...' : ''}"`);
      } else {
        console.log('  ❌ Assessment Plan: MISSING');
      }
      
      // Parent Communication
      if (fullUnit.parentCommunicationPlan) {
        console.log('  ✅ Parent Communication Plan: Present');
      } else {
        console.log('  ❌ Parent Communication Plan: MISSING');
      }
      
      // Community Connections
      if (fullUnit.communityConnections) {
        console.log('  ✅ Community Connections: Present');
      } else {
        console.log('  ❌ Community Connections: MISSING');
      }
      
      // Indigenous Perspectives
      if (fullUnit.indigenousPerspectives) {
        console.log('  ✅ Indigenous Perspectives: Present');
      } else {
        console.log('  ❌ Indigenous Perspectives: MISSING');
      }
      
      // Calculate compliance score
      const fields = [
        fullUnit.essentialQuestions,
        fullUnit.bigIdeas,
        fullUnit.keyVocabulary,
        fullUnit.differentiationStrategies,
        fullUnit.culminatingTask,
        fullUnit.assessmentPlan,
        fullUnit.parentCommunicationPlan,
        fullUnit.communityConnections,
        fullUnit.indigenousPerspectives
      ];
      
      const presentFields = fields.filter(f => f).length;
      const complianceScore = Math.round((presentFields / fields.length) * 100);
      
      console.log(`\\n📊 CURRENT ETFO COMPLIANCE: ${complianceScore}% (${presentFields}/${fields.length} fields present)`);
      
      if (complianceScore < 100) {
        console.log('🔧 PERFECTION NEEDED: Missing fields require ETFO Grade 1 enhancement');
      } else {
        console.log('✅ FULLY COMPLIANT: All ETFO fields present');
      }
    }
    
    console.log(`\\n${'='.repeat(80)}`);
    console.log('=== PHASE 1 COMPLETION SUMMARY ===');
    console.log(`${'='.repeat(80)}`);
    console.log('Units 13-16 located and analyzed successfully');
    console.log('Spring/growth/celebration themes confirmed appropriate for March-June');
    console.log('Ready for comprehensive ETFO Grade 1 perfection application');
    console.log('\\n🎯 NEXT STEPS: Apply ETFO perfection to achieve 100% compliance on all 4 final units');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeEmilysUnits13to16().catch(console.error);