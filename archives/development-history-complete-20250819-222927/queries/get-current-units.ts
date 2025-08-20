import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCurrentUnits() {
  try {
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98s0007vjr1v0a2ibp5' },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        },
        lessonPlans: {
          select: {
            id: true,
            date: true,
            title: true
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('📚 CURRENT SOCIAL STUDIES UNITS:\n');
    
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      console.log(`=== UNIT ${i + 1}: ${unit.title} ===`);
      console.log(`ID: ${unit.id}`);
      console.log(`Period: ${new Date(unit.startDate).toDateString()} - ${new Date(unit.endDate).toDateString()}`);
      console.log(`Lessons: ${unit.lessonPlans.length}`);
      console.log(`Hours: ${unit.estimatedHours}`);
      console.log(`Expectations: [${unit.expectations.map(e => e.expectation.code).join(', ')}]`);
      
      if (unit.lessonPlans.length > 0) {
        const firstLesson = new Date(unit.lessonPlans[0].date);
        const lastLesson = new Date(unit.lessonPlans[unit.lessonPlans.length - 1].date);
        console.log(`Actual lesson span: ${firstLesson.toDateString()} - ${lastLesson.toDateString()}`);
        
        // Check for Christmas break violations
        const christmasStart = new Date('2025-12-19');
        const christmasEnd = new Date('2026-01-05');
        
        const christmasLessons = unit.lessonPlans.filter(l => {
          const date = new Date(l.date);
          return date >= christmasStart && date <= christmasEnd;
        });
        
        if (christmasLessons.length > 0) {
          console.log(`⚠️ CHRISTMAS VIOLATION: ${christmasLessons.length} lessons during break`);
          christmasLessons.forEach(lesson => {
            console.log(`   - ${new Date(lesson.date).toDateString()}: ${lesson.title}`);
          });
        }
      }
      
      console.log(`\nCurrent Description (${unit.description?.length || 0} chars):`);
      console.log(`"${unit.description}"`);
      
      console.log(`\nCurrent Assessment Plan (${unit.assessmentPlan?.length || 0} chars):`);
      console.log(`"${unit.assessmentPlan}"`);
      
      console.log(`\nCurrent Parent Communication (${unit.parentCommunicationPlan?.length || 0} chars):`);
      console.log(`"${unit.parentCommunicationPlan}"`);
      
      console.log(`\nVocabulary: [${(unit.keyVocabulary as string[])?.join(', ')}]`);
      console.log('\n' + '-'.repeat(80) + '\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCurrentUnits();