/**
 * 🏛️ SCIENCES HUMAINES LESSON TEMPLATE
 * Grade 1 French Immersion - 97 lessons per year (ALTERNATING with Health/FPS)
 * 
 * Specialized for Grade 1 citizenship and community development:
 * - Identity and belonging
 * - Community connections and citizenship
 * - Cultural awareness and respect
 * - Simple geography and mapping
 * - Family and social relationships
 */

import { LessonPlanTemplate, Activity, LearningGoal, Assessment, Vocabulary } from '../types/LessonPlanTemplate';
import { MasterLessonTemplate } from '../core/MasterTemplate';

export class SocialStudiesTemplate {
  
  /**
   * Creates a perfect Social Studies lesson template for Grade 1 French Immersion
   */
  static createSocialStudiesLesson(config: {
    unitPlanId: string;
    title: string;
    titleEn?: string;
    socialStudiesFocus: 'identity' | 'community' | 'citizenship' | 'geography' | 'culture' | 'relationships';
    specificTopic: string;
    vocabulary: Vocabulary[];
    communityConnection?: string;
    culturalElement?: string;
  }): LessonPlanTemplate {
    
    // Start with master template
    const template = MasterLessonTemplate.createTemplate({
      subject: 'Sciences humaines',
      unitPlanId: config.unitPlanId,
      title: config.title,
      titleEn: config.titleEn,
      learningGoals: this.generateSocialStudiesLearningGoals(config.socialStudiesFocus, config.specificTopic),
      vocabulary: config.vocabulary,
      indigenousPerspectives: this.getSocialStudiesIndigenousPerspectives(config.socialStudiesFocus)
    });
    
    // Social Studies-specific big ideas for Grade 1
    template.bigIdeas = [
      'Nous appartenons à différentes communautés qui nous aident à grandir',
      'Chaque personne est unique et importante dans notre société',
      'Nos choix et nos actions affectent nous-mêmes et les autres',
      'Les règles et les responsabilités nous aident à vivre ensemble',
      'Nous pouvons apprendre des autres cultures et traditions'
    ];
    
    template.essentialQuestions = [
      'À quelles communautés est-ce que j\'appartiens?',
      'Comment puis-je être un bon citoyen dans ma communauté?',
      'Qu\'est-ce qui me rend spécial et unique?',
      'Comment puis-je aider les autres dans ma communauté?',
      'Que puis-je apprendre des autres cultures?'
    ];
    
    // ETFO Three-Part Structure for Social Studies
    template.activities = {
      mindsOn: this.createSocialStudiesMindsOnActivities(config.socialStudiesFocus, config.communityConnection),
      action: this.createSocialStudiesActionActivities(config.socialStudiesFocus, config.specificTopic, config.culturalElement),
      consolidation: this.createSocialStudiesConsolidationActivities(config.socialStudiesFocus)
    };
    
    // Social Studies-specific assessments
    template.assessments = [
      ...template.assessments,
      {
        id: 'social-studies-discussion',
        type: 'formative',
        method: 'Discussion communautaire',
        description: 'Participation dans les discussions sur la communauté et la citoyenneté',
        phase: 'action',
        successCriteria: [
          'L\'élève partage ses idées respectueusement',
          'L\'élève écoute les perspectives des autres',
          'L\'élève utilise le vocabulaire des sciences humaines',
          'L\'élève fait des connexions personnelles'
        ]
      },
      {
        id: 'social-studies-citizenship',
        type: 'formative',
        method: 'Actions citoyennes',
        description: 'Démonstration de comportements citoyens responsables',
        phase: 'consolidation',
        successCriteria: [
          'L\'élève montre du respect pour les autres',
          'L\'élève suit les règles de la communauté',
          'L\'élève aide quand c\'est approprié',
          'L\'élève célèbre les différences'
        ]
      }
    ];
    
    // Social Studies-specific materials
    template.materials = {
      essential: [
        'Cartes simples et images de la communauté',
        'Photos de familles diverses et communautés',
        'Livres sur les communautés en français',
        'Matériel de cartographie simple'
      ],
      optional: [
        'Objets culturels appropriés (répliques)',
        'Costumes pour jeux de rôle',
        'Drapeaux et symboles communautaires',
        'Artéfacts historiques simples'
      ],
      technology: [
        'Cartes numériques simples',
        'Vidéos sur les communautés francophones',
        'Applications de géographie pour enfants'
      ],
      books: [
        'Livres sur les familles diverses en français',
        'Histoires de communautés francophones',
        'Livres sur les traditions culturelles',
        'Guides sur les métiers communautaires'
      ],
      manipulatives: [
        'Figures de personnes diverses',
        'Blocs pour construire des communautés',
        'Cartes de rôles communautaires',
        'Matériel de cartographie tactile'
      ]
    };
    
    // Enhanced safety for Social Studies (emotional and cultural safety)
    template.safety = {
      level: 'medium',
      considerations: [
        'Sensibilité aux diverses structures familiales',
        'Respect pour toutes les cultures et traditions',
        'Approche trauma-informée pour les discussions familiales',
        'Inclusion de tous les élèves dans les activités',
        'Éviter les stéréotypes culturels ou sociaux',
        'Confidentialité respectée pour les informations personnelles'
      ],
      procedures: [
        'Établir des règles claires pour les discussions respectueuses',
        'Utiliser un langage inclusif et approprié',
        'Offrir des alternatives pour les élèves qui préfèrent ne pas partager',
        'Superviser les jeux de rôle pour éviter les exclusions',
        'Intervenir immédiatement si commentaires inappropriés',
        'Célébrer la diversité comme une force'
      ]
    };
    
    // Cross-curricular connections
    template.crossCurricular = [
      { subject: 'Français (Immersion)', connection: 'Vocabulaire communautaire et expression des idées citoyennes' },
      { subject: 'Arts visuels', connection: 'Représentation artistique des communautés et cultures' },
      { subject: 'Formation personnelle et sociale', connection: 'Relations saines et résolution de conflits' },
      { subject: 'Mathématiques', connection: 'Graphiques simples sur la communauté, mesures et cartes' }
    ];
    
    // Home connection for social studies
    template.homeConnection = 'Encourager les discussions familiales sur les traditions, l\'histoire familiale, et les façons d\'aider dans la communauté. Explorer le quartier ensemble et identifier les services communautaires.';
    
    // Social Studies-specific teacher notes
    template.teacherNotes = [
      ...template.teacherNotes || [],
      'Être sensible aux diverses réalités familiales des élèves',
      'Modeler le respect et l\'inclusion dans toutes les interactions',
      'Utiliser des exemples variés représentant la diversité',
      'Encourager les connexions personnelles appropriées',
      'Créer un environnement sécuritaire pour partager',
      'Célébrer les contributions de toutes les cultures'
    ];
    
    return template;
  }
  
  /**
   * Generates learning goals specific to social studies focus
   */
  private static generateSocialStudiesLearningGoals(socialStudiesFocus: string, specificTopic: string): LearningGoal[] {
    const baseGoals: Record<string, LearningGoal[]> = {
      identity: [
        {
          id: 'social-studies-identity',
          statement: 'Je peux décrire qui je suis et ce qui me rend unique.',
          successCriteria: [
            'Je peux parler de ma famille et de mes traditions',
            'Je reconnais ce qui me rend spécial',
            'Je respecte ce qui rend les autres uniques',
            'Je suis fier de mon identité'
          ]
        }
      ],
      community: [
        {
          id: 'social-studies-community',
          statement: 'Je comprends comment les communautés fonctionnent et m\'aident.',
          successCriteria: [
            'Je peux nommer des personnes qui m\'aident dans ma communauté',
            'Je connais des endroits importants dans ma communauté',
            'Je comprends comment je peux aider ma communauté',
            'Je reconnais que je fais partie de plusieurs communautés'
          ]
        }
      ],
      citizenship: [
        {
          id: 'social-studies-citizenship',
          statement: 'Je peux être un bon citoyen dans ma communauté.',
          successCriteria: [
            'Je suis les règles pour aider tout le monde',
            'Je traite les autres avec respect',
            'Je prends soin de nos espaces partagés',
            'J\'aide quand je peux'
          ]
        }
      ],
      geography: [
        {
          id: 'social-studies-geography',
          statement: 'Je peux décrire les endroits où je vis.',
          successCriteria: [
            'Je peux faire une carte simple de mon école ou quartier',
            'Je connais mon adresse et ma ville',
            'Je peux utiliser des mots de direction simples',
            'Je reconnais des caractéristiques géographiques de base'
          ]
        }
      ],
      culture: [
        {
          id: 'social-studies-culture',
          statement: 'Je peux apprendre sur différentes cultures et traditions.',
          successCriteria: [
            'Je respecte les traditions des autres',
            'Je peux partager mes propres traditions',
            'J\'apprends des façons dont les gens célèbrent',
            'Je reconnais que la diversité enrichit notre communauté'
          ]
        }
      ],
      relationships: [
        {
          id: 'social-studies-relationships',
          statement: 'Je peux avoir des relations saines avec les autres.',
          successCriteria: [
            'Je traite mes amis avec gentillesse',
            'Je peux résoudre des problèmes en parlant',
            'Je demande de l\'aide quand j\'en ai besoin',
            'Je coopère bien en groupe'
          ]
        }
      ]
    };
    
    return baseGoals[socialStudiesFocus] || baseGoals.community;
  }
  
  /**
   * Creates Minds On activities for Social Studies
   */
  private static createSocialStudiesMindsOnActivities(socialStudiesFocus: string, communityConnection?: string): Activity[] {
    return [
      {
        id: 'social-studies-minds-on',
        phase: 'minds-on',
        title: 'Connexion communautaire',
        description: 'Activation des connaissances sur la communauté et la citoyenneté',
        duration: 12,
        instructions: [
          'Présentation d\'une photo, objet ou histoire liée au sujet',
          'Discussion sur les expériences personnelles des élèves',
          'Activation des connaissances sur la communauté',
          'Introduction du vocabulaire des sciences humaines',
          communityConnection ? `Exploration de la connexion: ${communityConnection}` : 'Connexion avec notre communauté'
        ],
        materials: [
          'Photos de communautés diverses',
          'Cartes simples de la région',
          'Objets culturels appropriés',
          'Cartes de vocabulaire illustrées'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Utiliser des images claires et familières',
            'Permettre le partage par gestes ou mots simples',
            'Respecter ceux qui préfèrent écouter'
          ],
          core: [
            'Encourager le partage d\'expériences personnelles',
            'Poser des questions ouvertes sur la communauté',
            'Connecter avec les connaissances existantes'
          ],
          extension: [
            'Encourager des connexions plus complexes',
            'Poser des questions approfondies',
            'Aider à animer la discussion'
          ]
        },
        safetyConsiderations: [
          'Respecter la confidentialité des informations familiales',
          'Créer un environnement sécuritaire pour partager'
        ]
      }
    ];
  }
  
  /**
   * Creates Action activities for Social Studies
   */
  private static createSocialStudiesActionActivities(socialStudiesFocus: string, specificTopic: string, culturalElement?: string): Activity[] {
    return [
      {
        id: 'social-studies-action-exploration',
        phase: 'action',
        title: 'Exploration communautaire',
        description: `Investigation active: ${specificTopic}`,
        duration: 28,
        instructions: [
          'Exploration du sujet par des activités interactives',
          'Utilisation de cartes, images ou objets pour apprendre',
          'Discussions en petits groupes sur les découvertes',
          'Jeux de rôle appropriés pour comprendre les concepts',
          'Création de représentations simples (dessins, cartes)',
          culturalElement ? `Exploration spéciale de ${culturalElement}` : 'Connexions culturelles'
        ],
        materials: [
          'Matériel de cartographie simple',
          'Images de communautés diverses',
          'Objets pour jeux de rôle',
          'Papier pour dessiner et créer'
        ],
        grouping: 'small-groups',
        differentiation: {
          support: [
            'Groupes avec partenaires aidants',
            'Instructions visuelles et simples',
            'Rôles adaptés aux capacités',
            'Plus de temps pour traiter l\'information'
          ],
          core: [
            'Participation active dans les discussions',
            'Utilisation du vocabulaire des sciences humaines',
            'Création de représentations personnelles',
            'Respect des perspectives des autres'
          ],
          extension: [
            'Rôles de leadership dans les groupes',
            'Connexions plus complexes entre concepts',
            'Aide aux autres élèves',
            'Questions d\'approfondissement'
          ]
        },
        safetyConsiderations: [
          'Supervision des jeux de rôle pour éviter exclusions',
          'Intervention si commentaires inappropriés',
          'Respect de la diversité dans toutes les activités'
        ]
      }
    ];
  }
  
  /**
   * Creates Consolidation activities for Social Studies
   */
  private static createSocialStudiesConsolidationActivities(socialStudiesFocus: string): Activity[] {
    return [
      {
        id: 'social-studies-consolidation',
        phase: 'consolidation',
        title: 'Cercle communautaire',
        description: 'Réflexion et partage sur les apprentissages communautaires',
        duration: 5,
        instructions: [
          'Rassemblement en cercle pour partager',
          'Réflexion sur ce qui a été appris sur la communauté',
          'Partage d\'une nouvelle idée ou connexion',
          'Discussion sur comment appliquer les apprentissages',
          'Appréciation de la diversité et des contributions de tous'
        ],
        materials: [
          'Espace pour cercle communautaire',
          'Exemples du travail des élèves'
        ],
        grouping: 'whole-class',
        differentiation: {
          support: [
            'Encouragement à partager de façon confortable',
            'Support pour verbaliser les idées',
            'Célébration de toutes les contributions'
          ],
          core: [
            'Partage d\'au moins une chose apprise',
            'Écoute respectueuse des autres',
            'Utilisation du vocabulaire approprié'
          ],
          extension: [
            'Animation de parties de la discussion',
            'Connexions entre différents concepts',
            'Questions pour approfondir la réflexion'
          ]
        }
      }
    ];
  }
  
  /**
   * Gets Indigenous perspectives for Social Studies
   */
  private static getSocialStudiesIndigenousPerspectives(socialStudiesFocus: string): string {
    const baseText = 'Reconnaissance que nous vivons sur le territoire traditionnel Mi\'kmaq et apprentissage des façons traditionnelles de vivre en communauté, incluant le respect des Aînés, la prise de décisions par consensus, et la responsabilité envers les sept générations futures.';
    
    const focusSpecific: Record<string, string> = {
      identity: 'Exploration de l\'identité Mi\'kmaq et des noms traditionnels, ainsi que l\'importance de connaître ses origines et sa place dans la communauté.',
      community: 'Apprentissage des structures communautaires Mi\'kmaq traditionnelles et modernes, incluant le rôle du Conseil et l\'importance de l\'entraide.',
      citizenship: 'Compréhension des responsabilités citoyennes selon les perspectives Mi\'kmaq, incluant la protection de la terre et le soin des autres.',
      geography: 'Exploration des noms de lieux Mi\'kmaq et de l\'importance spirituelle et pratique du territoire.',
      culture: 'Célébration des traditions Mi\'kmaq incluant les pow-wow, l\'artisanat traditionnel, et les enseignements des Aînés.',
      relationships: 'Apprentissage des valeurs Mi\'kmaq concernant les relations familiales étendues et le respect intergénérationnel.'
    };
    
    return `${baseText} ${focusSpecific[socialStudiesFocus] || ''}`;
  }
}