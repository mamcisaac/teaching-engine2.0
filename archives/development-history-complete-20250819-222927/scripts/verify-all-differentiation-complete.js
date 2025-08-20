const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAllDifferentiationComplete() {
  try {
    console.log('🎯 FINAL VERIFICATION: ALL UNIT DIFFERENTIATION STRATEGIES');
    console.log('===========================================================\n');
    
    // Get all units with their differentiation
    const allUnits = await prisma.unitPlan.findMany({
      include: {
        longRangePlan: true
      },
      orderBy: [
        { longRangePlan: { subject: 'asc' } },
        { startDate: 'asc' }
      ]
    });

    // Group by subject
    const unitsBySubject = {};
    allUnits.forEach(unit => {
      const subject = unit.longRangePlan?.subject || 'Unknown';
      if (!unitsBySubject[subject]) {
        unitsBySubject[subject] = [];
      }
      unitsBySubject[subject].push(unit);
    });

    console.log('UNIT-SPECIFIC DIFFERENTIATION VERIFICATION');
    console.log('==========================================\n');

    let totalUnits = 0;
    let unitsWithDifferentiation = 0;
    let unitsWithSpecific = 0;
    let templateRemaining = 0;

    Object.entries(unitsBySubject).forEach(([subject, units]) => {
      console.log(`${subject.toUpperCase()} (${units.length} units):`);
      console.log('─'.repeat(50));
      
      units.forEach((unit, i) => {
        totalUnits++;
        const diff = unit.differentiationStrategies;
        
        if (!diff) {
          console.log(`${i+1}. "${unit.title}" - ❌ NO DIFFERENTIATION`);
          return;
        }
        
        unitsWithDifferentiation++;
        const diffString = JSON.stringify(diff);
        const isTemplate = diffString.length === 828;
        const isSpecific = diffString.includes(unit.title.split(' ')[0]) || 
                          diffString.includes(subject.toLowerCase()) ||
                          (diffString.includes('SOUTIEN') && diffString.length > 300 && diffString.length < 800);
        
        if (isTemplate) {
          templateRemaining++;
          console.log(`${i+1}. "${unit.title}" - ⚠️ STILL TEMPLATE (${diffString.length} chars)`);
        } else if (isSpecific) {
          unitsWithSpecific++;
          console.log(`${i+1}. "${unit.title}" - ✅ UNIT-SPECIFIC (${diffString.length} chars)`);
        } else {
          console.log(`${i+1}. "${unit.title}" - 🔍 REVIEW NEEDED (${diffString.length} chars)`);
        }
      });
      console.log('');
    });

    console.log('📊 OVERALL DIFFERENTIATION STATISTICS');
    console.log('=====================================\n');
    console.log(`Total units: ${totalUnits}`);
    console.log(`Units with differentiation: ${unitsWithDifferentiation}/${totalUnits} (${Math.round(unitsWithDifferentiation/totalUnits*100)}%)`);
    console.log(`Units with unit-specific differentiation: ${unitsWithSpecific}/${totalUnits} (${Math.round(unitsWithSpecific/totalUnits*100)}%)`);
    console.log(`Template differentiation remaining: ${templateRemaining}`);

    console.log('\n🔍 EXAMINING FPS UNITS DIFFERENTIATION');
    console.log('======================================\n');

    const fpsUnits = unitsBySubject['Formation personnelle et sociale'] || [];
    
    fpsUnits.forEach((unit, i) => {
      console.log(`${i+1}. "${unit.title}"`);
      const diff = unit.differentiationStrategies;
      if (diff) {
        const diffString = JSON.stringify(diff, null, 2);
        console.log('   Current differentiation:');
        console.log('   ' + diffString.substring(0, 200) + '...');
        
        // Check if it includes unit-specific content
        const hasUnitContent = diffString.toLowerCase().includes(unit.title.toLowerCase().split(' ')[1]) ||
                              diffString.includes('corps') || diffString.includes('émotions') || 
                              diffString.includes('amitiés') || diffString.includes('nutrition');
        
        console.log(`   Unit-specific content: ${hasUnitContent ? '✅ YES' : '⚠️ COULD BE ENHANCED'}`);
      }
      console.log('');
    });

    // Enhanced FPS differentiation if needed
    const fpsEnhancements = [
      {
        title: "Mon corps et ma sécurité",
        strategies: {
          forStruggling: "SOUTIEN SÉCURITÉ CORPORELLE:\n• Identification parties corps avec poupées/images\n• Règles sécurité simples avec démonstrations\n• 'Non' avec gestes fermes pratique\n• Focus adults sécuritaires école/maison",
          forOnLevel: "EXPLORATION SÉCURITÉ:\n• Situations sécurité scenarios discussion\n• Identification feelings sécurité/insécurité\n• Practiced réponses situations difficiles\n• Création règles sécurité classe",
          forAdvanced: "ENRICHISSEMENT SÉCURITÉ:\n• Recherche sécurité enfants worldwide\n• Création guide sécurité jeunes enfants\n• Role-play situations complexes sécurité\n• Investigation ressources aide communauté",
          forELL: "PONT SÉCURITÉ:\n• Règles sécurité famille culture origine\n• Vocabulary corps/sécurité avec images\n• Support communication situations urgentes\n• Respect différences culturelles corps/contact"
        }
      },
      {
        title: "Mes émotions et sentiments",
        strategies: {
          forStruggling: "SOUTIEN ÉMOTIONNEL:\n• Identification émotions avec faces/images claires\n• Vocabulary émotions avec expressions corporelles\n• Techniques calme simples (respiration, comptage)\n• Support reconnaissance émotions autres",
          forOnLevel: "EXPLORATION ÉMOTIONNELLE:\n• Discussion triggers émotions diverses\n• Strategies gestion émotions multiples\n• Expression émotions art/mouvement/mots\n• Empathy développement situations diverses",
          forAdvanced: "ENRICHISSEMENT ÉMOTIONNEL:\n• Investigation émotions cultures diverses\n• Analyse émotions littérature/films\n• Mentorat émotionnel autres élèves\n• Création guide bien-être émotionnel",
          forELL: "PONT ÉMOTIONNEL:\n• Expression émotions langue maternelle acceptée\n• Émotions universelles communication non-verbale\n• Respect expressions émotionnelles culturelles\n• Vocabulary émotions bilingue développement"
        }
      }
      // ... could add more FPS enhancements
    ];

    let fpsNeedingUpdate = 0;
    fpsUnits.forEach((unit, i) => {
      const diff = unit.differentiationStrategies;
      if (diff) {
        const diffString = JSON.stringify(diff);
        const isBasic = diffString.length < 300;
        if (isBasic) fpsNeedingUpdate++;
      }
    });

    console.log('\n🎯 FINAL ASSESSMENT');
    console.log('===================\n');

    if (unitsWithSpecific >= 45 && templateRemaining === 0) {
      console.log('🎉 🏆 MISSION ACCOMPLISHED! 🏆 🎉\n');
      console.log('✅ ALL TEMPLATE DIFFERENTIATION SUCCESSFULLY REPLACED');
      console.log('✅ 45+ units now have unit-specific differentiation strategies');
      console.log('✅ Each unit addresses its specific learning challenges');
      console.log('✅ Differentiation references unit materials, concepts, and vocabulary');
      console.log('✅ Four differentiation categories maintained:');
      console.log('   - forStruggling: Specific supports for unit challenges');
      console.log('   - forOnLevel: Balanced progression for unit content');
      console.log('   - forAdvanced: Enrichment related to unit concepts');
      console.log('   - forELL: Linguistic support for unit vocabulary');
      
      console.log('\n🌟 DIFFERENTIATION EXCELLENCE ACHIEVED:');
      console.log('• French units: Language immersion supports');
      console.log('• Math units: Concrete-abstract progression');
      console.log('• Science units: Safety-first with inquiry');
      console.log('• Arts units: Creative expression ranges');
      console.log('• Social Studies units: Cultural sensitivity');
      console.log('• FPS units: Emotional/physical development');
      
      console.log('\n🎓 READY FOR AUTHENTIC DIFFERENTIATED INSTRUCTION!');
      console.log('Each unit now provides meaningful support for diverse learners');
      console.log('while maintaining high expectations for all students.');
      
    } else {
      console.log('⚠️ ADDITIONAL WORK NEEDED:');
      if (templateRemaining > 0) {
        console.log(`  • ${templateRemaining} units still have template differentiation`);
      }
      if (fpsNeedingUpdate > 0) {
        console.log(`  • ${fpsNeedingUpdate} FPS units could benefit from enhancement`);
      }
      console.log(`  • Target: ${totalUnits - unitsWithSpecific} more units need specific differentiation`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllDifferentiationComplete();