import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function queryEmilyScienceLRP() {
  console.log('🔬 COMPREHENSIVE QUERY: Emily McIsaac Sciences de la nature LRP (userId = 23)');
  console.log('===============================================================================\n');

  try {
    // Get the Sciences de la nature Long Range Plan for Emily McIsaac
    const scienceLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
        subject: 'Sciences de la nature'
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
            },
            resources: true,
            transferSkills: {
              include: {
                transferSkill: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        }
      }
    });

    if (!scienceLRP) {
      console.log('❌ NO SCIENCES DE LA NATURE LRP FOUND for Emily McIsaac (userId = 23)');
      return;
    }

    console.log('✅ SCIENCES DE LA NATURE LRP FOUND\n');

    // LRP Overview
    console.log('📋 LONG RANGE PLAN OVERVIEW:');
    console.log('=============================');
    console.log(`Title: ${scienceLRP.title}`);
    console.log(`Subject: ${scienceLRP.subject}`);
    console.log(`Grade: ${scienceLRP.grade}`);
    console.log(`Academic Year: ${scienceLRP.academicYear}`);
    console.log(`Created: ${scienceLRP.createdAt.toISOString().split('T')[0]}`);
    console.log(`Updated: ${scienceLRP.updatedAt.toISOString().split('T')[0]}\n`);

    // LRP Content Analysis
    console.log('📋 LRP CONTENT ANALYSIS:');
    console.log('=========================');
    console.log(`Description Length: ${scienceLRP.description?.length || 0} characters`);
    if (scienceLRP.description) {
      console.log(`Description Preview: "${scienceLRP.description.substring(0, 150)}..."`);
    } else {
      console.log('❌ Missing description');
    }

    if (scienceLRP.monthlyThemes) {
      console.log(`Monthly Themes: Present (${JSON.stringify(scienceLRP.monthlyThemes).length} chars)`);
    } else {
      console.log('❌ Missing monthly themes');
    }

    // Curriculum Expectations Analysis
    console.log('\n📚 CURRICULUM EXPECTATIONS ANALYSIS:');
    console.log('====================================');
    console.log(`Total Expectations: ${scienceLRP.expectations.length}`);
    
    const expectationsByStrand = scienceLRP.expectations.reduce((acc, exp) => {
      const strand = exp.expectation.strand;
      if (!acc[strand]) acc[strand] = 0;
      acc[strand]++;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(expectationsByStrand).forEach(([strand, count]) => {
      console.log(`  ${strand}: ${count} expectations`);
    });

    // Unit Plans Analysis
    console.log('\n📖 UNIT PLANS ANALYSIS:');
    console.log('=======================');
    console.log(`Total Unit Plans: ${scienceLRP.unitPlans.length}\n`);

    let totalLessons = 0;
    const unitAnalysis: Array<{
      title: string;
      duration: number;
      lessonCount: number;
      safetyIssues: string[];
      inquiryEvidence: string[];
      vocabularyAnalysis: string[];
    }> = [];

    scienceLRP.unitPlans.forEach((unit, index) => {
      const lessons = unit.lessonPlans;
      totalLessons += lessons.length;
      
      const startDate = new Date(unit.startDate);
      const endDate = new Date(unit.endDate);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`${index + 1}. "${unit.title}"`);
      console.log(`   📅 ${startDate.toISOString().split('T')[0]} → ${endDate.toISOString().split('T')[0]} (${durationDays} days)`);
      console.log(`   📝 ${lessons.length} lessons`);
      console.log(`   🎯 ${unit.expectations.length} curriculum expectations`);
      console.log(`   📚 ${unit.resources.length} resources`);
      console.log(`   🔄 ${unit.transferSkills.length} transfer skills`);

      // Safety Analysis
      const safetyIssues: string[] = [];
      const inquiryEvidence: string[] = [];
      const vocabularyAnalysis: string[] = [];

      lessons.forEach(lesson => {
        // Check for safety protocols
        const content = [lesson.mindsOn, lesson.action, lesson.consolidation, lesson.materials].join(' ').toLowerCase();
        
        if (content.includes('safety') || content.includes('sécurité')) {
          safetyIssues.push(`✅ Safety mentioned in "${lesson.title}"`);
        }

        // Check for inquiry-based elements
        if (content.includes('observe') || content.includes('investigation') || content.includes('explore') || 
            content.includes('observer') || content.includes('explorer') || content.includes('enquête')) {
          inquiryEvidence.push(`🔍 Inquiry elements in "${lesson.title}"`);
        }

        // Check for French vocabulary development
        if (content.includes('vocabulaire') || content.includes('vocabulary') || content.includes('mots')) {
          vocabularyAnalysis.push(`📝 Vocabulary development in "${lesson.title}"`);
        }
      });

      unitAnalysis.push({
        title: unit.title,
        duration: durationDays,
        lessonCount: lessons.length,
        safetyIssues,
        inquiryEvidence,
        vocabularyAnalysis
      });

      if (safetyIssues.length > 0) {
        console.log(`   🛡️  Safety: ${safetyIssues.length} lessons with safety protocols`);
      } else {
        console.log(`   ⚠️  Safety: No explicit safety protocols found`);
      }

      if (inquiryEvidence.length > 0) {
        console.log(`   🔬 Inquiry: ${inquiryEvidence.length} lessons with inquiry elements`);
      } else {
        console.log(`   ❌ Inquiry: Limited inquiry-based learning evident`);
      }

      console.log('');
    });

    // Overall Analysis Summary
    console.log('📊 OVERALL LRP ANALYSIS SUMMARY:');
    console.log('================================');
    console.log(`Total Lessons: ${totalLessons} (Target: 90 for rotation block)`);
    console.log(`Lesson Excess: ${totalLessons - 90} lessons over target`);
    console.log(`Reduction Needed: ${Math.round((totalLessons - 90) / totalLessons * 100)}%`);

    // Safety Analysis Summary
    const totalSafetyLessons = unitAnalysis.reduce((sum, unit) => sum + unit.safetyIssues.length, 0);
    const totalInquiryLessons = unitAnalysis.reduce((sum, unit) => sum + unit.inquiryEvidence.length, 0);
    const totalVocabularyLessons = unitAnalysis.reduce((sum, unit) => sum + unit.vocabularyAnalysis.length, 0);

    console.log(`\n🛡️  SAFETY READINESS: ${totalSafetyLessons}/${totalLessons} lessons (${Math.round(totalSafetyLessons/totalLessons*100)}%)`);
    console.log(`🔬 INQUIRY READINESS: ${totalInquiryLessons}/${totalLessons} lessons (${Math.round(totalInquiryLessons/totalLessons*100)}%)`);
    console.log(`📝 VOCABULARY INTEGRATION: ${totalVocabularyLessons}/${totalLessons} lessons (${Math.round(totalVocabularyLessons/totalLessons*100)}%)`);

    // Critical Issues Identification
    console.log(`\n⚠️  CRITICAL ISSUES IDENTIFIED:`);
    console.log(`==============================`);
    
    const issues: string[] = [];
    
    if (totalLessons > 90) {
      issues.push(`📏 OVER-PLANNED: ${totalLessons - 90} lessons must be removed for rotation schedule`);
    }
    
    if (totalSafetyLessons < totalLessons * 0.8) {
      issues.push(`🛡️  SAFETY GAPS: Only ${Math.round(totalSafetyLessons/totalLessons*100)}% of lessons have explicit safety protocols`);
    }
    
    if (totalInquiryLessons < totalLessons * 0.7) {
      issues.push(`🔬 INQUIRY DEFICIT: Only ${Math.round(totalInquiryLessons/totalLessons*100)}% of lessons show inquiry-based learning`);
    }

    if (!scienceLRP.description || scienceLRP.description.length < 200) {
      issues.push(`📝 WEAK DESCRIPTION: LRP description is insufficient for Grade 1 science`);
    }

    if (!scienceLRP.monthlyThemes) {
      issues.push(`📅 MISSING MONTHLY THEMES: No thematic organization for year-long planning`);
    }

    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });

    if (issues.length === 0) {
      console.log('✅ No critical issues identified - LRP appears pedagogically sound');
    }

    return {
      lrp: scienceLRP,
      unitAnalysis,
      totalLessons,
      safetyScore: Math.round(totalSafetyLessons/totalLessons*100),
      inquiryScore: Math.round(totalInquiryLessons/totalLessons*100),
      vocabularyScore: Math.round(totalVocabularyLessons/totalLessons*100),
      issues
    };

  } catch (error) {
    console.error('❌ ERROR querying Emily Science LRP:', error);
    throw error;
  }
}

// Run the comprehensive query
queryEmilyScienceLRP()
  .then((result) => {
    if (result) {
      console.log('\n✅ QUERY COMPLETED SUCCESSFULLY');
      console.log('===============================');
      console.log('Data ready for critical pedagogical review.');
    }
  })
  .catch((error) => {
    console.error('❌ FATAL ERROR:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });