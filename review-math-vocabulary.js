const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reviewMathVocabulary() {
  console.log('=== REVIEWING MATHEMATICS VOCABULARY ===\n');

  // Get Math lessons and units
  const mathLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      grade: 1,
      subject: 'Mathématiques'
    },
    select: {
      id: true,
      title: true,
      titleFr: true,
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

  console.log(`Found ${mathLessons.length} Mathematics lessons\n`);

  // Get Math unit plans
  const mathUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        subject: 'Mathématiques',
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

  console.log(`Found ${mathUnits.length} Mathematics units\n`);

  // Analyze vocabulary issues
  const vocabularyIssues = [];
  
  for (const unit of mathUnits) {
    console.log(`\n=== MATH UNIT: ${unit.titleFr} ===`);
    console.log(`Hours: ${unit.estimatedHours}`);

    if (unit.keyVocabulary) {
      const vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      console.log(`Vocabulary count: ${vocab.length}`);
      console.log(`Vocabulary:`, vocab);

      // Check for Grade 1 math vocabulary issues
      if (vocab.length > 6) {
        vocabularyIssues.push({
          type: 'TOO_MANY_MATH_WORDS',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: `${vocab.length} math words is too many for Grade 1`,
          vocabulary: vocab
        });
      }

      // Check for complex math terms
      const complexMathWords = vocab.filter(word => {
        if (typeof word !== 'string') return false;
        
        // Complex math vocabulary for Grade 1
        const complexPatterns = [
          'addition', 'soustraction', 'multiplication', 'division', // operations
          'équation', 'problème', 'solution', // abstract concepts
          'géométrie', 'mesure', 'graphique', // advanced topics
          'estimation', 'approximation', 'stratégie', // abstract thinking
          'perpendiculaire', 'parallèle', 'symétrie' // spatial concepts too advanced
        ];

        return complexPatterns.some(pattern => word.toLowerCase().includes(pattern)) ||
               word.length > 8 ||
               word.includes('-');
      });

      if (complexMathWords.length > 0) {
        vocabularyIssues.push({
          type: 'COMPLEX_MATH_TERMS',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: 'Contains math terms too advanced for Grade 1',
          vocabulary: complexMathWords
        });
      }

      // Check for appropriate Grade 1 math vocabulary
      const grade1Appropriate = vocab.filter(word => {
        if (typeof word !== 'string') return false;
        
        const appropriatePatterns = [
          // Numbers
          'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
          // Basic operations
          'plus', 'moins', 'égale',
          // Shapes (basic)
          'rond', 'carré', 'triangle',
          // Colors for sorting/graphing
          'rouge', 'bleu', 'vert', 'jaune',
          // Size/quantity
          'grand', 'petit', 'beaucoup', 'peu',
          // Basic math tools
          'nombre', 'compter', 'combien'
        ];

        return appropriatePatterns.includes(word.toLowerCase());
      });

      console.log(`  ✅ Grade 1 appropriate: ${grade1Appropriate.length} words`);
      console.log(`  ❌ Need review: ${vocab.length - grade1Appropriate.length} words`);
    }
  }

  // Check sample lesson content
  for (const lesson of mathLessons) {
    console.log(`\n--- Math Lesson: ${lesson.titleFr} ---`);
    
    if (lesson.learningGoalsFr) {
      // Check for complex language in learning goals
      const goals = lesson.learningGoalsFr.toLowerCase();
      const complexConcepts = [
        'identifieront', 'analyseront', 'compareront', 'classeront',
        'démontreront', 'expliqueront', 'justifieront'
      ];

      const foundComplex = complexConcepts.filter(concept => goals.includes(concept));
      
      if (foundComplex.length > 0) {
        vocabularyIssues.push({
          type: 'COMPLEX_LEARNING_GOALS',
          unitId: lesson.unitPlan?.id,
          unit: lesson.unitPlan?.titleFr,
          lesson: lesson.titleFr,
          issue: 'Learning goals use complex verbs for Grade 1',
          vocabulary: foundComplex
        });
      }
    }
  }

  // Report issues
  console.log('\n\n=== MATHEMATICS VOCABULARY ISSUES ===\n');

  if (vocabularyIssues.length === 0) {
    console.log('No major vocabulary issues found! ✅');
  } else {
    vocabularyIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type} - ${issue.unit}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Words/Concepts: ${JSON.stringify(issue.vocabulary)}`);
      if (issue.lesson) console.log(`   Lesson: ${issue.lesson}`);
      console.log(`   Unit ID: ${issue.unitId}\n`);
    });
  }

  // Generate Grade 1 Math Vocabulary Recommendations
  console.log('\n=== GRADE 1 MATH VOCABULARY RECOMMENDATIONS ===\n');

  console.log('📊 TIER 1 - ESSENTIAL NUMBERS (Weeks 1-8):');
  console.log('  un, deux, trois, quatre, cinq');
  console.log('  Focus: One number per lesson, with counting practice\n');

  console.log('📊 TIER 2 - BASIC OPERATIONS (Weeks 9-16):');
  console.log('  plus, égale, combien');
  console.log('  Example: "deux plus deux égale quatre"\n');

  console.log('📊 TIER 3 - SHAPES & COLORS (Weeks 17-24):');
  console.log('  rond, carré, rouge, bleu');
  console.log('  Focus: Sorting and simple classification\n');

  console.log('📊 TIER 4 - ADVANCED NUMBERS (Weeks 25-32):');
  console.log('  six, sept, huit, neuf, dix');
  console.log('  Focus: Extending counting, simple addition\n');

  console.log('❌ AVOID IN GRADE 1:');
  console.log('  - soustraction (use "moins" for simple subtraction)');
  console.log('  - multiplication, division');
  console.log('  - géométrie (use "formes" for shapes)');
  console.log('  - problème (use "question" for math problems)');
  console.log('  - estimation (too abstract for Grade 1)');

  mathUnits.forEach(unit => {
    if (unit.keyVocabulary) {
      const vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      
      console.log(`\n📐 UNIT: ${unit.titleFr}`);
      console.log(`   Current vocabulary (${vocab.length}): ${vocab.join(', ')}`);
      
      // Provide specific recommendations
      if (vocab.length > 5) {
        console.log('   ⚠️ RECOMMENDATION: Reduce to 3-5 core math words');
        console.log('   Keep most concrete, essential words');
        console.log('   Move advanced terms to later grades');
      }
      
      // Check if numbers are appropriate
      const numbers = vocab.filter(word => 
        ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 
         'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt'].includes(word)
      );
      
      if (numbers.length > 5) {
        console.log('   ⚠️ NUMBERS: Teaching too many numbers at once');
        console.log('   Recommended: Start with 1-5, then add 6-10 later');
      }
    }
  });

  await prisma.$disconnect();
}

reviewMathVocabulary().catch(console.error);