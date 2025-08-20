import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCriticalIssues() {
  console.log('🚨 FIXING CRITICAL SYSTEM ISSUES\n');
  
  const frenchLRP = await prisma.longRangePlan.findFirst({
    where: { subject: { contains: 'Français' } }
  });
  
  if (!frenchLRP) {
    console.log('No French LRP found');
    return;
  }
  
  // STEP 1: Fix LRP missing elements
  console.log('📚 STEP 1: FIXING LONG RANGE PLAN\n');
  
  const perfectBigIdeas = "• La langue française est un outil puissant de communication, de création et de réflexion qui ouvre les portes du monde\n• Lire, écrire et parler en français développent la pensée critique et la capacité d'expression personnelle\n• Les textes français reflètent la richesse culturelle francophone et permettent de comprendre le monde qui nous entoure\n• L'apprentissage du français en immersion crée des liens authentiques entre la langue et tous les domaines d'apprentissage\n• Chaque élève peut devenir un communicateur confiant et créatif en français avec le bon soutien et les bonnes stratégies";

  const perfectQuestions = [
    "Comment la langue française me permet-elle de comprendre et d'exprimer mes idées?",
    "Quelles stratégies m'aident le mieux à lire, écrire et communiquer en français?",
    "Comment les textes français enrichissent-ils ma compréhension du monde?",
    "De quelle façon puis-je devenir un meilleur communicateur en français?",
    "Comment l'apprentissage du français me connecte-t-il à la communauté francophone?"
  ];

  await prisma.longRangePlan.update({
    where: { id: frenchLRP.id },
    data: {
      totalHours: 146.25,
      bigIdeas: perfectBigIdeas,
      essentialQuestions: perfectQuestions,
      description: "Grade 1 French Immersion program suivant le modèle Revolutionary Daily Integration (195 leçons exactement = 146.25 heures). Programme équilibré couvrant la communication orale (7 attentes), la lecture (5 attentes), et l'écriture (3 attentes) à travers 10 unités thématiques développementalement appropriées."
    }
  });
  
  console.log('✅ LRP updated with Big Ideas, Essential Questions, and 146.25 hours');
  
  // STEP 2: Fix unit hours to achieve exactly 146.25 total
  console.log('\n📖 STEP 2: FIXING UNIT HOURS FOR MATHEMATICAL PRECISION\n');
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  // Perfect distribution: 5 units @ 15 hours + 5 units @ 14.25 hours = 146.25 exactly
  const perfectHours = [15.0, 15.0, 15.0, 15.0, 15.0, 14.25, 14.25, 14.25, 14.25, 14.25];
  
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const newHours = perfectHours[i];
    const lessons = Math.round(newHours * 60 / 45);
    
    await prisma.unitPlan.update({
      where: { id: unit.id },
      data: { estimatedHours: newHours }
    });
    
    console.log(`✅ Unit ${i+1}: ${unit.title} → ${newHours} hours (${lessons} lessons)`);
  }
  
  // Verify totals
  const totalHours = perfectHours.reduce((sum, hours) => sum + hours, 0);
  const totalLessons = perfectHours.reduce((sum, hours) => sum + Math.round(hours * 60 / 45), 0);
  
  console.log(`\nTotal Hours: ${totalHours} (Target: 146.25) ${totalHours === 146.25 ? '✅' : '❌'}`);
  console.log(`Total Lessons: ${totalLessons} (Target: 195) ${totalLessons === 195 ? '✅' : '❌'}`);
  
  // STEP 3: Final verification
  console.log('\n📊 STEP 3: FINAL VERIFICATION\n');
  
  const verifyUnits = await prisma.unitPlan.findMany({
    where: { longRangePlanId: frenchLRP.id },
    orderBy: { startDate: 'asc' }
  });
  
  let verifyHours = 0;
  let verifyLessons = 0;
  let conformingUnits = 0;
  
  verifyUnits.forEach((unit, i) => {
    const hours = unit.estimatedHours || 0;
    const lessons = Math.round(hours * 60 / 45);
    verifyHours += hours;
    verifyLessons += lessons;
    
    const conformsToStandards = hours >= 14.25 && hours <= 18.3 && lessons >= 19 && lessons <= 24;
    if (conformsToStandards) conformingUnits++;
    
    console.log(`Unit ${i+1}: ${hours} hours = ${lessons} lessons ${conformsToStandards ? '✅' : '❌'}`);
  });
  
  console.log(`\nFinal Results:`);
  console.log(`Total Hours: ${verifyHours} (Target: 146.25) ${Math.abs(verifyHours - 146.25) < 0.01 ? '✅' : '❌'}`);
  console.log(`Total Lessons: ${verifyLessons} (Target: 195) ${verifyLessons === 195 ? '✅' : '❌'}`);
  console.log(`Conforming Units: ${conformingUnits}/10 ${conformingUnits === 10 ? '✅' : '❌'}`);
  
  if (Math.abs(verifyHours - 146.25) < 0.01 && verifyLessons === 195 && conformingUnits === 10) {
    console.log('\n🎉 ALL CRITICAL ISSUES FIXED! SYSTEM IS NOW PERFECT! 🎉');
  } else {
    console.log('\n⚠️ Some issues remain - additional fixes needed');
  }
  
  await prisma.$disconnect();
}

fixCriticalIssues().catch(console.error);