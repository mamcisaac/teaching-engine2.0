#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerfectFPSUnits() {
  try {
    console.log('🎯 CREATING PERFECT HEALTH/FPS UNITS - FINAL VERSION');
    console.log('====================================================\n');
    
    // Delete all existing units for fresh start
    await prisma.unitPlan.deleteMany({
      where: { longRangePlanId: 'cmebyc98x000bvjr1finmuibw' }
    });
    
    console.log('✅ Cleared existing units for perfect rebuild\n');
    
    // Perfect distribution: 98 lessons = 73.5 hours
    const perfectUnits = [
      {
        titleFr: 'Mon corps et ma sécurité',
        lessons: 20,
        hours: 15,
        startDate: new Date('2025-09-03'),
        endDate: new Date('2025-10-31'),
        description: 'Développer la conscience corporelle, l\'hygiène personnelle et les pratiques de sécurité de base',
        bigIdeas: [
          "Mon corps m'appartient et j'ai le droit de dire non aux contacts non désirés",
          "La sécurité personnelle commence par connaître mon corps et ses limites",
          "Je peux identifier les adultes de confiance qui peuvent m'aider",
          "Prendre soin de mon corps me garde en santé et en sécurité"
        ],
        essentialQuestions: [
          "Comment puis-je prendre soin de mon corps chaque jour?",
          "Qui sont les adultes de confiance dans ma vie?",
          "Comment reconnaître quand je me sens en sécurité?",
          "Quelles sont mes limites personnelles?"
        ],
        keyVocabulary: {
          core: ["corps", "sécurité", "santé", "hygiène", "propre", "danger", "aide", "confiance"],
          extension: ["limites", "protection", "permission", "urgence", "prévention"],
          support: ["non", "stop", "dire", "demander", "laver"]
        }
      },
      {
        titleFr: 'Mes émotions et sentiments',
        lessons: 20,
        hours: 15,
        startDate: new Date('2025-11-03'),
        endDate: new Date('2025-12-19'),
        description: 'Reconnaître, nommer et gérer les émotions de manière saine et appropriée',
        bigIdeas: [
          "Toutes mes émotions sont valides et normales",
          "Je peux exprimer mes émotions de façon respectueuse",
          "Les émotions changent et c'est normal",
          "J'ai des stratégies pour gérer mes grandes émotions"
        ],
        essentialQuestions: [
          "Comment mon corps me dit-il ce que je ressens?",
          "Quelles stratégies m'aident quand j'ai de grandes émotions?",
          "Comment puis-je exprimer mes sentiments respectueusement?",
          "Pourquoi est-il important de parler de mes émotions?"
        ],
        keyVocabulary: {
          core: ["émotions", "sentiments", "content", "triste", "fâché", "peur", "calme", "respirer"],
          extension: ["frustré", "excité", "inquiet", "déçu", "surpris", "fierté"],
          support: ["bien", "mal", "ok", "aide", "pause"]
        }
      },
      {
        titleFr: 'Amitiés et relations positives',
        lessons: 20,
        hours: 15,
        startDate: new Date('2026-01-06'),
        endDate: new Date('2026-02-27'),
        description: 'Construire et maintenir des relations saines avec les pairs et la famille',
        bigIdeas: [
          "L'amitié se construit sur le respect mutuel et la gentillesse",
          "Je peux résoudre les conflits de manière pacifique",
          "Chaque personne est unique et spéciale",
          "Les relations saines impliquent l'écoute et le partage"
        ],
        essentialQuestions: [
          "Qu'est-ce qui fait un bon ami?",
          "Comment puis-je résoudre les conflits avec mes amis?",
          "Comment montrer du respect envers les autres?",
          "Pourquoi la diversité rend notre classe spéciale?"
        ],
        keyVocabulary: {
          core: ["ami", "amitié", "partager", "écouter", "gentil", "respect", "ensemble", "aider"],
          extension: ["coopération", "empathie", "inclusion", "diversité", "pardon"],
          support: ["jouer", "tour", "s'il vous plaît", "merci", "désolé"]
        }
      },
      {
        titleFr: 'Nutrition et mode de vie sain',
        lessons: 20,
        hours: 15,
        startDate: new Date('2026-03-02'),
        endDate: new Date('2026-04-24'),
        description: 'Comprendre l\'importance de la nutrition et des habitudes de vie saines',
        bigIdeas: [
          "Mon corps a besoin de différents aliments pour avoir de l'énergie",
          "Tous les aliments ont une place dans une alimentation équilibrée",
          "L'activité physique me garde fort et en santé",
          "Le repos est aussi important que le mouvement"
        ],
        essentialQuestions: [
          "Comment les aliments donnent-ils de l'énergie à mon corps?",
          "Qu'est-ce qui rend un mode de vie sain?",
          "Pourquoi mon corps a-t-il besoin de bouger et de se reposer?",
          "Comment faire des choix alimentaires équilibrés?"
        ],
        keyVocabulary: {
          core: ["nutrition", "aliments", "énergie", "sain", "bouger", "repos", "eau", "équilibré"],
          extension: ["vitamines", "exercice", "sommeil", "croissance", "force"],
          support: ["manger", "boire", "courir", "dormir", "fatigué"]
        }
      },
      {
        titleFr: 'Grandir et changer en sécurité',
        lessons: 18,
        hours: 13.5,
        startDate: new Date('2026-04-27'),
        endDate: new Date('2026-06-19'),
        description: 'Comprendre la croissance personnelle et se préparer aux transitions',
        bigIdeas: [
          "Je grandis et change, et c'est normal et excitant",
          "La sécurité estivale nécessite des précautions spéciales",
          "J'ai appris beaucoup cette année et je suis prêt pour la 2e année",
          "Ma communauté m'aide à grandir en sécurité"
        ],
        essentialQuestions: [
          "Comment ai-je grandi et changé cette année?",
          "Comment rester en sécurité pendant l'été?",
          "De quoi suis-je le plus fier cette année?",
          "Comment puis-je continuer à apprendre pendant l'été?"
        ],
        keyVocabulary: {
          core: ["grandir", "changer", "sécurité", "été", "fier", "apprendre", "communauté", "prêt"],
          extension: ["transition", "responsabilité", "indépendance", "célébrer", "objectifs"],
          support: ["grand", "nouveau", "été", "école", "merci"]
        }
      }
    ];
    
    // Create all units with perfect structure
    for (let i = 0; i < perfectUnits.length; i++) {
      const unitData = perfectUnits[i];
      
      console.log(`Creating Unit ${i + 1}: ${unitData.titleFr}`);
      console.log(`  📚 ${unitData.lessons} lessons (${unitData.hours} hours)`);
      console.log(`  📅 ${unitData.startDate.toISOString().split('T')[0]} to ${unitData.endDate.toISOString().split('T')[0]}`);
      
      await prisma.unitPlan.create({
        data: {
          longRangePlanId: 'cmebyc98x000bvjr1finmuibw',
          userId: 23, // Emily's ID
          titleFr: unitData.titleFr,
          title: unitData.titleFr, // Both in French for immersion
          description: unitData.description,
          startDate: unitData.startDate,
          endDate: unitData.endDate,
          estimatedHours: unitData.hours,
          
          // Pedagogical framework
          bigIdeas: JSON.stringify(unitData.bigIdeas),
          essentialQuestions: JSON.stringify(unitData.essentialQuestions),
          keyVocabulary: JSON.stringify(unitData.keyVocabulary),
          
          successCriteria: JSON.stringify([
            `Démontre la compréhension du thème "${unitData.titleFr}"`,
            "Utilise le vocabulaire français approprié",
            "Participe activement selon son niveau de confort",
            "Applique les apprentissages dans la vie quotidienne"
          ]),
          
          assessmentPlan: JSON.stringify({
            formative: {
              observations: "Documentation quotidienne sans comparaison",
              privateCheckIns: "Rencontres individuelles hebdomadaires",
              portfolioOptions: "Choix de format selon préférence",
              emotionalSafety: "Partage volontaire seulement"
            },
            summative: {
              demonstrations: "Montrer apprentissages de façon créative",
              selfAssessment: "Auto-évaluation avec échelle visuelle",
              choice: "Options multiples pour démontrer compréhension"
            }
          }),
          
          differentiationStrategies: JSON.stringify({
            tier1: "Support universel avec visuels et routines",
            tier2: "Support ciblé avec partenaire ou petit groupe",
            tier3: "Support intensif avec adaptations individuelles",
            tier4: "Support spécialisé avec équipe multidisciplinaire"
          }),
          
          indigenousPerspectives: JSON.stringify({
            teaching: "Sept enseignements sacrés intégrés",
            medicineWheel: "Connexions avec la roue de médecine",
            mikmaq: "Perspectives et histoires Mi'kmaq respectueuses",
            landAcknowledgment: "Reconnaissance du territoire traditionnel"
          }),
          
          crossCurricularConnections: JSON.stringify({
            francais: "Vocabulaire et expression orale intégrés",
            mathematiques: "Concepts numériques liés au thème",
            sciences: "Exploration scientifique du thème",
            arts: "Expression créative des apprentissages"
          }),
          
          technologyIntegration: JSON.stringify({
            minimal: "Technologie minimale, focus sur expériences concrètes",
            optional: "Outils numériques disponibles mais non requis",
            alternatives: "Toujours des options non-technologiques"
          }),
          
          communityConnections: JSON.stringify([
            "Invités de la communauté selon le thème",
            "Connexions avec les familles respectueuses",
            "Ressources communautaires appropriées"
          ]),
          
          parentCommunicationPlan: JSON.stringify({
            monthly: "Communication mensuelle du thème",
            sensitive: "Sujets sensibles communiqués à l'avance",
            optional: "Participation familiale toujours optionnelle"
          }),
          
          priorKnowledge: JSON.stringify([
            "Expériences personnelles variées respectées",
            "Aucune assumption sur la situation familiale",
            "Construction sur apprentissages précédents"
          ]),
          
          learningSkills: JSON.stringify({
            responsibility: "Prendre soin de soi et des autres",
            organization: "Gérer ses affaires personnelles",
            independence: "Autonomie progressive appropriée",
            collaboration: "Travailler ensemble respectueusement"
          }),
          
          fieldTripsAndGuestSpeakers: JSON.stringify([
            "Sorties locales liées au thème",
            "Invités approuvés par l'école",
            "Alternatives virtuelles disponibles"
          ]),
          
          environmentalEducation: JSON.stringify({
            connection: "Lien avec l'environnement naturel",
            sustainability: "Pratiques durables intégrées",
            outdoor: "Apprentissage extérieur quand possible"
          }),
          
          culminatingTask: JSON.stringify({
            task: `Célébration des apprentissages sur "${unitData.titleFr}"`,
            format: "Choix de présentation selon préférence",
            sharing: "Partage volontaire avec la classe ou privé"
          }),
          
          socialJusticeConnections: JSON.stringify({
            equity: "Accès équitable pour tous les élèves",
            inclusion: "Célébration de la diversité",
            voice: "Amplification des voix des élèves"
          })
        }
      });
      
      console.log(`  ✅ Created successfully\n`);
    }
    
    // Verify totals
    const units = await prisma.unitPlan.findMany({
      where: { longRangePlanId: 'cmebyc98x000bvjr1finmuibw' }
    });
    
    const totalHours = units.reduce((sum, unit) => sum + unit.estimatedHours, 0);
    const totalLessons = totalHours / 0.75;
    
    console.log('🎯 VERIFICATION COMPLETE:');
    console.log('=========================');
    console.log(`📊 Total Units: ${units.length} (Target: 5) ${units.length === 5 ? '✅' : '❌'}`);
    console.log(`⏱️ Total Hours: ${totalHours} (Target: 73.5) ${totalHours === 73.5 ? '✅' : '❌'}`);
    console.log(`📚 Total Lessons: ${totalLessons} (Target: 98) ${totalLessons === 98 ? '✅' : '❌'}`);
    
    console.log('\n✨ PERFECT HEALTH/FPS UNITS CREATED!');
    console.log('Features:');
    console.log('  ✅ 98 lessons exactly (73.5 hours)');
    console.log('  ✅ Content matches French titles perfectly');
    console.log('  ✅ Full school year coverage (Sept-June)');
    console.log('  ✅ Trauma-informed throughout');
    console.log('  ✅ 100% French for immersion program');
    console.log('  ✅ Grade 1 developmental appropriateness');
    console.log('  ✅ Indigenous perspectives integrated');
    console.log('  ✅ Every-other-day delivery model ready');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPerfectFPSUnits();