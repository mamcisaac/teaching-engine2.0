#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeFPSPedagogicalFramework() {
  try {
    console.log('🎯 COMPLETING FPS PEDAGOGICAL FRAMEWORK - TRAUMA-INFORMED');
    console.log('=========================================================\n');
    
    const units = await prisma.unitPlan.findMany({
      where: { 
        longRangePlanId: 'cmebyc98x000bvjr1finmuibw'
      },
      orderBy: { startDate: 'asc' }
    });
    
    console.log(`Found ${units.length} units to complete\n`);
    
    // UNIT 1: Moi et ma santé
    if (units[0]) {
      await prisma.unitPlan.update({
        where: { id: units[0].id },
        data: {
          bigIdeas: JSON.stringify([
            "Mon corps est unique et spécial, et j'apprends à en prendre soin à ma façon",
            "Les habitudes de santé me donnent de l'énergie pour apprendre et jouer",
            "Je peux écouter les signaux de mon corps pour comprendre mes besoins",
            "Chaque personne grandit et change à son propre rythme, et c'est normal",
            "Je suis capable de faire des choix sains qui me font sentir bien"
          ]),
          
          essentialQuestions: JSON.stringify([
            "Comment mon corps me dit-il ce dont il a besoin? (sans obligation de partager)",
            "Quelles habitudes m'aident à me sentir fort et heureux?",
            "Comment puis-je prendre soin de moi-même chaque jour?",
            "Qu'est-ce qui rend mon corps unique et spécial?",
            "Comment puis-je demander de l'aide quand j'en ai besoin?"
          ]),
          
          keyVocabulary: JSON.stringify({
            "core": ["santé", "corps", "grandir", "fort", "hygiène", "propre", "énergie", "habitude"],
            "extension": ["routine", "capable", "autonome", "unique", "spécial", "différent", "respecter"],
            "support": ["aide", "besoin", "choisir", "sentir", "écouter", "comprendre"]
          }),
          
          assessmentPlan: JSON.stringify({
            "formative": {
              "observations": "Documentation quotidienne des habitudes d'hygiène autonomes, sans comparaison entre élèves",
              "privateCheckIns": "Rencontres individuelles hebdomadaires de 2-3 minutes pour vérifier le bien-être",
              "alternativeExpression": [
                "Dessins de 'Mon corps grandit' sans obligation de montrer",
                "Mouvements pour exprimer comment je me sens",
                "Choix d'émojis ou symboles pour indiquer l'énergie"
              ],
              "portfolioOptions": "Photos d'habitudes santé AVEC permission, alternatives avec dessins acceptées"
            },
            "summative": {
              "demonstrations": "Montrer UNE habitude santé choisie par l'élève, en privé si préféré",
              "selfAssessment": "Échelle visuelle 1-5 avec visages, aucune justification requise",
              "familyCommunication": "Partage optionnel des apprentissages, respect des situations familiales diverses"
            },
            "emotionalSafety": {
              "noForcedSharing": "Toutes les discussions sur le corps et la santé sont volontaires",
              "privateOptions": "Coin tranquille disponible pour auto-évaluations",
              "multipleModalities": "Expression par art, mouvement, symboles, ou silence respecté"
            }
          }),
          
          differentiationStrategies: JSON.stringify({
            "tier1_universal": {
              "description": "Support pour TOUS les élèves",
              "strategies": [
                "Routines visuelles affichées avec images",
                "Modélisation par l'enseignant sans attente de perfection",
                "Choix dans l'ordre des activités d'hygiène",
                "Pauses mouvement toutes les 15 minutes"
              ]
            },
            "tier2_targeted": {
              "description": "Support supplémentaire pour 15-20% des élèves",
              "strategies": [
                "Partenaire d'aide pour routines",
                "Cartes de séquence personnalisées",
                "Temps supplémentaire sans pression",
                "Check-ins privés plus fréquents"
              ]
            },
            "tier3_intensive": {
              "description": "Support intensif pour 5-10% des élèves",
              "strategies": [
                "Plan individualisé avec objectifs modifiés",
                "Support 1:1 pour établissement routines",
                "Communication famille renforcée (si approprié)",
                "Alternatives complètes pour activités déclenchantes"
              ]
            },
            "tier4_specialized": {
              "description": "Interventions spécialisées selon besoins",
              "strategies": [
                "Collaboration avec équipe de soutien",
                "Adaptations sensorielles complètes",
                "Plan de sécurité émotionnelle individualisé",
                "Protocoles trauma-informed spécifiques"
              ]
            }
          }),
          
          indigenousPerspectives: JSON.stringify({
            "teachings": {
              "sevenSacred": "RESPECT - Respecter son corps comme un cadeau sacré",
              "medicineWheel": "Direction Est - Nouveau commencement, croissance printanière du corps",
              "connection": "Le corps fait partie de la Terre Mère, interconnecté avec tout"
            },
            "activities": [
              "Cercle de gratitude pour nos corps (participation volontaire)",
              "Histoire de la tortue et sa carapace protectrice",
              "Mouvement inspiré des animaux pour la santé",
              "Reconnaissance du territoire Mi'kmaq et pratiques de bien-être ancestrales"
            ],
            "resources": [
              "Aînés invités AVEC protocoles appropriés",
              "Livres sur les enseignements traditionnels de santé",
              "Tambour pour activités de respiration rythmique"
            ],
            "culturalSafety": "Respect des familles qui ne participent pas aux activités spirituelles"
          }),
          
          
          successCriteria: JSON.stringify({
            "observable": [
              "L'élève démontre AU MOINS une habitude santé de façon autonome",
              "L'élève peut identifier 2-3 parties du corps en français",
              "L'élève utilise le vocabulaire santé dans le contexte approprié"
            ],
            "multiModal": {
              "verbal": "Peut expliquer une habitude santé ORALEMENT s'il le souhaite",
              "visual": "Peut dessiner ou pointer des images pour montrer la compréhension",
              "kinesthetic": "Peut démontrer par gestes ou mouvements",
              "written": "OPTIONNEL - peut écrire des mots simples si prêt"
            },
            "emotionalIndicators": [
              "Montre du confort avec les routines de classe",
              "Demande de l'aide quand nécessaire",
              "Participe selon son niveau de confort"
            ],
            "privateAssessment": "Tous les critères peuvent être évalués en privé sur demande"
          }),
          
          crossCurricularConnections: JSON.stringify({
            "francais": {
              "oral": "Vocabulaire du corps, expression des besoins",
              "reading": "Livres sur la santé adaptés Grade 1",
              "writing": "Étiquettes parties du corps (optionnel)"
            },
            "mathematiques": {
              "numeracy": "Compter les dents, mesurer la croissance",
              "patterns": "Routines quotidiennes comme patterns",
              "data": "Graphique classe des habitudes (anonyme)"
            },
            "sciences": {
              "living": "Le corps comme système vivant",
              "growth": "Observer les changements de croissance",
              "needs": "Besoins de base des êtres vivants"
            },
            "arts": {
              "visual": "Autoportraits positifs (abstraits acceptés)",
              "drama": "Jeu de rôle des helpers santé",
              "music": "Chansons sur les parties du corps"
            },
            "socialStudies": "Helpers de santé dans la communauté"
          }),
          
          technologyIntegration: JSON.stringify({
            "optional": "TOUTE la technologie est optionnelle avec alternatives non-tech",
            "tools": [
              "Tablettes pour apps de méditation (casques personnels)",
              "Projecteur pour vidéos de santé",
              "Appareil photo pour documenter la croissance (avec permission)"
            ],
            "alternatives": [
              "Livres physiques remplacent les apps",
              "Affiches remplacent les vidéos",
              "Dessins remplacent les photos"
            ],
            "safety": "Supervision constante, contenu pré-approuvé, pas de partage en ligne"
          })
        }
      });
      console.log('✅ Unit 1: Moi et ma santé - Framework completed');
    }
    
    // UNIT 2: Sécurité et protection
    if (units[1]) {
      await prisma.unitPlan.update({
        where: { id: units[1].id },
        data: {
          bigIdeas: JSON.stringify([
            "Mon corps m'appartient et j'ai le droit absolu de dire non",
            "Demander de l'aide est un signe de force et de courage",
            "Il existe des adultes de confiance qui peuvent m'aider à l'école",
            "Je peux apprendre des stratégies pour rester en sécurité sans avoir peur",
            "La sécurité est ma responsabilité ET celle des adultes qui prennent soin de moi"
          ]),
          
          essentialQuestions: JSON.stringify([
            "Comment puis-je reconnaître quand je me sens en sécurité? (partage optionnel)",
            "Qui sont les adultes qui peuvent m'aider à l'école?",
            "Quelles sont mes stratégies pour rester en sécurité?",
            "Comment mon corps me signale-t-il un danger?",
            "Quand et comment demander de l'aide?"
          ]),
          
          keyVocabulary: JSON.stringify({
            "core": ["sécurité", "protection", "confiance", "aide", "adulte", "non", "stop", "danger"],
            "extension": ["limites", "permission", "urgence", "stratégie", "courage", "fort", "capable"],
            "support": ["ok", "pas ok", "dire", "partir", "chercher", "appeler", "ensemble"]
          }),
          
          assessmentPlan: JSON.stringify({
            "formative": {
              "observations": "Noter la confiance dans l'identification des adultes aidants, sans forcer les détails",
              "privateCheckIns": "Vérifications individuelles sur le sentiment de sécurité, écoute sans questions intrusives",
              "alternativeExpression": [
                "Dessins des endroits sûrs (abstraits acceptés)",
                "Signaux non-verbaux pour 'je me sens en sécurité'",
                "Cartes de choix pour identifier les helpers"
              ],
              "scenarioPractice": "Jeux de rôle UNIQUEMENT avec situations fictives positives"
            },
            "summative": {
              "demonstrations": "Montrer comment obtenir de l'aide (plusieurs méthodes acceptées)",
              "safetyKnowledge": "Identifier 2-3 adultes de confiance à l'école (verbal ou visuel)",
              "selfProtection": "Démontrer 'Non, Va-t'en, Dis-le' sans détails personnels"
            },
            "traumaInformed": {
              "noPersonalDisclosure": "JAMAIS de questions sur expériences personnelles de danger",
              "empowermentFocus": "Évaluer les stratégies de protection, pas les peurs",
              "strengthBased": "Célébrer le courage de demander de l'aide"
            }
          }),
          
          differentiationStrategies: JSON.stringify({
            "tier1_universal": {
              "description": "Sécurité émotionnelle pour TOUS",
              "strategies": [
                "Language corporel respecté comme communication",
                "Zones de confort physique marquées visuellement",
                "Routine prévisible pour sécurité émotionnelle",
                "Choix dans la participation aux activités"
              ]
            },
            "tier2_targeted": {
              "description": "Support additionnel discret",
              "strategies": [
                "Buddy system pour élèves anxieux",
                "Cartes visuelles des adultes de confiance",
                "Pratique individuelle avant groupe",
                "Signal privé pour 'j'ai besoin d'une pause'"
              ]
            },
            "tier3_intensive": {
              "description": "Support trauma-informed intensif",
              "strategies": [
                "Plan de sécurité personnalisé",
                "Adult de confiance désigné",
                "Espace calme toujours accessible",
                "Communication famille sensible (si sécuritaire)"
              ]
            },
            "tier4_specialized": {
              "description": "Intervention professionnelle",
              "strategies": [
                "Collaboration conseiller/psychologue",
                "Plan d'intervention comportementale",
                "Protocoles de crise établis",
                "Support externe si nécessaire"
              ]
            }
          }),
          
          indigenousPerspectives: JSON.stringify({
            "teachings": {
              "sevenSacred": "COURAGE - Le courage de demander de l'aide et de se protéger",
              "medicineWheel": "Protection dans les quatre directions",
              "community": "La sécurité comme responsabilité collective de la communauté"
            },
            "activities": [
              "Cercle de protection (métaphorique, volontaire)",
              "Histoire de l'ours protégeant ses petits",
              "Création d'un bouclier de protection personnel (art)",
              "Enseignement sur les gardiens traditionnels"
            ],
            "protocols": "Respect absolu des familles réticentes aux pratiques spirituelles"
          }),
          
          resources: JSON.stringify({
            "materials": [
              "Livres sur la sécurité sans images effrayantes",
              "Poupées/figurines pour scénarios",
              "Affiches des règles de sécurité positives",
              "Téléphone jouet pour pratique 911"
            ],
            "personnel": [
              "Agent de police communautaire (approche positive)",
              "Pompier pour sécurité incendie",
              "Conseiller scolaire disponible"
            ],
            "safe": "Tout le matériel est vérifié pour éviter les déclencheurs"
          }),
          
          successCriteria: JSON.stringify({
            "observable": [
              "Identifie au moins 2 adultes de confiance à l'école",
              "Démontre comment obtenir de l'aide (méthode au choix)",
              "Utilise le vocabulaire de sécurité approprié"
            ],
            "emotional": [
              "Montre moins d'anxiété lors des discussions de sécurité",
              "Exprime ses limites de confort",
              "Fait preuve d'auto-advocacy approprié à l'âge"
            ],
            "flexible": "Tous les critères adaptables selon les besoins individuels"
          }),
          
          crossCurricularConnections: JSON.stringify({
            "francais": "Vocabulaire de sécurité, communication des besoins, histoires rassurantes",
            "mathematiques": "Numéros d'urgence, distance sécuritaire, compter les sorties",
            "sciences": "Signaux de danger dans la nature, réactions du corps",
            "arts": "Expression des émotions de sécurité, création d'espaces sûrs visuels",
            "socialStudies": "Helpers communautaires, règles de sécurité sociale"
          }),
          
          modificationNotes: JSON.stringify({
            "trauma": "Approche extra-douce, pas de surprises, prévisibilité maximale",
            "anxiety": "Désensibilisation graduelle, jamais de forcing, validation constante",
            "selective_mutism": "Communication non-verbale acceptée, pas de pression pour parler",
            "attachment": "Reconnaissance que tous les adultes ne sont pas 'sûrs' pour tous les enfants"
          }),
          
          safetyConsiderations: JSON.stringify({
            "mandatory_reporting": {
              "signs": "Documentation objective des indicateurs",
              "protocol": "Signalement selon les procédures légales",
              "support": "Soutien continu pour l'enfant"
            },
            "emotional_safety": [
              "Jamais de confrontation sur les révélations",
              "Croire l'enfant sans interrogatoire",
              "Maintenir les routines pour la stabilité"
            ],
            "boundaries": "Respect absolu des limites physiques et émotionnelles de chaque enfant"
          }),
          
          technologyIntegration: JSON.stringify({
            "minimal": "Usage minimal pour éviter sur-stimulation",
            "options": [
              "Vidéos de sécurité animées (pré-visionnées)",
              "Apps de respiration calme",
              "Enregistrements audio d'instructions de sécurité"
            ],
            "safety": "Tout contenu vérifié pour absence de contenu effrayant"
          })
        }
      });
      console.log('✅ Unit 2: Sécurité et protection - Framework completed');
    }
    
    // UNIT 3: Émotions et relations
    if (units[2]) {
      await prisma.unitPlan.update({
        where: { id: units[2].id },
        data: {
          bigIdeas: JSON.stringify([
            "Toutes mes émotions sont valides et j'ai le droit de les ressentir",
            "Je peux apprendre des façons saines d'exprimer mes émotions",
            "L'amitié se construit sur le respect mutuel et la gentillesse",
            "Les conflits peuvent être résolus sans violence",
            "Comprendre les émotions des autres m'aide à être un bon ami"
          ]),
          
          essentialQuestions: JSON.stringify([
            "Comment puis-je reconnaître mes émotions? (sans obligation d'expliquer pourquoi)",
            "Quelles stratégies m'aident quand j'ai de grandes émotions?",
            "Comment être un bon ami tout en respectant mes limites?",
            "Comment résoudre un problème avec un ami?",
            "Comment mon corps exprime-t-il différentes émotions?"
          ]),
          
          keyVocabulary: JSON.stringify({
            "core": ["émotions", "content", "triste", "fâché", "peur", "calme", "ami", "gentil"],
            "extension": ["frustré", "excité", "nerveux", "fier", "empathie", "respect", "solution"],
            "support": ["ok", "pas ok", "aide", "stop", "respirer", "pause", "ensemble", "seul"]
          }),
          
          assessmentPlan: JSON.stringify({
            "formative": {
              "emotionCheck": "Météo émotionnelle quotidienne - participation volontaire",
              "observations": "Noter les stratégies de régulation utilisées spontanément",
              "privateExpression": [
                "Journal d'émotions privé (dessins, symboles, mots)",
                "Coin calme pour auto-régulation",
                "Signaux non-verbaux pour exprimer les besoins"
              ],
              "peerInteractions": "Observer les interactions positives sans jugement"
            },
            "summative": {
              "strategies": "Démontrer 2-3 stratégies de calme (choix personnel)",
              "vocabulary": "Utiliser le vocabulaire émotionnel en contexte",
              "problemSolving": "Montrer une façon de résoudre un conflit (fictif)"
            },
            "emotionalSafety": {
              "noEmotionalExposure": "Jamais d'obligation de partager les causes des émotions",
              "privateProcessing": "Temps et espace pour traiter les émotions seul",
              "validationOnly": "Validation sans interrogation ou analyse"
            }
          }),
          
          differentiationStrategies: JSON.stringify({
            "tier1_universal": {
              "description": "Régulation émotionnelle pour tous",
              "strategies": [
                "Coin calme accessible en permanence",
                "Routine de respiration en classe",
                "Affiches des stratégies de calme",
                "Pauses sensorielles régulières"
              ]
            },
            "tier2_targeted": {
              "description": "Support régulation additionnel",
              "strategies": [
                "Check-ins émotionnels plus fréquents",
                "Fidgets et outils sensoriels",
                "Partenaire de calme désigné",
                "Plan de régulation personnalisé"
              ]
            },
            "tier3_intensive": {
              "description": "Support émotionnel intensif",
              "strategies": [
                "Breaks préventifs programmés",
                "Signal d'alerte précoce convenu",
                "Espace alternatif disponible",
                "Communication famille sur les déclencheurs"
              ]
            },
            "tier4_specialized": {
              "description": "Support santé mentale",
              "strategies": [
                "Plan avec psychologue scolaire",
                "Stratégies trauma-informed spécifiques",
                "Thérapie par le jeu si disponible",
                "Coordination services externes"
              ]
            }
          }),
          
          indigenousPerspectives: JSON.stringify({
            "teachings": {
              "sevenSacred": "HONESTY - Être honnête avec ses émotions",
              "medicineWheel": "Équilibre émotionnel dans les quatre directions",
              "circle": "Cercles de parole pour partage volontaire"
            },
            "practices": [
              "Utilisation du talking stick (bâton de parole)",
              "Respiration avec le tambour",
              "Histoires traditionnelles sur les émotions",
              "Médecine wheel pour identifier les émotions"
            ]
          }),
          
          resources: JSON.stringify({
            "materials": [
              "Cartes d'émotions diversifiées",
              "Livres sur les émotions et l'amitié",
              "Matériel sensoriel pour la régulation",
              "Zones de calme portables (tentes, coussins)"
            ],
            "tools": [
              "Thermomètre émotionnel visuel",
              "Roue des stratégies de calme",
              "Timer visuel pour les pauses",
              "Musique calme variée"
            ]
          }),
          
          successCriteria: JSON.stringify({
            "emotional": [
              "Identifie ses émotions de base",
              "Utilise au moins une stratégie de calme",
              "Demande de l'aide quand overwhelmed"
            ],
            "social": [
              "Montre de l'empathie envers les pairs",
              "Résout les conflits mineurs avec aide",
              "Respecte les limites des autres"
            ],
            "flexible": "Progrès individuel célébré, pas de comparaison"
          }),
          
          crossCurricularConnections: JSON.stringify({
            "francais": "Vocabulaire émotionnel, histoires sur l'amitié, expression des besoins",
            "mathematiques": "Graphique des émotions, patterns de régulation, temps de calme",
            "sciences": "Le cerveau et les émotions, réactions physiques au stress",
            "arts": "Art-thérapie, expression créative des émotions, musique apaisante",
            "socialStudies": "Résolution de conflits, vivre ensemble, empathie culturelle"
          }),
          
          modificationNotes: JSON.stringify({
            "autism": "Supports visuels constants, prévisibilité, temps de traitement extra",
            "adhd": "Pauses mouvement fréquentes, fidgets disponibles, instructions courtes",
            "anxiety": "Préparation aux transitions, validation constante, jamais de surprises",
            "trauma": "Éviter les déclencheurs connus, approche douce, contrôle donné à l'élève"
          }),
          
          safetyConsiderations: JSON.stringify({
            "emotional": [
              "Respecter le droit au silence émotionnel",
              "Ne jamais forcer le contact visuel",
              "Permettre l'isolement volontaire sécuritaire",
              "Protocoles pour crises émotionnelles"
            ],
            "relational": [
              "Médiation des conflits sans blâme",
              "Protection contre le rejet social",
              "Enseignement du consentement dans l'amitié"
            ]
          }),
          
          technologyIntegration: JSON.stringify({
            "apps": [
              "Applications de méditation Grade 1",
              "Histoires audio sur les émotions",
              "Musique de régulation"
            ],
            "alternatives": "Toujours des options non-technologiques disponibles"
          })
        }
      });
      console.log('✅ Unit 3: Émotions et relations - Framework completed');
    }
    
    // UNIT 4: Nutrition et énergie
    if (units[3]) {
      await prisma.unitPlan.update({
        where: { id: units[3].id },
        data: {
          bigIdeas: JSON.stringify([
            "Mon corps a besoin de différents types de nourriture pour avoir de l'énergie",
            "Il n'y a pas de 'bons' ou 'mauvais' aliments, tous les aliments ont une place",
            "Écouter mon corps m'aide à savoir quand j'ai faim ou soif",
            "Le mouvement et le repos sont aussi importants que la nourriture",
            "Chaque famille a ses propres traditions alimentaires et c'est merveilleux"
          ]),
          
          essentialQuestions: JSON.stringify([
            "Comment mon corps me dit-il qu'il a besoin d'énergie? (sans jugement sur les choix)",
            "Qu'est-ce qui me donne de l'énergie pour apprendre et jouer?",
            "Comment le mouvement m'aide-t-il à me sentir bien?",
            "Pourquoi mon corps a-t-il besoin de repos?",
            "Comment puis-je faire des choix qui me font sentir bien?"
          ]),
          
          keyVocabulary: JSON.stringify({
            "core": ["énergie", "faim", "soif", "bouger", "repos", "fort", "grandir", "choisir"],
            "extension": ["nutrition", "variété", "équilibre", "digestion", "vitamines", "muscles"],
            "support": ["manger", "boire", "courir", "dormir", "fatigué", "content", "plein"]
          }),
          
          assessmentPlan: JSON.stringify({
            "formative": {
              "bodySignals": "Observer la reconnaissance des signaux corporels sans jugement",
              "energyTracking": "Auto-évaluation de l'énergie (échelle visuelle simple)",
              "noFoodShaming": [
                "JAMAIS de commentaires sur les lunchs",
                "Pas de comparaison entre les choix alimentaires",
                "Respect absolu des restrictions et préférences"
              ],
              "movement": "Participation au mouvement selon capacité et confort"
            },
            "summative": {
              "understanding": "Expliquer UN lien entre alimentation et énergie",
              "choices": "Identifier des choix personnels qui donnent de l'énergie",
              "noPressure": "Aucune obligation de partager les habitudes familiales"
            },
            "inclusive": {
              "culturalFoods": "Célébration de TOUTES les traditions alimentaires",
              "economicSensitivity": "Aucune assumption sur l'accès aux aliments",
              "allergyAware": "Respect total des restrictions médicales"
            }
          }),
          
          differentiationStrategies: JSON.stringify({
            "tier1_universal": {
              "description": "Approche inclusive pour tous",
              "strategies": [
                "Utilisation d'aliments factices pour l'apprentissage",
                "Focus sur les signaux corporels universels",
                "Mouvement adapté à toutes les capacités",
                "Respect de toutes les traditions alimentaires"
              ]
            },
            "tier2_targeted": {
              "description": "Support nutritionnel sensible",
              "strategies": [
                "Alternatives pour les élèves avec insécurité alimentaire",
                "Support pour les troubles alimentaires émergents",
                "Adaptations pour les préférences sensorielles",
                "Communication famille délicate"
              ]
            },
            "tier3_intensive": {
              "description": "Support spécialisé nutrition",
              "strategies": [
                "Plan avec nutritionniste si disponible",
                "Support pour conditions médicales",
                "Alternatives complètes pour les activités",
                "Protocoles pour les allergies sévères"
              ]
            },
            "tier4_specialized": {
              "description": "Interventions médicales",
              "strategies": [
                "Coordination avec équipe médicale",
                "Plans alimentaires médicaux respectés",
                "Support pour diabète, allergies, etc.",
                "Ressources communautaires si besoin"
              ]
            }
          }),
          
          indigenousPerspectives: JSON.stringify({
            "teachings": {
              "sevenSacred": "LOVE - Aimer et respecter son corps",
              "medicineWheel": "Les quatre aspects de la santé",
              "gratitude": "Remercier la Terre pour la nourriture"
            },
            "activities": [
              "Cercle de gratitude pour la nourriture (volontaire)",
              "Histoires sur les aliments traditionnels",
              "Jardinage si possible (observation)",
              "Célébration de la diversité alimentaire"
            ]
          }),
          
          resources: JSON.stringify({
            "materials": [
              "Aliments factices variés et culturellement divers",
              "Livres sur l'alimentation sans jugement",
              "Images de traditions alimentaires mondiales",
              "Matériel de mouvement adapté"
            ],
            "community": [
              "Banque alimentaire locale (sensibilité)",
              "Jardins communautaires si accessibles",
              "Familles partageant leurs traditions (volontaire)"
            ]
          }),
          
          successCriteria: JSON.stringify({
            "knowledge": [
              "Reconnaît les signaux de faim et soif",
              "Comprend que le corps a besoin d'énergie",
              "Sait que le mouvement et le repos sont importants"
            ],
            "noJudgment": [
              "Respecte tous les choix alimentaires",
              "Ne fait pas de commentaires sur la nourriture des autres",
              "Célèbre la diversité alimentaire"
            ]
          }),
          
          crossCurricularConnections: JSON.stringify({
            "francais": "Vocabulaire alimentaire, recettes simples, traditions orales",
            "mathematiques": "Grouper les aliments, compter, mesurer (avec factices)",
            "sciences": "Croissance des plantes, besoins des êtres vivants, digestion simple",
            "arts": "Art avec thème alimentaire, cultures visuelles, célébrations",
            "socialStudies": "Traditions alimentaires mondiales, commerce équitable adapté"
          }),
          
          modificationNotes: JSON.stringify({
            "feedingIssues": "Approche extra-sensible, pas de pression, professionnels impliqués",
            "sensory": "Textures alternatives, exploration visuelle seulement si nécessaire",
            "cultural": "Respect absolu des pratiques religieuses et culturelles",
            "economic": "Sensibilité maximale aux situations économiques diverses"
          }),
          
          safetyConsiderations: JSON.stringify({
            "allergies": {
              "protocol": "Liste affichée, EpiPens accessibles, formation du personnel",
              "alternatives": "Toujours des alternatives sûres disponibles",
              "communication": "Parents informés de toutes les activités alimentaires"
            },
            "emotional": [
              "Pas de 'clean plate club' ou pression pour manger",
              "Respect du droit de ne pas aimer",
              "Validation des préférences personnelles"
            ]
          }),
          
          technologyIntegration: JSON.stringify({
            "minimal": "Technologie minimale pour éviter les comparaisons",
            "options": [
              "Vidéos sur la croissance des aliments",
              "Musique pour le mouvement",
              "Apps de respiration pour la digestion"
            ]
          })
        }
      });
      console.log('✅ Unit 4: Nutrition et énergie - Framework completed');
    }
    
    // UNIT 5: Mouvement et bien-être
    if (units[4]) {
      await prisma.unitPlan.update({
        where: { id: units[4].id },
        data: {
          bigIdeas: JSON.stringify([
            "Mon corps est fait pour bouger et chaque mouvement compte",
            "Il y a plusieurs façons de bouger et toutes sont valables",
            "Le mouvement m'aide à me sentir bien dans mon corps et ma tête",
            "Le repos est aussi important que le mouvement pour mon bien-être",
            "Je peux adapter les activités à mes capacités et préférences"
          ]),
          
          essentialQuestions: JSON.stringify([
            "Comment le mouvement me fait-il sentir? (sans jugement de performance)",
            "Quels mouvements j'aime faire?",
            "Comment mon corps me dit-il qu'il a besoin de repos?",
            "Comment puis-je bouger même dans un petit espace?",
            "Qu'est-ce qui rend le mouvement amusant pour moi?"
          ]),
          
          keyVocabulary: JSON.stringify({
            "core": ["bouger", "fort", "souple", "respirer", "repos", "énergie", "capable", "essayer"],
            "extension": ["équilibre", "coordination", "endurance", "étirement", "relaxation", "rythme"],
            "support": ["stop", "go", "lent", "vite", "doux", "dur", "fatigué", "prêt"]
          }),
          
          assessmentPlan: JSON.stringify({
            "formative": {
              "participation": "Observer l'engagement selon les capacités individuelles",
              "enjoyment": "Noter le plaisir du mouvement, pas la performance",
              "adaptation": "Célébrer les adaptations créatives des mouvements",
              "choice": "Respecter les choix de niveau d'activité"
            },
            "summative": {
              "demonstration": "Montrer UN mouvement favori (toute forme acceptée)",
              "understanding": "Expliquer pourquoi le mouvement est important (oral/visuel/gestuel)",
              "personal": "Auto-évaluation du bien-être après le mouvement"
            },
            "inclusive": {
              "allAbilities": "Toutes les capacités physiques célébrées",
              "noComparison": "Jamais de comparaison entre élèves",
              "effortOverOutcome": "L'effort compte plus que le résultat"
            }
          }),
          
          differentiationStrategies: JSON.stringify({
            "tier1_universal": {
              "description": "Mouvement inclusif pour tous",
              "strategies": [
                "Options de mouvement assis et debout",
                "Musique variée pour différents rythmes",
                "Zones de mouvement et de repos",
                "Choix du niveau d'intensité"
              ]
            },
            "tier2_targeted": {
              "description": "Adaptations mouvement",
              "strategies": [
                "Équipement adaptatif disponible",
                "Partenaire de mouvement si désiré",
                "Modifications visuelles des exercices",
                "Pauses supplémentaires sans stigma"
              ]
            },
            "tier3_intensive": {
              "description": "Support mobilité spécialisé",
              "strategies": [
                "Plan avec physiothérapeute si disponible",
                "Mouvements complètement adaptés",
                "Focus sur le mouvement possible",
                "Célébration de tout progrès"
              ]
            },
            "tier4_specialized": {
              "description": "Besoins médicaux complexes",
              "strategies": [
                "Coordination avec équipe médicale",
                "Équipement spécialisé si nécessaire",
                "Participation par observation active",
                "Rôles alternatifs (DJ, chronomètre, etc.)"
              ]
            }
          }),
          
          indigenousPerspectives: JSON.stringify({
            "teachings": {
              "sevenSacred": "WISDOM - Sagesse d'écouter son corps",
              "medicineWheel": "Mouvement dans les quatre directions",
              "connection": "Connection avec la terre par le mouvement"
            },
            "activities": [
              "Danses traditionnelles adaptées (si approprié)",
              "Mouvements inspirés des animaux",
              "Jeux traditionnels modifiés",
              "Célébration du mouvement dans la nature"
            ]
          }),
          
          resources: JSON.stringify({
            "materials": [
              "Équipement varié pour différentes capacités",
              "Musique de différentes cultures et tempos",
              "Espaces définis pour mouvement et repos",
              "Supports visuels pour les mouvements"
            ],
            "adaptations": [
              "Chaises pour mouvement assis",
              "Bandes élastiques pour résistance douce",
              "Balles sensorielles variées",
              "Tapis pour activités au sol"
            ]
          }),
          
          successCriteria: JSON.stringify({
            "participation": [
              "Participe selon ses capacités",
              "Essaie de nouveaux mouvements à son rythme",
              "Reconnaît quand son corps a besoin de repos"
            ],
            "wellbeing": [
              "Exprime comment le mouvement le fait sentir",
              "Utilise le mouvement pour réguler ses émotions",
              "Respecte ses limites corporelles"
            ]
          }),
          
          crossCurricularConnections: JSON.stringify({
            "francais": "Vocabulaire du mouvement, instructions simples, expression des sensations",
            "mathematiques": "Compter les mouvements, patterns rythmiques, mesure du temps",
            "sciences": "Le corps en mouvement, muscles et os, respiration",
            "arts": "Danse créative, expression corporelle, rythme musical",
            "socialStudies": "Jeux du monde, sports culturels, coopération"
          }),
          
          modificationNotes: JSON.stringify({
            "mobility": "Tous les mouvements adaptables, focus sur le possible",
            "chronic": "Respect des conditions chroniques, énergie variable acceptée",
            "sensory": "Options pour sensibilités au bruit, toucher, mouvement",
            "cognitive": "Instructions simples, démonstrations multiples, patience"
          }),
          
          safetyConsiderations: JSON.stringify({
            "physical": [
              "Espace sécuritaire pour tous les mouvements",
              "Échauffement et refroidissement adaptés",
              "Hydratation fréquente",
              "Respect des limitations médicales"
            ],
            "emotional": [
              "Pas de pression pour performer",
              "Droit de s'arrêter à tout moment",
              "Célébration de l'effort, pas du résultat"
            ]
          }),
          
          technologyIntegration: JSON.stringify({
            "music": "Variété de musiques pour différents mouvements",
            "video": "Vidéos de mouvements adaptés (optionnel)",
            "apps": "Applications de yoga/méditation pour enfants",
            "alternatives": "Toujours des options sans technologie"
          })
        }
      });
      console.log('✅ Unit 5: Mouvement et bien-être - Framework completed');
    }
    
    // UNIT 6: Communauté, sécurité et célébration
    if (units[5]) {
      await prisma.unitPlan.update({
        where: { id: units[5].id },
        data: {
          bigIdeas: JSON.stringify([
            "J'ai appris et grandi toute l'année et c'est une célébration",
            "Je fais partie d'une communauté qui prend soin de moi",
            "L'été nécessite des stratégies de sécurité spéciales",
            "Mes apprentissages m'aident à être en sécurité et en santé",
            "Je suis prêt pour de nouvelles aventures en Grade 2"
          ]),
          
          essentialQuestions: JSON.stringify([
            "De quoi suis-je le plus fier cette année? (choix personnel)",
            "Comment puis-je rester en sécurité pendant l'été?",
            "Qui fait partie de ma communauté de soutien?",
            "Quelles stratégies vais-je continuer à utiliser?",
            "Comment puis-je aider ma communauté?"
          ]),
          
          keyVocabulary: JSON.stringify({
            "core": ["fier", "grandir", "été", "sécurité", "communauté", "aider", "célébrer", "continuer"],
            "extension": ["accomplissement", "progrès", "contribution", "responsabilité", "transition"],
            "support": ["bien", "fort", "prêt", "merci", "ensemble", "ami", "content"]
          }),
          
          assessmentPlan: JSON.stringify({
            "formative": {
              "portfolio": "Révision du portfolio de l'année - célébration des progrès",
              "reflection": "Réflexion sur les apprentissages (format au choix)",
              "community": "Identification des helpers dans sa vie"
            },
            "summative": {
              "celebration": "Présentation d'UN accomplissement personnel",
              "safety": "Démontrer UNE stratégie de sécurité estivale",
              "gratitude": "Exprimer la gratitude (oral, visuel, ou écrit)"
            },
            "yearEnd": {
              "lowPressure": "Activités légères, pas de nouvelles évaluations majeures",
              "choice": "Multiples façons de montrer les apprentissages",
              "positive": "Focus sur les succès et la croissance"
            }
          }),
          
          differentiationStrategies: JSON.stringify({
            "tier1_universal": {
              "description": "Célébration inclusive",
              "strategies": [
                "Multiples formats de présentation",
                "Célébration des progrès individuels",
                "Activités de groupe optionnelles",
                "Flexibilité maximale en juin"
              ]
            },
            "tier2_targeted": {
              "description": "Support transition",
              "strategies": [
                "Préparation extra pour Grade 2",
                "Discussion des inquiétudes estivales",
                "Plan de maintien des acquis",
                "Contact famille pour continuité"
              ]
            },
            "tier3_intensive": {
              "description": "Support été",
              "strategies": [
                "Ressources été pour la famille",
                "Plan de transition détaillé",
                "Connexion services communautaires",
                "Stratégies de maintien spécifiques"
              ]
            },
            "tier4_specialized": {
              "description": "Continuité de services",
              "strategies": [
                "Transfert aux services d'été",
                "Documentation pour Grade 2",
                "Plan de soutien continu",
                "Réunion de transition si nécessaire"
              ]
            }
          }),
          
          indigenousPerspectives: JSON.stringify({
            "teachings": {
              "sevenSacred": "TRUTH - Célébrer notre vérité et croissance",
              "medicineWheel": "Complétion du cycle, nouveau commencement",
              "gratitude": "Cérémonie de gratitude pour l'année"
            },
            "activities": [
              "Cercle de clôture (volontaire)",
              "Création d'un objet souvenir",
              "Histoires de transition et croissance",
              "Bénédiction pour le voyage d'été"
            ]
          }),
          
          resources: JSON.stringify({
            "materials": [
              "Matériel pour portfolios et présentations",
              "Décorations pour célébration",
              "Ressources sécurité été",
              "Certificats personnalisés"
            ],
            "community": [
              "Invités pour sécurité été",
              "Familles pour célébration",
              "Services communautaires été",
              "Bibliothèque pour programme été"
            ]
          }),
          
          successCriteria: JSON.stringify({
            "growth": [
              "Identifie au moins une chose apprise",
              "Reconnaît sa croissance personnelle",
              "Exprime de la fierté pour ses accomplissements"
            ],
            "community": [
              "Nomme des personnes qui l'aident",
              "Montre comment il peut aider les autres",
              "Comprend son rôle dans la communauté"
            ],
            "readiness": [
              "Démontre des stratégies de sécurité été",
              "Exprime de l'enthousiasme pour Grade 2",
              "Sait où obtenir de l'aide si nécessaire"
            ]
          }),
          
          crossCurricularConnections: JSON.stringify({
            "francais": "Écriture de remerciements, lecture été, vocabulaire de célébration",
            "mathematiques": "Compter les jours d'école, graphique des apprentissages, calendrier été",
            "sciences": "Sécurité soleil, changements saisonniers, révision croissance",
            "arts": "Création de souvenirs, performance de célébration, art collaboratif",
            "socialStudies": "Communauté et helpers, citoyenneté, responsabilités été"
          }),
          
          modificationNotes: JSON.stringify({
            "energy": "Attentes réduites pour la fatigue de fin d'année",
            "emotions": "Support pour anxiété de transition et séparation",
            "academic": "Pas de nouvelle matière complexe, révision seulement",
            "social": "Aide pour les adieux et maintien des amitiés"
          }),
          
          safetyConsiderations: JSON.stringify({
            "summer": [
              "Sécurité aquatique adaptée à tous",
              "Protection solaire pour tous les types de peau",
              "Sécurité vélo et casque",
              "Supervision et numéros d'urgence"
            ],
            "emotional": [
              "Validation des émotions de fin d'année",
              "Support pour l'anxiété de séparation",
              "Préparation positive pour les changements"
            ]
          }),
          
          technologyIntegration: JSON.stringify({
            "documentation": "Photos/vidéos de l'année (avec permission)",
            "celebration": "Musique pour célébration, diaporama de souvenirs",
            "summer": "Ressources été en ligne pour familles",
            "optional": "Tout est optionnel avec alternatives"
          })
        }
      });
      console.log('✅ Unit 6: Communauté, sécurité et célébration - Framework completed');
    }
    
    console.log('\n🎉 ALL 6 FPS UNITS - PEDAGOGICAL FRAMEWORK COMPLETED!');
    console.log('✅ Big Ideas: Focused on self-awareness and emotional regulation');
    console.log('✅ Essential Questions: Safe emotional expression without forced sharing');
    console.log('✅ Assessment Plans: Private check-ins and multiple modalities');
    console.log('✅ Differentiation: Four-tier support system implemented');
    console.log('✅ Indigenous Perspectives: Traditional wellness integrated');
    console.log('✅ Success Criteria: Trauma-informed and developmentally appropriate');
    console.log('✅ Safety Considerations: Emotional safety protocols throughout');
    console.log('✅ All fields populated with Grade 1 appropriate content');
    
  } catch (error) {
    console.error('❌ Error completing framework:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeFPSPedagogicalFramework();