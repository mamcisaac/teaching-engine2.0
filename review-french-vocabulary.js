const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reviewFrenchVocabulary() {
  console.log('=== REVIEWING FRENCH LANGUAGE ARTS VOCABULARY ===\n');

  // Get French language arts lessons and units
  const frenchLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      grade: 1,
      subject: 'Français langue première'
    },
    select: {
      id: true,
      title: true,
      titleFr: true,
      learningGoalsFr: true,
      mindsOnFr: true,
      actionFr: true,
      consolidationFr: true,
      unitPlan: {
        select: {
          id: true,
          titleFr: true,
          keyVocabulary: true
        }
      }
    }
  });

  console.log(`Found ${frenchLessons.length} French Language Arts lessons\n`);

  // Get French unit plans
  const frenchUnits = await prisma.unitPlan.findMany({
    where: {
      longRangePlan: {
        subject: 'Français langue première',
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

  console.log(`Found ${frenchUnits.length} French Language Arts units\n`);

  // Analyze vocabulary issues
  const vocabularyIssues = [];

  for (const unit of frenchUnits) {
    console.log(`\n=== UNIT: ${unit.titleFr} ===`);
    console.log(`Hours: ${unit.estimatedHours}`);

    if (unit.keyVocabulary) {
      const vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      console.log(`Vocabulary count: ${vocab.length}`);
      console.log(`Vocabulary:`, vocab);

      // Check for issues
      if (vocab.length > 8) {
        vocabularyIssues.push({
          type: 'TOO_MANY_WORDS',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: `${vocab.length} words is too many for Grade 1`,
          vocabulary: vocab
        });
      }

      // Check for complex words
      const complexWords = vocab.filter(word => {
        if (typeof word !== 'string') return false;
        return word.length > 8 || 
               word.includes('-') || 
               word.includes('tion') ||
               word.includes('ment');
      });

      if (complexWords.length > 0) {
        vocabularyIssues.push({
          type: 'COMPLEX_WORDS',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: 'Contains complex words for Grade 1',
          vocabulary: complexWords
        });
      }
    }

    if (unit.descriptionFr) {
      // Check for abstract language in descriptions
      const abstractWords = ['communiquer', 'structures', 'organiser', 'développer', 'identifier'];
      const description = unit.descriptionFr.toLowerCase();
      const foundAbstract = abstractWords.filter(word => description.includes(word));

      if (foundAbstract.length > 0) {
        vocabularyIssues.push({
          type: 'ABSTRACT_LANGUAGE',
          unitId: unit.id,
          unit: unit.titleFr,
          issue: 'Uses abstract language in description',
          vocabulary: foundAbstract
        });
      }
    }
  }

  // Report issues
  console.log('\n\n=== VOCABULARY ISSUES FOUND ===\n');

  if (vocabularyIssues.length === 0) {
    console.log('No major vocabulary issues found! ✅');
  } else {
    vocabularyIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type} - ${issue.unit}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Words: ${JSON.stringify(issue.vocabulary)}`);
      console.log(`   Unit ID: ${issue.unitId}\n`);
    });
  }

  // Generate recommendations
  console.log('\n=== RECOMMENDATIONS FOR FRENCH VOCABULARY ===\n');

  frenchUnits.forEach(unit => {
    if (unit.keyVocabulary) {
      const vocab = Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : JSON.parse(unit.keyVocabulary);
      
      if (vocab.length > 5) {
        console.log(`📚 ${unit.titleFr}:`);
        console.log(`  Current: ${vocab.length} words`);
        console.log(`  Recommended: Reduce to 3-5 core words`);
        console.log(`  Keep: ${vocab.slice(0, 3).join(', ')}`);
        console.log(`  Move to later lessons: ${vocab.slice(3).join(', ')}\n`);
      }
    }
  });

  await prisma.$disconnect();
}

reviewFrenchVocabulary().catch(console.error);