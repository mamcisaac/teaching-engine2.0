/**
 * 🔬 SCIENCES DE LA NATURE LESSON TEMPLATE
 * Grade 1 French Immersion - 195 lessons per year (DAILY)
 * 
 * Specialized for Grade 1 scientific inquiry development:
 * - Hands-on exploration and observation
 * - Safety-first protocols for young learners
 * - Scientific vocabulary in French
 * - Inquiry-based learning
 * - Connection to natural world
 */

import { LessonPlanTemplate, Activity, LearningGoal, Assessment, Vocabulary } from '../types/LessonPlanTemplate';
import { MasterLessonTemplate } from '../core/MasterTemplate';

export class ScienceTemplate {
  
  /**
   * Creates a perfect Science lesson template for Grade 1 French Immersion
   */
  static createScienceLesson(config: {
    unitPlanId: string;
    title: string;
    titleEn?: string;
    inquiryFocus: 'observation' | 'exploration' | 'experimentation' | 'investigation';
    scienceTopic: string;
    vocabulary: Vocabulary[];
    materials: string[];
    safetyLevel: 'low' | 'medium' | 'high';
    seasonalConnection?: string;
  }): LessonPlanTemplate {
    
    // Start with master template
    const template = MasterLessonTemplate.createTemplate({
      subject: 'Sciences de la nature',
      unitPlanId: config.unitPlanId,
      title: config.title,
      titleEn: config.titleEn,
      learningGoals: this.generateScienceLearningGoals(config.inquiryFocus, config.scienceTopic),
      vocabulary: config.vocabulary,
      indigenousPerspectives: this.getScienceIndigenousPerspectives(config.seasonalConnection)
    });
    
    // Science-specific big ideas for Grade 1
    template.bigIdeas = [
      'Nous faisons partie du monde naturel et nous pouvons l\'observer',
      'Poser des questions nous aide à comprendre notre environnement',
      'Nos sens nous permettent de découvrir le monde qui nous entoure',
      'Tous les êtres vivants ont des besoins de base',
      'Nos actions affectent l\'environnement autour de nous'
    ];
    
    template.essentialQuestions = [
      'Qu\'est-ce que je remarque dans la nature?',
      'Comment puis-je être un bon scientifique?',
      'Qu\'est-ce qui rend quelque chose vivant?',
      'Comment puis-je prendre soin de mon environnement?',
      'Que se passe-t-il quand...?'
    ];
    
    // ETFO Three-Part Structure for Science
    template.activities = {
      mindsOn: this.createScienceMindsOnActivities(config.inquiryFocus, config.seasonalConnection),
      action: this.createScienceActionActivities(config.inquiryFocus, config.scienceTopic, config.materials),
      consolidation: this.createScienceConsolidationActivities(config.inquiryFocus)
    };
    
    // Science-specific assessments
    template.assessments = [
      ...template.assessments,
      {
        id: 'science-observation',
        type: 'formative',
        method: 'Journal d\'observation',
        description: 'Documentation des observations scientifiques',
        phase: 'action',
        successCriteria: [
          'L\'élève utilise ses sens pour observer',
          'L\'élève décrit ce qu\'il voit en français',
          'L\'élève pose des questions sur ses observations'
        ]
      },
      {
        id: 'science-inquiry',
        type: 'formative',
        method: 'Processus d\'enquête',
        description: 'Évaluation des habiletés d\'enquête scientifique',
        phase: 'consolidation',
        successCriteria: [
          'L\'élève suit les étapes de sécurité',
          'L\'élève participe activement à l\'exploration',
          'L\'élève partage ses découvertes'
        ]
      }
    ];
    
    // Science-specific materials
    template.materials = {
      essential: [
        'Journal d\'observation scientifique',
        'Loupes ou lunettes d\'observation',
        'Matériaux d\'exploration sécuritaires',
        'Cartes de vocabulaire scientifique illustrées'
      ],
      optional: [
        'Tablettes pour photos d\'observations',
        'Balance simple pour mesurer',
        'Règles et instruments de mesure',
        'Échantillons naturels sécuritaires'
      ],
      technology: [
        'Microscope numérique simple',
        'Application d\'identification de la nature',
        'Enregistreur pour observations orales'
      ],
      books: [
        'Livres documentaires en français sur le sujet',
        'Guides d\'identification nature (français)',
        'Histoires scientifiques appropriées'
      ],
      manipulatives: [
        ...config.materials,
        'Objets naturels sécuritaires',
        'Échantillons de matériaux',
        'Modèles scientifiques simples',
        'Outils de mesure adaptés'
      ]
    };
    
    // Enhanced safety for Science (critical for Grade 1)
    template.safety = {
      level: config.safetyLevel,
      considerations: [
        'Supervision d\'adulte constante pendant toutes les activités',
        'Vérification de tous les matériaux avant utilisation',
        'Instructions de sécurité claires données en français',
        'Espace de travail organisé et sécuritaire',
        'Matériaux non toxiques et adaptés à l\'âge',
        'Procédures de lavage des mains après manipulation'
      ],
      procedures: [
        'Démonstration des procédures de sécurité avant l\'activité',
        'Rappel des règles de sécurité pendant l\'activité',
        'Vérification que tous les élèves suivent les consignes',
        'Nettoyage immédiat de tout déversement',
        'Rangement sécuritaire de tous les matériaux après usage',
        'Lavage des mains obligatoire après manipulation'
      ]
    };
    
    // Cross-curricular connections
    template.crossCurricular = [
      { subject: 'Français (Immersion)', connection: 'Vocabulaire scientifique et communication des observations' },
      { subject: 'Mathématiques', connection: 'Mesures, comptage et données dans les expériences' },
      { subject: 'Arts visuels', connection: 'Dessins d\'observation et documentation visuelle' },
      { subject: 'Formation personnelle et sociale', connection: 'Responsabilité environnementale et travail d\'équipe' }
    ];
    
    // Home connection for science
    template.homeConnection = 'Encourager l\'exploration de la nature à la maison : observer les changements saisonniers, collectionner des objets naturels sécuritaires, poser des questions sur l\'environnement familial.';
    
    // Science-specific teacher notes
    template.teacherNotes = [
      ...template.teacherNotes || [],
      'Préparer tous les matériaux et vérifier la sécurité avant la leçon',
      'Modeler l\'utilisation correcte des outils scientifiques',
      'Encourager les questions et la curiosité naturelle',
      'Documenter les observations des élèves pour l\'évaluation',
      'Adapter le niveau de langue au développement des élèves',
      'Célébrer les découvertes et les \"erreurs\" comme apprentissage'
    ];
    
    return template;
  }
  
  /**
   * Generates learning goals specific to science inquiry focus
   */
  private static generateScienceLearningGoals(inquiryFocus: string, scienceTopic: string): LearningGoal[] {
    const baseGoals: Record<string, LearningGoal[]> = {
      observation: [
        {
          id: 'science-observation-skills',
          statement: 'Je peux observer attentivement en utilisant mes sens.',
          successCriteria: [
            'J\'utilise mes yeux, mes oreilles et mon toucher pour observer',
            'Je décris ce que je vois en français',
            'Je remarque les détails importants',
            'J\'enregistre mes observations dans mon journal'
          ]
        },
        {
          id: 'science-questioning',
          statement: 'Je peux poser des questions sur ce que j\'observe.',
          successCriteria: [
            'Je pose des questions qui commencent par \"Pourquoi...?\"',
            'Je pose des questions qui commencent par \"Qu\'est-ce qui...?\"',
            'Je suis curieux du monde qui m\'entoure'
          ]
        }
      ],
      exploration: [
        {
          id: 'science-exploration',
          statement: 'Je peux explorer des matériaux en sécurité.',
          successCriteria: [
            'Je suis les règles de sécurité',
            'J\'explore avec mes mains et mes outils',
            'Je découvre les propriétés des objets',
            'Je partage mes découvertes avec les autres'
          ]
        }
      ],
      experimentation: [
        {
          id: 'science-simple-experiments',
          statement: 'Je peux participer à des expériences simples.',
          successCriteria: [
            'Je suis les étapes de l\'expérience',
            'J\'observe ce qui se passe',
            'Je compare avant et après',
            'J\'explique ce que j\'ai appris'
          ]
        }
      ],
      investigation: [
        {
          id: 'science-investigation',
          statement: 'Je peux chercher des réponses à mes questions.',
          successCriteria: [
            'Je collecte des informations en observant',
            'Je compare différents objets ou situations',
            'J\'essaie de trouver des régularités',
            'Je partage mes conclusions'
          ]
        }
      ]
    };
    
    return baseGoals[inquiryFocus] || baseGoals.observation;
  }
  
  /**
   * Creates Minds On activities for Science
   */
  private static createScienceMindsOnActivities(inquiryFocus: string, seasonalConnection?: string): Activity[] {
    return [
      {
        id: 'science-minds-on',
        phase: 'minds-on',
        title: 'Éveil scientifique',
        description: 'Activation de la curiosité et connexion avec le monde naturel',
        duration: 12,
        instructions: [
          'Observation d\'un objet mystère ou phénomène intéressant',
          'Discussion sur ce que les élèves remarquent',
          'Activation des connaissances antérieures en français',
          'Introduction du vocabulaire scientifique du jour',
          seasonalConnection ? `Connexion avec la saison: ${seasonalConnection}` : 'Connexion avec l\'environnement'
        ],
        materials: [
          'Objet d\'observation ou démonstration',
          'Cartes de vocabulaire scientifique',
          'Journal d\'observation de classe'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Utiliser beaucoup de gestes et de démonstrations visuelles',
            'Permettre la participation par pointage et gestes',
            'Donner plus de temps pour observer et réfléchir'
          ],
          core: [
            'Encourager la description en français',
            'Poser des questions simples \"Que vois-tu?\"',
            'Connecter avec les expériences personnelles'
          ],
          extension: [
            'Encourager des questions plus complexes',
            'Demander des prédictions sur ce qui va arriver',
            'Utiliser du vocabulaire scientifique plus avancé'
          ]
        },
        safetyConsiderations: [
          'S\'assurer que tous les objets sont sécuritaires pour les enfants',
          'Maintenir une distance sécuritaire si démonstration'
        ]
      }
    ];
  }
  
  /**
   * Creates Action activities for Science
   */
  private static createScienceActionActivities(inquiryFocus: string, scienceTopic: string, materials: string[]): Activity[] {
    return [
      {
        id: 'science-action-inquiry',
        phase: 'action',
        title: 'Exploration scientifique',
        description: `Investigation pratique: ${scienceTopic}`,
        duration: 28,
        instructions: [
          'Distribution sécuritaire des matériaux d\'exploration',
          'Démonstration des procédures de sécurité',
          'Exploration guidée avec observation systématique',
          'Documentation des découvertes dans le journal',
          'Partage des observations entre partenaires',
          'Discussion des découvertes avec le groupe'
        ],
        materials: [
          'Journaux d\'observation individuels',
          'Matériaux d\'exploration spécifiques',
          'Outils d\'observation (loupes, etc.)',
          'Cartes de documentation'
        ],
        grouping: 'small-groups',
        differentiation: {
          support: [
            'Partenaire pour aide avec l\'écriture',
            'Instructions visuelles étape par étape',
            'Matériaux simplifiés mais authentiques',
            'Plus de temps pour l\'exploration'
          ],
          core: [
            'Participation active dans l\'exploration',
            'Documentation avec dessins et mots simples',
            'Utilisation du vocabulaire scientifique',
            'Partage des observations'
          ],
          extension: [
            'Documentation plus détaillée',
            'Questions d\'investigation plus approfondies',
            'Aide aux autres dans leur exploration',
            'Connexions entre différentes observations'
          ]
        },
        safetyConsiderations: [
          'Supervision constante pendant la manipulation',
          'Vérification de l\'utilisation correcte des outils',
          'Nettoyage immédiat de tout déversement',
          'Rappel des règles de sécurité si nécessaire'
        ]
      }
    ];
  }
  
  /**
   * Creates Consolidation activities for Science
   */
  private static createScienceConsolidationActivities(inquiryFocus: string): Activity[] {
    return [
      {
        id: 'science-consolidation',
        phase: 'consolidation',
        title: 'Partage scientifique',
        description: 'Consolidation des découvertes et réflexion scientifique',
        duration: 5,
        instructions: [
          'Rassemblement en cercle pour partager',
          'Présentation d\'une découverte par quelques élèves',
          'Discussion sur ce que nous avons appris',
          'Connexion avec la question scientifique du jour',
          'Anticipation de la prochaine exploration'
        ],
        materials: [
          'Exemples des observations des élèves',
          'Tableau pour noter les découvertes'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Encouragement à partager par gestes ou mots simples',
            'Support de l\'enseignant pour verbaliser',
            'Utilisation des dessins pour expliquer'
          ],
          core: [
            'Partage d\'au moins une observation',
            'Écoute attentive des autres',
            'Utilisation du vocabulaire scientifique appris'
          ],
          extension: [
            'Animation de parties de la discussion',
            'Connexions entre différentes observations',
            'Questions pour la prochaine exploration'
          ]
        }
      }
    ];
  }
  
  /**
   * Gets Indigenous perspectives for Science
   */
  private static getScienceIndigenousPerspectives(seasonalConnection?: string): string {
    const baseText = 'Reconnaissance des savoirs traditionnels Mi\'kmaq sur la nature, incluant l\'observation des cycles saisonniers, la compréhension des relations entre tous les êtres vivants, et les pratiques respectueuses envers l\'environnement.';
    
    if (seasonalConnection) {
      return `${baseText} Connexion spéciale avec les enseignements Mi\'kmaq sur ${seasonalConnection}.`;
    }
    
    return baseText;
  }
}