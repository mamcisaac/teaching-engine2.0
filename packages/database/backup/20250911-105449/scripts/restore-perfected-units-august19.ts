#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restorePerfectedUnits() {
  console.log('🔄 RESTORING PERFECTED UNIT PLANS FROM AUGUST 19');
  console.log('=================================================\n');
  
  try {
    // First, backup current state just in case
    const currentUnits = await prisma.unitPlan.findMany({
      where: { userId: 23 },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    const backupFileName = `backup-before-restore-${new Date().toISOString().replace(/:/g, '-')}.json`;
    fs.writeFileSync(backupFileName, JSON.stringify(currentUnits, null, 2));
    console.log(`📦 Current state backed up to: ${backupFileName}\n`);
    
    // Read the strategically perfect units from August 20 backup
    const backupPath = path.join(__dirname, '../../server/backups/perfect-foundation-2025-08-20T01-27-21-406Z/strategically-perfect-unit-plans.json');
    const backupUnits = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    
    console.log(`📂 Found ${backupUnits.length} units in backup\n`);
    
    // Process Health/FPS units with rich content from perfect-fps-units-final.ts
    const richFPSContent = [
      {
        title: 'Mon corps et ma sécurité',
        bigIdeas: JSON.stringify([
          "Mon corps m'appartient et j'ai le droit de dire non aux contacts non désirés",
          "La sécurité personnelle commence par connaître mon corps et ses limites",
          "Je peux identifier les adultes de confiance qui peuvent m'aider",
          "Prendre soin de mon corps me garde en santé et en sécurité"
        ]),
        essentialQuestions: JSON.stringify([
          "Comment puis-je prendre soin de mon corps chaque jour?",
          "Qui sont les adultes de confiance dans ma vie?",
          "Comment reconnaître quand je me sens en sécurité?",
          "Quelles sont mes limites personnelles?"
        ]),
        keyVocabulary: JSON.stringify({
          core: ["corps", "sécurité", "santé", "hygiène", "propre", "danger", "aide", "confiance"],
          extension: ["limites", "protection", "permission", "urgence", "prévention"],
          support: ["non", "stop", "dire", "demander", "laver"]
        }),
        assessmentPlan: JSON.stringify({
          formative: [
            "Observations quotidiennes des pratiques de sécurité",
            "Auto-évaluations guidées sur les habitudes de santé",
            "Discussions en cercle sur les sentiments de sécurité"
          ],
          summative: [
            "Démonstration des routines de sécurité apprises",
            "Portfolio de dessins 'Mon corps en sécurité'",
            "Présentation 'Mes adultes de confiance'"
          ],
          criteria: [
            "Nomme les parties du corps avec précision",
            "Identifie les situations sûres et dangereuses",
            "Démontre les pratiques d'hygiène appropriées",
            "Exprime ses limites personnelles clairement"
          ]
        }),
        differentiationStrategies: JSON.stringify({
          forStruggling: [
            "Supports visuels pour routines de sécurité",
            "Répétition guidée des messages de sécurité",
            "Jumelage avec pairs pour pratiques d'hygiène"
          ],
          forAdvanced: [
            "Leadership dans démonstrations de sécurité",
            "Création d'affiches de sécurité pour la classe",
            "Mentorat des pairs sur les pratiques saines"
          ],
          multiModal: [
            "Chansons sur la sécurité corporelle",
            "Jeux de rôle sur les situations de confiance",
            "Activités motrices pour apprendre le corps"
          ],
          culturallyResponsive: [
            "Respect des normes culturelles sur le toucher",
            "Inclusion de diverses représentations familiales",
            "Adaptation aux différentes expériences de sécurité"
          ]
        })
      },
      {
        title: 'Mes émotions et sentiments',
        bigIdeas: JSON.stringify([
          "Toutes mes émotions sont valides et normales",
          "Je peux exprimer mes émotions de façon respectueuse",
          "Les émotions changent et c'est normal",
          "J'ai des stratégies pour gérer mes grandes émotions"
        ]),
        essentialQuestions: JSON.stringify([
          "Comment mon corps me dit-il ce que je ressens?",
          "Quelles stratégies m'aident quand j'ai de grandes émotions?",
          "Comment puis-je exprimer mes sentiments respectueusement?",
          "Pourquoi est-il important de parler de mes émotions?"
        ]),
        keyVocabulary: JSON.stringify({
          core: ["émotions", "sentiments", "content", "triste", "fâché", "peur", "calme", "respirer"],
          extension: ["frustré", "excité", "inquiet", "déçu", "surpris", "fierté"],
          support: ["bien", "mal", "ok", "aide", "pause"]
        }),
        assessmentPlan: JSON.stringify({
          formative: [
            "Journal des émotions avec dessins et mots",
            "Observations des stratégies d'autorégulation",
            "Réflexions guidées après conflits résolus"
          ],
          summative: [
            "Portfolio 'Mes stratégies pour les grandes émotions'",
            "Présentation d'une boîte à outils émotionnelle",
            "Démonstration de résolution de conflit pacifique"
          ],
          criteria: [
            "Nomme et reconnaît les émotions de base",
            "Utilise des stratégies de calme appropriées",
            "Exprime ses sentiments avec des mots respectueux",
            "Démontre de l'empathie envers les autres"
          ]
        }),
        differentiationStrategies: JSON.stringify({
          forStruggling: [
            "Cartes visuelles d'émotions simplifiées",
            "Coins de calme personnalisés",
            "Scripts pour exprimer les sentiments"
          ],
          forAdvanced: [
            "Exploration d'émotions complexes",
            "Médiation entre pairs guidée",
            "Journal émotionnel approfondi"
          ],
          multiModal: [
            "Expression artistique des émotions",
            "Mouvements pour libérer les tensions",
            "Musique pour explorer les humeurs"
          ],
          culturallyResponsive: [
            "Respect des expressions émotionnelles culturelles",
            "Inclusion de diverses stratégies familiales",
            "Validation de toutes les expériences émotionnelles"
          ]
        })
      },
      {
        title: 'Amitiés et relations positives',
        bigIdeas: JSON.stringify([
          "L'amitié se construit sur le respect mutuel et la gentillesse",
          "Je peux résoudre les conflits de manière pacifique",
          "Chaque personne est unique et spéciale",
          "Les relations saines impliquent l'écoute et le partage"
        ]),
        essentialQuestions: JSON.stringify([
          "Qu'est-ce qui fait un bon ami?",
          "Comment puis-je résoudre les conflits avec mes amis?",
          "Comment montrer du respect envers les autres?",
          "Pourquoi la diversité rend notre classe spéciale?"
        ]),
        keyVocabulary: JSON.stringify({
          core: ["ami", "amitié", "partager", "écouter", "gentil", "respect", "ensemble", "aider"],
          extension: ["coopération", "empathie", "inclusion", "diversité", "pardon"],
          support: ["jouer", "tour", "s'il vous plaît", "merci", "désolé"]
        }),
        assessmentPlan: JSON.stringify({
          formative: [
            "Observations des interactions sociales positives",
            "Réflexions sur les actes de gentillesse",
            "Auto-évaluations sur les habiletés d'amitié"
          ],
          summative: [
            "Projet 'Portrait de mon ami' célébrant la diversité",
            "Démonstration de résolution de conflit",
            "Livre de classe sur 'Notre communauté bienveillante'"
          ],
          criteria: [
            "Démontre des comportements d'amitié positifs",
            "Utilise des stratégies de résolution pacifique",
            "Montre du respect pour les différences",
            "Participe à la création d'une classe inclusive"
          ]
        }),
        differentiationStrategies: JSON.stringify({
          forStruggling: [
            "Modélisation explicite des habiletés sociales",
            "Jeux structurés pour pratiquer le partage",
            "Partenariats guidés pour développer l'amitié"
          ],
          forAdvanced: [
            "Rôle de médiateur dans les conflits mineurs",
            "Organisation d'activités inclusives",
            "Mentorat des pairs en habiletés sociales"
          ],
          multiModal: [
            "Jeux de rôle sur l'amitié",
            "Chansons sur la coopération",
            "Art collaboratif célébrant la diversité"
          ],
          culturallyResponsive: [
            "Célébration de toutes les structures familiales",
            "Inclusion de jeux multiculturels",
            "Respect des styles de communication variés"
          ]
        })
      },
      {
        title: 'Nutrition et mode de vie sain',
        bigIdeas: JSON.stringify([
          "Mon corps a besoin de différents aliments pour avoir de l'énergie",
          "Tous les aliments ont une place dans une alimentation équilibrée",
          "L'activité physique me garde fort et en santé",
          "Le repos est aussi important que le mouvement"
        ]),
        essentialQuestions: JSON.stringify([
          "Comment les aliments donnent-ils de l'énergie à mon corps?",
          "Qu'est-ce qui rend un mode de vie sain?",
          "Pourquoi mon corps a-t-il besoin de bouger et de se reposer?",
          "Comment faire des choix alimentaires équilibrés?"
        ]),
        keyVocabulary: JSON.stringify({
          core: ["nutrition", "aliments", "énergie", "sain", "bouger", "repos", "eau", "équilibré"],
          extension: ["vitamines", "exercice", "sommeil", "croissance", "force"],
          support: ["manger", "boire", "courir", "dormir", "fatigué"]
        }),
        assessmentPlan: JSON.stringify({
          formative: [
            "Journal alimentaire illustré (sans jugement)",
            "Observations de l'activité physique quotidienne",
            "Réflexions sur les niveaux d'énergie"
          ],
          summative: [
            "Création d'un menu équilibré imaginaire",
            "Démonstration d'activités physiques préférées",
            "Présentation 'Mon mode de vie sain'"
          ],
          criteria: [
            "Identifie différents groupes alimentaires",
            "Comprend le lien entre nourriture et énergie",
            "Démontre diverses formes d'activité physique",
            "Reconnaît l'importance du repos"
          ]
        }),
        differentiationStrategies: JSON.stringify({
          forStruggling: [
            "Images simples des groupes alimentaires",
            "Activités physiques adaptées",
            "Routines visuelles pour le repos"
          ],
          forAdvanced: [
            "Exploration approfondie de la nutrition",
            "Leadership dans les activités physiques",
            "Journal de bien-être détaillé"
          ],
          multiModal: [
            "Dégustation sensorielle d'aliments",
            "Danse et mouvement créatif",
            "Relaxation guidée et yoga"
          ],
          culturallyResponsive: [
            "Inclusion d'aliments de toutes cultures",
            "Respect des restrictions alimentaires",
            "Célébration de diverses traditions de mouvement"
          ]
        })
      },
      {
        title: 'Grandir et changer en sécurité',
        bigIdeas: JSON.stringify([
          "Je grandis et change, et c'est normal et excitant",
          "La sécurité estivale nécessite des précautions spéciales",
          "J'ai appris beaucoup cette année et je suis prêt pour la 2e année",
          "Ma communauté m'aide à grandir en sécurité"
        ]),
        essentialQuestions: JSON.stringify([
          "Comment ai-je grandi et changé cette année?",
          "Comment rester en sécurité pendant l'été?",
          "De quoi suis-je le plus fier cette année?",
          "Comment puis-je continuer à apprendre pendant l'été?"
        ]),
        keyVocabulary: JSON.stringify({
          core: ["grandir", "changer", "sécurité", "été", "fier", "apprendre", "communauté", "prêt"],
          extension: ["transition", "responsabilité", "indépendance", "célébrer", "objectifs"],
          support: ["grand", "nouveau", "été", "école", "merci"]
        }),
        assessmentPlan: JSON.stringify({
          formative: [
            "Portfolio de croissance de l'année",
            "Réflexions sur les apprentissages",
            "Plans de sécurité estivale personnalisés"
          ],
          summative: [
            "Présentation 'Comment j'ai grandi'",
            "Guide de sécurité estivale illustré",
            "Célébration des accomplissements"
          ],
          criteria: [
            "Identifie ses propres changements et croissance",
            "Comprend les règles de sécurité estivale",
            "Exprime sa fierté pour ses accomplissements",
            "Démontre sa préparation pour la 2e année"
          ]
        }),
        differentiationStrategies: JSON.stringify({
          forStruggling: [
            "Photos avant/après pour voir la croissance",
            "Règles de sécurité simplifiées avec images",
            "Célébration guidée des petits succès"
          ],
          forAdvanced: [
            "Réflexion approfondie sur l'apprentissage",
            "Création de conseils pour futurs élèves",
            "Objectifs détaillés pour l'été"
          ],
          multiModal: [
            "Ligne du temps visuelle de l'année",
            "Chansons de célébration",
            "Activités kinesthésiques de transition"
          ],
          culturallyResponsive: [
            "Respect de toutes les expériences de croissance",
            "Inclusion de traditions estivales diverses",
            "Célébration culturellement appropriée"
          ]
        })
      }
    ];
    
    // Update units with rich content
    let updatedCount = 0;
    
    for (const unit of backupUnits) {
      // Find matching rich content
      const richContent = richFPSContent.find(r => 
        unit.title === r.title || 
        unit.title.includes(r.title.substring(0, 15))
      );
      
      if (richContent && unit.longRangePlan?.subject === 'Formation personnelle et sociale') {
        // Update FPS unit with rich content
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            bigIdeas: richContent.bigIdeas,
            essentialQuestions: richContent.essentialQuestions,
            keyVocabulary: richContent.keyVocabulary,
            assessmentPlan: richContent.assessmentPlan,
            differentiationStrategies: richContent.differentiationStrategies,
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
            communityConnections: JSON.stringify([
              "Invités de la communauté selon le thème",
              "Connexions avec les familles respectueuses",
              "Ressources communautaires appropriées"
            ]),
            priorKnowledge: JSON.stringify([
              "Expériences personnelles variées respectées",
              "Aucune assumption sur la situation familiale",
              "Construction sur apprentissages précédents"
            ])
          }
        });
        
        console.log(`✅ Restored rich content for: ${unit.title}`);
        updatedCount++;
      }
    }
    
    // Link curriculum expectations to units
    console.log('\n🔗 LINKING CURRICULUM EXPECTATIONS...\n');
    
    // Get all curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 'Grade 1' }
    });
    
    console.log(`Found ${expectations.length} Grade 1 expectations\n`);
    
    // Map expectations to units based on subject
    const unitsBySubject = await prisma.unitPlan.groupBy({
      by: ['longRangePlanId'],
      where: { userId: 23 }
    });
    
    for (const group of unitsBySubject) {
      const lrp = await prisma.longRangePlan.findUnique({
        where: { id: group.longRangePlanId }
      });
      
      if (!lrp) continue;
      
      // Find matching expectations for this subject
      const subjectExpectations = expectations.filter(e => {
        if (lrp.subject.includes('Français')) return e.subject.includes('French') || e.subject.includes('Français');
        if (lrp.subject.includes('Math')) return e.subject.includes('Math');
        if (lrp.subject.includes('Science')) return e.subject.includes('Science');
        if (lrp.subject.includes('Social') || lrp.subject.includes('humaines')) return e.subject.includes('Social');
        if (lrp.subject.includes('Arts')) return e.subject.includes('Arts') || e.subject.includes('Visual');
        if (lrp.subject.includes('Formation') || lrp.subject.includes('FPS')) return e.subject.includes('Health') || e.subject.includes('Physical');
        return false;
      });
      
      // Get units for this subject
      const units = await prisma.unitPlan.findMany({
        where: { longRangePlanId: group.longRangePlanId }
      });
      
      // Distribute expectations across units
      const expectationsPerUnit = Math.ceil(subjectExpectations.length / units.length);
      
      for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        const startIdx = i * expectationsPerUnit;
        const endIdx = Math.min(startIdx + expectationsPerUnit, subjectExpectations.length);
        const unitExpectations = subjectExpectations.slice(startIdx, endIdx);
        
        // Create links
        for (const exp of unitExpectations) {
          await prisma.unitPlanExpectation.create({
            data: {
              unitPlanId: unit.id,
              expectationId: exp.id
            }
          }).catch(() => {
            // Ignore if already exists
          });
        }
        
        console.log(`  Linked ${unitExpectations.length} expectations to: ${unit.title}`);
      }
    }
    
    // Final verification
    const finalStats = await prisma.unitPlanExpectation.count();
    console.log(`\n📊 RESTORATION COMPLETE:`);
    console.log(`  ✅ Updated ${updatedCount} FPS units with rich content`);
    console.log(`  ✅ Created ${finalStats} expectation links`);
    
    // Verify the restoration
    const verifyUnit = await prisma.unitPlan.findFirst({
      where: { 
        title: 'Mon corps et ma sécurité',
        userId: 23
      },
      include: {
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });
    
    if (verifyUnit?.bigIdeas) {
      console.log('\n✨ VERIFICATION SUCCESS:');
      console.log('  Sample unit has:');
      console.log(`    - Big Ideas: ${verifyUnit.bigIdeas ? '✅' : '❌'}`);
      console.log(`    - Essential Questions: ${verifyUnit.essentialQuestions ? '✅' : '❌'}`);
      console.log(`    - Key Vocabulary: ${verifyUnit.keyVocabulary ? '✅' : '❌'}`);
      console.log(`    - Assessment Plan: ${verifyUnit.assessmentPlan ? '✅' : '❌'}`);
      console.log(`    - Differentiation: ${verifyUnit.differentiationStrategies ? '✅' : '❌'}`);
      console.log(`    - Expectations linked: ${verifyUnit.expectations.length > 0 ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('❌ Error restoring units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restorePerfectedUnits();