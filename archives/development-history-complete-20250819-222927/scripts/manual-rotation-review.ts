import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./packages/database/prisma/dev.db"
    }
  }
});

interface LessonAnalysis {
  title: string;
  unit: string;
  subject: string;
  safetyIssues: string[];
  qualityIssues: string[];
  developmentalIssues: string[];
  culturalIssues: string[];
}

async function manualRotationReview() {
  console.log('🎯 MANUAL ROTATION SUBJECTS REVIEW: Emily McIsaac (User ID 23)');
  console.log('='.repeat(80));
  console.log('Manually Examining Rotation Subjects for Quality, Safety & Appropriateness\n');

  const rotationSubjects = [
    'Sciences de la nature',
    'Sciences humaines', 
    'Arts visuels',
    'Formation personnelle et sociale'
  ];

  let totalSafetyIssues = 0;
  let totalQualityIssues = 0;
  let totalLessonsReviewed = 0;

  for (const subject of rotationSubjects) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 EXAMINING: ${subject.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);

    try {
      // Find lessons for this subject using ETFO structure
      const lessons = await prisma.eTFOLessonPlan.findMany({
        where: {
          userId: 23,
          unitPlan: {
            longRangePlan: {
              subject: subject
            }
          }
        },
        include: {
          unitPlan: {
            select: {
              title: true,
              longRangePlan: {
                select: {
                  subject: true
                }
              }
            }
          }
        },
        orderBy: [
          { unitPlan: { title: 'asc' } },
          { title: 'asc' }
        ]
      });

      if (lessons.length === 0) {
        console.log(`❌ NO LESSONS FOUND for ${subject}`);
        continue;
      }

      console.log(`📊 Found ${lessons.length} lessons for manual examination`);
      totalLessonsReviewed += lessons.length;

      // Group by unit for structure analysis
      const lessonsByUnit = lessons.reduce((acc, lesson) => {
        const unitTitle = lesson.unitPlan.title;
        if (!acc[unitTitle]) {
          acc[unitTitle] = [];
        }
        acc[unitTitle].push(lesson);
        return acc;
      }, {} as Record<string, any[]>);

      console.log(`\n📚 ROTATION BLOCK STRUCTURE (2-3 week units):`);
      console.log('-'.repeat(50));
      Object.entries(lessonsByUnit).forEach(([unit, unitLessons]) => {
        console.log(`   • ${unit}: ${unitLessons.length} lessons`);
      });

      // Manual examination of sample lessons from each unit
      console.log(`\n🔬 DETAILED MANUAL EXAMINATION:`);
      console.log('-'.repeat(40));

      let subjectSafetyIssues = 0;
      let subjectQualityIssues = 0;

      for (const [unitTitle, unitLessons] of Object.entries(lessonsByUnit)) {
        console.log(`\n📖 Unit: "${unitTitle}" (${unitLessons.length} lessons)`);
        
        // Examine first 3 lessons from each unit in detail
        const samplesToExamine = unitLessons.slice(0, 3);
        
        for (const lesson of samplesToExamine) {
          const analysis = await manuallyExamineLesson(lesson, subject);
          
          if (analysis.safetyIssues.length > 0 || analysis.qualityIssues.length > 0 || 
              analysis.developmentalIssues.length > 0 || analysis.culturalIssues.length > 0) {
            
            console.log(`\n   ⚠️  LESSON: "${lesson.title}"`);
            
            if (analysis.safetyIssues.length > 0) {
              console.log(`      🚨 SAFETY CONCERNS:`);
              analysis.safetyIssues.forEach(issue => console.log(`         • ${issue}`));
              subjectSafetyIssues += analysis.safetyIssues.length;
            }
            
            if (analysis.qualityIssues.length > 0) {
              console.log(`      ❌ QUALITY ISSUES:`);
              analysis.qualityIssues.forEach(issue => console.log(`         • ${issue}`));
              subjectQualityIssues += analysis.qualityIssues.length;
            }
            
            if (analysis.developmentalIssues.length > 0) {
              console.log(`      🧒 DEVELOPMENTAL CONCERNS:`);
              analysis.developmentalIssues.forEach(issue => console.log(`         • ${issue}`));
            }
            
            if (analysis.culturalIssues.length > 0) {
              console.log(`      🌍 CULTURAL REPRESENTATION ISSUES:`);
              analysis.culturalIssues.forEach(issue => console.log(`         • ${issue}`));
            }
          }
        }

        // Quick scan of remaining lessons for critical safety issues
        const remainingLessons = unitLessons.slice(3);
        for (const lesson of remainingLessons) {
          const quickSafetyCheck = await quickSafetyAssessment(lesson, subject);
          if (quickSafetyCheck.length > 0) {
            console.log(`\n   🚨 CRITICAL SAFETY: "${lesson.title}"`);
            quickSafetyCheck.forEach(issue => console.log(`      • ${issue}`));
            subjectSafetyIssues += quickSafetyCheck.length;
          }
        }
      }

      totalSafetyIssues += subjectSafetyIssues;
      totalQualityIssues += subjectQualityIssues;

      // Subject summary
      console.log(`\n📊 ${subject.toUpperCase()} SUMMARY:`);
      console.log(`   Total Lessons: ${lessons.length}`);
      console.log(`   Safety Issues Found: ${subjectSafetyIssues}`);
      console.log(`   Quality Issues Found: ${subjectQualityIssues}`);
      
      const safetyScore = Math.max(0, 100 - (subjectSafetyIssues / lessons.length * 20));
      const qualityScore = Math.max(0, 100 - (subjectQualityIssues / lessons.length * 10));
      
      console.log(`   Safety Score: ${safetyScore.toFixed(1)}%`);
      console.log(`   Quality Score: ${qualityScore.toFixed(1)}%`);

      if (safetyScore < 80) {
        console.log(`   🚨 STATUS: UNSAFE FOR IMPLEMENTATION`);
      } else if (qualityScore < 60) {
        console.log(`   ⚠️  STATUS: REQUIRES MAJOR IMPROVEMENTS`);
      } else {
        console.log(`   ✅ STATUS: ACCEPTABLE WITH MINOR IMPROVEMENTS`);
      }

    } catch (error) {
      console.error(`❌ Error examining ${subject}:`, error.message);
    }
  }

  // Generate final comprehensive report
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`🔥 COMPREHENSIVE ROTATION REVIEW REPORT`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Emily McIsaac (User ID 23) - Grade 1 French Immersion`);
  console.log(`Review Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`Reviewer: Curriculum Specialist (Manual Examination)\n`);

  console.log(`📊 EXECUTIVE SUMMARY:`);
  console.log(`   Total Lessons Examined: ${totalLessonsReviewed}`);
  console.log(`   Total Safety Issues: ${totalSafetyIssues}`);
  console.log(`   Total Quality Issues: ${totalQualityIssues}`);
  console.log(`   Average Issues per Lesson: ${((totalSafetyIssues + totalQualityIssues) / totalLessonsReviewed).toFixed(2)}`);

  const overallSafetyScore = Math.max(0, 100 - (totalSafetyIssues / totalLessonsReviewed * 15));
  const overallQualityScore = Math.max(0, 100 - (totalQualityIssues / totalLessonsReviewed * 8));

  console.log(`   Overall Safety Score: ${overallSafetyScore.toFixed(1)}%`);
  console.log(`   Overall Quality Score: ${overallQualityScore.toFixed(1)}%`);

  console.log(`\n🚨 CRITICAL RECOMMENDATIONS:`);
  if (totalSafetyIssues > 10) {
    console.log(`   1. IMMEDIATE: Comprehensive safety review required before implementation`);
  }
  if (totalQualityIssues > 50) {
    console.log(`   2. URGENT: Major quality improvements needed across all subjects`);
  }
  console.log(`   3. Establish proper rotation block structure (2-3 week coherent units)`);
  console.log(`   4. Add authentic cultural representation and Indigenous perspectives`);
  console.log(`   5. Ensure all activities are developmentally appropriate for Grade 1`);
  console.log(`   6. Integrate hands-on, experiential learning throughout`);

  if (overallSafetyScore < 80 || overallQualityScore < 60) {
    console.log(`\n❌ FINAL RECOMMENDATION: DO NOT IMPLEMENT without major revisions`);
  } else {
    console.log(`\n✅ FINAL RECOMMENDATION: May proceed with noted improvements`);
  }
}

async function manuallyExamineLesson(lesson: any, subject: string): Promise<LessonAnalysis> {
  const analysis: LessonAnalysis = {
    title: lesson.title,
    unit: lesson.unitPlan.title,
    subject: subject,
    safetyIssues: [],
    qualityIssues: [],
    developmentalIssues: [],
    culturalIssues: []
  };

  const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
  const materials = lesson.materialsNeeded?.toLowerCase() || '';

  // Subject-specific manual examination
  if (subject === 'Sciences de la nature') {
    await examineScience(lesson, content, materials, analysis);
  } else if (subject === 'Sciences humaines') {
    await examineSocialStudies(lesson, content, materials, analysis);
  } else if (subject === 'Arts visuels') {
    await examineArts(lesson, content, materials, analysis);
  } else if (subject === 'Formation personnelle et sociale') {
    await examineFPSHealth(lesson, content, materials, analysis);
  }

  // General developmental appropriateness check
  if (!content.includes('hands') && !content.includes('touch') && !content.includes('play')) {
    analysis.developmentalIssues.push('Lacks hands-on learning for Grade 1');
  }

  // French integration check
  if (!lesson.vocabularyFocus || lesson.vocabularyFocus.length === 0) {
    analysis.qualityIssues.push('Missing French vocabulary integration');
  }

  // Cultural representation check
  if (!lesson.indigenousPerspectives || lesson.indigenousPerspectives.length < 50) {
    analysis.culturalIssues.push('Insufficient Indigenous perspectives');
  }

  return analysis;
}

async function examineScience(lesson: any, content: string, materials: string, analysis: LessonAnalysis) {
  // Safety protocols for experiments
  if (content.includes('experiment') || content.includes('investigation')) {
    if (!content.includes('safety') && !materials.includes('safety')) {
      analysis.safetyIssues.push('Missing safety protocols for experimental activities');
    }
  }

  // Age-appropriate materials
  if (materials.includes('chemical') || materials.includes('sharp') || materials.includes('hot')) {
    analysis.safetyIssues.push('Potentially unsafe materials for 6-year-olds');
  }

  // Inquiry-based learning
  if (!content.includes('observe') && !content.includes('predict') && !content.includes('investigate')) {
    analysis.qualityIssues.push('Missing inquiry-based learning approach');
  }

  // Science journal integration
  if (!content.includes('journal') && !content.includes('record')) {
    analysis.qualityIssues.push('Missing science journal integration');
  }

  // Outdoor exploration
  if (!content.includes('outdoor') && !content.includes('outside') && !content.includes('nature')) {
    analysis.qualityIssues.push('Limited outdoor exploration opportunities');
  }
}

async function examineSocialStudies(lesson: any, content: string, materials: string, analysis: LessonAnalysis) {
  // Local PEI/Mi'kmaq content
  if (!content.includes('pei') && !content.includes("mi'kmaq") && !content.includes('island')) {
    analysis.culturalIssues.push('Missing local PEI/Mi\'kmaq content integration');
  }

  // Identity and community focus appropriate for Grade 1
  if (!content.includes('family') && !content.includes('community') && !content.includes('belong')) {
    analysis.qualityIssues.push('Missing identity/community focus for Grade 1');
  }

  // Map/geography skills
  if (!content.includes('map') && !content.includes('location') && !content.includes('direction')) {
    analysis.qualityIssues.push('Missing age-appropriate geography skills');
  }

  // Family diversity representation
  if (content.includes('family') && !content.includes('different') && !content.includes('diverse')) {
    analysis.culturalIssues.push('Limited family diversity representation');
  }
}

async function examineArts(lesson: any, content: string, materials: string, analysis: LessonAnalysis) {
  // Fine motor development
  if (!content.includes('draw') && !content.includes('cut') && !content.includes('paint') && !content.includes('create')) {
    analysis.developmentalIssues.push('Missing fine motor development activities');
  }

  // Materials safety
  if (materials.includes('scissors') && !content.includes('safety')) {
    analysis.safetyIssues.push('Missing safety instructions for scissors use');
  }

  if (materials.includes('paint') && !materials.includes('non-toxic')) {
    analysis.safetyIssues.push('Need to specify non-toxic materials');
  }

  // Process over product
  if (content.includes('perfect') || content.includes('correct way') || content.includes('must look like')) {
    analysis.qualityIssues.push('Emphasizes product over process');
  }

  // Self-expression
  if (!content.includes('choice') && !content.includes('express') && !content.includes('feel')) {
    analysis.qualityIssues.push('Limited self-expression opportunities');
  }

  // Cultural art exploration
  if (!content.includes('culture') && !content.includes('tradition') && !content.includes('artist')) {
    analysis.qualityIssues.push('Missing cultural art exploration');
  }
}

async function examineFPSHealth(lesson: any, content: string, materials: string, analysis: LessonAnalysis) {
  // Social-emotional learning
  if (!content.includes('feeling') && !content.includes('emotion') && !content.includes('friend')) {
    analysis.qualityIssues.push('Missing social-emotional learning integration');
  }

  // Age-appropriate safety education
  if (content.includes('stranger danger') || content.includes('scary')) {
    analysis.safetyIssues.push('Potentially frightening content for Grade 1');
  }

  // Wellness and self-care
  if (!content.includes('healthy') && !content.includes('exercise') && !content.includes('rest')) {
    analysis.qualityIssues.push('Missing wellness/self-care focus');
  }

  // Friendship and conflict resolution
  if (!content.includes('share') && !content.includes('help') && !content.includes('solve')) {
    analysis.qualityIssues.push('Missing friendship/conflict resolution skills');
  }

  // Body awareness (age-appropriate)
  if (content.includes('body') && !content.includes('appropriate') && !content.includes('safe')) {
    analysis.safetyIssues.push('Need age-appropriate body awareness approach');
  }
}

async function quickSafetyAssessment(lesson: any, subject: string): Promise<string[]> {
  const safetyIssues: string[] = [];
  const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
  const materials = lesson.materialsNeeded?.toLowerCase() || '';

  // Universal safety checks
  if (materials.includes('sharp') || materials.includes('knife') || materials.includes('blade')) {
    safetyIssues.push('Sharp objects not appropriate for Grade 1');
  }

  if (materials.includes('chemical') || materials.includes('toxic')) {
    safetyIssues.push('Chemical materials unsafe for young children');
  }

  if (content.includes('experiment') && !content.includes('safety')) {
    safetyIssues.push('Experimental activity missing safety protocols');
  }

  return safetyIssues;
}

// Run the manual review
manualRotationReview()
  .catch((error) => {
    console.error('❌ Error in manual rotation review:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });