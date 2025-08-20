import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UnitUpdate {
  id: string;
  title: string;
  estimatedHours: number;
  successCriteria: any;
  enduringUnderstandings: string;
}

async function perfectFrenchUnits() {
  try {
    console.log('🎯 Starting French Unit Plans Perfection Process...\n');
    
    // Find Emily's user ID
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      throw new Error('Emily McIsaac not found in database');
    }
    
    console.log(`✅ Found Emily McIsaac (ID: ${emily.id})\n`);
    
    // Get French LRP
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: { 
        userId: emily.id,
        subject: 'Français (Immersion)'
      }
    });
    
    if (!frenchLRP) {
      throw new Error('French Long Range Plan not found');
    }
    
    console.log(`✅ Found French LRP (ID: ${frenchLRP.id})\n`);
    
    // Get all French units
    const frenchUnits = await prisma.unitPlan.findMany({
      where: { 
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`📚 Found ${frenchUnits.length} French units to update\n`);
    
    // Define updates for each unit
    const unitUpdates: UnitUpdate[] = [
      {
        id: frenchUnits[0].id,
        title: 'Bienvenue à l\'école!',
        estimatedHours: 19,
        successCriteria: {
          oral: [
            "Je peux saluer mes amis et mon enseignante en français",
            "Je peux dire mon nom et mon âge",
            "Je peux nommer les objets de la classe",
            "Je peux suivre les routines de classe en français"
          ],
          reading: [
            "Je peux reconnaître mon nom écrit",
            "Je peux identifier les lettres de l'alphabet français",
            "Je peux associer des images aux mots de la classe"
          ],
          writing: [
            "Je peux écrire mon prénom",
            "Je peux tracer les lettres de l'alphabet"
          ]
        },
        enduringUnderstandings: "L'école est un lieu d'apprentissage et d'amitié où nous parlons français ensemble pour découvrir le monde."
      },
      {
        id: frenchUnits[1].id,
        title: 'Ma famille et moi',
        estimatedHours: 19,
        successCriteria: {
          oral: [
            "Je peux présenter les membres de ma famille",
            "Je peux décrire mon apparence physique",
            "Je peux exprimer mes sentiments envers ma famille",
            "Je peux parler de mes activités familiales préférées"
          ],
          reading: [
            "Je peux lire les mots de la famille (maman, papa, frère, sœur)",
            "Je peux comprendre une histoire simple sur la famille",
            "Je peux associer des photos aux descriptions familiales"
          ],
          writing: [
            "Je peux écrire les noms de ma famille",
            "Je peux dessiner et étiqueter ma famille"
          ]
        },
        enduringUnderstandings: "Chaque famille est unique et spéciale, et nous pouvons partager notre amour familial en français."
      },
      {
        id: frenchUnits[2].id,
        title: 'Les couleurs d\'automne',
        estimatedHours: 19,
        successCriteria: {
          oral: [
            "Je peux nommer toutes les couleurs de l'arc-en-ciel",
            "Je peux décrire les changements de l'automne",
            "Je peux exprimer mes préférences de couleurs",
            "Je peux raconter une promenade d'automne"
          ],
          reading: [
            "Je peux lire les noms des couleurs",
            "Je peux comprendre des descriptions simples de l'automne",
            "Je peux suivre une recette de bricolage d'automne"
          ],
          writing: [
            "Je peux écrire les noms des couleurs",
            "Je peux créer un poème d'automne avec des couleurs"
          ]
        },
        enduringUnderstandings: "La nature change avec les saisons et nous offre une palette de couleurs magnifiques à observer et décrire."
      },
      {
        id: frenchUnits[3].id,
        title: 'Les fêtes d\'automne',
        estimatedHours: 19,
        successCriteria: {
          oral: [
            "Je peux parler des traditions de l'Halloween",
            "Je peux exprimer ma gratitude à l'Action de grâce",
            "Je peux décrire mon costume préféré",
            "Je peux partager les traditions Mi'kmaq de la récolte"
          ],
          reading: [
            "Je peux lire des histoires sur les fêtes d'automne",
            "Je peux comprendre des invitations et des cartes de fête",
            "Je peux suivre les étapes d'une recette traditionnelle"
          ],
          writing: [
            "Je peux écrire une carte de remerciement",
            "Je peux créer une liste de gratitude"
          ]
        },
        enduringUnderstandings: "Les célébrations d'automne nous permettent de partager nos traditions culturelles et d'exprimer notre gratitude."
      },
      {
        id: frenchUnits[4].id,
        title: 'L\'automne finit',
        estimatedHours: 18.5,
        successCriteria: {
          oral: [
            "Je peux décrire les préparatifs des animaux pour l'hiver",
            "Je peux raconter comment les arbres changent",
            "Je peux expliquer pourquoi les jours raccourcissent",
            "Je peux partager mes observations de la nature"
          ],
          reading: [
            "Je peux lire des textes informatifs sur les animaux",
            "Je peux comprendre le cycle de vie des arbres",
            "Je peux suivre un calendrier des saisons"
          ],
          writing: [
            "Je peux tenir un journal d'observations naturelles",
            "Je peux écrire des phrases sur les animaux"
          ]
        },
        enduringUnderstandings: "La nature se prépare pour l'hiver et nous pouvons apprendre en observant les changements autour de nous."
      },
      {
        id: frenchUnits[5].id,
        title: 'L\'hiver commence',
        estimatedHours: 18.5,
        successCriteria: {
          oral: [
            "Je peux décrire le temps d'hiver",
            "Je peux nommer les vêtements d'hiver",
            "Je peux expliquer comment rester en sécurité en hiver",
            "Je peux raconter mes activités hivernales préférées"
          ],
          reading: [
            "Je peux lire un bulletin météo simple",
            "Je peux comprendre des consignes de sécurité hivernale",
            "Je peux suivre des instructions pour s'habiller"
          ],
          writing: [
            "Je peux écrire une liste de vêtements d'hiver",
            "Je peux créer un bulletin météo illustré"
          ]
        },
        enduringUnderstandings: "L'hiver apporte des changements qui nous demandent de nous adapter et de profiter de nouvelles activités."
      },
      {
        id: frenchUnits[6].id,
        title: 'Les fêtes d\'hiver',
        estimatedHours: 18.5,
        successCriteria: {
          oral: [
            "Je peux parler des différentes célébrations d'hiver",
            "Je peux chanter des chansons de fête",
            "Je peux exprimer mes souhaits pour la nouvelle année",
            "Je peux partager mes traditions familiales"
          ],
          reading: [
            "Je peux lire des cartes de vœux",
            "Je peux comprendre des histoires de célébrations diverses",
            "Je peux suivre un calendrier des fêtes"
          ],
          writing: [
            "Je peux écrire une carte de vœux",
            "Je peux créer une liste de souhaits"
          ]
        },
        enduringUnderstandings: "Les fêtes d'hiver célèbrent la lumière, l'espoir et le partage dans toutes les cultures."
      },
      {
        id: frenchUnits[7].id,
        title: 'Vacances et famille',
        estimatedHours: 18.5,
        successCriteria: {
          oral: [
            "Je peux raconter mes vacances d'hiver",
            "Je peux décrire les activités familiales spéciales",
            "Je peux partager mes moments préférés",
            "Je peux exprimer mes émotions des vacances"
          ],
          reading: [
            "Je peux lire des récits de vacances",
            "Je peux comprendre des albums photos avec descriptions",
            "Je peux suivre un itinéraire simple"
          ],
          writing: [
            "Je peux écrire un journal de vacances",
            "Je peux créer des légendes pour mes photos"
          ]
        },
        enduringUnderstandings: "Les vacances en famille créent des souvenirs précieux que nous pouvons partager en français."
      },
      {
        id: frenchUnits[8].id,
        title: 'Nouvelle année',
        estimatedHours: 18,
        successCriteria: {
          oral: [
            "Je peux parler de mes résolutions",
            "Je peux exprimer mes objectifs d'apprentissage",
            "Je peux décrire comment j'ai grandi",
            "Je peux encourager mes amis"
          ],
          reading: [
            "Je peux lire des histoires sur les nouveaux départs",
            "Je peux comprendre un calendrier annuel",
            "Je peux suivre des objectifs écrits"
          ],
          writing: [
            "Je peux écrire mes résolutions",
            "Je peux créer un calendrier personnel"
          ]
        },
        enduringUnderstandings: "Une nouvelle année nous offre l'opportunité de grandir, d'apprendre et de nous améliorer."
      },
      {
        id: frenchUnits[9].id,
        title: 'L\'hiver magique',
        estimatedHours: 18,
        successCriteria: {
          oral: [
            "Je peux décrire la beauté de l'hiver",
            "Je peux raconter des histoires imaginaires d'hiver",
            "Je peux expliquer les phénomènes hivernaux",
            "Je peux créer des personnages d'hiver"
          ],
          reading: [
            "Je peux lire des contes d'hiver",
            "Je peux comprendre des textes sur la neige et la glace",
            "Je peux suivre des instructions de bricolage hivernal"
          ],
          writing: [
            "Je peux écrire une histoire d'hiver",
            "Je peux créer des descriptions poétiques"
          ]
        },
        enduringUnderstandings: "L'hiver inspire notre imagination et nous permet de créer des histoires merveilleuses."
      },
      {
        id: frenchUnits[10].id,
        title: 'L\'amitié',
        estimatedHours: 18,
        successCriteria: {
          oral: [
            "Je peux décrire les qualités d'un bon ami",
            "Je peux résoudre des conflits avec des mots gentils",
            "Je peux exprimer mes sentiments d'amitié",
            "Je peux inviter des amis à jouer"
          ],
          reading: [
            "Je peux lire des histoires sur l'amitié",
            "Je peux comprendre des messages d'amis",
            "Je peux suivre des règles de jeux coopératifs"
          ],
          writing: [
            "Je peux écrire une lettre à un ami",
            "Je peux créer un livre sur l'amitié"
          ]
        },
        enduringUnderstandings: "L'amitié se construit avec la gentillesse, le partage et le respect mutuel."
      },
      {
        id: frenchUnits[11].id,
        title: 'Les animaux d\'hiver',
        estimatedHours: 18,
        successCriteria: {
          oral: [
            "Je peux décrire comment les animaux survivent l'hiver",
            "Je peux comparer différentes adaptations animales",
            "Je peux raconter la journée d'un animal en hiver",
            "Je peux expliquer l'hibernation et la migration"
          ],
          reading: [
            "Je peux lire des textes informatifs sur les animaux",
            "Je peux comprendre des diagrammes d'habitats",
            "Je peux suivre le cycle de vie des animaux"
          ],
          writing: [
            "Je peux écrire des fiches d'information animale",
            "Je peux créer un journal d'observation"
          ]
        },
        enduringUnderstandings: "Les animaux ont des stratégies fascinantes pour survivre l'hiver que nous pouvons observer et respecter."
      },
      {
        id: frenchUnits[12].id,
        title: 'Le printemps arrive',
        estimatedHours: 17.625,
        successCriteria: {
          oral: [
            "Je peux décrire les signes du printemps",
            "Je peux expliquer le cycle de vie des plantes",
            "Je peux raconter le retour des oiseaux",
            "Je peux partager mes activités printanières"
          ],
          reading: [
            "Je peux lire des textes sur le renouveau",
            "Je peux comprendre le cycle des saisons",
            "Je peux suivre les étapes de la germination"
          ],
          writing: [
            "Je peux écrire un poème du printemps",
            "Je peux tenir un journal de jardinage"
          ]
        },
        enduringUnderstandings: "Le printemps symbolise le renouveau et nous montre le cycle perpétuel de la vie."
      },
      {
        id: frenchUnits[13].id,
        title: 'Ma communauté',
        estimatedHours: 17.625,
        successCriteria: {
          oral: [
            "Je peux décrire les endroits importants de ma communauté",
            "Je peux expliquer les métiers de ma communauté",
            "Je peux donner des directions simples",
            "Je peux parler de comment aider ma communauté"
          ],
          reading: [
            "Je peux lire des panneaux et enseignes",
            "Je peux comprendre des cartes simples",
            "Je peux suivre des descriptions de lieux"
          ],
          writing: [
            "Je peux écrire des adresses",
            "Je peux créer un guide de ma communauté"
          ]
        },
        enduringUnderstandings: "Notre communauté est un réseau de personnes et de lieux qui travaillent ensemble pour créer un endroit où il fait bon vivre."
      },
      {
        id: frenchUnits[14].id,
        title: 'Le printemps grandit',
        estimatedHours: 17.625,
        successCriteria: {
          oral: [
            "Je peux décrire la croissance des plantes",
            "Je peux expliquer les besoins des êtres vivants",
            "Je peux raconter mes observations du jardin",
            "Je peux partager mes découvertes scientifiques"
          ],
          reading: [
            "Je peux lire des instructions de jardinage",
            "Je peux comprendre des diagrammes de croissance",
            "Je peux suivre des expériences scientifiques simples"
          ],
          writing: [
            "Je peux écrire des observations scientifiques",
            "Je peux créer un livre sur les plantes"
          ]
        },
        enduringUnderstandings: "Observer la croissance nous enseigne la patience et nous connecte au cycle de la vie."
      },
      {
        id: frenchUnits[15].id,
        title: 'Célébrons l\'année',
        estimatedHours: 17.625,
        successCriteria: {
          oral: [
            "Je peux raconter mes moments préférés de l'année",
            "Je peux décrire mes apprentissages importants",
            "Je peux exprimer ma fierté pour mes progrès",
            "Je peux remercier ceux qui m'ont aidé"
          ],
          reading: [
            "Je peux lire mes travaux de l'année",
            "Je peux comprendre des réflexions sur l'apprentissage",
            "Je peux suivre une ligne du temps annuelle"
          ],
          writing: [
            "Je peux écrire une réflexion sur mon année",
            "Je peux créer un portfolio de mes meilleurs travaux"
          ]
        },
        enduringUnderstandings: "Chaque année d'apprentissage nous fait grandir et nous prépare pour de nouvelles aventures."
      }
    ];
    
    // Update each unit
    console.log('📝 Updating units with perfected data...\n');
    
    for (const update of unitUpdates) {
      console.log(`  Updating: ${update.title}`);
      console.log(`    - Hours: ${update.estimatedHours}`);
      console.log(`    - Success Criteria: ${Object.keys(update.successCriteria).map(k => `${update.successCriteria[k].length} ${k}`).join(', ')}`);
      console.log(`    - Enduring Understanding: ✓`);
      
      await prisma.unitPlan.update({
        where: { id: update.id },
        data: {
          estimatedHours: update.estimatedHours,
          successCriteria: update.successCriteria,
          enduringUnderstandings: update.enduringUnderstandings
        }
      });
      
      console.log('    ✅ Updated successfully\n');
    }
    
    // Verify total hours
    const updatedUnits = await prisma.unitPlan.findMany({
      where: { 
        userId: emily.id,
        longRangePlanId: frenchLRP.id
      },
      select: {
        title: true,
        estimatedHours: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    const totalHours = updatedUnits.reduce((sum, unit) => sum + (unit.estimatedHours || 0), 0);
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 FINAL VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Total Units: ${updatedUnits.length}`);
    console.log(`  Total Hours: ${totalHours} (Required: 292.5)`);
    console.log(`  Status: ${totalHours === 292.5 ? '✅ PERFECT!' : '⚠️ MISMATCH'}`);
    console.log('');
    
    console.log('📋 Hour Distribution:');
    updatedUnits.forEach((unit, index) => {
      console.log(`  ${index + 1}. ${unit.title}: ${unit.estimatedHours} hours`);
    });
    
    console.log('\n✨ French Unit Plans Perfection Complete!');
    console.log('   - All units have corrected hours');
    console.log('   - All units have success criteria');
    console.log('   - All units have enduring understandings');
    console.log('   - Total: 292.5 hours of French instruction');
    
  } catch (error) {
    console.error('❌ Error perfecting French units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the perfection process
perfectFrenchUnits();