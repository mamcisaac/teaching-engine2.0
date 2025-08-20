/**
 * 🔢 MATHÉMATIQUES LESSON TEMPLATE
 * Grade 1 French Immersion - 195 lessons per year
 * 
 * Specialized for Grade 1 mathematics development:
 * - Number sense (0-20)
 * - Patterns and relationships
 * - Geometry and spatial sense
 * - Measurement
 * - Data management
 */

import { LessonPlanTemplate, Activity, LearningGoal, Assessment, Vocabulary } from '../types/LessonPlanTemplate';
import { MasterLessonTemplate } from '../core/MasterTemplate';

export class MathematicsTemplate {
  
  /**
   * Creates a perfect Mathematics lesson template for Grade 1 French Immersion
   */
  static createMathLesson(config: {
    unitPlanId: string;
    title: string;
    titleEn?: string;
    strand: 'number-sense' | 'patterns' | 'geometry' | 'measurement' | 'data';
    specificTopic: string;
    vocabulary: Vocabulary[];
    manipulatives: string[];
    numberRange?: string;
  }): LessonPlanTemplate {
    
    // Start with master template
    const template = MasterLessonTemplate.createTemplate({
      subject: 'Mathématiques',
      unitPlanId: config.unitPlanId,
      title: config.title,
      titleEn: config.titleEn,
      learningGoals: this.generateMathLearningGoals(config.strand, config.specificTopic),
      vocabulary: config.vocabulary,
      indigenousPerspectives: this.getMathIndigenousPerspectives()
    });
    
    // Math-specific big ideas
    template.bigIdeas = [
      'Les nombres nous aident à comprendre et décrire notre monde',
      'Les régularités sont partout autour de nous',
      'Les mathématiques nous aident à résoudre des problèmes quotidiens',
      'Nous pouvons utiliser différentes stratégies pour arriver à la même réponse'
    ];
    
    template.essentialQuestions = [
      'Comment les nombres m\'aident-ils chaque jour?',
      'Où vois-je des régularités dans ma vie?',
      'Comment puis-je résoudre ce problème?',
      'Quelle stratégie fonctionne le mieux pour moi?'
    ];
    
    // ETFO Three-Part Structure for Mathematics
    template.activities = {
      mindsOn: this.createMathMindsOnActivities(config.strand, config.numberRange),
      action: this.createMathActionActivities(config.strand, config.specificTopic, config.manipulatives),
      consolidation: this.createMathConsolidationActivities(config.strand)
    };
    
    // Math-specific assessments
    template.assessments = [
      ...template.assessments,
      {
        id: 'math-problem-solving',
        type: 'formative',
        method: 'Résolution de problèmes',
        description: 'Observation des stratégies de résolution',
        phase: 'action',
        successCriteria: [
          'L\'élève essaie différentes stratégies',
          'L\'élève explique sa pensée en français',
          'L\'élève persévère face aux défis'
        ]
      },
      {
        id: 'math-communication',
        type: 'formative',
        method: 'Communication mathématique',
        description: 'Capacité à expliquer le raisonnement mathématique',
        phase: 'consolidation',
        successCriteria: [
          'L\'élève utilise le vocabulaire mathématique',
          'L\'élève explique comment il a résolu le problème',
          'L\'élève pose des questions mathématiques'
        ]
      }
    ];
    
    // Math-specific materials
    template.materials = {
      essential: [
        'Cubes unifix ou autres manipulatifs',
        'Papier et crayons',
        'Tableau ou papier graphique',
        'Cartes de nombres/images'
      ],
      optional: [
        'Jeux mathématiques',
        'Dés et dominos',
        'Formes géométriques',
        'Matériel de mesure'
      ],
      technology: [
        'Applications mathématiques appropriées',
        'Calculatrices (si approprié)',
        'Tableau interactif'
      ],
      books: [
        'Livres de mathématiques en français',
        'Histoires avec concepts mathématiques',
        'Albums de comptage'
      ],
      manipulatives: [
        ...config.manipulatives,
        'Cubes de base 10',
        'Jetons de comptage',
        'Réglettes cuisenaire',
        'Formes géométriques'
      ]
    };
    
    // Enhanced safety for math manipulatives
    template.safety.considerations.push(
      'Surveillance de l\'utilisation des petits objets',
      'Espaces de travail organisés pour éviter les chutes',
      'Rangement sécuritaire des manipulatifs'
    );
    
    template.safety.procedures.push(
      'Compter les manipulatifs avant et après l\'activité',
      'Établir des règles pour l\'utilisation des matériaux',
      'Nettoyer l\'espace de travail après l\'activité'
    );
    
    // Cross-curricular connections
    template.crossCurricular = [
      { subject: 'Français (Immersion)', connection: 'Vocabulaire mathématique et résolution de problèmes en français' },
      { subject: 'Sciences de la nature', connection: 'Mesures et données dans les expériences scientifiques' },
      { subject: 'Arts visuels', connection: 'Formes géométriques et régularités dans l\'art' }
    ];
    
    // Home connection for math
    template.homeConnection = 'Encourager l\'exploration des mathématiques à la maison : compter les objets, chercher des régularités, mesurer des objets familiers. Partager les stratégies apprises en classe.';
    
    // Math-specific practical planning
    template.prepRequirements = {
      prepTimeMinutes: 20,
      setupNeeded: [
        'Organiser les manipulatifs par table',
        'Préparer les stations de rotation si applicable',
        'Tester le matériel de projection pour modélisation'
      ]
    };
    
    template.timingFlexibility = {
      criticalElements: [
        'Modélisation du concept principal',
        'Pratique avec manipulatifs',
        'Au moins un problème résolu ensemble'
      ],
      optionalEnhancements: [
        'Jeux mathématiques supplémentaires',
        'Défis pour les élèves avancés',
        'Création de leurs propres problèmes'
      ],
      earlyFinisherActivities: [
        'Cartes de défis mathématiques au centre',
        'Jeux de nombres sur tablette',
        'Dessiner des représentations du concept'
      ]
    };
    
    // Curriculum alignment for math
    template.curriculumCodes = [
      `MAT1.${config.strand === 'number-sense' ? 'NS' : 
              config.strand === 'patterns' ? 'PA' : 
              config.strand === 'geometry' ? 'GE' : 
              config.strand === 'measurement' ? 'ME' : 'DM'}.1`
    ];
    
    template.contingencyPlans = {
      ifShortOnTime: 'Focus sur manipulation concrète, reporter pratique écrite',
      ifInterrupted: 'Garder les manipulatifs organisés pour reprendre rapidement',
      ifMaterialsMissing: 'Utiliser les doigts pour compter, dessiner au tableau'
    };
    
    // Math-specific teacher notes
    template.teacherNotes = [
      ...template.teacherNotes || [],
      'Encourager différentes stratégies de résolution',
      'Valoriser le processus autant que la réponse',
      'Utiliser des exemples concrets et visuels',
      'Permettre suffisamment de temps pour l\'exploration',
      'Documenter les stratégies des élèves pour l\'évaluation'
    ];
    
    return template;
  }
  
  /**
   * Generates learning goals specific to mathematics strands
   */
  private static generateMathLearningGoals(strand: string, specificTopic: string): LearningGoal[] {
    const strandGoals: Record<string, LearningGoal[]> = {
      'number-sense': [
        {
          id: 'number-recognition',
          statement: 'Je peux reconnaître et utiliser les nombres.',
          successCriteria: [
            'Je reconnais les nombres à vue',
            'Je peux compter en ordre',
            'Je comprends que les nombres représentent des quantités'
          ]
        },
        {
          id: 'number-operations',
          statement: 'Je peux additionner et soustraire avec des objets.',
          successCriteria: [
            'J\'utilise des objets pour additionner',
            'J\'utilise des objets pour soustraire',
            'Je peux expliquer ma stratégie'
          ]
        }
      ],
      'patterns': [
        {
          id: 'pattern-recognition',
          statement: 'Je peux reconnaître et créer des régularités.',
          successCriteria: [
            'Je reconnais des régularités simples',
            'Je peux continuer une régularité',
            'Je peux créer mes propres régularités'
          ]
        }
      ],
      'geometry': [
        {
          id: 'shape-recognition',
          statement: 'Je connais les formes géométriques de base.',
          successCriteria: [
            'Je reconnais les cercles, carrés, triangles, rectangles',
            'Je peux décrire les propriétés des formes',
            'Je trouve des formes dans mon environnement'
          ]
        }
      ],
      'measurement': [
        {
          id: 'measurement-comparison',
          statement: 'Je peux comparer et mesurer des objets.',
          successCriteria: [
            'Je compare la taille des objets',
            'J\'utilise des unités non standard pour mesurer',
            'Je comprends les concepts comme plus long/plus court'
          ]
        }
      ],
      'data': [
        {
          id: 'data-collection',
          statement: 'Je peux collecter et organiser des informations.',
          successCriteria: [
            'Je peux trier des objets par caractéristiques',
            'Je peux créer des graphiques simples',
            'Je peux répondre à des questions sur les données'
          ]
        }
      ]
    };
    
    return strandGoals[strand] || strandGoals['number-sense'];
  }
  
  /**
   * Creates Minds On activities for Mathematics
   */
  private static createMathMindsOnActivities(strand: string, numberRange?: string): Activity[] {
    return [
      {
        id: 'math-minds-on',
        phase: 'minds-on',
        title: 'Échauffement mathématique',
        description: 'Activation des connaissances mathématiques antérieures',
        duration: 10,
        instructions: [
          'Comptine ou chanson mathématique',
          'Jeu rapide de nombres ou formes',
          'Discussion sur les mathématiques dans la vie quotidienne',
          'Introduction du problème ou concept du jour'
        ],
        materials: [
          'Cartes de nombres',
          'Objets à compter',
          'Tableau ou papier graphique'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Utiliser des quantités plus petites',
            'Donner plus de temps pour réfléchir',
            'Utiliser des supports visuels'
          ],
          core: [
            'Participation active dans les discussions',
            'Utilisation du vocabulaire mathématique',
            'Partage des stratégies'
          ],
          extension: [
            'Poser des questions plus complexes',
            'Aider les autres élèves',
            'Explorer des extensions du concept'
          ]
        },
        safetyConsiderations: [
          'Surveillance lors de l\'utilisation d\'objets à compter'
        ],
        isCritical: true // Must complete to establish foundation
      }
    ];
  }
  
  /**
   * Creates Action activities for Mathematics
   */
  private static createMathActionActivities(strand: string, specificTopic: string, manipulatives: string[]): Activity[] {
    return [
      {
        id: 'math-exploration',
        phase: 'action',
        title: 'Exploration mathématique',
        description: `Apprentissage actif du concept: ${specificTopic}`,
        duration: 30,
        instructions: [
          'Présentation du problème ou concept principal',
          'Exploration avec manipulatifs en groupes',
          'Partage des découvertes et stratégies',
          'Pratique guidée du nouveau concept'
        ],
        materials: [
          ...manipulatives,
          'Feuilles de travail (si approprié)',
          'Matériel d\'enregistrement'
        ],
        grouping: 'small-groups',
        differentiation: {
          support: [
            'Problèmes simplifiés',
            'Support d\'un partenaire',
            'Plus de manipulatifs concrets',
            'Instructions étape par étape'
          ],
          core: [
            'Exploration active du concept',
            'Utilisation de différentes stratégies',
            'Collaboration effective'
          ],
          extension: [
            'Problèmes plus complexes',
            'Recherche de multiples solutions',
            'Création de leurs propres problèmes'
          ]
        },
        safetyConsiderations: [
          'Utilisation appropriée des manipulatifs',
          'Partage équitable des matériaux',
          'Rangement sécuritaire après utilisation'
        ]
      }
    ];
  }
  
  /**
   * Creates Consolidation activities for Mathematics
   */
  private static createMathConsolidationActivities(strand: string): Activity[] {
    return [
      {
        id: 'math-consolidation',
        phase: 'consolidation',
        title: 'Réflexion mathématique',
        description: 'Consolidation et réflexion sur les apprentissages',
        duration: 5,
        instructions: [
          'Partage des stratégies utilisées',
          'Discussion sur ce qui a été appris',
          'Connection avec les mathématiques quotidiennes',
          'Préparation pour la prochaine leçon'
        ],
        materials: [
          'Tableau pour noter les stratégies',
          'Exemples du travail des élèves'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Encouragement à partager une observation',
            'Support pour verbaliser la pensée',
            'Utilisation de gestes et d\'objets'
          ],
          core: [
            'Explication des stratégies utilisées',
            'Réflexion sur l\'apprentissage',
            'Questions sur le concept'
          ],
          extension: [
            'Animation de la discussion',
            'Connections entre différents concepts',
            'Questions pour approfondir'
          ]
        }
      }
    ];
  }
  
  /**
   * Gets Indigenous perspectives for Mathematics
   */
  private static getMathIndigenousPerspectives(): string {
    return 'Reconnaissance des systèmes de numération et des concepts mathématiques traditionnels Mi\'kmaq, incluant l\'utilisation des saisons, des cycles naturels et des modèles traditionnels pour comprendre les régularités et les mesures. Apprentissage de la façon dont les peuples autochtones utilisaient les mathématiques dans leur vie quotidienne.';
  }
}