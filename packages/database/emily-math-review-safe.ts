import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Safe JSON parser
function safeJsonParse(text: any, fallback: any = []): any {
  if (!text) return fallback;
  if (typeof text !== 'string') return fallback;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log(`   ⚠️  JSON parse error for: ${text.substring(0, 50)}...`);
    return fallback;
  }
}

async function reviewEmilyMathLessons() {
  console.log('📊 CRITICAL MATH REVIEW: Emily McIsaac (ID 23) - 186 Math Lessons Analysis\n');

  // Get all math data for Emily
  const mathData = await prisma.longRangePlan.findFirst({
    where: {
      userId: 23,
      subject: 'Mathématiques'
    },
    include: {
      expectations: {
        include: {
          expectation: true
        }
      },
      unitPlans: {
        include: {
          expectations: {
            include: {
              expectation: true
            }
          },
          lessonPlans: {
            include: {
              expectations: {
                include: {
                  expectation: true
                }
              }
            },
            orderBy: {
              date: 'asc'
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      }
    }
  });

  if (!mathData) {
    console.log('❌ No Math Long Range Plan found for Emily McIsaac');
    return;
  }

  console.log('📊 MATH SYSTEM OVERVIEW:');
  console.log('=========================');
  console.log(`Long Range Plan: ${mathData.title}`);
  console.log(`Academic Year: ${mathData.academicYear}`);
  console.log(`Subject: ${mathData.subject} - Grade ${mathData.grade}`);
  console.log(`Total Units: ${mathData.unitPlans.length}`);
  
  const allLessons = mathData.unitPlans.flatMap(unit => unit.lessonPlans);
  console.log(`Total Lessons: ${allLessons.length} (expecting 186)\n`);

  // Unit Analysis
  console.log('📚 UNIT-BY-UNIT ANALYSIS:');
  console.log('==========================\n');
  
  let totalMathHours = 0;
  let totalConcreteLessons = 0;
  let totalManipulativeLessons = 0;
  let totalFrenchIntegrated = 0;
  let etfoCompliantLessons = 0;
  let progressiveLessons = 0;
  let assessmentIssues = 0;
  let durationIssues = 0;
  let developmentalIssues = 0;

  for (const [index, unit] of mathData.unitPlans.entries()) {
    console.log(`${index + 1}. UNIT: ${unit.title}`);
    console.log(`   📅 Duration: ${unit.startDate.toISOString().split('T')[0]} to ${unit.endDate.toISOString().split('T')[0]}`);
    console.log(`   📝 Lessons: ${unit.lessonPlans.length}`);
    console.log(`   ⏰ Estimated Hours: ${unit.estimatedHours}`);
    console.log(`   🎯 Curriculum Expectations: ${unit.expectations.length}`);

    totalMathHours += unit.estimatedHours || 0;

    // Essential Questions Analysis
    const essentialQuestions = safeJsonParse(unit.essentialQuestions as any);
    console.log(`   ❓ Essential Questions: ${Array.isArray(essentialQuestions) ? essentialQuestions.length : 'Invalid format'}`);

    // Big Ideas Analysis
    if (!unit.bigIdeas || unit.bigIdeas.length < 50) {
      console.log(`   ❌ Weak Big Ideas (${unit.bigIdeas?.length || 0} chars)`);
    }

    // Assessment Plan Analysis
    if (!unit.assessmentPlan || unit.assessmentPlan.length < 100) {
      console.log(`   ❌ Inadequate Assessment Plan (${unit.assessmentPlan?.length || 0} chars)`);
    }

    // Lesson Analysis for this unit
    for (const lesson of unit.lessonPlans) {
      // Duration check (should be 45 minutes for Grade 1 Math)
      if (lesson.duration !== 45) {
        durationIssues++;
      }

      // ETFO Structure Check (Minds On/Action/Consolidation with timing)
      const hasMindsOn = lesson.mindsOn && lesson.mindsOn.includes('8 minute');
      const hasAction = lesson.action && lesson.action.includes('27 minute');
      const hasConsolidation = lesson.consolidation && lesson.consolidation.includes('10 minute');
      
      if (hasMindsOn && hasAction && hasConsolidation) {
        etfoCompliantLessons++;
      }

      // Concrete-Pictorial-Abstract Progression Check
      const content = `${lesson.mindsOn || ''} ${lesson.action || ''} ${lesson.consolidation || ''}`.toLowerCase();
      if (content.includes('concrete') || content.includes('manipulative') || content.includes('hands-on')) {
        totalConcreteLessons++;
      }

      // Manipulatives Check
      const materials = lesson.materials ? JSON.stringify(lesson.materials).toLowerCase() : '';
      if (materials.includes('manipulative') || content.includes('manipulative') || 
          materials.includes('counters') || materials.includes('blocks') ||
          materials.includes('cubes') || materials.includes('bears')) {
        totalManipulativeLessons++;
      }

      // French Integration Check
      if (lesson.titleFr && lesson.titleFr.length > 0) {
        totalFrenchIntegrated++;
      }

      // Progressive Development Check (builds on previous concepts)
      if (content.includes('review') || content.includes('build on') || content.includes('extend')) {
        progressiveLessons++;
      }

      // Assessment Check (should use observation, not tests for Grade 1)
      if (!lesson.assessmentNotes || lesson.assessmentNotes.includes('test') || lesson.assessmentNotes.includes('quiz')) {
        assessmentIssues++;
      }

      // Developmental Appropriateness Check
      if (content.includes('multiplication') || content.includes('division') || 
          content.includes('fraction') || content.includes('decimal')) {
        developmentalIssues++;
      }
    }

    console.log('');
  }

  // Overall Quality Assessment
  console.log('🔍 PEDAGOGICAL QUALITY ANALYSIS:');
  console.log('=================================\n');

  console.log(`📊 TIMING & STRUCTURE:`);
  console.log(`Total Math Hours: ${totalMathHours} hours`);
  console.log(`ETFO Compliant Lessons: ${etfoCompliantLessons}/${allLessons.length} (${Math.round(etfoCompliantLessons/allLessons.length*100)}%)`);
  console.log(`Correct Duration (45 min): ${allLessons.length - durationIssues}/${allLessons.length} (${Math.round((allLessons.length - durationIssues)/allLessons.length*100)}%)`);

  console.log(`\n🧠 GRADE 1 APPROPRIATENESS:`);
  console.log(`Concrete Learning Lessons: ${totalConcreteLessons}/${allLessons.length} (${Math.round(totalConcreteLessons/allLessons.length*100)}%)`);
  console.log(`Manipulatives Used: ${totalManipulativeLessons}/${allLessons.length} (${Math.round(totalManipulativeLessons/allLessons.length*100)}%)`);
  console.log(`Progressive Development: ${progressiveLessons}/${allLessons.length} (${Math.round(progressiveLessons/allLessons.length*100)}%)`);
  console.log(`Developmentally Inappropriate: ${developmentalIssues} lessons (should be 0)`);

  console.log(`\n🇫🇷 FRENCH IMMERSION:`);
  console.log(`French Titles: ${totalFrenchIntegrated}/${allLessons.length} (${Math.round(totalFrenchIntegrated/allLessons.length*100)}%)`);

  console.log(`\n📋 ASSESSMENT:`);
  console.log(`Assessment Issues: ${assessmentIssues} lessons`);

  // Detailed Analysis of Sample Lessons
  console.log('\n📝 DETAILED SAMPLE LESSON ANALYSIS:');
  console.log('====================================\n');

  if (allLessons.length > 0) {
    // Analyze first lesson from each unit
    for (let i = 0; i < Math.min(3, mathData.unitPlans.length); i++) {
      const unit = mathData.unitPlans[i];
      if (unit.lessonPlans.length > 0) {
        const lesson = unit.lessonPlans[0];
        console.log(`LESSON SAMPLE ${i + 1}: ${lesson.title}`);
        console.log(`Unit: ${unit.title}`);
        console.log(`Date: ${lesson.date.toISOString().split('T')[0]}`);
        console.log(`Duration: ${lesson.duration} minutes`);
        
        console.log(`\nETFO Structure:`);
        console.log(`- Minds On: ${lesson.mindsOn ? lesson.mindsOn.substring(0, 100) + '...' : 'Missing'}`);
        console.log(`- Action: ${lesson.action ? lesson.action.substring(0, 100) + '...' : 'Missing'}`);
        console.log(`- Consolidation: ${lesson.consolidation ? lesson.consolidation.substring(0, 100) + '...' : 'Missing'}`);
        
        const materials = lesson.materials ? JSON.stringify(lesson.materials) : null;
        console.log(`\nMaterials: ${materials ? materials.substring(0, 100) + '...' : 'Not specified'}`);
        
        console.log(`Learning Goals: ${lesson.learningGoals ? lesson.learningGoals.substring(0, 100) + '...' : 'Missing'}`);
        console.log(`French Title: ${lesson.titleFr || 'Missing'}`);
        console.log(`Assessment: ${lesson.assessmentNotes ? lesson.assessmentNotes.substring(0, 100) + '...' : 'Missing'}`);
        console.log('');
      }
    }
  }

  // Critical Issues Summary
  console.log('🚨 CRITICAL ISSUES SUMMARY:');
  console.log('============================\n');

  const issues = [];
  
  if (allLessons.length !== 186) {
    issues.push(`❌ Lesson count mismatch: ${allLessons.length} vs expected 186`);
  }
  
  if (etfoCompliantLessons < allLessons.length * 0.9) {
    issues.push(`❌ Poor ETFO compliance: ${Math.round(etfoCompliantLessons/allLessons.length*100)}% (should be >90%)`);
  }
  
  if (totalConcreteLessons < allLessons.length * 0.8) {
    issues.push(`❌ Insufficient concrete learning: ${Math.round(totalConcreteLessons/allLessons.length*100)}% (should be >80% for Grade 1)`);
  }
  
  if (totalManipulativeLessons < allLessons.length * 0.7) {
    issues.push(`❌ Insufficient manipulatives: ${Math.round(totalManipulativeLessons/allLessons.length*100)}% (should be >70% for Grade 1)`);
  }
  
  if (totalFrenchIntegrated < allLessons.length * 0.9) {
    issues.push(`❌ Poor French integration: ${Math.round(totalFrenchIntegrated/allLessons.length*100)}% (should be >90% for immersion)`);
  }
  
  if (developmentalIssues > 0) {
    issues.push(`❌ ${developmentalIssues} lessons contain age-inappropriate content`);
  }
  
  if (durationIssues > allLessons.length * 0.1) {
    issues.push(`❌ ${durationIssues} lessons have incorrect duration (should be 45 min)`);
  }

  if (issues.length === 0) {
    console.log('✅ NO CRITICAL ISSUES FOUND - Excellent math program!');
  } else {
    console.log(`Found ${issues.length} critical issues:`);
    issues.forEach(issue => console.log(issue));
  }

  // Final Quality Rating
  console.log('\n⭐ OVERALL QUALITY RATING:');
  console.log('===========================');
  
  const qualityScore = (
    (etfoCompliantLessons / allLessons.length) * 25 +
    (totalConcreteLessons / allLessons.length) * 25 +
    (totalManipulativeLessons / allLessons.length) * 20 +
    (totalFrenchIntegrated / allLessons.length) * 20 +
    ((allLessons.length - developmentalIssues) / allLessons.length) * 10
  );

  console.log(`Quality Score: ${Math.round(qualityScore)}%`);
  
  if (qualityScore >= 90) {
    console.log('🟢 EXCELLENT - Outstanding math program');
  } else if (qualityScore >= 75) {
    console.log('🟡 GOOD - Solid with room for improvement');
  } else if (qualityScore >= 60) {
    console.log('🟠 FAIR - Needs significant improvement');
  } else {
    console.log('🔴 POOR - Major issues requiring immediate attention');
  }

  console.log('\n📋 PRIORITY FIXES NEEDED:');
  console.log('==========================');
  
  if (totalConcreteLessons < allLessons.length * 0.8) {
    console.log('🔥 HIGH PRIORITY: Add more concrete manipulative activities');
  }
  
  if (totalFrenchIntegrated < allLessons.length * 0.9) {
    console.log('🔥 HIGH PRIORITY: Improve French mathematical vocabulary integration');
  }
  
  if (etfoCompliantLessons < allLessons.length * 0.9) {
    console.log('🔥 HIGH PRIORITY: Fix ETFO timing structure (8-27-10 minutes)');
  }
  
  if (developmentalIssues > 0) {
    console.log('🔥 CRITICAL: Remove age-inappropriate content immediately');
  }
}

// Run the review
reviewEmilyMathLessons()
  .catch((error) => {
    console.error('❌ Error in math review:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });