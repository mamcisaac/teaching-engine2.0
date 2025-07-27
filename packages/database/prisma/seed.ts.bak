import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with ETFO-aligned models...');

  // Clear existing data (delete in child-to-parent order to satisfy FK constraints)
  console.log('Clearing existing data...');

  // Clear ETFO-aligned models and active tables only
  await prisma.templateRating.deleteMany();
  await prisma.templateVariation.deleteMany();
  await prisma.planTemplate.deleteMany();
  await prisma.recentPlanAccess.deleteMany();
  await prisma.activityCollectionItem.deleteMany();
  await prisma.activityCollection.deleteMany();
  await prisma.activityRating.deleteMany();
  await prisma.activityImport.deleteMany();
  await prisma.externalActivity.deleteMany();
  await prisma.daybookEntryExpectation.deleteMany();
  await prisma.daybookEntry.deleteMany();
  await prisma.eTFOLessonPlanResource.deleteMany();
  await prisma.eTFOLessonPlanExpectation.deleteMany();
  await prisma.eTFOLessonPlan.deleteMany();
  await prisma.unitPlanResource.deleteMany();
  await prisma.unitPlanExpectation.deleteMany();
  await prisma.unitPlan.deleteMany();
  await prisma.longRangePlanExpectation.deleteMany();
  await prisma.longRangePlan.deleteMany();
  await prisma.curriculumExpectationEmbedding.deleteMany();
  await prisma.curriculumExpectation.deleteMany();
  await prisma.expectationCluster.deleteMany();
  await prisma.curriculumImport.deleteMany();
  await prisma.classroomAnnouncement.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.unavailableBlock.deleteMany();
  await prisma.classRoutine.deleteMany();
  await prisma.substitutePlan.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.weeklyPlannerState.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data successfully');

  // Create Emily McIsaac's account - Grade 1 French Immersion teacher at West Kent Elementary, PEI
  const emilyHashedPassword = await bcrypt.hash('myhusbandisthebest', 12);
  const emilyUser = await prisma.user.create({
    data: {
      email: 'emmcisaac@gmail.com',
      name: 'Emily McIsaac',
      password: emilyHashedPassword,
      role: 'teacher',
      preferredLanguage: 'en', // Bilingual support - primary interface language
    },
  });

  console.log('Created Emily McIsaac user account (West Kent Elementary):', emilyUser.email);

  // Create a test user for development
  const testHashedPassword = await bcrypt.hash('Password123!', 12);
  const testUser = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      name: 'Test Teacher',
      password: testHashedPassword,
      role: 'teacher',
      preferredLanguage: 'en',
    },
  });

  console.log('Created test user:', testUser.email);

  // Create Grade 1 French Immersion curriculum expectations for Emily
  console.log('Creating Grade 1 French Immersion curriculum expectations...');

  // French Language Arts - Communication orale (Oral Communication)
  const oralCommunicationExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'CO1.1',
      description: 'Listen and respond to simple instructions and questions in French',
      descriptionFr: 'Écouter et répondre à des instructions et questions simples en français',
      strand: 'Communication orale',
      strandFr: 'Communication orale',
      subject: 'Français langue première',
      grade: 1,
    },
  });

  // French Language Arts - Lecture (Reading)
  const readingExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'L1.1',
      description: 'Read simple texts with familiar vocabulary and predictable patterns',
      descriptionFr:
        'Lire des textes simples avec un vocabulaire familier et des structures prévisibles',
      strand: 'Lecture',
      strandFr: 'Lecture',
      subject: 'Français langue première',
      grade: 1,
    },
  });

  // French Language Arts - Écriture (Writing)
  const writingExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'E1.1',
      description: 'Write simple sentences and short texts using familiar vocabulary',
      descriptionFr:
        'Écrire des phrases simples et des textes courts en utilisant un vocabulaire familier',
      strand: 'Écriture',
      strandFr: 'Écriture',
      subject: 'Français langue première',
      grade: 1,
    },
  });

  // Mathematics in French - Number Sense
  const mathNumberExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'N1.1',
      description: 'Count forwards and backwards to 20 in French',
      descriptionFr: 'Compter de 1 à 20 et à rebours en français',
      strand: 'Sens du nombre',
      strandFr: 'Sens du nombre',
      subject: 'Mathématiques',
      grade: 1,
    },
  });

  // Science in French - Living Things
  const scienceExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'SV1.1',
      description: 'Observe and describe characteristics of living things in French',
      descriptionFr: 'Observer et décrire les caractéristiques des êtres vivants en français',
      strand: 'Sciences de la vie',
      strandFr: 'Sciences de la vie',
      subject: 'Sciences',
      grade: 1,
    },
  });

  // Social Studies in French - Community
  const socialStudiesExpectation = await prisma.curriculumExpectation.create({
    data: {
      code: 'SS1.1',
      description: 'Identify community helpers and their roles using French vocabulary',
      descriptionFr:
        'Identifier les aides communautaires et leurs rôles en utilisant le vocabulaire français',
      strand: 'Communauté',
      strandFr: 'Communauté',
      subject: 'Études sociales',
      grade: 1,
    },
  });

  console.log('Created sample curriculum expectations');

  // Create Emily's 2025-2026 Long Range Plans for French Immersion
  console.log('Creating 2025-2026 Long Range Plans for French Immersion...');

  // French Language Arts Long Range Plan
  const frenchLongRangePlan = await prisma.longRangePlan.create({
    data: {
      userId: emilyUser.id,
      title: 'Grade 1 French Language Arts - Long Range Plan',
      titleFr: '1re année - Français langue première - Plan à long terme',
      grade: 1,
      subject: 'Français langue première',
      academicYear: '2025-2026',
      term: 'Full Year',
      description:
        'Comprehensive French language development through oral communication, reading, and writing in a French immersion environment',
      descriptionFr:
        "Développement complet de la langue française par la communication orale, la lecture et l'écriture dans un environnement d'immersion française",
      goals:
        'Students will develop foundational French language skills through engaging, age-appropriate activities',
      goalsFr:
        'Les élèves développeront des compétences fondamentales en français par des activités engageantes et adaptées à leur âge',
      overarchingQuestions:
        'How do we communicate our thoughts and feelings in French? What stories do we want to tell?',
      assessmentOverview:
        'Ongoing assessment through observation, conversation, and authentic tasks',
      resourceNeeds:
        'French picture books, manipulatives with French labels, audio-visual materials, word wall supplies',
      professionalGoals:
        'Develop expertise in differentiated instruction for French language learners',
      expectations: {
        create: [
          {
            expectationId: oralCommunicationExpectation.id,
            plannedTerm: 'Full Year',
          },
          {
            expectationId: readingExpectation.id,
            plannedTerm: 'Full Year',
          },
          {
            expectationId: writingExpectation.id,
            plannedTerm: 'Full Year',
          },
        ],
      },
    },
  });

  // Mathematics in French Long Range Plan
  const mathLongRangePlan = await prisma.longRangePlan.create({
    data: {
      userId: emilyUser.id,
      title: 'Grade 1 Mathematics in French - Long Range Plan',
      titleFr: '1re année - Mathématiques en français - Plan à long terme',
      grade: 1,
      subject: 'Mathématiques',
      academicYear: '2025-2026',
      term: 'Full Year',
      description:
        'Mathematics instruction delivered in French to build both mathematical thinking and French vocabulary',
      descriptionFr:
        'Enseignement des mathématiques en français pour développer la pensée mathématique et le vocabulaire français',
      goals:
        'Students will develop number sense, spatial reasoning, and problem-solving skills while strengthening French language',
      goalsFr:
        'Les élèves développeront le sens du nombre, le raisonnement spatial et les compétences de résolution de problèmes tout en renforçant la langue française',
      overarchingQuestions:
        'How do numbers help us understand our world? Comment les nombres nous aident-ils à comprendre notre monde?',
      expectations: {
        create: {
          expectationId: mathNumberExpectation.id,
          plannedTerm: 'Full Year',
        },
      },
    },
  });

  // Integrated Studies Long Range Plan (Science and Social Studies)
  const integratedLongRangePlan = await prisma.longRangePlan.create({
    data: {
      userId: emilyUser.id,
      title: 'Grade 1 Integrated Studies in French - Long Range Plan',
      titleFr: '1re année - Études intégrées en français - Plan à long terme',
      grade: 1,
      subject: 'Études intégrées',
      academicYear: '2025-2026',
      term: 'Full Year',
      description:
        'Integrated approach to science and social studies delivered in French through inquiry-based learning',
      descriptionFr:
        "Approche intégrée aux sciences et études sociales en français par l'apprentissage par enquête",
      goals:
        'Students will explore their world through French language while developing scientific thinking and social awareness',
      goalsFr:
        'Les élèves exploreront leur monde en français tout en développant la pensée scientifique et la conscience sociale',
      overarchingQuestions: 'Who are we and how do we connect to our community and environment?',
      expectations: {
        create: [
          {
            expectationId: scienceExpectation.id,
            plannedTerm: 'Full Year',
          },
          {
            expectationId: socialStudiesExpectation.id,
            plannedTerm: 'Full Year',
          },
        ],
      },
    },
  });

  // Create French Immersion Unit Plans for Emily
  console.log('Creating French Immersion Unit Plans...');

  // Unit 1: Welcome to French / Bienvenue en français (September)
  const welcomeUnit = await prisma.unitPlan.create({
    data: {
      userId: emilyUser.id,
      longRangePlanId: frenchLongRangePlan.id,
      title: 'Bienvenue en français - Welcome to French',
      titleFr: 'Bienvenue en français',
      startDate: new Date('2025-09-08'), // First day of school for students
      endDate: new Date('2025-09-26'), // 3 weeks
      bigIdeas:
        'French is a beautiful language we can use to communicate our thoughts and feelings',
      bigIdeasFr:
        'Le français est une belle langue que nous pouvons utiliser pour communiquer nos pensées et nos sentiments',
      description:
        'Introduction to French classroom routines, basic greetings, and classroom vocabulary',
      descriptionFr:
        'Introduction aux routines de la classe française, aux salutations de base et au vocabulaire de la classe',
      essentialQuestions: [
        'How do we say hello and goodbye in French?',
        'What are the names of things in our classroom?',
        'How do we ask for help in French?',
      ],
      keyVocabulary: [
        'bonjour',
        'au revoir',
        'merci',
        'oui',
        'non',
        'crayon',
        'livre',
        'chaise',
        'pupitre',
        'aide-moi',
      ],
      assessmentPlan: 'Ongoing observation of oral communication, picture vocabulary assessments',
      crossCurricularConnections:
        'Mathematics: counting in French, Art: classroom labels and decorations',
      expectations: {
        create: {
          expectationId: oralCommunicationExpectation.id,
        },
      },
    },
  });

  // Unit 2: Numbers and Colors / Les nombres et les couleurs (October)
  const numbersColorsUnit = await prisma.unitPlan.create({
    data: {
      userId: emilyUser.id,
      longRangePlanId: mathLongRangePlan.id,
      title: 'Les nombres et les couleurs - Numbers and Colors',
      titleFr: 'Les nombres et les couleurs',
      startDate: new Date('2025-09-29'),
      endDate: new Date('2025-10-24'), // 4 weeks
      bigIdeas: 'Numbers and colors help us describe and organize our world',
      bigIdeasFr: 'Les nombres et les couleurs nous aident à décrire et organiser notre monde',
      description:
        'Learning numbers 1-20 and basic colors through songs, games, and hands-on activities',
      descriptionFr:
        'Apprendre les nombres 1-20 et les couleurs de base par des chansons, jeux et activités pratiques',
      essentialQuestions: [
        'How do we count to 20 in French?',
        'What colors do we see around us?',
        'How can we use numbers and colors together?',
      ],
      keyVocabulary: [
        'un',
        'deux',
        'trois',
        'quatre',
        'cinq',
        'rouge',
        'bleu',
        'jaune',
        'vert',
        'orange',
      ],
      assessmentPlan: 'Counting assessments, color recognition games, number writing practice',
      expectations: {
        create: {
          expectationId: mathNumberExpectation.id,
        },
      },
    },
  });

  // Unit 3: My Family and Friends / Ma famille et mes amis (November)
  const familyUnit = await prisma.unitPlan.create({
    data: {
      userId: emilyUser.id,
      longRangePlanId: integratedLongRangePlan.id,
      title: 'Ma famille et mes amis - My Family and Friends',
      titleFr: 'Ma famille et mes amis',
      startDate: new Date('2025-10-27'),
      endDate: new Date('2025-11-21'), // 4 weeks
      bigIdeas:
        'Families come in many forms and we show love and respect for the people in our lives',
      bigIdeasFr:
        "Les familles prennent plusieurs formes et nous montrons de l'amour et du respect pour les gens dans nos vies",
      description: 'Exploring family structures, relationships, and community connections',
      descriptionFr:
        'Explorer les structures familiales, les relations et les connexions communautaires',
      essentialQuestions: [
        'Who is in my family?',
        'How do families show love and care?',
        'How are families the same and different?',
      ],
      keyVocabulary: [
        'maman',
        'papa',
        'grand-maman',
        'grand-papa',
        'frère',
        'sœur',
        'ami',
        'amie',
        'famille',
      ],
      assessmentPlan: 'Family drawings with French labels, oral presentations about family members',
      expectations: {
        create: {
          expectationId: socialStudiesExpectation.id,
        },
      },
    },
  });

  // Create sample French Immersion Lesson Plans
  console.log('Creating French Immersion Lesson Plans...');

  // Welcome to French lesson
  const welcomeLessonPlan = await prisma.eTFOLessonPlan.create({
    data: {
      userId: emilyUser.id,
      unitPlanId: welcomeUnit.id,
      title: 'First Day Greetings and Classroom Vocabulary',
      titleFr: 'Premier jour - Salutations et vocabulaire de la classe',
      date: new Date('2025-09-08'), // First day of school
      duration: 45,
      grade: 1,
      subject: 'Français langue première',
      language: 'fr',
      learningGoals:
        'Students will learn basic French greetings and identify 5 classroom objects in French',
      learningGoalsFr:
        'Les élèves apprendront les salutations de base en français et identifieront 5 objets de la classe en français',
      mindsOn:
        'Welcome song "Bonjour mes amis" with actions and gestures to introduce French sounds and rhythm',
      mindsOnFr:
        'Chanson de bienvenue "Bonjour mes amis" avec actions et gestes pour introduire les sons et le rythme français',
      action:
        'Classroom treasure hunt where students find and name objects in French using picture cards and real objects',
      actionFr:
        'Chasse au trésor dans la classe où les élèves trouvent et nomment des objets en français en utilisant des cartes-images et de vrais objets',
      consolidation:
        'Circle time sharing: each student says "Bonjour" and names one classroom object they learned',
      consolidationFr:
        'Partage en cercle : chaque élève dit "Bonjour" et nomme un objet de la classe qu\'il a appris',
      grouping: 'whole class and pairs',
      materials: [
        'Picture cards with classroom vocabulary',
        'Real classroom objects with French labels',
        '"Bonjour mes amis" song lyrics and audio',
        'Welcome chart in French and English',
      ],
      accommodations: [
        'Visual supports for all vocabulary words',
        'Gestures and actions to support language learning',
        'Picture cards for non-verbal students',
      ],
      assessmentType: 'formative',
      assessmentNotes: 'Observe student participation in greetings and vocabulary identification',
      isSubFriendly: true,
      subNotes:
        'All materials are labeled and organized. Song is simple to learn with actions provided.',
      expectations: {
        create: {
          expectationId: oralCommunicationExpectation.id,
        },
      },
    },
  });

  // Numbers and Colors lesson
  const numbersLessonPlan = await prisma.eTFOLessonPlan.create({
    data: {
      userId: emilyUser.id,
      unitPlanId: numbersColorsUnit.id,
      title: 'Counting to 10 with Colors',
      titleFr: "Compter jusqu'à 10 avec les couleurs",
      date: new Date('2025-09-30'),
      duration: 50,
      grade: 1,
      subject: 'Mathématiques',
      language: 'fr',
      learningGoals: 'Students will count objects to 10 in French and identify basic colors',
      learningGoalsFr:
        "Les élèves compteront des objets jusqu'à 10 en français et identifieront les couleurs de base",
      mindsOn: 'French counting song "Un, deux, trois" with colored scarves and movement',
      mindsOnFr:
        'Chanson de comptage française "Un, deux, trois" avec des foulards colorés et du mouvement',
      action:
        'Color sorting activity: count colored bears into groups while practicing numbers and colors in French',
      actionFr:
        'Activité de tri de couleurs : compter les ours colorés en groupes tout en pratiquant les nombres et couleurs en français',
      consolidation:
        'Each student presents their colored group saying "J\'ai [number] ours [color]"',
      consolidationFr:
        'Chaque élève présente son groupe coloré en disant "J\'ai [nombre] ours [couleur]"',
      grouping: 'pairs and individual',
      materials: [
        'Colored counting bears (10 each of red, blue, yellow, green)',
        'Sorting mats with color labels in French',
        'Number cards 1-10 in French',
        'Color scarves for movement activity',
      ],
      accommodations: [
        'Number line visible for counting support',
        'Color word cards with pictures',
        'Manipulatives for hands-on counting',
      ],
      assessmentType: 'formative',
      assessmentNotes: 'Observe accurate counting and color naming in French',
      isSubFriendly: true,
      subNotes: 'Materials are clearly labeled. Counting song is posted with actions.',
      expectations: {
        create: {
          expectationId: mathNumberExpectation.id,
        },
      },
    },
  });

  // Student creation removed - app does not store student data

  // Create Emily's daybook entries
  console.log('Creating French Immersion daybook entries...');
  await prisma.daybookEntry.create({
    data: {
      userId: emilyUser.id,
      date: new Date('2025-09-08'),
      lessonPlanId: welcomeLessonPlan.id,
      whatWorked:
        'Students responded enthusiastically to the French greeting song and actions. Visual supports were very effective.',
      whatWorkedFr:
        'Les élèves ont répondu avec enthousiasme à la chanson de salutation française et aux actions. Les supports visuels étaient très efficaces.',
      whatDidntWork:
        'Some students were shy about speaking French aloud - need more encouragement and practice opportunities.',
      whatDidntWorkFr:
        "Certains élèves étaient timides de parler français à voix haute - besoin de plus d'encouragement et d'opportunités de pratique.",
      nextSteps:
        'Create more low-pressure speaking opportunities. Continue with lots of modeling and repetition.',
      nextStepsFr:
        "Créer plus d'opportunités de parole sans pression. Continuer avec beaucoup de modélisation et de répétition.",
      classEngagement: 'Very high - students were curious and excited about learning French',
      commonChallenges:
        'Initial hesitation with pronunciation, some confusion between English and French responses',
      notableAchievements:
        'Most students successfully learned "bonjour" and can identify 3 classroom objects in French',
      overallRating: 4,
      wouldReuseLesson: true,
      expectations: {
        create: {
          expectationId: oralCommunicationExpectation.id,
          coverage: 'introduced',
        },
      },
    },
  });

  // Create Emily's French Immersion class routines
  console.log('Creating French Immersion class routines...');
  await prisma.classRoutine.create({
    data: {
      userId: emilyUser.id,
      title: 'Cercle du matin - Morning Circle',
      description:
        'Daily French greeting circle with calendar, weather, and feelings check-in. All conducted in French with visual supports.',
      category: 'morning',
      timeOfDay: '9:00 AM',
      priority: 1,
      isActive: true,
    },
  });

  await prisma.classRoutine.create({
    data: {
      userId: emilyUser.id,
      title: 'French Commands for Transitions',
      description:
        'Use consistent French commands for classroom transitions: "Levez-vous" (stand up), "Assoyez-vous" (sit down), "Rangez vos affaires" (tidy up)',
      category: 'transition',
      timeOfDay: 'Throughout day',
      priority: 1,
      isActive: true,
    },
  });

  await prisma.classRoutine.create({
    data: {
      userId: emilyUser.id,
      title: 'Lecture silencieuse - French Reading Time',
      description:
        'Independent reading time with French picture books and beginning readers. Students practice looking at pictures and familiar words.',
      category: 'other',
      timeOfDay: '2:00 PM',
      priority: 2,
      isActive: true,
    },
  });

  await prisma.classRoutine.create({
    data: {
      userId: emilyUser.id,
      title: 'French Bathroom Routines',
      description:
        'Students ask "Puis-je aller aux toilettes?" and use French hand signals. Bathroom pass has French instructions.',
      category: 'other',
      timeOfDay: 'As needed',
      priority: 3,
      isActive: true,
    },
  });

  await prisma.classRoutine.create({
    data: {
      userId: emilyUser.id,
      title: 'End of Day - Au revoir',
      description:
        'Closing circle in French: review the day, practice "Au revoir" and "À bientôt", pack up routine with French commands',
      category: 'dismissal',
      timeOfDay: '3:15 PM',
      priority: 1,
      isActive: true,
    },
  });

  // Create 2025-2026 PEI school calendar events
  console.log('Creating 2025-2026 PEI school calendar events...');

  // First day of school for teachers
  await prisma.calendarEvent.create({
    data: {
      title: 'First Day for Teachers',
      start: new Date('2025-09-04'),
      end: new Date('2025-09-04'),
      allDay: true,
      eventType: 'PD_DAY',
      teacherId: emilyUser.id,
      description: 'Teachers return - setup and preparation day',
    },
  });

  // First day of school for students
  await prisma.calendarEvent.create({
    data: {
      title: 'First Day of School for Students',
      start: new Date('2025-09-08'),
      end: new Date('2025-09-08'),
      allDay: true,
      eventType: 'CUSTOM',
      teacherId: emilyUser.id,
      description: 'Welcome back Grade 1 French Immersion students!',
    },
  });

  // Thanksgiving
  await prisma.calendarEvent.create({
    data: {
      title: 'Thanksgiving Holiday',
      start: new Date('2025-10-13'),
      end: new Date('2025-10-13'),
      allDay: true,
      eventType: 'HOLIDAY',
      description: 'Thanksgiving Day - No school',
    },
  });

  // Remembrance Day
  await prisma.calendarEvent.create({
    data: {
      title: 'Remembrance Day',
      start: new Date('2025-11-11'),
      end: new Date('2025-11-11'),
      allDay: true,
      eventType: 'HOLIDAY',
      description: 'Remembrance Day - No school',
    },
  });

  // Winter Break
  await prisma.calendarEvent.create({
    data: {
      title: 'Winter Break Begins',
      start: new Date('2025-12-19'),
      end: new Date('2025-12-19'),
      allDay: true,
      eventType: 'HOLIDAY',
      description: 'Last day before winter break',
    },
  });

  // Back from Winter Break
  await prisma.calendarEvent.create({
    data: {
      title: 'Back from Winter Break',
      start: new Date('2026-01-05'),
      end: new Date('2026-01-05'),
      allDay: true,
      eventType: 'CUSTOM',
      description: 'Students return from winter break',
    },
  });

  // March Break
  await prisma.calendarEvent.create({
    data: {
      title: 'March Break',
      start: new Date('2026-03-16'),
      end: new Date('2026-03-20'),
      allDay: true,
      eventType: 'HOLIDAY',
      description: 'March Break - No school',
    },
  });

  // French Immersion specific events
  await prisma.calendarEvent.create({
    data: {
      title: 'French Cultural Day',
      start: new Date('2025-11-15'),
      end: new Date('2025-11-15'),
      allDay: true,
      eventType: 'CUSTOM',
      teacherId: emilyUser.id,
      description:
        'School-wide French cultural celebration with activities, food, and performances',
    },
  });

  // Parent-Teacher Conferences
  await prisma.calendarEvent.create({
    data: {
      title: 'Parent-Teacher Conferences',
      start: new Date('2025-10-30T16:00:00'),
      end: new Date('2025-10-30T20:00:00'),
      eventType: 'CUSTOM',
      teacherId: emilyUser.id,
      description: 'Individual meetings with Grade 1 French Immersion families',
    },
  });

  // Create Emily's parent communication
  console.log('Creating French Immersion parent communication...');
  await prisma.classroomAnnouncement.create({
    data: {
      userId: emilyUser.id,
      title: "Bienvenue à la 1re année d'immersion française!",
      timeframe: 'Welcome Week - September 8-12, 2025',
      contentFr:
        'Chers parents, \n\nBienvenue à la première année d\'immersion française! Cette semaine, nous avons commencé notre voyage passionnant d\'apprentissage du français. Les élèves ont appris des salutations de base comme "Bonjour" et "Au revoir", ainsi que les noms de quelques objets de la classe. Ils ont répondu avec beaucoup d\'enthousiasme aux chansons et aux activités!\n\nÀ la maison, vous pouvez encourager votre enfant en pratiquant "Bonjour" et "Bonne nuit" en français. N\'hésitez pas à me contacter si vous avez des questions.\n\nMerci pour votre soutien!\nMadame Emily',
      contentEn:
        'Dear Parents,\n\nWelcome to Grade 1 French Immersion! This week we began our exciting French learning journey. Students learned basic greetings like "Bonjour" and "Au revoir," as well as names of some classroom objects. They responded with great enthusiasm to songs and activities!\n\nAt home, you can encourage your child by practicing "Bonjour" and "Bonne nuit" in French. Please don\'t hesitate to contact me if you have any questions.\n\nThank you for your support!\nMrs. Emily',
    },
  });

  // Create starter templates
  console.log('Creating starter templates...');

  // Grade 1 Math - Number Sense Unit Template
  await prisma.planTemplate.create({
    data: {
      title: 'Grade 1 Math - Number Sense Unit',
      titleFr: 'Mathématiques 1re année - Unité de sens du nombre',
      description:
        'A comprehensive 2-week unit exploring numbers 1-20 with hands-on activities and assessment opportunities.',
      descriptionFr:
        "Une unité complète de 2 semaines explorant les nombres 1-20 avec des activités pratiques et des opportunités d'évaluation.",
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Mathematics',
      gradeMin: 1,
      gradeMax: 1,
      isSystem: true,
      estimatedWeeks: 2,
      tags: ['number-sense', 'hands-on', 'primary', 'counting', 'place-value'],
      keywords: ['numbers', 'counting', 'math', 'grade-1', 'manipulatives'],
      content: {
        overview:
          'Students will develop number sense by exploring numbers 1-20 through various concrete, pictorial, and abstract activities.',
        bigIdeas:
          'Numbers have relationships and patterns. Quantities can be represented in multiple ways.',
        learningGoals: [
          'Count forward and backward from 1 to 20',
          'Recognize and represent numbers in different ways',
          'Compare quantities using more than, less than, equal to',
          'Solve simple addition and subtraction problems using concrete materials',
        ],
        essentialQuestions: [
          'How do we use numbers in our daily lives?',
          'What different ways can we show the same quantity?',
          'How do numbers help us compare amounts?',
        ],
        keyVocabulary: [
          'number',
          'count',
          'more',
          'less',
          'equal',
          'add',
          'subtract',
          'altogether',
        ],
        assessments: [
          {
            type: 'diagnostic',
            description: 'Number recognition and counting assessment',
            timing: 'Beginning of unit',
          },
          {
            type: 'formative',
            description: 'Daily number talks and manipulative explorations',
            timing: 'Throughout unit',
          },
          {
            type: 'summative',
            description: 'Number representation portfolio',
            timing: 'End of unit',
          },
        ],
        differentiationStrategies: {
          forStruggling: [
            'Use concrete manipulatives for all activities',
            'Start with smaller number ranges (1-10)',
            'Provide visual number lines and hundreds charts',
            'Use peer buddies for support',
          ],
          forAdvanced: [
            'Extend to numbers beyond 20',
            'Introduce skip counting patterns',
            'Explore number relationships and patterns',
            'Create their own number problems',
          ],
          forELL: [
            'Use visual supports and gestures',
            'Provide number vocabulary cards with pictures',
            'Use home language connections where possible',
            'Focus on mathematical language development',
          ],
        },
      },
      unitStructure: {
        phases: [
          {
            name: 'Number Recognition & Counting',
            description: 'Building foundational counting skills and number recognition',
            estimatedDays: 4,
            learningGoals: ['Count objects accurately', 'Recognize written numerals 1-20'],
          },
          {
            name: 'Number Representations',
            description: 'Exploring different ways to show quantities',
            estimatedDays: 3,
            learningGoals: ['Show numbers using manipulatives, pictures, and symbols'],
          },
          {
            name: 'Comparing Quantities',
            description: 'Understanding more than, less than, equal to',
            estimatedDays: 2,
            learningGoals: ['Compare sets of objects', 'Use comparison vocabulary'],
          },
          {
            name: 'Adding and Subtracting',
            description: 'Introduction to operations with concrete materials',
            estimatedDays: 3,
            learningGoals: ['Solve simple addition and subtraction problems using objects'],
          },
        ],
        resources: [
          { title: 'Counting Bears', type: 'manipulative', notes: '10 bears per student' },
          { title: 'Number Cards 1-20', type: 'printable', notes: 'Laminate for durability' },
          { title: 'Ten Frames', type: 'printable', notes: 'Print on cardstock' },
        ],
      },
    },
  });

  // Grade 3 Language - Poetry Unit Template
  await prisma.planTemplate.create({
    data: {
      title: 'Grade 3 Language - Poetry Unit',
      titleFr: 'Français 3e année - Unité de poésie',
      description:
        'A creative 1-week exploration of poetry forms, writing techniques, and performance.',
      descriptionFr:
        "Une exploration créative d'une semaine des formes poétiques, des techniques d'écriture et de la performance.",
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Language Arts',
      gradeMin: 3,
      gradeMax: 3,
      isSystem: true,
      estimatedWeeks: 1,
      tags: ['poetry', 'writing', 'language-arts', 'creative', 'performance'],
      keywords: ['poems', 'rhyme', 'rhythm', 'writing', 'language'],
      content: {
        overview:
          'Students will explore various forms of poetry, learn about poetic devices, and create their own poems.',
        bigIdeas:
          'Poetry is a form of expression that uses language creatively. Words can create images, emotions, and experiences.',
        learningGoals: [
          'Identify different types of poems and their characteristics',
          'Use poetic devices like rhyme, rhythm, and alliteration',
          'Write original poems using various forms',
          'Present poetry with expression and confidence',
        ],
        essentialQuestions: [
          'How do poets use words to create images and feelings?',
          'What makes a poem different from other types of writing?',
          'How can we share poetry to connect with others?',
        ],
        keyVocabulary: [
          'poem',
          'rhyme',
          'rhythm',
          'stanza',
          'verse',
          'alliteration',
          'metaphor',
          'simile',
        ],
        crossCurricularConnections:
          'Music (rhythm and beat), Visual Arts (illustrating poems), Drama (performance)',
      },
      unitStructure: {
        phases: [
          {
            name: 'Poetry Exploration',
            description: 'Reading and analyzing different types of poems',
            estimatedDays: 2,
            learningGoals: ['Identify poem characteristics', 'Recognize poetic devices'],
          },
          {
            name: 'Writing Workshop',
            description: 'Creating original poems using different forms',
            estimatedDays: 2,
            learningGoals: ['Write haiku, acrostic, and free verse poems'],
          },
          {
            name: 'Poetry Café',
            description: 'Sharing and performing student-created poems',
            estimatedDays: 1,
            learningGoals: ['Present poems with expression', 'Give constructive feedback'],
          },
        ],
      },
    },
  });

  // Math Problem Solving Lesson Template
  await prisma.planTemplate.create({
    data: {
      title: 'Math Problem Solving Lesson',
      titleFr: 'Leçon de résolution de problèmes mathématiques',
      description:
        'A 60-minute lesson focused on developing problem-solving strategies using the three-part lesson structure.',
      descriptionFr:
        'Une leçon de 60 minutes axée sur le développement de stratégies de résolution de problèmes en utilisant la structure de leçon en trois parties.',
      type: 'LESSON_PLAN',
      category: 'BY_SKILL',
      subject: 'Mathematics',
      gradeMin: 2,
      gradeMax: 6,
      isSystem: true,
      estimatedMinutes: 60,
      tags: ['problem-solving', 'mathematics', 'three-part-lesson', 'strategies', 'reasoning'],
      keywords: ['problem-solving', 'math', 'strategies', 'thinking', 'reasoning'],
      content: {
        objectives: [
          'Apply problem-solving strategies to solve multi-step problems',
          'Communicate mathematical thinking clearly',
          'Make connections between different problem-solving approaches',
        ],
        materials: [
          'Chart paper and markers',
          'Math manipulatives (blocks, counters)',
          'Problem-solving strategy posters',
          'Student journals',
        ],
        mindsOn:
          'Present a visual problem scenario and have students share what they notice and wonder. Activate prior knowledge about problem-solving strategies.',
        action:
          'Students work in pairs to solve a multi-step problem using various strategies. Teacher conferences with groups, asking probing questions to extend thinking.',
        consolidation:
          'Groups share their solutions and strategies. Class discusses different approaches and makes connections between methods.',
        grouping: 'pairs',
        accommodations: [
          'Provide manipulatives for concrete representation',
          'Offer problems with varying complexity levels',
          'Use visual supports and graphic organizers',
        ],
        assessmentType: 'formative',
        assessmentNotes:
          'Observe student strategy use, communication, and reasoning during problem solving',
      },
      lessonStructure: {
        duration: 60,
        sections: [
          {
            name: 'Minds On',
            description: 'Activate prior knowledge and introduce problem',
            timeAllocation: 10,
            activities: ['Visual problem presentation', 'Notice and wonder', 'Strategy review'],
          },
          {
            name: 'Action',
            description: 'Collaborative problem solving',
            timeAllocation: 35,
            activities: ['Partner problem solving', 'Teacher conferencing', 'Strategy application'],
          },
          {
            name: 'Consolidation',
            description: 'Share solutions and make connections',
            timeAllocation: 15,
            activities: ['Solution sharing', 'Strategy comparison', 'Reflection'],
          },
        ],
      },
    },
  });

  // Cross-Curricular Community Helpers Project Template
  await prisma.planTemplate.create({
    data: {
      title: 'Community Helpers Cross-Curricular Project',
      titleFr: 'Projet interdisciplinaire sur les aides communautaires',
      description:
        'A comprehensive unit integrating social studies, language arts, and science to explore community helpers and their roles in our society.',
      descriptionFr:
        'Une unité complète intégrant les sciences sociales, les arts du langage et les sciences pour explorer les aides communautaires et leurs rôles dans notre société.',
      type: 'UNIT_PLAN',
      category: 'BY_THEME',
      subject: 'Social Studies',
      gradeMin: 1,
      gradeMax: 3,
      isSystem: true,
      estimatedWeeks: 4,
      tags: ['community-helpers', 'cross-curricular', 'social-studies', 'language-arts', 'careers'],
      keywords: ['community', 'helpers', 'jobs', 'careers', 'safety', 'interdisciplinary'],
      content: {
        bigIdeas: [
          'Communities are supported by people with different jobs and responsibilities',
          'Community helpers keep us safe, healthy, and help our community function',
          'We can show appreciation for community helpers through our words and actions',
        ],
        essentialQuestions: [
          'Who are the people that help in our community?',
          'How do community helpers make our lives better?',
          'What skills and tools do different community helpers need?',
          'How can we thank and support community helpers?',
        ],
        learningGoals: [
          'Students will identify various community helpers and their roles',
          'Students will understand how community helpers contribute to safety and well-being',
          'Students will express appreciation for community helpers through various forms of communication',
          'Students will make connections between community helpers and their own future aspirations',
        ],
        successCriteria: [
          'I can name different community helpers and explain what they do',
          'I can describe how community helpers help keep our community safe and healthy',
          'I can write a thank you letter to a community helper',
          'I can share what job I might like to have when I grow up',
        ],
        assessmentPlan:
          'Assessment will include observation during discussions, written thank you letters, community helper presentations, and reflection on personal career interests.',
        crossCurricularConnections:
          'Language Arts: Writing thank you letters, reading about different careers; Science: Learning about tools and safety equipment; Math: Counting and sorting community helper tools; Art: Drawing community helpers and creating appreciation cards',
        culminatingTask:
          'Students will present as a community helper, dressing up and explaining their role to younger students or family members',
        keyVocabulary: [
          'community',
          'helper',
          'job',
          'career',
          'safety',
          'service',
          'volunteer',
          'responsibility',
        ],
        differentiationStrategies: {
          forStruggling: [
            'Visual supports with pictures of community helpers',
            'Partner support during activities',
            'Simplified vocabulary',
          ],
          forAdvanced: [
            'Research additional community helpers not discussed in class',
            'Create a community helper book',
            'Interview a real community helper',
          ],
          forELL: [
            'Picture cards with helper names in home language',
            'Community helper dramatic play',
            'Visual job description cards',
          ],
          forIEP: [
            'Modified writing expectations',
            'Alternative communication methods',
            'Sensory-friendly community helper dramatic play',
          ],
        },
        indigenousPerspectives:
          'Explore traditional roles in Indigenous communities such as Elders, traditional knowledge keepers, and how Indigenous communities care for one another',
        environmentalEducation:
          'Discuss community helpers who care for the environment such as park rangers, recycling workers, and conservation officers',
        technologyIntegration:
          'Use tablets to research community helpers, create digital thank you cards, and video record community helper presentations',
      },
    },
  });

  // Grade 5 Science - Simple Machines Unit Template
  await prisma.planTemplate.create({
    data: {
      title: 'Grade 5 Science - Simple Machines and Mechanical Systems',
      titleFr: 'Sciences de 5e année - Machines simples et systèmes mécaniques',
      description:
        'An inquiry-based unit exploring the six simple machines and how they work together in complex mechanical systems.',
      descriptionFr:
        "Une unité basée sur l'enquête explorant les six machines simples et comment elles fonctionnent ensemble dans des systèmes mécaniques complexes.",
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Science',
      gradeMin: 5,
      gradeMax: 5,
      isSystem: true,
      estimatedWeeks: 5,
      tags: ['simple-machines', 'science', 'grade-5', 'inquiry', 'mechanical-systems', 'physics'],
      keywords: [
        'machines',
        'lever',
        'pulley',
        'wheel',
        'axle',
        'inclined-plane',
        'wedge',
        'screw',
        'force',
        'work',
      ],
      content: {
        bigIdeas: [
          'Simple machines help us do work by changing the amount or direction of force needed',
          'Complex machines are combinations of simple machines working together',
          'Understanding how machines work helps us design solutions to everyday problems',
          'Machines have been used throughout history to make work easier and more efficient',
        ],
        essentialQuestions: [
          'How do simple machines make work easier?',
          'What are the six types of simple machines and how do they work?',
          'How are complex machines made up of simple machines?',
          'How can we design and build machines to solve real-world problems?',
        ],
        learningGoals: [
          'Students will identify and explain the function of the six simple machines',
          'Students will investigate how simple machines change force and motion',
          'Students will design and build a complex machine using multiple simple machines',
          'Students will communicate their understanding of how machines work using scientific vocabulary',
        ],
        successCriteria: [
          'I can name and describe the six simple machines (lever, pulley, wheel and axle, inclined plane, wedge, screw)',
          'I can explain how simple machines make work easier by changing force or direction',
          'I can identify simple machines in complex devices around me',
          'I can design and build a machine to solve a specific problem',
          'I can use scientific vocabulary to explain how my machine works',
        ],
        assessmentPlan:
          'Assessment will include hands-on investigations, design challenges, scientific drawings with labels, written explanations of machine functions, and peer evaluation of design solutions.',
        crossCurricularConnections:
          'Mathematics: Measuring forces, calculating mechanical advantage, geometry of machine parts; Language Arts: Technical writing, research reports on famous inventors; Social Studies: History of machines and their impact on society; Art: Technical drawings and invention sketches',
        culminatingTask:
          'Students will design, build, and present a Rube Goldberg machine that accomplishes a simple task using at least four different simple machines',
        keyVocabulary: [
          'simple machine',
          'lever',
          'fulcrum',
          'pulley',
          'wheel and axle',
          'inclined plane',
          'wedge',
          'screw',
          'force',
          'work',
          'mechanical advantage',
          'effort',
          'load',
        ],
        differentiationStrategies: {
          forStruggling: [
            'Provide pre-built examples of simple machines',
            'Use concrete manipulatives before abstract concepts',
            'Partner with stronger students for building activities',
          ],
          forAdvanced: [
            'Research advanced machines and robotics',
            'Calculate actual mechanical advantage ratios',
            'Design machines for real community problems',
          ],
          forELL: [
            'Picture vocabulary cards with machine names',
            'Hands-on exploration before verbal explanations',
            'Demonstrate rather than just describe machine functions',
          ],
          forIEP: [
            'Modified building expectations with simpler constructions',
            'Alternative ways to show understanding (drawing, demonstration)',
            'Peer support during group activities',
          ],
        },
        indigenousPerspectives:
          'Explore traditional tools and technologies used by Indigenous peoples, such as travois, traditional fishing weirs, and ingenious methods for food processing',
        environmentalEducation:
          'Discuss how machines can be designed to be more environmentally friendly, renewable energy machines like wind turbines, and the importance of sustainable design',
        technologyIntegration:
          'Use digital simulations of simple machines, create videos explaining machine functions, and research modern applications of simple machines in robotics',
      },
    },
  });

  console.log(
    '✅ Database seeded successfully with Grade 1 French Immersion content for Emily McIsaac!',
  );
  console.log('📊 Created for Emily McIsaac (emmcisaac@gmail.com):');
  console.log("  - Emily's user account at West Kent Elementary, PEI");
  console.log(
    '  - 6 French Immersion curriculum expectations (oral communication, reading, writing, math, science, social studies)',
  );
  console.log(
    '  - 3 long range plans for 2025-2026 (French Language Arts, Mathematics in French, Integrated Studies)',
  );
  console.log('  - 3 themed unit plans (Welcome to French, Numbers & Colors, My Family & Friends)');
  console.log('  - 2 bilingual ETFO lesson plans with French content');
  console.log('  - 1 daybook entry with French reflections');
  console.log(
    '  - 5 French Immersion class routines (morning circle, transitions, reading time, etc.)',
  );
  console.log(
    '  - 9 calendar events for 2025-2026 PEI school year including French cultural events',
  );
  console.log('  - 1 bilingual parent communication sample');
  console.log('  - 5 starter templates (2 math, 1 language, 1 cross-curricular, 1 science)');
  console.log('  - 1 test user account (teacher@example.com) for development');
  console.log('');
  console.log('🎯 Emily can now log in with emmcisaac@gmail.com / myhusbandisthebest');
  console.log('🇫🇷 All content is bilingual French/English for French Immersion teaching');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
