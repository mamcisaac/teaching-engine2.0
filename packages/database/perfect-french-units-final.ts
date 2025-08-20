import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function perfectFrenchUnits() {
  try {
    console.log('🎯 PERFECTING ALL 10 FRENCH LANGUAGE ARTS UNITS...\n');
    
    // Unit 1: Bienvenue à l'école française
    await prisma.unitPlan.update({
      where: { id: 'cmehuts790001vjh8lqyuigsh' },
      data: {
        startDate: new Date('2025-09-03'), // Correct start date
        endDate: new Date('2025-09-27'),
        estimatedHours: 14.25, // Fixed precision
        title: "Bienvenue à l'école française",
        essentialQuestions: [
          "Semaine 1: Qui suis-je dans cette classe française?",
          "Semaine 2: Comment puis-je communiquer mes besoins en français?",
          "Semaine 3: Qu'est-ce qui rend notre classe spéciale?",
          "Semaine 4: Comment notre classe devient-elle une famille française?"
        ],
        assessmentPlan: "QUOTIDIEN: Exit tickets avec 2-3 comportements observables (prononciation du prénom, utilisation de 'bonjour/au revoir', identification d'objets). HEBDOMADAIRE: Performance de communication orale (rubrique 4 niveaux: émergent, en développement, compétent, avancé). BI-HEBDOMADAIRE: Portfolio - ajout de première écriture du nom, enregistrement vocal. CULMINATION: Tour guidé de la classe en français avec auto-évaluation.",
        successCriteria: {
          daily: ["Je prononce mon nom clairement", "J'utilise les salutations appropriées", "Je nomme 3 nouveaux objets par jour"],
          weekly: ["Je participe aux routines de classe", "Je pose des questions simples", "J'écris mon prénom correctement"],
          unit: ["Je peux présenter ma classe en français", "Je connais 30+ mots essentiels", "Je me sens à l'aise en français"]
        }
      }
    });
    console.log('✅ Unit 1 perfected with precise assessment criteria');

    // Unit 2: Ma famille et moi
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7c0003vjh8c5wkyb7z' },
      data: {
        startDate: new Date('2025-09-30'),
        endDate: new Date('2025-10-24'),
        estimatedHours: 15, // 20 lessons exactly
        title: "Ma famille et moi",
        descriptionFr: "Unité explorant l'identité personnelle et familiale comme pont vers la communauté. Les élèves développent le vocabulaire familial tout en construisant des phrases complètes pour raconter leurs histoires personnelles. Cette unité crée une transition naturelle de l'individu vers le collectif.",
        essentialQuestions: [
          "Semaine 1: Qui sont les membres importants de ma famille?",
          "Semaine 2: Qu'est-ce qui rend ma famille unique?",
          "Semaine 3: Comment ma famille fait-elle partie de la communauté?",
          "Semaine 4: Quelles histoires puis-je raconter sur ma famille?"
        ],
        assessmentPlan: "QUOTIDIEN: Vérification du vocabulaire familial (cartes éclairs, associations image-mot). HEBDOMADAIRE: Présentation orale sur un membre de famille (rubrique: prononciation, vocabulaire, structure de phrase). BI-HEBDOMADAIRE: Page de livre familial avec description écrite. CULMINATION: 'Mon livre de famille' avec présentation aux parents.",
        successCriteria: {
          daily: ["Je nomme tous les membres de ma famille", "J'utilise des adjectifs descriptifs", "Je fais des phrases complètes"],
          weekly: ["Je présente un membre de famille", "J'écris 3 phrases sur ma famille", "Je pose des questions sur les familles"],
          unit: ["Je crée mon livre de famille", "Je raconte 3 histoires familiales", "Je compare les familles respectueusement"]
        }
      }
    });
    console.log('✅ Unit 2 perfected with family-to-community bridge');

    // Unit 3: Notre communauté scolaire (renamed from Les contes d'automne)
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7d0005vjh8t77cd7mr' },
      data: {
        startDate: new Date('2025-10-28'), // Adjusted after October break
        endDate: new Date('2025-11-21'),
        estimatedHours: 14.25,
        title: "Notre communauté scolaire",
        titleFr: "Notre communauté scolaire",
        description: "Unit exploring the school community expanding to the neighborhood. Students learn about community helpers, places, and relationships while developing descriptive language. This unit bridges family unit to broader community understanding.",
        descriptionFr: "Unité explorant la communauté scolaire s'étendant au quartier. Les élèves apprennent sur les aides communautaires, les lieux et les relations tout en développant le langage descriptif.",
        essentialQuestions: [
          "Semaine 1: Qui nous aide dans notre école?",
          "Semaine 2: Quels sont les endroits importants de notre école?",
          "Semaine 3: Comment notre école se connecte-t-elle au quartier?",
          "Semaine 4: Comment contribuons-nous à notre communauté?"
        ],
        assessmentPlan: "QUOTIDIEN: Interviews de membres du personnel (grille d'observation: questions posées, écoute active). HEBDOMADAIRE: Carte de la communauté avec légendes en français. BI-HEBDOMADAIRE: Description écrite d'un lieu communautaire. CULMINATION: Guide touristique de notre école pour les visiteurs.",
        bigIdeas: "Our school is a community where everyone has a role. Communities help us learn and grow together. We can contribute to our community in French. Understanding our community helps us belong.",
        bigIdeasFr: "Notre école est une communauté où chacun a un rôle. Les communautés nous aident à apprendre et grandir ensemble.",
        keyVocabulary: ["directeur", "secrétaire", "concierge", "bibliothécaire", "infirmière", "chauffeur", "cafétéria", "gymnase", "bibliothèque", "bureau", "couloir", "cour de récréation", "quartier", "rue", "parc", "magasin", "aide", "travaille", "enseigne", "apprend"],
        crossCurricularConnections: "MATH: Mapping distances, counting community helpers, graphing favorite places. SCIENCE: Observing community environments, exploring school gardens. ARTS: Drawing community maps, creating helper portraits. SOCIAL STUDIES: Understanding roles and responsibilities, community symbols.",
        successCriteria: {
          daily: ["J'identifie 3 nouveaux lieux", "Je décris le travail des gens", "Je pose des questions pertinentes"],
          weekly: ["Je présente un aide communautaire", "Je crée une carte avec légendes", "J'écris sur notre communauté"],
          unit: ["Je guide un tour en français", "Je connais 20+ rôles communautaires", "Je participe activement"]
        }
      }
    });
    console.log('✅ Unit 3 renamed and refocused on school community');

    // Unit 4: Les merveilles de l'automne
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7e0007vjh8alh6rzxj' },
      data: {
        startDate: new Date('2025-11-24'), // Monday start
        endDate: new Date('2025-12-19'),
        estimatedHours: 15,
        title: "Les merveilles de l'automne",
        titleFr: "Les merveilles de l'automne",
        description: "Nature observation unit focusing on autumn changes with scientific vocabulary integration. Students develop precise descriptive language while documenting seasonal transformations. This unit emphasizes observation skills and scientific thinking in French.",
        descriptionFr: "Unité d'observation de la nature axée sur les changements automnaux avec intégration du vocabulaire scientifique. Les élèves développent un langage descriptif précis tout en documentant les transformations saisonnières.",
        essentialQuestions: [
          "Semaine 1: Quels changements observons-nous dehors?",
          "Semaine 2: Pourquoi les feuilles changent-elles de couleur?",
          "Semaine 3: Comment les animaux se préparent-ils pour l'hiver?",
          "Semaine 4: Qu'est-ce que l'automne nous enseigne sur les cycles?"
        ],
        assessmentPlan: "QUOTIDIEN: Journal d'observations naturelles (critères: précision du vocabulaire, utilisation d'adjectifs). HEBDOMADAIRE: Présentation d'une collection naturelle avec descriptions. BI-HEBDOMADAIRE: Rapport scientifique simple sur un phénomène automnal. CULMINATION: Exposition scientifique d'automne avec explications.",
        bigIdeas: "Nature follows predictable patterns we can observe and describe. Scientific vocabulary helps us explain natural phenomena. Autumn teaches us about cycles and change. Observation is the foundation of scientific thinking.",
        bigIdeasFr: "La nature suit des modèles prévisibles que nous pouvons observer et décrire. Le vocabulaire scientifique nous aide à expliquer les phénomènes naturels.",
        successCriteria: {
          daily: ["J'observe 3 détails naturels", "J'utilise le vocabulaire scientifique", "Je fais des prédictions"],
          weekly: ["Je présente mes observations", "J'explique un changement naturel", "Je compare avant/après"],
          unit: ["Je crée une exposition scientifique", "J'explique les cycles naturels", "J'utilise 40+ mots scientifiques"]
        }
      }
    });
    console.log('✅ Unit 4 enhanced with scientific observation focus');

    // Unit 5: Célébrations et traditions (adjusted for winter break)
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7f0009vjh8ainnojnx' },
      data: {
        startDate: new Date('2026-01-06'), // After winter break
        endDate: new Date('2026-01-30'),
        estimatedHours: 14.25,
        title: "Célébrations et traditions",
        titleFr: "Célébrations et traditions",
        description: "Cultural celebrations unit exploring diverse winter traditions after the holiday break. Students share their celebration experiences while learning about global traditions. This timing allows for authentic sharing of recent holiday experiences.",
        descriptionFr: "Unité sur les célébrations culturelles explorant diverses traditions hivernales après les vacances. Les élèves partagent leurs expériences de célébration tout en apprenant sur les traditions mondiales.",
        essentialQuestions: [
          "Semaine 1: Comment avons-nous célébré pendant les vacances?",
          "Semaine 2: Quelles traditions existent dans notre classe?",
          "Semaine 3: Comment différentes cultures célèbrent-elles l'hiver?",
          "Semaine 4: Qu'est-ce que les célébrations nous enseignent?"
        ],
        assessmentPlan: "QUOTIDIEN: Partage de traditions (grille: clarté, vocabulaire, respect culturel). HEBDOMADAIRE: Comparaison de célébrations (diagramme de Venn commenté). BI-HEBDOMADAIRE: Création d'invitation pour une célébration. CULMINATION: Festival multiculturel avec présentations familiales.",
        bigIdeas: "Celebrations connect us to our cultures and communities. Every tradition has meaning and value. Sharing traditions builds understanding. Winter celebrations bring light to dark times.",
        bigIdeasFr: "Les célébrations nous connectent à nos cultures et communautés. Chaque tradition a une signification et une valeur.",
        successCriteria: {
          daily: ["Je partage mes expériences", "J'écoute respectueusement", "J'apprends 3 nouvelles traditions"],
          weekly: ["Je compare 2 célébrations", "J'explique une tradition", "Je pose des questions culturelles"],
          unit: ["Je présente ma tradition familiale", "Je respecte toutes les traditions", "Je connais 10+ célébrations"]
        }
      }
    });
    console.log('✅ Unit 5 adjusted for winter break with celebration focus');

    // Unit 6: Poésie, rythme et mouvement
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7g000bvjh8edstnto8' },
      data: {
        startDate: new Date('2026-02-03'), // February start
        endDate: new Date('2026-02-27'),
        estimatedHours: 15,
        title: "Poésie, rythme et mouvement",
        titleFr: "Poésie, rythme et mouvement",
        description: "Phonological awareness unit emphasizing French sounds through poetry, songs, and movement. Students develop pronunciation and rhythm while exploring the musicality of French. This unit strengthens oral fluency through playful language exploration.",
        descriptionFr: "Unité de conscience phonologique mettant l'accent sur les sons français à travers la poésie, les chansons et le mouvement. Les élèves développent la prononciation et le rythme tout en explorant la musicalité du français.",
        essentialQuestions: [
          "Semaine 1: Quels sons riment en français?",
          "Semaine 2: Comment le rythme aide-t-il la mémorisation?",
          "Semaine 3: Comment créer des poèmes amusants?",
          "Semaine 4: Comment la musique enrichit-elle le français?"
        ],
        assessmentPlan: "QUOTIDIEN: Identification de rimes et sons (checklist phonologique). HEBDOMADAIRE: Performance de poème ou chanson (rubrique: prononciation, rythme, expression). BI-HEBDOMADAIRE: Création de vers rimés. CULMINATION: Café de poésie avec performances et créations originales.",
        bigIdeas: "French has unique sounds and rhythms that make it musical. Poetry and songs help us remember language patterns. Movement reinforces language learning. Phonological awareness is the foundation of reading.",
        bigIdeasFr: "Le français a des sons et rythmes uniques qui le rendent musical. La poésie et les chansons nous aident à mémoriser les modèles linguistiques.",
        successCriteria: {
          daily: ["J'identifie les rimes", "Je maintiens le rythme", "Je prononce clairement"],
          weekly: ["Je récite un poème", "Je crée des rimes", "Je chante avec confiance"],
          unit: ["Je performe au café poésie", "Je crée 5 poèmes", "Je maîtrise 20 comptines"]
        }
      }
    });
    console.log('✅ Unit 6 enhanced with phonological awareness emphasis');

    // Unit 7: Explorons les textes informatifs
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7g000dvjh8tgovkgvj' },
      data: {
        startDate: new Date('2026-03-03'), // March start
        endDate: new Date('2026-03-27'),
        estimatedHours: 14.25,
        title: "Explorons les textes informatifs",
        titleFr: "Explorons les textes informatifs",
        description: "Research skills unit developing information literacy through exploration of non-fiction texts. Students learn to find answers, ask questions, and share discoveries. This unit builds critical thinking and research foundations.",
        descriptionFr: "Unité de compétences de recherche développant la littératie informationnelle à travers l'exploration de textes non-fictionnels. Les élèves apprennent à trouver des réponses, poser des questions et partager des découvertes.",
        essentialQuestions: [
          "Semaine 1: Comment trouver des informations dans les livres?",
          "Semaine 2: Quelles questions nous aident à apprendre?",
          "Semaine 3: Comment vérifier si l'information est vraie?",
          "Semaine 4: Comment partager nos découvertes?"
        ],
        assessmentPlan: "QUOTIDIEN: Formulation de questions (qualité et pertinence des questions). HEBDOMADAIRE: Mission de recherche avec présentation de découvertes. BI-HEBDOMADAIRE: Création de page informative illustrée. CULMINATION: Foire aux découvertes avec stations d'information.",
        bigIdeas: "Questions drive learning and discovery. Information texts have special features that help us learn. Research skills help us find reliable information. Sharing discoveries multiplies learning.",
        bigIdeasFr: "Les questions stimulent l'apprentissage et la découverte. Les textes informatifs ont des caractéristiques spéciales qui nous aident à apprendre.",
        successCriteria: {
          daily: ["Je pose 3 bonnes questions", "Je trouve des réponses", "J'utilise les indices du texte"],
          weekly: ["Je présente une découverte", "Je vérifie l'information", "Je prends des notes simples"],
          unit: ["Je mène une recherche complète", "Je crée une station d'information", "Je deviens expert d'un sujet"]
        }
      }
    });
    console.log('✅ Unit 7 refocused on information literacy and research');

    // Unit 8: Créateurs d'histoires
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7h000fvjh8sbuk2efh' },
      data: {
        startDate: new Date('2026-03-31'), // After March break
        endDate: new Date('2026-04-24'),
        estimatedHours: 15,
        title: "Créateurs d'histoires",
        titleFr: "Créateurs d'histoires",
        description: "Creative writing unit emphasizing all writing traits through story creation. Students develop characters, settings, and plots while learning revision strategies. This unit celebrates imagination and the writing process.",
        descriptionFr: "Unité d'écriture créative mettant l'accent sur tous les traits d'écriture à travers la création d'histoires. Les élèves développent des personnages, des décors et des intrigues tout en apprenant des stratégies de révision.",
        essentialQuestions: [
          "Semaine 1: D'où viennent les idées pour les histoires?",
          "Semaine 2: Comment créer des personnages mémorables?",
          "Semaine 3: Qu'est-ce qui rend une histoire captivante?",
          "Semaine 4: Comment améliorer notre écriture?"
        ],
        assessmentPlan: "QUOTIDIEN: Développement d'histoire (idées, organisation, voix). HEBDOMADAIRE: Atelier d'écriture avec rétroaction par les pairs. BI-HEBDOMADAIRE: Révision et amélioration d'une histoire. CULMINATION: Festival des auteurs avec publication et présentation.",
        bigIdeas: "Everyone has stories waiting to be told. Writing is a process of creation and revision. Stories have elements that work together. Authors make choices to engage readers.",
        bigIdeasFr: "Tout le monde a des histoires à raconter. L'écriture est un processus de création et de révision.",
        successCriteria: {
          daily: ["Je génère 3 idées", "Je développe mes personnages", "J'ajoute des détails"],
          weekly: ["Je structure mon histoire", "Je révise mon travail", "Je donne des suggestions utiles"],
          unit: ["Je publie une histoire complète", "J'utilise tous les traits d'écriture", "Je célèbre mon écriture"]
        }
      }
    });
    console.log('✅ Unit 8 enhanced with all writing traits focus');

    // Unit 9: Découvertes littéraires
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7i000hvjh82072rte4' },
      data: {
        startDate: new Date('2026-04-28'), // Late April
        endDate: new Date('2026-05-22'),
        estimatedHours: 14.25,
        title: "Découvertes littéraires",
        titleFr: "Découvertes littéraires",
        description: "Genre exploration unit discovering different types of French literature. Students explore fiction, non-fiction, poetry, and graphic texts while developing preferences and critical thinking. This unit builds literary appreciation.",
        descriptionFr: "Unité d'exploration des genres découvrant différents types de littérature française. Les élèves explorent la fiction, la non-fiction, la poésie et les textes graphiques tout en développant des préférences et la pensée critique.",
        essentialQuestions: [
          "Semaine 1: Quels types de livres existent?",
          "Semaine 2: Comment chaque genre est-il spécial?",
          "Semaine 3: Quels genres préférons-nous et pourquoi?",
          "Semaine 4: Comment les auteurs créent-ils différents genres?"
        ],
        assessmentPlan: "QUOTIDIEN: Exploration de genre (identification des caractéristiques). HEBDOMADAIRE: Critique de livre avec justification de préférence. BI-HEBDOMADAIRE: Comparaison de deux genres différents. CULMINATION: Salon du livre avec recommandations par genre.",
        bigIdeas: "Literature comes in many forms, each with unique purposes. Different genres appeal to different readers. Understanding genres helps us choose books. Literary appreciation enriches our lives.",
        bigIdeasFr: "La littérature prend plusieurs formes, chacune avec des buts uniques. Différents genres attirent différents lecteurs.",
        successCriteria: {
          daily: ["J'identifie le genre", "Je nomme les caractéristiques", "J'explore avec curiosité"],
          weekly: ["Je critique un livre", "Je compare des genres", "Je justifie mes préférences"],
          unit: ["Je recommande par genre", "Je connais 8+ genres", "J'apprécie la diversité littéraire"]
        }
      }
    });
    console.log('✅ Unit 9 focused on genre exploration and literary appreciation');

    // Unit 10: Notre voyage continue
    await prisma.unitPlan.update({
      where: { id: 'cmehuts7j000jvjh81z9neuhg' },
      data: {
        startDate: new Date('2026-05-26'), // Late May
        endDate: new Date('2026-06-24'),
        estimatedHours: 15,
        title: "Notre voyage continue",
        titleFr: "Notre voyage continue",
        description: "Culminating celebration unit where students reflect on their French learning journey, showcase growth across ALL curriculum expectations, and prepare for Grade 2. This unit provides spiral review while celebrating achievements.",
        descriptionFr: "Unité culminante où les élèves réfléchissent sur leur parcours d'apprentissage du français, présentent leur croissance à travers TOUTES les attentes du curriculum, et se préparent pour la 2e année.",
        essentialQuestions: [
          "Semaine 1: Comment ai-je grandi comme francophone?",
          "Semaine 2: Quelles sont mes plus grandes réussites?",
          "Semaine 3: Comment puis-je aider les autres à apprendre?",
          "Semaine 4: Que vais-je accomplir en 2e année?"
        ],
        assessmentPlan: "QUOTIDIEN: Auto-évaluation de croissance (portfolio de preuves). HEBDOMADAIRE: Démonstration de compétences acquises. BI-HEBDOMADAIRE: Mentorat des élèves de maternelle. CULMINATION: Spectacle de fin d'année présentant tous les apprentissages.",
        bigIdeas: "Reflection reveals our growth and progress. Celebrating achievements motivates future learning. We have become confident French speakers. Our French journey continues beyond Grade 1.",
        bigIdeasFr: "La réflexion révèle notre croissance et nos progrès. Célébrer les réussites motive l'apprentissage futur. Nous sommes devenus des francophones confiants.",
        successCriteria: {
          daily: ["Je documente ma croissance", "Je pratique toutes les compétences", "Je mens des autres"],
          weekly: ["Je démontre mes apprentissages", "Je réfléchis profondément", "Je fixe des objectifs"],
          unit: ["Je célèbre mon parcours", "Je maîtrise les 15 attentes", "Je suis prêt pour la 2e année"]
        }
      }
    });
    console.log('✅ Unit 10 designed as comprehensive culmination with all expectations');

    console.log('\n🎯 ALL 10 UNITS PERFECTED WITH:');
    console.log('• Progressive weekly essential questions');
    console.log('• Specific daily/weekly/unit assessment criteria');
    console.log('• Natural thematic flow and connections');
    console.log('• Corrected dates and precise hours');
    console.log('• Enhanced descriptions and big ideas');
    
  } catch (error) {
    console.error('Error perfecting units:', error);
  } finally {
    await prisma.$disconnect();
  }
}

perfectFrenchUnits();