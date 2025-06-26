/**
 * Bilingual Lesson Plan Templates for French Immersion and Core French Teachers
 */

export const bilingualLessonTemplates = [
  {
    title: 'French Immersion Math Lesson',
    titleFr: 'Leçon de mathématiques en immersion française',
    description: 'A template for teaching math concepts in French immersion',
    descriptionFr: 'Un modèle pour enseigner les concepts mathématiques en immersion française',
    type: 'LESSON_PLAN' as const,
    category: 'BY_SUBJECT' as const,
    subject: 'Mathematics',
    gradeMin: 1,
    gradeMax: 6,
    tags: ['french-immersion', 'math', 'bilingual'],
    keywords: ['immersion', 'mathématiques', 'nombres', 'calcul'],
    isSystem: true,
    isPublic: true,
    estimatedMinutes: 60,
    lessonStructure: {
      mindsOn: {
        duration: 10,
        activities: ['Number talk', 'Mental math warm-up'],
        activitiesFr: ['Conversation mathématique', 'Échauffement de calcul mental']
      },
      action: {
        duration: 35,
        activities: ['Guided practice', 'Partner work'],
        activitiesFr: ['Pratique guidée', 'Travail en partenaire']
      },
      consolidation: {
        duration: 15,
        activities: ['Exit ticket', 'Math journal'],
        activitiesFr: ['Billet de sortie', 'Journal mathématique']
      }
    },
    content: {
      title: 'Place Value Exploration',
      titleFr: 'Exploration de la valeur de position',
      mindsOn: 'Begin with a number talk in French. Show the number 235 and ask students: "Qu\'est-ce que vous voyez?" Encourage mathematical vocabulary.',
      mindsOnFr: 'Commencez par une conversation mathématique. Montrez le nombre 235 et demandez aux élèves : "Qu\'est-ce que vous voyez?" Encouragez le vocabulaire mathématique.',
      action: 'Students work with base-10 blocks to build numbers. Use French mathematical language: unités, dizaines, centaines.',
      actionFr: 'Les élèves travaillent avec des blocs de base 10 pour construire des nombres. Utilisez le langage mathématique français : unités, dizaines, centaines.',
      consolidation: 'Students complete an exit ticket explaining the value of each digit in a 3-digit number.',
      consolidationFr: 'Les élèves complètent un billet de sortie expliquant la valeur de chaque chiffre dans un nombre à 3 chiffres.',
      learningGoals: 'Students will understand place value in 3-digit numbers',
      learningGoalsFr: 'Les élèves comprendront la valeur de position dans les nombres à 3 chiffres',
      materials: ['Base-10 blocks', 'Whiteboards', 'Exit tickets'],
      materialsFr: ['Blocs de base 10', 'Tableaux blancs', 'Billets de sortie'],
      keyVocabulary: ['ones', 'tens', 'hundreds', 'place value'],
      keyVocabularyFr: ['unités', 'dizaines', 'centaines', 'valeur de position']
    }
  },
  {
    title: 'Core French Vocabulary Introduction',
    titleFr: 'Introduction du vocabulaire - Français de base',
    description: 'A template for introducing new vocabulary in Core French classes',
    descriptionFr: 'Un modèle pour introduire du nouveau vocabulaire en français de base',
    type: 'LESSON_PLAN' as const,
    category: 'BY_SUBJECT' as const,
    subject: 'French as a Second Language',
    gradeMin: 4,
    gradeMax: 8,
    tags: ['core-french', 'vocabulary', 'bilingual'],
    keywords: ['vocabulaire', 'FSL', 'oral', 'communication'],
    isSystem: true,
    isPublic: true,
    estimatedMinutes: 40,
    lessonStructure: {
      mindsOn: {
        duration: 8,
        activities: ['Visual vocabulary preview', 'TPR warm-up'],
        activitiesFr: ['Aperçu visuel du vocabulaire', 'Échauffement RPT']
      },
      action: {
        duration: 22,
        activities: ['Vocabulary games', 'Partner practice'],
        activitiesFr: ['Jeux de vocabulaire', 'Pratique avec partenaire']
      },
      consolidation: {
        duration: 10,
        activities: ['Quick quiz', 'Reflection'],
        activitiesFr: ['Quiz rapide', 'Réflexion']
      }
    },
    content: {
      title: 'Weather and Seasons Vocabulary',
      titleFr: 'Vocabulaire de la météo et des saisons',
      mindsOn: 'Display weather images. Students use gestures to show understanding (TPR). Review previous vocabulary.',
      mindsOnFr: 'Affichez des images de la météo. Les élèves utilisent des gestes pour montrer leur compréhension (RPT). Révisez le vocabulaire précédent.',
      action: 'Introduce new vocabulary with visuals. Play "Quel temps fait-il?" game. Students practice in pairs with weather cards.',
      actionFr: 'Introduisez le nouveau vocabulaire avec des visuels. Jouez au jeu "Quel temps fait-il?". Les élèves pratiquent en paires avec des cartes météo.',
      consolidation: 'Students draw their favorite weather and write a simple sentence in French.',
      consolidationFr: 'Les élèves dessinent leur météo préférée et écrivent une phrase simple en français.',
      learningGoals: 'Students will learn 8-10 weather vocabulary words in French',
      learningGoalsFr: 'Les élèves apprendront 8-10 mots de vocabulaire météo en français',
      materials: ['Weather flashcards', 'Drawing paper', 'Colored pencils'],
      materialsFr: ['Cartes éclairs météo', 'Papier à dessin', 'Crayons de couleur'],
      keyVocabulary: ['sunny', 'rainy', 'snowy', 'cloudy', 'windy'],
      keyVocabularyFr: ['ensoleillé', 'pluvieux', 'neigeux', 'nuageux', 'venteux']
    }
  },
  {
    title: 'Bilingual Science Investigation',
    titleFr: 'Investigation scientifique bilingue',
    description: 'A template for hands-on science lessons with bilingual support',
    descriptionFr: 'Un modèle pour des leçons de sciences pratiques avec support bilingue',
    type: 'LESSON_PLAN' as const,
    category: 'BY_SUBJECT' as const,
    subject: 'Science',
    gradeMin: 2,
    gradeMax: 5,
    tags: ['science', 'inquiry', 'bilingual', 'hands-on'],
    keywords: ['investigation', 'expérience', 'scientific method', 'méthode scientifique'],
    isSystem: true,
    isPublic: true,
    estimatedMinutes: 75,
    lessonStructure: {
      mindsOn: {
        duration: 15,
        activities: ['Wonder wall', 'Hypothesis formation'],
        activitiesFr: ['Mur des questions', 'Formation d\'hypothèses']
      },
      action: {
        duration: 45,
        activities: ['Investigation', 'Data collection'],
        activitiesFr: ['Investigation', 'Collecte de données']
      },
      consolidation: {
        duration: 15,
        activities: ['Share findings', 'Scientific drawing'],
        activitiesFr: ['Partager les découvertes', 'Dessin scientifique']
      }
    },
    content: {
      title: 'Properties of Matter Investigation',
      titleFr: 'Investigation des propriétés de la matière',
      mindsOn: 'Present mystery objects in bags. Students feel and describe using property words in both languages.',
      mindsOnFr: 'Présentez des objets mystères dans des sacs. Les élèves touchent et décrivent en utilisant des mots de propriétés dans les deux langues.',
      action: 'Students investigate objects at stations, recording observations in bilingual science journals.',
      actionFr: 'Les élèves investiguent des objets aux stations, enregistrant leurs observations dans des journaux scientifiques bilingues.',
      consolidation: 'Gallery walk to share findings. Students use sentence frames in both languages.',
      consolidationFr: 'Promenade en galerie pour partager les découvertes. Les élèves utilisent des cadres de phrases dans les deux langues.',
      learningGoals: 'Students will identify and describe properties of matter',
      learningGoalsFr: 'Les élèves identifieront et décriront les propriétés de la matière',
      materials: ['Mystery objects', 'Magnifying glasses', 'Science journals', 'Property word cards'],
      materialsFr: ['Objets mystères', 'Loupes', 'Journaux scientifiques', 'Cartes de mots de propriétés'],
      keyVocabulary: ['hard', 'soft', 'rough', 'smooth', 'flexible'],
      keyVocabularyFr: ['dur', 'mou', 'rugueux', 'lisse', 'flexible']
    }
  },
  {
    title: 'French Immersion Literacy Centers',
    titleFr: 'Centres de littératie en immersion française',
    description: 'A template for organizing literacy centers in French immersion',
    descriptionFr: 'Un modèle pour organiser des centres de littératie en immersion française',
    type: 'LESSON_PLAN' as const,
    category: 'BY_SUBJECT' as const,
    subject: 'Language Arts',
    gradeMin: 1,
    gradeMax: 3,
    tags: ['literacy', 'centers', 'french-immersion', 'differentiation'],
    keywords: ['lecture', 'écriture', 'centres', 'littératie'],
    isSystem: true,
    isPublic: true,
    estimatedMinutes: 90,
    lessonStructure: {
      mindsOn: {
        duration: 15,
        activities: ['Mini-lesson', 'Center expectations review'],
        activitiesFr: ['Mini-leçon', 'Révision des attentes des centres']
      },
      action: {
        duration: 60,
        activities: ['Rotation through 3 centers'],
        activitiesFr: ['Rotation à travers 3 centres']
      },
      consolidation: {
        duration: 15,
        activities: ['Sharing circle', 'Reflection'],
        activitiesFr: ['Cercle de partage', 'Réflexion']
      }
    },
    content: {
      title: 'Reading and Writing Centers',
      titleFr: 'Centres de lecture et d\'écriture',
      mindsOn: 'Review center expectations and today\'s learning goals. Model one activity from each center.',
      mindsOnFr: 'Révisez les attentes des centres et les objectifs d\'apprentissage. Modélisez une activité de chaque centre.',
      action: 'Center 1: Guided reading with teacher. Center 2: Word work activities. Center 3: Writing workshop.',
      actionFr: 'Centre 1 : Lecture guidée avec l\'enseignant. Centre 2 : Activités d\'étude de mots. Centre 3 : Atelier d\'écriture.',
      consolidation: 'Students share one thing they learned or created. Use talking stick for French oral practice.',
      consolidationFr: 'Les élèves partagent une chose qu\'ils ont apprise ou créée. Utilisez le bâton de parole pour la pratique orale.',
      learningGoals: 'Students will practice reading, writing, and word study skills',
      learningGoalsFr: 'Les élèves pratiqueront les compétences de lecture, d\'écriture et d\'étude de mots',
      materials: ['Leveled books', 'Word work materials', 'Writing folders', 'Anchor charts'],
      materialsFr: ['Livres nivelés', 'Matériel d\'étude de mots', 'Dossiers d\'écriture', 'Tableaux d\'ancrage'],
      keyVocabulary: ['reading', 'writing', 'words', 'sounds', 'story'],
      keyVocabularyFr: ['lecture', 'écriture', 'mots', 'sons', 'histoire']
    }
  },
  {
    title: 'Bilingual Physical Education',
    titleFr: 'Éducation physique bilingue',
    description: 'A template for PE lessons with bilingual instruction',
    descriptionFr: 'Un modèle pour les leçons d\'éducation physique avec instruction bilingue',
    type: 'LESSON_PLAN' as const,
    category: 'BY_SUBJECT' as const,
    subject: 'Physical Education',
    gradeMin: 1,
    gradeMax: 8,
    tags: ['PE', 'movement', 'bilingual', 'active'],
    keywords: ['physical', 'physique', 'movement', 'mouvement'],
    isSystem: true,
    isPublic: true,
    estimatedMinutes: 40,
    lessonStructure: {
      mindsOn: {
        duration: 8,
        activities: ['Dynamic warm-up', 'Movement vocabulary'],
        activitiesFr: ['Échauffement dynamique', 'Vocabulaire de mouvement']
      },
      action: {
        duration: 25,
        activities: ['Skill practice', 'Game play'],
        activitiesFr: ['Pratique des compétences', 'Jeu']
      },
      consolidation: {
        duration: 7,
        activities: ['Cool down', 'Reflection circle'],
        activitiesFr: ['Retour au calme', 'Cercle de réflexion']
      }
    },
    content: {
      title: 'Ball Skills Development',
      titleFr: 'Développement des habiletés avec ballon',
      mindsOn: 'Simon Says with movement vocabulary in both languages. Practice directional words.',
      mindsOnFr: 'Jean dit avec vocabulaire de mouvement dans les deux langues. Pratiquez les mots directionnels.',
      action: 'Skill stations: throwing/lancer, catching/attraper, bouncing/faire rebondir. Use both languages for instructions.',
      actionFr: 'Stations d\'habiletés : lancer, attraper, faire rebondir. Utilisez les deux langues pour les instructions.',
      consolidation: 'Cool down stretches with counting in French. Reflection on skills learned.',
      consolidationFr: 'Étirements de retour au calme en comptant en français. Réflexion sur les habiletés apprises.',
      learningGoals: 'Students will develop ball handling skills',
      learningGoalsFr: 'Les élèves développeront des habiletés de manipulation de ballon',
      materials: ['Various balls', 'Cones', 'Hoops', 'Music player'],
      materialsFr: ['Ballons variés', 'Cônes', 'Cerceaux', 'Lecteur de musique'],
      keyVocabulary: ['throw', 'catch', 'bounce', 'roll', 'pass'],
      keyVocabularyFr: ['lancer', 'attraper', 'faire rebondir', 'rouler', 'passer']
    }
  }
];

/**
 * Function to create bilingual lesson plan templates in the database
 */
export async function seedBilingualTemplates(prisma: { planTemplate: { create: (args: { data: unknown }) => Promise<unknown> } }, systemUserId: number) {
  const templates = [];
  
  for (const template of bilingualLessonTemplates) {
    const created = await prisma.planTemplate.create({
      data: {
        ...template,
        createdByUserId: systemUserId,
        usageCount: 0,
        averageRating: 0.0,
        totalRatings: 0,
      }
    });
    templates.push(created);
  }
  
  return templates;
}