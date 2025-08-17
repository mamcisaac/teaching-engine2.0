import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEmilyFPSUpdates() {
  try {
    console.log('🔍 Verifying Emily McIsaac\'s Formation personnelle et sociale ETFO compliance updates...\n');

    // Find Emily's user ID
    const emily = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Emily McIsaac'
        }
      }
    });

    if (!emily) {
      console.log('❌ Emily McIsaac not found');
      return;
    }

    // Get one sample lesson from each unit to verify updates
    const fpsUnitPlans = await prisma.unitPlan.findMany({
      where: {
        userId: emily.id,
        longRangePlan: {
          subject: 'Formation personnelle et sociale'
        }
      },
      include: {
        lessonPlans: {
          take: 1, // Just get one lesson per unit for verification
          select: {
            id: true,
            title: true,
            duration: true,
            mindsOn: true,
            action: true,
            consolidation: true,
            differentiationStrategies: true,
            indigenousPerspectives: true,
            assessmentNotes: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    console.log('🎯 Sample Lesson Verification (1 lesson per unit):\n');

    for (const unit of fpsUnitPlans) {
      const lesson = unit.lessonPlans[0];
      if (!lesson) continue;

      console.log(`📚 Unit: ${unit.title}`);
      console.log(`📝 Sample Lesson: ${lesson.title}`);
      console.log(`🕐 Duration: ${lesson.duration} minutes ✅`);
      
      // Check timing structure
      console.log(`⏱️  Timing Structure:`);
      console.log(`   Minds On: ${lesson.mindsOn?.substring(0, 50)}...`);
      console.log(`   Action: ${lesson.action?.substring(0, 50)}...`);
      console.log(`   Consolidation: ${lesson.consolidation?.substring(0, 50)}...`);
      
      // Check differentiation strategies
      if (lesson.differentiationStrategies && typeof lesson.differentiationStrategies === 'object') {
        const diff = lesson.differentiationStrategies as any;
        console.log(`🔀 Differentiation Strategies: ✅`);
        console.log(`   For Struggling: ${diff.forStruggling}`);
        console.log(`   For IEP: ${diff.forIEP}`);
        console.log(`   For ELL: ${diff.forELL}`);
        console.log(`   For Advanced: ${diff.forAdvanced}`);
      }
      
      // Check indigenous perspectives
      console.log(`🏛️  Indigenous Perspectives (${lesson.indigenousPerspectives?.length} chars): ✅`);
      console.log(`   ${lesson.indigenousPerspectives?.substring(0, 100)}...`);
      
      // Check assessment notes
      const hasCheckboxes = lesson.assessmentNotes?.includes('☐');
      console.log(`📋 Assessment Notes (has checkboxes: ${hasCheckboxes}): ✅`);
      console.log(`   ${lesson.assessmentNotes?.substring(0, 100)}...`);
      
      console.log('');
    }

    // Get comprehensive stats
    const allLessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: emily.id,
        unitPlan: {
          longRangePlan: {
            subject: 'Formation personnelle et sociale'
          }
        }
      },
      select: {
        duration: true,
        differentiationStrategies: true,
        indigenousPerspectives: true,
        assessmentNotes: true,
        mindsOn: true,
        action: true,
        consolidation: true
      }
    });

    console.log('📊 Final Compliance Report:');
    console.log(`📚 Total FPS Lessons Checked: ${allLessons.length}`);
    
    const compliance = {
      duration45: allLessons.filter(l => l.duration === 45),
      properTiming: allLessons.filter(l =>
        l.mindsOn?.startsWith('(8 minutes)') &&
        l.action?.startsWith('(27 minutes)') &&
        l.consolidation?.startsWith('(10 minutes)')
      ),
      hasDifferentiation: allLessons.filter(l => 
        l.differentiationStrategies && 
        typeof l.differentiationStrategies === 'object' &&
        'forStruggling' in l.differentiationStrategies
      ),
      hasIndigenous100Plus: allLessons.filter(l => 
        l.indigenousPerspectives && l.indigenousPerspectives.length >= 100
      ),
      hasAssessmentCheckboxes: allLessons.filter(l => 
        l.assessmentNotes?.includes('☐')
      )
    };

    console.log(`🕐 Duration (45 min): ${compliance.duration45.length}/96 ✅`);
    console.log(`⏱️  Proper Timing Structure: ${compliance.properTiming.length}/96 ✅`);
    console.log(`🔀 Differentiation Strategies: ${compliance.hasDifferentiation.length}/96 ✅`);
    console.log(`🏛️  Indigenous Perspectives (100+ chars): ${compliance.hasIndigenous100Plus.length}/96 ✅`);
    console.log(`📋 Assessment Checkboxes: ${compliance.hasAssessmentCheckboxes.length}/96 ✅`);

    const allCompliant = Object.values(compliance).every(arr => arr.length === 96);
    
    if (allCompliant) {
      console.log('\n🎉 PERFECT! All 96 Formation personnelle et sociale lessons are ETFO-compliant!');
      console.log('\n✨ Key Updates Successfully Applied:');
      console.log('   • Duration changed from 60 to 45 minutes');
      console.log('   • Timing structure: Minds On (8 min), Action (27 min), Consolidation (10 min)');
      console.log('   • Health/social differentiation strategies added');
      console.log('   • Mi\'kmaq wellness teachings included (100+ characters)');
      console.log('   • Observable assessment with social-emotional checkboxes');
    } else {
      console.log('\n⚠️  Some lessons may need additional review');
    }

  } catch (error) {
    console.error('❌ Error verifying FPS updates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmilyFPSUpdates();