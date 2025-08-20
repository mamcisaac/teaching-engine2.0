/**
 * 🇫🇷 FRANÇAIS (IMMERSION) LESSON TEMPLATE
 * Grade 1 French Immersion - 195 lessons per year
 * 
 * Specialized for French language development:
 * - Oral communication focus
 * - Reading development in French
 * - Writing foundations
 * - Cultural connections
 */

import { LessonPlanTemplate, Activity, LearningGoal, Assessment, Vocabulary } from '../types/LessonPlanTemplate';
import { MasterLessonTemplate } from '../core/MasterTemplate';

export class FrenchImmerTemplate {
  
  /**
   * Creates a perfect French Immersion lesson template
   */
  static createFrenchLesson(config: {
    unitPlanId: string;
    title: string;
    titleEn?: string;
    focus: 'oral' | 'reading' | 'writing' | 'integrated';
    thematicUnit?: string;
    vocabulary: Vocabulary[];
    storyBook?: string;
  }): LessonPlanTemplate {
    
    // Start with master template
    const template = MasterLessonTemplate.createTemplate({
      subject: 'Français (Immersion)',
      unitPlanId: config.unitPlanId,
      title: config.title,
      titleEn: config.titleEn,
      learningGoals: this.generateFrenchLearningGoals(config.focus),
      vocabulary: config.vocabulary,
      indigenousPerspectives: this.getFrenchIndigenousPerspectives()
    });
    
    // French-specific big ideas and essential questions
    template.bigIdeas = [
      'Le français me permet de communiquer mes pensées et mes sentiments',
      'Les histoires nous transportent dans des mondes magiques',
      'Chaque mot français que j\'apprends m\'aide à mieux comprendre le monde',
      'La culture francophone est riche et diversifiée'
    ];
    
    template.essentialQuestions = [
      'Comment puis-je exprimer mes idées en français?',
      'Qu\'est-ce qui rend une histoire captivante?',
      'Comment les sons et les lettres s\'assemblent-ils pour faire des mots?',
      'Qu\'est-ce que j\'aime dans la culture francophone?'
    ];
    
    // ETFO Three-Part Structure for French
    template.activities = {
      mindsOn: this.createMindsOnActivities(config.focus, config.storyBook),
      action: this.createActionActivities(config.focus, config.thematicUnit),
      consolidation: this.createConsolidationActivities(config.focus)
    };
    
    // French-specific assessments
    template.assessments = [
      ...template.assessments,
      {
        id: 'french-oral-assessment',
        type: 'formative',
        method: 'Évaluation orale',
        description: 'Écoute de la participation orale en français',
        phase: 'action',
        successCriteria: [
          'L\'élève s\'exprime en français',
          'L\'élève utilise le nouveau vocabulaire',
          'L\'élève écoute et répond en français'
        ]
      },
      {
        id: 'french-comprehension',
        type: 'formative',
        method: 'Compréhension',
        description: 'Vérification de la compréhension orale/écrite',
        phase: 'consolidation',
        successCriteria: [
          'L\'élève démontre sa compréhension',
          'L\'élève fait des connections',
          'L\'élève pose des questions en français'
        ]
      }
    ];
    
    // French-specific materials
    template.materials = {
      essential: [
        'Livre d\'histoire (français)',
        'Cartes de vocabulaire illustrées',
        'Tableau/papier graphique',
        'Crayons de couleur'
      ],
      optional: [
        'Marionnettes pour dramatisation',
        'Musique francophone',
        'Images thématiques',
        'Jeux de vocabulaire'
      ],
      technology: [
        'Enregistreur audio pour pronunciation',
        'Vidéos éducatives en français',
        'Applications de lecture francophone'
      ],
      books: [
        config.storyBook || 'Livre thématique approprié',
        'Collection de livres nivelés français',
        'Albums illustrés francophones'
      ],
      manipulatives: [
        'Lettres magnétiques',
        'Cubes pour construire des mots',
        'Cartes-images pour vocabulaire'
      ]
    };
    
    // Enhanced safety for French immersion
    template.safety.considerations.push(
      'Environnement francophone sécurisant',
      'Encouragement constant pour la prise de risques linguistiques',
      'Respect du rythme d\'acquisition de chaque élève'
    );
    
    // Cross-curricular connections
    template.crossCurricular = [
      { subject: 'Arts visuels', connection: 'Illustration des histoires et vocabulaire' },
      { subject: 'Mathématiques', connection: 'Nombres et concepts mathématiques en français' },
      { subject: 'Sciences de la nature', connection: 'Vocabulaire scientifique en français' }
    ];
    
    // Home connection in both languages
    template.homeConnection = 'Encourager la pratique du français à la maison - chansons, histoires, conversations simples. Valoriser le bilinguisme de l\'enfant.';
    
    // French-specific teacher notes
    template.teacherNotes = [
      ...template.teacherNotes || [],
      'Modeler constamment un français correct',
      'Célébrer les tentatives de communication en français',
      'Utiliser des gestes et des images pour soutenir la compréhension',
      'Créer un environnement riche en français authentique'
    ];
    
    return template;
  }
  
  /**
   * Generates learning goals specific to French development
   */
  private static generateFrenchLearningGoals(focus: 'oral' | 'reading' | 'writing' | 'integrated'): LearningGoal[] {
    const baseGoals: Record<string, LearningGoal[]> = {
      oral: [
        {
          id: 'oral-expression',
          statement: 'Je peux m\'exprimer clairement en français.',
          successCriteria: [
            'Je parle en français pendant les activités',
            'J\'utilise le nouveau vocabulaire en parlant',
            'Je pose des questions en français'
          ]
        },
        {
          id: 'oral-listening',
          statement: 'Je peux écouter et comprendre en français.',
          successCriteria: [
            'J\'écoute attentivement les histoires',
            'Je suis les instructions données en français',
            'Je réponds aux questions en français'
          ]
        }
      ],
      reading: [
        {
          id: 'reading-comprehension',
          statement: 'Je peux comprendre ce que je lis en français.',
          successCriteria: [
            'Je reconnais les mots familiers',
            'Je peux raconter l\'histoire avec mes mots',
            'Je fais des connections avec mes expériences'
          ]
        },
        {
          id: 'reading-phonics',
          statement: 'Je connais les sons des lettres en français.',
          successCriteria: [
            'Je reconnais les sons des lettres',
            'Je peux assembler des sons pour faire des mots',
            'Je remarque les régularités dans les mots'
          ]
        }
      ],
      writing: [
        {
          id: 'writing-expression',
          statement: 'Je peux écrire mes idées en français.',
          successCriteria: [
            'J\'écris des mots que je connais',
            'Je dessine pour accompagner mes mots',
            'Je partage mes écrits avec d\'autres'
          ]
        }
      ],
      integrated: [
        {
          id: 'integrated-communication',
          statement: 'Je peux communiquer en français de différentes façons.',
          successCriteria: [
            'Je parle, j\'écoute, je lis et j\'écris en français',
            'J\'utilise le français pour apprendre d\'autres sujets',
            'Je suis fier de parler français'
          ]
        }
      ]
    };
    
    return baseGoals[focus] || baseGoals.integrated;
  }
  
  /**
   * Creates Minds On activities for French lessons
   */
  private static createMindsOnActivities(focus: string, storyBook?: string): Activity[] {
    return [
      {
        id: 'minds-on-french',
        phase: 'minds-on',
        title: 'Réveil français',
        description: 'Activation du français et connexion avec le sujet',
        duration: 12,
        instructions: [
          'Chanter une chanson française familière',
          'Réviser le vocabulaire de la leçon précédente',
          'Présenter le nouveau vocabulaire avec gestes et images',
          'Faire des prédictions sur l\'histoire/sujet du jour'
        ],
        materials: [
          'Cartes de vocabulaire',
          'Images thématiques',
          storyBook || 'Livre du jour'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Utiliser beaucoup de gestes et d\'images',
            'Répéter les mots plusieurs fois',
            'Permettre les réponses par gestes'
          ],
          core: [
            'Encourager la participation orale',
            'Poser des questions simples',
            'Connecter avec les expériences personnelles'
          ],
          extension: [
            'Encourager l\'utilisation de phrases complètes',
            'Demander des explications plus détaillées',
            'Introduire du vocabulaire supplémentaire'
          ]
        },
        safetyConsiderations: [
          'Créer un environnement sécurisant pour prendre des risques linguistiques'
        ]
      }
    ];
  }
  
  /**
   * Creates Action activities for French lessons
   */
  private static createActionActivities(focus: string, thematicUnit?: string): Activity[] {
    return [
      {
        id: 'action-french-main',
        phase: 'action',
        title: 'Exploration française',
        description: 'Apprentissage actif en français selon le focus de la leçon',
        duration: 28,
        instructions: [
          'Lecture/écoute de l\'histoire principale',
          'Discussion interactive en français',
          'Activité pratique avec le nouveau vocabulaire',
          'Création ou manipulation selon le thème'
        ],
        materials: [
          'Livre principal',
          'Matériel de manipulation',
          'Papier et crayons',
          'Cartes d\'activité'
        ],
        grouping: 'small-groups',
        differentiation: {
          support: [
            'Partenaire francophone fort',
            'Instructions visuelles et verbales',
            'Tâches simplifiées mais authentiques'
          ],
          core: [
            'Participation active dans les discussions',
            'Utilisation du nouveau vocabulaire',
            'Travail collaboratif en français'
          ],
          extension: [
            'Rôle de leader dans le groupe',
            'Création de nouvelles questions',
            'Aide aux autres élèves'
          ]
        },
        safetyConsiderations: [
          'Supervision des groupes de travail',
          'Matériaux sécuritaires pour l\'âge'
        ]
      }
    ];
  }
  
  /**
   * Creates Consolidation activities for French lessons
   */
  private static createConsolidationActivities(focus: string): Activity[] {
    return [
      {
        id: 'consolidation-french',
        phase: 'consolidation',
        title: 'Récapitulatif français',
        description: 'Consolidation des apprentissages en français',
        duration: 5,
        instructions: [
          'Révision du nouveau vocabulaire ensemble',
          'Partage d\'une chose apprise en français',
          'Chanson ou comptine de clôture',
          'Préparation pour la prochaine leçon'
        ],
        materials: [
          'Tableau de vocabulaire',
          'Chanson de clôture'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Participation par gestes ou mots simples',
            'Aide de l\'enseignant pour s\'exprimer'
          ],
          core: [
            'Participation orale active',
            'Utilisation du vocabulaire appris'
          ],
          extension: [
            'Aide à l\'animation de la récapitulation',
            'Utilisation de phrases complexes'
          ]
        }
      }
    ];
  }
  
  /**
   * Gets Indigenous perspectives for French language learning
   */
  private static getFrenchIndigenousPerspectives(): string {
    return 'Reconnaissance que le territoire Mi\'kmaq accueille maintenant d\'autres langues, incluant le français. Célébration de la richesse linguistique qui inclut le mi\'kmaq, le français et l\'anglais. Apprentissage de mots de base en mi\'kmaq pour honorer la langue première de ce territoire.';
  }
}