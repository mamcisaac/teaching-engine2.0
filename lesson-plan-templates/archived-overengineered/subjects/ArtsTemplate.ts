/**
 * 🎨 ARTS VISUELS LESSON TEMPLATE
 * Grade 1 French Immersion - 195 lessons per year (DAILY)
 * 
 * Specialized for Grade 1 artistic development:
 * - Creative expression and exploration
 * - Fine motor skill development
 * - Cultural connections and appreciation
 * - Art vocabulary in French
 * - Process-focused learning
 */

import { LessonPlanTemplate, Activity, LearningGoal, Assessment, Vocabulary } from '../types/LessonPlanTemplate';
import { MasterLessonTemplate } from '../core/MasterTemplate';

export class ArtsTemplate {
  
  /**
   * Creates a perfect Arts lesson template for Grade 1 French Immersion
   */
  static createArtsLesson(config: {
    unitPlanId: string;
    title: string;
    titleEn?: string;
    artsFocus: 'creating' | 'reflecting' | 'connecting' | 'presenting';
    medium: 'drawing' | 'painting' | 'collage' | 'sculpture' | 'mixed-media' | 'digital';
    technique: string;
    vocabulary: Vocabulary[];
    culturalConnection?: string;
    materials: string[];
  }): LessonPlanTemplate {
    
    // Start with master template
    const template = MasterLessonTemplate.createTemplate({
      subject: 'Arts visuels',
      unitPlanId: config.unitPlanId,
      title: config.title,
      titleEn: config.titleEn,
      learningGoals: this.generateArtsLearningGoals(config.artsFocus, config.medium, config.technique),
      vocabulary: config.vocabulary,
      indigenousPerspectives: this.getArtsIndigenousPerspectives(config.culturalConnection)
    });
    
    // Arts-specific big ideas for Grade 1
    template.bigIdeas = [
      'L\'art nous permet d\'exprimer nos idées et nos émotions',
      'Nous pouvons créer de la beauté avec différents matériaux',
      'Chaque artiste a sa propre façon unique de s\'exprimer',
      'L\'art nous connecte à notre culture et à celle des autres',
      'Le processus de création est aussi important que le résultat final'
    ];
    
    template.essentialQuestions = [
      'Comment puis-je exprimer mes idées par l\'art?',
      'Qu\'est-ce qui rend l\'art beau ou intéressant?',
      'Comment les artistes créent-ils leurs œuvres?',
      'Que puis-je apprendre sur moi-même en créant de l\'art?',
      'Comment l\'art me connecte-t-il aux autres?'
    ];
    
    // ETFO Three-Part Structure for Arts
    template.activities = {
      mindsOn: this.createArtsMindsOnActivities(config.artsFocus, config.culturalConnection),
      action: this.createArtsActionActivities(config.medium, config.technique, config.materials),
      consolidation: this.createArtsConsolidationActivities(config.artsFocus)
    };
    
    // Arts-specific assessments
    template.assessments = [
      ...template.assessments,
      {
        id: 'arts-creative-process',
        type: 'formative',
        method: 'Observation du processus créatif',
        description: 'Évaluation de l\'engagement et de l\'exploration artistique',
        phase: 'action',
        successCriteria: [
          'L\'élève s\'engage activement dans le processus créatif',
          'L\'élève explore différentes techniques et matériaux',
          'L\'élève fait des choix artistiques personnels',
          'L\'élève persévère face aux défis créatifs'
        ]
      },
      {
        id: 'arts-reflection',
        type: 'formative',
        method: 'Réflexion artistique',
        description: 'Capacité à parler de son art et de celui des autres',
        phase: 'consolidation',
        successCriteria: [
          'L\'élève décrit son processus créatif en français',
          'L\'élève exprime ce qu\'il aime dans son art',
          'L\'élève respecte et apprécie l\'art des autres',
          'L\'élève utilise le vocabulaire artistique appris'
        ]
      }
    ];
    
    // Arts-specific materials
    template.materials = {
      essential: [
        'Papier de qualité appropriée',
        'Outils de dessin de base (crayons, marqueurs)',
        'Pinceaux de différentes tailles',
        'Tabliers ou vêtements de protection'
      ],
      optional: [
        'Matériaux de collage variés',
        'Tampons et encreurs',
        'Objets texturés pour impression',
        'Matériaux recyclés sécuritaires'
      ],
      technology: [
        'Tablettes pour art numérique simple',
        'Appareil photo pour documenter le processus',
        'Projecteur pour montrer des œuvres d\'art'
      ],
      books: [
        'Livres d\'art pour enfants en français',
        'Biographies d\'artistes simplifiées',
        'Livres sur les techniques artistiques'
      ],
      manipulatives: [
        ...config.materials,
        'Argile ou pâte à modeler',
        'Matériaux naturels sécuritaires',
        'Tissus et fibres diverses',
        'Outils de sculpture adaptés'
      ]
    };
    
    // Enhanced safety for Arts
    template.safety = {
      level: 'medium',
      considerations: [
        'Matériaux non toxiques et adaptés à l\'âge uniquement',
        'Ventilation adéquate pour peintures et colles',
        'Protection des vêtements avec tabliers',
        'Surveillance de l\'utilisation des outils pointus',
        'Vérification des allergies aux matériaux',
        'Espace de travail organisé pour éviter les accidents'
      ],
      procedures: [
        'Démonstration de l\'utilisation sécuritaire des outils',
        'Établissement de règles claires pour l\'atelier',
        'Nettoyage immédiat des déversements',
        'Lavage des mains après manipulation de matériaux',
        'Rangement sécuritaire de tous les outils et matériaux',
        'Séchage sécuritaire des œuvres en cours'
      ]
    };
    
    // Cross-curricular connections
    template.crossCurricular = [
      { subject: 'Français (Immersion)', connection: 'Vocabulaire artistique et description des œuvres' },
      { subject: 'Mathématiques', connection: 'Formes géométriques, mesures et régularités dans l\'art' },
      { subject: 'Sciences de la nature', connection: 'Observation et documentation visuelle, couleurs' },
      { subject: 'Sciences humaines', connection: 'Art traditionnel et culturel, identité et expression' },
      { subject: 'Formation personnelle et sociale', connection: 'Expression des émotions et estime de soi' }
    ];
    
    // Home connection for arts
    template.homeConnection = 'Encourager la créativité à la maison : dessiner des observations, créer avec des matériaux recyclés, visiter des espaces artistiques, partager les créations familiales.';
    
    // Arts-specific teacher notes
    template.teacherNotes = [
      ...template.teacherNotes || [],
      'Préparer tous les matériaux à l\'avance et tester les techniques',
      'Créer un environnement accueillant où les erreurs sont acceptées',
      'Célébrer la diversité des expressions artistiques',
      'Documenter le processus créatif, pas seulement le produit final',
      'Modeler l\'utilisation correcte des outils et techniques',
      'Encourager l\'exploration et la prise de risques créatifs'
    ];
    
    return template;
  }
  
  /**
   * Generates learning goals specific to arts focus and medium
   */
  private static generateArtsLearningGoals(artsFocus: string, medium: string, technique: string): LearningGoal[] {
    const baseGoals: Record<string, LearningGoal[]> = {
      creating: [
        {
          id: 'arts-creative-expression',
          statement: `Je peux créer de l\'art en utilisant ${medium}.`,
          successCriteria: [
            'J\'explore différents matériaux et techniques',
            'Je fais des choix artistiques personnels',
            'Je persévère quand c\'est difficile',
            'Je suis fier de mes créations'
          ]
        },
        {
          id: 'arts-technique-development',
          statement: `Je peux utiliser la technique de ${technique}.`,
          successCriteria: [
            'Je suis les étapes de la technique',
            'J\'utilise les outils correctement et en sécurité',
            'J\'améliore mes habiletés avec la pratique',
            'Je demande de l\'aide quand j\'en ai besoin'
          ]
        }
      ],
      reflecting: [
        {
          id: 'arts-reflection-skills',
          statement: 'Je peux parler de mon art et de celui des autres.',
          successCriteria: [
            'Je décris ce que j\'ai créé en français',
            'J\'explique ce que j\'aime dans mon art',
            'Je respecte les créations des autres',
            'J\'utilise des mots d\'art pour m\'exprimer'
          ]
        }
      ],
      connecting: [
        {
          id: 'arts-cultural-connections',
          statement: 'Je peux voir l\'art dans ma vie et ma culture.',
          successCriteria: [
            'Je reconnais l\'art autour de moi',
            'Je respecte les traditions artistiques',
            'Je connecte l\'art à mes expériences',
            'J\'apprends sur les artistes de ma culture'
          ]
        }
      ],
      presenting: [
        {
          id: 'arts-presentation-skills',
          statement: 'Je peux partager mon art avec les autres.',
          successCriteria: [
            'Je présente mon art avec fierté',
            'J\'explique mon processus créatif',
            'J\'écoute les commentaires respectueux',
            'Je célèbre l\'art de tous'
          ]
        }
      ]
    };
    
    return baseGoals[artsFocus] || baseGoals.creating;
  }
  
  /**
   * Creates Minds On activities for Arts
   */
  private static createArtsMindsOnActivities(artsFocus: string, culturalConnection?: string): Activity[] {
    return [
      {
        id: 'arts-minds-on',
        phase: 'minds-on',
        title: 'Inspiration artistique',
        description: 'Activation de la créativité et connexion avec l\'art',
        duration: 10,
        instructions: [
          'Présentation d\'une œuvre d\'art inspirante ou d\'un objet intéressant',
          'Discussion sur ce que les élèves voient et ressentent',
          'Activation des connaissances sur les techniques artistiques',
          'Introduction du vocabulaire artistique du jour',
          culturalConnection ? `Exploration de la connexion culturelle: ${culturalConnection}` : 'Connexion avec l\'art dans notre vie'
        ],
        materials: [
          'Reproductions d\'œuvres d\'art ou objets inspirants',
          'Cartes de vocabulaire artistique illustrées',
          'Exemples de techniques ou matériaux'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Utiliser des images claires et attrayantes',
            'Permettre les réponses par gestes et expressions',
            'Donner le temps d\'observer avant de discuter'
          ],
          core: [
            'Encourager la description en français',
            'Poser des questions sur les couleurs, formes, émotions',
            'Connecter avec les expériences artistiques personnelles'
          ],
          extension: [
            'Encourager l\'analyse plus approfondie des œuvres',
            'Poser des questions sur les techniques utilisées',
            'Faire des connexions avec d\'autres arts ou cultures'
          ]
        },
        safetyConsiderations: [
          'S\'assurer que tous les exemples sont appropriés pour l\'âge'
        ]
      }
    ];
  }
  
  /**
   * Creates Action activities for Arts
   */
  private static createArtsActionActivities(medium: string, technique: string, materials: string[]): Activity[] {
    return [
      {
        id: 'arts-action-creating',
        phase: 'action',
        title: 'Création artistique',
        description: `Exploration créative avec ${medium} - technique: ${technique}`,
        duration: 30,
        instructions: [
          'Démonstration de la technique et des outils',
          'Distribution sécuritaire des matériaux artistiques',
          'Exploration libre avec guidance selon les besoins',
          'Encouragement à essayer, expérimenter et persévérer',
          'Documentation du processus créatif (photos, notes)',
          'Circulation pour offrir soutien et encouragement individualisé'
        ],
        materials: [
          'Matériaux artistiques spécifiques',
          'Outils appropriés et sécuritaires',
          'Tabliers ou protection',
          'Lingettes pour nettoyage'
        ],
        grouping: 'individual',
        differentiation: {
          support: [
            'Instructions simplifiées et démontrées étape par étape',
            'Matériaux plus faciles à manipuler',
            'Support individuel pour débuter',
            'Encouragement constant et patience'
          ],
          core: [
            'Exploration libre avec technique guidée',
            'Choix personnels dans la création',
            'Utilisation correcte des outils et matériaux',
            'Expression de sa personnalité artistique'
          ],
          extension: [
            'Techniques plus complexes ou combinées',
            'Aide aux autres élèves',
            'Exploration de variations personnelles',
            'Documentation plus détaillée du processus'
          ]
        },
        safetyConsiderations: [
          'Surveillance constante de l\'utilisation des outils',
          'Vérification que les élèves portent la protection nécessaire',
          'Nettoyage immédiat des déversements',
          'Rappel des règles de sécurité de l\'atelier'
        ]
      }
    ];
  }
  
  /**
   * Creates Consolidation activities for Arts
   */
  private static createArtsConsolidationActivities(artsFocus: string): Activity[] {
    return [
      {
        id: 'arts-consolidation',
        phase: 'consolidation',
        title: 'Galerie et réflexion',
        description: 'Partage et réflexion sur les créations artistiques',
        duration: 5,
        instructions: [
          'Nettoyage et rangement des espaces de travail',
          'Exposition temporaire des œuvres en cours ou terminées',
          'Partage volontaire de quelques créations',
          'Discussion sur le processus créatif et les apprentissages',
          'Appréciation respectueuse de toutes les œuvres',
          'Planification pour la prochaine séance artistique'
        ],
        materials: [
          'Espace d\'exposition improvisé',
          'Linges pour nettoyage final'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Encouragement à partager même les œuvres inachevées',
            'Support pour verbaliser l\'expérience créative',
            'Célébration de tous les efforts artistiques'
          ],
          core: [
            'Partage d\'au moins une chose apprise ou aimée',
            'Écoute respectueuse des autres',
            'Utilisation du vocabulaire artistique'
          ],
          extension: [
            'Animation de parties de la discussion',
            'Connexions entre différentes techniques ou œuvres',
            'Suggestions pour améliorer ou continuer'
          ]
        }
      }
    ];
  }
  
  /**
   * Gets Indigenous perspectives for Arts
   */
  private static getArtsIndigenousPerspectives(culturalConnection?: string): string {
    const baseText = 'Reconnaissance et respect des traditions artistiques Mi\'kmaq, incluant les motifs traditionnels, l\'art de la vannerie, la sculpture sur bois, et l\'utilisation de matériaux naturels. Apprentissage que l\'art est un moyen de transmettre la culture et les histoires.';
    
    if (culturalConnection) {
      return `${baseText} Connexion spéciale avec ${culturalConnection} et son importance dans la culture Mi\'kmaq.`;
    }
    
    return baseText;
  }
}