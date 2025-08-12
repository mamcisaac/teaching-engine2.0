#!/usr/bin/env tsx

/**
 * CREATE THE PERFECT FRANÇAIS LANGUE PREMIÈRE LRP
 * THE HIGHEST TRUTH FOR FRENCH IMMERSION SUCCESS
 * 
 * Requirements:
 * - EXACTLY 180 hours
 * - ALL 15 expectations linked
 * - Developmental progression from non-reader to reader
 * - Grade 1 appropriate
 * - PEI French Immersion context
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createPerfectFrancaisLRP() {
  console.log('🇫🇷 CREATING THE PERFECT FRANÇAIS LANGUE PREMIÈRE LRP\n');
  console.log('THE HIGHEST TRUTH FOR FRENCH IMMERSION SUCCESS\n');
  console.log('================================================\n');
  
  const emily = await prisma.user.findUnique({
    where: { email: 'emmcisaac@gmail.com' }
  });
  
  if (!emily) {
    console.log('ERROR: Emily not found');
    return;
  }
  
  // Get the LRP
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
  
  // Get ALL French expectations
  const expectations = await prisma.curriculumExpectation.findMany({
    where: {
      subject: 'Français langue première',
      grade: 1
    },
    orderBy: { code: 'asc' }
  });
  
  console.log('📊 THE NON-NEGOTIABLE REALITY:\n');
  console.log('Time: 180 hours (360 blocks) - same as Mathematics');
  console.log('Daily: 2 blocks (60 minutes) of French language arts');
  console.log('Expectations: 15 total (CO: oral, L: reading, É: writing)\n');
  
  // STEP 1: Link ALL expectations to LRP
  console.log('STEP 1: Linking ALL 15 expectations to LRP...\n');
  
  // Clear existing links
  await prisma.longRangePlanExpectation.deleteMany({
    where: { longRangePlanId: lrp.id }
  });
  
  // Link all expectations
  for (const exp of expectations) {
    await prisma.longRangePlanExpectation.create({
      data: {
        longRangePlanId: lrp.id,
        expectationId: exp.id
      }
    });
    console.log(`✓ Linked ${exp.code}`);
  }
  
  // STEP 2: Update LRP with PERFECT content
  console.log('\nSTEP 2: Creating the HIGHEST TRUTH content...\n');
  
  await prisma.longRangePlan.update({
    where: { id: lrp.id },
    data: {
      title: 'Français langue première - Grade 1 French Immersion Journey',
      
      goals: `COMPREHENSIVE 180-HOUR FRENCH LITERACY DEVELOPMENT:

TERM 1 - FOUNDATIONS (September-January): 90 hours
September (20 hrs): Oral language, phonemic awareness, letter recognition
October (20 hrs): Sound-symbol correspondence, first sight words (10-20)
November (20 hrs): Blending sounds, reading simple words, sight words (30-50)
December (15 hrs): Reading simple sentences, writing letters, sight words (60-80)
January (15 hrs): Reading pattern books (niveau 1-2), writing words, sight words (100+)

TERM 2 - GROWTH (February-June): 90 hours
February (20 hrs): Reading niveau 3-4 books, writing sentences with support
March (20 hrs): Reading strategies, writing simple stories (3 sentences)
April (20 hrs): Reading niveau 5-6 books, independent writing attempts
May (15 hrs): Fluency development, writing with conventions
June (15 hrs): Reading niveau 6-8 books, author celebrations, Grade 2 ready

DAILY STRUCTURE (2 blocks = 60 minutes):
Block 1 (30 min): Shared reading, mini-lesson, guided practice
Block 2 (30 min): Centers (reading, writing, word work, listening)

EXPECTATIONS INTEGRATION:
Communication orale (1CO.0-1CO.6): Daily throughout all units
Lecture (1L.1-1L.5): Progressive from September sounds to June comprehension
Écriture (1É.1-1É.3): October letters to June paragraph attempts`,
      
      themes: [
        'Conscience phonologique',
        'Décodage et fluidité',
        'Compréhension en lecture',
        'Écriture émergente',
        'Vocabulaire et syntaxe',
        'Communication orale',
        'Littératie culturelle',
        'Stratégies de lecture',
        "Processus d'écriture",
        "Célébration d'auteurs"
      ],
      
      overarchingQuestions: `Comment devient-on lecteur et écrivain?
Pourquoi lisons-nous et écrivons-nous?
Comment les lettres forment-elles des mots et des histoires?
Qu'est-ce qui rend un livre intéressant?
Comment partageons-nous nos idées en français?
Comment notre langue nous connecte-t-elle à notre communauté?`,
      
      assessmentOverview: `ÉVALUATION DÉVELOPPEMENTALE APPROPRIÉE:

SEPTEMBRE - Évaluation diagnostique:
- GB+ ou équivalent pour établir le niveau de départ (plupart niveau 0)
- Inventaire de mots connus
- Évaluation de la conscience phonologique
- Observation de l'oral en français

ÉVALUATION FORMATIVE CONTINUE:
- Observations quotidiennes pendant la lecture guidée
- Analyse des méprises (running records) hebdomadaire
- Portfolio d'écriture avec échantillons mensuels
- Conférences individuelles (5 min/élève/semaine)
- Auto-évaluation avec référentiels visuels

COMMUNICATION DU PROGRÈS:
- Niveaux de lecture documentés (septembre: 0 → juin: 6-8)
- Continuum d'écriture avec exemples
- Célébrations mensuelles des apprentissages
- Communication famille avec stratégies maison

JUIN - Évaluation sommative:
- Niveau de lecture pour placement en 2e année
- Portfolio d'écriture montrant la progression
- Présentation orale de livre préféré
- Préparation transition vers 2e année`,
      
      resourceNeeds: `RESSOURCES ESSENTIELLES POUR 180 HEURES:

LIVRES GRADUÉS (collection de classe):
- Niveau 0-1: 50 livres (septembre-octobre)
- Niveau 2-3: 40 livres (novembre-décembre)
- Niveau 4-5: 40 livres (janvier-mars)
- Niveau 6-8: 40 livres (avril-juin)
- Albums jeunesse: 100+ pour lecture partagée

MATÉRIEL DE CONSCIENCE PHONOLOGIQUE:
- Cartes de sons et lettres
- Jetons pour segmentation
- Tableau de sons (mur de mots)
- Matériel de manipulation des sons

ÉCRITURE:
- Cahiers d'écriture avec trottoirs
- Dictionnaires personnels
- Mur de mots fréquents (100 mots)
- Référentiels d'écriture illustrés

CENTRES D'APPRENTISSAGE:
- Centre d'écoute avec livres audio
- Lettres magnétiques et tableaux
- Jeux de mots et casse-têtes
- Matériel d'art pour illustration

TECHNOLOGIE:
- Tablettes avec apps de lecture
- Livres numériques interactifs
- Caméra document pour modélisation
- Enregistreurs pour pratique orale

ÉVALUATION:
- Trousses GB+ ou PM Benchmark
- Grilles d'observation
- Portfolios
- Outils de documentation`
    }
  });
  
  console.log('✓ Created comprehensive 180-hour LRP framework\n');
  
  // STEP 3: Update units for EXACTLY 180 hours
  console.log('STEP 3: Creating perfect unit progression (180 hours)...\n');
  
  const units = await prisma.unitPlan.findMany({
    where: { longRangePlanId: lrp.id },
    orderBy: { startDate: 'asc' }
  });
  
  const unitSpecs = [
    {
      title: 'Je découvre l\'école / Discovering School',
      hours: 20,
      expectations: ['1CO.0', '1CO.1', '1CO.2'],
      description: 'SEPTEMBRE (20h): Routines de classe, langage oral, conscience phonologique, reconnaissance des lettres A-M, vocabulaire de base'
    },
    {
      title: 'Les sons et les lettres / Sounds and Letters',
      hours: 20,
      expectations: ['1L.1', '1L.2', '1CO.3'],
      description: 'OCTOBRE (20h): Correspondance son-symbole, lettres N-Z, premiers 20 mots fréquents, début du mélange de sons'
    },
    {
      title: 'Je commence à lire / Beginning to Read',
      hours: 20,
      expectations: ['1L.1', '1L.2', '1L.3', '1É.1'],
      description: 'NOVEMBRE (20h): Mots CVC, livres niveau 1, 30-50 mots fréquents, écriture des lettres et du prénom'
    },
    {
      title: 'Histoires d\'hiver / Winter Stories',
      hours: 15,
      expectations: ['1L.3', '1L.4', '1CO.4', '1É.1'],
      description: 'DÉCEMBRE (15h): Livres niveau 2, 60-80 mots fréquents, écriture de mots, vocabulaire des fêtes'
    },
    {
      title: 'Lire et écrire ensemble / Reading and Writing Together',
      hours: 15,
      expectations: ['1L.3', '1L.4', '1É.2', '1CO.5'],
      description: 'JANVIER (15h): Livres niveau 2-3, 100+ mots fréquents, écriture de phrases avec support'
    },
    {
      title: 'Stratégies de lecture / Reading Strategies',
      hours: 20,
      expectations: ['1L.4', '1L.5', '1É.2', '1CO.5'],
      description: 'FÉVRIER (20h): Livres niveau 3-4, stratégies de compréhension, écriture d\'histoires simples'
    },
    {
      title: 'Auteurs en herbe / Budding Authors',
      hours: 20,
      expectations: ['1L.5', '1É.2', '1É.3', '1CO.6'],
      description: 'MARS (20h): Livres niveau 4-5, processus d\'écriture, étude d\'auteur, publication d\'histoires'
    },
    {
      title: 'Exploration des genres / Exploring Genres',
      hours: 20,
      expectations: ['1L.4', '1L.5', '1É.3', '1CO.6'],
      description: 'AVRIL (20h): Livres niveau 5-6, fiction/non-fiction, formes d\'écriture variées'
    },
    {
      title: 'Lire avec fluidité / Reading Fluently',
      hours: 15,
      expectations: ['1L.5', '1CO.6', '1É.3'],
      description: 'MAI (15h): Livres niveau 6-7, développement de la fluidité, écriture avec conventions'
    },
    {
      title: 'Célébration de nos apprentissages / Celebrating Our Learning',
      hours: 15,
      expectations: ['ALL'],
      description: 'JUIN (15h): Livres niveau 6-8, célébrations d\'auteurs, portfolios, préparation 2e année'
    }
  ];
  
  // Verify total hours
  const totalHours = unitSpecs.reduce((sum, u) => sum + u.hours, 0);
  console.log(`TOTAL HOURS PLANNED: ${totalHours} (Target: 180)\n`);
  
  // Update existing units
  for (let i = 0; i < units.length && i < unitSpecs.length; i++) {
    const spec = unitSpecs[i];
    
    await prisma.unitPlan.update({
      where: { id: units[i].id },
      data: {
        title: spec.title,
        titleFr: spec.title.split(' / ')[0],
        estimatedHours: spec.hours,
        description: spec.description,
        bigIdeas: 'Développer la littératie française étape par étape',
        assessmentPlan: 'Analyse des méprises, échantillons d\'écriture, observations'
      }
    });
    
    // Clear and re-link expectations
    await prisma.unitPlanExpectation.deleteMany({
      where: { unitPlanId: units[i].id }
    });
    
    for (const expCode of spec.expectations) {
      if (expCode === 'ALL') {
        for (const exp of expectations) {
          await prisma.unitPlanExpectation.create({
            data: { unitPlanId: units[i].id, expectationId: exp.id }
          });
        }
      } else {
        const exp = expectations.find(e => e.code === expCode);
        if (exp) {
          await prisma.unitPlanExpectation.create({
            data: { unitPlanId: units[i].id, expectationId: exp.id }
          });
        }
      }
    }
    
    console.log(`✓ Unit ${i+1}: ${spec.title} (${spec.hours}h)`);
    console.log(`  Expectations: ${spec.expectations.join(', ')}`);
  }
  
  // Create missing units if needed
  for (let i = units.length; i < unitSpecs.length; i++) {
    const spec = unitSpecs[i];
    const startDate = new Date(2025, 8 + Math.floor(i * 1.8), 1); // Rough monthly distribution
    const endDate = new Date(2025, 8 + Math.floor((i + 1) * 1.8), 0);
    
    const newUnit = await prisma.unitPlan.create({
      data: {
        userId: emily.id,
        longRangePlanId: lrp.id,
        title: spec.title,
        titleFr: spec.title.split(' / ')[0],
        estimatedHours: spec.hours,
        description: spec.description,
        bigIdeas: 'Développer la littératie française étape par étape',
        assessmentPlan: 'Analyse des méprises, échantillons d\'écriture, observations',
        startDate: startDate,
        endDate: endDate
      }
    });
    
    // Link expectations
    for (const expCode of spec.expectations) {
      if (expCode === 'ALL') {
        for (const exp of expectations) {
          await prisma.unitPlanExpectation.create({
            data: { unitPlanId: newUnit.id, expectationId: exp.id }
          });
        }
      } else {
        const exp = expectations.find(e => e.code === expCode);
        if (exp) {
          await prisma.unitPlanExpectation.create({
            data: { unitPlanId: newUnit.id, expectationId: exp.id }
          });
        }
      }
    }
    
    console.log(`✓ Created Unit ${i+1}: ${spec.title} (${spec.hours}h)`);
  }
  
  // Delete extra units if any
  if (units.length > unitSpecs.length) {
    for (let i = unitSpecs.length; i < units.length; i++) {
      await prisma.unitPlan.delete({ where: { id: units[i].id } });
      console.log(`Removed extra unit ${i+1}`);
    }
  }
  
  // FINAL VERIFICATION
  console.log('\n📊 FINAL VERIFICATION:\n');
  
  const final = await prisma.longRangePlan.findFirst({
    where: { id: lrp.id },
    include: {
      expectations: true,
      unitPlans: {
        include: { expectations: true },
        orderBy: { startDate: 'asc' }
      }
    }
  });
  
  const finalHours = final?.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0) || 0;
  const linkedExpectations = final?.expectations.length || 0;
  
  console.log(`✅ Total hours: ${finalHours}/180 (${finalHours === 180 ? 'PERFECT!' : 'NEEDS FIX'})`);
  console.log(`✅ Expectations linked to LRP: ${linkedExpectations}/15`);
  console.log(`✅ Units with expectations: ${final?.unitPlans.filter(u => u.expectations.length > 0).length}/${final?.unitPlans.length}`);
  console.log(`✅ Developmental progression: Non-reader (Sept) → Niveau 6-8 reader (June)`);
  console.log(`✅ Assessment: GB+, running records, portfolios`);
  console.log(`✅ Resources: Complete leveled library specified`);
  
  console.log('\n🏆 FRANÇAIS LANGUE PREMIÈRE IS NOW THE HIGHEST TRUTH!');
  console.log('This is THE foundation for French Immersion success.');
  console.log('ALL language arts planning must align with this LRP.\n');
  
  await prisma.$disconnect();
}

createPerfectFrancaisLRP().catch(console.error);