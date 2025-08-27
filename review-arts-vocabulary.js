const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reviewArtsVocabulary() {
  console.log('=== REVIEWING ARTS VOCABULARY ===\n');

  // Get Arts lessons and units
  const artsLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      grade: 1,
      OR: [
        { subject: 'Arts' },
        { subject: 'Arts visuels' },
        { subject: 'Art' },
        { subject: 'Musique' },
        { subject: 'Danse' },
        { subject: 'Théâtre' },
        { subject: 'Arts dramatiques' }
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

  console.log(`Found ${artsLessons.length} Arts lessons\n`);

  // Get Arts unit plans
  const artsUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        OR: [
          { subject: 'Arts' },
          { subject: 'Arts visuels' },
          { subject: 'Art' },
          { subject: 'Musique' },
          { subject: 'Danse' },
          { subject: 'Théâtre' },
          { subject: 'Arts dramatiques' }
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
      estimatedHours: true,
      longRangePlan: {
        select: {
          subject: true
        }
      }
    }
  });

  console.log(`Found ${artsUnits.length} Arts units\n`);

  // Define problematic arts vocabulary
  const tooAdvancedArts = [
    // Abstract art concepts
    'composition', 'perspective', 'proportion', 'équilibre', 'harmonie',
    'contrast', 'asymétrie', 'symétrie', 'rythme visuel', 'mouvement',
    'espace positif', 'espace négatif', 'premier plan', 'arrière-plan',
    
    // Technical terms
    'technique', 'médium', 'texture', 'palette', 'nuance', 'saturation',
    'tonalité', 'valeur', 'dégradé', 'mélange chromatique',
    
    // Art history/analysis
    'interprétation', 'analyse', 'critique', 'évaluation', 'appréciation',
    'style artistique', 'mouvement artistique', 'expression personnelle',
    
    // Music theory
    'mélodie', 'harmonie', 'rythme complexe', 'mesure', 'tempo',
    'gamme', 'accord', 'tonalité', 'modulation',
    
    // Drama/theatre
    'interprétation', 'personnage', 'mise en scène', 'scénario',
    'improvisation', 'expression corporelle', 'projection vocale'
  ];

  const grade1AppropriateArts = [
    // Basic colors
    'rouge', 'bleu', 'jaune', 'vert', 'orange', 'violet', 'noir', 'blanc',
    
    // Basic shapes
    'rond', 'carré', 'triangle', 'ligne', 'point',
    
    // Basic art materials
    'crayon', 'pinceau', 'peinture', 'papier', 'colle', 'ciseaux',
    'feutre', 'pastel', 'argile', 'bloc',
    
    // Basic art actions
    'dessiner', 'peindre', 'coller', 'couper', 'colorier', 'tracer',
    
    // Basic music
    'chanson', 'musique', 'chanter', 'écouter', 'son', 'fort', 'doux',
    'rapide', 'lent', 'instrument',
    
    // Basic drama
    'jouer', 'faire semblant', 'bouger', 'danser', 'rire', 'pleurer',
    
    // Basic concepts
    'beau', 'joli', 'aimer', 'préférer', 'créer', 'faire', 'regarder'
  ];

  const vocabularyIssues = [];

  for (const unit of artsUnits) {
    console.log(`\n=== ARTS UNIT: ${unit.titleFr} (${unit.longRangePlan?.subject}) ===`);
    console.log(`Hours: ${unit.estimatedHours}`);

    if (unit.keyVocabulary) {
      let vocab;
      try {
        vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      } catch (e) {
        vocab = typeof unit.keyVocabulary === 'string' ? [unit.keyVocabulary] : [];
      }

      console.log(`Vocabulary count: ${vocab.length}`);
      console.log(`Vocabulary:`, vocab);

      // Check for advanced arts vocabulary
      const tooAdvanced = vocab.filter(word => {
        if (typeof word !== 'string') return false;
        return tooAdvancedArts.some(advanced => 
          word.toLowerCase().includes(advanced.toLowerCase())
        );
      });

      if (tooAdvanced.length > 0) {
        vocabularyIssues.push({
          type: 'TOO_ADVANCED_ARTS',
          unitId: unit.id,
          unit: unit.titleFr,
          subject: unit.longRangePlan?.subject,
          issue: 'Contains arts vocabulary too advanced for Grade 1',
          vocabulary: tooAdvanced
        });
      }

      // Check vocabulary count
      if (vocab.length > 8) {
        vocabularyIssues.push({
          type: 'TOO_MANY_ARTS_WORDS',
          unitId: unit.id,
          unit: unit.titleFr,
          subject: unit.longRangePlan?.subject,
          issue: `${vocab.length} arts words is too many for Grade 1`,
          vocabulary: vocab
        });
      }

      // Count appropriate vocabulary
      const appropriate = vocab.filter(word => {
        if (typeof word !== 'string') return false;
        return grade1AppropriateArts.some(good => 
          word.toLowerCase().includes(good.toLowerCase())
        );
      });

      console.log(`  ✅ Grade 1 appropriate: ${appropriate.length} words`);
      console.log(`  ⚠️  Need review: ${vocab.length - appropriate.length} words`);

      if (appropriate.length > 0) {
        console.log(`  Good words:`, appropriate);
      }
      if (tooAdvanced.length > 0) {
        console.log(`  ❌ Too advanced:`, tooAdvanced);
      }
    }

    // Check for abstract language in descriptions
    if (unit.descriptionFr) {
      const description = unit.descriptionFr.toLowerCase();
      const abstractArtsConcepts = [
        'expression artistique', 'créativité personnelle', 'développement esthétique',
        'appréciation artistique', 'analyse critique', 'interprétation créative',
        'processus créatif', 'démarche artistique', 'réflexion créative'
      ];

      const foundAbstract = abstractArtsConcepts.filter(concept => 
        description.includes(concept.toLowerCase())
      );

      if (foundAbstract.length > 0) {
        vocabularyIssues.push({
          type: 'ABSTRACT_ARTS_LANGUAGE',
          unitId: unit.id,
          unit: unit.titleFr,
          subject: unit.longRangePlan?.subject,
          issue: 'Unit description uses abstract arts language',
          vocabulary: foundAbstract
        });
      }
    }
  }

  // Report issues
  console.log('\n\n=== ARTS VOCABULARY ISSUES ===\n');

  if (vocabularyIssues.length === 0) {
    console.log('No major arts vocabulary issues found! ✅');
  } else {
    vocabularyIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type} - ${issue.unit} (${issue.subject})`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Words/Concepts: ${JSON.stringify(issue.vocabulary)}`);
      console.log(`   Unit ID: ${issue.unitId}\n`);
    });
  }

  // Generate Grade 1 Arts Vocabulary Recommendations
  console.log('\n=== GRADE 1 ARTS VOCABULARY RECOMMENDATIONS ===\n');

  console.log('🎨 TIER 1 - COLORS & SHAPES (Weeks 1-6):');
  console.log('  rouge, bleu, jaune, rond, carré');
  console.log('  Focus: Primary colors and basic shapes I can draw\n');

  console.log('🖍️ TIER 2 - ART MATERIALS (Weeks 7-12):');
  console.log('  crayon, pinceau, papier, colle');
  console.log('  Focus: Things I use to make art\n');

  console.log('✏️ TIER 3 - ART ACTIONS (Weeks 13-18):');
  console.log('  dessiner, peindre, colorier, couper');
  console.log('  Focus: What I do when making art\n');

  console.log('🎵 TIER 4 - MUSIC BASICS (Weeks 19-24):');
  console.log('  chanson, chanter, musique, son');
  console.log('  Focus: Making and listening to music\n');

  console.log('🎭 TIER 5 - CREATIVE PLAY (Weeks 25-30):');
  console.log('  jouer, faire semblant, danser, bouger');
  console.log('  Focus: Using my body to create and express\n');

  console.log('❌ NEVER USE IN GRADE 1 ARTS:\n');
  console.log('Visual Arts:');
  console.log('  ❌ composition → ✅ mon dessin');
  console.log('  ❌ technique → ✅ comment faire');
  console.log('  ❌ perspective → ✅ loin, proche');
  console.log('  ❌ texture → ✅ doux, rugueux');
  console.log('  ❌ nuance → ✅ couleur claire/foncée');
  
  console.log('\nMusic:');
  console.log('  ❌ mélodie → ✅ chanson');
  console.log('  ❌ rythme → ✅ battre des mains');
  console.log('  ❌ tempo → ✅ rapide/lent');
  console.log('  ❌ harmonie → ✅ beau son');
  console.log('  ❌ gamme → ✅ do-ré-mi');

  console.log('\nDrama:');
  console.log('  ❌ interprétation → ✅ faire semblant');
  console.log('  ❌ personnage → ✅ jouer comme...');
  console.log('  ❌ improvisation → ✅ inventer');
  console.log('  ❌ expression corporelle → ✅ bouger son corps');

  console.log('\n🎨 ARTS LANGUAGE SIMPLIFICATION:\n');
  console.log('Complex → Simple:');
  console.log('  "créer une œuvre d\'art" → "faire un dessin"');
  console.log('  "exprimer sa créativité" → "faire quelque chose de beau"');
  console.log('  "développer son sens esthétique" → "apprendre ce qui est joli"');
  console.log('  "analyser les éléments visuels" → "regarder les couleurs et formes"');
  console.log('  "apprécier l\'art" → "aimer les beaux dessins"');

  // Provide specific recommendations
  artsUnits.forEach(unit => {
    if (unit.keyVocabulary) {
      let vocab;
      try {
        vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      } catch (e) {
        vocab = typeof unit.keyVocabulary === 'string' ? [unit.keyVocabulary] : [];
      }
      
      console.log(`\n🎨 UNIT: ${unit.titleFr} (${unit.longRangePlan?.subject})`);
      console.log(`   Current vocabulary (${vocab.length}): ${vocab.join(', ')}`);
      
      // Check for specific problems
      const hasAdvanced = vocab.some(word => 
        tooAdvancedArts.some(advanced => 
          word.toLowerCase().includes(advanced.toLowerCase())
        )
      );

      if (hasAdvanced) {
        console.log('   🚨 CRITICAL: Contains advanced arts vocabulary - needs simplification');
      }

      if (vocab.length > 6) {
        console.log('   ⚠️ RECOMMENDATION: Reduce to 4-6 concrete, hands-on arts words');
      }

      // Suggest specific improvements
      vocab.forEach(word => {
        const wordLower = word.toLowerCase();
        
        if (wordLower.includes('technique')) {
          console.log(`   💡 Replace "${word}" with "comment faire" or "façon de faire"`);
        }
        if (wordLower.includes('composition')) {
          console.log(`   💡 Replace "${word}" with "mon dessin" or "ma création"`);
        }
        if (wordLower.includes('expression')) {
          console.log(`   💡 Replace "${word}" with "montrer" or "faire voir"`);
        }
        if (wordLower.includes('créativité')) {
          console.log(`   💡 Replace "${word}" with "inventer" or "imaginer"`);
        }
        if (wordLower.includes('interprétation')) {
          console.log(`   💡 Replace "${word}" with "jouer comme" or "faire semblant"`);
        }
      });
    }
  });

  console.log('\n📋 GRADE 1 ARTS ASSESSMENT GUIDELINES:\n');
  console.log('✅ APPROPRIATE:');
  console.log('  - Student can name colors and shapes in their art');
  console.log('  - Student can demonstrate art actions (draw, paint, cut)');
  console.log('  - Student can identify art materials');
  console.log('  - Student can sing simple songs or move to music');
  console.log('  - Student shows enjoyment and willingness to create');

  console.log('\n❌ TOO ADVANCED:');
  console.log('  - Analyzing art techniques or styles');
  console.log('  - Explaining creative processes');
  console.log('  - Comparing different art forms');
  console.log('  - Self-reflection on artistic growth');
  console.log('  - Written responses about art experiences');

  await prisma.$disconnect();
}

reviewArtsVocabulary().catch(console.error);