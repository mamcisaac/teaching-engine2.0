#!/usr/bin/env tsx

/**
 * CREATE THE ACTUALLY PERFECT FRANÇAIS LANGUE PREMIÈRE LRP
 * Based on REALITY of how 6-year-olds actually learn to read in French
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createPerfectFrancais() {
  console.log('🇫🇷 CREATING THE ACTUALLY PERFECT FRANÇAIS LRP\n');
  console.log('Based on REALITY of Grade 1 French Immersion\n');
  console.log('============================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    console.log('ERROR: Emily not found');
    return;
  }
  
  const lrp = await prisma.longRangePlan.findFirst({
    where: {
      subject: 'Français langue première',
      academicYear: '2025-2026',
      userId: emily.id
    }
  });
  
  if (!lrp) {
    console.log('ERROR: Français LRP not found');
    return;
  }
  
  console.log('📅 REALITY CHECK - PEI SCHOOL CALENDAR:\n');
  console.log('September: 18 days (but only 10 productive)');
  console.log('October: 22 days');
  console.log('November: 19 days');
  console.log('December: 14 days');
  console.log('January: 19 days');
  console.log('February: 19 days');
  console.log('March: 15 days (with break)');
  console.log('April: 20 days');
  console.log('May: 21 days');
  console.log('June: 14 days\n');
  
  console.log('👶 DEVELOPMENTAL REALITY:\n');
  console.log('September: Cannot hold pencils, crying, don\'t understand French');
  console.log('October: Beginning to understand routines');
  console.log('November: Ready for first letter exposure');
  console.log('January: Ready for formal instruction');
  console.log('April: Beginning readers emerge');
  console.log('June: Reading niveau 5-6 (not 8!)\n');
  
  // Update LRP with REALITY
  await prisma.longRangePlan.update({
    where: { id: lrp.id },
    data: {
      title: 'Français langue première - Reality-Based Grade 1 Journey',
      
      goals: `REALISTIC 180-HOUR FRENCH LITERACY DEVELOPMENT:

TERM 1 - ORAL LANGUAGE & READINESS (Sept-Dec): 74 hours
September (18h): Routines, oral language, no letters yet
October (22h): Phonological awareness, still oral focus
November (20h): First 2-3 letters, name recognition
December (14h): 4-5 letters total, holiday vocabulary

TERM 2 - LITERACY EMERGES (Jan-Mar): 55 hours
January (20h): Real instruction begins, 10 letters, first sight words
February (20h): Half alphabet, 15 sight words, CV blending
March (15h): Most letters, 30 sight words, niveau 1 books

TERM 3 - READING DEVELOPS (Apr-Jun): 51 hours
April (20h): All letters, 50 sight words, niveau 2-3 books
May (22h): 75-100 sight words, niveau 4-5 books
June (9h): Celebration, niveau 5-6 books, Grade 2 ready

DAILY STRUCTURE:
- Morning block (30 min): When fresh, new learning
- Afternoon block (30 min): Practice, centers, review

SEPTEMBER REALITY:
- NO formal letters (they can't hold pencils)
- Focus on oral French and classroom routines
- Building stamina to sit for 10 minutes
- Learning to follow 1-step French instructions`,
      
      themes: [
        'Oral language development',
        'Phonological awareness',
        'Letter recognition',
        'Sound-symbol correspondence',
        'Sight word development',
        'Emergent reading',
        'Emergent writing',
        'French vocabulary',
        'Listening comprehension',
        'Beginning fluency'
      ],
      
      overarchingQuestions: `QUESTIONS FOR 6-YEAR-OLDS:
C'est qui? (Who is it?)
C'est quoi? (What is it?)
Où? (Where?)
Combien? (How many?)
Tu aimes? (Do you like?)`,
      
      assessmentOverview: `REALISTIC ASSESSMENT:

SEPTEMBER-NOVEMBER:
- Observation only
- Can they sit and listen?
- Do they respond to French?
- NO formal assessment

DECEMBER-FEBRUARY:
- Letter recognition checks
- Name writing ability
- First sight words (oral)
- Still mostly observation

MARCH-JUNE:
- GB+ begins (niveau 1-6 realistic)
- Sight word inventory
- Simple writing samples
- Portfolio documentation

NO TESTING before January!`,
      
      resourceNeeds: `REALISTIC RESOURCES:

FOR ORAL LANGUAGE (Sept-Nov):
- Puppets for French only
- Felt board stories
- Picture cards
- Songs and rhymes
- NO BOOKS YET

FOR EMERGENT LITERACY (Dec-Mar):
- Alphabet cards
- Name puzzles
- Niveau 0-1 books
- Sentence strips
- Word wall (grows slowly)

FOR READING (Apr-Jun):
- Niveau 2-6 books (not 8!)
- Guided reading sets
- Home reading bags
- Simple French games`
    }
  });
  
  console.log('✅ Updated LRP with reality-based goals\n');
  
  // Update units to match REALITY
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: lrp.id },
    orderBy: { startDate: 'asc' }
  });
  
  // Get all expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: { subject: 'Français langue première', grade: 1 }
  });
  
  const realUnits = [
    {
      title: 'Bienvenue à l\'école',
      hours: 18,
      start: new Date('2025-09-03'),
      end: new Date('2025-09-30'),
      description: 'SEPT: Oral only, routines, no letters',
      expectations: ['1CO.0', '1CO.1']
    },
    {
      title: 'J\'écoute et je parle',
      hours: 22,
      start: new Date('2025-10-01'),
      end: new Date('2025-10-31'),
      description: 'OCT: Phonological awareness, oral vocabulary',
      expectations: ['1CO.1', '1CO.2']
    },
    {
      title: 'Les premiers sons',
      hours: 20,
      start: new Date('2025-11-03'),
      end: new Date('2025-11-28'),
      description: 'NOV: Letters A, M, S (3 only!), name recognition',
      expectations: ['1CO.2', '1L.1']
    },
    {
      title: 'Symboles des fêtes',
      hours: 14,
      start: new Date('2025-12-01'),
      end: new Date('2025-12-19'),
      description: 'DEC: Letters N, O, E, L (Noël), light and fun',
      expectations: ['1CO.3', '1L.1']
    },
    {
      title: 'Vraie lecture commence',
      hours: 20,
      start: new Date('2026-01-06'),
      end: new Date('2026-01-30'),
      description: 'JAN: 10 letters systematic, je/tu/le/la sight words',
      expectations: ['1L.1', '1L.2', '1É.1']
    },
    {
      title: 'Construire les mots',
      hours: 20,
      start: new Date('2026-02-02'),
      end: new Date('2026-02-27'),
      description: 'FEB: 15 letters, 15 sight words, CV blending',
      expectations: ['1L.2', '1L.3', '1É.1']
    },
    {
      title: 'Premiers livres',
      hours: 15,
      start: new Date('2026-03-02'),
      end: new Date('2026-03-20'),
      description: 'MAR: 20 letters, niveau 1 books, 30 sight words',
      expectations: ['1L.3', '1É.2', '1CO.4']
    },
    {
      title: 'Lire vraiment',
      hours: 20,
      start: new Date('2026-04-01'),
      end: new Date('2026-04-30'),
      description: 'APR: All letters, niveau 2-3, 50 sight words',
      expectations: ['1L.3', '1L.4', '1É.2']
    },
    {
      title: 'Devenir lecteur',
      hours: 22,
      start: new Date('2026-05-01'),
      end: new Date('2026-05-29'),
      description: 'MAY: Niveau 4-5, 75-100 sight words, sentences',
      expectations: ['1L.4', '1L.5', '1É.3', '1CO.5']
    },
    {
      title: 'Célébration',
      hours: 9,
      start: new Date('2026-06-01'),
      end: new Date('2026-06-25'),
      description: 'JUNE: Light! Niveau 5-6, portfolios, fun',
      expectations: ['1L.5', '1É.3', '1CO.6']
    }
  ];
  
  // Verify total
  const totalHours = realUnits.reduce((sum, u) => sum + u.hours, 0);
  console.log(`Total hours: ${totalHours}/180\n`);
  
  // Update existing units
  for (let i = 0; i < Math.min(units.length, realUnits.length); i++) {
    const spec = realUnits[i];
    
    await prisma.unitPlan.update({
      where: { id: units[i].id },
      data: {
        title: spec.title,
        titleFr: spec.title,
        estimatedHours: spec.hours,
        startDate: spec.start,
        endDate: spec.end,
        description: spec.description,
        bigIdeas: 'Respecter le développement réel',
        assessmentPlan: 'Observation seulement jusqu\'en janvier'
      }
    });
    
    // Clear and re-link expectations
    await prisma.unitPlanExpectation.deleteMany({
      where: { unitPlanId: units[i].id }
    });
    
    for (const expCode of spec.expectations) {
      const exp = expectations.find(e => e.code === expCode);
      if (exp) {
        await prisma.unitPlanExpectation.create({
          data: {
            unitPlanId: units[i].id,
            expectationId: exp.id
          }
        });
      }
    }
    
    const monthName = spec.start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    console.log(`✅ ${monthName}: ${spec.title} (${spec.hours}h)`);
    console.log(`   ${spec.description}`);
  }
  
  // Handle extra units
  if (units.length > realUnits.length) {
    for (let i = realUnits.length; i < units.length; i++) {
      await prisma.unitPlan.delete({ where: { id: units[i].id } });
      console.log(`Removed extra unit ${i+1}`);
    }
  } else if (realUnits.length > units.length) {
    for (let i = units.length; i < realUnits.length; i++) {
      const spec = realUnits[i];
      const newUnit = await prisma.unitPlan.create({
        data: {
          userId: emily.id,
          longRangePlanId: lrp.id,
          title: spec.title,
          titleFr: spec.title,
          estimatedHours: spec.hours,
          startDate: spec.start,
          endDate: spec.end,
          description: spec.description,
          bigIdeas: 'Respecter le développement réel',
          assessmentPlan: 'Observation seulement jusqu\'en janvier'
        }
      });
      
      for (const expCode of spec.expectations) {
        const exp = expectations.find(e => e.code === expCode);
        if (exp) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: newUnit.id,
              expectationId: exp.id
            }
          });
        }
      }
      
      console.log(`✅ Created unit: ${spec.title} (${spec.hours}h)`);
    }
  }
  
  console.log('\n🎯 KEY REALITY DIFFERENCES:');
  console.log('  ❌ OLD: Letters A-M in September');
  console.log('  ✅ NEW: NO letters in September (oral only)');
  console.log('');
  console.log('  ❌ OLD: Reading niveau 6-8 by June');
  console.log('  ✅ NEW: Reading niveau 5-6 (realistic!)');
  console.log('');
  console.log('  ❌ OLD: 20 sight words in October');
  console.log('  ✅ NEW: First sight words in January');
  
  console.log('\n✨ FRANÇAIS IS NOW THE HIGHEST TRUTH!');
  console.log('Based on how 6-year-olds ACTUALLY learn French.\n');
  
  await prisma.$disconnect();
}

createPerfectFrancais().catch(console.error);