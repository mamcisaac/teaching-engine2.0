const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reviewScienceVocabulary() {
  console.log('=== REVIEWING SCIENCE VOCABULARY ===\n');

  // Get Science lessons and units
  const scienceLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      grade: 1,
      OR: [
        { subject: 'Sciences de la nature' },
        { subject: 'Science' },
        { subject: 'Sciences et technologie' }
      ]
    },
    select: {
      id: true,
      title: true,
      titleFr: true,
      subject: true,
      learningGoalsFr: true,
      unitPlan: {
        select: {
          id: true,
          titleFr: true,
          keyVocabulary: true
        }
      }
    }
  });

  console.log(`Found ${scienceLessons.length} Science lessons\n`);

  // Get Science unit plans
  const scienceUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        OR: [
          { subject: 'Sciences de la nature' },
          { subject: 'Science' },
          { subject: 'Sciences et technologie' }
        ],
        grade: 1
      }
    },
    select: {
      id: true,
      titleFr: true,
      descriptionFr: true,
      bigIdeasFr: true,
      keyVocabulary: true,
      estimatedHours: true
    }
  });

  console.log(`Found ${scienceUnits.length} Science units\n`);

  // Science vocabulary analysis
  const vocabularyIssues = [];
  
  // Define problematic science vocabulary for Grade 1
  const tooAdvancedScience = [
    // Process words
    'observation', 'expérimentation', 'investigation', 'hypothèse',
    'conclusion', 'analyse', 'synthèse', 'évaluation',
    
    // Technical terms
    'température', 'thermomètre', 'évaporation', 'condensation',
    'photosynthèse', 'respiration', 'métamorphose', 'reproduction',
    'environnement', 'écosystème', 'biodiversité', 'pollution',
    
    // Abstract concepts
    'énergie', 'force', 'mouvement', 'vitesse', 'accélération',
    'magnétisme', 'électricité', 'gravité', 'équilibre',
    
    // Complex materials/tools
    'microscope', 'télescope', 'laboratoire', 'expérience',
    'instrument', 'équipement', 'matériel', 'échantillon'
  ];

  const grade1AppropriateScience = [
    // Living things (simple)
    'animal', 'plante', 'arbre', 'fleur', 'feuille',
    'chien', 'chat', 'oiseau', 'poisson', 'insecte',
    
    // Body parts
    'yeux', 'nez', 'bouche', 'oreilles', 'mains',
    'pieds', 'bras', 'jambes', 'tête', 'corps',
    
    // Weather (basic)
    'soleil', 'pluie', 'neige', 'vent', 'nuages',
    'chaud', 'froid', 'sec', 'mouillé',
    
    // Materials (concrete)
    'eau', 'air', 'terre', 'sable', 'roches',
    'bois', 'métal', 'plastique', 'papier',
    
    // Simple actions
    'grandir', 'manger', 'boire', 'dormir', 'bouger',
    'voir', 'entendre', 'sentir', 'toucher',
    
    // Seasons/time
    'printemps', 'été', 'automne', 'hiver',
    'jour', 'nuit', 'matin', 'soir'
  ];

  for (const unit of scienceUnits) {
    console.log(`\n=== SCIENCE UNIT: ${unit.titleFr} ===`);
    console.log(`Hours: ${unit.estimatedHours}`);

    if (unit.keyVocabulary) {
      const vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : [];
      
      // Handle case where keyVocabulary might be a string
      let vocabularyArray = vocab;
      if (typeof unit.keyVocabulary === 'string') {
        try {
          vocabularyArray = JSON.parse(unit.keyVocabulary);
        } catch (e) {
          vocabularyArray = [unit.keyVocabulary];
        }
      }

      console.log(`Vocabulary count: ${vocabularyArray.length}`);
      console.log(`Vocabulary:`, vocabularyArray);

      // Check for too advanced vocabulary
      const tooAdvanced = vocabularyArray.filter(word => {
        if (typeof word !== 'string') return false;
        return tooAdvancedScience.some(advanced => 
          word.toLowerCase().includes(advanced.toLowerCase())
        );
      });

      if (tooAdvanced.length > 0) {
        vocabularyIssues.push({
          type: 'TOO_ADVANCED_SCIENCE',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: 'Contains science vocabulary too advanced for Grade 1',
          vocabulary: tooAdvanced
        });
      }

      // Check vocabulary count
      if (vocabularyArray.length > 8) {
        vocabularyIssues.push({
          type: 'TOO_MANY_SCIENCE_WORDS',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: `${vocabularyArray.length} science words is too many for Grade 1`,
          vocabulary: vocabularyArray
        });
      }

      // Count appropriate vs inappropriate
      const appropriate = vocabularyArray.filter(word => {
        if (typeof word !== 'string') return false;
        return grade1AppropriateScience.some(good => 
          word.toLowerCase().includes(good.toLowerCase())
        );
      });

      console.log(`  ✅ Grade 1 appropriate: ${appropriate.length} words`);
      console.log(`  ⚠️  Need review: ${vocabularyArray.length - appropriate.length} words`);

      if (appropriate.length > 0) {
        console.log(`  Good words:`, appropriate);
      }
      if (tooAdvanced.length > 0) {
        console.log(`  ❌ Too advanced:`, tooAdvanced);
      }
    }

    // Check description for abstract language
    if (unit.descriptionFr) {
      const description = unit.descriptionFr.toLowerCase();
      const abstractScience = [
        'expérience', 'investigation', 'observation scientifique',
        'hypothèse', 'conclusion', 'analyse', 'phénomène',
        'processus', 'système', 'cycle', 'interaction'
      ];

      const foundAbstract = abstractScience.filter(concept => 
        description.includes(concept.toLowerCase())
      );

      if (foundAbstract.length > 0) {
        vocabularyIssues.push({
          type: 'ABSTRACT_SCIENCE_LANGUAGE',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: 'Unit description uses abstract science language',
          vocabulary: foundAbstract
        });
      }
    }
  }

  // Report issues
  console.log('\n\n=== SCIENCE VOCABULARY ISSUES ===\n');

  if (vocabularyIssues.length === 0) {
    console.log('No major science vocabulary issues found! ✅');
  } else {
    vocabularyIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type} - ${issue.unit}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Words/Concepts: ${JSON.stringify(issue.vocabulary)}`);
      console.log(`   Unit ID: ${issue.unitId}\n`);
    });
  }

  // Generate Grade 1 Science Vocabulary Recommendations
  console.log('\n=== GRADE 1 SCIENCE VOCABULARY RECOMMENDATIONS ===\n');

  console.log('🔬 TIER 1 - MY BODY (Weeks 1-6):');
  console.log('  yeux, nez, bouche, mains, pieds');
  console.log('  Focus: Body parts I can touch and see\n');

  console.log('🌱 TIER 2 - LIVING THINGS (Weeks 7-12):');
  console.log('  animal, plante, arbre, fleur');
  console.log('  Focus: Things that are alive around me\n');

  console.log('☀️ TIER 3 - WEATHER (Weeks 13-18):');
  console.log('  soleil, pluie, chaud, froid');
  console.log('  Focus: Weather I can feel and see\n');

  console.log('🏠 TIER 4 - MATERIALS (Weeks 19-24):');
  console.log('  eau, air, bois, métal');
  console.log('  Focus: Things I can touch and use\n');

  console.log('❌ NEVER USE IN GRADE 1 SCIENCE:');
  console.log('  ❌ photosynthèse → use "plantes mangent soleil"');
  console.log('  ❌ métamorphose → use "chenille devient papillon"');
  console.log('  ❌ évaporation → use "eau devient nuage"');
  console.log('  ❌ expérimentation → use "on regarde"');
  console.log('  ❌ observation → use "on voit"');
  console.log('  ❌ hypothèse → use "je pense que..."');
  console.log('  ❌ environnement → use "dehors" or "nature"');

  console.log('\n🔍 SCIENCE LANGUAGE SIMPLIFICATION:\n');
  console.log('Complex → Simple:');
  console.log('  "faire une observation" → "regarder"');
  console.log('  "conduire une expérience" → "essayer"');
  console.log('  "analyser les résultats" → "voir ce qui arrive"');
  console.log('  "tirer une conclusion" → "maintenant je sais"');
  console.log('  "les organismes vivants" → "les animaux et plantes"');

  // Provide specific unit recommendations
  scienceUnits.forEach(unit => {
    if (unit.keyVocabulary) {
      let vocab;
      try {
        vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      } catch (e) {
        vocab = [unit.keyVocabulary];
      }
      
      console.log(`\n🔬 UNIT: ${unit.titleFr}`);
      console.log(`   Current vocabulary (${vocab.length}): ${vocab.join(', ')}`);
      
      // Check for common problems
      const hasAdvanced = vocab.some(word => 
        tooAdvancedScience.some(advanced => 
          word.toLowerCase().includes(advanced.toLowerCase())
        )
      );

      if (hasAdvanced) {
        console.log('   🚨 CRITICAL: Contains advanced vocabulary - needs immediate simplification');
      }

      if (vocab.length > 5) {
        console.log('   ⚠️ RECOMMENDATION: Reduce to 3-5 concrete science words');
      }

      // Suggest alternatives for common advanced words
      vocab.forEach(word => {
        const wordLower = word.toLowerCase();
        if (wordLower.includes('observation')) {
          console.log(`   💡 Replace "${word}" with "regarder" or "voir"`);
        }
        if (wordLower.includes('expérience') || wordLower.includes('expérimentation')) {
          console.log(`   💡 Replace "${word}" with "essayer" or "tester"`);
        }
        if (wordLower.includes('environnement')) {
          console.log(`   💡 Replace "${word}" with "dehors" or "nature"`);
        }
        if (wordLower.includes('température')) {
          console.log(`   💡 Replace "${word}" with "chaud" or "froid"`);
        }
      });
    }
  });

  await prisma.$disconnect();
}

reviewScienceVocabulary().catch(console.error);