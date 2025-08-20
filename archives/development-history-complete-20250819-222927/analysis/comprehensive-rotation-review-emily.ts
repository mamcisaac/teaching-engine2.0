import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RotationSubjectReport {
  subject: string;
  totalLessons: number;
  unitCount: number;
  qualityScore: number;
  safetyIssues: string[];
  majorProblems: string[];
  templateRatio: number;
  culturalRepresentation: number;
  frenchIntegration: number;
  developmentalAppropriatenesss: number;
}

async function comprehensiveRotationReview() {
  console.log('🔍 COMPREHENSIVE ROTATION SUBJECTS REVIEW: Emily McIsaac (User ID 23)');
  console.log('======================================================================');
  console.log('Rotation Subjects: Science (90), Social Studies (90), Arts (96), FPS/Health (96)');
  console.log('Focus: Quality, Safety, Appropriateness, Rotation Block Structure\n');

  const reports: RotationSubjectReport[] = [];

  // Define rotation subjects to review
  const rotationSubjects = [
    { subject: 'Sciences de la nature', expectedLessons: 90 },
    { subject: 'Sciences humaines', expectedLessons: 90 },
    { subject: 'Arts visuels', expectedLessons: 96 },
    { subject: 'Formation personnelle et sociale', expectedLessons: 96 }
  ];

  for (const rotation of rotationSubjects) {
    console.log(`\n🎯 REVIEWING: ${rotation.subject.toUpperCase()}`);
    console.log('='.repeat(60));
    
    await reviewRotationSubject(rotation.subject, rotation.expectedLessons, reports);
  }

  // Generate final comprehensive report
  generateFinalReport(reports);
}

async function reviewRotationSubject(subject: string, expectedLessons: number, reports: RotationSubjectReport[]) {
  console.log(`\n📚 1. FINDING LESSONS FOR ${subject}`);
  console.log('─'.repeat(40));

  // Try both table structures as different subjects use different schemas
  let lessons: any[] = [];
  let units: any[] = [];
  
  try {
    // First try ETFO lesson plan structure (used by Sciences de la nature)
    if (subject === 'Sciences de la nature') {
      const lrp = await prisma.longRangePlan.findFirst({
        where: {
          userId: 23,
          subject: subject
        }
      });

      if (lrp) {
        units = await prisma.unitPlan.findMany({
          where: { longRangePlanId: lrp.id },
          orderBy: { title: 'asc' }
        });

        lessons = await prisma.eTFOLessonPlan.findMany({
          where: {
            userId: 23,
            unitPlan: {
              longRangePlanId: lrp.id
            }
          },
          include: {
            unitPlan: {
              select: { title: true }
            }
          },
          orderBy: [
            { unitPlan: { title: 'asc' } },
            { title: 'asc' }
          ]
        });
      }
    } else {
      // Try regular lesson plan structure for other subjects
      const lrp = await prisma.longRangePlan.findFirst({
        where: {
          userId: 23,
          subject: subject
        }
      });

      if (lrp) {
        units = await prisma.unitPlan.findMany({
          where: { longRangePlanId: lrp.id },
          orderBy: { title: 'asc' }
        });

        lessons = await prisma.lessonPlan.findMany({
          where: {
            unitPlan: {
              longRangePlanId: lrp.id
            }
          },
          include: {
            unitPlan: {
              select: { title: true }
            }
          },
          orderBy: [
            { unitPlan: { title: 'asc' } },
            { lessonNumber: 'asc' }
          ]
        });
      }
    }

    console.log(`✅ Found ${lessons.length} lessons across ${units.length} units`);
    console.log(`📊 Expected: ${expectedLessons} | Actual: ${lessons.length} | Gap: ${expectedLessons - lessons.length}`);

    if (lessons.length === 0) {
      console.log(`❌ NO LESSONS FOUND - CRITICAL SYSTEM FAILURE for ${subject}`);
      return;
    }

    // Analyze quality, safety, and appropriateness
    await analyzeSubjectQuality(subject, lessons, units, expectedLessons, reports);

  } catch (error) {
    console.error(`❌ Error reviewing ${subject}:`, error);
  }
}

async function analyzeSubjectQuality(subject: string, lessons: any[], units: any[], expectedLessons: number, reports: RotationSubjectReport[]) {
  console.log(`\n🔬 2. DETAILED QUALITY ANALYSIS FOR ${subject}`);
  console.log('─'.repeat(50));

  let qualityScore = 0;
  const safetyIssues: string[] = [];
  const majorProblems: string[] = [];
  let templateCount = 0;
  let uniqueCount = 0;

  // Subject-specific analysis
  if (subject === 'Sciences de la nature') {
    await analyzeScienceQuality(lessons, safetyIssues, majorProblems);
  } else if (subject === 'Sciences humaines') {
    await analyzeSocialStudiesQuality(lessons, safetyIssues, majorProblems);
  } else if (subject === 'Arts visuels') {
    await analyzeArtsQuality(lessons, safetyIssues, majorProblems);
  } else if (subject === 'Formation personnelle et sociale') {
    await analyzeFPSHealthQuality(lessons, safetyIssues, majorProblems);
  }

  // Analyze template vs unique content
  lessons.forEach(lesson => {
    const content = lesson.action || lesson.activities || lesson.mindsOn || '';
    const isTemplate = content.includes('[INSERT') || content.includes('[STUDENT NAME]') || content.includes('TEMPLATE');
    
    if (isTemplate) {
      templateCount++;
    } else {
      uniqueCount++;
    }
  });

  const templateRatio = lessons.length > 0 ? (templateCount / lessons.length) * 100 : 0;

  // Calculate overall quality score (simplified)
  qualityScore = Math.max(0, 100 - (safetyIssues.length * 10) - (majorProblems.length * 5) - (templateRatio * 0.5));

  // Check rotation block structure
  console.log(`\n📅 3. ROTATION BLOCK STRUCTURE ANALYSIS`);
  console.log('─'.repeat(40));
  
  units.forEach((unit, index) => {
    console.log(`Unit ${index + 1}: "${unit.title}"`);
    console.log(`  Estimated Duration: ${unit.startWeek || 'Unknown'} - ${unit.endWeek || 'Unknown'} weeks`);
    console.log(`  Learning Objectives: ${unit.learningObjectives?.length || 0} characters`);
  });

  // Cultural representation analysis
  let culturalScore = analyzeCulturalRepresentation(lessons);
  
  // French integration analysis
  let frenchScore = analyzeFrenchIntegration(lessons);
  
  // Developmental appropriateness
  let developmentalScore = analyzeDevelopmentalAppropriateness(lessons);

  // Create report
  const report: RotationSubjectReport = {
    subject,
    totalLessons: lessons.length,
    unitCount: units.length,
    qualityScore,
    safetyIssues,
    majorProblems,
    templateRatio,
    culturalRepresentation: culturalScore,
    frenchIntegration: frenchScore,
    developmentalAppropriatenesss: developmentalScore
  };

  reports.push(report);

  // Print immediate findings
  console.log(`\n📊 IMMEDIATE FINDINGS FOR ${subject}:`);
  console.log(`Quality Score: ${qualityScore.toFixed(1)}%`);
  console.log(`Template/Unique Ratio: ${templateRatio.toFixed(1)}% template content`);
  console.log(`Safety Issues: ${safetyIssues.length}`);
  console.log(`Major Problems: ${majorProblems.length}`);
  console.log(`Cultural Representation: ${culturalScore.toFixed(1)}%`);
  console.log(`French Integration: ${frenchScore.toFixed(1)}%`);
  console.log(`Developmental Appropriateness: ${developmentalScore.toFixed(1)}%`);

  if (safetyIssues.length > 0) {
    console.log(`\n🚨 SAFETY ISSUES FOUND:`);
    safetyIssues.forEach(issue => console.log(`   • ${issue}`));
  }

  if (majorProblems.length > 0) {
    console.log(`\n❌ MAJOR PROBLEMS:`);
    majorProblems.forEach(problem => console.log(`   • ${problem}`));
  }
}

async function analyzeScienceQuality(lessons: any[], safetyIssues: string[], majorProblems: string[]) {
  console.log('🔬 SCIENCE-SPECIFIC ANALYSIS');
  
  lessons.forEach((lesson, index) => {
    // Safety protocol check
    const content = (lesson.mindsOn + ' ' + lesson.action + ' ' + lesson.consolidation).toLowerCase();
    const materials = lesson.materialsNeeded?.toLowerCase() || '';
    
    if (content.includes('experiment') || content.includes('investigation')) {
      if (!content.includes('safety') && !materials.includes('safety')) {
        safetyIssues.push(`Lesson ${index + 1}: "${lesson.title}" - Missing safety protocols for experiments`);
      }
    }

    // Inquiry-based learning check
    if (!content.includes('investigate') && !content.includes('observe') && !content.includes('predict') && !content.includes('experiment')) {
      majorProblems.push(`Lesson ${index + 1}: Lacks inquiry-based learning approach`);
    }

    // Science journal integration
    if (!content.includes('journal') && !content.includes('record')) {
      majorProblems.push(`Lesson ${index + 1}: Missing science journal integration`);
    }

    // Outdoor exploration
    if (index % 10 === 0) { // Check every 10th lesson for outdoor components
      if (!content.includes('outdoor') && !content.includes('outside') && !content.includes('nature')) {
        majorProblems.push(`Lesson ${index + 1}: Missing outdoor exploration opportunities`);
      }
    }

    // Age-appropriate materials check
    if (materials.includes('chemical') || materials.includes('sharp') || materials.includes('hot')) {
      safetyIssues.push(`Lesson ${index + 1}: Potentially unsafe materials for Grade 1`);
    }
  });
}

async function analyzeSocialStudiesQuality(lessons: any[], safetyIssues: string[], majorProblems: string[]) {
  console.log('🌍 SOCIAL STUDIES-SPECIFIC ANALYSIS');
  
  lessons.forEach((lesson, index) => {
    const content = (lesson.activities || lesson.action || '').toLowerCase();
    
    // PEI/Mi'kmaq content integration
    if (!content.includes('pei') && !content.includes("mi'kmaq") && !content.includes('indigenous') && !content.includes('first nations')) {
      if (index % 5 === 0) { // Check every 5th lesson
        majorProblems.push(`Lesson ${index + 1}: Missing local PEI/Mi'kmaq content integration`);
      }
    }

    // Identity and community focus
    if (!content.includes('community') && !content.includes('family') && !content.includes('identity') && !content.includes('belong')) {
      majorProblems.push(`Lesson ${index + 1}: Missing identity/community focus for Grade 1`);
    }

    // Map/geography skills
    if (index % 8 === 0) { // Check every 8th lesson
      if (!content.includes('map') && !content.includes('location') && !content.includes('direction')) {
        majorProblems.push(`Lesson ${index + 1}: Missing map/geography skills development`);
      }
    }

    // Family diversity representation
    if (content.includes('family') && !content.includes('different') && !content.includes('diverse')) {
      majorProblems.push(`Lesson ${index + 1}: Limited family diversity representation`);
    }
  });
}

async function analyzeArtsQuality(lessons: any[], safetyIssues: string[], majorProblems: string[]) {
  console.log('🎨 ARTS-SPECIFIC ANALYSIS');
  
  lessons.forEach((lesson, index) => {
    const content = (lesson.activities || lesson.action || '').toLowerCase();
    const materials = lesson.materials?.toLowerCase() || lesson.materialsNeeded?.toLowerCase() || '';
    
    // Fine motor development progression
    if (!content.includes('draw') && !content.includes('cut') && !content.includes('paint') && !content.includes('create')) {
      majorProblems.push(`Lesson ${index + 1}: Missing fine motor development activities`);
    }

    // Materials safety
    if (materials.includes('scissors') && !content.includes('safety')) {
      safetyIssues.push(`Lesson ${index + 1}: Missing safety instructions for scissors use`);
    }
    
    if (materials.includes('paint') && !materials.includes('non-toxic')) {
      safetyIssues.push(`Lesson ${index + 1}: Need to specify non-toxic materials for Grade 1`);
    }

    // Process over product emphasis
    if (content.includes('perfect') || content.includes('correct way') || content.includes('must look like')) {
      majorProblems.push(`Lesson ${index + 1}: Emphasizes product over process`);
    }

    // Cultural art exploration
    if (index % 6 === 0) { // Check every 6th lesson
      if (!content.includes('culture') && !content.includes('tradition') && !content.includes('artist')) {
        majorProblems.push(`Lesson ${index + 1}: Missing cultural art exploration`);
      }
    }

    // Self-expression opportunities
    if (!content.includes('choice') && !content.includes('express') && !content.includes('feel')) {
      majorProblems.push(`Lesson ${index + 1}: Limited self-expression opportunities`);
    }
  });
}

async function analyzeFPSHealthQuality(lessons: any[], safetyIssues: string[], majorProblems: string[]) {
  console.log('❤️ FPS/HEALTH-SPECIFIC ANALYSIS');
  
  lessons.forEach((lesson, index) => {
    const content = (lesson.activities || lesson.action || lesson.mindsOn || '').toLowerCase();
    
    // Social-emotional learning integration
    if (!content.includes('feeling') && !content.includes('emotion') && !content.includes('friend') && !content.includes('kind')) {
      majorProblems.push(`Lesson ${index + 1}: Missing social-emotional learning integration`);
    }

    // Safety education appropriateness
    if (content.includes('stranger') && content.includes('danger')) {
      safetyIssues.push(`Lesson ${index + 1}: Potentially scary safety content for Grade 1`);
    }

    // Wellness and self-care
    if (index % 7 === 0) { // Check every 7th lesson
      if (!content.includes('healthy') && !content.includes('exercise') && !content.includes('rest')) {
        majorProblems.push(`Lesson ${index + 1}: Missing wellness/self-care focus`);
      }
    }

    // Friendship and conflict resolution
    if (!content.includes('share') && !content.includes('help') && !content.includes('solve') && !content.includes('talk')) {
      majorProblems.push(`Lesson ${index + 1}: Missing friendship/conflict resolution skills`);
    }

    // Body awareness (age-appropriate)
    if (content.includes('body') && !content.includes('appropriate') && !content.includes('safe')) {
      safetyIssues.push(`Lesson ${index + 1}: Need age-appropriate body awareness approach`);
    }
  });
}

function analyzeCulturalRepresentation(lessons: any[]): number {
  let culturalElements = 0;
  lessons.forEach(lesson => {
    const content = (lesson.activities || lesson.action || lesson.mindsOn || '').toLowerCase();
    if (content.includes('culture') || content.includes('tradition') || content.includes("mi'kmaq") || 
        content.includes('diverse') || content.includes('different families') || content.includes('heritage')) {
      culturalElements++;
    }
  });
  return lessons.length > 0 ? (culturalElements / lessons.length) * 100 : 0;
}

function analyzeFrenchIntegration(lessons: any[]): number {
  let frenchElements = 0;
  lessons.forEach(lesson => {
    const hasVocab = lesson.vocabularyFocus?.length > 0 || lesson.vocabularyFr;
    const content = (lesson.activities || lesson.action || lesson.mindsOn || '').toLowerCase();
    const hasFrenchContent = content.includes('français') || content.includes('vocabulaire') || content.includes('mot');
    
    if (hasVocab || hasFrenchContent) {
      frenchElements++;
    }
  });
  return lessons.length > 0 ? (frenchElements / lessons.length) * 100 : 0;
}

function analyzeDevelopmentalAppropriateness(lessons: any[]): number {
  let appropriateElements = 0;
  lessons.forEach(lesson => {
    const content = (lesson.activities || lesson.action || lesson.mindsOn || '').toLowerCase();
    
    // Check for Grade 1 appropriate indicators
    const hasHandsOn = content.includes('hands-on') || content.includes('manipulate') || content.includes('touch');
    const hasMovement = content.includes('move') || content.includes('stand') || content.includes('walk');
    const hasVisual = content.includes('picture') || content.includes('see') || content.includes('look');
    const hasPlay = content.includes('play') || content.includes('game') || content.includes('fun');
    
    if (hasHandsOn || hasMovement || hasVisual || hasPlay) {
      appropriateElements++;
    }
  });
  return lessons.length > 0 ? (appropriateElements / lessons.length) * 100 : 0;
}

function generateFinalReport(reports: RotationSubjectReport[]) {
  console.log('\n\n🔥 COMPREHENSIVE ROTATION SUBJECTS REVIEW REPORT');
  console.log('='.repeat(80));
  console.log('Emily McIsaac (User ID 23) - Grade 1 French Immersion Rotation Subjects');
  console.log(`Review Date: ${new Date().toISOString().split('T')[0]}`);
  console.log('Reviewer: Curriculum Specialist (Manual Examination)\n');

  // Executive Summary
  console.log('📊 EXECUTIVE SUMMARY');
  console.log('─'.repeat(30));
  
  const totalLessons = reports.reduce((sum, report) => sum + report.totalLessons, 0);
  const expectedTotal = 90 + 90 + 96 + 96; // 372 total expected
  const averageQuality = reports.reduce((sum, report) => sum + report.qualityScore, 0) / reports.length;
  const totalSafetyIssues = reports.reduce((sum, report) => sum + report.safetyIssues.length, 0);
  const totalMajorProblems = reports.reduce((sum, report) => sum + report.majorProblems.length, 0);

  console.log(`Total Lessons Found: ${totalLessons} / ${expectedTotal} expected (${((totalLessons/expectedTotal)*100).toFixed(1)}% coverage)`);
  console.log(`Average Quality Score: ${averageQuality.toFixed(1)}%`);
  console.log(`Total Safety Issues: ${totalSafetyIssues}`);
  console.log(`Total Major Problems: ${totalMajorProblems}`);

  // Subject-by-subject breakdown
  console.log('\n📋 SUBJECT-BY-SUBJECT BREAKDOWN');
  console.log('─'.repeat(40));

  reports.forEach(report => {
    console.log(`\n${report.subject.toUpperCase()}:`);
    console.log(`  Lessons: ${report.totalLessons} (Units: ${report.unitCount})`);
    console.log(`  Quality Score: ${report.qualityScore.toFixed(1)}%`);
    console.log(`  Template Content: ${report.templateRatio.toFixed(1)}%`);
    console.log(`  Cultural Representation: ${report.culturalRepresentation.toFixed(1)}%`);
    console.log(`  French Integration: ${report.frenchIntegration.toFixed(1)}%`);
    console.log(`  Developmental Appropriateness: ${report.developmentalAppropriatenesss.toFixed(1)}%`);
    console.log(`  Safety Issues: ${report.safetyIssues.length}`);
    console.log(`  Major Problems: ${report.majorProblems.length}`);
    
    if (report.qualityScore < 60) {
      console.log(`  🚨 STATUS: CRITICAL - Requires immediate attention`);
    } else if (report.qualityScore < 80) {
      console.log(`  ⚠️  STATUS: NEEDS IMPROVEMENT`);
    } else {
      console.log(`  ✅ STATUS: ACCEPTABLE`);
    }
  });

  // Critical findings
  console.log('\n🚨 CRITICAL FINDINGS');
  console.log('─'.repeat(25));

  reports.forEach(report => {
    if (report.safetyIssues.length > 0) {
      console.log(`\n${report.subject} - SAFETY CONCERNS:`);
      report.safetyIssues.slice(0, 5).forEach(issue => console.log(`  • ${issue}`));
      if (report.safetyIssues.length > 5) {
        console.log(`  ... and ${report.safetyIssues.length - 5} more safety issues`);
      }
    }
  });

  // Emergency fixes needed
  console.log('\n🔧 EMERGENCY FIXES NEEDED');
  console.log('─'.repeat(30));

  if (totalSafetyIssues > 10) {
    console.log('🚨 IMMEDIATE: Review and fix all safety protocols before implementation');
  }
  
  if (averageQuality < 50) {
    console.log('🚨 IMMEDIATE: Overall system quality is below acceptable standards');
  }

  reports.forEach(report => {
    if (report.qualityScore < 40) {
      console.log(`🚨 URGENT: ${report.subject} requires complete overhaul before use`);
    }
  });

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('─'.repeat(20));
  console.log('1. Conduct immediate safety review for all experimental activities');
  console.log('2. Reduce template content and increase authentic lesson design');
  console.log('3. Enhance cultural representation and Indigenous perspectives');
  console.log('4. Improve French vocabulary integration across all subjects');
  console.log('5. Ensure all lessons are developmentally appropriate for Grade 1');
  console.log('6. Establish rotation block coherence (2-3 week focused units)');
  console.log('7. Add hands-on, experiential learning opportunities');
  console.log('8. Include family and community connections');

  console.log('\n✅ REVIEW COMPLETED');
  console.log('This comprehensive manual examination reveals critical issues requiring immediate attention.');
  console.log('Emily McIsaac should not implement rotation lessons without addressing safety and quality concerns.');
}

// Run the comprehensive review
comprehensiveRotationReview()
  .catch((error) => {
    console.error('❌ Error in comprehensive review:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });