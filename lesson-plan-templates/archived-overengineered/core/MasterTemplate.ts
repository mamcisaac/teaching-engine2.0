/**
 * 🏆 MASTER LESSON PLAN TEMPLATE
 * Grade 1 French Immersion - ETFO Compliant
 * Perfect Foundation for 975 Daily Lessons
 */

import { LessonPlanTemplate, SubjectType, Activity, LearningGoal, Assessment, Vocabulary } from '../types/LessonPlanTemplate';

export class MasterLessonTemplate {
  
  /**
   * Creates a perfect ETFO-compliant lesson plan template
   */
  static createTemplate(config: {
    subject: SubjectType;
    unitPlanId: string;
    title: string;
    titleEn?: string;
    learningGoals: LearningGoal[];
    vocabulary: Vocabulary[];
    indigenousPerspectives: string;
  }): LessonPlanTemplate {
    
    const template: LessonPlanTemplate = {
      // Metadata
      id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subject: config.subject,
      unitPlanId: config.unitPlanId,
      title: config.title,
      titleEn: config.titleEn,
      
      // Duration (ETFO Standard)
      duration: 45, // Total minutes
      
      // Learning Framework
      learningGoals: config.learningGoals,
      bigIdeas: this.generateBigIdeas(config.subject),
      essentialQuestions: this.generateEssentialQuestions(config.subject),
      
      // Vocabulary (French Immersion)
      vocabulary: config.vocabulary,
      
      // ETFO Three-Part Structure (Empty framework - to be filled by subject templates)
      activities: {
        mindsOn: [],    // 10-15 minutes
        action: [],     // 25-30 minutes
        consolidation: [] // 5-10 minutes
      },
      
      // Assessment Framework
      assessments: this.generateBaseAssessments(),
      
      // Materials (Base framework)
      materials: {
        essential: [],
        optional: [],
        technology: [],
        books: [],
        manipulatives: []
      },
      
      // Safety (Grade 1 appropriate)
      safety: {
        level: 'low',
        considerations: [
          'Supervision d\'adulte en tout temps',
          'Espaces de travail sécuritaires',
          'Matériaux appropriés pour les enfants'
        ],
        procedures: [
          'Vérifier l\'espace avant l\'activité',
          'Établir des règles claires',
          'Rester vigilant pendant l\'activité'
        ]
      },
      
      // Indigenous Perspectives (Mandatory PEI)
      indigenousPerspectives: config.indigenousPerspectives,
      
      // Differentiation (Universal Design for Learning)
      differentiation: {
        universalDesign: [
          'Instructions visuelles et verbales',
          'Choix de modalités d\'expression',
          'Temps flexible pour les tâches',
          'Supports sensoriels disponibles'
        ],
        accommodations: [
          'Places assises préférentielles',
          'Instructions répétées individuellement',
          'Temps supplémentaire si nécessaire',
          'Aide d\'un pair ou de l\'enseignant'
        ],
        modifications: [
          'Objectifs d\'apprentissage ajustés',
          'Tâches simplifiées ou décomposées',
          'Critères de réussite modifiés',
          'Évaluation alternative'
        ]
      },
      
      // Cross-Curricular (To be populated by subject)
      crossCurricular: [],
      
      // Home Connection
      homeConnection: 'Communication avec les familles sur les apprentissages du jour',
      
      // NEW: Practical Planning Support
      prepRequirements: {
        prepTimeMinutes: 15,
        setupNeeded: [
          'Organiser les espaces de travail',
          'Préparer le matériel sur les tables',
          'Écrire l\'objectif au tableau'
        ]
      },
      
      timingFlexibility: {
        criticalElements: [
          'Objectif d\'apprentissage principal',
          'Au moins une activité pratique',
          'Consolidation rapide'
        ],
        optionalEnhancements: [
          'Activités d\'extension',
          'Partage entre pairs supplémentaire'
        ]
      },
      
      contingencyPlans: {
        ifShortOnTime: 'Passer directement à l\'activité principale et consolidation rapide',
        ifInterrupted: 'Noter où arrêté, reprendre au retour ou continuer demain',
        ifMaterialsMissing: 'Utiliser tableau/papier pour démonstration collective'
      },
      
      // Teacher Support
      teacherNotes: [
        'Préparer tous les matériaux à l\'avance',
        'Réviser les mots de vocabulaire',
        'Avoir des activités d\'extension prêtes',
        'Noter les observations pour l\'évaluation'
      ],
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemplate: true,
      templateVersion: '1.0.0'
    };
    
    return template;
  }
  
  /**
   * Generates subject-appropriate big ideas for Grade 1 French Immersion
   */
  private static generateBigIdeas(subject: SubjectType): string[] {
    const bigIdeasMap: Record<SubjectType, string[]> = {
      'Français (Immersion)': [
        'La communication nous permet de partager nos idées et nos sentiments',
        'Les histoires nous connectent aux autres et à nos expériences',
        'Le français nous ouvre des portes vers de nouvelles cultures'
      ],
      'Mathématiques': [
        'Les nombres nous aident à comprendre et décrire notre monde',
        'Les régularités sont partout autour de nous',
        'Les mathématiques nous aident à résoudre des problèmes quotidiens'
      ],
      'Sciences de la nature': [
        'Nous faisons partie du monde naturel',
        'L\'observation nous aide à comprendre notre environnement',
        'Nos actions affectent le monde qui nous entoure'
      ],
      'Arts visuels': [
        'L\'art nous permet d\'exprimer nos idées et nos émotions',
        'Nous pouvons créer de la beauté avec différents matériaux',
        'L\'art nous connecte à notre culture et à celle des autres'
      ],
      'Sciences humaines': [
        'Nous appartenons à différentes communautés',
        'Nos choix affectent nous-mêmes et les autres',
        'Chaque personne est unique et importante'
      ],
      'Formation personnelle et sociale': [
        'Prendre soin de soi et des autres est important',
        'Nos émotions sont normales et nous pouvons les gérer',
        'Nous pouvons faire des choix sains et sécuritaires'
      ]
    };
    
    return bigIdeasMap[subject] || [];
  }
  
  /**
   * Generates subject-appropriate essential questions for Grade 1
   */
  private static generateEssentialQuestions(subject: SubjectType): string[] {
    const questionsMap: Record<SubjectType, string[]> = {
      'Français (Immersion)': [
        'Comment puis-je partager mes idées en français?',
        'Qu\'est-ce qui rend une histoire intéressante?',
        'Comment les mots nous aident-ils à nous comprendre?'
      ],
      'Mathématiques': [
        'Comment les nombres nous aident-ils chaque jour?',
        'Où vois-je des régularités dans ma vie?',
        'Comment puis-je résoudre ce problème?'
      ],
      'Sciences de la nature': [
        'Comment puis-je être un bon scientifique?',
        'Qu\'est-ce que je remarque dans la nature?',
        'Comment puis-je prendre soin de mon environnement?'
      ],
      'Arts visuels': [
        'Comment puis-je exprimer mes idées par l\'art?',
        'Qu\'est-ce qui rend l\'art beau ou intéressant?',
        'Comment les artistes créent-ils leurs œuvres?'
      ],
      'Sciences humaines': [
        'À quelles communautés est-ce que j\'appartiens?',
        'Comment puis-je être un bon ami et voisin?',
        'Qu\'est-ce qui me rend spécial et unique?'
      ],
      'Formation personnelle et sociale': [
        'Comment puis-je prendre soin de moi-même?',
        'Que puis-je faire quand j\'ai des sentiments difficiles?',
        'Comment puis-je rester en sécurité?'
      ]
    };
    
    return questionsMap[subject] || [];
  }
  
  /**
   * Generates base assessment framework for all subjects
   */
  private static generateBaseAssessments(): Assessment[] {
    return [
      {
        id: 'formative-observation',
        type: 'formative',
        method: 'Observation',
        description: 'Observation continue pendant les activités',
        phase: 'action',
        successCriteria: [
          'L\'élève participe activement',
          'L\'élève démontre sa compréhension',
          'L\'élève utilise les stratégies enseignées'
        ]
      },
      {
        id: 'formative-exit-ticket',
        type: 'formative',
        method: 'Billet de sortie',
        description: 'Vérification rapide de la compréhension',
        phase: 'consolidation',
        successCriteria: [
          'L\'élève peut expliquer ce qu\'il a appris',
          'L\'élève peut donner un exemple',
          'L\'élève pose des questions pertinentes'
        ]
      }
    ];
  }
  
  /**
   * Validates that a lesson template meets ETFO standards
   */
  static validateTemplate(template: LessonPlanTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check duration (must be 45 minutes)
    if (template.duration !== 45) {
      errors.push('Duration must be exactly 45 minutes for Grade 1 lessons');
    }
    
    // Check three-part structure timing
    const mindsOnTime = template.activities.mindsOn.reduce((sum, activity) => sum + activity.duration, 0);
    const actionTime = template.activities.action.reduce((sum, activity) => sum + activity.duration, 0);
    const consolidationTime = template.activities.consolidation.reduce((sum, activity) => sum + activity.duration, 0);
    
    if (mindsOnTime < 10 || mindsOnTime > 15) {
      errors.push('Minds On phase must be 10-15 minutes');
    }
    
    if (actionTime < 25 || actionTime > 30) {
      errors.push('Action phase must be 25-30 minutes');
    }
    
    if (consolidationTime < 5 || consolidationTime > 10) {
      errors.push('Consolidation phase must be 5-10 minutes');
    }
    
    // Check required elements
    if (!template.learningGoals || template.learningGoals.length === 0) {
      errors.push('At least one learning goal is required');
    }
    
    if (!template.indigenousPerspectives) {
      errors.push('Indigenous perspectives are mandatory for PEI curriculum');
    }
    
    if (!template.vocabulary || template.vocabulary.length === 0) {
      errors.push('Vocabulary is required for French Immersion lessons');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}