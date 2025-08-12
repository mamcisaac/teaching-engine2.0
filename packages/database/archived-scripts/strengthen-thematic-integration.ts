#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function strengthenThematicIntegration() {
  console.log('🎨 STRENGTHENING THEMATIC INTEGRATION ACROSS SEMESTER\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });

  if (!emily) throw new Error('Emily not found');

  let updatedCount = 0;

  // SEPTEMBER: Strengthen "Welcome to School" theme
  const septThematicEnhancements = [
    {
      titlePattern: 'Introduction à l\'autoportrait',
      newGoals: 'Students will create self-portraits to introduce themselves to their new school community. Art vocabulary and school community building: dessiner, couleur, forme, école, ami, communauté.'
    },
    {
      titlePattern: 'Les couleurs et les émotions',
      newGoals: 'Students will explore emotions about starting school through color expression. School emotions and color vocabulary: rouge, bleu, jaune, content, nerveux, excité, école.'
    },
    {
      titlePattern: 'Explorer les textures',
      newGoals: 'Students will explore textures in their new school environment through art. School exploration and texture vocabulary: doux, rugueux, lisse, école, explorer, découvrir.'
    },
    {
      titlePattern: 'Murale communautaire',
      newGoals: 'Students will create a collaborative classroom community mural. Community building and art vocabulary: ensemble, partager, classe, communauté, créer, collaborer.'
    },
    {
      titlePattern: 'Les nombres partout',
      newGoals: 'Students will discover numbers throughout their school environment. School exploration and number vocabulary combined with French counting practice.'
    },
    {
      titlePattern: 'Collections à compter',
      newGoals: 'Students will count collections of school items to build classroom math community. School community and counting connected through shared classroom materials.'
    }
  ];

  // OCTOBER: Strengthen "Family" theme
  const octThematicEnhancements = [
    {
      titlePattern: 'Révision septembre',
      newGoals: 'Students will reflect on September school learning with their classroom family. Building on school community to extend into family connections and French language growth.'
    },
    {
      titlePattern: 'Les nombres 11-15',
      newGoals: 'Students will learn numbers 11-15 through family context. Natural French connection: Count family members, family ages, using family vocabulary alongside number concepts.'
    },
    {
      titlePattern: 'Les nombres 16-20',
      newGoals: 'Students will explore numbers 16-20 in family contexts. Family connections and French numbers: counting family photos, family birthdays, family activities.'
    }
  ];

  // NOVEMBER: Strengthen "Fall Celebrations" theme
  const novThematicEnhancements = [
    {
      titlePattern: 'Les régularités AB et ABC',
      newGoals: 'Students will create and extend patterns using fall celebration themes. Natural French connection: autumn patterns, celebration patterns, fall vocabulary in mathematical contexts.'
    },
    {
      titlePattern: 'Les régularités croissantes',
      newGoals: 'Students will recognize growing patterns in fall celebrations and nature. Celebration growth patterns and French counting: leaves falling, celebration preparations growing.'
    },
    {
      titlePattern: 'Révision des formes 2D',
      newGoals: 'Students will identify 2D shapes in fall celebration decorations and autumn nature. Fall celebration context for shape learning with French shape vocabulary.'
    },
    {
      titlePattern: 'Composer avec des formes',
      newGoals: 'Students will compose fall celebration pictures using 2D shapes. Autumn and celebration themes integrated with shape composition and French vocabulary.'
    }
  ];

  // DECEMBER: Strengthen "Winter Celebrations" theme
  const decThematicEnhancements = [
    {
      titlePattern: 'Les histoires d\'addition commencent',
      newGoals: 'Students will understand addition through winter celebration stories. Winter holiday context: ornaments on trees, gifts under tree, winter celebration math stories in French.'
    },
    {
      titlePattern: 'Addition jusqu\'à 10',
      newGoals: 'Students will solve addition problems using winter celebration contexts. Holiday math with French numbers: decorations, celebrations, winter items to practice addition.'
    },
    {
      titlePattern: 'Les histoires de soustraction',
      newGoals: 'Students will understand subtraction through winter celebration stories. Winter celebrations provide context for subtraction: ornaments, cookies, winter celebration math in French.'
    }
  ];

  const allEnhancements = [
    ...septThematicEnhancements.map(e => ({ ...e, month: 'September', theme: 'Welcome to School' })),
    ...octThematicEnhancements.map(e => ({ ...e, month: 'October', theme: 'Family Connections' })),
    ...novThematicEnhancements.map(e => ({ ...e, month: 'November', theme: 'Fall Celebrations' })),
    ...decThematicEnhancements.map(e => ({ ...e, month: 'December', theme: 'Winter Celebrations' }))
  ];

  console.log('Enhancing key lessons for stronger thematic integration:\n');

  for (const enhancement of allEnhancements) {
    try {
      // Find the lesson by title pattern
      const lesson = await prisma.eTFOLessonPlan.findFirst({
        where: {
          userId: emily.id,
          OR: [
            { title: { contains: enhancement.titlePattern } },
            { titleFr: { contains: enhancement.titlePattern } }
          ]
        }
      });

      if (lesson) {
        // Update with enhanced thematic learning goals
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            learningGoals: enhancement.newGoals
          }
        });

        updatedCount++;
        console.log(`✅ Enhanced: ${lesson.titleFr || lesson.title}`);
        console.log(`   Theme: ${enhancement.theme} (${enhancement.month})`);
        console.log(`   New goals: ${enhancement.newGoals.substring(0, 80)}...`);
        console.log();
      } else {
        console.log(`⚠️ Not found: ${enhancement.titlePattern}`);
      }
    } catch (error) {
      console.error(`❌ Error enhancing ${enhancement.titlePattern}:`, error);
    }
  }

  // Also enhance some core French lessons to be more explicitly thematic
  const frenchThematicUpdates = [
    {
      titlePattern: 'Nos noms spéciaux',
      newGoals: 'Students will celebrate their special names as part of building our school community. French names and school belonging: prénom, nom, spécial, unique, communauté, école.'
    },
    {
      titlePattern: 'Bons auditeurs',
      newGoals: 'Students will develop good listening skills for our school community. Building respectful school community through French listening: écouter, respecter, communauté, ensemble.'
    },
    {
      titlePattern: 'Les aidants scolaires',
      newGoals: 'Students will learn about school helpers who make our school community work. School community helpers and French vocabulary: aider, école, communauté, ensemble, travailler.'
    },
    {
      titlePattern: 'Introduction à ma famille',
      newGoals: 'Students will introduce their families, extending from school community to family connections. Family introductions building on school relationships: famille, présenter, partager.'
    },
    {
      titlePattern: 'Ma famille unique',
      newGoals: 'Students will celebrate what makes their families unique, connecting family diversity to our diverse school community. Family diversity and community: unique, différent, spécial, famille.'
    },
    {
      titlePattern: 'Partager notre gratitude',
      newGoals: 'Students will share gratitude as we celebrate fall together. Fall celebration of gratitude in our learning community: gratitude, reconnaissant, célébrer, ensemble, automne.'
    }
  ];

  console.log('Enhancing core French lessons for thematic coherence:\n');

  for (const update of frenchThematicUpdates) {
    try {
      const lesson = await prisma.eTFOLessonPlan.findFirst({
        where: {
          userId: emily.id,
          OR: [
            { title: { contains: update.titlePattern } },
            { titleFr: { contains: update.titlePattern } }
          ]
        }
      });

      if (lesson) {
        await prisma.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: {
            learningGoals: update.newGoals
          }
        });

        updatedCount++;
        console.log(`✅ Enhanced French lesson: ${lesson.titleFr || lesson.title}`);
        console.log(`   New thematic goals: ${update.newGoals.substring(0, 80)}...`);
        console.log();
      }
    } catch (error) {
      console.error(`❌ Error enhancing French lesson:`, error);
    }
  }

  console.log(`📊 THEMATIC ENHANCEMENT SUMMARY:`);
  console.log(`Enhanced lessons: ${updatedCount}`);
  console.log(`\nThematic progression strengthened:`);
  console.log(`September: Welcome to School Community (stronger school community focus)`);
  console.log(`October: Family Connections (building from school to family)`);
  console.log(`November: Fall Celebrations (community celebration focus)`);
  console.log(`December: Winter Celebrations (seasonal celebration culmination)`);

  await prisma.$disconnect();
  
  return updatedCount;
}

strengthenThematicIntegration()
  .then((count) => {
    console.log(`\n✅ Thematic integration strengthening complete: ${count} lessons enhanced`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Enhancement failed:', error);
    process.exit(1);
  });