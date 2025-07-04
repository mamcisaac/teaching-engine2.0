/**
 * CurriculumFactory - Creates realistic Ontario curriculum data
 */

import { CurriculumExpectation, Prisma } from '@prisma/client';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';

interface CurriculumData {
  strands: {
    en: string;
    fr: string;
    substrands?: { en: string; fr: string }[];
  }[];
  expectations: {
    en: string[];
    fr: string[];
  };
}

export class CurriculumFactory extends BaseFactory<CurriculumExpectation> {
  private createdExpectations: string[] = [];
  
  // Ontario curriculum structure
  private curriculumData: Record<string, CurriculumData> = {
    Mathematics: {
      strands: [
        { 
          en: 'Number Sense and Numeration', 
          fr: 'Numération et sens du nombre',
          substrands: [
            { en: 'Quantity Relationships', fr: 'Relations entre les quantités' },
            { en: 'Counting', fr: 'Dénombrement' },
            { en: 'Operational Sense', fr: 'Sens des opérations' },
          ]
        },
        { 
          en: 'Measurement', 
          fr: 'Mesure',
          substrands: [
            { en: 'Length, Perimeter, Area', fr: 'Longueur, périmètre, aire' },
            { en: 'Mass and Capacity', fr: 'Masse et capacité' },
            { en: 'Time and Temperature', fr: 'Temps et température' },
          ]
        },
        { 
          en: 'Geometry and Spatial Sense', 
          fr: 'Géométrie et sens de l\'espace',
          substrands: [
            { en: 'Geometric Properties', fr: 'Propriétés géométriques' },
            { en: 'Location and Movement', fr: 'Position et déplacement' },
          ]
        },
        { 
          en: 'Patterning and Algebra', 
          fr: 'Modélisation et algèbre',
          substrands: [
            { en: 'Patterns and Relationships', fr: 'Régularités et relations' },
            { en: 'Variables and Equations', fr: 'Variables et équations' },
          ]
        },
        { 
          en: 'Data Management and Probability', 
          fr: 'Traitement des données et probabilité',
          substrands: [
            { en: 'Collection and Organization', fr: 'Collecte et organisation' },
            { en: 'Data Analysis', fr: 'Analyse des données' },
            { en: 'Probability', fr: 'Probabilité' },
          ]
        },
      ],
      expectations: {
        en: [
          'demonstrate an understanding of',
          'solve problems involving',
          'represent and compare',
          'estimate, measure, and record',
          'identify and describe',
          'create and analyze',
          'investigate the relationship between',
          'apply strategies to',
          'communicate mathematical thinking',
          'make connections between',
        ],
        fr: [
          'démontrer une compréhension de',
          'résoudre des problèmes portant sur',
          'représenter et comparer',
          'estimer, mesurer et noter',
          'identifier et décrire',
          'créer et analyser',
          'explorer la relation entre',
          'appliquer des stratégies pour',
          'communiquer sa pensée mathématique',
          'établir des liens entre',
        ],
      },
    },
    Language: {
      strands: [
        { 
          en: 'Oral Communication', 
          fr: 'Communication orale',
          substrands: [
            { en: 'Listening to Understand', fr: 'Écoute' },
            { en: 'Speaking to Communicate', fr: 'Expression' },
          ]
        },
        { 
          en: 'Reading', 
          fr: 'Lecture',
          substrands: [
            { en: 'Reading for Meaning', fr: 'Compréhension' },
            { en: 'Understanding Form and Style', fr: 'Analyse' },
            { en: 'Reading With Fluency', fr: 'Fluidité' },
          ]
        },
        { 
          en: 'Writing', 
          fr: 'Écriture',
          substrands: [
            { en: 'Developing Ideas', fr: 'Planification' },
            { en: 'Using Knowledge of Form', fr: 'Rédaction' },
            { en: 'Applying Conventions', fr: 'Révision' },
          ]
        },
        { 
          en: 'Media Literacy', 
          fr: 'Littératie médiatique',
          substrands: [
            { en: 'Understanding Media Texts', fr: 'Compréhension' },
            { en: 'Creating Media Texts', fr: 'Production' },
          ]
        },
      ],
      expectations: {
        en: [
          'listen in order to understand and respond appropriately',
          'use speaking skills and strategies appropriately',
          'read and demonstrate an understanding of',
          'identify a variety of text forms and features',
          'generate, gather, and organize ideas',
          'draft and revise their writing',
          'use knowledge of media forms',
          'create a variety of media texts',
          'reflect on and identify their strengths',
          'demonstrate understanding of',
        ],
        fr: [
          'écouter pour comprendre et réagir de façon appropriée',
          'utiliser des habiletés et des stratégies d\'expression',
          'lire et démontrer sa compréhension',
          'reconnaître des caractéristiques de divers types de textes',
          'produire, rassembler et organiser des idées',
          'rédiger et réviser ses textes',
          'utiliser ses connaissances des formes médiatiques',
          'créer divers textes médiatiques',
          'réfléchir et identifier ses forces',
          'démontrer sa compréhension de',
        ],
      },
    },
    Science: {
      strands: [
        { 
          en: 'Life Systems', 
          fr: 'Systèmes vivants',
          substrands: [
            { en: 'Needs and Characteristics', fr: 'Besoins et caractéristiques' },
            { en: 'Growth and Changes', fr: 'Croissance et changements' },
            { en: 'Interactions', fr: 'Interactions' },
          ]
        },
        { 
          en: 'Matter and Energy', 
          fr: 'Matière et énergie',
          substrands: [
            { en: 'Properties', fr: 'Propriétés' },
            { en: 'Changes and Conservation', fr: 'Changements et conservation' },
          ]
        },
        { 
          en: 'Structures and Mechanisms', 
          fr: 'Structures et mécanismes',
          substrands: [
            { en: 'Purpose and Function', fr: 'But et fonction' },
            { en: 'Forces Acting on Structures', fr: 'Forces agissant sur les structures' },
          ]
        },
        { 
          en: 'Earth and Space Systems', 
          fr: 'Systèmes de la Terre et de l\'espace',
          substrands: [
            { en: 'Daily and Seasonal Changes', fr: 'Changements quotidiens et saisonniers' },
            { en: 'Air and Water', fr: 'L\'air et l\'eau' },
          ]
        },
      ],
      expectations: {
        en: [
          'investigate characteristics of',
          'demonstrate an understanding of',
          'assess ways in which',
          'use scientific inquiry skills to',
          'explore and investigate',
          'identify and describe',
          'analyze the impact of',
          'design and build',
          'evaluate the effectiveness of',
          'communicate findings about',
        ],
        fr: [
          'explorer les caractéristiques de',
          'démontrer sa compréhension de',
          'évaluer les façons dont',
          'utiliser les compétences en recherche scientifique pour',
          'explorer et examiner',
          'identifier et décrire',
          'analyser l\'impact de',
          'concevoir et construire',
          'évaluer l\'efficacité de',
          'communiquer ses découvertes sur',
        ],
      },
    },
  };

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Create a curriculum expectation
   */
  async create(overrides?: Partial<CurriculumExpectation>): Promise<CurriculumExpectation> {
    const subject = overrides?.subject || 
      this.faker.helpers.arrayElement(Object.keys(this.curriculumData));
    
    const gradeData = this.generateGradeLevel();
    const grade = overrides?.grade || gradeData.grade;
    
    const subjectData = this.curriculumData[subject] || this.curriculumData.Mathematics;
    const strand = this.faker.helpers.arrayElement(subjectData.strands);
    const substrand = strand.substrands ? 
      this.faker.helpers.arrayElement(strand.substrands) : undefined;
    
    const code = overrides?.code || this.generateCurriculumCode(grade, subject);
    
    const expectationStarter = this.faker.helpers.arrayElement(
      subjectData.expectations[this.locale]
    );
    
    const expectation: CurriculumExpectation = {
      id: this.faker.string.uuid(),
      code,
      description: overrides?.description || 
        this.generateExpectationDescription(expectationStarter, subject, grade),
      strand: overrides?.strand || strand.en,
      substrand: overrides?.substrand || substrand?.en,
      grade,
      subject,
      descriptionFr: overrides?.descriptionFr || 
        this.generateExpectationDescription(
          this.faker.helpers.arrayElement(subjectData.expectations.fr),
          subject,
          grade
        ),
      strandFr: overrides?.strandFr || strand.fr,
      substrandFr: overrides?.substrandFr || substrand?.fr,
      importId: overrides?.importId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as CurriculumExpectation;

    if (this.prisma && this.options?.persist !== false) {
      const created = await this.prisma.curriculumExpectation.create({ data: expectation });
      this.createdExpectations.push(created.id);
      return created;
    }

    return expectation;
  }

  /**
   * Generate realistic expectation descriptions
   */
  private generateExpectationDescription(starter: string, subject: string, grade: number): string {
    const topics = this.getGradeAppropriateTopics(subject, grade);
    const topic = this.faker.helpers.arrayElement(topics);
    
    const contexts = [
      'in a variety of contexts',
      'using concrete materials',
      'through investigation',
      'in real-life situations',
      'using appropriate vocabulary',
      'with increasing complexity',
      'independently and in groups',
    ];
    
    const context = this.faker.helpers.arrayElement(contexts);
    
    return `${starter} ${topic} ${context}`;
  }

  /**
   * Get grade-appropriate topics
   */
  private getGradeAppropriateTopics(subject: string, grade: number): string[] {
    const topicsByGrade: Record<string, Record<string, string[]>> = {
      Mathematics: {
        primary: [
          'numbers up to 100',
          'addition and subtraction facts',
          'simple patterns',
          'basic geometric shapes',
          'measurement using non-standard units',
          'sorting and classifying objects',
          'simple graphs and charts',
        ],
        junior: [
          'multiplication and division',
          'fractions and decimals',
          'area and perimeter',
          'algebraic expressions',
          'data collection and analysis',
          'probability experiments',
          'transformational geometry',
        ],
        intermediate: [
          'integers and rational numbers',
          'rates, ratios, and proportions',
          'linear relationships',
          'circle geometry',
          'surface area and volume',
          'statistical analysis',
          'algebraic equations',
        ],
      },
      Language: {
        primary: [
          'familiar stories and texts',
          'personal experiences',
          'basic writing forms',
          'oral presentations',
          'simple media texts',
          'reading strategies',
          'vocabulary development',
        ],
        junior: [
          'various text forms',
          'narrative writing',
          'research skills',
          'oral communication strategies',
          'media literacy concepts',
          'reading comprehension',
          'writing process',
        ],
        intermediate: [
          'complex texts',
          'argumentative writing',
          'critical analysis',
          'formal presentations',
          'digital media creation',
          'literary devices',
          'research and inquiry',
        ],
      },
      Science: {
        primary: [
          'living things',
          'materials and objects',
          'energy in our lives',
          'daily and seasonal changes',
          'movement',
          'water in the environment',
          'simple machines',
        ],
        junior: [
          'habitats and communities',
          'forces and motion',
          'properties of matter',
          'conservation of energy',
          'weather systems',
          'human body systems',
          'structures and stability',
        ],
        intermediate: [
          'biodiversity',
          'electricity and magnetism',
          'chemical reactions',
          'space exploration',
          'climate change',
          'cells and systems',
          'hydraulic and pneumatic systems',
        ],
      },
    };

    const division = grade <= 3 ? 'primary' : grade <= 6 ? 'junior' : 'intermediate';
    return topicsByGrade[subject]?.[division] || topicsByGrade.Mathematics.primary;
  }

  /**
   * Create a full strand of expectations
   */
  async createStrand(options: {
    subject: string;
    grade: number;
    strand: string;
    count?: number;
  }): Promise<CurriculumExpectation[]> {
    const count = options.count || this.faker.number.int({ min: 8, max: 15 });
    const expectations: CurriculumExpectation[] = [];

    for (let i = 0; i < count; i++) {
      const expectation = await this.create({
        subject: options.subject,
        grade: options.grade,
        strand: options.strand,
        code: `${options.grade}.${options.strand.charAt(0)}.${i + 1}`,
      });
      expectations.push(expectation);
    }

    return expectations;
  }

  /**
   * Create a complete grade curriculum
   */
  async createGradeCurriculum(grade: number): Promise<{
    grade: number;
    subjects: Record<string, CurriculumExpectation[]>;
  }> {
    const subjects: Record<string, CurriculumExpectation[]> = {};
    
    for (const subject of Object.keys(this.curriculumData)) {
      const expectations: CurriculumExpectation[] = [];
      const subjectData = this.curriculumData[subject];
      
      for (const strand of subjectData.strands) {
        const strandExpectations = await this.createStrand({
          subject,
          grade,
          strand: strand.en,
          count: this.faker.number.int({ min: 5, max: 10 }),
        });
        expectations.push(...strandExpectations);
      }
      
      subjects[subject] = expectations;
    }

    return { grade, subjects };
  }

  /**
   * Create cross-curricular expectations
   */
  async createCrossCurricular(options: {
    subjects: string[];
    grade: number;
    theme: string;
  }): Promise<CurriculumExpectation[]> {
    const expectations: CurriculumExpectation[] = [];

    for (const subject of options.subjects) {
      const expectation = await this.create({
        subject,
        grade: options.grade,
        description: `integrate ${options.theme} concepts across ${subject} learning`,
        descriptionFr: `intégrer les concepts de ${options.theme} dans l'apprentissage de ${subject}`,
      });
      expectations.push(expectation);
    }

    return expectations;
  }

  /**
   * Cleanup created expectations
   */
  async cleanup(): Promise<void> {
    if (this.prisma && this.createdExpectations.length > 0) {
      await this.prisma.curriculumExpectation.deleteMany({
        where: { id: { in: this.createdExpectations } }
      });
      this.createdExpectations = [];
    }
  }
}