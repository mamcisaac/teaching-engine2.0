#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addFPSCurriculumMapping() {
  try {
    console.log('🎯 ADDING FPS CURRICULUM MAPPING & LEARNING PROGRESSIONS');
    console.log('========================================================\n');
    
    // Get Emily's account and FPS LRP
    const emily = await prisma.user.findFirst({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    const fpsLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: emily.id,
        subject: 'Formation personnelle et sociale'
      }
    });
    
    console.log(`✅ Found Emily and FPS LRP\n`);
    
    // Get the 4 FPS curriculum expectations
    const fpsExpectations = await prisma.curriculumExpectation.findMany({
      where: {
        subject: 'Formation personnelle et sociale',
        grade: 1
      },
      orderBy: { code: 'asc' }
    });
    
    console.log(`📚 Found ${fpsExpectations.length} FPS expectations\n`);
    
    // Get current units
    const units = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: fpsLRP.id
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    // LOGICAL CURRICULUM MAPPING FOR LEARNING PROGRESSION
    const curriculumMapping = [
      {
        unitIndex: 0,
        title: "Moi et ma santé",
        primaryExpectations: ['FPS1', 'FPS4'],
        focusAreas: [
          'Personal hygiene and health practices',
          'Understanding body needs and signals',
          'Developing personal health routines',
          'Recognizing personal growth and abilities'
        ],
        learningProgression: 'Foundation unit establishing health awareness and personal identity'
      },
      {
        unitIndex: 1,
        title: "Sécurité et protection",
        primaryExpectations: ['FPS2'],
        focusAreas: [
          'Safety rules in different environments',
          'Trusted adults and help-seeking',
          'Personal safety and boundaries',
          'Emergency procedures for Grade 1'
        ],
        learningProgression: 'Builds on personal awareness to include safety consciousness'
      },
      {
        unitIndex: 2,
        title: "Émotions et relations",
        primaryExpectations: ['FPS3', 'FPS4'],
        focusAreas: [
          'Emotion identification and expression',
          'Friendship skills and communication',
          'Conflict resolution basics',
          'Personal emotional regulation strategies'
        ],
        learningProgression: 'Develops social-emotional skills building on personal foundation'
      },
      {
        unitIndex: 3,
        title: "Nutrition et énergie",
        primaryExpectations: ['FPS1'],
        focusAreas: [
          'Food groups and energy connection',
          'Healthy eating choices',
          'Cultural food diversity and respect',
          'Body signals for hunger and fullness'
        ],
        learningProgression: 'Deepens health practices with nutrition focus'
      },
      {
        unitIndex: 4,
        title: "Mouvement et bien-être",
        primaryExpectations: ['FPS1', 'FPS4'],
        focusAreas: [
          'Physical activity and wellness connection',
          'Movement as emotional regulation',
          'Inclusive physical activity',
          'Personal movement preferences and abilities'
        ],
        learningProgression: 'Integrates physical health with emotional well-being'
      },
      {
        unitIndex: 5,
        title: "Communauté et célébration",
        primaryExpectations: ['FPS2', 'FPS3', 'FPS4'],
        focusAreas: [
          'Community helpers and safety',
          'Environmental and digital safety basics',
          'Responsible citizenship behaviors',
          'Celebrating personal growth and community connections'
        ],
        learningProgression: 'Culminating integration of all FPS learning in community context'
      }
    ];
    
    console.log('🔧 MAPPING CURRICULUM EXPECTATIONS TO UNITS...\n');
    
    // Update each unit with curriculum mapping
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const mapping = curriculumMapping[i];
      
      console.log(`📝 Mapping Unit ${i + 1}: ${mapping.title}`);
      console.log(`   Primary Expectations: ${mapping.primaryExpectations.join(', ')}`);
      console.log(`   Learning Progression: ${mapping.learningProgression}\n`);
      
      // Get the full expectation details for this unit
      const unitExpectations = fpsExpectations.filter(exp => 
        mapping.primaryExpectations.includes(exp.code)
      );
      
      // Create enhanced success criteria with curriculum mapping
      const currentCriteria = unit.successCriteria as any;
      const enhancedCriteria = {
        ...currentCriteria,
        curriculumExpectations: mapping.primaryExpectations,
        focusAreas: mapping.focusAreas,
        learningProgression: mapping.learningProgression,
        expectationDetails: unitExpectations.map(exp => ({
          code: exp.code,
          description: exp.description
        }))
      };
      
      // Create curriculum-mapped description
      const curriculumSection = `
**ATTENTES CURRICULAIRES PEI:**
${unitExpectations.map(exp => `• ${exp.code}: ${exp.description}`).join('\n')}

**DOMAINES D'APPRENTISSAGE:**
${mapping.focusAreas.map(area => `• ${area}`).join('\n')}

**PROGRESSION PÉDAGOGIQUE:**
${mapping.learningProgression}

**APPROCHE ETFO:**
Chaque leçon suit la structure ETFO (Minds On/Action/Consolidation) avec évaluation continue à travers observation, portfolio et démonstration.`;
      
      // Update the unit with curriculum mapping
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          description: unit.description + curriculumSection,
          successCriteria: enhancedCriteria
        }
      });
      
      console.log(`   ✅ Unit ${i + 1} enhanced with curriculum mapping!\n`);
    }
    
    console.log('🔧 UPDATING LRP WITH CURRICULUM OVERVIEW...\n');
    
    // Update LRP with curriculum overview
    const curriculumOverview = `

**COUVERTURE CURRICULAIRE COMPLÈTE:**
• FPS1 (Santé personnelle): Unités 1, 4, 5 - progression des pratiques de base aux applications avancées
• FPS2 (Sécurité et responsabilité): Unités 2, 6 - de la sécurité personnelle à la responsabilité communautaire  
• FPS3 (Relations saines): Unités 3, 6 - des relations interpersonnelles aux connexions communautaires
• FPS4 (Compétences personnelles): Unités 1, 3, 5, 6 - développement continu de l'autonomie et de la confiance

**PROGRESSION PÉDAGOGIQUE:**
Septembre-Octobre: Fondation personnelle (identité, santé, compétences)
Novembre-Décembre: Sécurité et protection (environnement, limites)
Janvier-Février: Relations et émotions (communication, empathie)
Mars-Avril: Nutrition et mouvement (applications de santé)
Mai-Juin: Intégration communautaire (citoyenneté, célébration)`;
    
    await prisma.longRangePlan.update({
      where: { id: fpsLRP.id },
      data: {
        description: fpsLRP.description + curriculumOverview
      }
    });
    
    console.log('✅ LRP updated with curriculum overview\n');
    
    // Final verification
    console.log('🔍 CURRICULUM MAPPING VERIFICATION\n');
    console.log('=' .repeat(60));
    
    const finalUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlanId: fpsLRP.id
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    console.log('📊 CURRICULUM COVERAGE BY UNIT:');
    console.log('===============================');
    
    finalUnits.forEach((unit, index) => {
      const criteria = unit.successCriteria as any;
      
      console.log(`Unit ${index + 1}: ${unit.titleFr}`);
      console.log(`  🎯 Expectations: ${criteria?.curriculumExpectations?.join(', ') || 'None mapped'}`);
      console.log(`  📚 Focus Areas: ${criteria?.focusAreas?.length || 0} defined`);
      console.log(`  🔄 Progression: ${criteria?.learningProgression ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Verify all expectations are covered
    const allCoveredExpectations = new Set();
    finalUnits.forEach(unit => {
      const criteria = unit.successCriteria as any;
      criteria?.curriculumExpectations?.forEach(exp => allCoveredExpectations.add(exp));
    });
    
    console.log(`📋 CURRICULUM EXPECTATIONS COVERAGE:`);
    console.log(`Expected: FPS1, FPS2, FPS3, FPS4`);
    console.log(`Covered: ${Array.from(allCoveredExpectations).join(', ')}`);
    console.log(`Complete Coverage: ${allCoveredExpectations.size === 4 ? 'YES ✅' : 'NO ❌'}`);
    
    if (allCoveredExpectations.size === 4) {
      console.log('\n🏆 CURRICULUM MAPPING PERFECTION ACHIEVED!');
      console.log('===========================================');
      console.log('✅ All 4 FPS expectations mapped to units');
      console.log('✅ Logical learning progression established');
      console.log('✅ Focus areas defined for each unit');
      console.log('✅ ETFO structure integrated');
      console.log('✅ Authentic assessment approaches identified');
      console.log('\n📚 FPS UNITS NOW HAVE COMPLETE CURRICULUM FOUNDATION!');
    }
    
  } catch (error) {
    console.error('❌ Error adding FPS curriculum mapping:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute curriculum mapping
addFPSCurriculumMapping()
  .then(() => {
    console.log('\n✅ FPS curriculum mapping completed successfully');
  })
  .catch((error) => {
    console.error('❌ FPS curriculum mapping failed:', error);
    process.exit(1);
  });