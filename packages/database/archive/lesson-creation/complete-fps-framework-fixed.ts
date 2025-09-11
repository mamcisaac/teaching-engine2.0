#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeFPSFramework() {
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
    
    // Process each unit
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitNumber = i + 1;
      
      // Define content based on unit number
      let updateData: any = {};
      
      switch(unitNumber) {
        case 1: // Moi et ma santé
          updateData = {
            bigIdeas: JSON.stringify([
              "Mon corps est unique et spécial, et j'apprends à en prendre soin à ma façon",
              "Les habitudes de santé me donnent de l'énergie pour apprendre et jouer",
              "Je peux écouter les signaux de mon corps pour comprendre mes besoins",
              "Chaque personne grandit et change à son propre rythme, et c'est normal"
            ]),
            
            essentialQuestions: JSON.stringify([
              "Comment mon corps me dit-il ce dont il a besoin? (sans obligation de partager)",
              "Quelles habitudes m'aident à me sentir fort et heureux?",
              "Comment puis-je prendre soin de moi-même chaque jour?",
              "Qu'est-ce qui rend mon corps unique et spécial?"
            ]),
            
            keyVocabulary: JSON.stringify({
              "core": ["santé", "corps", "grandir", "fort", "hygiène", "propre", "énergie", "habitude"],
              "extension": ["routine", "capable", "autonome", "unique", "spécial", "différent"],
              "support": ["aide", "besoin", "choisir", "sentir", "écouter"]
            }),
            
            assessmentPlan: JSON.stringify({
              "formative": {
                "observations": "Documentation quotidienne des habitudes sans comparaison",
                "privateCheckIns": "Rencontres individuelles de 2-3 minutes hebdomadaires",
                "alternativeExpression": ["Dessins", "Mouvements", "Symboles"],
                "portfolioOptions": "Photos avec permission OU dessins"
              },
              "summative": {
                "demonstrations": "Montrer UNE habitude santé (privé si préféré)",
                "selfAssessment": "Échelle visuelle 1-5, sans justification requise"
              },
              "emotionalSafety": "Toutes discussions volontaires, expression multiple"
            }),
            
            differentiationStrategies: JSON.stringify({
              "tier1": "Routines visuelles, modélisation, choix, pauses fréquentes",
              "tier2": "Partenaire d'aide, séquences personnalisées, temps extra",
              "tier3": "Objectifs modifiés, support 1:1, alternatives complètes",
              "tier4": "Équipe de soutien, adaptations sensorielles, protocoles trauma"
            }),
            
            indigenousPerspectives: JSON.stringify({
              "teaching": "RESPECT - Respecter son corps comme cadeau sacré",
              "medicineWheel": "Direction Est - Nouveau commencement",
              "activities": ["Cercle de gratitude", "Histoire de la tortue", "Mouvements d'animaux"],
              "protocol": "Participation volontaire, respect des non-participants"
            }),
            
            successCriteria: JSON.stringify([
              "Démontre une habitude santé autonome",
              "Identifie 2-3 parties du corps en français",
              "Utilise le vocabulaire approprié",
              "Participe selon son confort"
            ]),
            
            crossCurricularConnections: JSON.stringify({
              "francais": "Vocabulaire corporel, expression besoins",
              "mathematiques": "Compter, mesurer croissance, graphiques",
              "sciences": "Corps comme système, croissance, besoins vivants",
              "arts": "Autoportraits, jeux de rôle, chansons"
            }),
            
            technologyIntegration: JSON.stringify({
              "optional": "Toute technologie optionnelle",
              "tools": ["Tablettes méditation", "Vidéos santé", "Photos croissance"],
              "alternatives": ["Livres", "Affiches", "Dessins"]
            }),
            
            communityConnections: JSON.stringify([
              "Infirmière scolaire",
              "Parents volontaires (avec vérification)",
              "Professionnels santé communautaire"
            ]),
            
            parentCommunicationPlan: JSON.stringify({
              "monthly": "Newsletter avec vocabulaire et activités optionnelles",
              "privacy": "Respect situations familiales diverses",
              "resources": "Partage ressources communautaires discrètement"
            }),
            
            priorKnowledge: JSON.stringify([
              "Reconnaissance parties du corps de base",
              "Routines maison variables selon famille",
              "Expériences santé diverses"
            ]),
            
            learningSkills: JSON.stringify({
              "responsibility": "Prendre soin de soi",
              "organization": "Routines quotidiennes",
              "independence": "Autonomie progressive",
              "collaboration": "Aide mutuelle respectueuse"
            }),
            
            fieldTripsAndGuestSpeakers: JSON.stringify([
              "Visite infirmière scolaire",
              "Dentiste communautaire (si disponible)",
              "Parents professionnels santé (volontaire)"
            ]),
            
            environmentalEducation: JSON.stringify({
              "connection": "Corps connecté à l'environnement",
              "cleanliness": "Propreté personnelle et environnementale",
              "sustainability": "Réutilisation matériel hygiène"
            }),
            
            culminatingTask: JSON.stringify({
              "task": "Portfolio 'Mon corps grandit' - format au choix",
              "options": ["Dessins", "Photos", "Collage", "Présentation orale"],
              "private": "Présentation individuelle si préféré"
            }),
            
            socialJusticeConnections: JSON.stringify({
              "equity": "Accès équitable aux ressources santé",
              "diversity": "Célébration différences corporelles",
              "inclusion": "Adaptations pour toutes capacités"
            })
          };
          break;
          
        case 2: // Sécurité et protection
          updateData = {
            bigIdeas: JSON.stringify([
              "Mon corps m'appartient et j'ai le droit de dire non",
              "Demander de l'aide est un signe de courage",
              "Il existe des adultes de confiance à l'école",
              "Je peux rester en sécurité sans avoir peur"
            ]),
            
            essentialQuestions: JSON.stringify([
              "Comment reconnaître quand je me sens en sécurité?",
              "Qui sont les adultes qui peuvent m'aider?",
              "Quelles sont mes stratégies de sécurité?",
              "Comment demander de l'aide efficacement?"
            ]),
            
            keyVocabulary: JSON.stringify({
              "core": ["sécurité", "protection", "confiance", "aide", "non", "stop"],
              "extension": ["limites", "permission", "urgence", "stratégie"],
              "support": ["ok", "pas ok", "dire", "partir", "chercher"]
            }),
            
            assessmentPlan: JSON.stringify({
              "formative": {
                "observations": "Confiance dans identification des helpers",
                "scenarios": "Jeux de rôle avec situations fictives positives",
                "noDisclosure": "JAMAIS de questions sur expériences personnelles"
              },
              "summative": {
                "knowledge": "Identifier 2-3 adultes de confiance",
                "skills": "Démontrer comment obtenir de l'aide"
              },
              "traumaInformed": "Focus empowerment, pas sur les peurs"
            }),
            
            differentiationStrategies: JSON.stringify({
              "tier1": "Language corporel respecté, zones confort, routine prévisible",
              "tier2": "Buddy system, cartes visuelles, pratique individuelle",
              "tier3": "Plan sécurité personnalisé, adulte désigné, espace calme",
              "tier4": "Collaboration conseiller, protocoles crise"
            }),
            
            indigenousPerspectives: JSON.stringify({
              "teaching": "COURAGE - Courage de demander aide et se protéger",
              "medicineWheel": "Protection quatre directions",
              "community": "Sécurité comme responsabilité collective"
            }),
            
            successCriteria: JSON.stringify([
              "Identifie 2+ adultes de confiance",
              "Démontre obtention d'aide",
              "Utilise vocabulaire sécurité",
              "Exprime limites confort"
            ]),
            
            crossCurricularConnections: JSON.stringify({
              "francais": "Vocabulaire sécurité, communication besoins",
              "mathematiques": "Numéros urgence, distance sécuritaire",
              "sciences": "Signaux danger, réactions corps",
              "arts": "Expression émotions sécurité"
            }),
            
            technologyIntegration: JSON.stringify({
              "minimal": "Usage minimal éviter sur-stimulation",
              "options": ["Vidéos sécurité animées", "Apps respiration"],
              "safety": "Contenu vérifié non-effrayant"
            }),
            
            communityConnections: JSON.stringify([
              "Agent police communautaire (approche positive)",
              "Pompier sécurité incendie",
              "Conseiller scolaire"
            ]),
            
            parentCommunicationPlan: JSON.stringify({
              "sensitive": "Notification topics sécurité corporelle",
              "optOut": "Options respectueuses disponibles",
              "support": "Ressources trauma confidentielles"
            }),
            
            priorKnowledge: JSON.stringify([
              "Concepts base sécurité",
              "Confiance variable selon expériences",
              "Résilience individuelle diverse"
            ]),
            
            learningSkills: JSON.stringify({
              "selfAdvocacy": "Exprimer besoins et limites",
              "initiative": "Chercher aide proactivement",
              "selfRegulation": "Gérer anxiété sécurité"
            }),
            
            fieldTripsAndGuestSpeakers: JSON.stringify([
              "Visite caserne pompiers",
              "Agent communautaire en classe",
              "Simulation évacuation positive"
            ]),
            
            environmentalEducation: JSON.stringify({
              "safety": "Sécurité environnementale",
              "awareness": "Conscience dangers naturels",
              "preparation": "Préparation urgences"
            }),
            
            culminatingTask: JSON.stringify({
              "task": "Plan sécurité personnel illustré",
              "format": "Affiche, livre, présentation",
              "focus": "Stratégies positives, pas peurs"
            }),
            
            socialJusticeConnections: JSON.stringify({
              "rights": "Droits de l'enfant à la protection",
              "advocacy": "Défendre soi et autres",
              "community": "Protection collective"
            })
          };
          break;
          
        case 3: // Émotions et relations
          updateData = {
            bigIdeas: JSON.stringify([
              "Toutes mes émotions sont valides",
              "Je peux exprimer mes émotions sainement",
              "L'amitié se construit sur le respect",
              "Les conflits peuvent être résolus pacifiquement"
            ]),
            
            essentialQuestions: JSON.stringify([
              "Comment reconnaître mes émotions?",
              "Quelles stratégies m'aident avec grandes émotions?",
              "Comment être un bon ami?",
              "Comment résoudre les conflits?"
            ]),
            
            keyVocabulary: JSON.stringify({
              "core": ["émotions", "content", "triste", "fâché", "calme", "ami"],
              "extension": ["frustré", "excité", "empathie", "respect"],
              "support": ["ok", "aide", "respirer", "pause"]
            }),
            
            assessmentPlan: JSON.stringify({
              "formative": {
                "emotionCheck": "Météo émotionnelle volontaire",
                "observations": "Stratégies régulation spontanées",
                "private": "Journal émotions privé"
              },
              "summative": {
                "strategies": "Démontrer 2-3 stratégies calme",
                "skills": "Résoudre conflit fictif"
              }
            }),
            
            differentiationStrategies: JSON.stringify({
              "tier1": "Coin calme, routine respiration, affiches stratégies",
              "tier2": "Check-ins fréquents, fidgets, partenaire calme",
              "tier3": "Breaks préventifs, signal alerte, espace alternatif",
              "tier4": "Plan psychologue, thérapie jeu"
            }),
            
            indigenousPerspectives: JSON.stringify({
              "teaching": "HONESTY - Honnêteté avec émotions",
              "medicineWheel": "Équilibre émotionnel quatre directions",
              "circle": "Cercles parole volontaires"
            }),
            
            successCriteria: JSON.stringify([
              "Identifie émotions base",
              "Utilise stratégie calme",
              "Montre empathie pairs",
              "Résout conflits avec aide"
            ]),
            
            crossCurricularConnections: JSON.stringify({
              "francais": "Vocabulaire émotionnel, histoires amitié",
              "mathematiques": "Graphique émotions, patterns régulation",
              "sciences": "Cerveau et émotions, stress physique",
              "arts": "Art-thérapie, expression créative"
            }),
            
            technologyIntegration: JSON.stringify({
              "apps": ["Méditation Grade 1", "Histoires audio émotions"],
              "alternatives": "Options non-tech toujours disponibles"
            }),
            
            communityConnections: JSON.stringify([
              "Conseiller scolaire",
              "Psychologue (si disponible)",
              "Mentors pairs plus âgés"
            ]),
            
            parentCommunicationPlan: JSON.stringify({
              "strategies": "Partage stratégies maison-école",
              "support": "Ressources gestion émotions famille",
              "sensitivity": "Respect défis émotionnels familiaux"
            }),
            
            priorKnowledge: JSON.stringify([
              "Vocabulaire émotions base",
              "Expériences amitié diverses",
              "Stratégies familiales variables"
            ]),
            
            learningSkills: JSON.stringify({
              "selfRegulation": "Gérer grandes émotions",
              "collaboration": "Travailler avec autres",
              "empathy": "Comprendre sentiments autres"
            }),
            
            fieldTripsAndGuestSpeakers: JSON.stringify([
              "Théâtre émotions (si disponible)",
              "Auteur livres sur émotions",
              "Atelier mindfulness adapté"
            ]),
            
            environmentalEducation: JSON.stringify({
              "nature": "Nature pour calme",
              "spaces": "Espaces apaisants",
              "connection": "Émotions et environnement"
            }),
            
            culminatingTask: JSON.stringify({
              "task": "Livre émotions personnel",
              "options": ["Histoire", "BD", "Album photos"],
              "sharing": "Partage volontaire seulement"
            }),
            
            socialJusticeConnections: JSON.stringify({
              "empathy": "Comprendre perspectives diverses",
              "inclusion": "Accueillir toutes émotions",
              "equity": "Support émotionnel équitable"
            })
          };
          break;
          
        case 4: // Nutrition et énergie
          updateData = {
            bigIdeas: JSON.stringify([
              "Mon corps a besoin d'énergie variée",
              "Tous les aliments ont une place",
              "Écouter mon corps guide mes choix",
              "Chaque famille a ses traditions alimentaires"
            ]),
            
            essentialQuestions: JSON.stringify([
              "Comment mon corps signale ses besoins?",
              "Qu'est-ce qui me donne de l'énergie?",
              "Comment le mouvement aide mon bien-être?",
              "Pourquoi le repos est-il important?"
            ]),
            
            keyVocabulary: JSON.stringify({
              "core": ["énergie", "faim", "soif", "bouger", "repos"],
              "extension": ["nutrition", "variété", "équilibre"],
              "support": ["manger", "boire", "fatigué"]
            }),
            
            assessmentPlan: JSON.stringify({
              "formative": {
                "bodySignals": "Observer reconnaissance signaux",
                "noShaming": "JAMAIS commentaires sur lunchs",
                "inclusive": "Respect toutes traditions"
              },
              "summative": {
                "understanding": "Expliquer lien alimentation-énergie",
                "personal": "Identifier choix personnels énergie"
              }
            }),
            
            differentiationStrategies: JSON.stringify({
              "tier1": "Aliments factices, signaux universels, mouvement adapté",
              "tier2": "Alternatives insécurité alimentaire, support préférences",
              "tier3": "Plan nutritionniste, protocoles allergies",
              "tier4": "Coordination médicale, plans alimentaires"
            }),
            
            indigenousPerspectives: JSON.stringify({
              "teaching": "LOVE - Aimer respecter son corps",
              "gratitude": "Remercier Terre pour nourriture",
              "diversity": "Célébrer diversité alimentaire"
            }),
            
            successCriteria: JSON.stringify([
              "Reconnaît signaux faim/soif",
              "Comprend besoin énergie",
              "Respecte tous choix alimentaires",
              "Célèbre diversité"
            ]),
            
            crossCurricularConnections: JSON.stringify({
              "francais": "Vocabulaire alimentaire, recettes",
              "mathematiques": "Grouper aliments, mesurer",
              "sciences": "Croissance plantes, digestion",
              "arts": "Art culinaire, célébrations"
            }),
            
            technologyIntegration: JSON.stringify({
              "minimal": "Technologie minimale",
              "options": ["Vidéos croissance aliments"],
              "focus": "Éviter comparaisons"
            }),
            
            communityConnections: JSON.stringify([
              "Banque alimentaire (sensibilité)",
              "Jardins communautaires",
              "Familles partageant traditions"
            ]),
            
            parentCommunicationPlan: JSON.stringify({
              "noJudgment": "Aucun jugement habitudes familiales",
              "resources": "Ressources nutrition si demandées",
              "sensitivity": "Respect situations économiques"
            }),
            
            priorKnowledge: JSON.stringify([
              "Préférences alimentaires personnelles",
              "Traditions familiales diverses",
              "Accès variable aux aliments"
            ]),
            
            learningSkills: JSON.stringify({
              "selfAwareness": "Écouter signaux corps",
              "respect": "Respecter diversité",
              "choices": "Faire choix personnels"
            }),
            
            fieldTripsAndGuestSpeakers: JSON.stringify([
              "Visite jardin local",
              "Chef communautaire",
              "Nutritionniste (approche inclusive)"
            ]),
            
            environmentalEducation: JSON.stringify({
              "local": "Aliments locaux",
              "waste": "Réduction gaspillage",
              "garden": "Jardinage si possible"
            }),
            
            culminatingTask: JSON.stringify({
              "task": "Célébration diversité alimentaire",
              "format": "Expo, livre recettes, présentation",
              "inclusive": "Toutes traditions célébrées"
            }),
            
            socialJusticeConnections: JSON.stringify({
              "foodSecurity": "Droit à l'alimentation",
              "cultural": "Respect traditions alimentaires",
              "equity": "Accès équitable nutrition"
            })
          };
          break;
          
        case 5: // Mouvement et bien-être
          updateData = {
            bigIdeas: JSON.stringify([
              "Mon corps est fait pour bouger",
              "Toutes les façons de bouger sont valables",
              "Le mouvement aide mon bien-être",
              "Je peux adapter les activités à mes capacités"
            ]),
            
            essentialQuestions: JSON.stringify([
              "Comment le mouvement me fait sentir?",
              "Quels mouvements j'aime?",
              "Comment savoir quand me reposer?",
              "Comment bouger dans petit espace?"
            ]),
            
            keyVocabulary: JSON.stringify({
              "core": ["bouger", "fort", "souple", "respirer", "repos"],
              "extension": ["équilibre", "coordination", "endurance"],
              "support": ["stop", "lent", "vite", "fatigué"]
            }),
            
            assessmentPlan: JSON.stringify({
              "formative": {
                "participation": "Engagement selon capacités",
                "enjoyment": "Noter plaisir, pas performance",
                "adaptation": "Célébrer créativité"
              },
              "summative": {
                "demonstration": "Montrer mouvement favori",
                "wellbeing": "Auto-évaluation bien-être"
              }
            }),
            
            differentiationStrategies: JSON.stringify({
              "tier1": "Options assis/debout, musique variée, choix intensité",
              "tier2": "Équipement adaptatif, partenaire, pauses extra",
              "tier3": "Plan physiothérapeute, mouvements adaptés",
              "tier4": "Coordination médicale, participation observation"
            }),
            
            indigenousPerspectives: JSON.stringify({
              "teaching": "WISDOM - Sagesse écouter corps",
              "movement": "Mouvements quatre directions",
              "nature": "Connection terre par mouvement"
            }),
            
            successCriteria: JSON.stringify([
              "Participe selon capacités",
              "Essaie nouveaux mouvements",
              "Reconnaît besoins repos",
              "Respecte limites"
            ]),
            
            crossCurricularConnections: JSON.stringify({
              "francais": "Vocabulaire mouvement, instructions",
              "mathematiques": "Compter mouvements, rythmes",
              "sciences": "Corps en mouvement, respiration",
              "arts": "Danse créative, expression"
            }),
            
            technologyIntegration: JSON.stringify({
              "music": "Musiques variées mouvements",
              "video": "Vidéos mouvements adaptés",
              "apps": "Yoga/méditation enfants"
            }),
            
            communityConnections: JSON.stringify([
              "Instructeurs fitness adaptés",
              "Athlètes paralympiques",
              "Thérapeutes mouvement"
            ]),
            
            parentCommunicationPlan: JSON.stringify({
              "inclusive": "Suggestions mouvement famille",
              "noPresure": "Pas prescription exercice",
              "resources": "Ressources communautaires"
            }),
            
            priorKnowledge: JSON.stringify([
              "Capacités physiques variées",
              "Préférences mouvement personnelles",
              "Expériences sport diverses"
            ]),
            
            learningSkills: JSON.stringify({
              "persistence": "Essayer malgré défis",
              "selfCare": "Écouter limites corps",
              "creativity": "Adapter mouvements"
            }),
            
            fieldTripsAndGuestSpeakers: JSON.stringify([
              "Centre récréatif local",
              "Danseur/se professionnel",
              "Athlète adaptatif"
            ]),
            
            environmentalEducation: JSON.stringify({
              "outdoor": "Mouvement nature",
              "spaces": "Utilisation espaces verts",
              "weather": "Activités toutes saisons"
            }),
            
            culminatingTask: JSON.stringify({
              "task": "Démonstration mouvement personnel",
              "format": "Performance, vidéo, affiche",
              "choice": "Style et niveau au choix"
            }),
            
            socialJusticeConnections: JSON.stringify({
              "inclusion": "Sport pour tous",
              "accessibility": "Espaces accessibles",
              "celebration": "Célébrer toutes capacités"
            })
          };
          break;
          
        case 6: // Communauté et célébration
          updateData = {
            bigIdeas: JSON.stringify([
              "J'ai appris et grandi cette année",
              "Je fais partie d'une communauté",
              "L'été nécessite stratégies sécurité",
              "Je suis prêt pour Grade 2"
            ]),
            
            essentialQuestions: JSON.stringify([
              "De quoi suis-je fier?",
              "Comment rester sécuritaire l'été?",
              "Qui est ma communauté support?",
              "Comment aider ma communauté?"
            ]),
            
            keyVocabulary: JSON.stringify({
              "core": ["fier", "grandir", "été", "sécurité", "communauté"],
              "extension": ["accomplissement", "contribution", "transition"],
              "support": ["bien", "fort", "prêt", "merci"]
            }),
            
            assessmentPlan: JSON.stringify({
              "formative": {
                "portfolio": "Révision progrès année",
                "reflection": "Réflexion format choix",
                "community": "Identifier helpers"
              },
              "summative": {
                "celebration": "Présenter UN accomplissement",
                "safety": "Démontrer stratégie été"
              }
            }),
            
            differentiationStrategies: JSON.stringify({
              "tier1": "Formats présentation multiples, flexibilité juin",
              "tier2": "Préparation extra Grade 2, discussion inquiétudes",
              "tier3": "Ressources été, plan transition",
              "tier4": "Services été, documentation Grade 2"
            }),
            
            indigenousPerspectives: JSON.stringify({
              "teaching": "TRUTH - Célébrer vérité croissance",
              "cycle": "Complétion cycle, nouveau début",
              "gratitude": "Cérémonie gratitude année"
            }),
            
            successCriteria: JSON.stringify([
              "Identifie apprentissage",
              "Reconnaît croissance",
              "Nomme helpers",
              "Démontre stratégies été"
            ]),
            
            crossCurricularConnections: JSON.stringify({
              "francais": "Écriture remerciements, lecture été",
              "mathematiques": "Compter jours, calendrier",
              "sciences": "Sécurité soleil, saisons",
              "arts": "Souvenirs, performance"
            }),
            
            technologyIntegration: JSON.stringify({
              "documentation": "Photos/vidéos année",
              "celebration": "Musique, diaporama",
              "summer": "Ressources été en ligne"
            }),
            
            communityConnections: JSON.stringify([
              "Familles célébration",
              "Services communautaires été",
              "Bibliothèque programme été"
            ]),
            
            parentCommunicationPlan: JSON.stringify({
              "celebration": "Invitation célébration",
              "summer": "Ressources maintien acquis",
              "transition": "Préparation Grade 2"
            }),
            
            priorKnowledge: JSON.stringify([
              "Apprentissages année complète",
              "Relations développées",
              "Stratégies acquises"
            ]),
            
            learningSkills: JSON.stringify({
              "reflection": "Réfléchir croissance",
              "gratitude": "Exprimer reconnaissance",
              "readiness": "Préparation transitions"
            }),
            
            fieldTripsAndGuestSpeakers: JSON.stringify([
              "Sortie célébration",
              "Invités sécurité été",
              "Enseignant Grade 2 visite"
            ]),
            
            environmentalEducation: JSON.stringify({
              "summer": "Sécurité nature été",
              "conservation": "Protection environnement",
              "exploration": "Découverte été"
            }),
            
            culminatingTask: JSON.stringify({
              "task": "Portfolio année complète",
              "format": "Présentation choix",
              "celebration": "Partage volontaire"
            }),
            
            socialJusticeConnections: JSON.stringify({
              "community": "Contribution communauté",
              "growth": "Célébrer tous progrès",
              "future": "Espoir et possibilités"
            })
          };
          break;
      }
      
      // Update the unit
      await prisma.unitPlan.update({
        where: { id: unit.id },
        data: updateData
      });
      
      console.log(`✅ Unit ${unitNumber}: ${unit.titleFr} - Framework completed`);
    }
    
    console.log('\n🎉 ALL 6 FPS UNITS - PEDAGOGICAL FRAMEWORK COMPLETED!');
    console.log('✅ Big Ideas: Trauma-informed and emotionally safe');
    console.log('✅ Essential Questions: Optional sharing throughout');
    console.log('✅ Assessment Plans: Private options and multiple modalities');
    console.log('✅ Differentiation: Four-tier support system');
    console.log('✅ Indigenous Perspectives: Traditional wellness integrated');
    console.log('✅ Success Criteria: Observable and flexible');
    console.log('✅ All fields populated to 100% completion');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeFPSFramework();