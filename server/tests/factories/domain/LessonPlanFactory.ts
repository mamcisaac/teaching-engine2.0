/**
 * LessonPlanFactory - Creates realistic ETFO-aligned lesson plans
 */

import { ETFOLessonPlan, Prisma } from '@prisma/client';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';

interface LessonTheme {
  title: string;
  titleFr: string;
  materials: string[];
  groupings: string[];
  assessmentTypes: string[];
}

export class LessonPlanFactory extends BaseFactory<ETFOLessonPlan> {
  private createdLessons: string[] = [];

  // Realistic lesson themes by subject
  private lessonThemes: Record<string, LessonTheme[]> = {
    Mathematics: [
      {
        title: 'Exploring Fractions with Pizza',
        titleFr: 'Explorer les fractions avec de la pizza',
        materials: ['paper plates', 'construction paper', 'scissors', 'markers', 'fraction strips'],
        groupings: ['pairs', 'small group'],
        assessmentTypes: ['formative'],
      },
      {
        title: 'Pattern Detective',
        titleFr: 'Détective de motifs',
        materials: ['pattern blocks', 'grid paper', 'colored pencils', 'manipulatives'],
        groupings: ['individual', 'whole class'],
        assessmentTypes: ['diagnostic'],
      },
      {
        title: 'Measurement Olympics',
        titleFr: 'Olympiques de mesure',
        materials: ['measuring tapes', 'rulers', 'scales', 'stopwatches', 'recording sheets'],
        groupings: ['small group', 'pairs'],
        assessmentTypes: ['formative', 'summative'],
      },
    ],
    Language: [
      {
        title: 'Story Elements Adventure',
        titleFr: 'Aventure des éléments d\'histoire',
        materials: ['story books', 'graphic organizers', 'sticky notes', 'chart paper'],
        groupings: ['whole class', 'individual'],
        assessmentTypes: ['formative'],
      },
      {
        title: 'Persuasive Writing Workshop',
        titleFr: 'Atelier d\'écriture persuasive',
        materials: ['mentor texts', 'writing notebooks', 'anchor charts', 'laptops'],
        groupings: ['individual', 'pairs'],
        assessmentTypes: ['summative'],
      },
      {
        title: 'Poetry Café',
        titleFr: 'Café de poésie',
        materials: ['poetry anthologies', 'microphone', 'decorations', 'writing paper'],
        groupings: ['whole class', 'individual'],
        assessmentTypes: ['formative'],
      },
    ],
    Science: [
      {
        title: 'Plant Growth Investigation',
        titleFr: 'Enquête sur la croissance des plantes',
        materials: ['seeds', 'soil', 'cups', 'water', 'measuring tools', 'observation journals'],
        groupings: ['pairs', 'small group'],
        assessmentTypes: ['formative'],
      },
      {
        title: 'Simple Machines Challenge',
        titleFr: 'Défi des machines simples',
        materials: ['building materials', 'pulleys', 'levers', 'wheels', 'design notebooks'],
        groupings: ['small group'],
        assessmentTypes: ['summative'],
      },
      {
        title: 'Weather Station Creation',
        titleFr: 'Création d\'une station météo',
        materials: ['thermometers', 'wind vanes', 'rain gauges', 'recording sheets'],
        groupings: ['small group', 'whole class'],
        assessmentTypes: ['formative'],
      },
    ],
  };

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Create an ETFO lesson plan
   */
  async create(overrides?: Partial<ETFOLessonPlan>): Promise<ETFOLessonPlan> {
    const subject = overrides?.subject || 
      this.faker.helpers.arrayElement(['Mathematics', 'Language', 'Science']);
    
    const gradeData = this.generateGradeLevel();
    const grade = overrides?.grade || gradeData.grade;
    
    const theme = this.faker.helpers.arrayElement(this.lessonThemes[subject] || this.lessonThemes.Mathematics);
    const date = overrides?.date || this.generateSchoolDate({ excludeWeekends: true });
    
    const lesson: ETFOLessonPlan = {
      id: this.faker.string.uuid(),
      userId: overrides?.userId || this.faker.number.int({ min: 1, max: 1000 }),
      title: overrides?.title || theme.title,
      unitPlanId: overrides?.unitPlanId || this.faker.string.uuid(),
      grade,
      subject,
      language: overrides?.language || this.locale,
      date,
      duration: overrides?.duration || this.faker.helpers.arrayElement([30, 40, 50, 60, 75, 90]),
      
      // Three-part lesson structure
      mindsOn: overrides?.mindsOn || this.generateMindsOn(subject, grade),
      action: overrides?.action || this.generateAction(subject, grade, theme),
      consolidation: overrides?.consolidation || this.generateConsolidation(subject, grade),
      
      // Bilingual content
      titleFr: overrides?.titleFr || theme.titleFr,
      mindsOnFr: overrides?.mindsOnFr || this.generateMindsOn(subject, grade, true),
      actionFr: overrides?.actionFr || this.generateAction(subject, grade, theme, true),
      consolidationFr: overrides?.consolidationFr || this.generateConsolidation(subject, grade, true),
      
      // Learning goals
      learningGoals: overrides?.learningGoals || this.generateLearningGoals(subject, grade),
      learningGoalsFr: overrides?.learningGoalsFr || this.generateLearningGoals(subject, grade, true),
      
      // Materials and grouping
      materials: overrides?.materials || theme.materials,
      grouping: overrides?.grouping || this.faker.helpers.arrayElement(theme.groupings),
      
      // Differentiation
      accommodations: overrides?.accommodations || this.generateAccommodations(),
      modifications: overrides?.modifications || this.generateModifications(),
      extensions: overrides?.extensions || this.generateExtensions(),
      
      // Assessment
      assessmentType: overrides?.assessmentType || 
        this.faker.helpers.arrayElement(theme.assessmentTypes) as any,
      assessmentNotes: overrides?.assessmentNotes || this.generateAssessmentNotes(),
      
      // Substitute teacher support
      isSubFriendly: overrides?.isSubFriendly ?? this.faker.datatype.boolean({ probability: 0.7 }),
      subNotes: overrides?.subNotes || 
        (overrides?.isSubFriendly || this.faker.datatype.boolean({ probability: 0.7 }) 
          ? this.generateSubNotes() : null),
      
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as ETFOLessonPlan;

    if (this.prisma && this.options?.persist !== false) {
      const created = await this.prisma.eTFOLessonPlan.create({ data: lesson });
      this.createdLessons.push(created.id);
      return created;
    }

    return lesson;
  }

  /**
   * Generate Minds On section
   */
  private generateMindsOn(subject: string, grade: number, french = false): string {
    const activities = {
      Mathematics: [
        'Number talk: What patterns do you see in these numbers?',
        'Quick mental math warm-up with multiplication facts',
        'Think-Pair-Share: How many ways can you make 100?',
        'Gallery walk of yesterday\'s problem-solving strategies',
      ],
      Language: [
        'Book talk: Share your favorite part from last night\'s reading',
        'Word of the day exploration and connections',
        'Quick write: What makes a good story beginning?',
        'Turn and talk: Predict what will happen next',
      ],
      Science: [
        'Mystery box: What could be inside based on the clues?',
        'KWL chart: What do we know about this topic?',
        'Observation station: What do you notice and wonder?',
        'Science journal: Draw and label your predictions',
      ],
    };

    const frenchActivities = {
      Mathematics: [
        'Causerie mathématique: Quels motifs voyez-vous?',
        'Échauffement de calcul mental',
        'Pense-Parle-Partage: Combien de façons de faire 100?',
        'Visite de galerie des stratégies d\'hier',
      ],
      Language: [
        'Cercle de lecture: Partagez votre partie préférée',
        'Exploration du mot du jour',
        'Écriture rapide: Qu\'est-ce qui fait un bon début?',
        'Discussion: Prédisez ce qui va se passer',
      ],
      Science: [
        'Boîte mystère: Qu\'est-ce qui pourrait être à l\'intérieur?',
        'Tableau SVA: Que savons-nous déjà?',
        'Station d\'observation: Que remarquez-vous?',
        'Journal scientifique: Dessinez vos prédictions',
      ],
    };

    const source = french ? frenchActivities : activities;
    return this.faker.helpers.arrayElement(source[subject] || source.Mathematics);
  }

  /**
   * Generate Action section
   */
  private generateAction(subject: string, grade: number, theme: LessonTheme, french = false): string {
    const templates = [
      `Students will work in ${theme.groupings[0]} to explore ${theme.title.toLowerCase()} using ${theme.materials.slice(0, 3).join(', ')}.`,
      `Through hands-on investigation with ${theme.materials[0]}, students will discover key concepts.`,
      `Using a guided inquiry approach, students will investigate and document their findings.`,
      `Students will engage in collaborative problem-solving using various materials and strategies.`,
    ];

    const frenchTemplates = [
      `Les élèves travailleront en ${theme.groupings[0]} pour explorer ${theme.titleFr.toLowerCase()}.`,
      `Par l\'investigation pratique, les élèves découvriront les concepts clés.`,
      `En utilisant une approche d\'enquête guidée, les élèves documenteront leurs découvertes.`,
      `Les élèves s\'engageront dans la résolution collaborative de problèmes.`,
    ];

    return this.faker.helpers.arrayElement(french ? frenchTemplates : templates);
  }

  /**
   * Generate Consolidation section
   */
  private generateConsolidation(subject: string, grade: number, french = false): string {
    const activities = [
      'Exit ticket: Write one thing you learned and one question you still have',
      'Math congress: Share and compare problem-solving strategies',
      'Gallery walk to view and provide feedback on peer work',
      'Reflection journal: How did today\'s learning connect to what we already know?',
      'Partner discussion: Explain your thinking to a classmate',
      'Whole class debrief: What strategies worked well today?',
    ];

    const frenchActivities = [
      'Billet de sortie: Écrivez une chose apprise et une question',
      'Congrès mathématique: Partagez vos stratégies',
      'Visite de galerie pour voir le travail des pairs',
      'Journal de réflexion: Comment l\'apprentissage se connecte-t-il?',
      'Discussion avec un partenaire: Expliquez votre pensée',
      'Discussion de classe: Quelles stratégies ont bien fonctionné?',
    ];

    return this.faker.helpers.arrayElement(french ? frenchActivities : activities);
  }

  /**
   * Generate learning goals
   */
  private generateLearningGoals(subject: string, grade: number, french = false): string {
    const goals = {
      Mathematics: [
        'I can solve problems using multiple strategies',
        'I can explain my mathematical thinking clearly',
        'I can represent numbers in different ways',
        'I can identify and extend patterns',
      ],
      Language: [
        'I can make connections between texts and my experiences',
        'I can use evidence from the text to support my ideas',
        'I can write with a clear purpose and audience in mind',
        'I can use reading strategies to understand text',
      ],
      Science: [
        'I can make observations and ask scientific questions',
        'I can design and conduct a fair test',
        'I can communicate my findings using scientific vocabulary',
        'I can make predictions based on evidence',
      ],
    };

    const frenchGoals = {
      Mathematics: [
        'Je peux résoudre des problèmes de plusieurs façons',
        'Je peux expliquer ma pensée mathématique',
        'Je peux représenter les nombres différemment',
        'Je peux identifier et continuer des suites',
      ],
      Language: [
        'Je peux faire des liens entre les textes et mes expériences',
        'Je peux utiliser des preuves du texte',
        'Je peux écrire avec un but clair',
        'Je peux utiliser des stratégies de lecture',
      ],
      Science: [
        'Je peux faire des observations scientifiques',
        'Je peux concevoir une expérience juste',
        'Je peux communiquer mes découvertes',
        'Je peux faire des prédictions basées sur des preuves',
      ],
    };

    const source = french ? frenchGoals : goals;
    const selected = this.faker.helpers.arrayElements(source[subject] || source.Mathematics, 2);
    return selected.join('; ');
  }

  /**
   * Generate accommodations
   */
  private generateAccommodations(): string[] {
    return this.faker.helpers.arrayElements([
      'Provide visual supports and anchor charts',
      'Allow extra time for task completion',
      'Offer choice in demonstrating learning',
      'Provide manipulatives and concrete materials',
      'Break tasks into smaller steps',
      'Offer preferential seating',
      'Provide written instructions along with verbal',
      'Allow use of assistive technology',
      'Provide graphic organizers',
      'Offer frequent check-ins and feedback',
    ], this.faker.number.int({ min: 2, max: 4 }));
  }

  /**
   * Generate modifications
   */
  private generateModifications(): string[] {
    return this.faker.helpers.arrayElements([
      'Reduce number of questions/problems',
      'Simplify language in instructions',
      'Provide alternative assessment format',
      'Adjust learning goals to student level',
      'Provide pre-taught vocabulary',
      'Offer simplified texts at appropriate reading level',
      'Focus on essential curriculum expectations only',
    ], this.faker.number.int({ min: 1, max: 3 }));
  }

  /**
   * Generate extensions
   */
  private generateExtensions(): string[] {
    return this.faker.helpers.arrayElements([
      'Create a teaching video explaining the concept',
      'Design a challenge problem for classmates',
      'Research real-world applications',
      'Mentor a peer who needs support',
      'Create a game based on today\'s learning',
      'Write an article for the class newsletter',
      'Design an experiment to test further',
      'Create a presentation for younger students',
    ], this.faker.number.int({ min: 1, max: 3 }));
  }

  /**
   * Generate assessment notes
   */
  private generateAssessmentNotes(): string {
    const notes = [
      'Observe student strategies during problem-solving',
      'Use checklist to track skill development',
      'Conference with students about their thinking',
      'Review exit tickets for understanding',
      'Document observations in anecdotal notes',
      'Use rubric to assess final products',
      'Peer assessment using success criteria',
      'Self-assessment reflection forms',
    ];

    return this.faker.helpers.arrayElement(notes);
  }

  /**
   * Generate substitute teacher notes
   */
  private generateSubNotes(): string {
    const notes = [
      'All materials are in the blue bin on my desk. Answer key is in the top drawer.',
      'Students know the routine. Helper chart is on the wall. Emergency procedures in red binder.',
      'Partner list is on the clipboard. Students can help explain the activity.',
      'Extension activities are in the "Early Finishers" folder if needed.',
      'Class schedule is posted. Students have assigned seats - see seating chart.',
    ];

    return this.faker.helpers.arrayElement(notes);
  }

  /**
   * Create a week of lessons
   */
  async createWeekOfLessons(options: {
    userId: number;
    unitPlanId: string;
    grade: number;
    subject: string;
    startDate: Date;
  }): Promise<ETFOLessonPlan[]> {
    const lessons: ETFOLessonPlan[] = [];
    const currentDate = new Date(options.startDate);

    for (let i = 0; i < 5; i++) { // Monday to Friday
      // Skip weekends
      if (currentDate.getDay() === 0) currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() === 6) currentDate.setDate(currentDate.getDate() + 2);

      const lesson = await this.create({
        userId: options.userId,
        unitPlanId: options.unitPlanId,
        grade: options.grade,
        subject: options.subject,
        date: new Date(currentDate),
      });

      lessons.push(lesson);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return lessons;
  }

  /**
   * Create substitute-friendly lessons
   */
  async createSubFriendlyLessons(count: number, options?: {
    grade?: number;
    subject?: string;
  }): Promise<ETFOLessonPlan[]> {
    const lessons: ETFOLessonPlan[] = [];

    for (let i = 0; i < count; i++) {
      const lesson = await this.create({
        ...options,
        isSubFriendly: true,
        subNotes: this.generateDetailedSubNotes(),
        materials: this.faker.helpers.arrayElements([
          'worksheets (copies made - in folder)',
          'textbooks (class set in cupboard)',
          'pencils and erasers',
          'chart paper (in supply closet)',
          'markers (in desk drawer)',
        ], 3),
        grouping: 'individual', // Easier for subs
      });
      lessons.push(lesson);
    }

    return lessons;
  }

  /**
   * Generate detailed substitute notes
   */
  private generateDetailedSubNotes(): string {
    const routines = [
      'Morning routine: Attendance in folder, lunch count on board',
      'Bathroom: Sign out on door, one at a time',
      'Transitions: Use clapping pattern or bell',
      'Pack up: Start 10 minutes before dismissal',
    ];

    const helpful = [
      'Helpful students: Emma (front row), Marcus (by window)',
      'EA support: Mrs. Johnson comes at 10:30',
      'Duty schedule: Recess duty today, vest in closet',
      'Special needs: See confidential folder in drawer',
    ];

    return `${this.faker.helpers.arrayElement(routines)}. ${this.faker.helpers.arrayElement(helpful)}. 
      All materials prepared and labeled. Answer keys in manila envelope. 
      Emergency lesson in "SUB PLANS" binder if needed. My cell: 555-0123.`;
  }

  /**
   * Cleanup created lessons
   */
  async cleanup(): Promise<void> {
    if (this.prisma && this.createdLessons.length > 0) {
      await this.prisma.eTFOLessonPlan.deleteMany({
        where: { id: { in: this.createdLessons } }
      });
      this.createdLessons = [];
    }
  }
}