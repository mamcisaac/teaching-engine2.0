import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detailedMathAnalysis() {
  console.log('🔬 DETAILED MATH PEDAGOGY ANALYSIS: Emily McIsaac - Grade 1 Math Lessons\n');

  // Get all math lessons with full details
  const mathLessons = await prisma.eTFOLessonPlan.findMany({
    where: {
      userId: 23,
      subject: 'Mathématiques'
    },
    include: {
      unitPlan: true,
      expectations: {
        include: {
          expectation: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  if (mathLessons.length === 0) {
    console.log('❌ No math lessons found');
    return;
  }

  console.log(`📊 FOUND ${mathLessons.length} MATH LESSONS\n`);

  // Analyze by Grade 1 Math strands
  const strands = {
    'Number Sense': { lessons: [], issues: [] },
    'Patterns': { lessons: [], issues: [] },
    'Measurement': { lessons: [], issues: [] },
    'Geometry': { lessons: [], issues: [] },
    'Data Management': { lessons: [], issues: [] }
  };

  let concreteCount = 0;
  let pictorialCount = 0;
  let abstractCount = 0;
  let manipulativeCount = 0;
  let frenchVocabCount = 0;
  let problemSolvingCount = 0;
  let roteCount = 0;
  let observationAssessment = 0;
  let testAssessment = 0;

  // Analyze each lesson in detail
  mathLessons.forEach((lesson, index) => {
    const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
    const materials = lesson.materials ? JSON.stringify(lesson.materials).toLowerCase() : '';
    
    // Classify by math content
    if (content.includes('number') || content.includes('counting') || content.includes('addition') || content.includes('subtraction')) {
      strands['Number Sense'].lessons.push(lesson);
    } else if (content.includes('pattern') || content.includes('sequence')) {
      strands['Patterns'].lessons.push(lesson);
    } else if (content.includes('measure') || content.includes('length') || content.includes('time') || content.includes('weight')) {
      strands['Measurement'].lessons.push(lesson);
    } else if (content.includes('shape') || content.includes('geometry') || content.includes('triangle') || content.includes('circle')) {
      strands['Geometry'].lessons.push(lesson);
    } else if (content.includes('graph') || content.includes('data') || content.includes('chart')) {
      strands['Data Management'].lessons.push(lesson);
    }

    // Concrete-Pictorial-Abstract Analysis
    if (content.includes('concrete') || content.includes('manipulative') || content.includes('hands-on') || 
        content.includes('touch') || content.includes('handle')) {
      concreteCount++;
    }
    
    if (content.includes('picture') || content.includes('draw') || content.includes('visual') || 
        content.includes('diagram') || content.includes('represent')) {
      pictorialCount++;
    }
    
    if (content.includes('symbol') || content.includes('numeral') || content.includes('equation') || 
        content.includes('abstract') || content.includes('mental')) {
      abstractCount++;
    }

    // Manipulatives check
    if (materials.includes('manipulative') || materials.includes('blocks') || materials.includes('bears') ||
        materials.includes('counters') || materials.includes('cubes') || materials.includes('tiles') ||
        content.includes('manipulative')) {
      manipulativeCount++;
    }

    // French vocabulary integration
    if (lesson.titleFr && lesson.titleFr.length > 0 && 
        (content.includes('vocabulaire') || content.includes('français') || lesson.titleFr.includes('nombre'))) {
      frenchVocabCount++;
    }

    // Problem-solving vs rote practice
    if (content.includes('problem') || content.includes('story') || content.includes('real world') ||
        content.includes('investigate') || content.includes('explore')) {
      problemSolvingCount++;
    }
    
    if (content.includes('practice') || content.includes('drill') || content.includes('worksheet') ||
        content.includes('repeat') || content.includes('memorize')) {
      roteCount++;
    }

    // Assessment method analysis
    if (lesson.assessmentNotes) {
      const assessment = lesson.assessmentNotes.toLowerCase();
      if (assessment.includes('observe') || assessment.includes('watch') || assessment.includes('listen') ||
          assessment.includes('anecdotal') || assessment.includes('checklist')) {
        observationAssessment++;
      }
      
      if (assessment.includes('test') || assessment.includes('quiz') || assessment.includes('exam')) {
        testAssessment++;
      }
    }
  });

  // Results by Strand
  console.log('📚 ANALYSIS BY MATH STRAND:');
  console.log('============================\n');
  
  Object.entries(strands).forEach(([strand, data]) => {
    console.log(`${strand}: ${data.lessons.length} lessons`);
    if (data.lessons.length === 0) {
      console.log(`  ❌ NO LESSONS FOUND - Critical gap for Grade 1`);
    }
  });

  // Concrete-Pictorial-Abstract Analysis
  console.log('\n🧠 CONCRETE-PICTORIAL-ABSTRACT PROGRESSION:');
  console.log('============================================');
  console.log(`Concrete lessons: ${concreteCount}/${mathLessons.length} (${Math.round(concreteCount/mathLessons.length*100)}%)`);
  console.log(`Pictorial lessons: ${pictorialCount}/${mathLessons.length} (${Math.round(pictorialCount/mathLessons.length*100)}%)`);
  console.log(`Abstract lessons: ${abstractCount}/${mathLessons.length} (${Math.round(abstractCount/mathLessons.length*100)}%)`);
  
  if (concreteCount < mathLessons.length * 0.8) {
    console.log(`❌ CRITICAL: Too few concrete lessons for Grade 1 (should be >80%)`);
  }
  
  if (abstractCount > mathLessons.length * 0.3) {
    console.log(`❌ WARNING: Too many abstract lessons for Grade 1 (should be <30%)`);
  }

  // Manipulatives Analysis
  console.log('\n🔧 MANIPULATIVES & HANDS-ON LEARNING:');
  console.log('=====================================');
  console.log(`Lessons with manipulatives: ${manipulativeCount}/${mathLessons.length} (${Math.round(manipulativeCount/mathLessons.length*100)}%)`);
  
  if (manipulativeCount < mathLessons.length * 0.75) {
    console.log(`❌ CRITICAL: Insufficient manipulative use for Grade 1 (should be >75%)`);
  }

  // French Integration Analysis
  console.log('\n🇫🇷 FRENCH MATHEMATICAL VOCABULARY:');
  console.log('====================================');
  console.log(`Lessons with explicit French math vocabulary: ${frenchVocabCount}/${mathLessons.length} (${Math.round(frenchVocabCount/mathLessons.length*100)}%)`);
  
  if (frenchVocabCount < mathLessons.length * 0.8) {
    console.log(`❌ CRITICAL: Poor French math vocabulary integration for immersion (should be >80%)`);
  }

  // Problem-solving vs Rote Practice
  console.log('\n🧩 PROBLEM-SOLVING vs ROTE PRACTICE:');
  console.log('====================================');
  console.log(`Problem-solving lessons: ${problemSolvingCount}/${mathLessons.length} (${Math.round(problemSolvingCount/mathLessons.length*100)}%)`);
  console.log(`Rote practice lessons: ${roteCount}/${mathLessons.length} (${Math.round(roteCount/mathLessons.length*100)}%)`);
  
  if (problemSolvingCount < mathLessons.length * 0.6) {
    console.log(`❌ WARNING: Too little problem-solving emphasis (should be >60%)`);
  }
  
  if (roteCount > mathLessons.length * 0.3) {
    console.log(`❌ WARNING: Too much rote practice for Grade 1 (should be <30%)`);
  }

  // Assessment Analysis
  console.log('\n📋 ASSESSMENT METHODS:');
  console.log('======================');
  console.log(`Observation-based assessment: ${observationAssessment}/${mathLessons.length} (${Math.round(observationAssessment/mathLessons.length*100)}%)`);
  console.log(`Test-based assessment: ${testAssessment}/${mathLessons.length} (${Math.round(testAssessment/mathLessons.length*100)}%)`);
  
  if (observationAssessment < mathLessons.length * 0.9) {
    console.log(`❌ CRITICAL: Too little observation-based assessment for Grade 1 (should be >90%)`);
  }
  
  if (testAssessment > 0) {
    console.log(`❌ CRITICAL: Tests inappropriate for Grade 1 - should be 0`);
  }

  // Sample Deep Dive
  console.log('\n🔍 SAMPLE LESSON DEEP DIVE:');
  console.log('============================\n');
  
  if (mathLessons.length >= 3) {
    [0, Math.floor(mathLessons.length/2), mathLessons.length-1].forEach((index, i) => {
      const lesson = mathLessons[index];
      console.log(`LESSON ${i+1}: ${lesson.title}`);
      console.log(`Date: ${lesson.date.toISOString().split('T')[0]}`);
      console.log(`Unit: ${lesson.unitPlan.title}`);
      
      // Pedagogical Analysis
      const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
      const materials = lesson.materials ? JSON.stringify(lesson.materials) : 'Not specified';
      
      console.log(`\nPedagogical Elements:`);
      console.log(`- Concrete learning: ${content.includes('concrete') || content.includes('manipulative') ? '✅' : '❌'}`);
      console.log(`- Manipulatives: ${materials.toLowerCase().includes('manipulative') ? '✅' : '❌'}`);
      console.log(`- Problem-solving: ${content.includes('problem') || content.includes('explore') ? '✅' : '❌'}`);
      console.log(`- French integration: ${lesson.titleFr ? '✅' : '❌'}`);
      console.log(`- Age-appropriate: ${!content.includes('multiply') && !content.includes('divide') ? '✅' : '❌'}`);
      
      console.log(`\nMaterials: ${materials}`);
      console.log(`French Title: ${lesson.titleFr || 'Missing'}`);
      console.log(`Assessment: ${lesson.assessmentNotes?.substring(0, 100) || 'Missing'}...`);
      console.log('');
    });
  }

  // Final Quality Assessment
  console.log('🎯 PEDAGOGICAL QUALITY FINAL ASSESSMENT:');
  console.log('=========================================\n');
  
  const scores = {
    concreteLearning: Math.min(100, (concreteCount / mathLessons.length) * 125), // 80% target = 100 points
    manipulatives: Math.min(100, (manipulativeCount / mathLessons.length) * 133), // 75% target = 100 points  
    problemSolving: Math.min(100, (problemSolvingCount / mathLessons.length) * 167), // 60% target = 100 points
    frenchIntegration: Math.min(100, (frenchVocabCount / mathLessons.length) * 125), // 80% target = 100 points
    observationAssessment: Math.min(100, (observationAssessment / mathLessons.length) * 111) // 90% target = 100 points
  };
  
  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
  
  console.log(`Concrete Learning Score: ${Math.round(scores.concreteLearning)}%`);
  console.log(`Manipulatives Score: ${Math.round(scores.manipulatives)}%`);
  console.log(`Problem-Solving Score: ${Math.round(scores.problemSolving)}%`);
  console.log(`French Integration Score: ${Math.round(scores.frenchIntegration)}%`);
  console.log(`Assessment Score: ${Math.round(scores.observationAssessment)}%`);
  
  console.log(`\nOVERALL PEDAGOGICAL SCORE: ${Math.round(overallScore)}%`);
  
  if (overallScore >= 85) {
    console.log('🟢 EXCELLENT pedagogical approach');
  } else if (overallScore >= 70) {
    console.log('🟡 GOOD with room for improvement');
  } else if (overallScore >= 55) {
    console.log('🟠 FAIR - needs significant work');
  } else {
    console.log('🔴 POOR - major pedagogical issues');
  }
}

// Run the detailed analysis
detailedMathAnalysis()
  .catch((error) => {
    console.error('❌ Error in detailed analysis:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });