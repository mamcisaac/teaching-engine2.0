/**
 * BilingualFactory - Creates bilingual test data (English/French)
 * 
 * Specialized for Canadian educational context with proper
 * French translations and Quebec-specific content
 */

import { faker } from '@faker-js/faker';
import { fakerFR_CA } from '@faker-js/faker';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';

interface BilingualContent {
  en: string;
  fr: string;
}

interface BilingualEducationalContent {
  title: BilingualContent;
  description: BilingualContent;
  objectives?: BilingualContent[];
  vocabulary?: BilingualContent[];
}

export class BilingualFactory extends BaseFactory<any> {
  // Educational term translations
  private educationalTerms: Record<string, BilingualContent> = {
    // Subjects
    mathematics: { en: 'Mathematics', fr: 'Mathématiques' },
    language: { en: 'Language Arts', fr: 'Arts du langage' },
    frenchLanguage: { en: 'French as a Second Language', fr: 'Français langue seconde' },
    science: { en: 'Science', fr: 'Sciences' },
    socialStudies: { en: 'Social Studies', fr: 'Études sociales' },
    history: { en: 'History', fr: 'Histoire' },
    geography: { en: 'Geography', fr: 'Géographie' },
    theArts: { en: 'The Arts', fr: 'Arts' },
    music: { en: 'Music', fr: 'Musique' },
    visualArts: { en: 'Visual Arts', fr: 'Arts visuels' },
    drama: { en: 'Drama', fr: 'Art dramatique' },
    dance: { en: 'Dance', fr: 'Danse' },
    physicalEducation: { en: 'Physical Education', fr: 'Éducation physique' },
    health: { en: 'Health Education', fr: 'Éducation à la santé' },
    
    // Grade levels
    kindergarten: { en: 'Kindergarten', fr: 'Maternelle' },
    grade1: { en: 'Grade 1', fr: '1re année' },
    grade2: { en: 'Grade 2', fr: '2e année' },
    grade3: { en: 'Grade 3', fr: '3e année' },
    grade4: { en: 'Grade 4', fr: '4e année' },
    grade5: { en: 'Grade 5', fr: '5e année' },
    grade6: { en: 'Grade 6', fr: '6e année' },
    grade7: { en: 'Grade 7', fr: '7e année' },
    grade8: { en: 'Grade 8', fr: '8e année' },
    
    // Terms and semesters
    fullYear: { en: 'Full Year', fr: 'Année complète' },
    semester1: { en: 'Semester 1', fr: 'Semestre 1' },
    semester2: { en: 'Semester 2', fr: 'Semestre 2' },
    term1: { en: 'Term 1', fr: 'Étape 1' },
    term2: { en: 'Term 2', fr: 'Étape 2' },
    term3: { en: 'Term 3', fr: 'Étape 3' },
    
    // Assessment terms
    diagnostic: { en: 'Diagnostic Assessment', fr: 'Évaluation diagnostique' },
    formative: { en: 'Formative Assessment', fr: 'Évaluation formative' },
    summative: { en: 'Summative Assessment', fr: 'Évaluation sommative' },
    
    // Common actions
    understand: { en: 'understand', fr: 'comprendre' },
    demonstrate: { en: 'demonstrate', fr: 'démontrer' },
    analyze: { en: 'analyze', fr: 'analyser' },
    evaluate: { en: 'evaluate', fr: 'évaluer' },
    create: { en: 'create', fr: 'créer' },
    apply: { en: 'apply', fr: 'appliquer' },
    identify: { en: 'identify', fr: 'identifier' },
    describe: { en: 'describe', fr: 'décrire' },
    explain: { en: 'explain', fr: 'expliquer' },
    compare: { en: 'compare', fr: 'comparer' },
  };

  // Learning objectives templates
  private objectiveTemplates = {
    mathematics: {
      en: [
        'solve problems involving {topic}',
        'demonstrate an understanding of {topic}',
        'represent and compare {topic}',
        'apply strategies to calculate {topic}',
        'identify patterns in {topic}',
      ],
      fr: [
        'résoudre des problèmes portant sur {topic}',
        'démontrer une compréhension de {topic}',
        'représenter et comparer {topic}',
        'appliquer des stratégies pour calculer {topic}',
        'identifier des régularités dans {topic}',
      ],
    },
    language: {
      en: [
        'read and demonstrate understanding of {topic}',
        'write texts using {topic}',
        'communicate orally about {topic}',
        'analyze media texts related to {topic}',
        'use reading strategies to understand {topic}',
      ],
      fr: [
        'lire et démontrer une compréhension de {topic}',
        'écrire des textes en utilisant {topic}',
        'communiquer oralement à propos de {topic}',
        'analyser des textes médiatiques liés à {topic}',
        'utiliser des stratégies de lecture pour comprendre {topic}',
      ],
    },
    science: {
      en: [
        'investigate the characteristics of {topic}',
        'demonstrate understanding of {topic}',
        'assess the impact of {topic} on society',
        'design and conduct experiments about {topic}',
        'analyze data related to {topic}',
      ],
      fr: [
        'examiner les caractéristiques de {topic}',
        'démontrer une compréhension de {topic}',
        'évaluer l\'impact de {topic} sur la société',
        'concevoir et mener des expériences sur {topic}',
        'analyser des données liées à {topic}',
      ],
    },
  };

  // Math topics by grade
  private mathTopics: Record<string, BilingualContent[]> = {
    primary: [
      { en: 'counting to 100', fr: 'compter jusqu\'à 100' },
      { en: 'addition and subtraction', fr: 'addition et soustraction' },
      { en: 'basic shapes', fr: 'formes de base' },
      { en: 'measurement', fr: 'mesure' },
      { en: 'simple patterns', fr: 'suites simples' },
    ],
    junior: [
      { en: 'multiplication and division', fr: 'multiplication et division' },
      { en: 'fractions and decimals', fr: 'fractions et décimales' },
      { en: 'area and perimeter', fr: 'aire et périmètre' },
      { en: 'data management', fr: 'traitement des données' },
      { en: 'algebraic thinking', fr: 'pensée algébrique' },
    ],
    intermediate: [
      { en: 'integers', fr: 'nombres entiers' },
      { en: 'ratios and rates', fr: 'rapports et taux' },
      { en: 'linear relations', fr: 'relations linéaires' },
      { en: 'geometry and spatial sense', fr: 'géométrie et sens spatial' },
      { en: 'probability', fr: 'probabilité' },
    ],
  };

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Base create method (required by BaseFactory)
   */
  async create(overrides?: any): Promise<any> {
    return this.generateBilingualContent();
  }

  /**
   * Generate bilingual educational content
   */
  generateBilingualContent(): BilingualEducationalContent {
    const subject = this.faker.helpers.arrayElement(['mathematics', 'language', 'science']);
    const grade = this.faker.number.int({ min: 1, max: 8 });
    
    return {
      title: this.generateBilingualTitle(subject, grade),
      description: this.generateBilingualDescription(subject),
      objectives: this.generateBilingualObjectives(subject, grade),
      vocabulary: this.generateBilingualVocabulary(subject),
    };
  }

  /**
   * Generate bilingual title
   */
  generateBilingualTitle(subject: string, grade: number): BilingualContent {
    const topics = this.getTopicsForSubject(subject, grade);
    const topic = this.faker.helpers.arrayElement(topics);
    
    const templates = {
      mathematics: {
        en: `Exploring ${topic.en}`,
        fr: `Explorer ${topic.fr}`,
      },
      language: {
        en: `Understanding ${topic.en}`,
        fr: `Comprendre ${topic.fr}`,
      },
      science: {
        en: `Investigating ${topic.en}`,
        fr: `Enquête sur ${topic.fr}`,
      },
    };

    return templates[subject] || templates.mathematics;
  }

  /**
   * Generate bilingual description
   */
  generateBilingualDescription(subject: string): BilingualContent {
    const descriptions = {
      mathematics: {
        en: 'Students will develop problem-solving skills through hands-on activities and real-world applications.',
        fr: 'Les élèves développeront des compétences en résolution de problèmes par des activités pratiques et des applications concrètes.',
      },
      language: {
        en: 'Students will enhance their communication skills through reading, writing, and oral activities.',
        fr: 'Les élèves amélioreront leurs compétences en communication par la lecture, l\'écriture et les activités orales.',
      },
      science: {
        en: 'Students will explore scientific concepts through inquiry-based learning and experimentation.',
        fr: 'Les élèves exploreront des concepts scientifiques par l\'apprentissage par enquête et l\'expérimentation.',
      },
    };

    return descriptions[subject] || descriptions.science;
  }

  /**
   * Generate bilingual learning objectives
   */
  generateBilingualObjectives(subject: string, grade: number): BilingualContent[] {
    const objectives: BilingualContent[] = [];
    const topics = this.getTopicsForSubject(subject, grade);
    const templates = this.objectiveTemplates[subject] || this.objectiveTemplates.mathematics;
    
    for (let i = 0; i < 3; i++) {
      const topic = this.faker.helpers.arrayElement(topics);
      const enTemplate = this.faker.helpers.arrayElement(templates.en);
      const frTemplate = this.faker.helpers.arrayElement(templates.fr);
      
      objectives.push({
        en: enTemplate.replace('{topic}', topic.en),
        fr: frTemplate.replace('{topic}', topic.fr),
      });
    }

    return objectives;
  }

  /**
   * Generate bilingual vocabulary
   */
  generateBilingualVocabulary(subject: string): BilingualContent[] {
    const vocabulary: Record<string, BilingualContent[]> = {
      mathematics: [
        { en: 'equation', fr: 'équation' },
        { en: 'variable', fr: 'variable' },
        { en: 'perimeter', fr: 'périmètre' },
        { en: 'area', fr: 'aire' },
        { en: 'fraction', fr: 'fraction' },
        { en: 'decimal', fr: 'décimale' },
        { en: 'pattern', fr: 'régularité' },
        { en: 'graph', fr: 'graphique' },
      ],
      language: [
        { en: 'narrative', fr: 'récit' },
        { en: 'character', fr: 'personnage' },
        { en: 'setting', fr: 'contexte' },
        { en: 'theme', fr: 'thème' },
        { en: 'metaphor', fr: 'métaphore' },
        { en: 'paragraph', fr: 'paragraphe' },
        { en: 'punctuation', fr: 'ponctuation' },
        { en: 'vocabulary', fr: 'vocabulaire' },
      ],
      science: [
        { en: 'hypothesis', fr: 'hypothèse' },
        { en: 'experiment', fr: 'expérience' },
        { en: 'observation', fr: 'observation' },
        { en: 'data', fr: 'données' },
        { en: 'ecosystem', fr: 'écosystème' },
        { en: 'energy', fr: 'énergie' },
        { en: 'matter', fr: 'matière' },
        { en: 'force', fr: 'force' },
      ],
    };

    return this.faker.helpers.arrayElements(
      vocabulary[subject] || vocabulary.science, 
      5
    );
  }

  /**
   * Get grade-appropriate topics
   */
  private getTopicsForSubject(subject: string, grade: number): BilingualContent[] {
    if (subject === 'mathematics') {
      if (grade <= 3) return this.mathTopics.primary;
      if (grade <= 6) return this.mathTopics.junior;
      return this.mathTopics.intermediate;
    }

    const topics: Record<string, BilingualContent[]> = {
      language: [
        { en: 'story elements', fr: 'éléments d\'histoire' },
        { en: 'writing process', fr: 'processus d\'écriture' },
        { en: 'reading strategies', fr: 'stratégies de lecture' },
        { en: 'oral communication', fr: 'communication orale' },
        { en: 'media literacy', fr: 'littératie médiatique' },
      ],
      science: [
        { en: 'living things', fr: 'êtres vivants' },
        { en: 'materials and structures', fr: 'matériaux et structures' },
        { en: 'energy and control', fr: 'énergie et contrôle' },
        { en: 'Earth and space', fr: 'Terre et espace' },
        { en: 'environmental science', fr: 'sciences environnementales' },
      ],
    };

    return topics[subject] || topics.science;
  }

  /**
   * Generate French immersion lesson plan
   */
  generateFrenchImmersionLesson(options?: {
    grade?: number;
    subject?: string;
    immersionLevel?: 'early' | 'middle' | 'late';
  }): any {
    const grade = options?.grade || this.faker.number.int({ min: 1, max: 8 });
    const subject = options?.subject || 'mathematics';
    const level = options?.immersionLevel || 'middle';
    
    const languageSupport = {
      early: {
        teachingLanguage: 'fr',
        supportLanguage: 'en',
        frenchPercentage: 50,
        scaffolding: [
          'Visual supports and gestures',
          'Bilingual word walls',
          'Translation of key terms',
          'Code-switching allowed',
        ],
      },
      middle: {
        teachingLanguage: 'fr',
        supportLanguage: 'en',
        frenchPercentage: 75,
        scaffolding: [
          'French-only instruction',
          'English support for new concepts',
          'Bilingual resources available',
          'Peer translation support',
        ],
      },
      late: {
        teachingLanguage: 'fr',
        supportLanguage: null,
        frenchPercentage: 100,
        scaffolding: [
          'Full French immersion',
          'Monolingual French resources',
          'Advanced vocabulary development',
          'Academic French focus',
        ],
      },
    };

    const config = languageSupport[level];
    const content = this.generateBilingualContent();

    return {
      title: content.title.fr,
      titleTranslation: level !== 'late' ? content.title.en : null,
      grade,
      subject: this.educationalTerms[subject]?.fr || subject,
      immersionLevel: level,
      teachingLanguage: config.teachingLanguage,
      frenchPercentage: config.frenchPercentage,
      objectives: content.objectives?.map(obj => ({
        fr: obj.fr,
        en: level !== 'late' ? obj.en : null,
      })),
      vocabulary: content.vocabulary,
      languageSupports: config.scaffolding,
      instructions: this.generateImmersionInstructions(level),
      assessment: this.generateBilingualAssessment(level),
    };
  }

  /**
   * Generate immersion-specific instructions
   */
  private generateImmersionInstructions(level: 'early' | 'middle' | 'late'): any {
    const instructions = {
      early: {
        opening: 'Bonjour les amis! Today we will learn... Aujourd\'hui nous allons apprendre...',
        transitions: [
          'Maintenant... (Now...)',
          'Ensuite... (Next...)',
          'Finalement... (Finally...)',
        ],
        closing: 'Très bien! (Very good!) What did we learn today?',
      },
      middle: {
        opening: 'Bonjour tout le monde! Aujourd\'hui nous allons explorer...',
        transitions: [
          'Passons à la prochaine activité',
          'Travaillez avec votre partenaire',
          'Prenez vos cahiers',
        ],
        closing: 'Excellent travail! Qu\'avez-vous appris aujourd\'hui?',
      },
      late: {
        opening: 'Bonjour! Commençons par réviser nos apprentissages d\'hier...',
        transitions: [
          'Analysons maintenant ce concept plus profondément',
          'Appliquons ces stratégies à un nouveau problème',
          'Réfléchissons de façon critique',
        ],
        closing: 'Réflexion: Comment ces concepts s\'appliquent-ils à votre vie quotidienne?',
      },
    };

    return instructions[level];
  }

  /**
   * Generate bilingual assessment criteria
   */
  private generateBilingualAssessment(level: 'early' | 'middle' | 'late'): any {
    return {
      criteria: [
        {
          en: level !== 'late' ? 'Demonstrates understanding of key concepts' : null,
          fr: 'Démontre une compréhension des concepts clés',
        },
        {
          en: level !== 'late' ? 'Uses appropriate vocabulary' : null,
          fr: 'Utilise le vocabulaire approprié',
        },
        {
          en: level !== 'late' ? 'Communicates ideas clearly' : null,
          fr: 'Communique ses idées clairement',
        },
      ],
      languageObjectives: this.generateLanguageObjectives(level),
    };
  }

  /**
   * Generate language-specific learning objectives
   */
  private generateLanguageObjectives(level: 'early' | 'middle' | 'late'): string[] {
    const objectives = {
      early: [
        'Use basic French vocabulary related to the topic',
        'Understand simple French instructions',
        'Respond to questions using familiar phrases',
      ],
      middle: [
        'Express ideas using complete French sentences',
        'Use subject-specific vocabulary accurately',
        'Participate in French discussions with peers',
      ],
      late: [
        'Analyze complex texts in French',
        'Present arguments using advanced vocabulary',
        'Write detailed explanations in academic French',
      ],
    };

    return objectives[level];
  }

  /**
   * Generate Quebec curriculum content
   */
  generateQuebecCurriculum(options?: {
    level?: 'primaire' | 'secondaire';
    domaine?: string;
    cycle?: number;
  }): any {
    const level = options?.level || 'primaire';
    const cycle = options?.cycle || 1;
    
    const domaines = {
      primaire: [
        'Langues',
        'Mathématique, science et technologie',
        'Univers social',
        'Arts',
        'Développement personnel',
      ],
      secondaire: [
        'Langues',
        'Mathématique',
        'Science et technologie',
        'Univers social',
        'Arts',
        'Développement personnel',
      ],
    };

    const competences = {
      langues: [
        'Lire des textes variés',
        'Écrire des textes variés',
        'Communiquer oralement',
        'Apprécier des œuvres littéraires',
      ],
      mathematique: [
        'Résoudre une situation-problème',
        'Raisonner à l\'aide de concepts mathématiques',
        'Communiquer à l\'aide du langage mathématique',
      ],
      science: [
        'Chercher des réponses ou des solutions',
        'Mettre à profit ses connaissances scientifiques',
        'Communiquer à l\'aide des langages scientifiques',
      ],
    };

    const domaine = options?.domaine || 
      this.faker.helpers.arrayElement(domaines[level]);

    return {
      niveau: level,
      cycle: `Cycle ${cycle}`,
      domaine: domaine,
      competences: this.selectCompetences(domaine, competences),
      savoirs: this.generateSavoirs(domaine, cycle),
      situationApprentissage: this.generateSituationApprentissage(domaine),
    };
  }

  /**
   * Select competencies based on domain
   */
  private selectCompetences(domaine: string, competences: any): string[] {
    if (domaine.includes('Langues')) return competences.langues;
    if (domaine.includes('Mathématique')) return competences.mathematique;
    if (domaine.includes('Science')) return competences.science;
    
    return [
      'Développer des compétences transversales',
      'Exploiter l\'information',
      'Résoudre des problèmes',
      'Exercer son jugement critique',
    ];
  }

  /**
   * Generate knowledge content (savoirs)
   */
  private generateSavoirs(domaine: string, cycle: number): string[] {
    const savoirsByDomain: Record<string, Record<number, string[]>> = {
      'Mathématique': {
        1: ['Nombres naturels jusqu\'à 1000', 'Figures géométriques', 'Mesure'],
        2: ['Fractions et décimales', 'Opérations', 'Statistiques simples'],
        3: ['Nombres entiers', 'Algèbre', 'Probabilités'],
      },
      'Science': {
        1: ['Êtres vivants', 'Matière', 'Énergie'],
        2: ['Systèmes et interactions', 'Techniques et instruments', 'Langage scientifique'],
        3: ['Univers matériel', 'Univers vivant', 'Terre et espace'],
      },
    };

    const key = Object.keys(savoirsByDomain).find(k => domaine.includes(k)) || 'Science';
    return savoirsByDomain[key][cycle] || savoirsByDomain[key][1];
  }

  /**
   * Generate learning situation
   */
  private generateSituationApprentissage(domaine: string): any {
    const situations = {
      'Langues': {
        titre: 'Journal de classe',
        description: 'Les élèves créent un journal mensuel pour partager leurs découvertes',
        duree: '4 semaines',
        production: 'Journal imprimé ou numérique',
      },
      'Mathématique': {
        titre: 'Marché de l\'école',
        description: 'Organisation d\'un marché pour pratiquer les concepts monétaires',
        duree: '3 semaines',
        production: 'Kiosque de vente avec transactions',
      },
      'Science': {
        titre: 'Expo-sciences',
        description: 'Projets de recherche scientifique présentés à la communauté',
        duree: '6 semaines',
        production: 'Présentation et démonstration scientifique',
      },
    };

    const key = Object.keys(situations).find(k => domaine.includes(k)) || 'Science';
    return situations[key];
  }

  /**
   * Generate bilingual parent communication
   */
  generateBilingualParentCommunication(type: 'newsletter' | 'report' | 'notice'): any {
    const templates = {
      newsletter: {
        title: {
          en: `${this.faker.date.month()} Classroom Newsletter`,
          fr: `Bulletin de classe - ${this.faker.date.month()}`,
        },
        greeting: {
          en: 'Dear Families,',
          fr: 'Chères familles,',
        },
        sections: [
          {
            en: 'What We\'re Learning',
            fr: 'Ce que nous apprenons',
          },
          {
            en: 'Important Dates',
            fr: 'Dates importantes',
          },
          {
            en: 'How to Help at Home',
            fr: 'Comment aider à la maison',
          },
        ],
        closing: {
          en: 'Thank you for your continued support!',
          fr: 'Merci pour votre soutien continu!',
        },
      },
      report: {
        title: {
          en: 'Progress Report',
          fr: 'Bulletin de progrès',
        },
        sections: [
          {
            en: 'Academic Achievement',
            fr: 'Rendement scolaire',
          },
          {
            en: 'Learning Skills',
            fr: 'Habiletés d\'apprentissage',
          },
          {
            en: 'Next Steps',
            fr: 'Prochaines étapes',
          },
        ],
      },
      notice: {
        title: {
          en: 'Important Notice',
          fr: 'Avis important',
        },
        greeting: {
          en: 'Dear Parents/Guardians,',
          fr: 'Chers parents/tuteurs,',
        },
        closing: {
          en: 'Please contact us if you have any questions.',
          fr: 'Veuillez nous contacter si vous avez des questions.',
        },
      },
    };

    return templates[type];
  }

  /**
   * Generate bilingual school forms
   */
  generateSchoolForm(type: 'permission' | 'absence' | 'medical'): any {
    const forms = {
      permission: {
        title: { 
          en: 'Field Trip Permission Form', 
          fr: 'Formulaire d\'autorisation de sortie' 
        },
        fields: [
          { en: 'Student Name', fr: 'Nom de l\'élève' },
          { en: 'Grade/Class', fr: 'Année/Classe' },
          { en: 'Trip Date', fr: 'Date de la sortie' },
          { en: 'Destination', fr: 'Destination' },
          { en: 'Parent Signature', fr: 'Signature du parent' },
        ],
      },
      absence: {
        title: { 
          en: 'Absence Report', 
          fr: 'Rapport d\'absence' 
        },
        fields: [
          { en: 'Student Name', fr: 'Nom de l\'élève' },
          { en: 'Date(s) of Absence', fr: 'Date(s) d\'absence' },
          { en: 'Reason', fr: 'Raison' },
          { en: 'Parent Contact', fr: 'Contact du parent' },
        ],
      },
      medical: {
        title: { 
          en: 'Medical Information Form', 
          fr: 'Formulaire d\'information médicale' 
        },
        fields: [
          { en: 'Medical Conditions', fr: 'Conditions médicales' },
          { en: 'Medications', fr: 'Médicaments' },
          { en: 'Allergies', fr: 'Allergies' },
          { en: 'Emergency Contact', fr: 'Contact d\'urgence' },
        ],
      },
    };

    return forms[type];
  }

  /**
   * Cleanup (required by BaseFactory)
   */
  async cleanup(): Promise<void> {
    // No persistence in this factory
  }
}