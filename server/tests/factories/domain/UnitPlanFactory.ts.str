/**
 * UnitPlanFactory - Creates realistic unit plans aligned with ETFO standards
 */

import { UnitPlan, Prisma } from '@prisma/client';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';

interface UnitTheme {
  title: string;
  titleFr: string;
  bigIdeas: string[];
  bigIdeasFr: string[];
  essentialQuestions: string[];
  essentialQuestionsFr: string[];
  crossCurricular: string[];
  culminatingTask: string;
  culminatingTaskFr: string;
}

export class UnitPlanFactory extends BaseFactory<UnitPlan> {
  private createdUnits: string[] = [];

  // Realistic unit themes by subject and grade level
  private unitThemes: Record<string, UnitTheme[]> = {
    Mathematics: [
      {
        title: 'Building Our Number Sense',
        titleFr: 'Construire notre sens des nombres',
        bigIdeas: [
          'Numbers help us understand and describe our world',
          'There are many ways to represent and work with numbers',
          'Patterns exist everywhere in mathematics',
        ],
        bigIdeasFr: [
          'Les nombres nous aident à comprendre notre monde',
          'Il y a plusieurs façons de représenter les nombres',
          'Les régularités existent partout en mathématiques',
        ],
        essentialQuestions: [
          'How do numbers help us in daily life?',
          'What patterns can we find in numbers?',
          'How can we solve problems in different ways?',
        ],
        essentialQuestionsFr: [
          'Comment les nombres nous aident-ils?',
          'Quelles régularités trouvons-nous?',
          'Comment résoudre des problèmes différemment?',
        ],
        crossCurricular: ['Science (measurement)', 'Art (patterns)', 'Social Studies (data)'],
        culminatingTask: 'Design a classroom store using number concepts',
        culminatingTaskFr: 'Concevoir un magasin de classe avec les nombres',
      },
      {
        title: 'Geometry in Our World',
        titleFr: 'La géométrie dans notre monde',
        bigIdeas: [
          'Geometric shapes and patterns are found in nature and human designs',
          'Understanding properties helps us classify and create',
          'Spatial reasoning helps us navigate our environment',
        ],
        bigIdeasFr: [
          'Les formes géométriques se trouvent dans la nature',
          'Comprendre les propriétés nous aide à classifier',
          'Le raisonnement spatial nous aide à naviguer',
        ],
        essentialQuestions: [
          'Where do we see geometry in our community?',
          'How do architects use geometric principles?',
          'What makes a structure strong and stable?',
        ],
        essentialQuestionsFr: [
          'Où voyons-nous la géométrie dans notre communauté?',
          'Comment les architectes utilisent-ils la géométrie?',
          'Qu\'est-ce qui rend une structure solide?',
        ],
        crossCurricular: ['Art (design)', 'Science (structures)', 'Technology (3D modeling)'],
        culminatingTask: 'Build a model playground using geometric principles',
        culminatingTaskFr: 'Construire un terrain de jeu modèle avec la géométrie',
      },
    ],
    Language: [
      {
        title: 'Stories That Connect Us',
        titleFr: 'Des histoires qui nous connectent',
        bigIdeas: [
          'Stories help us understand ourselves and others',
          'Every culture has important stories to share',
          'We can learn from characters\' experiences',
        ],
        bigIdeasFr: [
          'Les histoires nous aident à nous comprendre',
          'Chaque culture a des histoires importantes',
          'Nous apprenons des expériences des personnages',
        ],
        essentialQuestions: [
          'How do stories shape who we are?',
          'What makes a story memorable?',
          'How can we share our own stories effectively?',
        ],
        essentialQuestionsFr: [
          'Comment les histoires nous façonnent-elles?',
          'Qu\'est-ce qui rend une histoire mémorable?',
          'Comment partager nos propres histoires?',
        ],
        crossCurricular: ['Social Studies (culture)', 'Drama (storytelling)', 'Art (illustration)'],
        culminatingTask: 'Create a class anthology of personal narratives',
        culminatingTaskFr: 'Créer une anthologie de récits personnels',
      },
      {
        title: 'Persuasion and Media',
        titleFr: 'Persuasion et médias',
        bigIdeas: [
          'Media messages are constructed with specific purposes',
          'Critical thinking helps us analyze what we see and hear',
          'We can create media to share our ideas responsibly',
        ],
        bigIdeasFr: [
          'Les messages médiatiques ont des buts spécifiques',
          'La pensée critique nous aide à analyser',
          'Nous pouvons créer des médias responsables',
        ],
        essentialQuestions: [
          'How do advertisers try to influence us?',
          'What makes an argument convincing?',
          'How can we be responsible digital citizens?',
        ],
        essentialQuestionsFr: [
          'Comment les publicitaires nous influencent-ils?',
          'Qu\'est-ce qui rend un argument convaincant?',
          'Comment être des citoyens numériques responsables?',
        ],
        crossCurricular: ['Health (media influence)', 'Technology (digital creation)', 'Social Studies (citizenship)'],
        culminatingTask: 'Design a public service announcement campaign',
        culminatingTaskFr: 'Concevoir une campagne d\'intérêt public',
      },
    ],
    Science: [
      {
        title: 'Habitats and Communities',
        titleFr: 'Habitats et communautés',
        bigIdeas: [
          'All living things depend on their environment',
          'Changes in habitats affect living things',
          'Humans have a responsibility to protect habitats',
        ],
        bigIdeasFr: [
          'Tous les êtres vivants dépendent de leur environnement',
          'Les changements affectent les êtres vivants',
          'Nous devons protéger les habitats',
        ],
        essentialQuestions: [
          'How do living things depend on each other?',
          'What happens when habitats change?',
          'How can we protect local ecosystems?',
        ],
        essentialQuestionsFr: [
          'Comment les êtres vivants dépendent-ils les uns des autres?',
          'Que se passe-t-il quand les habitats changent?',
          'Comment protéger les écosystèmes locaux?',
        ],
        crossCurricular: ['Geography (environments)', 'Art (nature)', 'Language (research reports)'],
        culminatingTask: 'Create a conservation action plan for a local habitat',
        culminatingTaskFr: 'Créer un plan de conservation pour un habitat local',
      },
      {
        title: 'Forces and Simple Machines',
        titleFr: 'Forces et machines simples',
        bigIdeas: [
          'Forces affect movement and can be measured',
          'Simple machines make work easier',
          'Understanding forces helps us solve problems',
        ],
        bigIdeasFr: [
          'Les forces affectent le mouvement',
          'Les machines simples facilitent le travail',
          'Comprendre les forces aide à résoudre des problèmes',
        ],
        essentialQuestions: [
          'How do forces affect our daily activities?',
          'How have simple machines changed human life?',
          'How can we use forces to solve problems?',
        ],
        essentialQuestionsFr: [
          'Comment les forces affectent-elles nos activités?',
          'Comment les machines ont-elles changé la vie?',
          'Comment utiliser les forces pour résoudre des problèmes?',
        ],
        crossCurricular: ['History (inventions)', 'Math (measurement)', 'Technology (design)'],
        culminatingTask: 'Design and build a Rube Goldberg machine',
        culminatingTaskFr: 'Concevoir et construire une machine de Rube Goldberg',
      },
    ],
  };

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Create a unit plan
   */
  async create(overrides?: Partial<UnitPlan>): Promise<UnitPlan> {
    const subject = overrides?.subject || 
      this.faker.helpers.arrayElement(['Mathematics', 'Language', 'Science']);
    
    const theme = this.faker.helpers.arrayElement(this.unitThemes[subject] || this.unitThemes.Mathematics);
    const duration = this.faker.number.int({ min: 15, max: 30 }); // days
    const startDate = overrides?.startDate || 
      this.generateSchoolDate({ excludeWeekends: true });
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    
    // Skip weekends in end date
    while (endDate.getDay() === 0 || endDate.getDay() === 6) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const unit: UnitPlan = {
      id: this.faker.string.uuid(),
      userId: overrides?.userId || this.faker.number.int({ min: 1, max: 1000 }),
      title: overrides?.title || theme.title,
      longRangePlanId: overrides?.longRangePlanId || this.faker.string.uuid(),
      
      description: overrides?.description || this.generateUnitDescription(theme, subject),
      bigIdeas: overrides?.bigIdeas || theme.bigIdeas.join('\n'),
      essentialQuestions: overrides?.essentialQuestions || theme.essentialQuestions,
      
      startDate,
      endDate,
      estimatedHours: overrides?.estimatedHours || duration * 5, // 5 hours per day
      
      // Bilingual support
      titleFr: overrides?.titleFr || theme.titleFr,
      descriptionFr: overrides?.descriptionFr || this.generateUnitDescription(theme, subject, true),
      bigIdeasFr: overrides?.bigIdeasFr || theme.bigIdeasFr.join('\n'),
      
      // Assessment planning
      assessmentPlan: overrides?.assessmentPlan || this.generateAssessmentPlan(),
      successCriteria: overrides?.successCriteria || this.generateSuccessCriteria(subject),
      
      // ETFO-aligned fields
      crossCurricularConnections: overrides?.crossCurricularConnections || 
        theme.crossCurricular.join('; '),
      learningSkills: overrides?.learningSkills || this.generateLearningSkills(),
      culminatingTask: overrides?.culminatingTask || theme.culminatingTask,
      keyVocabulary: overrides?.keyVocabulary || this.generateKeyVocabulary(subject),
      priorKnowledge: overrides?.priorKnowledge || this.generatePriorKnowledge(subject),
      parentCommunicationPlan: overrides?.parentCommunicationPlan || 
        this.generateParentCommunication(),
      fieldTripsAndGuestSpeakers: overrides?.fieldTripsAndGuestSpeakers || 
        this.generateFieldTrips(subject),
      differentiationStrategies: overrides?.differentiationStrategies || 
        this.generateDifferentiation(),
      indigenousPerspectives: overrides?.indigenousPerspectives || 
        this.generateIndigenousPerspectives(subject),
      environmentalEducation: overrides?.environmentalEducation || 
        this.generateEnvironmentalConnections(subject),
      socialJusticeConnections: overrides?.socialJusticeConnections || 
        this.generateSocialJustice(subject),
      technologyIntegration: overrides?.technologyIntegration || 
        this.generateTechnologyIntegration(),
      communityConnections: overrides?.communityConnections || 
        this.generateCommunityConnections(),
      
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as UnitPlan;

    if (this.prisma && this.options?.persist !== false) {
      const created = await this.prisma.unitPlan.create({ data: unit });
      this.createdUnits.push(created.id);
      return created;
    }

    return unit;
  }

  /**
   * Generate unit description
   */
  private generateUnitDescription(theme: UnitTheme, subject: string, french = false): string {
    const templates = [
      `This unit explores ${theme.title.toLowerCase()} through hands-on investigations and collaborative learning experiences.`,
      `Students will develop deep understanding of key concepts while making connections to real-world applications.`,
      `Through inquiry-based learning, students will discover important principles and develop critical thinking skills.`,
    ];

    const frenchTemplates = [
      `Cette unité explore ${theme.titleFr.toLowerCase()} à travers des investigations pratiques.`,
      `Les élèves développeront une compréhension approfondie des concepts clés.`,
      `Par l'apprentissage par enquête, les élèves découvriront des principes importants.`,
    ];

    return this.faker.helpers.arrayElement(french ? frenchTemplates : templates);
  }

  /**
   * Generate assessment plan
   */
  private generateAssessmentPlan(): string {
    const components = [
      'Diagnostic: Pre-unit concept map and discussion',
      'Formative: Daily exit tickets, observations, and conferences',
      'Summative: Performance task with rubric, unit test',
      'Self-assessment: Learning goals checklist and reflection journal',
      'Peer assessment: Gallery walks and structured feedback',
    ];

    return this.faker.helpers.arrayElements(components, 3).join('\n');
  }

  /**
   * Generate success criteria
   */
  private generateSuccessCriteria(subject: string): string[] {
    const criteria: Record<string, string[]> = {
      Mathematics: [
        'I can explain my problem-solving strategy clearly',
        'I can use mathematical vocabulary correctly',
        'I can show my work in an organized way',
        'I can check my answer using a different method',
        'I can connect new learning to what I already know',
      ],
      Language: [
        'I can support my ideas with evidence from texts',
        'I can organize my writing with clear paragraphs',
        'I can use descriptive language effectively',
        'I can revise my work based on feedback',
        'I can make connections between different texts',
      ],
      Science: [
        'I can make detailed observations and record data',
        'I can design a fair test with variables',
        'I can draw conclusions based on evidence',
        'I can use scientific vocabulary accurately',
        'I can explain cause and effect relationships',
      ],
    };

    return this.faker.helpers.arrayElements(criteria[subject] || criteria.Mathematics, 4);
  }

  /**
   * Generate learning skills
   */
  private generateLearningSkills(): string[] {
    const skills = [
      'Responsibility - Complete tasks and homework on time',
      'Organization - Keep materials and workspace organized',
      'Independent Work - Stay on task and use time wisely',
      'Collaboration - Work effectively in groups',
      'Initiative - Ask questions and seek help when needed',
      'Self-Regulation - Manage emotions and behavior',
    ];

    return this.faker.helpers.arrayElements(skills, 3);
  }

  /**
   * Generate key vocabulary
   */
  private generateKeyVocabulary(subject: string): string[] {
    const vocabulary: Record<string, string[]> = {
      Mathematics: [
        'estimate', 'calculate', 'pattern', 'sequence', 'equation',
        'variable', 'perimeter', 'area', 'volume', 'fraction',
        'decimal', 'percent', 'ratio', 'proportion', 'integer',
      ],
      Language: [
        'narrative', 'perspective', 'theme', 'character', 'setting',
        'conflict', 'resolution', 'metaphor', 'simile', 'inference',
        'summary', 'evidence', 'argument', 'persuasive', 'audience',
      ],
      Science: [
        'hypothesis', 'experiment', 'variable', 'observation', 'data',
        'conclusion', 'ecosystem', 'habitat', 'adaptation', 'force',
        'energy', 'matter', 'solution', 'mixture', 'cycle',
      ],
    };

    return this.faker.helpers.arrayElements(vocabulary[subject] || vocabulary.Science, 10);
  }

  /**
   * Generate prior knowledge requirements
   */
  private generatePriorKnowledge(subject: string): string {
    const templates = {
      Mathematics: 'Students should be comfortable with basic operations and place value to 1000.',
      Language: 'Students should be able to read grade-level texts and write paragraph responses.',
      Science: 'Students should understand basic scientific method and observation skills.',
    };

    return templates[subject] || templates.Mathematics;
  }

  /**
   * Generate parent communication plan
   */
  private generateParentCommunication(): string {
    const options = [
      'Weekly newsletter highlighting learning goals and home extensions',
      'Unit launch letter with overview and ways to support at home',
      'Mid-unit update with student work samples and progress notes',
      'Invitation to culminating task presentation/celebration',
      'Home learning suggestions and conversation starters',
    ];

    return this.faker.helpers.arrayElements(options, 2).join('; ');
  }

  /**
   * Generate field trips and guest speakers
   */
  private generateFieldTrips(subject: string): string {
    const options: Record<string, string[]> = {
      Mathematics: [
        'Visit to local bank to learn about money math',
        'Architecture firm to explore geometry in design',
        'Grocery store for real-world problem solving',
        'Guest speaker: Engineer or architect',
      ],
      Language: [
        'Library visit with author reading',
        'Local newspaper or radio station tour',
        'Theater performance or storyteller visit',
        'Guest speaker: Local author or journalist',
      ],
      Science: [
        'Conservation area for habitat study',
        'Science center hands-on workshop',
        'Local environmental organization visit',
        'Guest speaker: Environmental scientist',
      ],
    };

    return this.faker.helpers.arrayElement(options[subject] || options.Science);
  }

  /**
   * Generate differentiation strategies
   */
  private generateDifferentiation(): string[] {
    return [
      'Tiered assignments based on readiness levels',
      'Choice boards for demonstrating understanding',
      'Flexible grouping for different activities',
      'Multi-sensory learning opportunities',
      'Technology tools for diverse learning needs',
      'Modified expectations for exceptional learners',
    ];
  }

  /**
   * Generate Indigenous perspectives
   */
  private generateIndigenousPerspectives(subject: string): string {
    const perspectives: Record<string, string> = {
      Mathematics: 'Explore Indigenous counting systems and geometric patterns in traditional art',
      Language: 'Include Indigenous stories and oral traditions in our narrative study',
      Science: 'Learn from Indigenous knowledge about local ecosystems and sustainability',
    };

    return perspectives[subject] || perspectives.Science;
  }

  /**
   * Generate environmental connections
   */
  private generateEnvironmentalConnections(subject: string): string {
    const connections: Record<string, string> = {
      Mathematics: 'Calculate environmental footprints and analyze data on conservation',
      Language: 'Read and write about environmental issues and solutions',
      Science: 'Direct study of environmental systems and human impact',
    };

    return connections[subject] || connections.Science;
  }

  /**
   * Generate social justice connections
   */
  private generateSocialJustice(subject: string): string {
    const connections: Record<string, string> = {
      Mathematics: 'Analyze data on equity issues and fair distribution of resources',
      Language: 'Explore diverse voices and perspectives in literature',
      Science: 'Examine environmental justice and access to clean resources',
    };

    return connections[subject] || connections.Language;
  }

  /**
   * Generate technology integration
   */
  private generateTechnologyIntegration(): string {
    const options = [
      'Digital portfolios to document learning journey',
      'Video creation for explaining concepts',
      'Online collaboration tools for group projects',
      'Educational apps for skill practice',
      'Research using safe, curated websites',
      'Digital presentations for sharing learning',
    ];

    return this.faker.helpers.arrayElements(options, 2).join('; ');
  }

  /**
   * Generate community connections
   */
  private generateCommunityConnections(): string {
    const options = [
      'Partner with local library for research support',
      'Connect with community elders for wisdom sharing',
      'Collaborate with local businesses on real-world problems',
      'Share learning at community center or senior home',
      'Participate in community service projects',
    ];

    return this.faker.helpers.arrayElement(options);
  }

  /**
   * Create a term's worth of units
   */
  async createTermUnits(options: {
    userId: number;
    longRangePlanId: string;
    term: number;
    grade: number;
    subject: string;
  }): Promise<UnitPlan[]> {
    const units: UnitPlan[] = [];
    const unitsPerTerm = this.faker.number.int({ min: 3, max: 5 });
    
    let currentDate = new Date();
    // Set to start of term
    if (options.term === 1) {
      currentDate = new Date(currentDate.getFullYear(), 8, 1); // Sept 1
    } else if (options.term === 2) {
      currentDate = new Date(currentDate.getFullYear(), 11, 1); // Dec 1
    } else {
      currentDate = new Date(currentDate.getFullYear() + 1, 2, 1); // Mar 1
    }

    for (let i = 0; i < unitsPerTerm; i++) {
      const unit = await this.create({
        userId: options.userId,
        longRangePlanId: options.longRangePlanId,
        startDate: new Date(currentDate),
        title: `Unit ${i + 1}: ${this.faker.helpers.arrayElement(this.unitThemes[options.subject] || this.unitThemes.Mathematics).title}`,
      });
      
      units.push(unit);
      
      // Move to next unit start date
      currentDate = new Date(unit.endDate);
      currentDate.setDate(currentDate.getDate() + 3); // Small gap between units
    }

    return units;
  }

  /**
   * Create integrated units across subjects
   */
  async createIntegratedUnit(options: {
    userId: number;
    longRangePlanId: string;
    subjects: string[];
    theme: string;
  }): Promise<UnitPlan[]> {
    const units: UnitPlan[] = [];
    const startDate = this.generateSchoolDate({ excludeWeekends: true });

    for (const subject of options.subjects) {
      const unit = await this.create({
        userId: options.userId,
        longRangePlanId: options.longRangePlanId,
        title: `${options.theme} - ${subject} Focus`,
        description: `Integrated unit exploring ${options.theme} through ${subject}`,
        startDate,
        crossCurricularConnections: `Integrated with ${options.subjects.filter(s => s !== subject).join(', ')}`,
      });
      units.push(unit);
    }

    return units;
  }

  /**
   * Cleanup created units
   */
  async cleanup(): Promise<void> {
    if (this.prisma && this.createdUnits.length > 0) {
      await this.prisma.unitPlan.deleteMany({
        where: { id: { in: this.createdUnits } }
      });
      this.createdUnits = [];
    }
  }
}