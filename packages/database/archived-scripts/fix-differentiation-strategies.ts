#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDifferentiationStrategies() {
  console.log('🔧 FIXING DIFFERENTIATION STRATEGIES\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  // Find all lessons and check which ones need differentiation strategies
  const allLessons = await prisma.eTFOLessonPlan.findMany({
    where: { userId: emily.id },
    orderBy: { date: 'asc' }
  });
  
  const lessonsToFix = allLessons.filter(lesson => {
    // Check if differentiationStrategies is null, undefined, or empty object
    return !lesson.differentiationStrategies || 
           (typeof lesson.differentiationStrategies === 'object' && 
            Object.keys(lesson.differentiationStrategies as any).length === 0);
  });

  console.log(`Found ${lessonsToFix.length} lessons needing differentiation strategies`);

  let fixed = 0;
  for (const lesson of lessonsToFix) {
    // Create appropriate differentiation strategies based on subject
    let differentiationStrategies;
    
    if (lesson.subject === 'Français langue première') {
      differentiationStrategies = {
        support: 'Visual vocabulary cards, peer partners, simplified sentence structures, picture supports',
        extension: 'Additional vocabulary, complex sentence creation, peer teaching, independent reading',
        multiModal: 'Oral practice, written expression, visual supports, kinesthetic activities'
      };
    } else if (lesson.subject === 'Mathématiques') {
      differentiationStrategies = {
        support: 'Concrete manipulatives, number lines, visual patterns, guided practice',
        extension: 'Complex patterns, additional problem solving, peer tutoring, advanced materials',
        multiModal: 'Hands-on exploration, visual representations, oral explanations, written recording'
      };
    } else if (lesson.subject === 'Sciences de la nature') {
      differentiationStrategies = {
        support: 'Guided observations, picture journals, partner support, concrete examples',
        extension: 'Independent investigations, detailed recording, additional questions, research',
        multiModal: 'Hands-on exploration, visual observations, oral discussions, written recording'
      };
    } else if (lesson.subject === 'Arts') {
      differentiationStrategies = {
        support: 'Step-by-step instructions, template options, peer helpers, modified tools',
        extension: 'Open-ended creation, advanced techniques, leadership roles, portfolio reflection',
        multiModal: 'Visual demonstration, hands-on creation, verbal sharing, written reflection'
      };
    } else {
      // Default differentiation for any other subjects
      differentiationStrategies = {
        support: 'Visual supports, peer assistance, modified expectations, guided practice',
        extension: 'Additional challenges, independent work, leadership opportunities, reflection',
        multiModal: 'Various learning styles accommodated through multiple modalities'
      };
    }

    try {
      await prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { differentiationStrategies }
      });
      
      fixed++;
      console.log(`✅ Fixed: ${lesson.titleFr || lesson.title}`);
    } catch (error) {
      console.error(`❌ Failed to fix: ${lesson.titleFr || lesson.title}`, error);
    }
  }

  console.log(`\n✅ Fixed differentiation strategies for ${fixed}/${lessonsToFix.length} lessons`);

  await prisma.$disconnect();
  return { fixed, total: lessonsToFix.length };
}

fixDifferentiationStrategies()
  .then((result) => {
    console.log(`\n📊 Results: ${result.fixed} lessons updated`);
    process.exit(result.fixed === result.total ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });