import { PrismaClient } from '@teaching-engine/database';

const prisma = new PrismaClient();

async function reassignLessons() {
  console.log('Reassigning lessons to new rotation units...\n');
  
  // Get Emily's ID
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  // Get all lessons
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    orderBy: { createdAt: 'asc' }
  });
  
  console.log(`Total lessons found: ${allLessons.length}`);
  
  // Get new units
  const newUnits = await prisma.unitPlan.findMany({
    where: { 
      userId: emily.id,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000) // Created in last hour
      }
    },
    include: {
      longRangePlan: true
    }
  });
  
  console.log(`New units found: ${newUnits.length}`);
  
  // Group lessons by subject
  const lessonsBySubject = {};
  allLessons.forEach(lesson => {
    if (!lessonsBySubject[lesson.subject]) {
      lessonsBySubject[lesson.subject] = [];
    }
    lessonsBySubject[lesson.subject].push(lesson);
  });
  
  // Group units by subject
  const unitsBySubject = {};
  newUnits.forEach(unit => {
    const subject = unit.longRangePlan.subject;
    if (!unitsBySubject[subject]) {
      unitsBySubject[subject] = [];
    }
    unitsBySubject[subject].push(unit);
  });
  
  // Track lessons to keep and delete
  const lessonsToKeep = [];
  const lessonsToDelete = [];
  
  // Process French lessons - keep first 195 (need all for daily teaching)
  const frenchLessons = lessonsBySubject['Français (Immersion)'] || [];
  const frenchUnits = unitsBySubject['Français (Immersion)'] || [];
  console.log(`\nFrench: ${frenchLessons.length} lessons, ${frenchUnits.length} units`);
  
  let frenchIndex = 0;
  for (const unit of frenchUnits) {
    const lessonsPerUnit = Math.floor(195 / frenchUnits.length);
    for (let i = 0; i < lessonsPerUnit && frenchIndex < frenchLessons.length; i++) {
      await prisma.eTFOLessonPlan.update({
        where: { id: frenchLessons[frenchIndex].id },
        data: { unitPlanId: unit.id }
      });
      lessonsToKeep.push(frenchLessons[frenchIndex].id);
      frenchIndex++;
    }
  }
  console.log(`  Kept ${frenchIndex} French lessons (need 195 total - will add ${195-frenchIndex} more)`);
  
  // Process Math lessons - keep first 195 (need all for daily teaching)
  const mathLessons = lessonsBySubject['Mathématiques'] || [];
  const mathUnits = unitsBySubject['Mathématiques'] || [];
  console.log(`\nMath: ${mathLessons.length} lessons, ${mathUnits.length} units`);
  
  let mathIndex = 0;
  for (const unit of mathUnits) {
    const lessonsPerUnit = Math.floor(195 / mathUnits.length);
    for (let i = 0; i < lessonsPerUnit && mathIndex < mathLessons.length; i++) {
      await prisma.eTFOLessonPlan.update({
        where: { id: mathLessons[mathIndex].id },
        data: { unitPlanId: unit.id }
      });
      lessonsToKeep.push(mathLessons[mathIndex].id);
      mathIndex++;
    }
  }
  console.log(`  Kept ${mathIndex} Math lessons (need 195 total - will add ${195-mathIndex} more)`);
  
  // Process Science lessons - keep best 50 (for rotation blocks)
  const scienceLessons = lessonsBySubject['Sciences de la nature'] || [];
  const scienceUnits = unitsBySubject['Sciences de la nature'] || [];
  console.log(`\nScience: ${scienceLessons.length} lessons, ${scienceUnits.length} units`);
  
  // Select lessons with seasonal alignment
  const fallScience = scienceLessons.filter(l => 
    l.title.toLowerCase().includes('fall') || 
    l.title.toLowerCase().includes('autumn') ||
    l.title.toLowerCase().includes('school environment')
  ).slice(0, 20);
  
  const winterScience = scienceLessons.filter(l => 
    l.title.toLowerCase().includes('winter') ||
    l.title.toLowerCase().includes('snow') ||
    l.title.toLowerCase().includes('ice')
  ).slice(0, 10);
  
  const springScience = scienceLessons.filter(l => 
    l.title.toLowerCase().includes('spring') ||
    l.title.toLowerCase().includes('growing') ||
    l.title.toLowerCase().includes('plant')
  ).slice(0, 20);
  
  const scienceToKeep = [...fallScience, ...winterScience, ...springScience];
  
  // Assign to units
  let sciIndex = 0;
  for (const unit of scienceUnits) {
    const lessonsPerUnit = 10; // 2 weeks × 5 days
    for (let i = 0; i < lessonsPerUnit && sciIndex < scienceToKeep.length; i++) {
      await prisma.eTFOLessonPlan.update({
        where: { id: scienceToKeep[sciIndex].id },
        data: { unitPlanId: unit.id }
      });
      lessonsToKeep.push(scienceToKeep[sciIndex].id);
      sciIndex++;
    }
  }
  console.log(`  Kept ${sciIndex} Science lessons (target: 50)`);
  
  // Mark rest for deletion
  scienceLessons.forEach(lesson => {
    if (!scienceToKeep.find(l => l.id === lesson.id)) {
      lessonsToDelete.push(lesson.id);
    }
  });
  
  // Process Social Studies - keep best 30
  const ssLessons = lessonsBySubject['Sciences humaines'] || [];
  const ssUnits = unitsBySubject['Sciences humaines'] || [];
  console.log(`\nSocial Studies: ${ssLessons.length} lessons, ${ssUnits.length} units`);
  
  const ssToKeep = ssLessons.slice(0, 30);
  let ssIndex = 0;
  for (const unit of ssUnits) {
    const lessonsPerUnit = 15;
    for (let i = 0; i < lessonsPerUnit && ssIndex < ssToKeep.length; i++) {
      await prisma.eTFOLessonPlan.update({
        where: { id: ssToKeep[ssIndex].id },
        data: { unitPlanId: unit.id }
      });
      lessonsToKeep.push(ssToKeep[ssIndex].id);
      ssIndex++;
    }
  }
  console.log(`  Kept ${ssIndex} Social Studies lessons (target: 30)`);
  
  // Mark rest for deletion
  ssLessons.slice(30).forEach(lesson => {
    lessonsToDelete.push(lesson.id);
  });
  
  // Process Arts - keep best 30
  const artsLessons = lessonsBySubject['Arts visuels'] || [];
  const artsUnits = unitsBySubject['Arts visuels'] || [];
  console.log(`\nArts: ${artsLessons.length} lessons, ${artsUnits.length} units`);
  
  const artsToKeep = artsLessons.slice(0, 30);
  let artIndex = 0;
  for (const unit of artsUnits) {
    const lessonsPerUnit = 15;
    for (let i = 0; i < lessonsPerUnit && artIndex < artsToKeep.length; i++) {
      await prisma.eTFOLessonPlan.update({
        where: { id: artsToKeep[artIndex].id },
        data: { unitPlanId: unit.id }
      });
      lessonsToKeep.push(artsToKeep[artIndex].id);
      artIndex++;
    }
  }
  console.log(`  Kept ${artIndex} Arts lessons (target: 30)`);
  
  // Mark rest for deletion
  artsLessons.slice(30).forEach(lesson => {
    lessonsToDelete.push(lesson.id);
  });
  
  // Process Health - keep best 30
  const healthLessons = lessonsBySubject['Formation personnelle et sociale'] || [];
  const healthUnits = unitsBySubject['Formation personnelle et sociale'] || [];
  console.log(`\nHealth: ${healthLessons.length} lessons, ${healthUnits.length} units`);
  
  const healthToKeep = healthLessons.slice(0, 30);
  let healthIndex = 0;
  for (const unit of healthUnits) {
    const lessonsPerUnit = 15;
    for (let i = 0; i < lessonsPerUnit && healthIndex < healthToKeep.length; i++) {
      await prisma.eTFOLessonPlan.update({
        where: { id: healthToKeep[healthIndex].id },
        data: { unitPlanId: unit.id }
      });
      lessonsToKeep.push(healthToKeep[healthIndex].id);
      healthIndex++;
    }
  }
  console.log(`  Kept ${healthIndex} Health lessons (target: 30)`);
  
  // Mark rest for deletion
  healthLessons.slice(30).forEach(lesson => {
    lessonsToDelete.push(lesson.id);
  });
  
  console.log('\n=== SUMMARY ===');
  console.log(`Lessons to keep: ${lessonsToKeep.length}`);
  console.log(`Lessons to delete: ${lessonsToDelete.length}`);
  console.log(`Total: ${lessonsToKeep.length + lessonsToDelete.length}`);
  
  // Delete excess lessons
  if (lessonsToDelete.length > 0) {
    console.log(`\nDeleting ${lessonsToDelete.length} excess lessons...`);
    
    // Delete related records first
    await prisma.eTFOLessonPlanExpectation.deleteMany({
      where: { lessonPlanId: { in: lessonsToDelete } }
    });
    
    await prisma.eTFOLessonPlanResource.deleteMany({
      where: { lessonPlanId: { in: lessonsToDelete } }
    });
    
    await prisma.daybookEntry.deleteMany({
      where: { lessonPlanId: { in: lessonsToDelete } }
    });
    
    // Delete the lessons
    const deleteResult = await prisma.eTFOLessonPlan.deleteMany({
      where: { id: { in: lessonsToDelete } }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} excess lessons`);
  }
  
  // Now delete old units that have no lessons
  const oldUnits = await prisma.unitPlan.findMany({
    where: {
      userId: emily.id,
      createdAt: {
        lt: new Date(Date.now() - 60 * 60 * 1000) // Created before last hour
      }
    }
  });
  
  console.log(`\nDeleting ${oldUnits.length} old unit plans...`);
  
  for (const unit of oldUnits) {
    // Delete related records
    await prisma.unitPlanExpectation.deleteMany({
      where: { unitPlanId: unit.id }
    });
    
    await prisma.unitPlanResource.deleteMany({
      where: { unitPlanId: unit.id }
    });
    
    await prisma.unitPlanTransferSkill.deleteMany({
      where: { unitPlanId: unit.id }
    });
  }
  
  const deleteUnitsResult = await prisma.unitPlan.deleteMany({
    where: {
      userId: emily.id,
      createdAt: {
        lt: new Date(Date.now() - 60 * 60 * 1000)
      }
    }
  });
  
  console.log(`✅ Deleted ${deleteUnitsResult.count} old unit plans`);
  
  return {
    kept: lessonsToKeep.length,
    deleted: lessonsToDelete.length,
    unitsDeleted: deleteUnitsResult.count
  };
}

reassignLessons()
  .then(result => {
    console.log('\n✅ REASSIGNMENT COMPLETE');
    console.log(`   Lessons kept: ${result.kept}`);
    console.log(`   Lessons deleted: ${result.deleted}`);
    console.log(`   Old units deleted: ${result.unitsDeleted}`);
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());