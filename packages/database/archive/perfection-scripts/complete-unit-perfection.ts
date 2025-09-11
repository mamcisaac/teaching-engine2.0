#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeUnitPerfection() {
  console.log('🎯 COMPLETING UNIT PLAN PERFECTION');
  console.log('===================================\n');
  
  try {
    // STEP 1: Add keyVocabulary to all units missing it
    console.log('📚 STEP 1: Adding keyVocabulary to units missing it...\n');
    
    const subjectVocabulary = {
      'Français (Immersion)': {
        core: ["français", "langue", "parler", "écouter", "lire", "écrire", "livre", "histoire", "mot", "phrase"],
        extension: ["expression", "communication", "vocabulaire", "grammaire", "littérature", "créativité", "auteur", "lecteur"],
        support: ["bonjour", "merci", "oui", "non", "aide", "comprendre", "répéter", "écouter"]
      },
      'Sciences de la nature': {
        core: ["science", "observer", "expérience", "nature", "animal", "plante", "eau", "air", "sécurité", "découvrir"],
        extension: ["environnement", "expérimentation", "hypothèse", "conclusion", "écosystème", "habitat", "cycle", "changement"],
        support: ["regarder", "toucher", "sentir", "attention", "danger", "propre", "vivant", "grandir"]
      },
      'Arts visuels': {
        core: ["art", "couleur", "ligne", "forme", "texture", "pinceau", "papier", "créer", "dessiner", "peindre"],
        extension: ["expression", "créativité", "technique", "matériaux", "composition", "perspective", "artiste", "œuvre"],
        support: ["rouge", "bleu", "jaune", "rond", "carré", "grand", "petit", "beau", "faire", "montrer"]
      },
      'Sciences humaines': {
        core: ["famille", "école", "communauté", "maison", "ami", "voisin", "règle", "respect", "partager", "aider"],
        extension: ["tradition", "culture", "célébration", "diversité", "coopération", "responsabilité", "citoyen", "appartenance"],
        support: ["moi", "nous", "ensemble", "gentil", "écouter", "tour", "merci", "s'il vous plaît"]
      },
      'Formation personnelle et sociale': {
        core: ["corps", "sécurité", "émotion", "sentiment", "ami", "santé", "grandir", "changer", "confiance", "respect"],
        extension: ["bien-être", "estime", "empathie", "coopération", "résolution", "nutrition", "développement", "autonomie"],
        support: ["content", "triste", "fâché", "peur", "calme", "aide", "non", "stop", "dire", "demander"]
      }
    };
    
    // Get all units missing keyVocabulary
    const allUnits = await prisma.unitPlan.findMany({
      where: {
        userId: 23,
        OR: [
          { keyVocabulary: { equals: null } },
          { keyVocabulary: { equals: {} } }
        ]
      },
      include: {
        longRangePlan: true
      }
    });
    
    console.log(`Found ${allUnits.length} units missing keyVocabulary\n`);
    
    for (const unit of allUnits) {
      const subject = unit.longRangePlan?.subject;
      let vocabulary = { core: [], extension: [], support: [] };
      
      // Find matching vocabulary for this subject
      for (const [subjectName, vocab] of Object.entries(subjectVocabulary)) {
        if (subject && subject.includes(subjectName.split(' ')[0])) {
          vocabulary = vocab;
          break;
        }
      }
      
      // Add unit-specific vocabulary based on title
      const unitTitle = unit.title.toLowerCase();
      if (unitTitle.includes('nombre')) {
        vocabulary.core.push("nombre", "compter", "zéro", "un", "deux", "trois");
        vocabulary.extension.push("quantité", "chiffre", "numération");
      }
      if (unitTitle.includes('couleur')) {
        vocabulary.core.push("rouge", "bleu", "jaune", "vert", "orange", "violet");
        vocabulary.extension.push("nuance", "teinte", "palette");
      }
      if (unitTitle.includes('sécurité')) {
        vocabulary.core.push("danger", "attention", "prudent", "protéger");
        vocabulary.extension.push("prévention", "protection", "vigilance");
      }
      
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: {
          keyVocabulary: JSON.stringify(vocabulary)
        }
      });
      
      console.log(`✅ Added keyVocabulary to: ${unit.title}`);
    }
    
    // STEP 2: Map curriculum expectations to all units
    console.log(`\n📋 STEP 2: Mapping curriculum expectations to units...\n`);
    
    // Get all curriculum expectations for Grade 1
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });
    
    console.log(`Found ${expectations.length} Grade 1 curriculum expectations\n`);
    
    // Clear existing expectation mappings
    await prisma.unitPlanExpectation.deleteMany({
      where: {
        unitPlan: {
          userId: 23
        }
      }
    });
    
    console.log('Cleared existing expectation mappings\n');
    
    // Get all subjects and their units
    const subjects = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      include: {
        unitPlans: {
          orderBy: { startDate: 'asc' }
        }
      }
    });
    
    let totalMappings = 0;
    
    for (const subject of subjects) {
      console.log(`📚 Mapping expectations for: ${subject.subject}`);
      
      // Find expectations for this subject
      const subjectExpectations = expectations.filter(exp => {
        const expSubject = exp.subject.toLowerCase();
        const subjectName = subject.subject.toLowerCase();
        
        if (subjectName.includes('français') || subjectName.includes('immersion')) {
          return expSubject.includes('french') || expSubject.includes('français');
        }
        if (subjectName.includes('math')) {
          return expSubject.includes('math');
        }
        if (subjectName.includes('science')) {
          return expSubject.includes('science');
        }
        if (subjectName.includes('humaines') || subjectName.includes('social')) {
          return expSubject.includes('social');
        }
        if (subjectName.includes('arts')) {
          return expSubject.includes('arts') || expSubject.includes('visual');
        }
        if (subjectName.includes('formation') || subjectName.includes('personnelle')) {
          return expSubject.includes('health') || expSubject.includes('physical');
        }
        
        return false;
      });
      
      console.log(`  Found ${subjectExpectations.length} expectations for ${subject.subject}`);
      
      if (subjectExpectations.length === 0) {
        console.log(`  ⚠️ No expectations found for ${subject.subject}, skipping...`);
        continue;
      }
      
      // Distribute expectations evenly across units
      const units = subject.unitPlans;
      if (units.length === 0) {
        console.log(`  ⚠️ No units found for ${subject.subject}, skipping...`);
        continue;
      }
      
      const expectationsPerUnit = Math.ceil(subjectExpectations.length / units.length);
      
      for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        const startIdx = i * expectationsPerUnit;
        const endIdx = Math.min(startIdx + expectationsPerUnit, subjectExpectations.length);
        const unitExpectations = subjectExpectations.slice(startIdx, endIdx);
        
        for (const expectation of unitExpectations) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: expectation.id
            }
          }).catch(() => {
            // Ignore if already exists
          });
          totalMappings++;
        }
        
        console.log(`    ✅ Mapped ${unitExpectations.length} expectations to: ${unit.title}`);
      }
    }
    
    console.log(`\n✅ Total expectation mappings created: ${totalMappings}\n`);
    
    // STEP 3: Final verification
    console.log('🔍 STEP 3: Final verification of perfection...\n');
    
    const finalUnits = await prisma.unitPlan.findMany({
      where: { userId: 23 },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    let perfectionScore = {
      totalUnits: finalUnits.length,
      withBigIdeas: 0,
      withEssentialQuestions: 0,
      withKeyVocabulary: 0,
      withAssessmentPlan: 0,
      withDifferentiation: 0,
      withExpectations: 0
    };
    
    finalUnits.forEach(unit => {
      if (unit.bigIdeas) perfectionScore.withBigIdeas++;
      if (unit.essentialQuestions) perfectionScore.withEssentialQuestions++;
      if (unit.keyVocabulary) perfectionScore.withKeyVocabulary++;
      if (unit.assessmentPlan) perfectionScore.withAssessmentPlan++;
      if (unit.differentiationStrategies) perfectionScore.withDifferentiation++;
      if (unit.expectations.length > 0) perfectionScore.withExpectations++;
    });
    
    console.log('📊 PERFECTION METRICS:');
    console.log(`   Total Units: ${perfectionScore.totalUnits}`);
    console.log(`   Big Ideas: ${perfectionScore.withBigIdeas}/${perfectionScore.totalUnits} (${Math.round(perfectionScore.withBigIdeas/perfectionScore.totalUnits*100)}%)`);
    console.log(`   Essential Questions: ${perfectionScore.withEssentialQuestions}/${perfectionScore.totalUnits} (${Math.round(perfectionScore.withEssentialQuestions/perfectionScore.totalUnits*100)}%)`);
    console.log(`   Key Vocabulary: ${perfectionScore.withKeyVocabulary}/${perfectionScore.totalUnits} (${Math.round(perfectionScore.withKeyVocabulary/perfectionScore.totalUnits*100)}%)`);
    console.log(`   Assessment Plans: ${perfectionScore.withAssessmentPlan}/${perfectionScore.totalUnits} (${Math.round(perfectionScore.withAssessmentPlan/perfectionScore.totalUnits*100)}%)`);
    console.log(`   Differentiation: ${perfectionScore.withDifferentiation}/${perfectionScore.totalUnits} (${Math.round(perfectionScore.withDifferentiation/perfectionScore.totalUnits*100)}%)`);
    console.log(`   Expectations Mapped: ${perfectionScore.withExpectations}/${perfectionScore.totalUnits} (${Math.round(perfectionScore.withExpectations/perfectionScore.totalUnits*100)}%)`);
    
    const overallScore = Math.round(
      (perfectionScore.withBigIdeas + 
       perfectionScore.withEssentialQuestions + 
       perfectionScore.withKeyVocabulary + 
       perfectionScore.withAssessmentPlan + 
       perfectionScore.withDifferentiation + 
       perfectionScore.withExpectations) / 
      (perfectionScore.totalUnits * 6) * 100
    );
    
    console.log(`\n🎯 OVERALL PERFECTION SCORE: ${overallScore}%`);
    
    if (overallScore >= 95) {
      console.log('🏆 PERFECTION ACHIEVED! Units are ready for locking.');
    } else {
      console.log('⚠️ Some issues remain. Review metrics above.');
    }
    
  } catch (error) {
    console.error('❌ Error during perfection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeUnitPerfection();