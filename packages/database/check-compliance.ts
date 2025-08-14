import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCompliance() {
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    include: { unitPlan: true }
  });
  
  console.log('🔍 ETFO COMPLIANCE CHECK');
  console.log('='.repeat(50));
  console.log('Total lessons:', allLessons.length);
  
  let compliantCount = 0;
  let nonCompliantByUnit: Record<string, number> = {};
  
  allLessons.forEach(lesson => {
    let isCompliant = true;
    
    // Check each required field
    if (!lesson.mindsOn) isCompliant = false;
    if (!lesson.action) isCompliant = false;
    if (!lesson.consolidation) isCompliant = false;
    if (!lesson.accommodations) isCompliant = false;
    if (!lesson.modifications) isCompliant = false;
    if (!lesson.extensions) isCompliant = false;
    if (!lesson.assessmentType) isCompliant = false;
    if (!lesson.assessmentNotes) isCompliant = false;
    if (!lesson.learningGoals) isCompliant = false;
    if (!lesson.materials) isCompliant = false;
    if (!lesson.grouping) isCompliant = false;
    if (lesson.isSubFriendly === null || lesson.isSubFriendly === undefined) isCompliant = false;
    if (!lesson.subNotes) isCompliant = false;
    
    if (isCompliant) {
      compliantCount++;
    } else {
      const unitName = lesson.unitPlan?.title || 'Unknown';
      nonCompliantByUnit[unitName] = (nonCompliantByUnit[unitName] || 0) + 1;
    }
  });
  
  console.log('Compliant lessons:', compliantCount);
  console.log('Non-compliant lessons:', allLessons.length - compliantCount);
  console.log('Compliance rate:', Math.round(compliantCount / allLessons.length * 100) + '%');
  
  if (Object.keys(nonCompliantByUnit).length > 0) {
    console.log('\nUnits with non-compliant lessons:');
    Object.entries(nonCompliantByUnit)
      .sort((a, b) => b[1] - a[1])
      .forEach(([unit, count]) => {
        console.log('  •', unit + ':', count, 'lessons');
      });
  }
  
  await prisma.$disconnect();
}

checkCompliance().catch(console.error);