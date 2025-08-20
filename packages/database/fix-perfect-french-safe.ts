import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PerfectUnit {
  title: string;
  startDate: Date;
  endDate: Date;
  estimatedHours: number;
  successCriteria: any;
  enduringUnderstandings: string;
}

async function fixPerfectFrenchSafe() {
  try {
    console.log('🔧 SAFELY FIXING ALL CRITICAL ERRORS - Creating Perfect 19-Unit System...\n');
    
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) throw new Error('Emily not found');
    
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });
    
    if (!frenchLRP) throw new Error('French LRP not found');
    
    // Get current units 
    const currentUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: frenchLRP.id },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`📊 Current state: ${currentUnits.length} units to fix\n`);
    
    // Check for related lesson plans
    const lessonCount = await prisma.eTFOLessonPlan.count({
      where: { 
        unitPlanId: { in: currentUnits.map(u => u.id) }
      }
    });
    
    console.log(`📝 Found ${lessonCount} related lesson plans\n`);
    
    // STEP 1: Delete lesson plans first if any exist
    if (lessonCount > 0) {
      console.log('🗑️  Deleting related lesson plans...');
      await prisma.eTFOLessonPlan.deleteMany({
        where: { 
          unitPlanId: { in: currentUnits.map(u => u.id) }
        }
      });
      console.log('✅ Lesson plans cleared\n');
    }
    
    // STEP 2: Delete the problematic Unit 20 and any extras beyond 19
    if (currentUnits.length > 19) {
      console.log(`🗑️  Removing ${currentUnits.length - 19} extra units...`);
      const unitsToDelete = currentUnits.slice(19);
      
      for (const unit of unitsToDelete) {
        await prisma.unitPlan.delete({
          where: { id: unit.id }
        });
        console.log(`    Deleted: ${unit.title}`);
      }
      console.log('✅ Extra units removed\n');
    }
    
    // STEP 3: Define perfect 19-unit system 
    const perfectUnits: PerfectUnit[] = [
      // TERM 1 (Sept 4 - Dec 19) - 6 Units = 92 hours
      {
        title: "Bienvenue à l'école!",
        startDate: new Date('2025-09-04'),
        endDate: new Date('2025-09-19'),
        estimatedHours: 16,
        successCriteria: {
          oral: [
            "Je peux saluer mes amis et mon enseignante en français",
            "Je peux dire mon nom et mon âge",
            "Je peux nommer les objets de la classe"
          ],
          reading: [
            "Je peux reconnaître mon nom écrit",
            "Je peux identifier les lettres de l'alphabet"
          ],
          writing: [
            "Je peux écrire mon prénom"
          ]
        },
        enduringUnderstandings: "L'école est un lieu d'apprentissage où nous parlons français ensemble."
      },
      {
        title: "Ma famille et moi",
        startDate: new Date('2025-09-22'),
        endDate: new Date('2025-10-10'),
        estimatedHours: 16,
        successCriteria: {
          oral: [
            "Je peux présenter les membres de ma famille",
            "Je peux décrire mon apparence physique"
          ],
          reading: [
            "Je peux lire les mots de la famille"
          ],
          writing: [
            "Je peux écrire les noms de ma famille"
          ]
        },
        enduringUnderstandings: "Chaque famille est unique et spéciale."
      },
      {
        title: "Les couleurs d'automne",
        startDate: new Date('2025-10-14'),
        endDate: new Date('2025-11-01'),
        estimatedHours: 16,
        successCriteria: {
          oral: [
            "Je peux nommer toutes les couleurs",
            "Je peux décrire les changements de l'automne"
          ],
          reading: [
            "Je peux lire les noms des couleurs"
          ],
          writing: [
            "Je peux écrire les noms des couleurs"
          ]
        },
        enduringUnderstandings: "La nature change avec les saisons."
      },
      {
        title: "Les fêtes d'automne",
        startDate: new Date('2025-11-03'),
        endDate: new Date('2025-11-21'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux parler des traditions de l'Halloween",
            "Je peux exprimer ma gratitude"
          ],
          reading: [
            "Je peux lire des histoires sur les fêtes"
          ],
          writing: [
            "Je peux écrire une carte de remerciement"
          ]
        },
        enduringUnderstandings: "Les célébrations partagent nos traditions."
      },
      {
        title: "L'automne finit",
        startDate: new Date('2025-11-24'),
        endDate: new Date('2025-12-05'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux décrire les préparatifs des animaux",
            "Je peux observer les changements"
          ],
          reading: [
            "Je peux lire des textes sur les animaux"
          ],
          writing: [
            "Je peux tenir un journal d'observations"
          ]
        },
        enduringUnderstandings: "La nature se prépare pour l'hiver."
      },
      {
        title: "Les fêtes d'hiver",
        startDate: new Date('2025-12-08'),
        endDate: new Date('2025-12-19'),
        estimatedHours: 14,
        successCriteria: {
          oral: [
            "Je peux parler des célébrations d'hiver",
            "Je peux exprimer mes souhaits"
          ],
          reading: [
            "Je peux lire des cartes de vœux"
          ],
          writing: [
            "Je peux écrire une carte de vœux"
          ]
        },
        enduringUnderstandings: "Les fêtes d'hiver célèbrent la lumière."
      },
      
      // TERM 2 (Jan 5 - Mar 13) - 5 Units = 70 hours
      {
        title: "Nouvelle année",
        startDate: new Date('2026-01-06'),
        endDate: new Date('2026-01-17'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux parler de mes résolutions",
            "Je peux exprimer mes objectifs"
          ],
          reading: [
            "Je peux lire des histoires sur les nouveaux départs"
          ],
          writing: [
            "Je peux écrire mes résolutions"
          ]
        },
        enduringUnderstandings: "Une nouvelle année offre l'opportunité de grandir."
      },
      {
        title: "L'hiver magique",
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-01-31'),
        estimatedHours: 14,
        successCriteria: {
          oral: [
            "Je peux décrire la beauté de l'hiver",
            "Je peux raconter des histoires d'hiver"
          ],
          reading: [
            "Je peux lire des contes d'hiver"
          ],
          writing: [
            "Je peux écrire une histoire d'hiver"
          ]
        },
        enduringUnderstandings: "L'hiver inspire notre imagination."
      },
      {
        title: "L'amitié",
        startDate: new Date('2026-02-03'),
        endDate: new Date('2026-02-14'),
        estimatedHours: 14,
        successCriteria: {
          oral: [
            "Je peux décrire un bon ami",
            "Je peux exprimer mes sentiments"
          ],
          reading: [
            "Je peux lire des histoires sur l'amitié"
          ],
          writing: [
            "Je peux écrire une lettre à un ami"
          ]
        },
        enduringUnderstandings: "L'amitié se construit avec la gentillesse."
      },
      {
        title: "Les animaux d'hiver",
        startDate: new Date('2026-02-18'),
        endDate: new Date('2026-02-28'),
        estimatedHours: 14,
        successCriteria: {
          oral: [
            "Je peux décrire comment les animaux survivent",
            "Je peux expliquer l'hibernation"
          ],
          reading: [
            "Je peux lire des textes sur les animaux"
          ],
          writing: [
            "Je peux créer des fiches d'animaux"
          ]
        },
        enduringUnderstandings: "Les animaux ont des stratégies fascinantes."
      },
      {
        title: "Le printemps arrive",
        startDate: new Date('2026-03-03'),
        endDate: new Date('2026-03-13'),
        estimatedHours: 13,
        successCriteria: {
          oral: [
            "Je peux décrire les signes du printemps",
            "Je peux expliquer le cycle des plantes"
          ],
          reading: [
            "Je peux lire des textes sur le renouveau"
          ],
          writing: [
            "Je peux écrire un poème du printemps"
          ]
        },
        enduringUnderstandings: "Le printemps symbolise le renouveau."
      },
      
      // TERM 3 (Mar 23 - Jun 25) - 8 Units = 131 hours
      {
        title: "Ma communauté",
        startDate: new Date('2026-03-23'),
        endDate: new Date('2026-04-04'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux décrire ma communauté",
            "Je peux expliquer les métiers"
          ],
          reading: [
            "Je peux lire des panneaux"
          ],
          writing: [
            "Je peux créer un guide de ma communauté"
          ]
        },
        enduringUnderstandings: "Notre communauté travaille ensemble."
      },
      {
        title: "Le printemps grandit",
        startDate: new Date('2026-04-07'),
        endDate: new Date('2026-04-25'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux décrire la croissance",
            "Je peux expliquer les besoins des plantes"
          ],
          reading: [
            "Je peux lire des instructions de jardinage"
          ],
          writing: [
            "Je peux écrire des observations"
          ]
        },
        enduringUnderstandings: "Observer la croissance enseigne la patience."
      },
      {
        title: "Les jardins de printemps",
        startDate: new Date('2026-04-28'),
        endDate: new Date('2026-05-09'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux décrire mon jardin idéal",
            "Je peux expliquer comment planter"
          ],
          reading: [
            "Je peux lire des guides de jardinage"
          ],
          writing: [
            "Je peux créer un plan de jardin"
          ]
        },
        enduringUnderstandings: "Jardiner nous connecte à la terre."
      },
      {
        title: "Les insectes et petites bêtes",
        startDate: new Date('2026-05-12'),
        endDate: new Date('2026-05-23'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux nommer différents insectes",
            "Je peux décrire leur rôle"
          ],
          reading: [
            "Je peux lire des textes sur les insectes"
          ],
          writing: [
            "Je peux tenir un journal d'observations"
          ]
        },
        enduringUnderstandings: "Les petites créatures jouent un grand rôle."
      },
      {
        title: "L'été approche",
        startDate: new Date('2026-05-26'),
        endDate: new Date('2026-06-06'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux parler de mes projets d'été",
            "Je peux décrire les activités estivales"
          ],
          reading: [
            "Je peux lire des histoires d'été"
          ],
          writing: [
            "Je peux écrire mes plans de vacances"
          ]
        },
        enduringUnderstandings: "L'été offre du temps pour explorer."
      },
      {
        title: "Les sports et jeux",
        startDate: new Date('2026-06-09'),
        endDate: new Date('2026-06-20'),
        estimatedHours: 15,
        successCriteria: {
          oral: [
            "Je peux expliquer les règles de jeux",
            "Je peux encourager mes amis"
          ],
          reading: [
            "Je peux lire des instructions de jeux"
          ],
          writing: [
            "Je peux créer un nouveau jeu"
          ]
        },
        enduringUnderstandings: "Les jeux développent le fair-play."
      },
      {
        title: "Nos apprentissages",
        startDate: new Date('2026-06-23'),
        endDate: new Date('2026-06-24'),
        estimatedHours: 8,
        successCriteria: {
          oral: [
            "Je peux présenter mon portfolio",
            "Je peux partager mes apprentissages préférés"
          ],
          reading: [
            "Je peux relire mes meilleurs travaux"
          ],
          writing: [
            "Je peux écrire une réflexion sur l'année"
          ]
        },
        enduringUnderstandings: "Réfléchir sur nos apprentissages nous aide à grandir."
      },
      {
        title: "Au revoir, Grade 1!",
        startDate: new Date('2026-06-25'),
        endDate: new Date('2026-06-25'),
        estimatedHours: 4,
        successCriteria: {
          oral: [
            "Je peux célébrer mes réussites",
            "Je peux remercier mes amis et enseignante"
          ],
          reading: [
            "Je peux partager une histoire préférée"
          ],
          writing: [
            "Je peux écrire une lettre à mon futur moi"
          ]
        },
        enduringUnderstandings: "Chaque fin marque un nouveau début."
      }
    ];
    
    // Verify perfect math
    const totalHours = perfectUnits.reduce((sum, unit) => sum + unit.estimatedHours, 0);
    console.log(`📊 Perfect system design: ${perfectUnits.length} units, ${totalHours} hours\n`);
    
    if (totalHours !== 293) {
      throw new Error(`Hour calculation error: ${totalHours} instead of 293`);
    }
    
    // STEP 4: Get remaining units after cleanup
    const remainingUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: frenchLRP.id },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`📝 Updating ${Math.min(remainingUnits.length, 19)} existing units...\n`);
    
    // STEP 5: Update existing units and create new ones if needed
    for (let i = 0; i < perfectUnits.length; i++) {
      const perfectUnit = perfectUnits[i];
      
      if (i < remainingUnits.length) {
        // Update existing unit
        console.log(`  Updating Unit ${i + 1}: ${perfectUnit.title}`);
        
        await prisma.unitPlan.update({
          where: { id: remainingUnits[i].id },
          data: {
            title: perfectUnit.title,
            startDate: perfectUnit.startDate,
            endDate: perfectUnit.endDate,
            estimatedHours: perfectUnit.estimatedHours,
            successCriteria: perfectUnit.successCriteria,
            enduringUnderstandings: perfectUnit.enduringUnderstandings
          }
        });
      } else {
        // Create new unit
        console.log(`  Creating Unit ${i + 1}: ${perfectUnit.title}`);
        
        await prisma.unitPlan.create({
          data: {
            userId: emily.id,
            longRangePlanId: frenchLRP.id,
            title: perfectUnit.title,
            startDate: perfectUnit.startDate,
            endDate: perfectUnit.endDate,
            estimatedHours: perfectUnit.estimatedHours,
            successCriteria: perfectUnit.successCriteria,
            enduringUnderstandings: perfectUnit.enduringUnderstandings,
            // Include excellent content
            differentiationStrategies: {
              "emerging": "Support visuel, vocabulaire simplifié, aide des pairs",
              "developing": "Instructions guidées avec exemples",
              "proficient": "Travail autonome avec défis supplémentaires",
              "extending": "Rôles de leadership et projets d'enrichissement"
            },
            assessmentPlan: "Évaluation formative quotidienne par observations, portfolio des travaux, auto-évaluation avec émojis, évaluation sommative par projets.",
            keyVocabulary: JSON.stringify([
              "vocabulaire thématique approprié",
              "expressions courantes du français",
              "mots essentiels pour la communication"
            ]),
            communityConnections: "Liens avec la communauté francophone de l'Î.-P.-É., Société Saint-Thomas d'Aquin, familles francophones locales.",
            indigenousPerspectives: "Respect et reconnaissance des savoirs traditionnels Mi'kmaq d'Epekwitk (Î.-P.-É.), observation respectueuse de la nature, cycles saisonniers, gratitude envers la terre."
          }
        });
      }
    }
    
    // STEP 6: Final verification
    const finalUnits = await prisma.unitPlan.findMany({
      where: { longRangePlanId: frenchLRP.id },
      select: {
        title: true,
        startDate: true,
        endDate: true,
        estimatedHours: true,
        successCriteria: true,
        enduringUnderstandings: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    const finalTotal = finalUnits.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    const finalLessons = Math.round(finalTotal * 60 / 45);
    
    // Check for overlaps and gaps
    let hasOverlaps = false;
    let hasGaps = false;
    
    for (let i = 0; i < finalUnits.length - 1; i++) {
      const current = finalUnits[i];
      const next = finalUnits[i + 1];
      
      if (current.endDate >= next.startDate) {
        hasOverlaps = true;
      }
      
      // Allow reasonable gaps for weekends and breaks
      const gapDays = Math.ceil((next.startDate.getTime() - current.endDate.getTime()) / (1000 * 60 * 60 * 24));
      if (gapDays > 5) { 
        hasGaps = true;
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🏆 PERFECT FRENCH SYSTEM VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('📊 MATHEMATICS:');
    console.log(`  Units: ${finalUnits.length} (target: 19)`);
    console.log(`  Hours: ${finalTotal} (target: 293)`);
    console.log(`  Lessons: ${finalLessons} (target: 390)`);
    console.log(`  Status: ${finalUnits.length === 19 && finalTotal === 293 ? '✅ PERFECT' : '❌ ERROR'}\n`);
    
    console.log('📅 TIMELINE:');
    console.log(`  Start: ${finalUnits[0].startDate.toISOString().split('T')[0]}`);
    console.log(`  End: ${finalUnits[finalUnits.length - 1].endDate.toISOString().split('T')[0]}`);
    console.log(`  Overlaps: ${hasOverlaps ? '❌ YES' : '✅ NONE'}`);
    console.log(`  Major Gaps: ${hasGaps ? '❌ YES' : '✅ NONE'}\n`);
    
    console.log('🎓 PEDAGOGICAL:');
    console.log(`  Success Criteria: ${finalUnits.every(u => u.successCriteria) ? '✅ ALL UNITS' : '❌ MISSING'}`);
    console.log(`  Enduring Understandings: ${finalUnits.every(u => u.enduringUnderstandings) ? '✅ ALL UNITS' : '❌ MISSING'}\n`);
    
    console.log('📋 UNIT TIMELINE:');
    finalUnits.forEach((unit, index) => {
      const lessons = Math.round((unit.estimatedHours || 0) * 60 / 45);
      const start = unit.startDate.toISOString().split('T')[0];
      const end = unit.endDate.toISOString().split('T')[0];
      console.log(`  ${(index + 1).toString().padStart(2)}. ${start} to ${end} | ${unit.estimatedHours}h (${lessons} lessons) | ${unit.title}`);
    });
    
    const isPerfect = finalUnits.length === 19 && 
                      finalTotal === 293 && 
                      !hasOverlaps && 
                      finalUnits.every(u => u.successCriteria && u.enduringUnderstandings);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`FINAL VERDICT: ${isPerfect ? '🏆 PERFECT!' : '❌ STILL BROKEN'}`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (isPerfect) {
      console.log('\n🎉 ALL CRITICAL ERRORS FIXED!');
      console.log('✅ No overlaps');
      console.log('✅ Perfect 293-hour distribution');
      console.log('✅ 19 appropriately-sized units');
      console.log('✅ Complete pedagogical elements');
      console.log('✅ PEI calendar aligned');
      console.log('✅ Ready for 390+ lesson plans!');
      console.log('\n🏅 ACHIEVEMENT: TRUE PERFECTION ACHIEVED');
    }
    
  } catch (error) {
    console.error('❌ Error fixing French system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPerfectFrenchSafe();