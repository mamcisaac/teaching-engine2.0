import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyObservationAssessment() {
  console.log('🔍 VERIFYING OBSERVATION ASSESSMENT IMPROVEMENTS\n');

  const allMathLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      subject: 'Mathématiques'
    }
  });

  console.log(`📊 Analyzing ${allMathLessons.length} Math lessons for observation assessment`);

  let observationCount = 0;
  let testingCount = 0;
  let hasAssessmentNotes = 0;

  allMathLessons.forEach((lesson, index) => {
    const assessment = (lesson.assessmentNotes || '').toLowerCase();
    
    if (lesson.assessmentNotes && lesson.assessmentNotes.length > 0) {
      hasAssessmentNotes++;
    }

    // Check for observation-based assessment indicators  
    const hasObservationElements = 
      assessment.includes('observe') ||
      assessment.includes('listen') ||
      assessment.includes('watch') ||
      assessment.includes('note') ||
      assessment.includes('document') ||
      assessment.includes('anecdotal') ||
      assessment.includes('photo') ||
      assessment.includes('checklist') ||
      assessment.includes('during the lesson') ||
      assessment.includes('look for');

    // Check for inappropriate testing elements
    const hasTestingElements =
      assessment.includes('test') ||
      assessment.includes('quiz') ||
      assessment.includes('exam') ||
      assessment.includes('written assessment');

    if (hasObservationElements) {
      observationCount++;
    }

    if (hasTestingElements) {
      testingCount++;
    }

    // Show sample lessons for verification
    if (index < 3) {
      console.log(`\n📝 SAMPLE LESSON ${index + 1}: ${lesson.title}`);
      console.log(`Assessment Type: ${lesson.assessmentType || 'Not specified'}`);
      console.log(`Has Assessment Notes: ${lesson.assessmentNotes ? 'Yes' : 'No'}`);
      console.log(`Assessment Length: ${lesson.assessmentNotes?.length || 0} characters`);
      console.log(`Has Observation Elements: ${hasObservationElements ? 'Yes' : 'No'}`);
      console.log(`Has Testing Elements: ${hasTestingElements ? 'Yes' : 'No'}`);
      if (lesson.assessmentNotes) {
        console.log(`Assessment Preview: ${lesson.assessmentNotes.substring(0, 200)}...`);
      }
    }
  });

  const observationPercentage = Math.round((observationCount / allMathLessons.length) * 100);
  const hasAssessmentPercentage = Math.round((hasAssessmentNotes / allMathLessons.length) * 100);

  console.log('\n📊 VERIFICATION RESULTS:');
  console.log(`• Total Math lessons: ${allMathLessons.length}`);
  console.log(`• Lessons with assessment notes: ${hasAssessmentNotes} (${hasAssessmentPercentage}%)`);
  console.log(`• Lessons with observation assessment: ${observationCount} (${observationPercentage}%)`);
  console.log(`• Lessons with testing language: ${testingCount}`);

  if (observationPercentage >= 90) {
    console.log(`✅ TARGET ACHIEVED: Grade 1 observation assessment standard met (${observationPercentage}%)`);
  } else if (observationPercentage >= 70) {
    console.log(`🟡 GOOD PROGRESS: Significant improvement but still need ${90 - observationPercentage}% more`);
  } else {
    console.log(`⚠️ MORE WORK NEEDED: Only ${observationPercentage}% observation-based assessment`);
  }

  if (testingCount === 0) {
    console.log(`✅ TESTING ELIMINATED: No inappropriate testing language found`);
  } else {
    console.log(`⚠️ Testing still present in ${testingCount} lessons`);
  }

  return {
    totalLessons: allMathLessons.length,
    observationLessons: observationCount,
    observationPercentage: observationPercentage,
    testingLessons: testingCount
  };
}

verifyObservationAssessment()
  .catch((error) => {
    console.error('❌ Error verifying observation assessment:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });