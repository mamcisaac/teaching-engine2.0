/**
 * LongRangePlanFactory - Creates long-range (yearly/term) plans
 */

import { LongRangePlan, Prisma } from '@prisma/client';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';

export class LongRangePlanFactory extends BaseFactory<LongRangePlan> {
  private createdPlans: string[] = [];

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Create a long-range plan
   */
  async create(overrides?: Partial<LongRangePlan>): Promise<LongRangePlan> {
    const schoolYear = this.generateSchoolYear();
    const gradeData = this.generateGradeLevel();
    const subject = overrides?.subject || 
      this.faker.helpers.arrayElement(['Mathematics', 'Language', 'Science', 'Social Studies']);

    const themes = this.generateYearThemes(subject);
    
    const plan: LongRangePlan = {
      id: this.faker.string.uuid(),
      userId: overrides?.userId || this.faker.number.int({ min: 1, max: 1000 }),
      title: overrides?.title || `Grade ${gradeData.grade} ${subject} - ${schoolYear.year}`,
      academicYear: overrides?.academicYear || schoolYear.year,
      term: overrides?.term || 'Full Year',
      grade: overrides?.grade || gradeData.grade,
      subject,
      
      description: overrides?.description || 
        `Comprehensive ${subject} program for Grade ${gradeData.grade} students`,
      goals: overrides?.goals || this.generateYearGoals(subject, gradeData.grade),
      themes: overrides?.themes || themes,
      
      overarchingQuestions: overrides?.overarchingQuestions || 
        this.generateOverarchingQuestions(subject),
      assessmentOverview: overrides?.assessmentOverview || 
        this.generateAssessmentOverview(),
      resourceNeeds: overrides?.resourceNeeds || 
        this.generateResourceNeeds(subject),
      professionalGoals: overrides?.professionalGoals || 
        this.generateProfessionalGoals(),
      
      // Bilingual support
      titleFr: overrides?.titleFr || 
        `${gradeData.grade}e année ${this.translateSubject(subject)} - ${schoolYear.year}`,
      descriptionFr: overrides?.descriptionFr || 
        `Programme complet de ${this.translateSubject(subject)} pour les élèves de ${gradeData.grade}e année`,
      goalsFr: overrides?.goalsFr || 
        this.generateYearGoals(subject, gradeData.grade, true),
      
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as LongRangePlan;

    if (this.prisma && this.options?.persist !== false) {
      const created = await this.prisma.longRangePlan.create({ data: plan });
      this.createdPlans.push(created.id);
      return created;
    }

    return plan;
  }

  /**
   * Generate year-long themes
   */
  private generateYearThemes(subject: string): string[] {
    const themes: Record<string, string[][]> = {
      Mathematics: [
        ['Number Relationships', 'Problem Solving Strategies', 'Mathematical Communication'],
        ['Patterns and Algebra', 'Measurement in Our World', 'Geometric Thinking'],
        ['Data and Probability', 'Financial Literacy', 'Computational Fluency'],
      ],
      Language: [
        ['Building Reading Communities', 'Exploring Genres', 'Author Studies'],
        ['Writing for Different Purposes', 'Media Literacy', 'Oral Communication'],
        ['Research and Inquiry', 'Poetry and Creative Expression', 'Critical Literacy'],
      ],
      Science: [
        ['Scientific Inquiry Process', 'Living Systems', 'Environmental Stewardship'],
        ['Matter and Energy', 'Structures and Mechanisms', 'Earth and Space'],
        ['Technology and Innovation', 'Health and Safety', 'STEM Connections'],
      ],
      'Social Studies': [
        ['Communities Past and Present', 'Geography and Mapping', 'Cultural Diversity'],
        ['Government and Citizenship', 'Economic Understanding', 'Historical Thinking'],
        ['Global Connections', 'Environmental Responsibility', 'Social Justice'],
      ],
    };

    const subjectThemes = themes[subject] || themes.Mathematics;
    return subjectThemes[this.faker.number.int({ min: 0, max: 2 })];
  }

  /**
   * Generate year goals
   */
  private generateYearGoals(subject: string, grade: number, french = false): string {
    const goals = {
      Mathematics: [
        'Develop strong number sense and computational fluency',
        'Build problem-solving strategies and mathematical reasoning',
        'Apply mathematics to real-world situations',
        'Communicate mathematical thinking clearly',
      ],
      Language: [
        'Foster a love of reading and literature',
        'Develop strong writing skills across genres',
        'Build oral communication confidence',
        'Develop critical media literacy skills',
      ],
      Science: [
        'Develop scientific inquiry skills',
        'Understand fundamental scientific concepts',
        'Make connections between science and daily life',
        'Foster environmental responsibility',
      ],
    };

    const frenchGoals = {
      Mathematics: [
        'Développer le sens du nombre et la fluidité',
        'Construire des stratégies de résolution de problèmes',
        'Appliquer les mathématiques aux situations réelles',
        'Communiquer la pensée mathématique clairement',
      ],
      Language: [
        'Favoriser l\'amour de la lecture',
        'Développer des compétences d\'écriture',
        'Construire la confiance en communication orale',
        'Développer la littératie médiatique critique',
      ],
      Science: [
        'Développer les compétences d\'enquête scientifique',
        'Comprendre les concepts scientifiques fondamentaux',
        'Faire des liens entre la science et la vie',
        'Favoriser la responsabilité environnementale',
      ],
    };

    const source = french ? frenchGoals : goals;
    const selected = this.faker.helpers.arrayElements(
      source[subject] || source.Mathematics, 
      3
    );
    return selected.join('\n');
  }

  /**
   * Generate overarching questions
   */
  private generateOverarchingQuestions(subject: string): string {
    const questions: Record<string, string[]> = {
      Mathematics: [
        'How does mathematics help us understand and describe our world?',
        'What strategies can we use to solve complex problems?',
        'How are mathematical concepts connected to each other?',
      ],
      Language: [
        'How do stories shape our understanding of ourselves and others?',
        'What makes communication effective?',
        'How can we use language to make a positive impact?',
      ],
      Science: [
        'How do scientists investigate and understand the natural world?',
        'What is our responsibility to the environment?',
        'How does science impact our daily lives?',
      ],
      'Social Studies': [
        'How do communities change over time?',
        'What does it mean to be a responsible citizen?',
        'How are we connected to people around the world?',
      ],
    };

    return (questions[subject] || questions.Mathematics).join('\n');
  }

  /**
   * Generate assessment overview
   */
  private generateAssessmentOverview(): string {
    const components = [
      'Diagnostic assessments at the beginning of each unit',
      'Ongoing formative assessment through observations and conferences',
      'Portfolio development throughout the year',
      'Performance tasks aligned with curriculum expectations',
      'Student self-assessment and goal setting',
      'Summative assessments at unit conclusions',
      'Triangulation of assessment data (observations, conversations, products)',
    ];

    return this.faker.helpers.arrayElements(components, 5).join('\n');
  }

  /**
   * Generate resource needs
   */
  private generateResourceNeeds(subject: string): string {
    const resources: Record<string, string[]> = {
      Mathematics: [
        'Math manipulatives (base-10 blocks, fraction strips, geometric solids)',
        'Graphing tools and calculators',
        'Math games and activity cards',
        'Problem-solving posters and anchor charts',
        'Digital math tools and apps',
      ],
      Language: [
        'Diverse classroom library (fiction and non-fiction)',
        'Writing materials and publishing supplies',
        'Word study resources',
        'Digital storytelling tools',
        'Mentor texts across genres',
      ],
      Science: [
        'Science equipment and lab materials',
        'Living organisms for life science units',
        'Building and construction materials',
        'Digital microscopes and sensors',
        'Science reference books and posters',
      ],
      'Social Studies': [
        'Maps, globes, and atlases',
        'Historical artifacts and primary sources',
        'Community connection resources',
        'Digital mapping tools',
        'Cultural materials and resources',
      ],
    };

    const selected = resources[subject] || resources.Mathematics;
    return this.faker.helpers.arrayElements(selected, 4).join('\n');
  }

  /**
   * Generate professional goals
   */
  private generateProfessionalGoals(): string {
    const goals = [
      'Integrate more technology into daily lessons',
      'Develop stronger differentiation strategies',
      'Improve assessment for learning practices',
      'Build stronger home-school connections',
      'Enhance inquiry-based learning opportunities',
      'Develop culturally responsive teaching practices',
      'Strengthen cross-curricular connections',
      'Improve classroom management strategies',
    ];

    return this.faker.helpers.arrayElements(goals, 3).join('\n');
  }

  /**
   * Translate subject names
   */
  private translateSubject(subject: string): string {
    const translations: Record<string, string> = {
      Mathematics: 'Mathématiques',
      Language: 'Français',
      Science: 'Sciences',
      'Social Studies': 'Études sociales',
      'The Arts': 'Arts',
      'Physical Education': 'Éducation physique',
    };
    return translations[subject] || subject;
  }

  /**
   * Create a multi-year progression
   */
  async createMultiYearProgression(options: {
    userId: number;
    startGrade: number;
    endGrade: number;
    subject: string;
  }): Promise<LongRangePlan[]> {
    const plans: LongRangePlan[] = [];
    const baseYear = new Date().getFullYear();

    for (let grade = options.startGrade; grade <= options.endGrade; grade++) {
      const yearOffset = grade - options.startGrade;
      const academicYear = `${baseYear + yearOffset}-${baseYear + yearOffset + 1}`;
      
      const plan = await this.create({
        userId: options.userId,
        grade,
        subject: options.subject,
        academicYear,
        title: `Grade ${grade} ${options.subject} Progression`,
      });
      
      plans.push(plan);
    }

    return plans;
  }

  /**
   * Create term-specific plans
   */
  async createTermPlans(options: {
    userId: number;
    grade: number;
    subjects: string[];
    academicYear: string;
  }): Promise<LongRangePlan[]> {
    const plans: LongRangePlan[] = [];
    const terms = ['Term 1 (Sep-Nov)', 'Term 2 (Dec-Feb)', 'Term 3 (Mar-Jun)'];

    for (const subject of options.subjects) {
      for (const term of terms) {
        const plan = await this.create({
          userId: options.userId,
          grade: options.grade,
          subject,
          academicYear: options.academicYear,
          term,
          title: `Grade ${options.grade} ${subject} - ${term}`,
        });
        plans.push(plan);
      }
    }

    return plans;
  }

  /**
   * Cleanup created plans
   */
  async cleanup(): Promise<void> {
    if (this.prisma && this.createdPlans.length > 0) {
      await this.prisma.longRangePlan.deleteMany({
        where: { id: { in: this.createdPlans } }
      });
      this.createdPlans = [];
    }
  }
}