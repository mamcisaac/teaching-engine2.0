const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reviewSocialHealthVocabulary() {
  console.log('=== REVIEWING SOCIAL STUDIES & HEALTH VOCABULARY ===\n');

  // Get Social Studies and Health lessons and units
  const socialHealthLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      grade: 1,
      OR: [
        { subject: 'Études sociales' },
        { subject: 'Sciences humaines' },
        { subject: 'Formation personnelle et sociale' },
        { subject: 'FPS' },
        { subject: 'Health' },
        { subject: 'Social Studies' }
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

  console.log(`Found ${socialHealthLessons.length} Social Studies/Health lessons\n`);

  // Get Social Studies and Health unit plans
  const socialHealthUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        OR: [
          { subject: 'Études sociales' },
          { subject: 'Sciences humaines' },
          { subject: 'Formation personnelle et sociale' },
          { subject: 'FPS' },
          { subject: 'Health' },
          { subject: 'Social Studies' }
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

  console.log(`Found ${socialHealthUnits.length} Social Studies/Health units\n`);

  // Define problematic vocabulary
  const tooAbstractSocialHealth = [
    // Abstract social concepts
    'communauté', 'citoyenneté', 'responsabilité', 'démocratie', 
    'gouvernement', 'société', 'culture', 'tradition', 'patrimoine',
    'diversité', 'inclusion', 'équité', 'justice', 'droits',
    
    // Abstract emotions/relationships
    'empathie', 'compassion', 'tolérance', 'respect', 'coopération',
    'collaboration', 'négociation', 'compromis', 'réconciliation',
    
    // Complex health concepts
    'nutrition', 'métabolisme', 'système immunitaire', 'allergies',
    'hygiène personnelle', 'prévention', 'bien-être', 'santé mentale',
    
    // Abstract time/geography
    'passé', 'présent', 'futur', 'chronologie', 'séquence',
    'géographie', 'environnement', 'ressources', 'économie'
  ];

  const grade1AppropriateSocialHealth = [
    // Family (concrete)
    'maman', 'papa', 'bébé', 'frère', 'sœur', 'famille',
    
    // Feelings (basic, observable)
    'content', 'triste', 'fâché', 'peur', 'surpris',
    
    // Body/health (concrete)
    'propre', 'sale', 'manger', 'dormir', 'santé',
    'brosse', 'savon', 'eau', 'dents', 'mains',
    
    // Community helpers (visible jobs)
    'docteur', 'police', 'pompier', 'professeur',
    
    // Basic needs (concrete)
    'nourriture', 'eau', 'maison', 'vêtements', 'amour',
    
    // School/friends
    'ami', 'école', 'classe', 'jouer', 'partager',
    
    // Safety (concrete actions)
    'sécurité', 'danger', 'aide', 'stop', 'attention'
  ];

  const vocabularyIssues = [];

  for (const unit of socialHealthUnits) {
    console.log(`\n=== UNIT: ${unit.titleFr} (${unit.longRangePlan?.subject}) ===`);
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

      // Check for abstract vocabulary
      const tooAbstract = vocab.filter(word => {
        if (typeof word !== 'string') return false;
        return tooAbstractSocialHealth.some(abstract => 
          word.toLowerCase().includes(abstract.toLowerCase())
        );
      });

      if (tooAbstract.length > 0) {
        vocabularyIssues.push({
          type: 'TOO_ABSTRACT_SOCIAL_HEALTH',
          unitId: unit.id,
          unit: unit.titleFr,
          subject: unit.longRangePlan?.subject,
          issue: 'Contains abstract social/health vocabulary for Grade 1',
          vocabulary: tooAbstract
        });
      }

      // Check vocabulary count
      if (vocab.length > 8) {
        vocabularyIssues.push({
          type: 'TOO_MANY_SOCIAL_HEALTH_WORDS',
          unitId: unit.id,
          unit: unit.titleFr,
          subject: unit.longRangePlan?.subject,
          issue: `${vocab.length} words is too many for Grade 1`,
          vocabulary: vocab
        });
      }

      // Count appropriate vocabulary
      const appropriate = vocab.filter(word => {
        if (typeof word !== 'string') return false;
        return grade1AppropriateSocialHealth.some(good => 
          word.toLowerCase().includes(good.toLowerCase())
        );
      });

      console.log(`  ✅ Grade 1 appropriate: ${appropriate.length} words`);
      console.log(`  ⚠️  Need review: ${vocab.length - appropriate.length} words`);

      if (appropriate.length > 0) {
        console.log(`  Good words:`, appropriate);
      }
      if (tooAbstract.length > 0) {
        console.log(`  ❌ Too abstract:`, tooAbstract);
      }

      // Special check for family vocabulary complexity
      const familyWords = vocab.filter(word => 
        ['grand-maman', 'grand-papa', 'grand-mère', 'grand-père', 'tante', 'oncle', 'cousin', 'cousine'].includes(word.toLowerCase())
      );

      if (familyWords.length > 0) {
        vocabularyIssues.push({
          type: 'COMPLEX_FAMILY_VOCABULARY',
          unitId: unit.id,
          unit: unit.titleFr,
          subject: unit.longRangePlan?.subject,
          issue: 'Complex family vocabulary too advanced for early Grade 1',
          vocabulary: familyWords
        });
      }
    }

    // Check for abstract language in descriptions
    if (unit.descriptionFr) {
      const description = unit.descriptionFr.toLowerCase();
      const abstractConcepts = [
        'structures familiales', 'relations interpersonnelles', 
        'développement personnel', 'compétences sociales',
        'résolution de conflits', 'communication efficace',
        'identité culturelle', 'appartenance communautaire'
      ];

      const foundAbstract = abstractConcepts.filter(concept => 
        description.includes(concept.toLowerCase())
      );

      if (foundAbstract.length > 0) {
        vocabularyIssues.push({
          type: 'ABSTRACT_UNIT_DESCRIPTIONS',
          unitId: unit.id,
          unit: unit.titleFr,
          subject: unit.longRangePlan?.subject,
          issue: 'Unit description uses abstract social/health language',
          vocabulary: foundAbstract
        });
      }
    }
  }

  // Report issues
  console.log('\n\n=== SOCIAL STUDIES & HEALTH VOCABULARY ISSUES ===\n');

  if (vocabularyIssues.length === 0) {
    console.log('No major social studies/health vocabulary issues found! ✅');
  } else {
    vocabularyIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type} - ${issue.unit} (${issue.subject})`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Words/Concepts: ${JSON.stringify(issue.vocabulary)}`);
      console.log(`   Unit ID: ${issue.unitId}\n`);
    });
  }

  // Generate recommendations
  console.log('\n=== GRADE 1 SOCIAL STUDIES & HEALTH VOCABULARY RECOMMENDATIONS ===\n');

  console.log('👨‍👩‍👧‍👦 TIER 1 - MY FAMILY (Weeks 1-6):');
  console.log('  maman, papa, frère, sœur, famille');
  console.log('  Focus: People who live with me\n');

  console.log('😊 TIER 2 - MY FEELINGS (Weeks 7-12):');
  console.log('  content, triste, fâché, peur');
  console.log('  Focus: Feelings I can show on my face\n');

  console.log('🧼 TIER 3 - BEING CLEAN (Weeks 13-18):');
  console.log('  propre, sale, brosse, savon, dents');
  console.log('  Focus: Taking care of my body\n');

  console.log('🏫 TIER 4 - MY SCHOOL (Weeks 19-24):');
  console.log('  ami, école, partager, jouer');
  console.log('  Focus: People and activities at school\n');

  console.log('🚨 TIER 5 - BEING SAFE (Weeks 25-30):');
  console.log('  sécurité, danger, aide, stop');
  console.log('  Focus: Staying safe at home and school\n');

  console.log('❌ NEVER USE IN GRADE 1 SOCIAL STUDIES/HEALTH:\n');
  console.log('Social Studies:');
  console.log('  ❌ communauté → ✅ voisins, amis');
  console.log('  ❌ citoyenneté → ✅ être gentil');
  console.log('  ❌ responsabilité → ✅ mon travail');
  console.log('  ❌ diversité → ✅ différent');
  console.log('  ❌ culture → ✅ dans ma famille');
  
  console.log('\nHealth:');
  console.log('  ❌ nutrition → ✅ bonne nourriture');
  console.log('  ❌ hygiène personnelle → ✅ être propre');
  console.log('  ❌ bien-être → ✅ me sentir bien');
  console.log('  ❌ prévention → ✅ faire attention');
  console.log('  ❌ système immunitaire → ✅ rester en santé');

  console.log('\nEmotions:');
  console.log('  ❌ empathie → ✅ être gentil avec les autres');
  console.log('  ❌ tolérance → ✅ accepter les différences');
  console.log('  ❌ coopération → ✅ travailler ensemble');

  // Provide unit-specific recommendations
  socialHealthUnits.forEach(unit => {
    if (unit.keyVocabulary) {
      let vocab;
      try {
        vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      } catch (e) {
        vocab = typeof unit.keyVocabulary === 'string' ? [unit.keyVocabulary] : [];
      }
      
      console.log(`\n👥 UNIT: ${unit.titleFr} (${unit.longRangePlan?.subject})`);
      console.log(`   Current vocabulary (${vocab.length}): ${vocab.join(', ')}`);
      
      // Check for specific problems
      const hasAbstract = vocab.some(word => 
        tooAbstractSocialHealth.some(abstract => 
          word.toLowerCase().includes(abstract.toLowerCase())
        )
      );

      if (hasAbstract) {
        console.log('   🚨 CRITICAL: Contains abstract vocabulary - needs immediate simplification');
      }

      if (vocab.length > 5) {
        console.log('   ⚠️ RECOMMENDATION: Reduce to 3-5 concrete, personal vocabulary words');
      }

      // Suggest specific improvements
      vocab.forEach(word => {
        const wordLower = word.toLowerCase();
        
        if (wordLower.includes('grand-')) {
          console.log(`   💡 "${word}" is complex - consider "mémère/pépère" or delay until later`);
        }
        if (wordLower.includes('communauté')) {
          console.log(`   💡 Replace "${word}" with "voisins" or "amis"`);
        }
        if (wordLower.includes('responsabilité')) {
          console.log(`   💡 Replace "${word}" with "mon travail" or "ce que je dois faire"`);
        }
        if (wordLower.includes('respect')) {
          console.log(`   💡 Replace "${word}" with "être gentil"`);
        }
        if (wordLower.includes('diversité')) {
          console.log(`   💡 Replace "${word}" with "différent" or "pas pareil"`);
        }
      });
    }
  });

  await prisma.$disconnect();
}

reviewSocialHealthVocabulary().catch(console.error);