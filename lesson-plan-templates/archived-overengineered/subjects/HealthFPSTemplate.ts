/**
 * 💝 FORMATION PERSONNELLE ET SOCIALE LESSON TEMPLATE
 * Grade 1 French Immersion - 98 lessons per year (ALTERNATING with Social Studies)
 * 
 * Specialized for Grade 1 personal and social development:
 * - Personal safety and body awareness
 * - Emotional regulation and expression
 * - Healthy relationships and social skills
 * - Nutrition and healthy lifestyle habits
 * - Growth, development and self-care
 * - Trauma-informed and culturally responsive approaches
 */

import { LessonPlanTemplate, Activity, LearningGoal, Assessment, Vocabulary } from '../types/LessonPlanTemplate';
import { MasterLessonTemplate } from '../core/MasterTemplate';

export class HealthFPSTemplate {
  
  /**
   * Creates a perfect Health/FPS lesson template for Grade 1 French Immersion
   */
  static createHealthFPSLesson(config: {
    unitPlanId: string;
    title: string;
    titleEn?: string;
    healthFocus: 'safety' | 'emotions' | 'relationships' | 'nutrition' | 'growth' | 'self-care';
    specificTopic: string;
    vocabulary: Vocabulary[];
    sensitivityLevel: 'low' | 'medium' | 'high';
    traumaInformed?: boolean;
  }): LessonPlanTemplate {
    
    // Start with master template
    const template = MasterLessonTemplate.createTemplate({
      subject: 'Formation personnelle et sociale',
      unitPlanId: config.unitPlanId,
      title: config.title,
      titleEn: config.titleEn,
      learningGoals: this.generateHealthFPSLearningGoals(config.healthFocus, config.specificTopic),
      vocabulary: config.vocabulary,
      indigenousPerspectives: this.getHealthFPSIndigenousPerspectives(config.healthFocus)
    });
    
    // Health/FPS-specific big ideas for Grade 1
    template.bigIdeas = [
      'Prendre soin de moi-même et des autres est important pour être heureux',
      'Mes émotions sont normales et je peux apprendre à les comprendre',
      'Je peux faire des choix sains et sécuritaires pour mon corps',
      'Les relations saines m\'aident à grandir et à apprendre',
      'Mon corps grandit et change, et c\'est normal et beau'
    ];
    
    template.essentialQuestions = [
      'Comment puis-je prendre soin de moi-même?',
      'Que puis-je faire quand j\'ai des sentiments difficiles?',
      'Comment puis-je rester en sécurité?',
      'Comment puis-je être un bon ami?',
      'Qu\'est-ce qui aide mon corps à grandir en santé?'
    ];
    
    // ETFO Three-Part Structure for Health/FPS
    template.activities = {
      mindsOn: this.createHealthFPSMindsOnActivities(config.healthFocus, config.sensitivityLevel),
      action: this.createHealthFPSActionActivities(config.healthFocus, config.specificTopic, config.traumaInformed),
      consolidation: this.createHealthFPSConsolidationActivities(config.healthFocus, config.sensitivityLevel)
    };
    
    // Health/FPS-specific assessments
    template.assessments = [
      ...template.assessments,
      {
        id: 'health-fps-personal-reflection',
        type: 'formative',
        method: 'Réflexion personnelle',
        description: 'Auto-évaluation des apprentissages personnels et sociaux',
        phase: 'action',
        successCriteria: [
          'L\'élève réfléchit à ses propres expériences appropriées',
          'L\'élève identifie des stratégies qui l\'aident',
          'L\'élève respecte sa vie privée et celle des autres',
          'L\'élève montre une croissance dans ses choix'
        ]
      },
      {
        id: 'health-fps-social-skills',
        type: 'formative',
        method: 'Observation des habiletés sociales',
        description: 'Observation des interactions sociales et des choix sains',
        phase: 'consolidation',
        successCriteria: [
          'L\'élève montre du respect dans ses interactions',
          'L\'élève utilise des stratégies de résolution de conflits',
          'L\'élève fait des choix sécuritaires',
          'L\'élève demande de l\'aide quand approprié'
        ]
      }
    ];
    
    // Health/FPS-specific materials
    template.materials = {
      essential: [
        'Livres sur les émotions et relations en français',
        'Miroir pour activités d\'estime de soi',
        'Cartes d\'émotions illustrées',
        'Journal personnel simple (optionnel)'
      ],
      optional: [
        'Marionnettes pour jeux de rôle émotionnels',
        'Musique relaxante pour gestion du stress',
        'Matériel pour activités sensorielles',
        'Photos de familles diverses'
      ],
      technology: [
        'Applications de méditation pour enfants',
        'Vidéos sur la sécurité appropriées à l\'âge',
        'Minuteur pour activités de relaxation'
      ],
      books: [
        'Livres sur les émotions en français',
        'Histoires sur l\'amitié et le respect',
        'Livres sur la sécurité personnelle',
        'Guides sur la nutrition pour enfants'
      ],
      manipulatives: [
        'Figurines pour jeux de rôle sociaux',
        'Matériel pour activités de relaxation',
        'Cartes de stratégies d\'adaptation',
        'Objets réconfortants pour gestion émotionnelle'
      ]
    };
    
    // Enhanced safety for Health/FPS (emotional and physical safety paramount)
    template.safety = {
      level: 'high',
      considerations: [
        'Sécurité émotionnelle prioritaire dans toutes les activités',
        'Respect absolu pour la vie privée et les limites personnelles',
        'Approche trauma-informée pour tous les sujets sensibles',
        'Confidentialité stricte pour les partages personnels',
        'Sensibilité aux diverses structures familiales et expériences',
        'Procédures claires pour signaler les préoccupations de sécurité',
        'Alternatives pour les élèves qui ne veulent pas participer à certaines activités'
      ],
      procedures: [
        'Établir des règles claires de respect et de confidentialité',
        'Créer des signaux pour demander de l\'aide discrètement',
        'Offrir des alternatives de participation (dessiner, écrire, observer)',
        'Surveiller les réactions émotionnelles et offrir du soutien',
        'Avoir des stratégies de désamorçage pour situations difficiles',
        'Connaître les procédures de signalement obligatoire',
        'Créer un environnement où il est sécuritaire de dire \"non\"'
      ]
    };
    
    // Cross-curricular connections
    template.crossCurricular = [
      { subject: 'Français (Immersion)', connection: 'Vocabulaire émotionnel et expression des sentiments' },
      { subject: 'Sciences de la nature', connection: 'Corps humain, nutrition et croissance' },
      { subject: 'Arts visuels', connection: 'Expression créative des émotions et identité' },
      { subject: 'Sciences humaines', connection: 'Relations familiales et communautaires' },
      { subject: 'Mathématiques', connection: 'Données sur la santé et habitudes personnelles' }
    ];
    
    // Home connection for health/FPS (sensitive approach)
    template.homeConnection = 'Partage approprié avec les familles sur les stratégies d\'autorégulation et les habitudes saines apprises. Respect des valeurs familiales concernant les sujets personnels et sociaux.';
    
    // Health/FPS-specific teacher notes
    template.teacherNotes = [
      ...template.teacherNotes || [],
      'Maintenir une approche sensible et trauma-informée en tout temps',
      'Observer attentivement les réactions émotionnelles des élèves',
      'Créer un environnement sécuritaire pour l\'expression émotionnelle',
      'Respecter les limites personnelles et familiales',
      'Avoir des stratégies pour soutenir les élèves en détresse',
      'Connaître les procédures de signalement de l\'école',
      'Célébrer la croissance personnelle et sociale de chaque élève'
    ];
    
    return template;
  }
  
  /**
   * Generates learning goals specific to health/FPS focus
   */
  private static generateHealthFPSLearningGoals(healthFocus: string, specificTopic: string): LearningGoal[] {
    const baseGoals: Record<string, LearningGoal[]> = {
      safety: [
        {
          id: 'health-fps-personal-safety',
          statement: 'Je peux reconnaître ce qui est sécuritaire pour mon corps.',
          successCriteria: [
            'Je connais les parties privées de mon corps',
            'Je sais qui a le droit de me toucher et comment',
            'Je peux dire \"non\" quand je ne suis pas à l\'aise',
            'Je sais à qui parler si je ne me sens pas en sécurité'
          ]
        },
        {
          id: 'health-fps-environmental-safety',
          statement: 'Je peux faire des choix sécuritaires dans mon environnement.',
          successCriteria: [
            'Je suis les règles de sécurité à l\'école et à la maison',
            'Je reconnais les situations dangereuses',
            'Je demande de l\'aide d\'un adulte de confiance',
            'Je prends soin de moi dans différents endroits'
          ]
        }
      ],
      emotions: [
        {
          id: 'health-fps-emotion-recognition',
          statement: 'Je peux reconnaître et nommer mes émotions.',
          successCriteria: [
            'Je peux dire comment je me sens',
            'Je reconnais les émotions sur les visages',
            'Je comprends que toutes les émotions sont normales',
            'Je peux dessiner ou montrer mes sentiments'
          ]
        },
        {
          id: 'health-fps-emotion-management',
          statement: 'Je peux utiliser des stratégies pour gérer mes émotions.',
          successCriteria: [
            'Je peux me calmer quand je suis fâché ou triste',
            'J\'utilise des mots pour exprimer mes sentiments',
            'Je demande de l\'aide quand mes émotions sont trop fortes',
            'Je respecte les émotions des autres'
          ]
        }
      ],
      relationships: [
        {
          id: 'health-fps-healthy-relationships',
          statement: 'Je peux avoir des amitiés saines et positives.',
          successCriteria: [
            'Je traite mes amis avec gentillesse et respect',
            'Je peux résoudre des conflits en parlant calmement',
            'Je partage et je coopère bien avec les autres',
            'Je choisis des amis qui me traitent bien'
          ]
        }
      ],
      nutrition: [
        {
          id: 'health-fps-healthy-eating',
          statement: 'Je peux faire des choix alimentaires sains.',
          successCriteria: [
            'Je connais les aliments qui aident mon corps à grandir',
            'Je mange une variété d\'aliments colorés',
            'Je bois beaucoup d\'eau chaque jour',
            'J\'écoute quand mon corps a faim ou est rassasié'
          ]
        }
      ],
      growth: [
        {
          id: 'health-fps-body-awareness',
          statement: 'Je comprends comment mon corps grandit et change.',
          successCriteria: [
            'Je sais que grandir et changer est normal',
            'Je peux nommer les parties de mon corps',
            'Je prends soin de mon corps avec fierté',
            'Je respecte les différences entre les corps'
          ]
        }
      ],
      'self-care': [
        {
          id: 'health-fps-self-care-habits',
          statement: 'Je peux prendre soin de moi-même chaque jour.',
          successCriteria: [
            'Je me lave les mains et les dents régulièrement',
            'Je me repose suffisamment et dors bien',
            'Je bouge mon corps et je joue activement',
            'Je demande de l\'aide pour mes besoins'
          ]
        }
      ]
    };
    
    return baseGoals[healthFocus] || baseGoals.emotions;
  }
  
  /**
   * Creates Minds On activities for Health/FPS
   */
  private static createHealthFPSMindsOnActivities(healthFocus: string, sensitivityLevel: string): Activity[] {
    return [
      {
        id: 'health-fps-minds-on',
        phase: 'minds-on',
        title: 'Moment de bien-être',
        description: 'Activation respectueuse et sécuritaire des connaissances personnelles',
        duration: 10,
        instructions: [
          'Activité de centrage ou relaxation simple (respiration, étirement)',
          'Présentation du sujet de façon sensible et appropriée',
          'Établissement des règles de respect et confidentialité',
          'Activation des connaissances par questions ouvertes non intrusives',
          'Introduction du vocabulaire émotionnel ou de santé du jour'
        ],
        materials: [
          'Cartes d\'émotions ou de santé appropriées',
          'Musique douce pour relaxation',
          'Objets réconfortants si nécessaire'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Permettre la participation silencieuse ou par observation',
            'Offrir des alternatives à la participation verbale',
            'Respecter les élèves qui préfèrent ne pas partager'
          ],
          core: [
            'Encourager le partage approprié et confortable',
            'Poser des questions générales et non personnelles',
            'Connecter avec les expériences universelles'
          ],
          extension: [
            'Encourager l\'aide aux autres dans leur confort',
            'Poser des questions plus approfondies appropriées',
            'Modeler l\'empathie et la compréhension'
          ]
        },
        safetyConsiderations: [
          'Maintenir un environnement émotionnellement sécuritaire',
          'Éviter les questions trop personnelles ou intrusives',
          'Respecter le droit de ne pas participer'
        ]
      }
    ];
  }
  
  /**
   * Creates Action activities for Health/FPS
   */
  private static createHealthFPSActionActivities(healthFocus: string, specificTopic: string, traumaInformed?: boolean): Activity[] {
    return [
      {
        id: 'health-fps-action-learning',
        phase: 'action',
        title: 'Apprentissage personnel et social',
        description: `Exploration sécuritaire: ${specificTopic}`,
        duration: 30,
        instructions: [
          'Présentation du concept principal avec sensibilité',
          'Activités interactives respectueuses et appropriées',
          'Jeux de rôle ou discussions guidées sur les situations appropriées',
          'Pratique de stratégies personnelles ou sociales',
          'Réflexion individuelle avec support selon les besoins',
          traumaInformed ? 'Surveillance constante du bien-être émotionnel' : 'Support émotionnel disponible'
        ],
        materials: [
          'Matériel approprié pour les activités sécuritaires',
          'Livres ou histoires sur le sujet',
          'Cartes de stratégies ou outils de référence',
          'Espace calme pour ceux qui en ont besoin'
        ],
        grouping: 'flexible',
        differentiation: {
          support: [
            'Instructions très claires et rassurantes',
            'Support individuel constant disponible',
            'Alternatives pour participation inconfortable',
            'Temps supplémentaire pour traiter l\'information'
          ],
          core: [
            'Participation active dans les activités appropriées',
            'Utilisation du vocabulaire personnel et social',
            'Pratique des stratégies enseignées',
            'Respect des autres dans toutes les interactions'
          ],
          extension: [
            'Aide aux autres de façon appropriée',
            'Questions d\'approfondissement sur les stratégies',
            'Modélisation de comportements positifs',
            'Connexions avec d\'autres apprentissages'
          ]
        },
        safetyConsiderations: [
          'Surveillance constante du bien-être émotionnel',
          'Intervention immédiate si détresse observée',
          'Respect absolu des limites personnelles',
          'Confidentialité stricte pour tous les partages'
        ]
      }
    ];
  }
  
  /**
   * Creates Consolidation activities for Health/FPS
   */
  private static createHealthFPSConsolidationActivities(healthFocus: string, sensitivityLevel: string): Activity[] {
    return [
      {
        id: 'health-fps-consolidation',
        phase: 'consolidation',
        title: 'Réflexion personnelle',
        description: 'Consolidation respectueuse des apprentissages personnels et sociaux',
        duration: 5,
        instructions: [
          'Moment de réflexion calme et sécuritaire',
          'Partage optionnel de stratégies apprises (non personnel)',
          'Rappel des personnes ressources disponibles',
          'Affirmation positive de la croissance de chacun',
          'Transition douce vers l\'activité suivante'
        ],
        materials: [
          'Cartes de stratégies comme rappel',
          'Liste des personnes ressources de l\'école'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Support émotionnel individuel si nécessaire',
            'Participation par écoute respectueuse',
            'Affirmations personnalisées appropriées'
          ],
          core: [
            'Partage d\'une stratégie ou apprentissage général',
            'Écoute respectueuse des autres',
            'Engagement dans la réflexion positive'
          ],
          extension: [
            'Aide à créer un environnement sécuritaire pour tous',
            'Partage de réflexions plus approfondies appropriées',
            'Modélisation de l\'empathie et du respect'
          ]
        }
      }
    ];
  }
  
  /**
   * Gets Indigenous perspectives for Health/FPS
   */
  private static getHealthFPSIndigenousPerspectives(healthFocus: string): string {
    const baseText = 'Reconnaissance des enseignements Mi\'kmaq sur l\'équilibre entre le corps, l\'esprit, l\'émotion et l\'âme, et l\'importance de la connexion avec la communauté et la nature pour le bien-être holistique.';
    
    const focusSpecific: Record<string, string> = {
      safety: 'Apprentissage des enseignements Mi\'kmaq sur la protection mutuelle dans la communauté et le respect des limites personnelles.',
      emotions: 'Exploration des façons traditionnelles Mi\'kmaq de comprendre et d\'honorer toutes les émotions comme partie naturelle de l\'expérience humaine.',
      relationships: 'Apprentissage des valeurs Mi\'kmaq concernant les relations respectueuses, l\'entraide et l\'importance de la famille élargie.',
      nutrition: 'Découverte des aliments traditionnels Mi\'kmaq et des enseignements sur la gratitude envers la terre nourricière.',
      growth: 'Compréhension des étapes de vie selon les enseignements Mi\'kmaq et des cérémonies qui honorent la croissance.',
      'self-care': 'Exploration des pratiques traditionnelles Mi\'kmaq de soin de soi incluant la connexion avec la nature et les rituels de purification.'
    };
    
    return `${baseText} ${focusSpecific[healthFocus] || ''}`;
  }
}