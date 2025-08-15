/**
 * Intelligent Lesson Generation Framework for Grade 1 French Immersion
 * 
 * This framework generates contextually appropriate ETFO-structured lessons
 * for all subjects, ensuring perfect alignment with unit themes, proper timing,
 * and pedagogically sound content for 6-7 year old students.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';
import { getErrorMessage } from '../utils/type-guards';

interface UnitContext {
  id: string;
  title: string;
  titleFr: string;
  subject: string;
  startDate: Date;
  endDate: Date;
  keyVocabulary: string[];
  bigIdeas: string;
  bigIdeasFr: string;
  essentialQuestions: string[];
  expectations: Array<{
    id: string;
    code: string;
    description: string;
  }>;
}

interface LessonTemplate {
  title: string;
  titleFr?: string;
  duration: number;
  mindsOn: string;
  mindsOnFr?: string;
  action: string;
  actionFr?: string;
  consolidation: string;
  consolidationFr?: string;
  learningGoals: string;
  learningGoalsFr?: string;
  materials: string[];
  accommodations: string[];
  assessmentType: 'diagnostic' | 'formative' | 'summative';
  assessmentNotes: string;
  grade: number;
  language: string;
  subject: string;
  grouping: string;
  isSubFriendly: boolean;
  subNotes: string;
  expectationIds: string[];
}

export class LessonGenerationFramework {
  private prisma: PrismaClient;
  private emilyUserId: number;
  private usedTitles: Set<string> = new Set();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Initialize the framework by finding Emily's user ID and loading existing lesson titles
   */
  async initialize(): Promise<void> {
    try {
      const emily = await this.prisma.user.findUnique({
        where: { email: 'emmcisaac@gmail.com' }
      });

      if (!emily) {
        throw new Error('Emily McIsaac user account not found');
      }

      this.emilyUserId = emily.id;

      // Load existing lesson titles to ensure uniqueness
      const existingLessons = await this.prisma.eTFOLessonPlan.findMany({
        where: { userId: this.emilyUserId },
        select: { title: true }
      });

      this.usedTitles = new Set(existingLessons.map(lesson => lesson.title));

      logger.info(`Lesson Generation Framework initialized for Emily (ID: ${this.emilyUserId})`);
      logger.info(`Found ${this.usedTitles.size} existing lesson titles to avoid duplicates`);
    } catch (error) {
      logger.error('Failed to initialize Lesson Generation Framework:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Generate lessons for all units across all subjects
   */
  async generateAllLessons(): Promise<void> {
    try {
      await this.initialize();

      // Get all unit plans for Emily
      const units = await this.prisma.unitPlan.findMany({
        where: { userId: this.emilyUserId },
        include: {
          longRangePlan: true,
          expectations: {
            include: {
              expectation: true
            }
          }
        },
        orderBy: [
          { startDate: 'asc' },
          { title: 'asc' }
        ]
      });

      logger.info(`Found ${units.length} units to generate lessons for`);

      let totalLessonsGenerated = 0;

      for (const unit of units) {
        const unitContext = this.buildUnitContext(unit);
        const lessonCount = await this.generateLessonsForUnit(unitContext);
        totalLessonsGenerated += lessonCount;
        
        logger.info(`Generated ${lessonCount} lessons for unit: ${unit.title}`);
      }

      logger.info(`🎉 Successfully generated ${totalLessonsGenerated} total lessons!`);
    } catch (error) {
      logger.error('Failed to generate all lessons:', getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Generate lessons for a specific unit
   */
  async generateLessonsForUnit(unitContext: UnitContext): Promise<number> {
    try {
      // Calculate optimal number of lessons based on unit duration and subject
      const lessonCount = this.calculateLessonCount(unitContext);
      const lessonDates = this.generateLessonDates(unitContext, lessonCount);
      
      let lessonsCreated = 0;

      for (let i = 0; i < lessonCount; i++) {
        const lessonTemplate = this.generateLessonTemplate(unitContext, i + 1, lessonCount);
        const lessonDate = lessonDates[i];

        await this.createLesson(unitContext, lessonTemplate, lessonDate);
        lessonsCreated++;
      }

      return lessonsCreated;
    } catch (error) {
      logger.error(`Failed to generate lessons for unit ${unitContext.title}:`, getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Build unit context from database unit plan
   */
  private buildUnitContext(unit: any): UnitContext {
    return {
      id: unit.id,
      title: unit.title,
      titleFr: unit.titleFr || unit.title,
      subject: unit.longRangePlan.subject,
      startDate: unit.startDate,
      endDate: unit.endDate,
      keyVocabulary: Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : [],
      bigIdeas: unit.bigIdeas || '',
      bigIdeasFr: unit.bigIdeasFr || unit.bigIdeas || '',
      essentialQuestions: Array.isArray(unit.essentialQuestions) ? unit.essentialQuestions : [],
      expectations: unit.expectations.map((ue: any) => ({
        id: ue.expectation.id,
        code: ue.expectation.code,
        description: ue.expectation.description
      }))
    };
  }

  /**
   * Calculate appropriate number of lessons based on unit characteristics
   */
  private calculateLessonCount(unit: UnitContext): number {
    const durationInDays = Math.ceil((unit.endDate.getTime() - unit.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const schoolDays = Math.floor(durationInDays * 0.7); // Account for weekends and holidays

    // Subject-specific lesson frequency
    const subjectMultipliers: { [key: string]: number } = {
      'Français (Immersion)': 0.8, // 4 lessons per week
      'Mathématiques': 0.8, // 4 lessons per week
      'Sciences de la nature': 0.4, // 2 lessons per week
      'Sciences humaines': 0.4, // 2 lessons per week
      'Arts visuels': 0.3, // 1-2 lessons per week
      'Formation personnelle et sociale': 0.3 // 1-2 lessons per week
    };

    const multiplier = subjectMultipliers[unit.subject] || 0.5;
    const baseCount = Math.max(Math.floor(schoolDays * multiplier), 3); // Minimum 3 lessons per unit
    
    // Cap at reasonable maximums
    return Math.min(baseCount, 25);
  }

  /**
   * Generate lesson dates within unit timeframe
   */
  private generateLessonDates(unit: UnitContext, lessonCount: number): Date[] {
    const dates: Date[] = [];
    const startDate = new Date(unit.startDate);
    const endDate = new Date(unit.endDate);
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const interval = Math.max(Math.floor(totalDays / lessonCount), 1);

    for (let i = 0; i < lessonCount; i++) {
      const lessonDate = new Date(startDate);
      lessonDate.setDate(startDate.getDate() + (i * interval));
      
      // Ensure lesson date doesn't exceed unit end date
      if (lessonDate <= endDate) {
        dates.push(lessonDate);
      }
    }

    return dates;
  }

  /**
   * Generate lesson template based on unit context and progression
   */
  private generateLessonTemplate(unit: UnitContext, lessonNumber: number, totalLessons: number): LessonTemplate {
    const isFrenchImmersion = unit.subject === 'Français (Immersion)';
    const isFirstLesson = lessonNumber === 1;
    const isLastLesson = lessonNumber === totalLessons;
    const isMidUnit = lessonNumber > totalLessons * 0.3 && lessonNumber < totalLessons * 0.7;

    // Generate unique title
    const baseTitle = this.generateLessonTitle(unit, lessonNumber, totalLessons);
    const uniqueTitle = this.ensureUniqueTitle(baseTitle);

    // Generate content based on subject and progression
    const content = this.generateLessonContent(unit, lessonNumber, totalLessons);

    return {
      title: uniqueTitle,
      titleFr: isFrenchImmersion ? this.generateFrenchTitle(unit, lessonNumber) : undefined,
      duration: 60, // Standard ETFO lesson duration
      mindsOn: content.mindsOn,
      mindsOnFr: isFrenchImmersion ? content.mindsOnFr : undefined,
      action: content.action,
      actionFr: isFrenchImmersion ? content.actionFr : undefined,
      consolidation: content.consolidation,
      consolidationFr: isFrenchImmersion ? content.consolidationFr : undefined,
      learningGoals: content.learningGoals,
      learningGoalsFr: isFrenchImmersion ? content.learningGoalsFr : undefined,
      materials: this.generateMaterials(unit, lessonNumber),
      accommodations: this.generateAccommodations(unit),
      assessmentType: this.determineAssessmentType(lessonNumber, totalLessons),
      assessmentNotes: content.assessmentNotes,
      grade: 1,
      language: isFrenchImmersion ? 'fr' : 'en',
      subject: unit.subject,
      grouping: this.determineGrouping(unit, lessonNumber),
      isSubFriendly: true,
      subNotes: this.generateSubNotes(unit, content),
      expectationIds: this.selectExpectationsForLesson(unit, lessonNumber, totalLessons)
    };
  }

  /**
   * Generate contextually appropriate lesson title
   */
  private generateLessonTitle(unit: UnitContext, lessonNumber: number, totalLessons: number): string {
    const progressPhase = lessonNumber <= totalLessons * 0.3 ? 'Introduction' :
                         lessonNumber >= totalLessons * 0.7 ? 'Application' : 'Development';

    const subjectTitleTemplates: { [key: string]: string[] } = {
      'Français (Immersion)': [
        'Exploring {vocabulary} Through Stories',
        'Speaking and Listening: {topic}',
        'Reading Adventures with {theme}',
        'Writing Workshop: {focus}',
        'French Sounds and Letters'
      ],
      'Mathématiques': [
        'Counting and Number Patterns',
        'Hands-on Math with {materials}',
        'Problem Solving: {scenario}',
        'Math Games and Exploration',
        'Number Sense Activities'
      ],
      'Sciences de la nature': [
        'Observing {phenomena}',
        'Science Investigation: {topic}',
        'Exploring {concept} in Nature',
        'Hands-on Science Discovery',
        'Recording Our Observations'
      ],
      'Sciences humaines': [
        'Learning About {community}',
        'Our Community Helpers',
        'Exploring {culture}',
        'Maps and Our Neighborhood',
        'Then and Now: {comparison}'
      ],
      'Arts visuels': [
        'Creating with {medium}',
        'Art Techniques: {skill}',
        'Artist Study: {style}',
        'Expressing Ideas Through Art',
        'Gallery Walk and Sharing'
      ],
      'Formation personnelle et sociale': [
        'Building {skill}',
        'Friendship and Kindness',
        'Problem Solving Together',
        'Feelings and Emotions',
        'Making Good Choices'
      ]
    };

    const templates = subjectTitleTemplates[unit.subject] || ['Lesson {number}: {topic}'];
    const template = templates[lessonNumber % templates.length];
    
    // Replace placeholders with unit-specific content
    return template
      .replace('{number}', lessonNumber.toString())
      .replace('{topic}', this.extractTopicFromUnit(unit))
      .replace('{vocabulary}', unit.keyVocabulary.slice(0, 2).join(' and '))
      .replace('{theme}', unit.title.split(' ')[0])
      .replace('{focus}', progressPhase)
      .replace('{materials}', this.getSubjectSpecificMaterials(unit.subject)[0])
      .replace('{phenomena}', this.getSciencePhenomena(unit))
      .replace('{concept}', this.getScienceConcept(unit))
      .replace('{community}', this.getCommunityAspect(unit))
      .replace('{culture}', 'Our Traditions')
      .replace('{comparison}', 'Past and Present')
      .replace('{medium}', this.getArtMedium(lessonNumber))
      .replace('{skill}', this.getArtSkill(lessonNumber))
      .replace('{style}', this.getArtStyle(lessonNumber))
      .replace('{scenario}', this.getMathScenario(unit, lessonNumber));
  }

  /**
   * Generate French title for French Immersion lessons
   */
  private generateFrenchTitle(unit: UnitContext, lessonNumber: number): string {
    if (unit.titleFr && unit.keyVocabulary.length > 0) {
      const vocab = unit.keyVocabulary.slice(0, 2).join(' et ');
      return `Leçon ${lessonNumber}: Découvrir ${vocab}`;
    }
    return `Leçon ${lessonNumber}: ${unit.titleFr}`;
  }

  /**
   * Generate lesson content based on ETFO three-part structure
   */
  private generateLessonContent(unit: UnitContext, lessonNumber: number, totalLessons: number) {
    const isIntroLesson = lessonNumber === 1;
    const isCulminating = lessonNumber === totalLessons;
    
    const subjectContent = this.getSubjectSpecificContent(unit, lessonNumber, totalLessons);
    
    return {
      mindsOn: this.generateMindsOn(unit, subjectContent, isIntroLesson),
      mindsOnFr: unit.subject === 'Français (Immersion)' ? 
        this.generateMindsOnFrench(unit, subjectContent, isIntroLesson) : undefined,
      action: this.generateAction(unit, subjectContent, lessonNumber, totalLessons),
      actionFr: unit.subject === 'Français (Immersion)' ? 
        this.generateActionFrench(unit, subjectContent, lessonNumber) : undefined,
      consolidation: this.generateConsolidation(unit, subjectContent, isCulminating),
      consolidationFr: unit.subject === 'Français (Immersion)' ? 
        this.generateConsolidationFrench(unit, subjectContent, isCulminating) : undefined,
      learningGoals: this.generateLearningGoals(unit, lessonNumber),
      learningGoalsFr: unit.subject === 'Français (Immersion)' ? 
        this.generateLearningGoalsFrench(unit, lessonNumber) : undefined,
      assessmentNotes: this.generateAssessmentNotes(unit, lessonNumber, totalLessons)
    };
  }

  /**
   * Generate Minds On activity (15 minutes)
   */
  private generateMindsOn(unit: UnitContext, content: any, isIntroLesson: boolean): string {
    if (isIntroLesson) {
      return `Welcome circle: Introduce today's learning about ${this.extractTopicFromUnit(unit)}. Share what students already know through think-pair-share. Activate prior knowledge with visual supports and real objects.`;
    }

    const mindsOnStrategies = [
      `Quick review game: Students share one thing they remember from yesterday's lesson about ${this.extractTopicFromUnit(unit)}.`,
      `Picture walk: Show images related to today's topic and have students make predictions and connections.`,
      `KWL chart: What do we Know, Want to know, and Learned about ${this.extractTopicFromUnit(unit)}.`,
      `Movement activity: Act out vocabulary or concepts from ${unit.keyVocabulary.slice(0, 3).join(', ')}.`,
      `Question of the day: Pose an engaging question related to ${this.extractTopicFromUnit(unit)} for students to discuss.`
    ];

    return mindsOnStrategies[Math.floor(Math.random() * mindsOnStrategies.length)];
  }

  /**
   * Generate Minds On activity in French
   */
  private generateMindsOnFrench(unit: UnitContext, content: any, isIntroLesson: boolean): string {
    if (isIntroLesson) {
      return `Cercle de bienvenue : Introduire l'apprentissage d'aujourd'hui sur ${this.extractTopicFromUnit(unit)}. Partager ce que les élèves savent déjà par penser-partager-pair. Activer les connaissances antérieures avec supports visuels et objets réels.`;
    }

    const strategiesFrench = [
      `Jeu de révision rapide : Les élèves partagent une chose qu'ils se souviennent de la leçon d'hier sur ${this.extractTopicFromUnit(unit)}.`,
      `Promenade d'images : Montrer des images liées au sujet d'aujourd'hui et faire des prédictions et connexions.`,
      `Tableau SVA : Qu'est-ce qu'on Sait, Veut savoir, et qu'on a Appris sur ${this.extractTopicFromUnit(unit)}.`,
      `Activité de mouvement : Jouer le vocabulaire ou concepts de ${unit.keyVocabulary.slice(0, 3).join(', ')}.`,
      `Question du jour : Poser une question engageante liée à ${this.extractTopicFromUnit(unit)} pour discussion.`
    ];

    return strategiesFrench[Math.floor(Math.random() * strategiesFrench.length)];
  }

  /**
   * Generate Action activity (25 minutes)
   */
  private generateAction(unit: UnitContext, content: any, lessonNumber: number, totalLessons: number): string {
    const activities = this.getSubjectSpecificActivities(unit, lessonNumber, totalLessons);
    return activities.action;
  }

  /**
   * Generate Action activity in French
   */
  private generateActionFrench(unit: UnitContext, content: any, lessonNumber: number): string {
    const activitiesFr = this.getSubjectSpecificActivitiesFrench(unit, lessonNumber);
    return activitiesFr.action;
  }

  /**
   * Generate Consolidation activity (10 minutes)
   */
  private generateConsolidation(unit: UnitContext, content: any, isCulminating: boolean): string {
    if (isCulminating) {
      return `Celebration circle: Students share their proudest learning from this unit. Create a class reflection chart about ${this.extractTopicFromUnit(unit)}. Prepare for next unit by making connections.`;
    }

    const consolidationStrategies = [
      `Exit ticket: Students write or draw one thing they learned about ${this.extractTopicFromUnit(unit)} today.`,
      `Partner share: Turn and talk about the most interesting discovery from today's lesson.`,
      `Class reflection: Together, add new learning to our unit anchor chart about ${this.extractTopicFromUnit(unit)}.`,
      `Quick assessment: Students show thumbs up/down for their confidence with today's learning goal.`,
      `Looking ahead: Preview tomorrow's learning and make connections to today's work.`
    ];

    return consolidationStrategies[Math.floor(Math.random() * consolidationStrategies.length)];
  }

  /**
   * Generate Consolidation activity in French
   */
  private generateConsolidationFrench(unit: UnitContext, content: any, isCulminating: boolean): string {
    if (isCulminating) {
      return `Cercle de célébration : Les élèves partagent leur apprentissage le plus fier de cette unité. Créer un tableau de réflexion de classe sur ${this.extractTopicFromUnit(unit)}. Préparer pour la prochaine unité en faisant des connexions.`;
    }

    const strategiesFrench = [
      `Billet de sortie : Les élèves écrivent ou dessinent une chose qu'ils ont apprise sur ${this.extractTopicFromUnit(unit)} aujourd'hui.`,
      `Partage avec partenaire : Tournez et parlez de la découverte la plus intéressante de la leçon d'aujourd'hui.`,
      `Réflexion de classe : Ensemble, ajouter le nouvel apprentissage à notre tableau d'ancrage sur ${this.extractTopicFromUnit(unit)}.`,
      `Évaluation rapide : Les élèves montrent pouce en haut/bas pour leur confiance avec l'objectif d'aujourd'hui.`,
      `Regarder vers l'avant : Prévisualiser l'apprentissage de demain et faire des connexions au travail d'aujourd'hui.`
    ];

    return strategiesFrench[Math.floor(Math.random() * strategiesFrench.length)];
  }

  /**
   * Generate subject-specific content
   */
  private getSubjectSpecificContent(unit: UnitContext, lessonNumber: number, totalLessons: number) {
    // This would be expanded with detailed subject-specific content generation
    return {
      topic: this.extractTopicFromUnit(unit),
      phase: lessonNumber <= totalLessons * 0.3 ? 'introduction' : 
             lessonNumber >= totalLessons * 0.7 ? 'application' : 'development'
    };
  }

  /**
   * Generate subject-specific activities
   */
  private getSubjectSpecificActivities(unit: UnitContext, lessonNumber: number, totalLessons: number) {
    const activityTemplates: { [key: string]: string[] } = {
      'Français (Immersion)': [
        'Interactive read-aloud with {vocabulary} focus, followed by guided practice with picture cards and real objects. Students practice new words through partner conversations and role-play activities.',
        'Writing workshop: Students create simple sentences using {vocabulary} with teacher conferencing and peer support. Publishing and sharing work with the class.',
        'Phonological awareness games with French sounds, using songs, clapping, and movement. Focus on beginning sounds in {vocabulary} words.',
        'Guided reading in small groups with leveled French texts. Students practice reading strategies and discuss story elements.',
        'Drama and role-play activities using {vocabulary} and expressions. Students perform short scenarios and practice oral communication skills.'
      ],
      'Mathématiques': [
        'Hands-on exploration with manipulatives (counting bears, blocks, or number cards). Students work in pairs to solve problems and explain their thinking.',
        'Math games and centers rotation focusing on {concept}. Students practice skills through play-based learning with teacher observation and support.',
        'Problem-solving using real-world scenarios related to {topic}. Students use various strategies and share solutions with the class.',
        'Number talks and mental math practice. Students share different ways to think about numbers and make mathematical connections.',
        'Mathematical art and patterns exploration. Students create, extend, and describe patterns using various materials and tools.'
      ],
      'Sciences de la nature': [
        'Scientific observation and recording using charts, drawings, and simple measurements. Students work like scientists to gather data about {topic}.',
        'Hands-on investigation with guided inquiry. Students make predictions, test ideas, and draw conclusions about {phenomenon}.',
        'Nature walk and data collection related to {topic}. Students observe, compare, and classify items in their environment.',
        'Simple experiments with everyday materials. Students follow procedures, make observations, and discuss results.',
        'Model making and demonstration activities. Students create representations to show their understanding of {concept}.'
      ],
      'Sciences humaines': [
        'Community exploration through maps, pictures, and guest speakers. Students learn about {topic} and make connections to their own lives.',
        'Role-play and simulation activities about {community aspect}. Students take on different perspectives and practice social skills.',
        'Artifact investigation and storytelling. Students examine objects and pictures to learn about {topic} and share discoveries.',
        'Interview practice with family members or community helpers. Students prepare questions and gather information about {topic}.',
        'Timeline creation and sequence activities. Students organize information about {topic} and understand cause and effect.'
      ],
      'Arts visuels': [
        'Hands-on art creation using {medium} with focus on {technique}. Students explore materials, practice skills, and create original works.',
        'Artist study and style exploration. Students examine artworks, discuss techniques, and try similar approaches in their own art.',
        'Collaborative art project related to {theme}. Students work together to create a large-scale piece while practicing cooperation.',
        'Art appreciation and gallery walk. Students view, discuss, and reflect on various artworks and artistic styles.',
        'Mixed-media exploration combining {materials}. Students experiment with different techniques and create unique artistic expressions.'
      ],
      'Formation personnelle et sociale': [
        'Circle time discussion and sharing about {social skill}. Students practice listening, speaking, and empathy in a supportive environment.',
        'Problem-solving scenarios and role-play. Students practice {skill} through guided situations and peer support.',
        'Mindfulness and self-regulation activities. Students learn strategies for managing emotions and making positive choices.',
        'Cooperative games and team-building exercises. Students practice social skills while having fun and building relationships.',
        'Reflection and goal-setting activities. Students think about their growth in {skill} and plan next steps.'
      ]
    };

    const templates = activityTemplates[unit.subject] || ['Hands-on learning activity about {topic}'];
    const template = templates[lessonNumber % templates.length];

    return {
      action: template
        .replace('{vocabulary}', unit.keyVocabulary.slice(0, 3).join(', '))
        .replace('{topic}', this.extractTopicFromUnit(unit))
        .replace('{concept}', this.getSubjectConcept(unit))
        .replace('{phenomenon}', this.getSciencePhenomena(unit))
        .replace('{community aspect}', this.getCommunityAspect(unit))
        .replace('{medium}', this.getArtMedium(lessonNumber))
        .replace('{technique}', this.getArtSkill(lessonNumber))
        .replace('{theme}', unit.title)
        .replace('{materials}', this.getSubjectSpecificMaterials(unit.subject).join(', '))
        .replace('{social skill}', this.getSocialSkill(unit))
        .replace('{skill}', this.getSocialSkill(unit))
    };
  }

  /**
   * Generate subject-specific activities in French
   */
  private getSubjectSpecificActivitiesFrench(unit: UnitContext, lessonNumber: number) {
    const activitiesFr = [
      'Lecture interactive à voix haute avec focus sur {vocabulary}, suivie par pratique guidée avec cartes-images et objets réels. Les élèves pratiquent nouveaux mots par conversations partenaires et jeu de rôle.',
      'Atelier d\'écriture : Les élèves créent phrases simples utilisant {vocabulary} avec conférences enseignant et support pairs. Publication et partage travail avec classe.',
      'Jeux conscience phonologique avec sons français, utilisant chansons, applaudissements, et mouvement. Focus sur sons début dans mots {vocabulary}.',
      'Lecture guidée en petits groupes avec textes français nivelés. Élèves pratiquent stratégies lecture et discutent éléments histoire.',
      'Activités théâtre et jeu rôle utilisant {vocabulary} et expressions. Élèves performent courts scénarios et pratiquent compétences communication orale.'
    ];

    const template = activitiesFr[lessonNumber % activitiesFr.length];
    return {
      action: template.replace('{vocabulary}', unit.keyVocabulary.slice(0, 3).join(', '))
    };
  }

  // Helper methods for content generation
  private extractTopicFromUnit(unit: UnitContext): string {
    return unit.title.split(' ').slice(0, 2).join(' ').toLowerCase();
  }

  private getSubjectConcept(unit: UnitContext): string {
    const concepts: { [key: string]: string } = {
      'Mathématiques': 'number patterns',
      'Sciences de la nature': 'living things',
      'Sciences humaines': 'community',
      'Arts visuels': 'color and form',
      'Formation personnelle et sociale': 'friendship'
    };
    return concepts[unit.subject] || 'key concepts';
  }

  private getSciencePhenomena(unit: UnitContext): string {
    if (unit.title.toLowerCase().includes('winter')) return 'seasonal changes';
    if (unit.title.toLowerCase().includes('animal')) return 'animal behavior';
    if (unit.title.toLowerCase().includes('plant')) return 'plant growth';
    return 'natural phenomena';
  }

  private getScienceConcept(unit: UnitContext): string {
    if (unit.title.toLowerCase().includes('living')) return 'living vs non-living';
    if (unit.title.toLowerCase().includes('matter')) return 'states of matter';
    return 'scientific concepts';
  }

  private getCommunityAspect(unit: UnitContext): string {
    if (unit.title.toLowerCase().includes('helper')) return 'community helpers';
    if (unit.title.toLowerCase().includes('family')) return 'families';
    if (unit.title.toLowerCase().includes('neighbor')) return 'neighborhoods';
    return 'our community';
  }

  private getArtMedium(lessonNumber: number): string {
    const media = ['watercolor', 'crayon', 'collage', 'clay', 'markers', 'pastels'];
    return media[lessonNumber % media.length];
  }

  private getArtSkill(lessonNumber: number): string {
    const skills = ['color mixing', 'line drawing', 'shape recognition', 'texture creation', 'pattern making'];
    return skills[lessonNumber % skills.length];
  }

  private getArtStyle(lessonNumber: number): string {
    const styles = ['abstract art', 'landscape', 'portrait', 'still life', 'folk art'];
    return styles[lessonNumber % styles.length];
  }

  private getSocialSkill(unit: UnitContext): string {
    if (unit.title.toLowerCase().includes('friend')) return 'friendship skills';
    if (unit.title.toLowerCase().includes('emotion')) return 'emotional regulation';
    if (unit.title.toLowerCase().includes('conflict')) return 'problem solving';
    return 'social skills';
  }

  private getMathScenario(unit: UnitContext, lessonNumber: number): string {
    const scenarios = [
      'classroom supplies counting',
      'snack sharing problems',
      'playground equipment',
      'story character adventures',
      'seasonal counting'
    ];
    return scenarios[lessonNumber % scenarios.length];
  }

  /**
   * Generate appropriate materials for the lesson
   */
  private generateMaterials(unit: UnitContext, lessonNumber: number): string[] {
    const baseMaterials = ['chart paper', 'markers', 'sticky notes', 'whiteboard'];
    const subjectMaterials = this.getSubjectSpecificMaterials(unit.subject);
    const vocabularyMaterials = unit.keyVocabulary.length > 0 ? 
      [`${unit.keyVocabulary.slice(0, 3).join('/')} picture cards`] : [];

    return [...baseMaterials, ...subjectMaterials.slice(0, 3), ...vocabularyMaterials];
  }

  private getSubjectSpecificMaterials(subject: string): string[] {
    const materialsBySubject: { [key: string]: string[] } = {
      'Français (Immersion)': [
        'French picture books', 'vocabulary cards', 'audio recordings', 'sentence strips',
        'word wall cards', 'story props', 'writing journals', 'letter cards'
      ],
      'Mathématiques': [
        'counting bears', 'number cards', 'ten frames', 'manipulatives',
        'measuring tools', 'pattern blocks', 'dice', 'number lines'
      ],
      'Sciences de la nature': [
        'magnifying glasses', 'observation charts', 'collection containers', 'measuring cups',
        'science journals', 'real specimens', 'picture guides', 'simple tools'
      ],
      'Sciences humaines': [
        'community photos', 'maps', 'cultural artifacts', 'interview forms',
        'timeline materials', 'role-play props', 'family photos', 'books about community'
      ],
      'Arts visuels': [
        'watercolors', 'brushes', 'colored paper', 'glue sticks',
        'scissors', 'crayons', 'collage materials', 'clay'
      ],
      'Formation personnelle et sociale': [
        'emotion cards', 'problem-solving scenarios', 'cooperative game materials', 'feeling thermometer',
        'conflict resolution steps', 'friendship books', 'mindfulness tools', 'reflection journals'
      ]
    };

    return materialsBySubject[subject] || ['learning materials', 'hands-on supplies'];
  }

  /**
   * Generate appropriate accommodations
   */
  private generateAccommodations(unit: UnitContext): string[] {
    const baseAccommodations = [
      'Visual supports for all vocabulary',
      'Extra processing time',
      'Partner support available',
      'Alternative ways to show understanding'
    ];

    const subjectAccommodations: { [key: string]: string[] } = {
      'Français (Immersion)': [
        'English translation support when needed',
        'Picture communication boards',
        'Gesture and movement supports'
      ],
      'Mathématiques': [
        'Concrete manipulatives available',
        'Number lines and hundreds charts',
        'Calculator support for complex calculations'
      ],
      'Sciences de la nature': [
        'Hands-on materials for all students',
        'Pre-drawn observation sheets',
        'Simplified recording methods'
      ],
      'Sciences humaines': [
        'Personal photo connections',
        'Simplified maps and charts',
        'Choice in presentation format'
      ],
      'Arts visuels': [
        'Adaptive art tools',
        'Step-by-step visual guides',
        'Choice of art medium'
      ],
      'Formation personnelle et sociale': [
        'Emotion regulation breaks',
        'Small group discussions',
        'Choice in sharing level'
      ]
    };

    const specificAccommodations = subjectAccommodations[unit.subject] || [];
    return [...baseAccommodations, ...specificAccommodations.slice(0, 2)];
  }

  /**
   * Generate learning goals
   */
  private generateLearningGoals(unit: UnitContext, lessonNumber: number): string {
    const goalTemplates: { [key: string]: string[] } = {
      'Français (Immersion)': [
        'Students will use {vocabulary} to communicate their ideas in French',
        'Students will listen to and understand French instructions and stories',
        'Students will read simple French texts with familiar vocabulary',
        'Students will write simple sentences using French vocabulary'
      ],
      'Mathématiques': [
        'Students will demonstrate number sense through hands-on activities',
        'Students will solve simple math problems using multiple strategies',
        'Students will recognize and create patterns using various materials',
        'Students will communicate their mathematical thinking clearly'
      ],
      'Sciences de la nature': [
        'Students will observe and record information about {topic}',
        'Students will make predictions and test their ideas about {phenomenon}',
        'Students will classify and compare {objects/living things}',
        'Students will communicate their scientific discoveries'
      ],
      'Sciences humaines': [
        'Students will identify and describe {community aspect}',
        'Students will make connections between their lives and their community',
        'Students will show respect for diverse perspectives and experiences',
        'Students will demonstrate understanding of {social concept}'
      ],
      'Arts visuels': [
        'Students will explore {medium} to create original artwork',
        'Students will practice {technique} with guidance and support',
        'Students will describe their artistic choices and processes',
        'Students will appreciate and respect diverse artistic expressions'
      ],
      'Formation personnelle et sociale': [
        'Students will practice {social skill} in group activities',
        'Students will identify and express their emotions appropriately',
        'Students will demonstrate problem-solving strategies',
        'Students will show empathy and respect for others'
      ]
    };

    const templates = goalTemplates[unit.subject] || ['Students will learn about {topic}'];
    const template = templates[lessonNumber % templates.length];

    return template
      .replace('{vocabulary}', unit.keyVocabulary.slice(0, 3).join(', '))
      .replace('{topic}', this.extractTopicFromUnit(unit))
      .replace('{phenomenon}', this.getSciencePhenomena(unit))
      .replace('{objects/living things}', 'natural objects')
      .replace('{community aspect}', this.getCommunityAspect(unit))
      .replace('{social concept}', 'community cooperation')
      .replace('{medium}', this.getArtMedium(lessonNumber))
      .replace('{technique}', this.getArtSkill(lessonNumber))
      .replace('{social skill}', this.getSocialSkill(unit));
  }

  /**
   * Generate learning goals in French
   */
  private generateLearningGoalsFrench(unit: UnitContext, lessonNumber: number): string {
    const goalTemplates = [
      'Les élèves utiliseront {vocabulary} pour communiquer leurs idées en français',
      'Les élèves écouteront et comprendront les instructions et histoires françaises',
      'Les élèves liront des textes français simples avec vocabulaire familier',
      'Les élèves écriront des phrases simples utilisant le vocabulaire français'
    ];

    const template = goalTemplates[lessonNumber % goalTemplates.length];
    return template.replace('{vocabulary}', unit.keyVocabulary.slice(0, 3).join(', '));
  }

  /**
   * Generate assessment notes
   */
  private generateAssessmentNotes(unit: UnitContext, lessonNumber: number, totalLessons: number): string {
    if (lessonNumber === 1) {
      return `Observe student engagement and prior knowledge about ${this.extractTopicFromUnit(unit)}. Note participation in discussions and willingness to try new vocabulary.`;
    }
    
    if (lessonNumber === totalLessons) {
      return `Document student growth throughout the unit. Assess understanding of key concepts and ability to apply learning in new situations.`;
    }

    const assessmentNotes = [
      `Monitor student use of {vocabulary} in context and provide feedback`,
      `Observe problem-solving strategies and mathematical thinking processes`,
      `Document scientific observations and inquiry skills development`,
      `Note social skill development and peer interactions`,
      `Assess creative expression and artistic technique development`,
      `Track emotional regulation and conflict resolution skills`
    ];

    const note = assessmentNotes[lessonNumber % assessmentNotes.length];
    return note.replace('{vocabulary}', unit.keyVocabulary.slice(0, 2).join(' and '));
  }

  /**
   * Determine assessment type based on lesson progression
   */
  private determineAssessmentType(lessonNumber: number, totalLessons: number): 'diagnostic' | 'formative' | 'summative' {
    if (lessonNumber === 1) return 'diagnostic';
    if (lessonNumber === totalLessons) return 'summative';
    return 'formative';
  }

  /**
   * Determine grouping strategy
   */
  private determineGrouping(unit: UnitContext, lessonNumber: number): string {
    const groupingOptions = ['whole class', 'pairs', 'small groups', 'individual', 'mixed grouping'];
    return groupingOptions[lessonNumber % groupingOptions.length];
  }

  /**
   * Generate substitute teacher notes
   */
  private generateSubNotes(unit: UnitContext, content: any): string {
    return `All materials are organized and labeled. Lesson follows three-part structure (15 min Minds On, 25 min Action, 10 min Consolidation). Students are familiar with routines. Contact office for any questions.`;
  }

  /**
   * Select curriculum expectations for the lesson
   */
  private selectExpectationsForLesson(unit: UnitContext, lessonNumber: number, totalLessons: number): string[] {
    if (unit.expectations.length === 0) return [];
    
    // Distribute expectations across lessons
    const expectationsPerLesson = Math.max(Math.floor(unit.expectations.length / totalLessons), 1);
    const startIndex = Math.min((lessonNumber - 1) * expectationsPerLesson, unit.expectations.length - 1);
    const endIndex = Math.min(startIndex + expectationsPerLesson, unit.expectations.length);
    
    return unit.expectations.slice(startIndex, endIndex).map(exp => exp.id);
  }

  /**
   * Ensure lesson title is unique across the system
   */
  private ensureUniqueTitle(baseTitle: string): string {
    let uniqueTitle = baseTitle;
    let counter = 1;

    while (this.usedTitles.has(uniqueTitle)) {
      uniqueTitle = `${baseTitle} (${counter})`;
      counter++;
    }

    this.usedTitles.add(uniqueTitle);
    return uniqueTitle;
  }

  /**
   * Create the lesson in the database
   */
  private async createLesson(
    unit: UnitContext, 
    template: LessonTemplate, 
    date: Date
  ): Promise<void> {
    try {
      await this.prisma.eTFOLessonPlan.create({
        data: {
          userId: this.emilyUserId,
          unitPlanId: unit.id,
          title: template.title,
          titleFr: template.titleFr,
          date,
          duration: template.duration,
          mindsOn: template.mindsOn,
          mindsOnFr: template.mindsOnFr,
          action: template.action,
          actionFr: template.actionFr,
          consolidation: template.consolidation,
          consolidationFr: template.consolidationFr,
          learningGoals: template.learningGoals,
          learningGoalsFr: template.learningGoalsFr,
          materials: JSON.stringify(template.materials),
          grouping: template.grouping,
          accommodations: JSON.stringify(template.accommodations),
          assessmentType: template.assessmentType,
          assessmentNotes: template.assessmentNotes,
          grade: template.grade,
          language: template.language,
          subject: template.subject,
          isSubFriendly: template.isSubFriendly,
          subNotes: template.subNotes,
          expectations: {
            create: template.expectationIds.map(expId => ({
              expectationId: expId
            }))
          }
        }
      });
    } catch (error) {
      logger.error(`Failed to create lesson "${template.title}":`, getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Health check for the framework
   */
  async checkHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    try {
      if (!this.emilyUserId) {
        await this.initialize();
      }

      const unitCount = await this.prisma.unitPlan.count({
        where: { userId: this.emilyUserId }
      });

      const lessonCount = await this.prisma.eTFOLessonPlan.count({
        where: { userId: this.emilyUserId }
      });

      return {
        healthy: true,
        details: {
          emilyUserId: this.emilyUserId,
          unitPlansAvailable: unitCount,
          lessonsGenerated: lessonCount,
          uniqueTitlesTracked: this.usedTitles.size
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}