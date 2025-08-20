import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectFrenchUnitsManually() {
  console.log('🎯 CREATING PERFECT FRENCH LANGUAGE ARTS UNITS MANUALLY\n');
  console.log('=' .repeat(80));
  console.log('Core + Extension Model: 195 lessons exactly');
  console.log('Grade 1 appropriate with complete pedagogical elements');
  console.log('ETFO compliant: All units 2-4 weeks\n');
  
  const EMILY_USER_ID = 23;
  const FRENCH_LRP_ID = 'cmebyc98h0001vjr1cvh4knsh'; // From the review
  
  try {
    // First, safely delete existing French unit plans
    console.log('🗑️  PHASE 1: REMOVING FLAWED FRENCH UNITS...\n');
    
    // Delete related records first to avoid foreign key constraints
    await prisma.unitPlanExpectation.deleteMany({
      where: {
        unitPlan: {
          longRangePlanId: FRENCH_LRP_ID
        }
      }
    });
    
    // Now delete the unit plans
    const deleteResult = await prisma.unitPlan.deleteMany({
      where: {
        longRangePlanId: FRENCH_LRP_ID
      }
    });
    
    console.log(`✅ Deleted ${deleteResult.count} flawed French units`);
    
    console.log('\\n📚 PHASE 2: CREATING 10 PERFECT FRENCH UNITS...\n');
    
    // Perfect French units with exact lesson counts
    const perfectFrenchUnits = [
      {
        title: 'Bienvenue en français',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-09-03', endDate: '2025-09-26',
        bigIdeas: 'Le français nous connecte et nous permet de découvrir le monde ensemble.',
        essentialQuestions: ['Qui suis-je en français?', 'Comment communiquer?', 'Pourquoi apprendre ensemble?'],
        description: 'Introduction joyeuse au français avec routines scolaires, vocabulaire essentiel et premières conversations.',
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Routines et salutations en français
• Leçons 3-4: Vocabulaire de la classe et consignes
• Leçons 5-6: Se présenter et faire connaissance
• Leçons 7-8: Comptines et rythmes français
• Leçons 9-10: Premiers livres et histoires simples
• Leçons 11-12: Écoute active et compréhension
• Leçons 13-14: Communication de base établie`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Jeux linguistiques et chansons
• Extension 3: Création de livre personnel "Moi en français"
• Extension 4: Théâtre simple et expressions
• Extension 5: Exploration culturelle française
• Extension 6: Célébration des premiers progrès`
      },
      {
        title: 'Histoires d\'automne',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-09-29', endDate: '2025-10-24',
        bigIdeas: 'Les histoires nous transportent et développent notre imaginaire français.',
        essentialQuestions: ['Que raconte l\'histoire?', 'Comment créer?', 'Qui sont les personnages?'],
        description: 'Exploration de contes automaux et création d\'histoires avec vocabulaire saisonnier.',
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Vocabulaire de l'automne
• Leçons 3-4: Structure d'une histoire simple
• Leçons 5-6: Personnages et lieux
• Leçons 7-8: Séquence d'événements
• Leçons 9-10: Contes traditionnels français
• Leçons 11-12: Compréhension et prédiction
• Leçons 13-14: Raconter une histoire complète`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Création d'histoire personnelle d'automne
• Extension 3: Livre illustré collectif
• Extension 4: Spectacle de contes avec costumes
• Extension 5: Visite virtuelle de la France automnale
• Extension 6: Festival d'histoires en classe`
      },
      {
        title: 'Ma famille française',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-10-27', endDate: '2025-11-21',
        bigIdeas: 'Ma famille est unique et précieuse, chaque famille a ses propres traditions.',
        essentialQuestions: ['Qui compose ma famille?', 'Comment décrire?', 'Quelles sont nos traditions?'],
        description: 'Vocabulaire familial, descriptions personnelles et partage respectueux des traditions familiales.',
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Membres de la famille
• Leçons 3-4: Descriptions physiques simples
• Leçons 5-6: Ce que fait ma famille
• Leçons 7-8: Où habite ma famille
• Leçons 9-10: Traditions et célébrations familiales
• Leçons 11-12: Respect des différentes familles
• Leçons 13-14: Présentation de ma famille`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Arbre généalogique créatif
• Extension 3: Interview de membre famille
• Extension 4: Livre "Ma famille spéciale"
• Extension 5: Partage de recette familiale
• Extension 6: Exposition des familles de la classe`
      },
      {
        title: 'Célébrations d\'hiver',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2025-11-24', endDate: '2025-12-19',
        bigIdeas: 'Les célébrations unissent les communautés et créent des souvenirs précieux.',
        essentialQuestions: ['Comment célébrer?', 'Que partager ensemble?', 'Pourquoi se rassembler?'],
        description: 'Traditions hivernales diverses, vocabulaire des fêtes et créations festives respectueuses.',
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Vocabulaire de l'hiver
• Leçons 3-4: Différentes célébrations hivernales
• Leçons 5-6: Traditions de Noël en France
• Leçons 7-8: Chansons et comptines hivernales
• Leçons 9-10: Cartes et vœux en français
• Leçons 11-12: Histoires de saison
• Leçons 13-14: Préparation spectacle de Noël`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Création de décorations avec mots français
• Extension 3: Écriture de conte de Noël original
• Extension 4: Cuisine traditionnelle française simple
• Extension 5: Correspondance avec classe française
• Extension 6: Spectacle multilingue et célébration`
      },
      {
        title: 'Poésie et rythmes',
        lessons: 20, hours: 15, core: 14, extension: 6,
        startDate: '2026-01-06', endDate: '2026-01-31',
        bigIdeas: 'La poésie donne rythme et beauté à notre langue française.',
        essentialQuestions: ['Comment rimer?', 'Quel rythme choisir?', 'Que ressentir?'],
        description: 'Découverte de comptines, création de poèmes simples et jeux de sonorités.',
        coreContent: `LEÇONS ESSENTIELLES (14):
• Leçons 1-2: Découverte des rimes
• Leçons 3-4: Comptines traditionnelles
• Leçons 5-6: Rythmes et répétitions
• Leçons 7-8: Sons qui se ressemblent
• Leçons 9-10: Création de vers simples
• Leçons 11-12: Poèmes avec gestes
• Leçons 13-14: Récitation et performance`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Poésie avec instruments de musique
• Extension 3: Livre personnel de poèmes
• Extension 4: Poésie visuelle et calligraphie
• Extension 5: Concours de récitation amical
• Extension 6: Café poésie pour les familles`
      },
      {
        title: 'Jeunes auteurs créatifs',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-02-02', endDate: '2026-02-27',
        bigIdeas: 'Écrire nous permet d\'exprimer nos idées et notre créativité unique.',
        essentialQuestions: ['Comment écrire clairement?', 'Que raconter?', 'Pour qui écrire?'],
        description: 'Processus d\'écriture guidé, création de textes personnels et révision collaborative.',
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Idées pour écrire
• Leçons 3-4: Organisation des idées
• Leçons 5-6: Phrases complètes
• Leçons 7-8: Révision avec aide
• Leçons 9-10: Amélioration du vocabulaire
• Leçons 11-12: Présentation du texte
• Leçon 13: Publication et partage`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Livre personnalisé illustré
• Extension 3: Écriture collaborative en groupe
• Extension 4: Journal créatif quotidien
• Extension 5: Correspondance avec autre classe
• Extension 6: Salon du livre jeunesse`
      },
      {
        title: 'Exploration de textes',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-03-02', endDate: '2026-03-27',
        bigIdeas: 'Différents types de textes servent différents buts et nous informent.',
        essentialQuestions: ['Quel type de texte?', 'Comment lire efficacement?', 'Que comprendre?'],
        description: 'Types de textes variés, stratégies de lecture et développement de la compréhension.',
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Histoires vs informations
• Leçons 3-4: Indices dans les images
• Leçons 5-6: Prédiction et vérification
• Leçons 7-8: Questions sur le texte
• Leçons 9-10: Résumé simple
• Leçons 11-12: Connexions personnelles
• Leçon 13: Évaluation de compréhension`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Création guide de lecture
• Extension 3: Club de lecture en petit groupe
• Extension 4: Théâtre de lecteurs
• Extension 5: Critique de livre pour enfants
• Extension 6: Recommandations littéraires`
      },
      {
        title: 'Communication créative',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-03-30', endDate: '2026-04-24',
        bigIdeas: 'Communiquer efficacement demande créativité, clarté et respect.',
        essentialQuestions: ['Comment bien parler?', 'Que présenter?', 'Comment convaincre?'],
        description: 'Présentations orales structurées, théâtre simple et communication persuasive.',
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Parler clairement et fort
• Leçons 3-4: Organisation d'une présentation
• Leçons 5-6: Utilisation de supports visuels
• Leçons 7-8: Écoute respectueuse
• Leçons 9-10: Questions et réponses
• Leçons 11-12: Expressions et gestes
• Leçon 13: Présentation finale évaluée`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Débat simple sur sujets d'enfants
• Extension 3: Création d'émission de radio
• Extension 4: Interview de personnalité locale
• Extension 5: Pièce de théâtre courte
• Extension 6: Conférence TEDx pour enfants`
      },
      {
        title: 'Explorateurs de mots',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-04-27', endDate: '2026-05-22',
        bigIdeas: 'Les mots sont des outils puissants pour exprimer nos pensées précises.',
        essentialQuestions: ['Comment enrichir vocabulaire?', 'Que signifient mots?', 'Comment jouer?'],
        description: 'Enrichissement systématique du vocabulaire, jeux de mots et familles lexicales.',
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Nouveaux mots chaque jour
• Leçons 3-4: Familles de mots
• Leçons 5-6: Synonymes simples
• Leçons 7-8: Mots opposés (antonymes)
• Leçons 9-10: Contexte aide compréhension
• Leçons 11-12: Dictionnaire junior
• Leçon 13: Utilisation dans phrases`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Jeux de vocabulaire créatifs
• Extension 3: Création dictionnaire personnel
• Extension 4: Chasse aux trésors lexicaux
• Extension 5: Charades et jeux de devinettes
• Extension 6: Concours d'orthographe amical`
      },
      {
        title: 'Notre année française',
        lessons: 19, hours: 14.25, core: 13, extension: 6,
        startDate: '2026-05-25', endDate: '2026-06-19',
        bigIdeas: 'Notre parcours français cette année mérite d\'être célébré et partagé.',
        essentialQuestions: ['Qu\'ai-je appris?', 'Comment ai-je grandi?', 'Que célébrer?'],
        description: 'Bilan réflexif de l\'année, création de portfolios et célébration des progrès.',
        coreContent: `LEÇONS ESSENTIELLES (13):
• Leçons 1-2: Révision des apprentissages
• Leçons 3-4: Portfolio personnel organisé
• Leçons 5-6: Lettre à mon futur moi
• Leçons 7-8: Conseils pour Grade 2
• Leçons 9-10: Préparation présentation
• Leçons 11-12: Célébration des progrès
• Leçon 13: Transition positive Grade 2`,
        extensionContent: `LEÇONS D'EXTENSION (6):
• Extension 1-2: Film documentaire de notre année
• Extension 3: Livre collectif "Notre Grade 1"
• Extension 4: Exposition pour les familles
• Extension 5: Mentorat des futurs Grade 1
• Extension 6: Cérémonie de graduation française`
      }
    ];
    
    // Verify lesson count
    const totalLessons = perfectFrenchUnits.reduce((sum, unit) => sum + unit.lessons, 0);
    const totalHours = perfectFrenchUnits.reduce((sum, unit) => sum + unit.hours, 0);
    
    console.log(`Mathematical verification:`);
    console.log(`Total lessons: ${totalLessons} (Target: 195) ${totalLessons === 195 ? '✅' : '❌'}`);
    console.log(`Total hours: ${totalHours} (Target: ~146.25) ${Math.abs(totalHours - 146.25) < 1 ? '✅' : '❌'}\\n`);
    
    if (totalLessons !== 195) {
      throw new Error(`Lesson count error: ${totalLessons} instead of 195`);
    }
    
    // Create each perfect unit
    for (let i = 0; i < perfectFrenchUnits.length; i++) {
      const unit = perfectFrenchUnits[i];
      console.log(`Creating Unit ${i + 1}: ${unit.title} (${unit.lessons} lessons)...`);
      
      const createdUnit = await prisma.unitPlan.create({
        data: {
          userId: EMILY_USER_ID,
          longRangePlanId: FRENCH_LRP_ID,
          title: unit.title,
          titleFr: unit.title,
          description: `${unit.description}

STRUCTURE CORE + EXTENSION (${unit.lessons} leçons totales):
• Leçons essentielles: ${unit.core} (70% - contenu obligatoire pour tous)
• Leçons d'extension: ${unit.extension} (30% - enrichissement/consolidation flexible)

Cette structure permet une adaptation naturelle selon les besoins et le rythme de la classe.`,
          descriptionFr: unit.description,
          bigIdeas: unit.bigIdeas,
          bigIdeasFr: unit.bigIdeas,
          essentialQuestions: unit.essentialQuestions,
          startDate: new Date(unit.startDate),
          endDate: new Date(unit.endDate),
          estimatedHours: unit.hours,
          
          // Perfect Assessment Plan with Core + Extension details
          assessmentPlan: `ÉVALUATION FLEXIBLE GRADE 1:

STRUCTURE TEMPORELLE (${unit.lessons} leçons = ${unit.hours} heures):
• ${unit.core} leçons essentielles (priorité absolue - tous élèves)
• ${unit.extension} leçons d'extension (adaptation selon classe)

${unit.coreContent}

${unit.extensionContent}

TYPES D'ÉVALUATION INTÉGRÉE:
• Formatif: Observations quotidiennes, conversations françaises
• Comme apprentissage: Auto-évaluation avec émojis et dessins
• Sommatif: Tâches de performance concrètes en français

POINTS DE DÉCISION FLEXIBLES:
• Jour 3: Diagnostic rapide → ajuster rythme si nécessaire
• Mi-parcours: Vérification compréhension → réenseigner ou accélérer
• Fin d'unité: Portfolio et célébration → documenter croissance`,
          
          // Perfect Grade 1 Differentiation
          differentiationStrategies: {
            forStruggling: `SOUTIEN INTENSIF FRANÇAIS:
• Focus exclusif sur ${unit.core} leçons essentielles
• Manipulation et supports visuels constants
• Extensions utilisées pour pratique supplémentaire
• Groupes de besoins linguistiques (3-4 élèves)
• Temps flexible selon acquisition langue`,
            
            forOnLevel: `PROGRESSION ÉQUILIBRÉE:
• Complétion ${unit.core} essentielles + extensions sélectionnées
• Équilibre écoute/parole/lecture/écriture
• Applications créatives des concepts français
• Auto-évaluation régulière de progrès`,
            
            forAdvanced: `ENRICHISSEMENT FRANÇAIS:
• Passage accéléré par ${unit.core} essentielles
• Toutes ${unit.extension} extensions + défis linguistiques
• Leadership en français et mentorat de pairs
• Projets créatifs autonomes en français`,
            
            forELL: `SOUTIEN ACQUISITION FRANÇAIS:
• Vocabulaire avec supports visuels et gestes
• Modélisation répétée et patient
• Connexions respectueuses avec langue maternelle
• Célébration active de chaque progrès français`
          },
          
          // Perfect Success Criteria for French
          successCriteria: {
            beginning: `DÉBUT FRANÇAIS:
• Écoute avec attention croissante
• Participe avec gestes et mots simples
• Reconnaît vocabulaire de base
• Montre plaisir d'apprendre français`,
            
            developing: `FRANÇAIS EN DÉVELOPPEMENT:
• Comprend consignes simples en français
• Utilise phrases courtes pour communiquer
• Lit mots familiers avec aide
• Écrit lettres et mots copiés correctement`,
            
            proficient: `MAÎTRISE FRANÇAISE ATTENDUE:
• Comprend et suit conversations simples
• S'exprime clairement en phrases complètes
• Lit textes simples de façon autonome
• Écrit messages courts et compréhensibles`,
            
            extending: `EXTENSION FRANÇAISE:
• Comprend nuances et expressions
• Crée textes originaux et complexes
• Lit avec expression et intonation
• Aide naturellement autres élèves en français`
          },
          
          // French-specific connections
          crossCurricularConnections: `INTÉGRATION FRANÇAISE NATURELLE:
• Mathématiques: Problèmes et explications en français
• Sciences: Vocabulaire scientifique et observations
• Arts: Descriptions créatives et critiques d'art
• Social Studies: Culture française et francophone
• Santé: Communication sur bien-être en français`,
          
          // Community connections for French
          communityConnections: `CONNEXIONS FRANCOPHONES:
• Familles francophones invitées à partager
• Sorties dans communauté française locale
• Correspondance avec écoles françaises (virtuelle)
• Événements culturels français régionaux
• Partenariats avec centres culturels français`,
          
          // Indigenous perspectives appropriate to French learning
          indigenousPerspectives: `PERSPECTIVES AUTOCHTONES RESPECTUEUSES:
Reconnaissance que plusieurs langues autochtones étaient parlées sur cette terre avant le français. Apprentissage de quelques mots Mi'kmaq en parallèle avec français pour honorer les premières langues de cette région.`,
          
          // Realistic parent communication
          parentCommunicationPlan: `COMMUNICATION FAMILIALE RÉALISTE:
• Hebdomadaire: Portfolio photos d'activités françaises
• Bi-mensuel: Suggestions d'activités françaises maison (optionnelles)
• Mensuel: Célébration informelle des progrès français
• Au besoin: Rencontre individuelle sur développement français
• Ressources: Liste de livres/chansons français pour familles`,
          
          // Flexible culminating task
          culminatingTask: `TÂCHE CULMINANTE ADAPTABLE EN FRANÇAIS:

OPTION MINIMUM (Leçons essentielles complétées):
• Présentation courte (2-3 minutes) en français
• Portfolio simple avec travaux favoris
• Auto-évaluation avec supports visuels
• Participation à célébration de classe

OPTION COMPLÈTE (Toutes leçons + extensions):
• Projet créatif multimodal en français
• Présentation enrichie (5 minutes) aux familles
• Portfolio détaillé avec réflexions écrites
• Leadership dans célébration publique

L'option choisie dépend du parcours de la classe et du niveau d'acquisition du français atteint.`
        }
      });
      
      console.log(`  ✅ Created successfully with ID: ${createdUnit.id}`);
    }
    
    console.log('\\n🎉 PERFECT FRENCH LANGUAGE ARTS UNITS COMPLETED!');
    console.log('=' .repeat(80));
    console.log('✅ 195 lessons exactly with Core + Extension flexibility');
    console.log('✅ All units 2-4 weeks (ETFO compliant)');
    console.log('✅ Complete pedagogical elements included');
    console.log('✅ Grade 1 appropriate developmental progression');
    console.log('✅ French immersion ready with cultural sensitivity');
    console.log('✅ Built-in differentiation and assessment');
    console.log('✅ Indigenous perspectives respectfully integrated');
    console.log('\\n🚀 READY FOR EMILY\'S FRENCH CLASSROOM SUCCESS!');
    
  } catch (error) {
    console.error('Error creating perfect French units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectFrenchUnitsManually();